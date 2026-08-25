#!/usr/bin/env node

import http from "node:http";
import crypto from "node:crypto";
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

const UPLOAD_DIRECTORY = path.join(".prototype-annotations", "uploads");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_REQUEST_BYTES = MAX_UPLOAD_BYTES + 512 * 1024;
const IMAGE_UPLOAD_TYPES = new Map([
  ["image/png", { extension: ".png", signature: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
  ["image/jpeg", { extension: ".jpg", signature: (buffer) => buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) }],
  ["image/webp", { extension: ".webp", signature: (buffer) => buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" }],
]);

const CATEGORIES = new Set(["background", "scenario", "page-flow", "state", "permission", "edge", "acceptance"]);
const STATUSES = new Set(["active", "needs-review", "orphaned", "deprecated"]);
const ANNOTATION_FIELDS = new Set(["id", "pageId", "page", "category", "title", "description", "rules", "target", "images", "context", "status", "createdAt", "updatedAt"]);
const TARGET_FIELDS = new Set(["annotationId", "selector"]);
const CONTEXT_FIELDS = new Set(["ruleId", "contractSection", "triggerCondition", "judgmentLogic", "expectedOutcome", "dataSource", "valueConstraint", "permissionCondition", "exceptionBehavior", "acceptanceCriteria", "ruleVersion", "decisionRef", "userRole", "userLevel", "userState", "conversationStatus", "pageState", "componentState", "route", "container", "state", "visibleWhen", "modal", "tab", "device", "viewport"]);

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
    "  POST /__prototype_annotations/upload",
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

function readBuffer(req, limit = MAX_UPLOAD_REQUEST_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    req.on("data", (chunk) => {
      if (settled) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > limit) {
        settled = true;
        reject(new Error("Upload request too large"));
        return;
      }
      chunks.push(buffer);
    });
    req.on("end", () => {
      if (!settled) resolve(Buffer.concat(chunks));
    });
    req.on("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
  });
}

function isSafeRelativeImagePath(value) {
  if (typeof value !== "string") return false;
  const src = String(value == null ? "" : value).trim();
  if (src !== value || !src || src.length > 2048 || /^[\\/]/.test(src)) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || /^\/\//.test(src)) return false;
  if (/[\\?#%\s]/.test(src)) return false;
  return !/(^|\/)\.\.(\/|$)/.test(src);
}

function validateImages(images, prefix) {
  if (images == null) return null;
  if (!Array.isArray(images)) return `${prefix}.images must be an array`;
  for (const [index, image] of images.entries()) {
    const imagePrefix = `${prefix}.images[${index}]`;
    if (!image || typeof image !== "object" || Array.isArray(image)) return `${imagePrefix} must be an object`;
    const unknownField = Object.keys(image).find((field) => !["src", "alt", "caption"].includes(field));
    if (unknownField) return `${imagePrefix}.${unknownField} is not allowed`;
    if (!isSafeRelativeImagePath(image.src)) return `${imagePrefix}.src must be a project-relative path`;
    if (typeof image.alt !== "string" || !image.alt.trim()) return `${imagePrefix}.alt must be a non-empty string`;
    if (image.caption != null && (typeof image.caption !== "string" || !image.caption.trim())) return `${imagePrefix}.caption must be a non-empty string when provided`;
  }
  return null;
}

function parseMultipartBody(body, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!match) throw new Error("Multipart upload requires a boundary");
  const boundary = Buffer.from(`--${match[1] || match[2]}`);
  const parts = [];
  let cursor = body.indexOf(boundary);
  while (cursor !== -1) {
    cursor += boundary.length;
    if (body.subarray(cursor, cursor + 2).equals(Buffer.from("--"))) break;
    if (body.subarray(cursor, cursor + 2).equals(Buffer.from("\r\n"))) cursor += 2;
    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), cursor);
    if (headerEnd === -1) break;
    const headers = body.subarray(cursor, headerEnd).toString("utf8");
    const nextBoundary = body.indexOf(boundary, headerEnd + 4);
    if (nextBoundary === -1) break;
    const contentEnd = nextBoundary >= 2 && body.subarray(nextBoundary - 2, nextBoundary).equals(Buffer.from("\r\n")) ? nextBoundary - 2 : nextBoundary;
    const disposition = /content-disposition:\s*form-data;\s*([^\r\n]+)/i.exec(headers)?.[1] || "";
    const name = /(?:^|;)\s*name="([^"]*)"/i.exec(disposition)?.[1] || "";
    const filename = /(?:^|;)\s*filename="([^"]*)"/i.exec(disposition)?.[1] || "";
    const partType = /(?:^|\r\n)content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim().toLowerCase() || "";
    parts.push({ name, filename, contentType: partType, data: body.subarray(headerEnd + 4, contentEnd) });
    cursor = nextBoundary;
  }
  return parts;
}

function safeUploadName(extension) {
  return `${Date.now().toString(36)}-${crypto.randomBytes(12).toString("hex")}${extension}`;
}

