async function renderHistory() {
  showLoader('加载记录...');
  try {
    const today = fmtDate();
    const [day, stats] = await Promise.all([API.getRecords(today), API.getStats(30)]);
    const foodItems = Object.values(day.meals).flat();
    const timeline = [
      ...foodItems.map((item) => ({ ...item, kind: 'food', calories: item.total_cal })),
      ...(day.exercises || []).map((item) => ({ ...item, kind: 'exercise', calories: -item.calories })),
    ].sort((a, b) => a.time.localeCompare(b.time));

    document.getElementById('content').innerHTML = `
      <div class="page-header modern"><h1>记录</h1></div>
      <div class="segmented record-tabs"><button class="active">日记录</button><button onclick="navigate('trends')">趋势</button></div>
      <section class="day-summary">
        <div><small>摄入</small><b>${day.day_total}</b><em>kcal</em></div>
        <div><small>运动</small><b>${day.exercise_total}</b><em>kcal</em></div>
        <div><small>热量差</small><b class="${day.calorie_delta <= 0 ? 'deficit' : 'surplus'}">${day.calorie_delta > 0 ? '+' : ''}${day.calorie_delta}</b><em>kcal</em></div>
      </section>
      <div class="section-title"><h2>今天 · ${fmtDateDisplay(today)}</h2></div>
      <section class="timeline-card">
        ${timeline.length ? timeline.map((item) => item.kind === 'food' ? `
          <div class="timeline-row">
            <time>${item.time}</time><span class="timeline-dot food"></span>
            <div><b>${(item.foods || []).map((food) => food.name).join('、') || '饮食记录'}</b><small>饮食 · ${item.meal_type ? CONFIG.MEAL_LABELS[item.meal_type] : ''}</small></div>
            <strong>+${fmtCal(item.calories)}</strong>
          </div>` : `
          <div class="timeline-row">
            <time>${item.time}</time><span class="timeline-dot exercise"></span>
            <div><b>${CONFIG.EXERCISE_LABELS[item.exercise_type] || '运动'}</b><small>${item.duration_minutes} 分钟 · ${item.note || '运动记录'}</small></div>
            <strong class="burn">-${fmtCal(item.calories)}</strong>
          </div>`).join('') : '<div class="timeline-empty">今天还没有记录，点击底部 + 开始记录</div>'}
      </section>
      <div class="section-title"><h2>近30天</h2><button onclick="navigate('trends')">查看趋势 ›</button></div>
      <section class="history-days">
        ${stats.daily.slice().reverse().slice(0, 14).map((item) => `
          <button class="history-day" data-date="${item.date}">
            <span><b>${fmtDateDisplay(item.date)}</b><small>摄入 ${item.intake} · 运动 ${item.exercise}</small></span>
            <strong class="${item.balance <= 0 ? 'deficit' : 'surplus'}">${item.balance > 0 ? '+' : ''}${item.balance} kcal</strong><i>›</i>
          </button>`).join('')}
      </section>
    `;
    document.querySelectorAll('[data-date]').forEach((button) => {
      button.onclick = () => showDayDetail(button.dataset.date);
    });
  } catch (err) {
    showEmpty('▤', '加载失败', err.message || '请检查网络');
  }
}

async function showDayDetail(date) {
  showLoader('加载当天记录...');
  try {
    const data = await API.getRecords(date);
    const foods = Object.values(data.meals).flat();
    document.getElementById('content').innerHTML = `
      <div class="subpage-header"><button onclick="renderHistory()">‹</button><h1>${fmtDateDisplay(date)}</h1><span></span></div>
      <section class="balance-detail-card">
        <div><small>摄入</small><b>${data.day_total}</b></div><i>−</i>
        <div><small>基础消耗</small><b>${data.baseline_expenditure}</b></div><i>−</i>
        <div><small>运动</small><b>${data.exercise_total}</b></div><i>=</i>
        <div><small>热量差</small><b class="${data.calorie_delta <= 0 ? 'deficit' : 'surplus'}">${data.calorie_delta}</b></div>
      </section>
      <div class="section-title"><h2>饮食</h2></div>
      <section class="records-card">${foods.length ? foods.map((item) => `
        <div class="record-row"><span class="row-icon">🍽️</span><span class="row-main"><b>${item.foods.map((food) => food.name).join('、')}</b><small>${item.time}</small></span><span class="row-value">${item.total_cal} kcal</span></div>`).join('') : '<div class="timeline-empty">无饮食记录</div>'}</section>
      <div class="section-title"><h2>运动</h2></div>
      <section class="records-card">${data.exercises.length ? data.exercises.map((item) => `
        <div class="record-row"><span class="row-icon exercise-icon">${CONFIG.EXERCISE_EMOJI[item.exercise_type]}</span><span class="row-main"><b>${CONFIG.EXERCISE_LABELS[item.exercise_type]}</b><small>${item.duration_minutes} 分钟 · ${item.time}</small></span><span class="row-value burn">-${item.calories} kcal</span></div>`).join('') : '<div class="timeline-empty">无运动记录</div>'}</section>`;
  } catch (err) {
    showEmpty('▤', '加载失败', err.message || '请重试');
  }
}
