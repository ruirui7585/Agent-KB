import { randomUUID } from 'node:crypto';
import db from '../db.js';
import { ok, sendError } from '../utils/response.js';
import { getProfileMap } from '../utils/profile-helper.js';
import { normalizeExerciseInput } from '../services/exercise.js';

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

export default async function exerciseRoutes(app) {
  app.post('/', async (req, reply) => {
    const profile = getProfileMap();
    const exercise = normalizeExerciseInput(req.body, Number(profile.weight_kg) || 70);
    if (!exercise.exercise_type) return sendError(reply, 400, '请选择运动类型');
    if (exercise.duration_minutes < 1 || exercise.duration_minutes > 600) {
      return sendError(reply, 400, '运动时长必须在 1–600 分钟之间');
    }
    if (exercise.calories < 1 || exercise.calories > 10000) {
      return sendError(reply, 400, '运动消耗必须在 1–10000 kcal 之间');
    }

    const id = randomUUID();
    const { date, time } = localDateTime();
    db.prepare(`INSERT INTO exercises
      (id, date, time, exercise_type, duration_minutes, intensity, calories, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, date, time, exercise.exercise_type, exercise.duration_minutes,
        exercise.intensity, exercise.calories, exercise.note || null);

    return reply.status(201).send({ id, date, time, ...exercise });
  });

  app.get('/', async (req, reply) => {
    const date = req.query.date || localDateTime().date;
    const exercises = db.prepare(`SELECT id, date, time, exercise_type, duration_minutes,
      intensity, calories, note FROM exercises WHERE date = ? ORDER BY time ASC`).all(date);
    return ok(reply, {
      date,
      exercises,
      total_calories: Math.round(exercises.reduce((sum, item) => sum + item.calories, 0)),
    });
  });

  app.delete('/:id', async (req, reply) => {
    db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
    return ok(reply, { id: req.params.id });
  });
}
