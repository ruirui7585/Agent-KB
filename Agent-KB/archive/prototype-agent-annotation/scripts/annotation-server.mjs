#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function parseArgs(argv) {
  const args = { root: process.cwd(), port: 4175, annotations: "annotations.json" };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--root") args.root = argv[++i];
    else if (item === "--port") args.port = Number(argv[++i]);
    else if (item === "--annotations") args.annotations = argv[++i];
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node annotation-server.mjs --root <project-or-preview-root> --port 4175 --annotations annotations.json",
    "",
    "Serves static prototype files and exposes:",
    "  GET  /__prototype_annotations",
    "  POST /__prototype_annotations/save",
  ].join("\n");
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) reject(new Error("Request body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function safeResolve(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const normalized = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.resolve(root, `.${normalized}`);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Path escapes root");
  }
  return resolved;
}

function ensureAnnotationsFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ version: "1.0", updatedAt: new Date().toISOString(), annotations: [] }, null, 2) + "\n");
  }
}

function createServer(args) {
  const root = path.resolve(args.root);
  const annotationsPath = path.resolve(root, args.annotations);
  ensureAnnotationsFile(annotationsPath);

  return http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") return send(res, 204, "");

      if (req.url === "/__prototype_annotations" && req.method === "GET") {
        return send(res, 200, fs.readFileSync(annotationsPath, "utf8"));
      }

      if (req.url === "/__prototype_annotations/save" && req.method === "POST") {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.annotations)) {
          return send(res, 400, JSON.stringify({ ok: false, error: "Body must include annotations array" }));
        }
        parsed.updatedAt = new Date().toISOString();
        fs.writeFileSync(annotationsPath, JSON.stringify(parsed, null, 2) + "\n");
        return send(res, 200, JSON.stringify({ ok: true, annotationsPath, count: parsed.annotations.length }));
      }

      if (req.method !== "GET") return send(res, 405, "Method not allowed", "text/plain; charset=utf-8");

      const filePath = safeResolve(root, req.url || "/");
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return send(res, 404, "Not found", "text/plain; charset=utf-8");
      }
      const ext = path.extname(filePath).toLowerCase();
      return send(res, 200, fs.readFileSync(filePath), MIME[ext] || "application/octet-stream");
    } catch (error) {
      return send(res, 500, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  });
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }
  const server = createServer(args);
  server.listen(args.port, "127.0.0.1", () => {
    console.log(`ANNOTATION_SERVER_OK http://127.0.0.1:${args.port}/`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export { createServer };
