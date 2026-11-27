#!/usr/bin/env node
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAGE_TYPE_LIST,
  appendSliceToPage,
  loadTagConfig,
  runPipeline,
  saveTagConfig,
  syncSessionsBundle,
} from './scripts/process-capture.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECORDINGS_DIR = path.join(__dirname, 'recordings');
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const ANNOTATIONS_FILE = path.join(__dirname, 'annotations.json');
const PM_INBOX_RAW_DIR = path.resolve(__dirname, '../laka/pm-inbox/raw');

fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
fs.mkdirSync(SESSIONS_DIR, { recursive: true });
if (!fs.existsSync(path.join(SESSIONS_DIR, 'sessions-data.json'))) {
  syncSessionsBundle();
}

const app = express();

// 允许通过 file:///.../index.html 本地路由地址直接访问本机采集处理引擎
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-file-name,x-session-id,x-item-id');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

function sanitizeSegment(str, fallback = 'item') {
  const s = String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36);
  return s || fallback;
}

function readAnnotations() {
  if (!fs.existsSync(ANNOTATIONS_FILE)) {
    return { updatedAt: new Date().toISOString(), items: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(ANNOTATIONS_FILE, 'utf8'));
  } catch {
    return { updatedAt: new Date().toISOString(), items: {} };
  }
}

// 1. 原型注释持久化 API
app.get('/api/annotations', (_req, res) => {
  res.json(readAnnotations());
});

