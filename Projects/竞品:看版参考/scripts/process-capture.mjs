#!/usr/bin/env node
/**
 * Laka 竞品录屏与截图全自动识别归档流水线（零外部 npm 依赖）
 *
 * 核心效果：
 * - 人工只需上传图片或录屏；
 * - 自动去状态栏噪点、按页面上/中/下区域加权识别「页面类型中文标签」「所属模块」「自动中文标题」与「UI 关键要素摘要」。
 */

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CAPTURE_ROOT = path.resolve(__dirname, '..');
const RECORDINGS_DIR = path.join(CAPTURE_ROOT, 'recordings');
const SESSIONS_DIR = path.join(CAPTURE_ROOT, 'sessions');
const TAG_CONFIG_FILE = path.join(CAPTURE_ROOT, 'tag-config.json');
const EXTRACT_PY = path.join(__dirname, 'extract-frames.py');
const OCR_SWIFT = path.join(__dirname, 'ocr-vision.swift');

const VIDEO_EXTS = new Set(['.mov', '.mp4', '.m4v', '.webm']);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export const COMPETITOR_LIST = [
  { id: 'unassigned', label: '选竞品' },
  { id: 'sugo', label: 'SUGO', re: /\bsugo\b/i },
  { id: 'yalla', label: 'Yalla', re: /\byalla\b/i },
  { id: 'soulchill', label: 'SoulChill', re: /soul\s*chill/i },
  { id: 'yoho', label: 'YoHo', re: /\byoho\b/i },
  { id: 'chamet', label: 'Chamet', re: /\bchamet\b/i },
  { id: 'timo', label: 'Timo', re: /\btimo\b/i },
  { id: 'starchat', label: 'StarChat', re: /star\s*chat/i },
  { id: 'mico', label: 'MICO', re: /\bmico\b/i },
  { id: 'bigo', label: 'BIGO', re: /\bbigo\b/i },
  { id: 'laka', label: 'Laka对照', re: /\b(laka|salfa)\b/i },
  { id: 'other', label: '其他App' },
];

export const MODULE_LIST = [
  { id: 'voice-room', label: '语聊房与麦位' },
  { id: 'pk-battle', label: 'PK与榜单' },
  { id: 'vip-nobility', label: 'VIP与特权' },
  { id: 'pretty-id-honorship', label: '靓号与荣誉' },
  { id: 'gifts-events-recharge', label: '礼物/充值/活动' },
  { id: '1v1-match-chat', label: '1v1推荐与私聊' },
  { id: 'host-agency-supply', label: '主播与公会' },
  { id: 'profile-social-relations', label: '主页/动态/关系' },
];

// 直观中文页面类型标签（支持在页面卡片上一键点换）
export const PAGE_TYPE_LIST = [
  { id: 'home-recommend', label: '首页推荐', module: '1v1-match-chat', color: 'indigo' },
  { id: 'party-list', label: '房间列表', module: 'voice-room', color: 'blue' },
  { id: 'voice-room', label: '语音房内', module: 'voice-room', color: 'violet' },
  { id: 'room-modal', label: '房间弹窗/设置', module: 'voice-room', color: 'purple' },
  { id: 'pk-battle', label: 'PK与榜单', module: 'pk-battle', color: 'rose' },
  { id: 'vip-nobility', label: 'VIP与贵族', module: 'vip-nobility', color: 'amber' },
  { id: 'recharge-promo', label: '充值与活动', module: 'gifts-events-recharge', color: 'orange' },
  { id: 'gift-shop', label: '礼物与装扮', module: 'gifts-events-recharge', color: 'pink' },
  { id: 'pretty-level', label: '靓号/等级/勋章', module: 'pretty-id-honorship', color: 'cyan' },
  { id: 'im-chat', label: '消息与私聊', module: '1v1-match-chat', color: 'emerald' },
  { id: 'moment-feed', label: '动态广场', module: 'profile-social-relations', color: 'teal' },
  { id: 'profile-relation', label: '主页/CP/守护', module: 'profile-social-relations', color: 'sky' },
  { id: 'agency-host', label: '主播/公会中心', module: 'host-agency-supply', color: 'slate' },
  { id: 'admin-dashboard', label: '后台看板', module: 'host-agency-supply', color: 'stone' },
];

