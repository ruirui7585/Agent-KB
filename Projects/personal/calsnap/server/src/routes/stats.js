import db from '../db.js';
import { ok } from '../utils/response.js';
import { getBaselineExpenditure, getGoal, getTDEE } from '../utils/profile-helper.js';
import { normalizeStatsRange } from '../utils/stats.js';

export default async function statsRoutes(app) {
  app.get('/', async (req, reply) => {
    const days = normalizeStatsRange(req.query.range);
    const goal = getGoal();
    const tdee = getTDEE();
    const baseline = getBaselineExpenditure();

    const rows = db.prepare(`
      WITH RECURSIVE days(date) AS (
        SELECT date('now', 'localtime', ?)
        UNION ALL
        SELECT date(date, '+1 day') FROM days WHERE date < date('now', 'localtime')
      ),
      intake AS (SELECT date, SUM(total_cal) total FROM records GROUP BY date),
      burn AS (SELECT date, SUM(calories) total FROM exercises GROUP BY date)
      SELECT days.date,
        COALESCE(intake.total, 0) intake,
        COALESCE(burn.total, 0) exercise
      FROM days
      LEFT JOIN intake ON intake.date = days.date
      LEFT JOIN burn ON burn.date = days.date
      ORDER BY days.date ASC
    `).all(`-${Math.max(days - 1, 0)} days`);

    const daily = [];
    let sum = 0, count = 0, overGoalDays = 0;

    for (const row of rows) {
      const intake = Math.round(row.intake);
      const exercise = Math.round(row.exercise);
      const expenditure = baseline + exercise;
      const hasData = intake > 0 || exercise > 0;
      const balance = hasData ? intake - expenditure : 0;
      daily.push({
        date: row.date,
        total: intake,
        intake,
        exercise,
        baseline,
        expenditure,
        balance,
        goal,
        has_data: hasData,
      });
      if (hasData) {
        sum += intake;
        count++;
        if (balance > 0) overGoalDays++;
      }
    }

    return ok(reply, {
      daily,
      avg_cal: count ? Math.round(sum / count) : 0,
      over_goal_days: overGoalDays,
      goal,
      tdee,
      baseline_expenditure: baseline,
    });
  });
}