app.post('/api/annotations', express.json({ limit: '5mb' }), (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const payload = {
    updatedAt: new Date().toISOString(),
    items: body.items && typeof body.items === 'object' ? body.items : body,
  };
  fs.writeFileSync(ANNOTATIONS_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  res.json({ ok: true, savedAt: payload.updatedAt });
});

// 2. 获取全部自动识别好的页面墙数据
app.get('/api/sessions', (_req, res) => {
  const bundle = syncSessionsBundle();
  res.json(bundle);
});

app.post('/api/process', express.json({ limit: '1mb' }), (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const result = runPipeline({ force });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// 3. 上传单张/批量截图或录屏并立即全自动切图+打标签
app.post(
  '/api/upload-recording',
  express.raw({ type: '*/*', limit: '600mb' }),
  (req, res) => {
    try {
      const rawHeader = req.headers['x-file-name'] || 'capture.mp4';
      const decodedName = decodeURIComponent(String(rawHeader));
      const ext = path.extname(decodedName).toLowerCase() || '.png';
      const base = sanitizeSegment(path.basename(decodedName, ext), 'upload');
      let safeFileName = `${base}${ext}`;
      let targetPath = path.join(RECORDINGS_DIR, safeFileName);
      let seq = 2;
      while (fs.existsSync(targetPath)) {
        safeFileName = `${base}-${seq}${ext}`;
        targetPath = path.join(RECORDINGS_DIR, safeFileName);
        seq += 1;
      }

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ ok: false, error: '上传文件内容为空' });
      }

      fs.writeFileSync(targetPath, req.body);
      const result = runPipeline({ force: false });
      return res.json({
        ok: true,
        savedFile: `recordings/${safeFileName}`,
        ...result,
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  }
);

// 3.5 连续 ⌘V 续拼长图接口：将新截图无缝接在指定卡片底部
app.post(
  '/api/pages/append-stitch',
  express.raw({ type: '*/*', limit: '200mb' }),
  (req, res) => {
    try {
      const sessionId = sanitizeSegment(req.headers['x-session-id'] || '', '');
      const itemId = sanitizeSegment(req.headers['x-item-id'] || '', '');
      const rawName = decodeURIComponent(String(req.headers['x-file-name'] || 'slice.png'));
      const ext = path.extname(rawName).toLowerCase() || '.png';

      if (!sessionId || !itemId) {
        return res.status(400).json({ ok: false, error: '缺少续拼目标卡片参数' });
      }
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ ok: false, error: '粘贴的图片内容为空' });
      }

      const result = appendSliceToPage({
        sessionId,
        itemId,
        imageBuffer: req.body,
        ext,
      });
      return res.json({ ok: true, ...result });
    } catch (err) {
      return res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  }
);

// 4. 一键点击更换标签 / 子标签 / 改标题（支持单张秒换或同录屏批次联动换竞品名）
app.post('/api/pages/update', express.json({ limit: '2mb' }), (req, res) => {
  try {
    const {
      sessionId,
      itemId,
      competitor,
      pageType,
      subTag,
      displayTitle,
      note,
      applyCompetitorToSession,
    } = req.body || {};
    const cleanSid = sanitizeSegment(sessionId, '');
    const sessionJsonPath = path.join(SESSIONS_DIR, cleanSid, 'session.json');
    if (!cleanSid || !fs.existsSync(sessionJsonPath)) {
      return res.status(404).json({ ok: false, error: '找不到对应页面记录' });
    }

    const session = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
    const allItems = [...(session.stitched || []), ...(session.frames || [])];
    const target = allItems.find((x) => x.id === itemId);

    if (typeof competitor === 'string') {
      if (applyCompetitorToSession || allItems.length === 1) {
        session.competitor = competitor;
        allItems.forEach((x) => {
          x.competitor = competitor;
        });
      } else if (target) {
        target.competitor = competitor;
      }
    }

    if (target && typeof pageType === 'string') {
      const pt = PAGE_TYPE_LIST.find((p) => p.id === pageType);
      if (pt) {
        target.pageType = pt.id;
        target.pageTypeLabel = pt.label;
        target.module = pt.module;
        if (typeof displayTitle !== 'string' && target.displayTitle?.includes(' · ')) {
          const rest = target.displayTitle.split(' · ').slice(1).join(' · ');
          target.displayTitle = `${pt.label} · ${rest}`;
        } else if (typeof displayTitle !== 'string') {
          target.displayTitle = pt.label;
        }
      }
    }

    if (target && typeof subTag === 'string') {
      const cleanSub = subTag.trim().slice(0, 24);
      target.subTag = cleanSub;
      if (cleanSub) {
        const cfg = loadTagConfig();
        const typeKey = target.pageType || 'admin-dashboard';
        const list = cfg.subTagsByPageType[typeKey] || [];
        if (!list.includes(cleanSub)) {
          cfg.subTagsByPageType[typeKey] = [...list, cleanSub];
          saveTagConfig(cfg);
        }
      }
    }

    if (target && typeof displayTitle === 'string' && displayTitle.trim()) {
      target.displayTitle = displayTitle.trim();
    }

    if (target && typeof note === 'string') {
      target.note = note;
    }

    fs.writeFileSync(sessionJsonPath, `${JSON.stringify(session, null, 2)}\n`, 'utf8');
    const bundle = syncSessionsBundle();
    return res.json({ ok: true, bundle });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// 4.5 新增或管理自定义子标签词表（如 VIP看板）
app.post('/api/tags/subtag', express.json({ limit: '1mb' }), (req, res) => {
  try {
    const { pageType, subTag, action = 'add' } = req.body || {};
    const typeKey = String(pageType || 'admin-dashboard').trim();
    const cleanSub = String(subTag || '').trim().slice(0, 24);
    if (!cleanSub) {
      return res.status(400).json({ ok: false, error: '子标签不能为空' });
    }
    const cfg = loadTagConfig();
    const cur = cfg.subTagsByPageType[typeKey] || [];
    if (action === 'remove') {
      cfg.subTagsByPageType[typeKey] = cur.filter((x) => x !== cleanSub);
    } else if (!cur.includes(cleanSub)) {
      cfg.subTagsByPageType[typeKey] = [...cur, cleanSub];
    }
    saveTagConfig(cfg);
    const bundle = syncSessionsBundle();
    return res.json({ ok: true, bundle });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// 5. 一键删除单张不需要的废图
app.post('/api/pages/delete', express.json({ limit: '1mb' }), (req, res) => {
  try {
    const { sessionId, itemId } = req.body || {};
    const cleanSid = sanitizeSegment(sessionId, '');
    const sessionDir = path.join(SESSIONS_DIR, cleanSid);
    const sessionJsonPath = path.join(sessionDir, 'session.json');
    if (!cleanSid || !fs.existsSync(sessionJsonPath)) {
      return res.status(404).json({ ok: false, error: '找不到对应记录' });
    }

    const session = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
    session.stitched = (session.stitched || []).filter((x) => x.id !== itemId);
    session.frames = (session.frames || []).filter((x) => x.id !== itemId);

    if (session.stitched.length === 0 && session.frames.length === 0) {
      // 若整个批次图片都被删空，连同原始上传文件一并清理，防止下次扫描又冒出来
      if (session.sourceFile) {
        const srcAbs = path.join(__dirname, session.sourceFile);
        if (fs.existsSync(srcAbs)) fs.unlinkSync(srcAbs);
      }
      fs.rmSync(sessionDir, { recursive: true, force: true });
    } else {
      fs.writeFileSync(sessionJsonPath, `${JSON.stringify(session, null, 2)}\n`, 'utf8');
    }

    const bundle = syncSessionsBundle();
    return res.json({ ok: true, bundle });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// 6. 辅助一键将当前筛选页面同步备份到 ../laka/pm-inbox/raw/（无需手动勾选）
app.post('/api/export-to-inbox', express.json({ limit: '2mb' }), (req, res) => {
  try {
    const { uids } = req.body || {};
    const bundle = syncSessionsBundle();
    const targetPages = Array.isArray(uids) && uids.length > 0
      ? bundle.pages.filter((p) => uids.includes(p.uid))
      : bundle.pages.filter((p) => !p.mergedIntoLong);

    if (targetPages.length === 0) {
      return res.status(400).json({ ok: false, error: '当前没有可同步的页面' });
    }

    fs.mkdirSync(PM_INBOX_RAW_DIR, { recursive: true });
    const copied = [];

    for (const p of targetPages) {
      const srcAbs = path.join(__dirname, p.imagePath);
      if (!fs.existsSync(srcAbs)) continue;
      const ext = path.extname(srcAbs).toLowerCase() || '.png';
      const compSlug = sanitizeSegment(
        p.competitor === 'unassigned' ? 'competitor' : p.competitor,
        'competitor'
      );
      const typeSlug = sanitizeSegment(p.pageType, 'screen');
      const datePart = (p.capturedAt || new Date().toISOString()).slice(0, 10).replace(/-/g, '');
      let destName = `${compSlug}-${typeSlug}-${datePart}${ext}`;
      let destAbs = path.join(PM_INBOX_RAW_DIR, destName);
      let seq = 2;
      while (fs.existsSync(destAbs)) {
        destName = `${compSlug}-${typeSlug}-${seq}-${datePart}${ext}`;
        destAbs = path.join(PM_INBOX_RAW_DIR, destName);
        seq += 1;
      }
      fs.copyFileSync(srcAbs, destAbs);
      copied.push(destName);
    }

    return res.json({ ok: true, copiedCount: copied.length, copiedFiles: copied });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.use(express.static(__dirname));

const BASE_PORT = Number(process.env.PORT) || 3460;

function startListening(port) {
  const srv = app.listen(port, '127.0.0.1', () => {
    console.log(`[OK] Laka 竞品自动页面画廊已启动: http://localhost:${port}`);
  });
  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < BASE_PORT + 10) {
      startListening(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

startListening(BASE_PORT);
