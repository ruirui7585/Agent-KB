function formatSignedNumber(value, digits = 1) {
  const number = Number(value) || 0;
  const normalized = Math.abs(number) < (1 / (10 ** digits)) / 2 ? 0 : number;
  return `${normalized > 0 ? '+' : ''}${normalized.toFixed(digits)}`;
}

function summarizeDailyNutrition(meals = {}) {
  const totals = { protein_g: 0, carbs_g: 0, fat_g: 0 };
  Object.values(meals).flat().forEach((record) => {
    (record.foods || []).forEach((food) => {
      totals.protein_g += Number(food.protein_g) || 0;
      totals.carbs_g += Number(food.carbs_g) || 0;
      totals.fat_g += Number(food.fat_g) || 0;
    });
  });
  return totals;
}

function formatMacroValue(value) {
  const number = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function renderMacroProgress(label, key, value, goal) {
  const safeGoal = Math.max(Number(goal) || 0, 1);
  const percentage = Math.min(Math.round((value / safeGoal) * 100), 100);
  return `
    <div class="daily-macro-row ${key} ${value > safeGoal ? 'over' : ''}">
      <span>${label}</span>
      <div class="daily-macro-track" aria-label="${label}完成 ${percentage}%">
        <i style="width:${percentage}%"></i>
      </div>
      <b>${formatMacroValue(value)}<em>/${formatMacroValue(safeGoal)}g</em></b>
    </div>`;
}

function renderWellnessCards(projection, nutrition, goals) {
  const isDeficit = projection.calorie_delta <= 0;
  const isBalanced = projection.calorie_delta === 0;
  const tone = isBalanced ? 'balanced' : (isDeficit ? 'deficit' : 'surplus');
  const action = isBalanced ? '脂肪等价' : (isDeficit ? '脂肪消耗等价' : '脂肪储存等价');
  const energyAction = isBalanced ? '能量收支接近平衡' : `${isDeficit ? '缺口' : '盈余'} ${fmtCal(Math.abs(projection.calorie_delta))} kcal`;
  const bodyFat = projection.body_fat;

  return `
    <section class="wellness-grid" aria-label="身体与营养概览">
      <article class="wellness-card current-data-card ${tone}" aria-label="当前身体数据">
        <div class="wellness-card-head">
          <div><h2>当前数据</h2><small>热量差与身体趋势</small></div>
          <span>${isBalanced ? '平衡' : (isDeficit ? '缺口' : '盈余')}</span>
        </div>
        <div class="current-fat-value">
          <small>今日${action}</small>
          <strong>${formatSignedNumber(projection.fat_change.today_kg, 2)}<em>kg</em></strong>
          <p>≈ ${energyAction}</p>
        </div>
        <div class="current-data-list">
          <div><span>7天脂肪等价</span><b>${formatSignedNumber(projection.fat_change.week_kg, 2)}kg</b></div>
          ${projection.available ? `
            <div><span>${projection.method === 'provided_body_fat' ? '当前体脂' : '估算体脂'}</span><b>${bodyFat.current_pct.toFixed(1)}%</b></div>
            <div><span>7天预计体脂</span><b class="${bodyFat.week_change_pct <= 0 ? 'improving' : 'rising'}">${bodyFat.week_pct.toFixed(1)}%</b></div>
          ` : `
            <div><span>当前体脂</span><b>--</b></div>
            <button type="button" onclick="navigate('settings')"><span>完善资料</span><b>去设置 ›</b></button>
          `}
        </div>
      </article>

      <article class="wellness-card daily-nutrition-card" aria-label="今日三大营养素摄入">
        <div class="wellness-card-head">
          <div><h2>营养摄入</h2><small>今日摄入 / 每日目标</small></div>
          <span>今日</span>
        </div>
        <div class="daily-macro-list">
          ${renderMacroProgress('蛋白质', 'protein', nutrition.protein_g, goals.protein)}
          ${renderMacroProgress('碳水', 'carbs', nutrition.carbs_g, goals.carbs)}
          ${renderMacroProgress('脂肪', 'fat', nutrition.fat_g, goals.fat)}
        </div>
        <button type="button" class="nutrition-goal-link" onclick="navigate('settings')">
          调整每日目标 <b>›</b>
        </button>
      </article>
    </section>`;
}

async function renderDashboard() {
  showLoader('首页加载中...');

  try {
    const today = fmtDate();
    const [data, profile, settings] = await Promise.all([
      API.getRecords(today),
      API.getProfile().catch(() => ({})),
      API.getSettings().catch(() => ({
        daily_protein_goal: 80,
        daily_carbs_goal: 180,
        daily_fat_goal: 45,
      })),
    ]);
    const balance = fmtCal(data.calorie_delta);
    const deficit = balance <= 0;
    const intakePct = Math.min(fmtPct(data.day_total, data.goal), 100);
    const bodyProjection = BodyComposition.buildProjection(data.calorie_delta, profile);
    const dailyNutrition = summarizeDailyNutrition(data.meals);
    const nutritionGoals = {
      protein: Number(settings.daily_protein_goal) || 80,
      carbs: Number(settings.daily_carbs_goal) || 180,
      fat: Number(settings.daily_fat_goal) || 45,
    };

    const mealRows = ['breakfast', 'lunch', 'dinner', 'snack'].map((key) => {
      const items = data.meals[key] || [];
      const calories = items.reduce((sum, item) => sum + item.total_cal, 0);
      const names = items.flatMap((item) => item.foods || []).map((food) => food.name).slice(0, 3);
      return `
        <button class="record-row" data-meal="${key}">
          <span class="row-icon meal-${key}">${CONFIG.MEAL_EMOJI[key]}</span>
          <span class="row-main"><b>${CONFIG.MEAL_LABELS[key]}</b><small>${names.length ? names.join('、') : '还没有记录'}</small></span>
          <span class="row-value">${calories ? `${fmtCal(calories)} kcal` : '+'}</span>
        </button>`;
    }).join('');

    const exerciseRows = (data.exercises || []).map((item) => `
      <div class="record-row">
        <span class="row-icon exercise-icon">${CONFIG.EXERCISE_EMOJI[item.exercise_type] || '⚡'}</span>
        <span class="row-main"><b>${CONFIG.EXERCISE_LABELS[item.exercise_type] || '运动'}</b><small>${item.duration_minutes} 分钟 · ${item.time}</small></span>
        <span class="row-value burn">-${fmtCal(item.calories)} kcal</span>
      </div>`).join('');

    document.getElementById('content').innerHTML = `
      <header class="home-header">
        <div>
          <svg class="brand-lockup" viewBox="160 690 940 210" role="img" aria-label="Foodmind">
            <image href="assets/foodmind-logo.png" x="0" y="0" width="1254" height="1254"></image>
          </svg>
        </div>
        <button class="avatar-button" onclick="navigate('settings')" aria-label="我的">☺</button>
      </header>
      <section class="greeting">
        <h1>早上好，今天也要照顾好自己 <span>☀️</span></h1>
        <p>${fmtDateDisplay(today)}</p>
      </section>

      <section class="hero-card">
        <div class="hero-copy">
          <span>今日热量差</span>
          <strong class="${deficit ? 'deficit' : 'surplus'}">${balance > 0 ? '+' : ''}${balance}<em> kcal</em></strong>
          <small>${deficit ? '保持热量缺口中 ✨' : '今日摄入已超过消耗'}</small>
        </div>
        <div class="progress-ring" style="--ring:${intakePct * 3.6}deg">
          <div><small>还可摄入</small><b>${Math.max(data.goal - data.day_total + data.exercise_total, 0)}</b><small>kcal</small></div>
        </div>
      </section>

      <section class="metric-grid">
        <div class="metric-card intake"><span>●</span><small>摄入</small><b>${fmtCal(data.day_total)}</b><em>kcal</em></div>
        <div class="metric-card exercise"><span>●</span><small>运动消耗</small><b>${fmtCal(data.exercise_total)}</b><em>kcal</em></div>
        <div class="metric-card baseline"><span>●</span><small>基础消耗</small><b>${fmtCal(data.baseline_expenditure)}</b><em>kcal</em></div>
      </section>

      ${renderWellnessCards(bodyProjection, dailyNutrition, nutritionGoals)}

      <section class="section-block">
        <div class="section-title"><h2>今日记录</h2><button onclick="navigate('history')">详情 ›</button></div>
        <div class="records-card">${mealRows}</div>
      </section>

      <section class="section-block">
        <div class="section-title"><h2>运动记录</h2><button onclick="navigate('exercise')">+ 添加</button></div>
        <div class="records-card">
          ${exerciseRows || `<button class="empty-action" onclick="navigate('exercise')"><span>🏃</span><div><b>记录一次运动</b><small>运动消耗会计入今日热量差</small></div><i>›</i></button>`}
        </div>
      </section>

      <section class="insight-card">
        <span>✦</span><div><b>今日建议</b><p>${deficit ? '当前热量差表现不错，记得保证蛋白质与水分摄入。' : '可以安排一次轻度运动，让今日能量重新回到平衡。'}</p></div>
      </section>
    `;

    document.querySelectorAll('[data-meal]').forEach((button) => {
      button.onclick = () => navigate('camera');
    });
  } catch (err) {
    document.getElementById('content').innerHTML = `
      <div class="page-header"><h1>Foodmind</h1></div>
      <div class="card error-card"><p>首页加载失败：${esc(err.message || '请检查服务器')}</p>
      <button class="btn btn-outline btn-block" onclick="navigate('dashboard')">重新加载</button></div>`;
  }
}
