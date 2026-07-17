import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";
import formidable from "formidable";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const importedDir = path.join(rootDir, "imported-prototypes");
const port = Number(process.env.PORT || 5173);

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

await fs.mkdir(importedDir, { recursive: true });

const server = http.createServer(async (req, res) => {
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

server.listen(port, "127.0.0.1", () => {
  console.log(`Universal HTML prototype workbench running at http://127.0.0.1:${port}/`);
});

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

async function serveStatic(requestPath, res, headOnly) {
  const cleanPath = decodeURIComponent(requestPath.split("?")[0]);
  if (cleanPath.startsWith("/prototypes/")) {
    const prototypePath = cleanPath.replace(/^\/prototypes\//, "");
    const filePath = path.resolve(importedDir, prototypePath);
    if (!isPathInside(filePath, importedDir)) {
      sendText(res, 403, "Forbidden");
      return;
    }
    try {
      const stat = await fs.stat(filePath);
      await sendFile(stat.isDirectory() ? path.join(filePath, "index.html") : filePath, res, headOnly);
    } catch {
      sendText(res, 404, "Not Found");
    }
    return;
  }
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);
  if (!isPathInside(filePath, rootDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await sendFile(path.join(filePath, "index.html"), res, headOnly);
      return;
    }
    await sendFile(filePath, res, headOnly);
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

async function importZipFile(zipPath, targetDir) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  const strippedNames = stripCommonRoot(entries.map((entry) => entry.entryName));
  const writtenFiles = [];
  for (let index = 0; index < entries.length; index += 1) {
    const safeRelativePath = sanitizeRelativePath(strippedNames[index]);
    const destPath = resolveInside(targetDir, safeRelativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, entries[index].getData());
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
