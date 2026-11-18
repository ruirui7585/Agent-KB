#!/usr/bin/env node

/**
 * Universal HTML Visual Editor Daemon (Port 4199)
 * Handles auto-save, image replacement, dynamic visual-edits.json patches,
 * same-origin /__project/<token>/ preview, and Vercel auto-deploy
 * for ANY local HTML file opened via file:// (Chrome Extension) or HTTP.
 */

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, "..");
const ASSET_DIR = path.join(SKILL_ROOT, "assets");
const HOME_DIR = path.resolve(os.homedir());

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

const MAX_BODY_BYTES = 15 * 1024 * 1024;
const APPLY_MARKER_START = "<!-- html-visual-editor apply -->";
const APPLY_MARKER_END = "<!-- /html-visual-editor apply -->";

function parseArgs(argv) {
  const args = { port: 4199, deployDelayMs: 6000 };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--port") args.port = Number(argv[++i]);
    else if (item === "--deploy-delay") args.deployDelayMs = Number(argv[++i]);
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-filename",
  });
  res.end(body);
}

function readBuffer(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > limit) {
        reject(new Error("Request payload exceeds limit"));
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function assertInsideHome(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(HOME_DIR + path.sep) && resolved !== HOME_DIR) {
    throw new Error("Refusing file access outside user home directory");
  }
  return resolved;
}

function fileUrlToLocalPath(fileUrl) {
  if (!fileUrl || !String(fileUrl).startsWith("file://")) {
    throw new Error("Invalid fileUrl");
  }
  const u = new URL(fileUrl);
  const localPath = decodeURIComponent(u.pathname);
  return assertInsideHome(localPath);
}

function findProjectRootForFile(htmlFile) {
  let curr = path.dirname(htmlFile);
  // Walk up up to 4 levels looking for .vercel/project.json or root index.html
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(curr, ".vercel", "project.json"))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr || !parent.startsWith(HOME_DIR)) break;
    if (fs.existsSync(path.join(parent, ".vercel", "project.json"))) {
      return parent;
    }
    if (
      path.basename(curr) === "assets" &&
      fs.existsSync(path.join(parent, "index.html"))
    ) {
      return parent;
    }
    curr = parent;
  }
  return path.dirname(htmlFile);
}

function encodeRootToken(root) {
  return Buffer.from(root, "utf8").toString("base64url");
}

function decodeRootToken(token) {
  const decoded = Buffer.from(String(token || ""), "base64url").toString("utf8");
  return assertInsideHome(decoded);
}

function safeResolveInRoot(root, relPath) {
  const cleanRel = decodeURIComponent(String(relPath || "/").split("?")[0]);
  const normalized = cleanRel === "/" || cleanRel === "" ? "/index.html" : cleanRel;
  const candidate = path.resolve(root, `.${normalized.startsWith("/") ? normalized : "/" + normalized}`);
  if (!candidate.startsWith(root + path.sep) && candidate !== root) {
    throw new Error("Path escapes project root");
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }
  return candidate;
}

