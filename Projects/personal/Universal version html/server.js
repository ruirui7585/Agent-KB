import http from "node:http";
import fsSync, { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";
import formidable from "formidable";

const rootDir = fsSync.realpathSync(path.dirname(fileURLToPath(import.meta.url)));
const importedDir = path.join(rootDir, "imported-prototypes");
const port = Number(process.env.PORT || 5173);
const MAX_ZIP_ENTRIES = 500;
const MAX_ZIP_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;
const ALLOWED_PUBLIC_FILES = new Set([
  "index.html",
  "styles.css",
  "app.js",
  "ai-helper.js",
  "demo-data.js",
  "exporter.js",
  "prototype-bridge.js",
  "storage.js"
]);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".otf", "font/otf"],
  [".eot", "application/vnd.ms-fontobject"],
  [".map", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"]
]);

function createServerInstance() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
      if (req.method === "POST" && url.pathname === "/api/prototype-projects") {
        try {
          await handlePrototypeProjectImport(req, res);
        } catch (error) {
          sendJson(res, 400, { error: error.message || "Import failed" });
        }
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/health") {
        sendJson(res, 200, { ok: true });
        return;
      }
      if (req.method !== "GET" && req.method !== "HEAD") {
        sendText(res, 405, "Method Not Allowed");
        return;
      }
      await serveStatic(url.pathname, res, req.method === "HEAD");
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Internal Server Error" });
    }
  });
}

async function handlePrototypeProjectImport(req, res) {
  const { fields, files } = await parseMultipart(req);
  const importType = firstField(fields.type) || "html";
  const prototypeId = createPrototypeId();
  const targetDir = path.join(importedDir, prototypeId);
  await fs.mkdir(targetDir, { recursive: true });

  try {
    let writtenFiles = [];
    if (importType === "zip") {
      const zipFile = firstFile(files.zip) || firstFile(files.files);
      if (!zipFile) throw new Error("Missing ZIP file");
      writtenFiles = await importZipFile(zipFile.filepath, targetDir);
    } else {
      const uploadedFiles = asFileArray(files.files);
      if (!uploadedFiles.length) throw new Error("Missing prototype files");
      const relativePaths = parseRelativePaths(firstField(fields.relativePaths), uploadedFiles);
      writtenFiles = await importUploadedFiles(uploadedFiles, relativePaths, targetDir);
    }

    if (!writtenFiles.length) throw new Error("No files imported");
    assertStaticPrototype(writtenFiles);
    const htmlFiles = writtenFiles.filter((file) => file.toLowerCase().endsWith(".html") || file.toLowerCase().endsWith(".htm"));
    if (!htmlFiles.length) throw new Error("No HTML files found in imported prototype");
    const entryFile = chooseEntryFile(htmlFiles, importType);
    const prototypeUrl = entryFile ? `/prototypes/${prototypeId}/${entryFile.split("/").map(encodeURIComponent).join("/")}` : "";
    sendJson(res, 200, {
      prototypeId,
      entryFile,
      prototypeUrl,
      fileCount: writtenFiles.length,
      htmlFiles,
      requiresEntry: !entryFile
    });
  } catch (error) {
    await fs.rm(targetDir, { recursive: true, force: true });
    throw error;
  }
}

export function isAllowedPublicRelativePath(relativePath) {
  const segments = String(relativePath || "").split("/").filter(Boolean);
  if (!segments.length || segments.some((segment) => segment === ".." || segment.startsWith("."))) {
    return false;
  }
  if (segments.length === 1) return ALLOWED_PUBLIC_FILES.has(segments[0]);
  return segments[0] === "runtime" && segments[1] === "prototypes";
}

async function serveStatic(requestPath, res, headOnly) {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(requestPath.split("?")[0]);
  } catch {
    sendText(res, 400, "Bad Request");
    return;
  }
  if (cleanPath.startsWith("/prototypes/")) {
    const prototypePath = cleanPath.replace(/^\/prototypes\//, "");
    const segments = prototypePath.split("/").filter(Boolean);
    if (segments.some((segment) => segment === ".." || segment.startsWith("."))) {
      sendText(res, 403, "Forbidden");
      return;
    }
    const filePath = path.resolve(importedDir, prototypePath);
    if (!isPathInside(filePath, importedDir)) {
      sendText(res, 403, "Forbidden");
      return;
    }
    try {
      const stat = await fs.stat(filePath);
      const target = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
      const realTarget = await fs.realpath(target);
      const realImportedDir = await fs.realpath(importedDir);
      if (!isPathInside(realTarget, realImportedDir)) {
        sendText(res, 403, "Forbidden");
        return;
      }
      await sendFile(realTarget, res, headOnly);
    } catch {
      sendText(res, 404, "Not Found");
    }
    return;
  }
  const relativePath = cleanPath === "/" ? "index.html" : path.posix.normalize(cleanPath).replace(/^\/+/, "");
  if (!isAllowedPublicRelativePath(relativePath)) {
    sendText(res, 404, "Not Found");
    return;
  }
  const filePath = path.resolve(rootDir, relativePath);
  if (!isPathInside(filePath, rootDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  try {
    const realFilePath = await fs.realpath(filePath);
    const stat = await fs.stat(realFilePath);
    if (!isPathInside(realFilePath, rootDir) || stat.isDirectory()) {
      sendText(res, 404, "Not Found");
      return;
    }
    await sendFile(realFilePath, res, headOnly);
  } catch {
    sendText(res, 404, "Not Found");
  }
}

async function sendFile(filePath, res, headOnly) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(ext) || "application/octet-stream";
  const data = headOnly ? null : await fs.readFile(filePath);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": isPathInside(filePath, importedDir) ? "no-cache" : "no-store"
  });
  res.end(data);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function parseMultipart(req) {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 200 * 1024 * 1024,
    maxTotalFileSize: 400 * 1024 * 1024
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });
}

