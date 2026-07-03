import db from '../db.js';
import { ok } from '../utils/response.js';
import {
  normalizeSettingsUpdates,
  parseSettingsRows,
  SETTING_KEYS,
} from '../utils/settings.js';

export default async function settingsRoutes(app) {
  app.get('/', async (_req, reply) => {
    const placeholders = SETTING_KEYS.map(() => '?').join(', ');
    const rows = db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`).all(...SETTING_KEYS);
    const settings = parseSettingsRows(rows);
    settings.has_bailian_key = !!process.env.DASHSCOPE_API_KEY;
    settings.bailian_model = process.env.BAILIAN_PRIMARY_MODEL || 'qwen3.7-plus';
    return ok(reply, settings);
  });

  app.put('/', async (req, reply) => {
    const updates = req.body || {};
    let allowedUpdates;
    try {
      allowedUpdates = normalizeSettingsUpdates(updates);
    } catch (error) {
      return reply.status(error.statusCode || 400).send({ error: error.message });
    }

    if (!Object.keys(allowedUpdates).length) {
      return reply.status(400).send({ error: '没有可更新的设置项' });
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const batch = db.transaction(() => {
      for (const [key, value] of Object.entries(allowedUpdates)) {
        stmt.run(key, value);
      }
    });
    batch();

    const savedSettings = Object.fromEntries(
      Object.entries(allowedUpdates).map(([key, value]) => [key, Number.parseInt(value, 10)]),
    );
    return ok(reply, {
      updated: Object.keys(allowedUpdates),
      ...savedSettings,
    });
  });
}
