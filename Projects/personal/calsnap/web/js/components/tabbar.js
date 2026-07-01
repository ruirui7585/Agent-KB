function renderTabbar(active) {
  const tabs = [
    { id: 'dashboard', icon: '⌂', label: '首页' },
    { id: 'history', icon: '▤', label: '记录' },
    { id: 'action', icon: '+', label: '添加', action: true },
    { id: 'trends', icon: '⌁', label: '趋势' },
    { id: 'settings', icon: '○', label: '我的' },
  ];

  const html = tabs.map(t => `
    <button class="tab ${t.id === active ? 'active' : ''} ${t.action ? 'tab-action' : ''}"
      data-page="${t.id}" aria-label="${t.label}">
      <span class="tab-icon">${t.icon}</span>
      <span class="tab-label">${t.label}</span>
    </button>
  `).join('');

  document.getElementById('tabbar').innerHTML = html;

  for (const btn of document.querySelectorAll('#tabbar .tab')) {
    btn.onclick = () => btn.dataset.page === 'action' ? showQuickAddSheet() : navigate(btn.dataset.page);
  }
}

function showQuickAddSheet() {
  document.getElementById('quick-add-sheet')?.remove();
  const sheet = document.createElement('div');
  sheet.id = 'quick-add-sheet';
  sheet.className = 'sheet-layer';
  sheet.innerHTML = `
    <button class="sheet-backdrop" aria-label="关闭"></button>
    <section class="bottom-sheet">
      <div class="sheet-handle"></div>
      <h2>记录今天</h2>
      <p class="sheet-subtitle">选择要添加的内容</p>
      <button class="quick-add-item" data-target="camera"><span class="quick-icon food">📷</span><span><b>拍照记录饮食</b><small>AI 识别食物和热量</small></span><i>›</i></button>
      <button class="quick-add-item" data-target="exercise"><span class="quick-icon exercise">🏃</span><span><b>记录运动</b><small>按类型、时长和强度估算</small></span><i>›</i></button>
      <button class="quick-add-item" data-target="barcode"><span class="quick-icon barcode">▦</span><span><b>扫描包装食品</b><small>通过条形码查找营养信息</small></span><i>›</i></button>
    </section>
  `;
  document.body.appendChild(sheet);
  requestAnimationFrame(() => sheet.classList.add('show'));
  const close = () => {
    sheet.classList.remove('show');
    setTimeout(() => sheet.remove(), 220);
  };
  sheet.querySelector('.sheet-backdrop').onclick = close;
  sheet.querySelectorAll('[data-target]').forEach((button) => {
    button.onclick = () => {
      const target = button.dataset.target;
      close();
      navigate(target);
    };
  });
}
