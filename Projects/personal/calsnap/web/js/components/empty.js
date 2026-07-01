function showEmpty(icon, title, subtitle) {
  document.getElementById('content').innerHTML = `
    <div class="empty-box">
      <div class="empty-icon">${icon || '📭'}</div>
      <h3>${title || '暂无数据'}</h3>
      <p>${subtitle || ''}</p>
    </div>
  `;
}