function resolveTargetContext(parsedUrl, req, bodyObj, daemonPort) {
  const fileUrl = parsedUrl.searchParams.get("fileUrl") || (bodyObj && bodyObj.fileUrl);
  const pathParam = parsedUrl.searchParams.get("path") || (bodyObj && bodyObj.path) || "";
  const referer = String(req.headers.referer || "");

  if (pathParam.startsWith("/__project/")) {
    const rest = pathParam.slice("/__project/".length);
    const slashIdx = rest.indexOf("/");
    const token = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
    const rel = slashIdx === -1 ? "/index.html" : rest.slice(slashIdx);
    const root = decodeRootToken(token);
    const htmlFile = safeResolveInRoot(root, rel);
    const docRel = "/" + path.relative(root, htmlFile).split(path.sep).join("/");
    return {
      root,
      htmlFile,
      docRelativePath: docRel,
      projectHttpUrl: `http://127.0.0.1:${daemonPort}/__project/${token}${docRel}`,
    };
  }

  if (referer.includes("/__project/")) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.pathname.startsWith("/__project/")) {
        const rest = refUrl.pathname.slice("/__project/".length);
        const slashIdx = rest.indexOf("/");
        const token = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
        const root = decodeRootToken(token);
        const rel = pathParam || (slashIdx === -1 ? "/index.html" : rest.slice(slashIdx));
        const htmlFile = safeResolveInRoot(root, rel);
        const docRel = "/" + path.relative(root, htmlFile).split(path.sep).join("/");
        return {
          root,
          htmlFile,
          docRelativePath: docRel,
          projectHttpUrl: `http://127.0.0.1:${daemonPort}/__project/${token}${docRel}`,
        };
      }
    } catch {
      // ignore invalid referer
    }
  }

  if (fileUrl) {
    const htmlFile = fileUrlToLocalPath(fileUrl);
    const root = findProjectRootForFile(htmlFile);
    const token = encodeRootToken(root);
    const docRel = "/" + path.relative(root, htmlFile).split(path.sep).join("/");
    return {
      root,
      htmlFile,
      docRelativePath: docRel,
      projectHttpUrl: `http://127.0.0.1:${daemonPort}/__project/${token}${docRel}`,
    };
  }

  throw new Error("Missing fileUrl or project context");
}

function injectRuntimeTags(html) {
  const tags = [];
  if (!html.includes("ve-apply.js")) {
    tags.push('<script src="/__visual_editor/ve-apply.js" defer data-ve-injected="true"></script>');
  }
  if (!html.includes("/__visual_editor/visual-editor.js") && !html.includes("visual-editor.js")) {
    tags.push('<link rel="stylesheet" href="/__visual_editor/visual-editor.css" data-ve-injected="true">');
    tags.push('<script src="/__visual_editor/visual-editor.js" defer data-ve-injected="true"></script>');
  }
  if (!tags.length) return html;
  const snippet = tags.join("\n");
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${snippet}\n$&`);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${snippet}\n$&`);
  }
  return `${html}\n${snippet}\n`;
}

