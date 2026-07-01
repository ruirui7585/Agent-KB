import db from '../db.js';
import { ok } from '../utils/response.js';

export default async function settingsRoutes(app) {
  app.get('/', async (_req, reply) => {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('daily_cal_goal')").all();
    const settings = {};
    for (const row of rows) settings[row.key] = row.value;
    settings.has_bailian_key = !!process.env.DASHSCOPE_API_KEY;
    settings.bailian_model = process.env.BAILIAN_PRIMARY_MODEL || 'qwen3.7-plus';
    return ok(reply, settings);
  });

  app.put('/', async (req, reply) => {
    const updates = req.body || {};
    const allowedUpdates = {};
    if (Object.hasOwn(updates, 'daily_cal_goal')) {
      const goal = Number.parseInt(updates.daily_cal_goal, 10);
      if (!Number.isFinite(goal) || goal < 500 || goal > 10000) {
        return reply.status(400).send({ error: '热量目标必须在 500–10000 kcal 之间' });
      }
      allowedUpdates.daily_cal_goal = String(goal);
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
    return ok(reply, {
      updated: Object.keys(allowedUpdates),
      daily_cal_goal: allowedUpdates.daily_cal_goal
        ? parseInt(allowedUpdates.daily_cal_goal, 10)
        : undefined,
    });
  });
}
