import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(ROOT, 'web');
const API_ROOT = path.join(ROOT, 'server');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PREVIEW_PORT || 4174);
const API_PORT = Number(process.env.API_PORT || 3000);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

let apiProcess = null;

async function isApiReady() {
  try {
    const response = await fetch(`http://${HOST}:${API_PORT}/api/health`, {
      signal: AbortSignal.timeout(800),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureApi() {
  if (await isApiReady()) return;

  apiProcess = spawn(
    process.execPath,
    ['--env-file-if-exists=.env', 'src/index.js'],
    { cwd: API_ROOT, stdio: 'inherit' }
  );

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (await isApiReady()) return;
  }

  throw new Error(`FoodMind API 未能在 ${API_PORT} 端口启动`);
}

function proxyApi(req, res) {
  const proxy = httpRequest({
    hostname: HOST,
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${HOST}:${API_PORT}` },
  }, (upstream) => {
    res.writeHead(upstream.statusCode || 502, upstream.headers);
    upstream.pipe(res);
  });

  proxy.on('error', (error) => {
    res.writeHead(502, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ error: `本地 API 连接失败：${error.message}` }));
  });

  req.pipe(proxy);
}

function resolveStaticPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${HOST}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(WEB_ROOT, relativePath);
  if (target !== WEB_ROOT && !target.startsWith(`${WEB_ROOT}${path.sep}`)) return null;
  return target;
}

function serveStatic(req, res) {
  let filePath;
  try {
    filePath = resolveStaticPath(req.url);
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const headers = {
    'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

await ensureApi();

const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/')) {
    proxyApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.on('error', (error) => {
  console.error(`FoodMind 本地预览启动失败：${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`FoodMind 正式本地预览：http://${HOST}:${PORT}/`);
  console.log(`唯一静态目录：${WEB_ROOT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  if (apiProcess && !apiProcess.killed) apiProcess.kill('SIGTERM');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
