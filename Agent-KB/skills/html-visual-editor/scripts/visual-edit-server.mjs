#!/usr/bin/env node

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
  const args = {
    root: process.cwd(),
    port: 4180,
    annotations: "annotations.json",
    autoDeploy: true,
    deployDelayMs: 6000,
    prodAlias: "",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--root") args.root = argv[++i];
    else if (item === "--port") args.port = Number(argv[++i]);
    else if (item === "--annotations") args.annotations = argv[++i];
    else if (item === "--no-auto-deploy") args.autoDeploy = false;
    else if (item === "--deploy-delay") args.deployDelayMs = Number(argv[++i]);
    else if (item === "--prod-alias") args.prodAlias = String(argv[++i] || "");
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

function safeResolveHtml(root, reqPath) {
  const decoded = decodeURIComponent(String(reqPath || "/").split("?")[0]);
  const normalized = decoded === "/" || decoded === "" ? "/index.html" : decoded;
  const candidate = path.resolve(root, `.${normalized.startsWith("/") ? normalized : "/" + normalized}`);
  if (!candidate.startsWith(root + path.sep) && candidate !== root) {
    throw new Error("Path escapes project root");
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }
  return candidate;
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
        const resolved = safeResolveHtml(root, p);
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
  const home = os.homedir();
  const extraPaths = ["/usr/local/bin", "/opt/homebrew/bin", "/usr/bin", "/bin"];
  const nvmDir = path.join(home, ".nvm", "versions", "node");
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

function inferFixedProdAlias(root, explicitAlias) {
  if (explicitAlias) {
    return explicitAlias.startsWith("http") ? explicitAlias : `https://${explicitAlias}`;
  }
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
      // ignore transient propagation delay
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  return false;
}

function createServer(args) {
  const root = path.resolve(args.root);
  const annotationsPath = path.resolve(root, args.annotations);
  const editsPath = path.join(root, "visual-edits.json");

  // Vercel Auto-Deploy State & Queue
  const deployState = {
    enabled: Boolean(args.autoDeploy),
    deployDelayMs: Number(args.deployDelayMs) || 6000,
    status: "idle", // idle | scheduled | deploying | deployed | error
    scheduledAt: null,
    lastDeployedAt: null,
    prodUrl: inferFixedProdAlias(root, args.prodAlias),
    lastError: null,
    pendingReDeploy: false,
  };

  let deployTimer = null;
  let activeDeployChild = null;

  function runDeployProcess(env) {
    const child = spawn("vercel", ["deploy", "--prod", "--yes"], {
      cwd: root,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeDeployChild = child;

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err) => {
      activeDeployChild = null;
      deployState.status = "error";
      deployState.lastError = `无法启动 vercel CLI: ${err.message}`;
    });

    child.on("close", async (code) => {
      if (code === 0) {
        const targetUrl = extractProdUrlFromVercelOutput(
          stdout,
          stderr,
          inferFixedProdAlias(root, args.prodAlias)
        );
        if (targetUrl) {
          await waitForAliasReady(targetUrl, 20000);
        }
        activeDeployChild = null;
        deployState.status = "deployed";
        deployState.lastDeployedAt = new Date().toISOString();
        deployState.prodUrl = targetUrl;
        deployState.lastError = null;
      } else {
        activeDeployChild = null;
        deployState.status = "error";
        const errText = (stderr || stdout || `Exit code ${code}`).trim();
        deployState.lastError = errText.split("\n").slice(-2).join(" ");
      }

      if (deployState.pendingReDeploy && deployState.enabled) {
        deployState.pendingReDeploy = false;
        scheduleVercelDeploy("queued-followup");
      }
    });
  }

  function triggerVercelDeployNow(reason = "auto") {
    if (deployTimer) {
      clearTimeout(deployTimer);
      deployTimer = null;
    }

    if (activeDeployChild) {
      deployState.pendingReDeploy = true;
      return;
    }

    deployState.status = "deploying";
    deployState.scheduledAt = null;
    deployState.lastError = null;

    const env = resolveCommandEnv();
    const projectJsonPath = path.join(root, ".vercel", "project.json");
    if (!fs.existsSync(projectJsonPath)) {
      const linkChild = spawn("vercel", ["link", "--yes"], {
        cwd: root,
        env,
        stdio: ["ignore", "pipe", "pipe"],
      });
      activeDeployChild = linkChild;
      let linkErr = "";
      linkChild.stderr.on("data", (c) => { linkErr += c.toString("utf8"); });
      linkChild.stdout.on("data", (c) => { linkErr += c.toString("utf8"); });
      linkChild.on("error", (err) => {
        activeDeployChild = null;
        deployState.status = "error";
        deployState.lastError = `Vercel 自动关联失败: ${err.message}`;
      });
      linkChild.on("close", (code) => {
        if (code === 0 && fs.existsSync(projectJsonPath)) {
          runDeployProcess(env);
        } else {
          activeDeployChild = null;
          deployState.status = "error";
          deployState.lastError = `Vercel 关联失败: ${linkErr.trim().split("\n").slice(-2).join(" ")}`;
        }
      });
      return;
    }

    runDeployProcess(env);
  }

  function scheduleVercelDeploy(reason = "save") {
    if (!deployState.enabled) return;
    if (activeDeployChild) {
      deployState.pendingReDeploy = true;
      return;
    }
    if (deployTimer) clearTimeout(deployTimer);
    deployState.status = "scheduled";
    deployState.scheduledAt = new Date(Date.now() + deployState.deployDelayMs).toISOString();
    deployTimer = setTimeout(() => {
      deployTimer = null;
      triggerVercelDeployNow(reason);
    }, deployState.deployDelayMs);
  }

  function serializeDeployState() {
    return {
      ok: true,
      enabled: deployState.enabled,
      deployDelayMs: deployState.deployDelayMs,
      status: deployState.status,
      scheduledAt: deployState.scheduledAt,
      lastDeployedAt: deployState.lastDeployedAt,
      prodUrl: deployState.prodUrl,
      lastError: deployState.lastError,
      hasVercelProject: fs.existsSync(path.join(root, ".vercel", "project.json")),
    };
  }

  return http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") return send(res, 204, "");
      const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = parsedUrl.pathname;

      // 1. Visual Editor Assets & Default Favicon Fallback
      if (pathname === "/favicon.ico" && req.method === "GET" && !fs.existsSync(path.join(root, "favicon.ico"))) {
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

      // 2. Get Raw Pristine HTML Source
      if (pathname === "/__visual_editor/source" && req.method === "GET") {
        const targetParam = parsedUrl.searchParams.get("path") || "/index.html";
        const htmlFile = safeResolveHtml(root, targetParam);
        if (!fs.existsSync(htmlFile) || !fs.statSync(htmlFile).isFile()) {
          return send(res, 404, JSON.stringify({ ok: false, error: "HTML file not found" }));
        }
        const rawHtml = fs.readFileSync(htmlFile, "utf8");
        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            path: targetParam,
            filePath: htmlFile,
            html: stripInjectedRuntimeTags(rawHtml),
            deploy: serializeDeployState(),
          })
        );
      }

      // 3. Auto-Save Updated Static HTML Back to Disk (+ Auto-Schedule Vercel Prod Deploy)
      if (pathname === "/__visual_editor/save" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = JSON.parse(buf.toString("utf8"));
        const targetParam = payload.path || "/index.html";
        const htmlFile = safeResolveHtml(root, targetParam);
        if (!fs.existsSync(htmlFile)) {
          return send(res, 404, JSON.stringify({ ok: false, error: "Target HTML file does not exist" }));
        }
        const cleanHtml = stripInjectedRuntimeTags(payload.html || "");
        if (!cleanHtml.trim() || !/<html/i.test(cleanHtml)) {
          return send(res, 400, JSON.stringify({ ok: false, error: "Refusing to save empty or invalid HTML document" }));
        }
        const tempFile = `${htmlFile}.ve-tmp`;
        fs.writeFileSync(tempFile, cleanHtml, "utf8");
        fs.renameSync(tempFile, htmlFile);
        const updatedAt = new Date().toISOString();

        if (deployState.enabled) {
          scheduleVercelDeploy(payload.reason || "auto-save");
        }

        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            filePath: htmlFile,
            bytes: Buffer.byteLength(cleanHtml, "utf8"),
            reason: payload.reason || "auto",
            updatedAt,
            deploy: serializeDeployState(),
          })
        );
      }

      // 4. Visual Edits JSON (for JS-rendered & Multi-Iframe Prototypes)
      if (pathname === "/__visual_editor/edits" && req.method === "GET") {
        if (!fs.existsSync(editsPath)) {
          return send(res, 200, JSON.stringify({ version: "1.0", updatedAt: null, scopes: {} }));
        }
        return send(res, 200, fs.readFileSync(editsPath, "utf8"));
      }

      if (pathname === "/__visual_editor/save-patch" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = JSON.parse(buf.toString("utf8"));
        const edits = payload.edits && typeof payload.edits === "object" ? payload.edits : { version: "1.0", scopes: {} };
        edits.version = edits.version || "1.0";
        edits.updatedAt = new Date().toISOString();
        const tmp = `${editsPath}.ve-tmp`;
        fs.writeFileSync(tmp, JSON.stringify(edits, null, 2) + "\n", "utf8");
        fs.renameSync(tmp, editsPath);

        ensureReadOnlyApplyScriptWired(root, payload.htmlPaths || []);

        if (deployState.enabled) {
          scheduleVercelDeploy(payload.reason || "auto-patch");
        }

        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            editsPath,
            updatedAt: edits.updatedAt,
            deploy: serializeDeployState(),
          })
        );
      }

      // 5. Vercel Auto-Deploy Endpoints
      if (pathname === "/__visual_editor/deploy-status" && req.method === "GET") {
        return send(res, 200, JSON.stringify(serializeDeployState()));
      }
      if (pathname === "/__visual_editor/deploy" && req.method === "POST") {
        triggerVercelDeployNow("manual-button");
        return send(res, 200, JSON.stringify(serializeDeployState()));
      }
      if (pathname === "/__visual_editor/deploy-config" && req.method === "POST") {
        const buf = await readBuffer(req);
        const payload = JSON.parse(buf.toString("utf8") || "{}");
        if (typeof payload.enabled === "boolean") {
          deployState.enabled = payload.enabled;
          if (!deployState.enabled && deployTimer) {
            clearTimeout(deployTimer);
            deployTimer = null;
            if (deployState.status === "scheduled") deployState.status = "idle";
          }
        }
        return send(res, 200, JSON.stringify(serializeDeployState()));
      }

      // 6. Image Upload -> Save to project's assets/images/ & return relative path
      if (pathname === "/__visual_editor/upload-image" && req.method === "POST") {
        const buf = await readBuffer(req);
        if (!buf.length) {
          return send(res, 400, JSON.stringify({ ok: false, error: "Empty image buffer" }));
        }
        const rawFilename = decodeURIComponent(String(req.headers["x-filename"] || "image.png"));
        const ext = detectImageExtension(req.headers["content-type"], rawFilename);
        const imagesDir = path.join(root, "assets", "images");
        fs.mkdirSync(imagesDir, { recursive: true });
        const fileName = `ve-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}${ext}`;
        const fullPath = path.join(imagesDir, fileName);
        fs.writeFileSync(fullPath, buf);
        const rootRel = `assets/images/${fileName}`;
        return send(res, 200, JSON.stringify({ ok: true, src: `./${rootRel}`, rootRelativePath: rootRel, bytes: buf.length }));
      }

      // 7. Compatible Prototype Annotations Persistence Endpoints
      if ((pathname === "/api/annotations" || pathname === "/__prototype_annotations") && req.method === "GET") {
        if (!fs.existsSync(annotationsPath)) {
          return send(res, 200, JSON.stringify({ version: "1.0", updatedAt: new Date().toISOString(), annotations: [] }));
        }
        return send(res, 200, fs.readFileSync(annotationsPath, "utf8"));
      }
      if ((pathname === "/api/annotations" || pathname === "/__prototype_annotations/save") && req.method === "POST") {
        const buf = await readBuffer(req);
        const parsed = JSON.parse(buf.toString("utf8"));
        const tmp = `${annotationsPath}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2) + "\n", "utf8");
        fs.renameSync(tmp, annotationsPath);
        if (deployState.enabled) {
          scheduleVercelDeploy("annotations-save");
        }
        return send(res, 200, JSON.stringify({ ok: true, annotationsPath, updatedAt: new Date().toISOString() }));
      }

      // 8. Serve Static Project Files (Auto-injecting Visual Editor into .html responses)
      if (req.method !== "GET" && req.method !== "HEAD") {
        return send(res, 405, "Method Not Allowed", "text/plain; charset=utf-8");
      }

      const filePath = safeResolveHtml(root, pathname);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return send(res, 404, "Not found", "text/plain; charset=utf-8");
      }
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".html" || ext === ".htm") {
        const raw = fs.readFileSync(filePath, "utf8");
        return send(res, 200, injectRuntimeTags(raw), MIME[".html"]);
      }
      return send(res, 200, fs.readFileSync(filePath), MIME[ext] || "application/octet-stream");
    } catch (error) {
      return send(res, 500, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  });
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log("Usage: node visual-edit-server.mjs --root <project-dir> --port 4180 [--no-auto-deploy] [--deploy-delay 6000]");
    return;
  }
  const server = createServer(args);
  server.listen(args.port, "127.0.0.1", () => {
    console.log(`VISUAL_EDIT_SERVER_OK http://127.0.0.1:${args.port}/`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { createServer };
