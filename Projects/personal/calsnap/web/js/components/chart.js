function renderChart(canvasId, dailyData, type = 'bar') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !dailyData.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = 200;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  const pad = { top: 30, right: 16, bottom: 30, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const maxVal = Math.max(...dailyData.map(d => d.total), dailyData[0]?.goal || 2000, 2400);

  ctx.clearRect(0, 0, w, h);

  // goal line (red dashed)
  if (dailyData[0]?.goal) {
    const goalY = pad.top + ch - (dailyData[0].goal / maxVal) * ch;
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, goalY);
    ctx.lineTo(pad.left + cw, goalY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171';
    ctx.font = '11px system-ui';
    ctx.fillText('目标 ' + dailyData[0].goal, pad.left + 4, goalY - 4);
  }

  if (type === 'line') {
    drawLine(ctx, dailyData, pad, cw, ch, maxVal);
  } else {
    drawBars(ctx, dailyData, pad, cw, ch, maxVal);
  }
}

function drawBars(ctx, dailyData, pad, cw, ch, maxVal) {
  const barW = Math.min(cw / dailyData.length * 0.7, 32);
  const gap = cw / dailyData.length;

  dailyData.forEach((d, i) => {
    const x = pad.left + i * gap + (gap - barW) / 2;
    const barH = (d.total / maxVal) * ch;
    const y = pad.top + ch - barH;
    const over = d.total > d.goal;
    ctx.fillStyle = over ? '#f87171' : '#22c55e';
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(d.date.slice(5), x + barW / 2, pad.top + ch + 16);

    ctx.fillStyle = '#334155';
    ctx.font = '9px system-ui';
    ctx.fillText(fmtCal(d.total), x + barW / 2, y - 4);
  });
}

function drawLine(ctx, dailyData, pad, cw, ch, maxVal) {
  const gap = cw / Math.max(dailyData.length - 1, 1);
  const points = dailyData.map((d, i) => ({
    x: pad.left + i * gap,
    y: pad.top + ch - (d.total / maxVal) * ch,
    total: d.total,
    date: d.date,
  }));

  // area fill
  ctx.beginPath();
  ctx.moveTo(points[0].x, pad.top + ch);
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.lineTo(points[points.length - 1].x, pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
  ctx.fill();

  // line
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // dots & labels
  points.forEach((p, i) => {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(p.date.slice(5), p.x, pad.top + ch + 16);
  });
}

function renderLineChart(canvasId, dailyData) {
  renderChart(canvasId, dailyData, 'line');
}

function renderBalanceChart(canvasId, dailyData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !dailyData.length) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 8;
  const height = 230;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
  const pad = { top: 20, right: 12, bottom: 30, left: 38 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const maxAbs = Math.max(...dailyData.map((item) => Math.abs(item.balance)), 500);
  const zeroY = pad.top + chartHeight / 2;
  ctx.strokeStyle = '#dfe6e3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(width - pad.right, zeroY);
  ctx.stroke();
  const slot = chartWidth / dailyData.length;
  const barWidth = Math.min(slot * 0.48, 24);
  dailyData.forEach((item, index) => {
    if (item.has_data === false) return;
    const magnitude = Math.abs(item.balance) / maxAbs * (chartHeight / 2 - 8);
    const x = pad.left + slot * index + (slot - barWidth) / 2;
    const y = item.balance <= 0 ? zeroY : zeroY - magnitude;
    ctx.fillStyle = item.balance <= 0 ? '#19b766' : '#ff7a45';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, barWidth, magnitude, 5);
    } else {
      ctx.rect(x, y, barWidth, magnitude);
    }
    ctx.fill();
    ctx.fillStyle = '#8b9893';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(item.date.slice(5), x + barWidth / 2, height - 9);
  });
}

function renderMetricTrendChart(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !data.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(canvas.parentElement.clientWidth - 8, 280);
  const height = 238;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  const pad = { top: 22, right: 14, bottom: 34, left: 42 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const values = data.map((item) => Number(item.value) || 0);
  const type = options.type || 'bar';
  let min = Math.min(...values, 0);
  let max = Math.max(...values, 0);

  if (type === 'line') {
    min = Math.min(...values);
    max = Math.max(...values);
    const padding = Math.max((max - min) * 0.22, options.minimumRange || 0.5);
    min -= padding;
    max += padding;
  } else {
    const magnitude = Math.max(Math.abs(min), Math.abs(max), options.minimumRange || 1);
    min = -magnitude;
    max = magnitude;
  }

  const valueToY = (value) => pad.top + (max - value) / Math.max(max - min, 0.001) * chartHeight;
  const formatValue = (value) => {
    const digits = options.digits ?? (Math.abs(value) < 10 ? 1 : 0);
    return Number(value).toFixed(digits);
  };
  const labelIndexes = new Set([0, data.length - 1]);
  const labelCount = Math.min(data.length, 5);
  for (let index = 1; index < labelCount - 1; index++) {
    labelIndexes.add(Math.round(index * (data.length - 1) / (labelCount - 1)));
  }

  ctx.clearRect(0, 0, width, height);
  ctx.font = '9px system-ui';
  ctx.textAlign = 'right';
  for (let index = 0; index <= 4; index++) {
    const value = max - (max - min) * index / 4;
    const y = valueToY(value);
    ctx.strokeStyle = Math.abs(value) < (max - min) / 20 ? '#ced9d3' : '#edf2ef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = '#89968f';
    ctx.fillText(formatValue(value), pad.left - 7, y + 3);
  }

  if (type === 'bar') {
    const slot = chartWidth / data.length;
    const barWidth = Math.max(Math.min(slot * 0.52, 24), 1);
    const zeroY = valueToY(0);
    data.forEach((item, index) => {
      if (item.has_data === false) return;
      const x = pad.left + slot * index + (slot - barWidth) / 2;
      const valueY = valueToY(item.value);
      const y = Math.min(zeroY, valueY);
      const barHeight = Math.max(Math.abs(zeroY - valueY), 1);
      ctx.fillStyle = item.value <= 0 ? '#18b865' : '#ff7a45';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, barWidth, barHeight, 4);
      else ctx.rect(x, y, barWidth, barHeight);
      ctx.fill();
    });
  } else {
    const gap = chartWidth / Math.max(data.length - 1, 1);
    const points = data.map((item, index) => ({
      x: pad.left + gap * index,
      y: valueToY(item.value),
      value: item.value,
    }));
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartHeight);
    gradient.addColorStop(0, 'rgba(24,184,101,.22)');
    gradient.addColorStop(1, 'rgba(24,184,101,0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + chartHeight);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points.at(-1).x, pad.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    points.forEach((point, index) => index === 0
      ? ctx.moveTo(point.x, point.y)
      : ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = options.color || '#18b865';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    points.forEach((point, index) => {
      if (!labelIndexes.has(index)) return;
      ctx.fillStyle = options.color || '#18b865';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#86938d';
  ctx.font = '9px system-ui';
  data.forEach((item, index) => {
    if (!labelIndexes.has(index)) return;
    const x = pad.left + chartWidth * index / Math.max(data.length - 1, 1);
    ctx.fillText(item.date.slice(5), x, height - 10);
  });
}
