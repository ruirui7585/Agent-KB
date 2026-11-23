#!/usr/bin/env node
/**
 * PM 个人知识库本机微后台（零依赖原生 Node.js）：
 * - 仅监听 127.0.0.1:4321
 * - 网页端新增/编辑/状态切换/删除实时写回 pm-kb.md 并同步 kb-data.js
 * - 落盘后 6 秒静默合并防抖，自动执行 `vercel deploy --prod --yes` 同步到跨设备只读网址
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  loadCardsFromDisk,
  saveCardsToDisk,
  syncDataFile,
  nextCardId,
} from './sync-kb.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4321);
const DEPLOY_DELAY_MS = Number(process.env.DEPLOY_DELAY_MS || 6000);
const URL_CACHE_PATH = path.join(__dirname, '.vercel', 'pm-kb-prod-url.txt');

const EXTRA_PATH = [
  '/Users/shilv/.nvm/versions/node/v24.16.0/bin',
  '/usr/local/bin',
  '/opt/homebrew/bin',
  '/usr/bin',
  '/bin',
  process.env.PATH || '',
].join(':');

const deployState = {
  state: 'idle', // idle | scheduled | deploying | synced | error
  publicUrl: loadSavedProdUrl(),
  lastSyncedAt: null,
  lastError: null,
  scheduledAt: null,
};

let deployTimer = null;
let deployInFlight = false;
let deployQueued = false;

function loadSavedProdUrl() {
  if (process.env.PM_KB_PROD_URL) return process.env.PM_KB_PROD_URL.trim();
  try {
    return fs.readFileSync(URL_CACHE_PATH, 'utf8').trim();
  } catch {
    return '';
  }
}

function saveProdUrl(url) {
  if (!url) return;
  deployState.publicUrl = url;
  try {
    fs.mkdirSync(path.dirname(URL_CACHE_PATH), { recursive: true });
    fs.writeFileSync(URL_CACHE_PATH, url + '\n', 'utf8');
  } catch {}
}

function scheduleDeploy(immediate = false) {
  if (deployTimer) {
    clearTimeout(deployTimer);
    deployTimer = null;
  }
  if (deployInFlight) {
    deployQueued = true;
    return;
  }
  if (immediate) {
    runVercelDeploy();
    return;
  }
  deployState.state = 'scheduled';
  deployState.scheduledAt = Date.now() + DEPLOY_DELAY_MS;
  deployState.lastError = null;
  deployTimer = setTimeout(() => {
    deployTimer = null;
    runVercelDeploy();
  }, DEPLOY_DELAY_MS);
}

function runVercelDeploy() {
  if (deployInFlight) {
    deployQueued = true;
    return;
  }
  deployInFlight = true;
  deployQueued = false;
  deployState.state = 'deploying';
  deployState.scheduledAt = null;
  deployState.lastError = null;

  const child = spawn('vercel', ['deploy', '--prod', '--yes'], {
    cwd: __dirname,
    env: { ...process.env, PATH: EXTRA_PATH },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

  child.on('error', (err) => {
    deployInFlight = false;
    deployState.state = 'error';
    deployState.lastError = err.message;
  });

  child.on('close', (code) => {
    deployInFlight = false;
    if (code === 0) {
      const cleanOut = `${stdout}\n${stderr}`.replace(/\x1b\[[0-9;]*m/g, '');
      const aliasMatch = cleanOut.match(/Aliased:\s*(https:\/\/[^\s]+)/i);
      const savedFixed = loadSavedProdUrl();
      if (aliasMatch && aliasMatch[1]) {
        saveProdUrl(aliasMatch[1]);
      } else if (savedFixed) {
        deployState.publicUrl = savedFixed;
      }
      deployState.state = 'synced';
      deployState.lastSyncedAt = new Date().toISOString();
      deployState.lastError = null;
    } else {
      deployState.state = 'error';
      deployState.lastError = (stderr || stdout || `exit ${code}`).trim().slice(-240);
    }

    if (deployQueued) {
      deployQueued = false;
      runVercelDeploy();
    }
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, fileName, contentType) {
  const full = path.join(__dirname, fileName);
  try {
    const content = fs.readFileSync(full);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  const pathname = urlObj.pathname;

  try {
    if (req.method === 'GET' && (pathname === '/' || pathname === '/review.html')) {
      return serveStatic(res, 'review.html', 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && pathname === '/kb-data.js') {
      syncDataFile();
      return serveStatic(res, 'kb-data.js', 'application/javascript; charset=utf-8');
    }

    if (req.method === 'GET' && pathname === '/api/kb') {
      const { cards, warnings } = syncDataFile();
      return sendJson(res, 200, {
        ok: true,
        mode: 'local-server',
        cards,
        warnings,
        deploy: {
          ...deployState,
          publicUrl: loadSavedProdUrl() || deployState.publicUrl,
        },
      });
    }

    if (req.method === 'POST' && pathname === '/api/cards') {
      const body = await readBody(req);
      const cards = loadCardsFromDisk();
      const incomingId = String(body.id || '').trim();
      const existingIdx = incomingId ? cards.findIndex((c) => c.id === incomingId) : -1;

      let savedId = incomingId;
      if (existingIdx >= 0) {
        cards[existingIdx] = { ...cards[existingIdx], ...body, id: cards[existingIdx].id };
      } else {
        savedId = incomingId || nextCardId(cards);
        cards.unshift({ ...body, id: savedId });
      }

      const { cards: savedCards, warnings } = saveCardsToDisk(cards);
      const savedCard = savedCards.find((c) => c.id === savedId);

      if (body.skipDeploy !== true) {
        scheduleDeploy(false);
      }

      return sendJson(res, 200, {
        ok: true,
        card: savedCard,
        cards: savedCards,
        warnings,
        deploy: {
          ...deployState,
          publicUrl: loadSavedProdUrl() || deployState.publicUrl,
        },
      });
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/cards/')) {
      const targetId = decodeURIComponent(pathname.slice('/api/cards/'.length)).trim();
      const cards = loadCardsFromDisk();
      const next = cards.filter((c) => c.id !== targetId);
      if (next.length === cards.length) {
        return sendJson(res, 404, { ok: false, error: 'Card not found' });
      }
      const { cards: savedCards, warnings } = saveCardsToDisk(next);
      const skipDeploy = urlObj.searchParams.get('skipDeploy') === '1';
      if (!skipDeploy) {
        scheduleDeploy(false);
      }
      return sendJson(res, 200, {
        ok: true,
        deletedId: targetId,
        cards: savedCards,
        warnings,
        deploy: {
          ...deployState,
          publicUrl: loadSavedProdUrl() || deployState.publicUrl,
        },
      });
    }

    if (req.method === 'POST' && pathname === '/api/deploy') {
      scheduleDeploy(true);
      return sendJson(res, 200, {
        ok: true,
        deploy: {
          ...deployState,
          publicUrl: loadSavedProdUrl() || deployState.publicUrl,
        },
      });
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    return sendJson(res, 400, { ok: false, error: err.message || 'Bad request' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[pm-kb] Local server running at http://127.0.0.1:${PORT}`);
});
