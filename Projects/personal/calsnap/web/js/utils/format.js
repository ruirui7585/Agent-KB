function fmtDate(d) {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().slice(0, 10);
}

function fmtDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['日','一','二','三','四','五','六'];
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = weekdays[d.getDay()];
  return `${m}月${day}日 周${w}`;
}

function fmtTime(timeStr) {
  return timeStr.slice(0, 5);
}

function fmtCal(n) {
  return Math.round(n || 0);
}

function fmtPct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
