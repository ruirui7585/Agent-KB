let trendRange = 7;
let trendMetric = 'calorie';

const TREND_METRICS = {
  calorie: { label: '热量', title: '净热量趋势', unit: 'kcal', type: 'bar', digits: 0 },
  fat: { label: '脂肪变化', title: '脂肪变化趋势', unit: 'kg', type: 'bar', digits: 2 },
  bodyFat: { label: '体脂率', title: '体脂率估算趋势', unit: '%', type: 'line', digits: 1 },
  weight: { label: '体重', title: '体重估算趋势', unit: 'kg', type: 'line', digits: 1 },
};

const TREND_RANGES = [
  { value: 7, label: '周' },
  { value: 30, label: '月' },
  { value: 90, label: '3个月' },
  { value: 365, label: '年' },
];

function trendSigned(value, digits = 0) {
  const number = Number(value) || 0;
  return `${number > 0 ? '+' : ''}${number.toFixed(digits)}`;
}

function recentTrendTotal(series, days) {
  return series.slice(-days).reduce((sum, item) => sum + item.fat_change_kg, 0);
}

function trendMetricData(metric, rows, historyRows) {
  if (metric === 'fat') {
    return historyRows.map((item) => ({
      date: item.date,
      value: item.fat_change_kg,
      has_data: item.has_data,
    }));
  }
  if (metric === 'bodyFat') {
    return historyRows.map((item) => ({
      date: item.date,
      value: item.estimated_body_fat_pct,
      has_data: item.estimated_body_fat_pct !== null,
    }));
  }
  if (metric === 'weight') {
    return historyRows.map((item) => ({
      date: item.date,
      value: item.estimated_weight_kg,
      has_data: item.estimated_weight_kg !== null,
    }));
  }
  return rows.map((item) => ({
    date: item.date,
    value: item.balance,
    has_data: item.has_data,
  }));
}

function renderTrendSummary(metric, rows, historyRows) {
  const recorded = rows.filter((item) => item.has_data !== false);
  const balances = recorded.map((item) => item.balance);

  if (metric === 'fat') {
    return `
      <section class="trend-stats trend-cumulative">
        <div><small>7 天累计</small><b class="${recentTrendTotal(historyRows, 7) <= 0 ? 'deficit' : 'surplus'}">${trendSigned(recentTrendTotal(historyRows, 7), 2)}</b><em>kg</em></div>
        <div><small>30 天累计</small><b class="${recentTrendTotal(historyRows, 30) <= 0 ? 'deficit' : 'surplus'}">${trendSigned(recentTrendTotal(historyRows, 30), 2)}</b><em>kg</em></div>
        <div><small>90 天累计</small><b class="${recentTrendTotal(historyRows, 90) <= 0 ? 'deficit' : 'surplus'}">${trendSigned(recentTrendTotal(historyRows, 90), 2)}</b><em>kg</em></div>
      </section>`;
  }

  if (metric === 'bodyFat' || metric === 'weight') {
    const key = metric === 'bodyFat' ? 'estimated_body_fat_pct' : 'estimated_weight_kg';
    const unit = metric === 'bodyFat' ? '%' : 'kg';
    const values = historyRows.map((item) => item[key]).filter((value) => value !== null);
    const start = values[0] ?? 0;
    const current = values.at(-1) ?? 0;
    const change = current - start;
    return `
      <section class="trend-stats">
        <div><small>区间起点</small><b>${start.toFixed(1)}</b><em>${unit}</em></div>
        <div><small>当前估算</small><b>${current.toFixed(1)}</b><em>${unit}</em></div>
        <div><small>区间变化</small><b class="${change <= 0 ? 'deficit' : 'surplus'}">${trendSigned(change, 1)}</b><em>${unit}</em></div>
      </section>`;
  }

  const average = balances.length
    ? Math.round(balances.reduce((sum, value) => sum + value, 0) / balances.length)
    : 0;
  const best = balances.length ? Math.min(...balances) : 0;
  const exercise = recorded.reduce((sum, item) => sum + item.exercise, 0);
  return `
    <section class="trend-stats">
      <div><small>平均热量差</small><b class="${average <= 0 ? 'deficit' : 'surplus'}">${trendSigned(average)}</b><em>有效记录日</em></div>
      <div><small>最佳缺口</small><b class="deficit">${best}</b><em>${balances.length ? 'kcal' : '暂无记录'}</em></div>
      <div><small>运动消耗</small><b>${exercise}</b><em>kcal</em></div>
    </section>`;
}

function renderTrendInsight(metric, range, rows, usesMeasuredBodyFat = false) {
  const recorded = rows.filter((item) => item.has_data !== false);
  const balance = recorded.length
    ? recorded.reduce((sum, item) => sum + item.balance, 0) / recorded.length
    : 0;
  const copy = {
    calorie: balance <= 0
      ? `近${range}天总体保持热量缺口，坚持稳定记录比追求极端缺口更重要。`
      : `近${range}天平均为热量盈余，可以增加日常步行或调整餐食份量。`,
    fat: '脂肪变化由每日热量差折算。建议把每日缺口稳定在可持续范围，避免快速波动。',
    bodyFat: usesMeasuredBodyFat
      ? '当前体脂基线来自你的实测记录，后续曲线由每日热量差推演；建议定期复测校准。'
      : '体脂率为模型估算趋势。定期使用同一台体脂秤实测，能获得更可靠的变化判断。',
    weight: '体重趋势只反映脂肪能量等价，未计入水分、肌肉和糖原变化。',
  }[metric];
  return `<section class="insight-card trend-insight"><span>✦</span><div><b>趋势解读</b><p>${copy}</p></div></section>`;
}