async function importUploadedFiles(uploadedFiles, relativePaths, targetDir) {
  const strippedPaths = stripCommonRoot(relativePaths.map((item, index) => item || uploadedFiles[index].originalFilename || `file-${index}`));
  const writtenFiles = [];
  for (let index = 0; index < uploadedFiles.length; index += 1) {
    const safeRelativePath = sanitizeRelativePath(strippedPaths[index]);
    await copyImportedFile(uploadedFiles[index].filepath, targetDir, safeRelativePath);
    writtenFiles.push(safeRelativePath);
  }
  return writtenFiles;
}

export async function importZipFile(zipPath, targetDir) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new Error(`ZIP contains too many files (${entries.length} > ${MAX_ZIP_ENTRIES})`);
  }
  const strippedNames = stripCommonRoot(entries.map((entry) => entry.entryName));
  const writtenFiles = [];
  let totalUncompressedBytes = 0;
  for (let index = 0; index < entries.length; index += 1) {
    const declaredSize = Number(entries[index].header?.size || 0);
    if (declaredSize < 0 || totalUncompressedBytes + declaredSize > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw new Error("ZIP uncompressed size exceeds limit");
    }
    const safeRelativePath = sanitizeRelativePath(strippedNames[index]);
    const destPath = resolveInside(targetDir, safeRelativePath);
    const data = entries[index].getData();
    totalUncompressedBytes += data.length;
    if (totalUncompressedBytes > MAX_ZIP_UNCOMPRESSED_BYTES) {
      throw new Error("ZIP uncompressed size exceeds limit");
    }
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, data);
    writtenFiles.push(safeRelativePath);
  }
  return writtenFiles;
}

async function copyImportedFile(sourcePath, targetDir, safeRelativePath) {
  const destPath = resolveInside(targetDir, safeRelativePath);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(sourcePath, destPath);
}

function sanitizeRelativePath(relativePath) {
  const rawPath = String(relativePath || "").replace(/\\/g, "/");
  if (!rawPath || rawPath.startsWith("/") || path.posix.isAbsolute(rawPath) || rawPath.split("/").includes("..")) {
    throw new Error(`Unsafe relative path: ${relativePath}`);
  }
  const normalized = rawPath
    .split("/")
    .filter(Boolean)
    .join("/");
  if (!normalized) {
    throw new Error(`Unsafe relative path: ${relativePath}`);
  }
  return normalized;
}

function resolveInside(targetDir, relativePath) {
  const destPath = path.resolve(targetDir, relativePath);
  if (!isPathInside(destPath, targetDir)) {
    throw new Error(`Path traversal blocked: ${relativePath}`);
  }
  return destPath;
}

function isPathInside(filePath, parentDir) {
  return filePath === parentDir || filePath.startsWith(parentDir + path.sep);
}

function stripCommonRoot(paths) {
  const cleanPaths = paths.map((item) => String(item || "").replace(/\\/g, "/"));
  const firstSegments = cleanPaths.map((item) => item.split("/")[0]).filter(Boolean);
  const commonRoot = firstSegments[0];
  if (!commonRoot || commonRoot === "." || commonRoot === ".." || !firstSegments.every((item) => item === commonRoot)) return cleanPaths;
  const hasRootFile = cleanPaths.some((item) => !item.includes("/"));
  if (hasRootFile) return cleanPaths;
  return cleanPaths.map((item) => item.split("/").slice(1).join("/"));
}

function chooseEntryFile(htmlFiles, importType) {
  const normalized = htmlFiles.map((item) => item.replace(/\\/g, "/"));
  return normalized.find((item) => item.toLowerCase() === "index.html") || (importType === "html" && normalized.length === 1 ? normalized[0] : "");
}

function assertStaticPrototype(files) {
  const lower = files.map((file) => file.toLowerCase());
  const hasPackageJson = lower.includes("package.json");
  const hasDist = lower.some((file) => file === "dist/index.html" || file.startsWith("dist/"));
  if (hasPackageJson && !hasDist) {
    throw new Error("检测到 package.json，但没有 dist 目录。请先执行构建并导入 dist 目录。");
  }
}

function parseRelativePaths(raw, uploadedFiles) {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      throw new Error("Invalid relativePaths");
    }
  }
  return uploadedFiles.map((file) => file.originalFilename || file.newFilename);
}

function asFileArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstFile(value) {
  return asFileArray(value)[0];
}

function firstField(value) {
  return Array.isArray(value) ? value[0] : value;
}

function createPrototypeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export { createServerInstance };

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  await fs.mkdir(importedDir, { recursive: true });
  const server = createServerInstance();
  server.listen(port, "127.0.0.1", () => {
    console.log(`Universal HTML prototype workbench running at http://127.0.0.1:${port}/`);
  });
}