function saveUploadedImages(root, parts) {
  const files = parts.filter((part) => part.filename || IMAGE_UPLOAD_TYPES.has(part.contentType));
  if (!files.length) throw new Error("No image file was provided");
  const prepared = files.map((file) => {
    if (file.data.length === 0) throw new Error("Image file is empty");
    if (file.data.length > MAX_UPLOAD_BYTES) throw new Error("Image file exceeds 5 MB limit");
    const type = IMAGE_UPLOAD_TYPES.get(file.contentType);
    if (!type) throw new Error("Only PNG, JPEG, and WebP images are allowed");
    if (!type.signature(file.data)) throw new Error(`Image bytes do not match ${file.contentType}`);
    return { file, type };
  });
  const uploadDir = path.resolve(root, UPLOAD_DIRECTORY);
  fs.mkdirSync(uploadDir, { recursive: true });
  return prepared.map(({ file, type }) => {
    const filePath = path.join(uploadDir, safeUploadName(type.extension));
    fs.writeFileSync(filePath, file.data, { flag: "wx" });
    const src = path.relative(root, filePath).split(path.sep).join("/");
    return { src, mimeType: file.contentType, size: file.data.length };
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

function validateDocument(parsed) {
  if (!parsed || !Array.isArray(parsed.annotations)) return "Body must include annotations array";
  if (!String(parsed.version || "").trim()) return "version is required";
  const seen = new Set();
  for (const [index, annotation] of parsed.annotations.entries()) {
    const prefix = `annotations[${index}]`;
    for (const field of ["id", "pageId", "page", "category", "title", "description", "rules", "target", "context", "status", "createdAt", "updatedAt"]) {
      if (annotation?.[field] == null) return `${prefix}.${field} is required`;
    }
    const unknownAnnotationField = Object.keys(annotation).find((field) => !ANNOTATION_FIELDS.has(field));
    if (unknownAnnotationField) return `${prefix}.${unknownAnnotationField} is not allowed`;
    if (seen.has(annotation.id)) return `duplicate annotation id: ${annotation.id}`;
    seen.add(annotation.id);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(annotation.pageId)) return `${prefix}.pageId must use kebab-case`;
    if (!CATEGORIES.has(annotation.category)) return `${prefix}.category is invalid`;
    if (!STATUSES.has(annotation.status)) return `${prefix}.status is invalid`;
    if (!annotation.target || typeof annotation.target !== "object" || Array.isArray(annotation.target)) return `${prefix}.target must be an object`;
    if (!annotation.context || typeof annotation.context !== "object" || Array.isArray(annotation.context)) return `${prefix}.context must be an object`;
    if (!annotation.target.annotationId && !annotation.target.selector) return `${prefix}.target must include annotationId or selector`;
    const unknownTargetField = Object.keys(annotation.target).find((field) => !TARGET_FIELDS.has(field));
    if (unknownTargetField) return `${prefix}.target.${unknownTargetField} is not allowed`;
    const unknownContextField = Object.keys(annotation.context).find((field) => !CONTEXT_FIELDS.has(field));
    if (unknownContextField) return `${prefix}.context.${unknownContextField} is not allowed`;
    const imageValidationError = validateImages(annotation.images, prefix);
    if (imageValidationError) return imageValidationError;
    if (!Array.isArray(annotation.rules) || annotation.rules.some((rule) => typeof rule !== "string" || !rule.trim())) return `${prefix}.rules must contain non-empty strings`;
    for (const field of ["ruleId", "triggerCondition", "expectedOutcome", "acceptanceCriteria"]) {
      if (!String(annotation.context?.[field] || "").trim()) return `${prefix}.context.${field} is required`;
    }
  }
  return null;
}

function createServer(args) {
  const root = path.resolve(args.root);
  const annotationsPath = path.resolve(root, args.annotations);
  if (!annotationsPath.startsWith(root + path.sep) && annotationsPath !== root) {
    throw new Error("Annotations path escapes preview root");
  }
  ensureAnnotationsFile(annotationsPath);

  return http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") return send(res, 204, "");
      const requestPath = String(req.url || "/").split("?", 1)[0];

      if (requestPath === "/__prototype_annotations" && req.method === "GET") {
        return send(res, 200, fs.readFileSync(annotationsPath, "utf8"));
      }

      if (requestPath === "/__prototype_annotations/upload" && req.method === "POST") {
        try {
          const contentTypeHeader = String(req.headers["content-type"] || "");
          const body = await readBuffer(req);
          const contentType = contentTypeHeader.split(";", 1)[0].trim().toLowerCase();
          let parts;
          if (contentType === "multipart/form-data") {
            parts = parseMultipartBody(body, contentTypeHeader);
          } else if (IMAGE_UPLOAD_TYPES.has(contentType)) {
            parts = [{ name: "file", filename: String(req.headers["x-filename"] || "upload"), contentType, data: body }];
          } else {
            return send(res, 415, JSON.stringify({ ok: false, error: "Upload must use multipart/form-data or an allowed image MIME type" }));
          }
          const records = saveUploadedImages(root, parts);
          return send(res, 200, JSON.stringify({ ok: true, ...records[0], files: records, count: records.length }));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const status = /too large|5 MB/i.test(message) ? 413 : 400;
          return send(res, status, JSON.stringify({ ok: false, error: message }));
        }
      }

      if (requestPath === "/__prototype_annotations/save" && req.method === "POST") {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw);
        const validationError = validateDocument(parsed);
        if (validationError) return send(res, 400, JSON.stringify({ ok: false, error: validationError }));
        parsed.updatedAt = new Date().toISOString();
        const tempPath = `${annotationsPath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(parsed, null, 2) + "\n");
        fs.renameSync(tempPath, annotationsPath);
        return send(res, 200, JSON.stringify({ ok: true, annotationsPath, count: parsed.annotations.length, updatedAt: parsed.updatedAt }));
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