const DEFAULT_SUBTAGS_BY_TYPE = {
  'admin-dashboard': ['VIP看板', '充值看板', '房间看板', 'PK看板', '礼物看板', '主播/公会', '风控/审核', '活动配置'],
  'vip-nobility': ['权益规则', '购买/续费', '等级升级'],
  'pk-battle': ['1v1/团战', '榜单冲刺', '惩罚机制'],
  'recharge-promo': ['月累充', '首充礼包', '活动规则'],
  'voice-room': ['麦位管理', '房间设置', '锁房密码'],
};

export function loadTagConfig() {
  if (!fs.existsSync(TAG_CONFIG_FILE)) {
    const initial = {
      updatedAt: new Date().toISOString(),
      subTagsByPageType: DEFAULT_SUBTAGS_BY_TYPE,
    };
    fs.writeFileSync(TAG_CONFIG_FILE, `${JSON.stringify(initial, null, 2)}\n`, 'utf8');
    return initial;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(TAG_CONFIG_FILE, 'utf8'));
    const merged = { ...DEFAULT_SUBTAGS_BY_TYPE };
    for (const [k, arr] of Object.entries(parsed.subTagsByPageType || {})) {
      merged[k] = Array.from(new Set([...(merged[k] || []), ...(Array.isArray(arr) ? arr : [])]));
    }
    return { updatedAt: parsed.updatedAt || new Date().toISOString(), subTagsByPageType: merged };
  } catch {
    return { updatedAt: new Date().toISOString(), subTagsByPageType: DEFAULT_SUBTAGS_BY_TYPE };
  }
}

