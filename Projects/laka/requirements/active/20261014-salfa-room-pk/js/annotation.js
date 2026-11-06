(function () {
  'use strict';

  var DEFAULT_DATA = { version: '1.0', updatedAt: '2026-09-22T00:00:00Z', annotations: [
    { id: 'ann-pk-score', target: 'pk-score', title: '积分扣除', note: '每次开始匹配实际扣除 1 coin。展示余额变化时应以真实扣除结果为准。' },
    { id: 'ann-pk-seats', target: 'pk-seats', title: '语音席位', note: '左右两侧各有 5 个演示席位；当前玩法仅支持房主语音。' },
    { id: 'ann-pk-progress', target: 'pk-progress', title: '对局进度', note: '进度显示 10 + 比例 80；归零后显示 50。' },
    { id: 'ann-pk-result', target: 'pk-result', title: '结果与惩罚', note: '结果在 2-3 秒后公布；失败方进入 60 秒惩罚，平局跳过惩罚。' }
  ] };
  var state = { data: { version: '1.0', annotations: [] }, selected: null, selecting: false, standalone: location.protocol === 'file:' };
  var style = document.createElement('style');
  style.textContent = '.sa-panel{position:fixed;z-index:2147483000;right:12px;bottom:12px;width:288px;max-height:min(70vh,520px);min-width:240px;min-height:120px;resize:both;overflow:auto;font:13px/1.45 system-ui,-apple-system,sans-serif;color:#172033}.sa-panel *{box-sizing:border-box}.sa-tab{border:0;border-radius:999px;background:#172033;color:#fff;padding:8px 12px;cursor:pointer;box-shadow:0 4px 16px #0003}.sa-box{display:none;background:#fff;border:1px solid #d7ddea;border-radius:12px;box-shadow:0 10px 28px #0002;overflow:hidden}.sa-panel.open .sa-tab{display:none}.sa-panel.open .sa-box{display:block}.sa-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #edf0f5;font-weight:700;cursor:move;user-select:none}.sa-head button,.sa-actions button{border:0;background:transparent;color:#526078;cursor:pointer}.sa-body{padding:10px 12px;overflow:auto;max-height:calc(min(70vh,520px) - 48px)}.sa-help{margin:0 0 8px;color:#667085;font-size:12px}.sa-list{display:grid;gap:6px}.sa-item{border:1px solid #e1e6ef;border-radius:8px;padding:7px;cursor:pointer;background:#fafbfc}.sa-item.active{border-color:#536dfe;background:#f3f5ff}.sa-item-title{font-weight:650}.sa-item-note{margin-top:3px;color:#667085;font-size:12px;white-space:pre-wrap}.sa-editor{margin-top:10px;border-top:1px solid #edf0f5;padding-top:10px}.sa-editor label{display:block;color:#526078;font-size:12px;margin-bottom:4px}.sa-editor input,.sa-editor textarea{width:100%;border:1px solid #ccd3df;border-radius:7px;padding:7px;font:inherit}.sa-editor textarea{min-height:78px;resize:vertical}.sa-actions{display:flex;gap:8px;margin-top:8px}.sa-actions button{border:1px solid #ccd3df;border-radius:7px;padding:5px 8px}.sa-actions .primary{background:#536dfe;color:#fff;border-color:#536dfe}.sa-target{outline:2px solid #536dfe!important;outline-offset:2px}.sa-target-marker{position:absolute;z-index:2147482999;width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;padding:0!important;border:2px solid #fff!important;border-radius:50%!important;background:#536dfe!important;color:#fff!important;font:10px/14px system-ui!important;box-shadow:0 2px 8px #0004;cursor:pointer}';
  document.documentElement.appendChild(style);

  function api(method, body) {
    if (state.standalone) return Promise.reject(new Error('保存接口不可用：当前为 file:// 单文件模式，请导出 JSON。'));
    return fetch('/api/annotations', { method: method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      if (!r.ok) throw new Error('保存失败（HTTP ' + r.status + '）');
      return r.json();
    });
  }

  function targetFor(item) { return Array.from(document.querySelectorAll('[data-spec-key]')).find(function (node) { return node.getAttribute('data-spec-key') === (item.target || ''); }); }
  function clearMarkers() { document.querySelectorAll('.sa-target-marker').forEach(function (el) { el.remove(); }); document.querySelectorAll('.sa-target').forEach(function (el) { el.classList.remove('sa-target'); }); }
  function renderMarkers() {
    clearMarkers();
    if (!panel.classList.contains('open')) return;
    state.data.annotations.forEach(function (item, i) { var target = targetFor(item); if (!target) return; target.classList.add('sa-target'); var marker = document.createElement('button'); marker.className = 'sa-target-marker'; marker.textContent = String(i + 1); marker.title = item.title || item.target; marker.style.left = (window.scrollX + target.getBoundingClientRect().right - 9) + 'px'; marker.style.top = (window.scrollY + target.getBoundingClientRect().top - 9) + 'px'; marker.addEventListener('click', function (event) { event.stopPropagation(); select(item.id); }); document.body.appendChild(marker); });
  }
  function select(id) { state.selected = id; render(); var item = state.data.annotations.find(function (x) { return x.id === id; }); var target = item && targetFor(item); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  function render() {
    list.innerHTML = state.data.annotations.map(function (item) { return '<div class="sa-item ' + (item.id === state.selected ? 'active' : '') + '" data-id="' + item.id.replace(/"/g, '&quot;') + '"><div class="sa-item-title">' + escapeHtml(item.title || item.target) + '</div><div class="sa-item-note">' + escapeHtml(item.note || '') + '</div></div>'; }).join('') || '<p class="sa-help">暂无标注</p>';
    list.querySelectorAll('.sa-item').forEach(function (el) { el.addEventListener('click', function () { select(el.dataset.id); }); });
    var item = state.data.annotations.find(function (x) { return x.id === state.selected; });
    editor.innerHTML = item ? '<label>标题<input id="sa-title" value="' + escapeAttr(item.title || '') + '"></label><label>备注<textarea id="sa-note">' + escapeHtml(item.note || '') + '</textarea></label><div class="sa-actions"><button class="primary" id="sa-save">保存</button><button id="sa-export">导出 JSON</button></div>' : '<p class="sa-help">点击标注编辑备注，或点击“选择标注”后选择页面元素。</p>';
    if (item) { editor.querySelector('#sa-save').addEventListener('click', save); editor.querySelector('#sa-export').addEventListener('click', exportJson); }
    renderMarkers();
  }
  function syncEditor() { var item = state.data.annotations.find(function (x) { return x.id === state.selected; }); if (!item || !editor.querySelector('#sa-title')) return; item.title = editor.querySelector('#sa-title').value; item.note = editor.querySelector('#sa-note').value; }
  function save() { var item = state.data.annotations.find(function (x) { return x.id === state.selected; }); if (!item) return; syncEditor(); api('POST', state.data).then(function (data) { state.data = data; panel.querySelector('#sa-status').textContent = '已保存到 annotations.json'; render(); }).catch(function (error) { panel.querySelector('#sa-status').textContent = error.message; window.alert(error.message); }); }
  function exportJson() { syncEditor(); var blob = new Blob([JSON.stringify(state.data, null, 2) + '\n'], { type: 'application/json' }); var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'annotations.json'; link.click(); URL.revokeObjectURL(link.href); }
  function escapeHtml(value) { return String(value).replace(/[&<>]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]; }); }
  function escapeAttr(value) { return escapeHtml(value).replace(/"/g, '&quot;'); }

  var panel = document.createElement('aside'); panel.className = 'sa-panel'; panel.innerHTML = '<button class="sa-tab">标注</button><div class="sa-box"><div class="sa-head"><span>产品标注</span><span><button id="sa-select">选择标注</button><button id="sa-close" aria-label="收起">×</button></span></div><div class="sa-body"><p class="sa-help" id="sa-status">本地编辑模式</p><div class="sa-list"></div><div class="sa-editor"></div></div></div>';
  document.body.appendChild(panel);
  var list = panel.querySelector('.sa-list'); var editor = panel.querySelector('.sa-editor');
  panel.querySelector('.sa-tab').addEventListener('click', function () { panel.classList.add('open'); render(); });
  panel.querySelector('#sa-close').addEventListener('click', function () { panel.classList.remove('open'); clearMarkers(); });
  panel.querySelector('#sa-select').addEventListener('click', function () { state.selecting = !state.selecting; this.textContent = state.selecting ? '选择中…' : '选择标注'; });
  var drag = null;
  panel.querySelector('.sa-head').addEventListener('pointerdown', function (event) { if (event.target.closest('button')) return; var rect = panel.getBoundingClientRect(); drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top }; panel.setPointerCapture(event.pointerId); event.preventDefault(); });
  panel.querySelector('.sa-head').addEventListener('pointermove', function (event) { if (!drag) return; panel.style.left = Math.max(0, drag.left + event.clientX - drag.x) + 'px'; panel.style.top = Math.max(0, drag.top + event.clientY - drag.y) + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; });
  panel.querySelector('.sa-head').addEventListener('pointerup', function () { drag = null; });
  document.addEventListener('click', function (event) { if (!state.selecting) return; var target = event.target.closest && event.target.closest('[data-spec-key]'); if (!target) return; event.preventDefault(); event.stopPropagation(); var item = state.data.annotations.find(function (x) { return x.target === target.getAttribute('data-spec-key'); }); if (item) { state.selecting = false; panel.querySelector('#sa-select').textContent = '选择标注'; select(item.id); } }, true);
  window.addEventListener('resize', renderMarkers); window.addEventListener('scroll', renderMarkers, true);
  var phone = document.getElementById('phone'); if (phone) new MutationObserver(function () { if (panel.classList.contains('open')) renderMarkers(); }).observe(phone, { childList: true, subtree: true });
  if (state.standalone) state.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  var dataRequest = state.standalone ? Promise.resolve(state.data) : fetch('/api/annotations').then(function (r) { if (!r.ok) throw new Error(); return r.json(); });
  dataRequest.then(function (data) { if (data && Array.isArray(data.annotations)) state.data = data; panel.querySelector('#sa-status').textContent = state.standalone ? '单文件模式：可导出 JSON，保存接口不可用' : '已连接本地标注服务'; render(); }).catch(function () { fetch('../annotations.json').then(function (r) { return r.json(); }).then(function (data) { state.data = data; panel.querySelector('#sa-status').textContent = '读取本地标注文件'; render(); }).catch(function () { panel.querySelector('#sa-status').textContent = '未找到 annotations.json'; }); });
}());