function stripInjectedRuntimeTags(html) {
  return String(html || "")
    .replace(/<link[^>]*data-ve-injected=["']true["'][^>]*>\s*/gi, "")
    .replace(/<script[^>]*data-ve-injected=["']true["'][^>]*><\/script>\s*/gi, "")
    .replace(/<link[^>]*href=["']\/__visual_editor\/visual-editor\.css["'][^>]*>\s*/gi, "")
    .replace(/<script[^>]*src=["']\/__visual_editor\/(?:visual-editor|ve-apply)\.js["'][^>]*><\/script>\s*/gi, "");
}

function ensureReadOnlyApplyScriptWired(root, htmlPaths) {
  const runtimeDir = path.join(root, ".visual-editor");
  const targetApplyJs = path.join(runtimeDir, "ve-apply.js");
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.copyFileSync(path.join(ASSET_DIR, "ve-apply.js"), targetApplyJs);

  const uniqueHtmlFiles = new Set();
  const rootIndex = path.join(root, "index.html");
  if (fs.existsSync(rootIndex) && fs.statSync(rootIndex).isFile()) {
    uniqueHtmlFiles.add(rootIndex);
  }
  if (Array.isArray(htmlPaths)) {
    for (const p of htmlPaths) {
      if (!p) continue;
      try {
        const resolved = safeResolveInRoot(root, p);
        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
          uniqueHtmlFiles.add(resolved);
        }
      } catch {
        // ignore invalid path
      }
    }
  }

  for (const htmlFile of uniqueHtmlFiles) {
    let raw = fs.readFileSync(htmlFile, "utf8");
    if (raw.includes("ve-apply.js") && raw.includes(APPLY_MARKER_START)) continue;
    let rel = path.relative(path.dirname(htmlFile), targetApplyJs).replaceAll(path.sep, "/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    const snippet = `${APPLY_MARKER_START}<script src="${rel}" defer></script>${APPLY_MARKER_END}`;
    const blockRegex = new RegExp(`${APPLY_MARKER_START}[\\s\\S]*?${APPLY_MARKER_END}\\s*`, "gi");
    raw = raw.replace(blockRegex, "");
    if (/<\/head>/i.test(raw)) {
      raw = raw.replace(/<\/head>/i, `${snippet}</head>`);
    } else if (/<\/body>/i.test(raw)) {
      raw = raw.replace(/<\/body>/i, `${snippet}</body>`);
    } else {
      raw = `${raw}\n${snippet}\n`;
    }
    const tmp = `${htmlFile}.ve-tmp`;
    fs.writeFileSync(tmp, raw, "utf8");
    fs.renameSync(tmp, htmlFile);
  }
}

function detectImageExtension(contentType, filename) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("png")) return ".png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("svg")) return ".svg";
  if (ct.includes("gif")) return ".gif";
  const ext = path.extname(filename || "").toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) return ext;
  return ".png";
}

function resolveCommandEnv() {
  const extraPaths = ["/usr/local/bin", "/opt/homebrew/bin", "/usr/bin", "/bin"];
  const nvmDir = path.join(HOME_DIR, ".nvm", "versions", "node");
  if (fs.existsSync(nvmDir)) {
    try {
      const versions = fs.readdirSync(nvmDir).sort();
      for (let i = versions.length - 1; i >= 0; i--) {
        extraPaths.unshift(path.join(nvmDir, versions[i], "bin"));
      }
    } catch {
      // ignore
    }
  }
  const currentPath = process.env.PATH || "";
  return Object.assign({}, process.env, {
    PATH: [...extraPaths, currentPath].filter(Boolean).join(":"),
  });
}

function inferFixedProdAlias(root) {
  const vercelProjectJson = path.join(root, ".vercel", "project.json");
  if (fs.existsSync(vercelProjectJson)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(vercelProjectJson, "utf8"));
      if (parsed && parsed.projectName) {
        return `https://${parsed.projectName}.vercel.app/`;
      }
    } catch {
      // ignore
    }
  }
  return "";
}

function extractProdUrlFromVercelOutput(stdout, stderr, fallbackAlias) {
  const combined = `${stdout || ""}\n${stderr || ""}`;
  const aliasMatch = combined.match(/Aliased:\s*(https:\/\/[^\s]+\.vercel\.app)/i);
  if (aliasMatch) return aliasMatch[1] + "/";
  if (fallbackAlias) return fallbackAlias;
  const prodMatch = combined.match(/Production:\s*(https:\/\/[^\s]+\.vercel\.app)/i);
  if (prodMatch) return prodMatch[1] + "/";
  const anyUrl = combined.match(/https:\/\/[a-z0-9-]+\.vercel\.app/i);
  return anyUrl ? anyUrl[0] + "/" : "";
}

async function waitForAliasReady(url, maxWaitMs = 20000) {
  if (!url) return false;
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      if (res.status >= 200 && res.status < 400) return true;
    } catch {
      // ignore transient network / edge propagation delay
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  return false;
}

function createDaemonServer(args) {
  const port = Number(args.port) || 4199;
  const deployDelayMs = Number(args.deployDelayMs) || 6000;
  const deployManagers = new Map();

  function getDeployManager(root) {
    if (deployManagers.has(root)) return deployManagers.get(root);
    const hasLinked = fs.existsSync(path.join(root, ".vercel", "project.json"));
    const mgr = {
      root,
      // Safety: auto-deploy is ON by default ONLY for folders already linked to Vercel;
      // unlinked scratch folders require an explicit click on "立即同步公网" once first.
      enabled: hasLinked,
      deployDelayMs,
      status: "idle",
      scheduledAt: null,
      lastDeployedAt: null,
      prodUrl: inferFixedProdAlias(root),
      lastError: null,
      pendingReDeploy: false,
      timer: null,
      child: null,
    };

    function runDeployProcess(env) {
      const child = spawn("vercel", ["deploy", "--prod", "--yes"], {
        cwd: root,
        env,
        stdio: ["ignore", "pipe", "pipe"],
      });
      mgr.child = child;
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (c) => { stdout += c.toString("utf8"); });
      child.stderr.on("data", (c) => { stderr += c.toString("utf8"); });
      child.on("error", (err) => {
        mgr.child = null;
        mgr.status = "error";
        mgr.lastError = `无法启动 vercel CLI: ${err.message}`;
      });
      child.on("close", async (code) => {
        if (code === 0) {
          const targetUrl = extractProdUrlFromVercelOutput(stdout, stderr, inferFixedProdAlias(root));
          if (targetUrl) {
            await waitForAliasReady(targetUrl, 20000);
          }
          mgr.child = null;
          mgr.status = "deployed";
          mgr.lastDeployedAt = new Date().toISOString();
          mgr.prodUrl = targetUrl;
          mgr.lastError = null;
        } else {
          mgr.child = null;
          mgr.status = "error";
          const errText = (stderr || stdout || `Exit code ${code}`).trim();
          mgr.lastError = errText.split("\n").slice(-2).join(" ");
        }
        if (mgr.pendingReDeploy && mgr.enabled) {
          mgr.pendingReDeploy = false;
          schedule();
        }
      });
    }

    function triggerNow() {
      if (mgr.timer) {
        clearTimeout(mgr.timer);
        mgr.timer = null;
      }
      if (mgr.child) {
        mgr.pendingReDeploy = true;
        return;
      }
      mgr.enabled = true;
      mgr.status = "deploying";
      mgr.scheduledAt = null;
      mgr.lastError = null;
      const env = resolveCommandEnv();
      const projectJsonPath = path.join(root, ".vercel", "project.json");
      if (!fs.existsSync(projectJsonPath)) {
        const linkChild = spawn("vercel", ["link", "--yes"], {
          cwd: root,
          env,
          stdio: ["ignore", "pipe", "pipe"],
        });
        mgr.child = linkChild;
        let linkOut = "";
        linkChild.stdout.on("data", (c) => { linkOut += c.toString("utf8"); });
        linkChild.stderr.on("data", (c) => { linkOut += c.toString("utf8"); });
        linkChild.on("error", (err) => {
          mgr.child = null;
          mgr.status = "error";
          mgr.lastError = `Vercel 自动关联失败: ${err.message}`;
        });
        linkChild.on("close", (code) => {
          if (code === 0 && fs.existsSync(projectJsonPath)) {
            runDeployProcess(env);
          } else {
            mgr.child = null;
            mgr.status = "error";
            mgr.lastError = `Vercel 关联失败: ${linkOut.trim().split("\n").slice(-2).join(" ")}`;
          }
        });
        return;
      }
      runDeployProcess(env);
    }

    function schedule() {
      if (!mgr.enabled) return;
      if (mgr.child) {
        mgr.pendingReDeploy = true;
        return;
      }
      if (mgr.timer) clearTimeout(mgr.timer);
      mgr.status = "scheduled";
      mgr.scheduledAt = new Date(Date.now() + mgr.deployDelayMs).toISOString();
      mgr.timer = setTimeout(() => {
        mgr.timer = null;
        triggerNow();
      }, mgr.deployDelayMs);
    }

    function serialize() {
      return {
        ok: true,
        enabled: mgr.enabled,
        deployDelayMs: mgr.deployDelayMs,
        status: mgr.status,
        scheduledAt: mgr.scheduledAt,
        lastDeployedAt: mgr.lastDeployedAt,
        prodUrl: mgr.prodUrl,
        lastError: mgr.lastError,
        hasVercelProject: fs.existsSync(path.join(root, ".vercel", "project.json")),
      };
    }

    const api = { mgr, triggerNow, schedule, serialize };
    deployManagers.set(root, api);
    return api;
  }

  return http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") return send(res, 204, "");
      const parsedUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);
      const pathname = parsedUrl.pathname;

      if (pathname === "/__visual_editor/ping" && req.method === "GET") {
        return send(res, 200, JSON.stringify({ ok: true, daemon: true, port }));
      }
      if (pathname === "/favicon.ico" && req.method === "GET") {
        return send(res, 204, "", "image/x-icon");
      }
      if (pathname === "/__visual_editor/visual-editor.css" && req.method === "GET") {
        return send(res, 200, fs.readFileSync(path.join(ASSET_DIR, "visual-editor.css"), "utf8"), MIME[".css"]);
      }
      if (pathname === "/__visual_editor/visual-editor.js" && req.method === "GET") {
        return send(res, 200, fs.readFileSync(path.join(ASSET_DIR, "visual-editor.js"), "utf8"), MIME[".js"]);
      }
      if (pathname === "/__visual_editor/ve-apply.js" && req.method === "GET") {
        return send(res, 200, fs.readFileSync(path.join(ASSET_DIR, "ve-apply.js"), "utf8"), MIME[".js"]);
      }

      if (pathname === "/__visual_editor/source" && req.method === "GET") {
        const ctx = resolveTargetContext(parsedUrl, req, null, port);
        if (!fs.existsSync(ctx.htmlFile) || !fs.statSync(ctx.htmlFile).isFile()) {
          return send(res, 404, JSON.stringify({ ok: false, error: "HTML file not found" }));
        }
        const rawHtml = fs.readFileSync(ctx.htmlFile, "utf8");
        const dm = getDeployManager(ctx.root);
        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            filePath: ctx.htmlFile,
            docRelativePath: ctx.docRelativePath,
            projectHttpUrl: ctx.projectHttpUrl,
            html: stripInjectedRuntimeTags(rawHtml),
            deploy: dm.serialize(),
          })
        );
      }

      if (pathname === "/__visual_editor/save" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = JSON.parse(buf.toString("utf8"));
        const ctx = resolveTargetContext(parsedUrl, req, payload, port);
        const ext = path.extname(ctx.htmlFile).toLowerCase();
        if (ext !== ".html" && ext !== ".htm") {
          return send(res, 400, JSON.stringify({ ok: false, error: "Target must be an .html or .htm file" }));
        }
        if (!fs.existsSync(ctx.htmlFile)) {
          return send(res, 404, JSON.stringify({ ok: false, error: "Target HTML file does not exist" }));
        }
        const cleanHtml = stripInjectedRuntimeTags(payload.html || "");
        if (!cleanHtml.trim() || !/<html/i.test(cleanHtml)) {
          return send(res, 400, JSON.stringify({ ok: false, error: "Refusing to save empty or invalid HTML document" }));
        }
        const tmp = `${ctx.htmlFile}.ve-tmp`;
        fs.writeFileSync(tmp, cleanHtml, "utf8");
        fs.renameSync(tmp, ctx.htmlFile);
        const dm = getDeployManager(ctx.root);
        if (dm.mgr.enabled) dm.schedule();
        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            filePath: ctx.htmlFile,
            bytes: Buffer.byteLength(cleanHtml, "utf8"),
            updatedAt: new Date().toISOString(),
            deploy: dm.serialize(),
          })
        );
      }

      if (pathname === "/__visual_editor/edits" && req.method === "GET") {
        const ctx = resolveTargetContext(parsedUrl, req, null, port);
        const editsPath = path.join(ctx.root, "visual-edits.json");
        if (!fs.existsSync(editsPath)) {
          return send(res, 200, JSON.stringify({ version: "1.0", updatedAt: null, scopes: {} }));
        }
        return send(res, 200, fs.readFileSync(editsPath, "utf8"));
      }

      if (pathname === "/__visual_editor/save-patch" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = JSON.parse(buf.toString("utf8"));
        const ctx = resolveTargetContext(parsedUrl, req, payload, port);
        const editsPath = path.join(ctx.root, "visual-edits.json");
        const edits = payload.edits && typeof payload.edits === "object" ? payload.edits : { version: "1.0", scopes: {} };
        edits.version = edits.version || "1.0";
        edits.updatedAt = new Date().toISOString();
        const tmp = `${editsPath}.ve-tmp`;
        fs.writeFileSync(tmp, JSON.stringify(edits, null, 2) + "\n", "utf8");
        fs.renameSync(tmp, editsPath);

        ensureReadOnlyApplyScriptWired(ctx.root, payload.htmlPaths || [ctx.docRelativePath]);
        const dm = getDeployManager(ctx.root);
        if (dm.mgr.enabled) dm.schedule();
        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            editsPath,
            updatedAt: edits.updatedAt,
            deploy: dm.serialize(),
          })
        );
      }

      if (pathname === "/__visual_editor/upload-image" && req.method === "POST") {
        const ctx = resolveTargetContext(parsedUrl, req, null, port);
        const buf = await readBuffer(req);
        if (!buf.length) {
          return send(res, 400, JSON.stringify({ ok: false, error: "Empty image buffer" }));
        }
        const rawFilename = decodeURIComponent(String(req.headers["x-filename"] || "image.png"));
        const ext = detectImageExtension(req.headers["content-type"], rawFilename);
        const imagesDir = path.join(ctx.root, "assets", "images");
        fs.mkdirSync(imagesDir, { recursive: true });
        const fileName = `ve-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}${ext}`;
        const fullPath = path.join(imagesDir, fileName);
        fs.writeFileSync(fullPath, buf);
        const rootRel = `assets/images/${fileName}`;
        return send(res, 200, JSON.stringify({ ok: true, src: `./${rootRel}`, rootRelativePath: rootRel, bytes: buf.length }));
      }

      if (pathname === "/__visual_editor/deploy-status" && req.method === "GET") {
        const ctx = resolveTargetContext(parsedUrl, req, null, port);
        return send(res, 200, JSON.stringify(getDeployManager(ctx.root).serialize()));
      }

      if (pathname === "/__visual_editor/deploy" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = buf.length ? JSON.parse(buf.toString("utf8")) : {};
        const ctx = resolveTargetContext(parsedUrl, req, payload, port);
        const dm = getDeployManager(ctx.root);
        dm.triggerNow();
        return send(res, 200, JSON.stringify(dm.serialize()));
      }

      if (pathname === "/__visual_editor/deploy-config" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = buf.length ? JSON.parse(buf.toString("utf8")) : {};
        const ctx = resolveTargetContext(parsedUrl, req, payload, port);
        const dm = getDeployManager(ctx.root);
        if (typeof payload.enabled === "boolean") {
          dm.mgr.enabled = payload.enabled;
          if (!dm.mgr.enabled && dm.mgr.timer) {
            clearTimeout(dm.mgr.timer);
            dm.mgr.timer = null;
            if (dm.mgr.status === "scheduled") dm.mgr.status = "idle";
          }
        }
        return send(res, 200, JSON.stringify(dm.serialize()));
      }

      // Same-origin HTTP bridge for multi-iframe projects: /__project/<base64urlRoot>/<relPath>
      if (pathname.startsWith("/__project/") && (req.method === "GET" || req.method === "HEAD")) {
        const rest = pathname.slice("/__project/".length);
        const slashIdx = rest.indexOf("/");
        const token = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
        const rel = slashIdx === -1 ? "/index.html" : rest.slice(slashIdx);
        const root = decodeRootToken(token);
        const filePath = safeResolveInRoot(root, rel);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          return send(res, 404, "Not found", "text/plain; charset=utf-8");
        }
        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".html" || ext === ".htm") {
          const raw = fs.readFileSync(filePath, "utf8");
          return send(res, 200, injectRuntimeTags(raw), MIME[".html"]);
        }
        return send(res, 200, fs.readFileSync(filePath), MIME[ext] || "application/octet-stream");
      }

      return send(res, 404, JSON.stringify({ ok: false, error: "Not found" }));
    } catch (error) {
      return send(res, 500, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  });
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log("Usage: node universal-edit-daemon.mjs --port 4199 [--deploy-delay 6000]");
    return;
  }
  const server = createDaemonServer(args);
  server.listen(args.port, "127.0.0.1", () => {
    console.log(`UNIVERSAL_EDIT_DAEMON_OK http://127.0.0.1:${args.port}/`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { createDaemonServer };