export function saveTagConfig(config) {
  const payload = {
    updatedAt: new Date().toISOString(),
    subTagsByPageType: config.subTagsByPageType || DEFAULT_SUBTAGS_BY_TYPE,
  };
  fs.writeFileSync(TAG_CONFIG_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

function buildExecEnv() {
  const extra = ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin'];
  const parts = (process.env.PATH || '').split(':').filter(Boolean);
  for (let i = extra.length - 1; i >= 0; i -= 1) {
    if (!parts.includes(extra[i])) parts.unshift(extra[i]);
  }
  return { ...process.env, PATH: parts.join(':') };
}

function toRelPosix(absPath) {
  return path.relative(CAPTURE_ROOT, absPath).split(path.sep).join('/');
}

function sha256Short(filePath) {
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(65536);
  let bytesRead = 0;
  do {
    bytesRead = fs.readSync(fd, buf, 0, buf.length, null);
    if (bytesRead > 0) hash.update(buf.subarray(0, bytesRead));
  } while (bytesRead > 0);
  fs.closeSync(fd);
  return hash.digest('hex').slice(0, 12);
}

function slugifyName(name) {
  const base = path.basename(name, path.extname(name));
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'capture';
}

function detectImageSize(absPath) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', absPath], {
      encoding: 'utf8',
    });
    const wMatch = out.match(/pixelWidth:\s*(\d+)/);
    const hMatch = out.match(/pixelHeight:\s*(\d+)/);
    return {
      width: wMatch ? Number(wMatch[1]) : 0,
      height: hMatch ? Number(hMatch[1]) : 0,
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

function guessCompetitor(fileName, ocrFullText) {
  const combined = `${fileName}\n${ocrFullText}`;
  for (const item of COMPETITOR_LIST) {
    if (item.re && item.re.test(combined)) return item.id;
  }
  return 'unassigned';
}

/**
 * 区域加权智能页面分类器：
 * - headerText 权重最高（×5），避免列表某个人名旁带一个小 VIP 徽章就把整个推荐页误判成 VIP 页；
 * - 支持识别横屏 PC 后台管理系统 / 运营看板截图并自动推荐子标签（如 VIP看板）。
 */
function classifyScreenPage(ocr, kind = 'frame', dims = { width: 0, height: 0 }) {
  const header = (ocr.headerLines || []).join('  ');
  const body = (ocr.bodyLines || []).join('\n');
  const footer = (ocr.footerLines || []).join('  ');
  const all = ocr.fullText || '';

  const hiCount = (body.match(/\bHi\b/g) || []).length;
  const isLandscape = dims.width > 0 && dims.height > 0 && dims.width > dims.height * 1.1;
  const adminMatches =
    all.match(
      /(后台管理系统|运营后台|管理后台|数据看板|看板|查询|重置|导出|新增|操作人|操作日志|创建时间|状态|编辑|删除|共\s*\d+\s*条|dashboard|admin|bms|management|search|reset|export|created\s*at)/gi
    ) || [];

  const rules = [
    {
      pageType: 'admin-dashboard',
      score:
        (isLandscape ? 12 : 0) +
        (adminMatches.length >= 2 ? 14 : adminMatches.length === 1 ? 7 : 0) +
        (/(后台管理系统|运营后台|管理后台|数据看板|bms|admin)/i.test(header) ? 10 : 0),
    },
    {
      pageType: 'pk-battle',
      score:
        (/\b(pk|battle|mvp|punish|ranking|leaderboard)\b/i.test(header) ? 14 : 0) +
        (/\b(room\s*pk|pk\s*mode|pk\s*settings|start\s*pk|1v1\s+2v2|4v4|8v8)\b/i.test(body) ? 12 : 0),
    },
    {
      pageType: 'home-recommend',
      score:
        (/\b(for\s*you|nearby|popular|discover)\b/i.test(header) ? 15 : 0) +
        (hiCount >= 2 ? 10 : 0) +
        (/\bhome\b.*\bmoment\b.*\bparty\b/i.test(footer) && /\bfor\s*you\b/i.test(all) ? 8 : 0),
    },
    {
      pageType: 'vip-nobility',
      score:
        (/\b(vip|svip|nobility|noble|privilege|贵族|特权)\b/i.test(header) ? 16 : 0) +
        (/\b(mystery\s*person|kick\s*protection|block\s*follow|hide\s*online|open\s*vip|vip\s*[1-9])\b/i.test(body)
          ? 12
          : 0) +
        (kind === 'stitched' && /\bvip\b/i.test(all) ? 8 : 0),
    },
    {
      pageType: 'recharge-promo',
      score:
        (/\b(recharge|top[\s-]*up|wallet|diamonds|check[\s-]*in|daily\s*task|tasks|充值|累充)\b/i.test(header)
          ? 15
          : 0) +
        (/\b(first\s*recharge|monthly\s*recharge|coins\s*\/\s*|claim\b|recharge\s*now|payment)\b/i.test(body)
          ? 10
          : 0),
    },
    {
      pageType: 'gift-shop',
      score:
        (/\b(shop|mall|store|backpack|avatar\s*frame|mount|entrance|商城|背包)\b/i.test(header) ? 15 : 0) +
        (/\b(lucky\s*gift|gift\s*wall|send\s*gift|背包|礼物)\b/i.test(body) ? 11 : 0),
    },
    {
      pageType: 'pretty-level',
      score:
        (/\b(pretty\s*id|unique\s*id|special\s*id|honorship|medal|title\s*center|wealth\s*level|charm\s*level|靓号|勋章)\b/i.test(
          `${header}\n${body}`
        )
          ? 15
          : 0),
    },
    {
      pageType: 'voice-room',
      score:
        (/\b(voice\s*room|room\s*id|online\s*users)\b/i.test(header) ? 13 : 0) +
        (/\b(seat\s*[1-9]|say\s*hi|mic\b|joined\s*the\s*room)\b/i.test(body) ? 12 : 0),
    },
    {
      pageType: 'room-modal',
      score:
        (/\b(room\s*settings|lock\s*room|unlock\s*room|room\s*tools|admin|mute|kick)\b/i.test(
          `${header}\n${body}`
        )
          ? 14
          : 0),
    },
    {
      pageType: 'party-list',
      score:
        (/\b(party|voice\s*chat|chat\s*rooms|explore\s*rooms)\b/i.test(header) ? 14 : 0),
    },
    {
      pageType: 'im-chat',
      score:
        (/\b(messages?|chat|intimacy|inbox|customer\s*service)\b/i.test(header) ? 14 : 0) +
        (/\b(intimacy\s*level|type\s*a\s*message|quick\s*reply)\b/i.test(body) ? 10 : 0),
    },
    {
      pageType: 'moment-feed',
      score: (/\b(moments?|square|following\s*feed|动态)\b/i.test(header) ? 14 : 0),
    },
    {
      pageType: 'profile-relation',
      score:
        (/\b(relationship|\bcp\b|guardian|family|my\s*profile|edit\s*profile|visitors)\b/i.test(
          `${header}\n${body}`
        )
          ? 13
          : 0) +
        (/\b(mine|me)\b/i.test(header) ? 11 : 0),
    },
    {
      pageType: 'agency-host',
      score:
        (/\b(agency|bd\s*center|host\s*center|guild|commission|withdraw|salary)\b/i.test(
          `${header}\n${body}`
        )
          ? 14
          : 0),
    },
  ];

  rules.sort((a, b) => b.score - a.score);
  const best = rules[0] && rules[0].score >= 8 ? rules[0].pageType : (kind === 'stitched' ? 'recharge-promo' : 'voice-room');
  const typeMeta = PAGE_TYPE_LIST.find((p) => p.id === best) || PAGE_TYPE_LIST[0];

  // 提取干净可读的页面副标题（优先取顶栏标题或首个英文/中文标题词）
  let subTitle = '';
  const candidateLines = [...(ocr.headerLines || []), ...(ocr.bodyLines || []).slice(0, 4)];
  for (const line of candidateLines) {
    const clean = line.replace(/^[<>«»←×\s]+/, '').trim();
    if (clean.length >= 2 && clean.length <= 34 && /[A-Za-z\u4e00-\u9fa5\u0600-\u06FF]{2,}/.test(clean)) {
      subTitle = clean;
      break;
    }
  }

  const displayTitle = subTitle
    ? `${typeMeta.label} · ${subTitle.slice(0, 20)}`
    : kind === 'stitched'
      ? `${typeMeta.label} · 完整长规则`
      : typeMeta.label;

  // 提取 3~5 个关键 UI 标签亮点，方便在详情抽屉一眼扫完页面构成
  const highlights = [];
  if (ocr.headerLines?.length) {
    highlights.push(`顶栏：${ocr.headerLines.join(' / ').slice(0, 42)}`);
  }
  if (hiCount >= 2) highlights.push(`高频按钮：Hi 搭讪 (×${hiCount})`);
  if (/\bmerchant\b/i.test(all)) highlights.push('身份标：Merchant 币商');
  if (/\bfree\b/i.test(all)) highlights.push('免费钩子：FREE 权益提示');
  const priceMatches = all.match(/\b[\d,]+\s*(coins|diamonds|usd|\$|days|min)\b/gi);
  if (priceMatches?.length) {
    highlights.push(`数值规则：${Array.from(new Set(priceMatches)).slice(0, 3).join(' · ')}`);
  }
  if (ocr.footerLines?.length) {
    highlights.push(`底导/底栏：${ocr.footerLines.join(' / ').slice(0, 48)}`);
  }

  // 生成用于文件归档的干净英文 slug（完全对用户隐藏，后台自动使用）
  const enWords = `${typeMeta.id} ${subTitle}`
    .replace(/[^A-Za-z0-9\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .slice(0, 4)
    .join('-')
    .toLowerCase();

  // 自动匹配常用子标签（尤其是后台看板下的 VIP看板 / 充值看板 / 房间看板 等）
  let subTag = '';
  if (typeMeta.id === 'admin-dashboard') {
    if (/\bvip\b|svip|贵族/i.test(all)) subTag = 'VIP看板';
    else if (/recharge|top[\s-]*up|充值|订单|流水|diamonds/i.test(all)) subTag = '充值看板';
    else if (/voice\s*room|房间|麦位/i.test(all)) subTag = '房间看板';
    else if (/\bpk\b|对战/i.test(all)) subTag = 'PK看板';
    else if (/gift|礼物|盲盒/i.test(all)) subTag = '礼物看板';
    else if (/agency|guild|host|\bbd\b|公会|主播/i.test(all)) subTag = '主播/公会';
    else if (/risk|audit|ban|风控|审核|封禁/i.test(all)) subTag = '风控/审核';
  } else if (typeMeta.id === 'vip-nobility') {
    if (/rule|privilege|权益|说明/i.test(all)) subTag = '权益规则';
    else if (/renew|upgrade|续费|升级/i.test(all)) subTag = '等级升级';
  }

  return {
    pageType: typeMeta.id,
    pageTypeLabel: typeMeta.label,
    subTag,
    module: typeMeta.module,
    displayTitle,
    highlights,
    slug: enWords || typeMeta.id,
  };
}

function runBatchOcr(imageAbsPaths, env) {
  if (!imageAbsPaths.length) return {};
  const out = execFileSync('swift', [OCR_SWIFT, ...imageAbsPaths], {
    env,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out.trim() || '{}');
}

function formatSec(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const mins = Math.floor(s / 60);
  const rem = (s - mins * 60).toFixed(1).padStart(4, '0');
  return `${String(mins).padStart(2, '0')}:${rem}`;
}

function buildRulesDraftMarkdown(session) {
  const allItems = [...(session.stitched || []), ...(session.frames || [])];
  const lines = [
    `# 竞品页面自动采集记录：${session.title}`,
    '',
    `- **来源文件**：\`${session.sourceFile}\``,
    `- **采集时间**：${session.capturedAt.slice(0, 10)}`,
    `- **归属竞品**：\`${session.competitor}\``,
    `- **页面总数**：${allItems.length} 页（含拼接长图 ${(session.stitched || []).length} 张）`,
    '',
  ];

  for (const it of allItems) {
    lines.push(`## [${it.pageTypeLabel}] ${it.displayTitle} (${it.id})`);
    lines.push(`- 路径：\`${it.imagePath}\``);
    if (it.highlights?.length) {
      lines.push(`- 结构摘要：${it.highlights.join(' ｜ ')}`);
    }
    if (it.ocrText) {
      lines.push('', '```text', it.ocrText, '```', '');
    }
  }
  return lines.join('\n');
}

function processSingleVideo(videoPath, force, env) {
  const stat = fs.statSync(videoPath);
  const fileHash = sha256Short(videoPath);
  const slugBase = slugifyName(videoPath).slice(0, 28);
  const sessionId = `${slugBase}-${fileHash.slice(0, 6)}`;
  const sessionDir = path.join(SESSIONS_DIR, sessionId);
  const sessionJsonPath = path.join(sessionDir, 'session.json');

  let prevMeta = null;
  if (fs.existsSync(sessionJsonPath)) {
    prevMeta = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
    if (!force && prevMeta.sourceHash === fileHash && prevMeta.schemaV2) {
      return { status: 'skipped', sessionId, session: prevMeta };
    }
  }

  fs.mkdirSync(sessionDir, { recursive: true });
  execFileSync(
    'python3',
    [EXTRACT_PY, '--input', videoPath, '--out-dir', sessionDir, '--fps', '3.0'],
    { env, stdio: 'pipe', maxBuffer: 16 * 1024 * 1024 }
  );

  const extractRes = JSON.parse(
    fs.readFileSync(path.join(sessionDir, 'extract-result.json'), 'utf8')
  );

  const frameAbsList = extractRes.frames.map((f) => path.join(sessionDir, 'frames', f.fileName));
  const stitchedAbsList = extractRes.stitched.map((s) =>
    path.join(sessionDir, 'stitched', s.fileName)
  );
  const ocrMap = runBatchOcr([...stitchedAbsList, ...frameAbsList], env);

  const combinedOcr = Object.values(ocrMap)
    .map((x) => x.fullText || '')
    .join('\n');
  const autoCompetitor =
    prevMeta?.competitor && prevMeta.competitor !== 'unassigned'
      ? prevMeta.competitor
      : guessCompetitor(path.basename(videoPath), combinedOcr);

  // 被拼进长图的原始分屏帧打上标记，默认在画廊折叠或排后，优先展示完整长图，减少视觉重复
  const stitchedSourceSet = new Set();
  extractRes.stitched.forEach((s) => (s.sourceFrameIds || []).forEach((id) => stitchedSourceSet.add(id)));

  const stitched = extractRes.stitched.map((s) => {
    const abs = path.join(sessionDir, 'stitched', s.fileName);
    const ocr = ocrMap[abs] || { headerLines: [], bodyLines: [], footerLines: [], lines: [], fullText: '' };
    const cls = classifyScreenPage(ocr, 'stitched', { width: s.width, height: s.height });
    return {
      id: s.id,
      kind: 'stitched',
      fileName: s.fileName,
      imagePath: toRelPosix(abs),
      sourceFrameIds: s.sourceFrameIds,
      timestampLabel: `长图 ${formatSec(s.startTimestampSec)}~${formatSec(s.endTimestampSec)}`,
      width: s.width,
      height: s.height,
      competitor: autoCompetitor,
      pageType: cls.pageType,
      pageTypeLabel: cls.pageTypeLabel,
      subTag: cls.subTag,
      module: cls.module,
      displayTitle: cls.displayTitle,
      highlights: cls.highlights,
      slug: cls.slug,
      mergedIntoLong: false,
      selected: true,
      note: '',
      headerLines: ocr.headerLines || [],
      footerLines: ocr.footerLines || [],
      ocrLines: ocr.lines || [],
      ocrText: ocr.fullText || '',
    };
  });

  const frames = extractRes.frames.map((f) => {
    const abs = path.join(sessionDir, 'frames', f.fileName);
    const ocr = ocrMap[abs] || { headerLines: [], bodyLines: [], footerLines: [], lines: [], fullText: '' };
    const cls = classifyScreenPage(ocr, 'frame', { width: f.width, height: f.height });
    const isMerged = stitchedSourceSet.has(f.id);
    return {
      id: f.id,
      kind: 'frame',
      fileName: f.fileName,
      imagePath: toRelPosix(abs),
      timestampSec: f.timestampSec,
      timestampLabel: formatSec(f.timestampSec),
      width: f.width,
      height: f.height,
      competitor: autoCompetitor,
      pageType: cls.pageType,
      pageTypeLabel: cls.pageTypeLabel,
      subTag: cls.subTag,
      module: cls.module,
      displayTitle: cls.displayTitle,
      highlights: cls.highlights,
      slug: cls.slug,
      mergedIntoLong: isMerged,
      selected: !isMerged,
      note: '',
      headerLines: ocr.headerLines || [],
      footerLines: ocr.footerLines || [],
      ocrLines: ocr.lines || [],
      ocrText: ocr.fullText || '',
    };
  });

  const primaryModule = stitched[0]?.module || frames[0]?.module || 'voice-room';

  const sessionData = {
    schemaV2: true,
    id: sessionId,
    title: path.basename(videoPath, path.extname(videoPath)),
    sourceFile: toRelPosix(videoPath),
    sourceHash: fileHash,
    capturedAt: stat.mtime.toISOString(),
    processedAt: new Date().toISOString(),
    durationSec: extractRes.durationSec,
    competitor: autoCompetitor,
    module: primaryModule,
    stitched,
    frames,
    exportedFiles: prevMeta?.exportedFiles || [],
  };

  const draftMdPath = path.join(sessionDir, 'rules-draft.md');
  fs.writeFileSync(draftMdPath, buildRulesDraftMarkdown(sessionData), 'utf8');
  sessionData.rulesDraftPath = toRelPosix(draftMdPath);

  fs.writeFileSync(sessionJsonPath, `${JSON.stringify(sessionData, null, 2)}\n`, 'utf8');
  return { status: 'processed', sessionId, session: sessionData };
}

function processSingleImage(imagePath, force, env) {
  const stat = fs.statSync(imagePath);
  const fileHash = sha256Short(imagePath);
  const slugBase = slugifyName(imagePath).slice(0, 28);
  const sessionId = `img-${slugBase}-${fileHash.slice(0, 6)}`;
  const sessionDir = path.join(SESSIONS_DIR, sessionId);
  const sessionJsonPath = path.join(sessionDir, 'session.json');

  let prevMeta = null;
  if (fs.existsSync(sessionJsonPath)) {
    prevMeta = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
    if (!force && prevMeta.sourceHash === fileHash && prevMeta.schemaV2) {
      return { status: 'skipped', sessionId, session: prevMeta };
    }
  }

  const framesDir = path.join(sessionDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });
  const ext = path.extname(imagePath).toLowerCase() || '.png';
  const destName = `frame-01${ext}`;
  const destAbs = path.join(framesDir, destName);
  fs.copyFileSync(imagePath, destAbs);

  const dims = detectImageSize(destAbs);
  const ocrMap = runBatchOcr([destAbs], env);
  const ocr = ocrMap[destAbs] || { headerLines: [], bodyLines: [], footerLines: [], lines: [], fullText: '' };
  const cls = classifyScreenPage(ocr, 'frame', dims);
  const autoCompetitor =
    prevMeta?.competitor && prevMeta.competitor !== 'unassigned'
      ? prevMeta.competitor
      : guessCompetitor(path.basename(imagePath), ocr.fullText || '');

  const sessionData = {
    schemaV2: true,
    id: sessionId,
    title: cls.displayTitle,
    sourceFile: toRelPosix(imagePath),
    sourceHash: fileHash,
    capturedAt: stat.mtime.toISOString(),
    processedAt: new Date().toISOString(),
    durationSec: 0,
    competitor: autoCompetitor,
    module: cls.module,
    stitched: [],
    frames: [
      {
        id: 'frame-01',
        kind: 'frame',
        fileName: destName,
        imagePath: toRelPosix(destAbs),
        timestampSec: 0,
        timestampLabel: '截图',
        width: dims.width,
        height: dims.height,
        competitor: autoCompetitor,
        pageType: cls.pageType,
        pageTypeLabel: cls.pageTypeLabel,
        subTag: cls.subTag,
        module: cls.module,
        displayTitle: cls.displayTitle,
        highlights: cls.highlights,
        slug: cls.slug,
        mergedIntoLong: false,
        selected: true,
        note: '',
        headerLines: ocr.headerLines || [],
        footerLines: ocr.footerLines || [],
        ocrLines: ocr.lines || [],
        ocrText: ocr.fullText || '',
      },
    ],
    exportedFiles: prevMeta?.exportedFiles || [],
  };

  const draftMdPath = path.join(sessionDir, 'rules-draft.md');
  fs.writeFileSync(draftMdPath, buildRulesDraftMarkdown(sessionData), 'utf8');
  sessionData.rulesDraftPath = toRelPosix(draftMdPath);

  fs.writeFileSync(sessionJsonPath, `${JSON.stringify(sessionData, null, 2)}\n`, 'utf8');
  return { status: 'processed', sessionId, session: sessionData };
}

export function syncSessionsBundle() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
  const sessions = [];

  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
    const p = path.join(SESSIONS_DIR, ent.name, 'session.json');
    if (fs.existsSync(p)) {
      try {
        sessions.push(JSON.parse(fs.readFileSync(p, 'utf8')));
      } catch {
        // ignore broken dir
      }
    }
  }

  sessions.sort((a, b) => String(b.processedAt || '').localeCompare(String(a.processedAt || '')));

  const tagConfig = loadTagConfig();
  const subTagsByPageType = tagConfig.subTagsByPageType || {};

  // 自动展平为「一页一卡片」的直观页面墙列表（优先展示长图与未被长图吸收的独立帧）
  const pages = [];
  for (const s of sessions) {
    const items = [...(s.stitched || []), ...(s.frames || [])];
    for (const it of items) {
      const pageTypeObj = PAGE_TYPE_LIST.find((p) => p.id === it.pageType) || PAGE_TYPE_LIST[0];
      const subTag = (it.subTag || '').trim();
      if (subTag) {
        if (!subTagsByPageType[pageTypeObj.id]) subTagsByPageType[pageTypeObj.id] = [];
        if (!subTagsByPageType[pageTypeObj.id].includes(subTag)) {
          subTagsByPageType[pageTypeObj.id].push(subTag);
        }
      }
      pages.push({
        uid: `${s.id}__${it.id}`,
        sessionId: s.id,
        sessionTitle: s.title,
        capturedAt: s.capturedAt,
        processedAt: s.processedAt,
        id: it.id,
        kind: it.kind,
        imagePath: it.imagePath,
        width: it.width || 440,
        height: it.height || 956,
        timestampLabel: it.timestampLabel,
        competitor: it.competitor || s.competitor || 'unassigned',
        pageType: it.pageType || pageTypeObj.id,
        pageTypeLabel: it.pageTypeLabel || pageTypeObj.label,
        subTag,
        pageColor: pageTypeObj.color,
        module: it.module || pageTypeObj.module || s.module || 'voice-room',
        displayTitle: it.displayTitle || s.title,
        highlights: it.highlights || [],
        ocrText: it.ocrText || '',
        ocrLines: it.ocrLines || [],
        mergedIntoLong: Boolean(it.mergedIntoLong),
        note: it.note || '',
      });
    }
  }

  const bundle = {
    schemaVersion: '2.1',
    updatedAt: new Date().toISOString(),
    competitors: COMPETITOR_LIST.map(({ id, label }) => ({ id, label })),
    modules: MODULE_LIST,
    pageTypes: PAGE_TYPE_LIST,
    subTagsByPageType,
    pages,
    sessions,
  };

  const jsonPath = path.join(SESSIONS_DIR, 'sessions-data.json');
  const jsPath = path.join(SESSIONS_DIR, 'sessions-data.js');
  fs.writeFileSync(jsonPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    jsPath,
    `// Auto-generated by scripts/process-capture.mjs\nwindow.CAPTURE_SESSIONS = ${JSON.stringify(bundle, null, 2)};\n`,
    'utf8'
  );
  return bundle;
}

export function runPipeline({ force = false, syncOnly = false } = {}) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });

  if (syncOnly) {
    const bundle = syncSessionsBundle();
    return { processedCount: 0, skippedCount: 0, totalPages: bundle.pages.length, bundle };
  }

  const env = buildExecEnv();
  const files = fs
    .readdirSync(RECORDINGS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => path.join(RECORDINGS_DIR, e.name));

  let processedCount = 0;
  let skippedCount = 0;
  const processedIds = [];

  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase();
    let res = null;
    if (VIDEO_EXTS.has(ext)) {
      res = processSingleVideo(abs, force, env);
    } else if (IMAGE_EXTS.has(ext)) {
      res = processSingleImage(abs, force, env);
    }
    if (res) {
      if (res.status === 'processed') {
        processedCount += 1;
        processedIds.push(res.sessionId);
      } else {
        skippedCount += 1;
      }
    }
  }

  const bundle = syncSessionsBundle();
  return {
    processedCount,
    skippedCount,
    processedIds,
    totalPages: bundle.pages.length,
    bundle,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const force = process.argv.includes('--force');
  const syncOnly = process.argv.includes('--sync');
  const summary = runPipeline({ force, syncOnly });
  console.log(
    JSON.stringify(
      {
        ok: true,
        processedCount: summary.processedCount,
        skippedCount: summary.skippedCount,
        totalPages: summary.totalPages,
      },
      null,
      2
    )
  );
}
