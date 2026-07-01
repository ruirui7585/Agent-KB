import db from '../db.js';
import { ok, sendError } from '../utils/response.js';
import { calcBMR, calcTDEE } from '../services/tdee.js';
import { getBaselineExpenditure } from '../utils/profile-helper.js';
import { randomUUID } from 'node:crypto';
import { normalizeRecordInput } from '../utils/record.js';

function localDateTime() {
  const timeZone = process.env.APP_TIME_ZONE || 'Asia/Shanghai';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function getTDEE() {
  const rows = db.prepare('SELECT key, value FROM profile').all();
  const p = {};
  for (const r of rows) p[r.key] = r.value;
  if (!p.gender || !p.height_cm || !p.weight_kg || !p.age) return null;
  const bmr = calcBMR(p.gender, parseFloat(p.height_cm), parseFloat(p.weight_kg), parseInt(p.age));
  return calcTDEE(bmr, p.activity_level || 'sedentary');
}

function getGoal() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'daily_cal_goal'").get();
  return row ? parseInt(row.value, 10) : (getTDEE() || 2000);
}

export default async function recordsRoutes(app) {
  app.post('/', async (req, reply) => {
    const record = normalizeRecordInput(req.body);
    if (!record.meal_type) return sendError(reply, 400, '请选择有效餐别');
    if (!record.foods.length) return sendError(reply, 400, '请至少保留一项有效食物');
    if (record.total_calories <= 0 || record.total_calories > 20000) {
      return sendError(reply, 400, '总热量必须在 1–20000 kcal 之间');
    }

    const id = randomUUID();
    const { date, time } = localDateTime();
    db.prepare(`INSERT INTO records
      (id, date, time, meal_type, foods_json, total_cal, image_path, source)
      VALUES (?, ?, ?, ?, ?, ?, NULL, 'vision')`)
      .run(id, date, time, record.meal_type, JSON.stringify(record.foods), record.total_calories);

    return reply.status(201).send({
      id,
      date,
      time,
      meal_type: record.meal_type,
      foods: record.foods,
      total_calories: record.total_calories,
      source: 'vision',
    });
  });

  app.get('/', async (req, reply) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const rows = db.prepare(`SELECT id, date, time, meal_type, foods_json, total_cal, source
      FROM records WHERE date = ? ORDER BY time ASC`).all(date);

    const meals = { breakfast: [], lunch: [], dinner: [], snack: [] };
    let dayTotal = 0;

    for (const row of rows) {
      const foods = JSON.parse(row.foods_json);
      const { foods_json: _foodsJson, ...publicRow } = row;
      meals[row.meal_type].push({ ...publicRow, foods });
      dayTotal += row.total_cal;
    }

    const tdee = getTDEE();
    const goal = getGoal();
    const exercises = db.prepare(`SELECT id, date, time, exercise_type, duration_minutes,
      intensity, calories, note FROM exercises WHERE date = ? ORDER BY time ASC`).all(date);
    const exerciseTotal = Math.round(exercises.reduce((sum, item) => sum + item.calories, 0));
    const baselineExpenditure = getBaselineExpenditure();
    const totalExpenditure = baselineExpenditure + exerciseTotal;

    return ok(reply, {
      date,
      meals,
      day_total: Math.round(dayTotal),
      goal,
      remaining: Math.round(goal - dayTotal),
      tdee,
      exercises,
      exercise_total: exerciseTotal,
      baseline_expenditure: baselineExpenditure,
      total_expenditure: totalExpenditure,
      calorie_delta: Math.round(dayTotal - totalExpenditure),
    });
  });

  app.delete('/:id', async (req, reply) => {
    db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);
    return ok(reply, { id: req.params.id });
  });
}
