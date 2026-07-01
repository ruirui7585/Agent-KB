import db from '../db.js';
import { ok, sendError } from '../utils/response.js';
import { calcBMR, calcTDEE } from '../services/tdee.js';
import { getBaselineExpenditure } from '../utils/profile-helper.js';

export default async function profileRoutes(app) {
  app.get('/', async (_req, reply) => {
    const rows = db.prepare('SELECT key, value FROM profile').all();
    const p = {};
    for (const r of rows) p[r.key] = r.value;

    if (p.gender && p.height_cm && p.weight_kg && p.age) {
      const bmr = calcBMR(p.gender, parseFloat(p.height_cm), parseFloat(p.weight_kg), parseInt(p.age));
      const tdee = calcTDEE(bmr, p.activity_level || 'sedentary');
      const manualBaseline = Number.parseInt(p.baseline_expenditure_override, 10);
      const baselineIsManual = Number.isFinite(manualBaseline)
        && manualBaseline >= 500
        && manualBaseline <= 5000;
      const goal = db.prepare("SELECT value FROM settings WHERE key = 'daily_cal_goal'").get();
      p.tdee = tdee;
      p.bmr = bmr;
      p.baseline_expenditure = getBaselineExpenditure();
      p.baseline_expenditure_is_manual = baselineIsManual;
      p.daily_cal_goal = goal ? parseInt(goal.value, 10) : tdee;
      delete p.baseline_expenditure_override;
    }

    return ok(reply, p);
  });

  app.put('/', async (req, reply) => {
    const {
      gender,
      height_cm,
      weight_kg,
      age,
      body_fat_pct,
      activity_level,
      baseline_expenditure,
    } = req.body;

    if (!gender || !height_cm || !weight_kg || !age) {
      return sendError(reply, 400, '请填写所有必填字段：性别、身高、体重、年龄');
    }
    const manualBaseline = baseline_expenditure === null || baseline_expenditure === ''
      ? null
      : Number.parseInt(baseline_expenditure, 10);
    if (manualBaseline !== null
      && (!Number.isFinite(manualBaseline) || manualBaseline < 500 || manualBaseline > 5000)) {
      return sendError(reply, 400, '基础消耗必须在 500–5000 kcal 之间');
    }
    const bodyFatPct = body_fat_pct === null || body_fat_pct === ''
      ? null
      : Number.parseFloat(body_fat_pct);
    if (bodyFatPct !== null
      && (!Number.isFinite(bodyFatPct) || bodyFatPct < 3 || bodyFatPct > 60)) {
      return sendError(reply, 400, '体脂率必须在 3%–60% 之间');
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)');
    const batch = db.transaction(() => {
      stmt.run('gender', gender);
      stmt.run('height_cm', String(height_cm));
      stmt.run('weight_kg', String(weight_kg));
      stmt.run('age', String(age));
      stmt.run('activity_level', activity_level || 'sedentary');
      if (bodyFatPct === null) {
        db.prepare("DELETE FROM profile WHERE key = 'body_fat_pct'").run();
      } else {
        stmt.run('body_fat_pct', String(Math.round(bodyFatPct * 10) / 10));
      }
      if (manualBaseline === null) {
        db.prepare("DELETE FROM profile WHERE key = 'baseline_expenditure_override'").run();
      } else {
        stmt.run('baseline_expenditure_override', String(manualBaseline));
      }
    });
    batch();

    const bmr = calcBMR(gender, parseFloat(height_cm), parseFloat(weight_kg), parseInt(age));
    const tdee = calcTDEE(bmr, activity_level || 'sedentary');
    const baselineExpenditure = manualBaseline ?? calcTDEE(bmr, 'sedentary');

    const existingGoal = db.prepare("SELECT value FROM settings WHERE key = 'daily_cal_goal'").get();
    if (!existingGoal) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('daily_cal_goal', ?)").run(String(tdee));
    }

    return ok(reply, {
      bmr,
      tdee,
      baseline_expenditure: baselineExpenditure,
      baseline_expenditure_is_manual: manualBaseline !== null,
      body_fat_pct: bodyFatPct,
      daily_cal_goal: existingGoal ? parseInt(existingGoal.value, 10) : tdee,
    });
  });
}