async function renderTrends(range = trendRange, metric = trendMetric) {
  trendRange = TREND_RANGES.some((item) => item.value === Number(range)) ? Number(range) : 7;
  trendMetric = TREND_METRICS[metric] ? metric : 'calorie';
  showLoader('生成趋势...');

  try {
    const fetchRange = Math.max(trendRange, 90);
    const [stats, profile] = await Promise.all([
      API.getStats(fetchRange),
      API.getProfile().catch(() => ({})),
    ]);
    const rows = stats.daily.slice(-trendRange);
    const history = BodyComposition.buildHistoricalTrend(stats.daily, profile);
    const historyRows = history.series.slice(-trendRange);
    const config = TREND_METRICS[trendMetric];
    const usesMeasuredBodyFat = Number(profile.body_fat_pct) >= 3
      && Number(profile.body_fat_pct) <= 60;
    const requiresProfile = trendMetric === 'bodyFat' || trendMetric === 'weight';
    const chartData = trendMetricData(trendMetric, rows, historyRows);
    const usableValues = chartData.filter((item) => item.value !== null
      && (trendMetric !== 'calorie' || item.has_data !== false));
    const headline = trendMetric === 'calorie'
      ? (usableValues.length ? usableValues.reduce((sum, item) => sum + item.value, 0) / usableValues.length : 0)
      : trendMetric === 'fat'
        ? usableValues.reduce((sum, item) => sum + item.value, 0)
        : (usableValues.at(-1)?.value ?? 0);
    const headlineDigits = config.digits;

    document.getElementById('content').innerHTML = `
      <div class="page-header modern"><h1>趋势</h1></div>
      <div class="trend-metric-tabs" role="tablist" aria-label="趋势指标">
        ${Object.entries(TREND_METRICS).map(([key, item]) => `
          <button type="button" role="tab" aria-selected="${trendMetric === key}" class="${trendMetric === key ? 'active' : ''}" data-trend-metric="${key}">${item.label}</button>
        `).join('')}
      </div>
      <div class="segmented trend-range-tabs" aria-label="趋势时间范围">
        ${TREND_RANGES.map((item) => `
          <button type="button" class="${trendRange === item.value ? 'active' : ''}" data-trend-range="${item.value}">${item.label}</button>
        `).join('')}
      </div>

      ${requiresProfile && !history.available ? `
        <section class="card trend-profile-empty">
          <span>◎</span>
          <h2>完善资料后生成${config.label}趋势</h2>
          <p>需要成人的性别、年龄、身高和体重，才能生成模型估算曲线。</p>
          <button type="button" onclick="navigate('settings')">去完善资料</button>
        </section>
      ` : `
        <section class="card chart-card trend-chart-card">
          <div class="trend-chart-head">
            <div><h2>${config.title}</h2><small>${requiresProfile ? `${usesMeasuredBodyFat ? '实测基线推演' : '模型估算'} · ` : ''}近 ${trendRange} 天</small></div>
            <span>${config.unit}</span>
          </div>
          <strong class="trend-headline ${headline <= 0 ? 'deficit' : (trendMetric === 'calorie' || trendMetric === 'fat' ? 'surplus' : '')}">
            ${trendMetric === 'calorie' || trendMetric === 'fat' ? trendSigned(headline, headlineDigits) : Number(headline).toFixed(headlineDigits)}
            <em>${config.unit}</em>
          </strong>
          <canvas id="metric-trend-chart"></canvas>
          <p class="trend-chart-note">${trendMetric === 'calorie'
            ? '绿色为热量缺口，橙色为热量盈余。'
            : usesMeasuredBodyFat && trendMetric === 'bodyFat'
              ? '当前基线来自实测，历史与未来变化仍为能量模型推演。'
              : '除热量外均为模型估算，不替代体脂秤或医学测量。'}</p>
        </section>
        ${renderTrendSummary(trendMetric, rows, historyRows)}
      `}
      ${renderTrendInsight(trendMetric, trendRange, rows, usesMeasuredBodyFat)}
    `;

    document.querySelectorAll('[data-trend-metric]').forEach((button) => {
      button.onclick = () => renderTrends(trendRange, button.dataset.trendMetric);
    });
    document.querySelectorAll('[data-trend-range]').forEach((button) => {
      button.onclick = () => renderTrends(Number(button.dataset.trendRange), trendMetric);
    });

    if (!requiresProfile || history.available) {
      setTimeout(() => renderMetricTrendChart('metric-trend-chart', chartData, {
        type: config.type,
        digits: config.digits,
        minimumRange: trendMetric === 'fat' ? 0.1 : (trendMetric === 'bodyFat' ? 0.5 : 1),
      }), 50);
    }
  } catch (err) {
    showEmpty('⌁', '趋势加载失败', err.message || '请重试');
  }
}
