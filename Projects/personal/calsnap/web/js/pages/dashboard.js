function formatSignedNumber(value, digits = 1) {
  const number = Number(value) || 0;
  const normalized = Math.abs(number) < (1 / (10 ** digits)) / 2 ? 0 : number;
  return `${normalized > 0 ? '+' : ''}${normalized.toFixed(digits)}`;
}

function renderFatEquivalentCard(projection) {
  const isDeficit = projection.calorie_delta <= 0;
  const isBalanced = projection.calorie_delta === 0;
  const tone = isBalanced ? 'balanced' : (isDeficit ? 'deficit' : 'surplus');
  const action = isBalanced ? '维持平衡' : (isDeficit ? '脂肪消耗等价' : '脂肪储存等价');
  const energyAction = isBalanced ? '能量收支接近平衡' : `${isDeficit ? '消耗' : '盈余'} ${fmtCal(Math.abs(projection.calorie_delta))} kcal`;

  return `
    <section class="fat-equivalent-card ${tone}" aria-label="预计脂肪变化">
      <div class="projection-card-head">
        <div><h2>预计脂肪变化</h2><small>按 7700 kcal ≈ 1 kg 脂肪</small></div>
        <span>${isBalanced ? '平衡' : (isDeficit ? '缺口' : '盈余')}</span>
      </div>
      <div class="fat-equivalent-main">
        <div>
          <small>今日${action}</small>
          <strong>${formatSignedNumber(projection.fat_change.today_kg, 2)}<em> kg</em></strong>
          <p>≈ ${energyAction}</p>
        </div>
        <div class="fat-week-preview">
          <small>7 天线性预估</small>
          <b>${formatSignedNumber(projection.fat_change.week_kg, 2)}<em> kg</em></b>
          <svg viewBox="0 0 92 26" role="img" aria-label="7天脂肪变化趋势">
            <path d="${isDeficit ? 'M3 7 C25 8, 33 4, 48 10 S70 15, 89 21' : 'M3 20 C25 18, 34 21, 50 14 S71 9, 89 5'}"></path>
            <circle cx="89" cy="${isDeficit ? '21' : '5'}" r="2.5"></circle>
          </svg>
        </div>
      </div>
      <p class="projection-disclaimer">能量等价不代表体重会即时变化，水分与代谢波动会影响实际结果。</p>
    </section>`;
}

function bodyFatChart(bodyFat) {
  const values = [bodyFat.current_pct, bodyFat.week_pct, bodyFat.month_pct];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = [20, 150, 280][index];
    const y = 72 - ((value - min) / range) * 42;
    return { x, y: Math.round(y), value };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return `
    <svg class="body-fat-chart" viewBox="0 0 300 108" role="img" aria-label="今天、7天后和30天后的体脂率预估趋势">
      <line x1="18" y1="82" x2="282" y2="82" class="chart-axis"></line>
      <polyline points="${polyline}" class="chart-line"></polyline>
      ${points.map((point) => `
        <line x1="${point.x}" y1="${point.y}" x2="${point.x}" y2="82" class="chart-guide"></line>
        <circle cx="${point.x}" cy="${point.y}" r="5" class="chart-point"></circle>
        <text x="${point.x}" y="${Math.max(point.y - 10, 13)}" text-anchor="middle">${point.value.toFixed(1)}%</text>
      `).join('')}
      <text x="20" y="103" text-anchor="middle" class="chart-label">今天</text>
      <text x="150" y="103" text-anchor="middle" class="chart-label">7天后</text>
      <text x="280" y="103" text-anchor="middle" class="chart-label">30天后</text>
    </svg>`;
}

function renderBodyFatProjectionCard(projection) {
  if (!projection.available) {
    return `
      <section class="body-fat-card body-fat-empty">
        <div class="projection-card-head">
          <div><h2>体脂率趋势预估</h2><small>基于身高、体重、年龄和性别</small></div>
        </div>
        <div class="body-fat-empty-content">
          <span>◎</span>
          <div><b>完善资料后生成预测</b><p>补充个人资料即可查看当前、7 天和 30 天体脂率估算。</p></div>
        </div>
        <button type="button" onclick="navigate('settings')">去完善资料</button>
      </section>`;
  }

  const bodyFat = projection.body_fat;
  const usesMeasuredBodyFat = projection.method === 'provided_body_fat';
  const weekImproving = bodyFat.week_change_pct <= 0;
  const monthImproving = bodyFat.month_change_pct <= 0;

  return `
    <section class="body-fat-card">
      <div class="projection-card-head">
        <div><h2>体脂率趋势预估</h2><small>${usesMeasuredBodyFat ? '基于实测体脂率与热量差' : 'BMI + 年龄 + 性别模型估算'}</small></div>
        <span>预测值</span>
      </div>
      <div class="body-fat-summary">
        <div class="current"><small>${usesMeasuredBodyFat ? '当前实测' : '当前估算'}</small><strong>${bodyFat.current_pct.toFixed(1)}<em>%</em></strong></div>
        <div><small>7 天后</small><b>${bodyFat.week_pct.toFixed(1)}%</b><em class="${weekImproving ? 'improving' : 'rising'}">${formatSignedNumber(bodyFat.week_change_pct, 1)}%</em></div>
        <div><small>30 天后</small><b>${bodyFat.month_pct.toFixed(1)}%</b><em class="${monthImproving ? 'improving' : 'rising'}">${formatSignedNumber(bodyFat.month_change_pct, 1)}%</em></div>
      </div>
      ${bodyFatChart(bodyFat)}
      <p class="projection-disclaimer">${usesMeasuredBodyFat ? '当前值来自你的实测记录，未来值' : '全部数值'}按今日热量差线性外推，仅用于趋势参考。</p>
    </section>`;
}

async function renderDashboard() {
  showLoader('首页加载中...');

  try {
    const today = fmtDate();
    const [data, profile] = await Promise.all([
      API.getRecords(today),
      API.getProfile().catch(() => ({})),
    ]);
    const balance = fmtCal(data.calorie_delta);
    const deficit = balance <= 0;
    const intakePct = Math.min(fmtPct(data.day_total, data.goal), 100);
    const bodyProjection = BodyComposition.buildProjection(data.calorie_delta, profile);

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
        <div><span class="brand-mark">C</span><b class="brand-name">CalSnap</b></div>
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

      ${renderFatEquivalentCard(bodyProjection)}
      ${renderBodyFatProjectionCard(bodyProjection)}

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
      <div class="page-header"><h1>CalSnap</h1></div>
      <div class="card error-card"><p>首页加载失败：${esc(err.message || '请检查服务器')}</p>
      <button class="btn btn-outline btn-block" onclick="navigate('dashboard')">重新加载</button></div>`;
  }
}
