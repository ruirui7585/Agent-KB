#!/usr/bin/env node
/**
 * pm-kb.md 双向解析/写回与 kb-data.js 同步模块。
 * 支持 5 种可视化卡片：flow / contrast / flashcard / demo / todo。
 * 支持主题标签 tags 与学习进度 status (to-learn / reviewing / mastered)。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MD_PATH = path.join(__dirname, 'pm-kb.md');
export const OUT_PATH = path.join(__dirname, 'kb-data.js');

export const LIMITS = {
  hook: 20,
  stepText: 22,
  contrastSide: 32,
  flashcardPlain: 45,
  demoSummary: 42,
};

const HEADER_COMMENT = `# PM 个人成长知识库

> 跨项目唯一事实源（Single Source of Truth）。
> 支持在本地页面 \`http://127.0.0.1:4321\` 直接新增/编辑（0.5 秒自动保存并自动同步云端只读页），或在 Agent 对话中以 A 模式回 \`1\` 自动入库。`;

export function parseFlowActions(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      if (token.includes('<->')) {
        const [from, to] = token.split('<->').map((s) => s.trim());
        return { kind: 'both', from, to };
      }
      if (token.includes('-x-')) {
        const [from, to] = token.split('-x-').map((s) => s.trim());
        return { kind: 'cut', from, to };
      }
      if (token.includes('->')) {
        const [from, to] = token.split('->').map((s) => s.trim());
        return { kind: 'arrow', from, to };
      }
      if (token.endsWith('*')) {
        return { kind: 'pulse', node: token.slice(0, -1).trim() };
      }
      return { kind: 'pulse', node: token };
    });
}

export function serializeFlowActions(actions) {
  if (typeof actions === 'string') return actions.trim();
  if (!Array.isArray(actions)) return '';
  return actions
    .map((a) => {
      if (!a) return '';
      if (a.kind === 'both') return `${a.from}<->${a.to}`;
      if (a.kind === 'cut') return `${a.from}-x-${a.to}`;
      if (a.kind === 'arrow') return `${a.from}->${a.to}`;
      if (a.kind === 'pulse') return `${a.node}*`;
      return '';
    })
    .filter(Boolean)
    .join(', ');
}

function parseTags(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s || '').trim()).filter(Boolean);
  }
  return String(raw || '')
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseMarkdown(md) {
  const blocks = String(md || '')
    .split(/\n---\s*\n/)
    .map((b) => b.trim())
    .filter((b) => /^##\s+\[/.test(b));

  const cards = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const headMatch = lines[0].match(/^##\s+\[([^\]]+)\]\s+(.+)$/);
    if (!headMatch) continue;

    const card = {
      id: headMatch[1].trim(),
      title: headMatch[2].trim(),
      bucket: 'reinforce',
      type: 'flashcard',
      status: 'reviewing',
      project: '通用',
      tags: [],
      source: '',
      date: '',
      hook: '',
    };

    let section = null;
    const sectionLines = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const secMatch = line.match(/^###\s+([a-zA-Z0-9_-]+)$/);
      if (secMatch) {
        section = secMatch[1].toLowerCase();
        sectionLines[section] = [];
        continue;
      }

      if (!section) {
        const metaMatch = line.match(/^-\s+([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (metaMatch) {
          const key = metaMatch[1].toLowerCase();
          const val = metaMatch[2].trim();
          if (key === 'tags') {
            card.tags = parseTags(val);
          } else {
            card[key] = val;
          }
        }
      } else {
        sectionLines[section].push(line);
      }
    }

    if (sectionLines.nodes) {
      card.nodes = sectionLines.nodes
        .map((l) => l.replace(/^-\s+/, '').split('|').map((s) => s.trim()))
        .filter((p) => p.length >= 3)
        .map(([id, icon, label]) => ({ id, icon, label }));
    }

    if (sectionLines.steps) {
      card.steps = sectionLines.steps
        .map((l) => l.replace(/^\d+\.\s+/, '').split('|').map((s) => s.trim()))
        .filter((p) => p.length >= 3)
        .map(([title, actionsRaw, text]) => ({
          title,
          actionsRaw,
          actions: parseFlowActions(actionsRaw),
          text,
        }));
    }

    if (sectionLines.glossary) {
      card.glossary = sectionLines.glossary
        .map((l) => l.replace(/^-\s+/, '').split('|').map((s) => s.trim()))
        .filter((p) => p.length >= 2)
        .map(([term, plain]) => ({ term, plain }));
    }

    if (sectionLines.tips) {
      card.tips = sectionLines.tips.map((l) => l.replace(/^-\s+/, '').trim()).filter(Boolean);
    }

    if (sectionLines.scenes) {
      card.scenes = sectionLines.scenes.map((l) => l.replace(/^-\s+/, '').trim()).filter(Boolean);
    }

    for (const textField of ['wrong', 'right', 'rule', 'plain', 'context', 'summary']) {
      if (sectionLines[textField]) {
        card[textField] = sectionLines[textField].join(' ').trim();
      }
    }

    cards.push(card);
  }

  return cards;
}

function cleanLine(str) {
  return String(str || '').replace(/\r?\n+/g, ' ').trim();
}

export function normalizeCard(input) {
  const type = ['flow', 'contrast', 'flashcard', 'demo', 'todo'].includes(input.type) ? input.type : 'flashcard';
  const defaultBucket = type === 'contrast' ? 'blindspots' : type === 'todo' ? 'to-learn' : 'reinforce';
  const bucket = ['blindspots', 'reinforce', 'to-learn'].includes(input.bucket) ? input.bucket : defaultBucket;
  const defaultStatus = bucket === 'to-learn' ? 'to-learn' : 'reviewing';
  const status = ['reviewing', 'mastered', 'to-learn'].includes(input.status) ? input.status : defaultStatus;

  const card = {
    id: cleanLine(input.id),
    title: cleanLine(input.title) || '未命名卡片',
    bucket,
    type,
    status,
    project: cleanLine(input.project) || '通用',
    tags: parseTags(input.tags),
    source: cleanLine(input.source),
    date: cleanLine(input.date) || new Date().toISOString().slice(0, 10),
    hook: cleanLine(input.hook),
  };

  if (type === 'demo') {
    if (cleanLine(input.demo)) card.demo = cleanLine(input.demo);
    if (cleanLine(input.summary)) card.summary = cleanLine(input.summary);
    if (cleanLine(input.rule)) card.rule = cleanLine(input.rule);
  } else if (type === 'flow') {
    card.nodes = Array.isArray(input.nodes)
      ? input.nodes
          .filter((n) => n && cleanLine(n.id) && cleanLine(n.label))
          .map((n) => ({ id: cleanLine(n.id), icon: cleanLine(n.icon) || '🔹', label: cleanLine(n.label) }))
      : [];
    card.steps = Array.isArray(input.steps)
      ? input.steps
          .filter((s) => s && (cleanLine(s.title) || cleanLine(s.text)))
          .map((s) => {
            const actionsRaw = cleanLine(s.actionsRaw) || serializeFlowActions(s.actions);
            return {
              title: cleanLine(s.title) || '步骤',
              actionsRaw,
              actions: parseFlowActions(actionsRaw),
              text: cleanLine(s.text),
            };
          })
      : [];
  } else if (type === 'contrast') {
    card.wrong = cleanLine(input.wrong);
    card.right = cleanLine(input.right);
    if (cleanLine(input.rule)) card.rule = cleanLine(input.rule);
  } else if (type === 'flashcard') {
    card.plain = cleanLine(input.plain);
    const scenes = Array.isArray(input.scenes)
      ? input.scenes.map(cleanLine).filter(Boolean)
      : [];
    if (scenes.length > 0) card.scenes = scenes;
  } else if (type === 'todo') {
    if (cleanLine(input.context)) card.context = cleanLine(input.context);
  }

  if (Array.isArray(input.glossary)) {
    const g = input.glossary
      .filter((x) => x && cleanLine(x.term) && cleanLine(x.plain))
      .map((x) => ({ term: cleanLine(x.term), plain: cleanLine(x.plain) }));
    if (g.length > 0) card.glossary = g;
  }

  if (Array.isArray(input.tips)) {
    const t = input.tips.map(cleanLine).filter(Boolean);
    if (t.length > 0) card.tips = t;
  }

  return card;
}

export function serializeMarkdown(cards) {
  const sections = [HEADER_COMMENT];

  for (const rawCard of cards) {
    const c = normalizeCard(rawCard);
    const lines = [
      `## [${c.id}] ${c.title}`,
      `- bucket: ${c.bucket}`,
      `- type: ${c.type}`,
      `- status: ${c.status}`,
      `- project: ${c.project}`,
    ];
    if (c.tags && c.tags.length > 0) lines.push(`- tags: ${c.tags.join(', ')}`);
    if (c.demo) lines.push(`- demo: ${c.demo}`);
    if (c.source) lines.push(`- source: ${c.source}`);
    if (c.date) lines.push(`- date: ${c.date}`);
    if (c.hook) lines.push(`- hook: ${c.hook}`);

    if (c.type === 'demo') {
      if (c.summary) lines.push('', '### summary', c.summary);
      if (c.rule) lines.push('', '### rule', c.rule);
    } else if (c.type === 'flow') {
      if (c.nodes && c.nodes.length > 0) {
        lines.push('', '### nodes');
        c.nodes.forEach((n) => lines.push(`- ${n.id} | ${n.icon} | ${n.label}`));
      }
      if (c.steps && c.steps.length > 0) {
        lines.push('', '### steps');
        c.steps.forEach((s, i) => {
          const actStr = s.actionsRaw || serializeFlowActions(s.actions);
          lines.push(`${i + 1}. ${s.title} | ${actStr} | ${s.text}`);
        });
      }
    } else if (c.type === 'contrast') {
      if (c.wrong) lines.push('', '### wrong', c.wrong);
      if (c.right) lines.push('', '### right', c.right);
      if (c.rule) lines.push('', '### rule', c.rule);
    } else if (c.type === 'flashcard') {
      if (c.plain) lines.push('', '### plain', c.plain);
      if (c.scenes && c.scenes.length > 0) {
        lines.push('', '### scenes');
        c.scenes.forEach((s) => lines.push(`- ${s}`));
      }
    } else if (c.type === 'todo') {
      if (c.context) lines.push('', '### context', c.context);
    }

    if (c.glossary && c.glossary.length > 0) {
      lines.push('', '### glossary');
      c.glossary.forEach((g) => lines.push(`- ${g.term} | ${g.plain}`));
    }
    if (c.tips && c.tips.length > 0) {
      lines.push('', '### tips');
      c.tips.forEach((t) => lines.push(`- ${t}`));
    }

    sections.push(lines.join('\n'));
  }

  return sections.join('\n\n---\n\n') + '\n';
}

export function validateReadability(cards) {
  const warnings = [];
  for (const c of cards) {
    if (c.hook && c.hook.length > LIMITS.hook) {
      warnings.push(`[${c.id}] hook 超出 ${LIMITS.hook} 字 (${c.hook.length} 字): "${c.hook}"`);
    }
    if (c.type === 'flow' && Array.isArray(c.steps)) {
      c.steps.forEach((s, idx) => {
        if ((s.text || '').length > LIMITS.stepText) {
          warnings.push(`[${c.id}] Step ${idx + 1} 超出 ${LIMITS.stepText} 字 (${s.text.length} 字): "${s.text}"`);
        }
      });
    }
    if (c.type === 'contrast') {
      if (c.wrong && c.wrong.length > LIMITS.contrastSide) {
        warnings.push(`[${c.id}] wrong 超出 ${LIMITS.contrastSide} 字 (${c.wrong.length} 字)`);
      }
      if (c.right && c.right.length > LIMITS.contrastSide) {
        warnings.push(`[${c.id}] right 超出 ${LIMITS.contrastSide} 字 (${c.right.length} 字)`);
      }
    }
    if (c.type === 'flashcard' && c.plain && c.plain.length > LIMITS.flashcardPlain) {
      warnings.push(`[${c.id}] plain 超出 ${LIMITS.flashcardPlain} 字 (${c.plain.length} 字)`);
    }
    if (c.type === 'demo' && c.summary && c.summary.length > LIMITS.demoSummary) {
      warnings.push(`[${c.id}] summary 超出 ${LIMITS.demoSummary} 字 (${c.summary.length} 字)`);
    }
  }
  return warnings;
}

export function loadCardsFromDisk() {
  const raw = fs.readFileSync(MD_PATH, 'utf8');
  return parseMarkdown(raw);
}

export function writeKbDataJs(cards) {
  const payload = {
    sourceFile: 'pm-kb.md',
    cards,
  };
  const jsOut = `// Auto-generated from pm-kb.md by sync-kb.mjs. Do not edit manually.\nwindow.PM_KB_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  let prev = '';
  try { prev = fs.readFileSync(OUT_PATH, 'utf8'); } catch {}
  if (prev !== jsOut) {
    fs.writeFileSync(OUT_PATH, jsOut, 'utf8');
  }
  return payload;
}

export function saveCardsToDisk(cards) {
  const normalized = cards.map(normalizeCard);
  const mdOut = serializeMarkdown(normalized);
  fs.writeFileSync(MD_PATH, mdOut, 'utf8');
  const payload = writeKbDataJs(normalized);
  const warnings = validateReadability(normalized);
  return { cards: normalized, payload, warnings };
}

export function syncDataFile() {
  const cards = loadCardsFromDisk();
  const payload = writeKbDataJs(cards);
  const warnings = validateReadability(cards);
  return { cards, payload, warnings };
}

export function nextCardId(cards) {
  let maxNum = 0;
  for (const c of cards) {
    const m = String(c.id || '').match(/^KB-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, Number(m[1]));
  }
  return `KB-${String(maxNum + 1).padStart(3, '0')}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { cards, warnings } = syncDataFile();
  console.log(`Synced ${cards.length} cards -> ${path.basename(OUT_PATH)}`);
  if (warnings.length > 0) {
    console.warn('Readability warnings:');
    warnings.forEach((w) => console.warn('  - ' + w));
  } else {
    console.log('Readability check: PASS (all cards within brevity limits).');
  }
}
