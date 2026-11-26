/**
 * Laka 竞品页面画廊 v2：
 * - 人工只管批量拖入/选择图片或录屏；
 * - 全自动切帧、拼长规则、打好中文分类胶囊；
 * - 6 列紧凑页面墙 + 点击任意标签胶囊弹出菜单一键秒换 + 点击图片展开侧滑详情抽屉。
 */
(function () {
  const DRAFT_STORAGE_KEY = 'laka_competitor_gallery_ann_v2';

  const annotationState = {
    modeOn: false,
    activeKey: null,
    items: {},
  };

  const state = {
    isOnline: window.location.protocol.startsWith('http'),
    bundle: window.__EMBEDDED_SESSIONS__ || window.CAPTURE_SESSIONS || {
      competitors: [],
      modules: [],
      pageTypes: [],
      subTagsByPageType: {},
      pages: [],
      sessions: [],
    },
    filterComp: 'all',
    filterType: 'all',
    filterSubTag: 'all',
    searchQuery: '',
    cols: 6,
    showMergedFrames: false,
    activeDrawerUid: null,
    popoverTarget: null, // { uid, sessionId, itemId, kind: 'competitor' | 'pageType' | 'subTag' }
    justAddedSessionIds: new Set(),
  };

  const els = {
    dragOverlay: document.getElementById('dragOverlay'),
    totalCountPill: document.getElementById('totalCountPill'),
    searchInput: document.getElementById('searchInput'),
    chkShowMerged: document.getElementById('chkShowMerged'),
    btnSyncInbox: document.getElementById('btnSyncInbox'),
    btnPasteClipboard: document.getElementById('btnPasteClipboard'),
    btnUploadTrigger: document.getElementById('btnUploadTrigger'),
    fileUploadInput: document.getElementById('fileUploadInput'),
    statusBanner: document.getElementById('statusBanner'),
    competitorFilterRow: document.getElementById('competitorFilterRow'),
    pageTypeFilterRow: document.getElementById('pageTypeFilterRow'),
    subTagFilterRowWrap: document.getElementById('subTagFilterRowWrap'),
    subTagFilterRow: document.getElementById('subTagFilterRow'),
    screenWall: document.getElementById('screenWall'),
    tagPopover: document.getElementById('tagPopover'),
    tagPopoverTitle: document.getElementById('tagPopoverTitle'),
    tagPopoverOptions: document.getElementById('tagPopoverOptions'),
    tagPopoverAddBox: document.getElementById('tagPopoverAddBox'),
    newSubTagInput: document.getElementById('newSubTagInput'),
    btnAddNewSubTag: document.getElementById('btnAddNewSubTag'),

    // 详情抽屉
    detailDrawerWrap: document.getElementById('detailDrawerWrap'),
    detailBackdrop: document.getElementById('detailBackdrop'),
    drawerTitleInput: document.getElementById('drawerTitleInput'),
    drawerTagPills: document.getElementById('drawerTagPills'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnDeleteCurrent: document.getElementById('btnDeleteCurrent'),
    btnCloseDrawer: document.getElementById('btnCloseDrawer'),
    drawerPreviewImg: document.getElementById('drawerPreviewImg'),
    drawerHighlights: document.getElementById('drawerHighlights'),
    drawerNoteInput: document.getElementById('drawerNoteInput'),
    drawerOcrText: document.getElementById('drawerOcrText'),
    btnCopyDrawerOcr: document.getElementById('btnCopyDrawerOcr'),

    // 原型注释面板
    annotationPanel: document.getElementById('annotationPanel'),
    annotationDragHandle: document.getElementById('annotationDragHandle'),
    annotationResizeHandle: document.getElementById('annotationResizeHandle'),
    annotationModeCheckbox: document.getElementById('annotationModeCheckbox'),
    btnCollapseAnnotation: document.getElementById('btnCollapseAnnotation'),
    annActiveKey: document.getElementById('annActiveKey'),
    annSaveStatus: document.getElementById('annSaveStatus'),
    annTitleInput: document.getElementById('annTitleInput'),
    annNoteInput: document.getElementById('annNoteInput'),
    annModulePills: document.getElementById('annModulePills'),
    btnSaveAnnotation: document.getElementById('btnSaveAnnotation'),
    btnExportOfflineHtml: document.getElementById('btnExportOfflineHtml'),
  };

  let toastTimer = null;
  function showStatus(msg, isError = false, autoHideMs = 4200) {
    clearTimeout(toastTimer);
    els.statusBanner.textContent = msg;
    els.statusBanner.classList.remove('hidden', 'error');
    if (isError) els.statusBanner.classList.add('error');
    if (autoHideMs > 0) {
      toastTimer = setTimeout(() => {
        els.statusBanner.classList.add('hidden');
      }, autoHideMs);
    }
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCompMap() {
    return Object.fromEntries((state.bundle.competitors || []).map((c) => [c.id, c.label]));
  }

  function getBasePages() {
    return (state.bundle.pages || []).filter((p) => state.showMergedFrames || !p.mergedIntoLong);
  }

  function getFilteredPages() {
    const q = state.searchQuery.trim().toLowerCase();
    return getBasePages().filter((p) => {
      if (state.filterComp !== 'all' && p.competitor !== state.filterComp) return false;
      if (state.filterType !== 'all' && p.pageType !== state.filterType) return false;
      if (state.filterSubTag !== 'all' && (p.subTag || '') !== state.filterSubTag) return false;
      if (q) {
        const hay = `${p.displayTitle} ${p.pageTypeLabel} ${p.subTag || ''} ${p.competitor} ${p.note} ${p.ocrText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function getSubTagsForType(pageType) {
    const map = state.bundle.subTagsByPageType || {};
    const list = new Set();
    if (pageType && pageType !== 'all') {
      (map[pageType] || []).forEach((s) => list.add(s));
      getBasePages()
        .filter((p) => p.pageType === pageType && p.subTag)
        .forEach((p) => list.add(p.subTag));
    } else {
      Object.values(map).forEach((arr) => (arr || []).forEach((s) => list.add(s)));
      getBasePages()
        .filter((p) => p.subTag)
        .forEach((p) => list.add(p.subTag));
    }
    return Array.from(list);
  }

  /* =========================================================
   * 1. 筛选胶囊与紧凑画廊渲染
   * ========================================================= */
  function renderFilterChips() {
    const base = getBasePages();
    const compCounts = {};
    const typeCounts = {};
    base.forEach((p) => {
      compCounts[p.competitor] = (compCounts[p.competitor] || 0) + 1;
      typeCounts[p.pageType] = (typeCounts[p.pageType] || 0) + 1;
    });

    const comps = state.bundle.competitors || [];
    els.competitorFilterRow.innerHTML = [
      `<button type="button" class="filter-chip ${state.filterComp === 'all' ? 'active' : ''}" data-fcomp="all">全部 <span class="chip-num">${base.length}</span></button>`,
      ...comps
        .filter((c) => compCounts[c.id] > 0 || ['sugo', 'yalla', 'soulchill', 'yoho', 'chamet', 'timo'].includes(c.id))
        .map(
          (c) =>
            `<button type="button" class="filter-chip ${state.filterComp === c.id ? 'active' : ''}" data-fcomp="${esc(c.id)}">${esc(c.label)}${compCounts[c.id] ? ` <span class="chip-num">${compCounts[c.id]}</span>` : ''}</button>`
        ),
    ].join('');

    const ptypes = state.bundle.pageTypes || [];
    els.pageTypeFilterRow.innerHTML = [
      `<button type="button" class="filter-chip ${state.filterType === 'all' ? 'active' : ''}" data-ftype="all">全部页面</button>`,
      ...ptypes.map(
        (t) =>
          `<button type="button" class="filter-chip ${state.filterType === t.id ? 'active' : ''}" data-ftype="${esc(t.id)}">${esc(t.label)}${typeCounts[t.id] ? ` <span class="chip-num">${typeCounts[t.id]}</span>` : ''}</button>`
      ),
    ].join('');

    els.competitorFilterRow.querySelectorAll('[data-fcomp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filterComp = btn.getAttribute('data-fcomp');
        renderGallery();
      });
    });

    els.pageTypeFilterRow.querySelectorAll('[data-ftype]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filterType = btn.getAttribute('data-ftype');
        state.filterSubTag = 'all';
        renderGallery();
      });
    });

    // 第 3 行：子标签筛选（选中「后台看板」等有子标签的类型，或已有卡片打了子标签时展开）
    const subTagCounts = {};
    base
      .filter((p) => state.filterType === 'all' || p.pageType === state.filterType)
      .forEach((p) => {
        if (p.subTag) subTagCounts[p.subTag] = (subTagCounts[p.subTag] || 0) + 1;
      });

    const candidateSubTags =
      state.filterType === 'all'
        ? Array.from(new Set([...(state.bundle.subTagsByPageType?.['admin-dashboard'] || []), ...Object.keys(subTagCounts)]))
        : getSubTagsForType(state.filterType);

    const showSubBar = state.filterType !== 'all' || Object.keys(subTagCounts).length > 0;
    els.subTagFilterRowWrap.classList.toggle('hidden', !showSubBar);

    if (showSubBar) {
      els.subTagFilterRow.innerHTML = [
        `<button type="button" class="filter-chip ${state.filterSubTag === 'all' ? 'active' : ''}" data-fsub="all">全部子标</button>`,
        ...candidateSubTags.map(
          (st) =>
            `<button type="button" class="filter-chip ${state.filterSubTag === st ? 'active' : ''}" data-fsub="${esc(st)}">${esc(st)}${subTagCounts[st] ? ` <span class="chip-num">${subTagCounts[st]}</span>` : ''}</button>`
        ),
        `<button type="button" class="sub-filter-add-btn" id="btnFilterAddSubTag">+ 新增子标签</button>`,
      ].join('');

      els.subTagFilterRow.querySelectorAll('[data-fsub]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.filterSubTag = btn.getAttribute('data-fsub');
          renderGallery();
        });
      });

      const addSubBtn = document.getElementById('btnFilterAddSubTag');
      if (addSubBtn) {
        addSubBtn.addEventListener('click', async () => {
          const targetType = state.filterType === 'all' ? 'admin-dashboard' : state.filterType;
          const typeLabel =
            (state.bundle.pageTypes || []).find((t) => t.id === targetType)?.label || '后台看板';
          const val = window.prompt(`为「${typeLabel}」新增子标签（例如：VIP看板、活动返利）：`);
          if (val && val.trim()) {
            await addSubTagPreset(targetType, val.trim());
          }
        });
      }
    }
  }

  function renderScreenWall() {
    const pages = getFilteredPages();
    els.totalCountPill.textContent = `${pages.length} 页`;

    if (pages.length === 0) {
      const hasAny = (state.bundle.pages || []).length > 0;
      els.screenWall.innerHTML = `
        <div class="empty-wall-drop" id="emptyUploadHero">
          <div class="empty-wall-title">${hasAny ? '当前筛选条件下没有匹配的页面' : '飞书/微信截图后直接按 ⌘V 粘贴，或把图片/录屏拖进来'}</div>
          <div class="empty-wall-sub">${hasAny ? '点击上方「全部」重置筛选条件' : '人工只需复制粘贴或拖入 —— 自动切页面、拼长规则、打好中文分类与子标签'}</div>
        </div>
      `;
      const hero = document.getElementById('emptyUploadHero');
      if (hero && !hasAny) {
        hero.addEventListener('click', () => els.fileUploadInput.click());
      }
      return;
    }

    const compMap = getCompMap();

    els.screenWall.innerHTML = pages
      .map((p) => {
        const isUnset = p.competitor === 'unassigned';
        const compLabel = compMap[p.competitor] || '选竞品';
        const compCls = isUnset ? 'comp-unset' : 'comp-set';
        const isLandscape = (p.width || 0) > (p.height || 0) * 1.1;
        const cornerBadge =
          p.kind === 'stitched'
            ? '<span class="long-badge">长规则图</span>'
            : isLandscape
              ? `<span class="pc-badge">${p.pageType === 'admin-dashboard' ? 'PC/后台宽屏' : '宽屏/文档图'}</span>`
              : '';
        const subCls = p.subTag ? 'sub-set' : 'sub-unset';
        const subText = p.subTag ? esc(p.subTag) : '+ 子标签';
        const addedCls = state.justAddedSessionIds.has(p.sessionId) ? 'just-added' : '';

        return `
          <article class="screen-card ${addedCls}" data-card-uid="${esc(p.uid)}">
            <div class="screen-thumb-box ${isLandscape ? 'is-landscape' : ''}" data-open-drawer="${esc(p.uid)}">
              ${cornerBadge}
              <img src="${esc(p.imagePath)}" alt="${esc(p.displayTitle)}" width="${p.width || 440}" height="${p.height || 956}" loading="lazy" />
              <button type="button" class="card-del-btn" data-delete-uid="${esc(p.uid)}" title="删除此页">×</button>
            </div>
            <div class="screen-card-meta">
              <div class="screen-card-title" data-open-drawer="${esc(p.uid)}" title="${esc(p.displayTitle)}">${esc(p.displayTitle)}</div>
              <div class="screen-card-pills">
                <button type="button" class="tag-pill ${compCls}" data-tag-pop="competitor" data-uid="${esc(p.uid)}" title="点击一键切换竞品">
                  <span>${esc(compLabel)}</span><span>▾</span>
                </button>
                <button type="button" class="tag-pill type-pill color-${esc(p.pageColor || 'slate')}" data-tag-pop="pageType" data-uid="${esc(p.uid)}" title="点击一键切换页面类型">
                  <span>${esc(p.pageTypeLabel)}</span><span>▾</span>
                </button>
                <button type="button" class="tag-pill ${subCls}" data-tag-pop="subTag" data-uid="${esc(p.uid)}" title="点击选择或新增子标签（如 VIP看板）">
                  <span>${subText}</span>${p.subTag ? '<span>▾</span>' : ''}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    els.screenWall.querySelectorAll('[data-open-drawer]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-uid]') || e.target.closest('[data-tag-pop]')) return;
        openDrawer(el.getAttribute('data-open-drawer'));
      });
    });

    els.screenWall.querySelectorAll('[data-tag-pop]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTagPopover(btn, btn.getAttribute('data-uid'), btn.getAttribute('data-tag-pop'));
      });
    });

    els.screenWall.querySelectorAll('[data-delete-uid]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deletePageByUid(btn.getAttribute('data-delete-uid'));
      });
    });
  }

  function renderGallery() {
    renderFilterChips();
    renderScreenWall();
    if (state.activeDrawerUid) {
      renderDrawerContent();
    }
  }

  /* =========================================================
   * 2. 点击胶囊一键秒换标签 (Popover)
   * ========================================================= */
  function findPage(uid) {
    return (state.bundle.pages || []).find((p) => p.uid === uid) || null;
  }

  async function addSubTagPreset(pageType, subTag) {
    const clean = String(subTag || '').trim().slice(0, 24);
    if (!clean) return;
    if (!state.bundle.subTagsByPageType) state.bundle.subTagsByPageType = {};
    const cur = state.bundle.subTagsByPageType[pageType] || [];
    if (!cur.includes(clean)) {
      state.bundle.subTagsByPageType[pageType] = [...cur, clean];
    }
    renderGallery();
    if (!state.isOnline) return;
    try {
      const res = await fetch('api/tags/subtag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageType, subTag: clean, action: 'add' }),
      });
      const data = await res.json();
      if (res.ok && data.bundle) {
        state.bundle = data.bundle;
        renderGallery();
        showStatus(`已新增子标签「${clean}」`);
      }
    } catch {
      // ignore
    }
  }

  function openTagPopover(anchorEl, uid, kind) {
    const page = findPage(uid);
    if (!page) return;
    state.popoverTarget = { uid, sessionId: page.sessionId, itemId: page.id, kind };
    els.tagPopoverAddBox.classList.add('hidden');

    if (kind === 'competitor') {
      els.tagPopoverTitle.textContent = '点选归属竞品（点击即保存）';
      els.tagPopoverOptions.innerHTML = (state.bundle.competitors || [])
        .filter((c) => c.id !== 'unassigned')
        .map(
          (c) =>
            `<button type="button" class="pop-opt-btn ${page.competitor === c.id ? 'active' : ''}" data-pick-val="${esc(c.id)}">${esc(c.label)}</button>`
        )
        .join('');
    } else if (kind === 'pageType') {
      els.tagPopoverTitle.textContent = '点选页面分类（点击即保存）';
      els.tagPopoverOptions.innerHTML = (state.bundle.pageTypes || [])
        .map(
          (t) =>
            `<button type="button" class="pop-opt-btn ${page.pageType === t.id ? 'active' : ''}" data-pick-val="${esc(t.id)}">${esc(t.label)}</button>`
        )
        .join('');
    } else {
      els.tagPopoverTitle.textContent = `选择或新增「${page.pageTypeLabel}」子标签`;
      const subs = getSubTagsForType(page.pageType);
      els.tagPopoverOptions.innerHTML = [
        ...subs.map(
          (st) =>
            `<button type="button" class="pop-opt-btn ${page.subTag === st ? 'active' : ''}" data-pick-val="${esc(st)}">${esc(st)}</button>`
        ),
        page.subTag
          ? `<button type="button" class="pop-opt-btn" data-pick-val="">清除子标签</button>`
          : '',
      ].join('');
      els.tagPopoverAddBox.classList.remove('hidden');
      els.newSubTagInput.value = '';
      setTimeout(() => els.newSubTagInput.focus(), 30);
    }

    els.tagPopover.classList.remove('hidden');
    const rect = anchorEl.getBoundingClientRect();
    const popW = 268;
    const left = Math.max(10, Math.min(window.innerWidth - popW - 10, rect.left));
    const top =
      rect.bottom + 270 > window.innerHeight ? Math.max(10, rect.top - 250) : rect.bottom + 5;
    els.tagPopover.style.left = `${left}px`;
    els.tagPopover.style.top = `${top}px`;

    els.tagPopoverOptions.querySelectorAll('[data-pick-val]').forEach((optBtn) => {
      optBtn.addEventListener('click', async () => {
        const val = optBtn.getAttribute('data-pick-val');
        els.tagPopover.classList.add('hidden');
        if (kind === 'competitor') {
          await updatePageField(page, { competitor: val, applyCompetitorToSession: true });
        } else if (kind === 'pageType') {
          await updatePageField(page, { pageType: val });
        } else {
          await updatePageField(page, { subTag: val });
        }
      });
    });
  }

  async function updatePageField(page, patch) {
    // 本地乐观更新，零延迟响应
    if (patch.competitor) {
      (state.bundle.pages || []).forEach((p) => {
        if (p.sessionId === page.sessionId) p.competitor = patch.competitor;
      });
    }
    if (patch.pageType) {
      const pt = (state.bundle.pageTypes || []).find((x) => x.id === patch.pageType);
      if (pt) {
        page.pageType = pt.id;
        page.pageTypeLabel = pt.label;
        page.pageColor = pt.color;
        page.module = pt.module;
      }
    }
    if (typeof patch.subTag === 'string') {
      const cleanSub = patch.subTag.trim().slice(0, 24);
      page.subTag = cleanSub;
      if (cleanSub) {
        if (!state.bundle.subTagsByPageType) state.bundle.subTagsByPageType = {};
        const arr = state.bundle.subTagsByPageType[page.pageType] || [];
        if (!arr.includes(cleanSub)) state.bundle.subTagsByPageType[page.pageType] = [...arr, cleanSub];
      }
    }
    if (typeof patch.displayTitle === 'string') page.displayTitle = patch.displayTitle;
    if (typeof patch.note === 'string') page.note = patch.note;
    renderGallery();

    if (!state.isOnline) return;
    try {
      const res = await fetch('api/pages/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: page.sessionId,
          itemId: page.id,
          ...patch,
        }),
      });
      const data = await res.json();
      if (res.ok && data.bundle) {
        state.bundle = data.bundle;
        renderGallery();
      }
    } catch {
      showStatus('离线状态下仅当前页面临时生效', true);
    }
  }

  async function deletePageByUid(uid) {
    const page = findPage(uid);
    if (!page || !state.isOnline) return;

    if (state.activeDrawerUid === uid) {
      closeDrawer();
    }
    try {
      const res = await fetch('api/pages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: page.sessionId, itemId: page.id }),
      });
      const data = await res.json();
      if (res.ok && data.bundle) {
        state.bundle = data.bundle;
        renderGallery();
        showStatus(`已删除页面「${page.displayTitle}」`);
      }
    } catch (err) {
      showStatus(`删除失败：${err.message || err}`, true);
    }
  }

  /* =========================================================
   * 3. 右侧高清详情抽屉（点击卡片打开，支持键盘左右翻页）
   * ========================================================= */
  function openDrawer(uid) {
    state.activeDrawerUid = uid;
    els.detailDrawerWrap.classList.remove('hidden');
    renderDrawerContent();
  }

  function closeDrawer() {
    state.activeDrawerUid = null;
    els.detailDrawerWrap.classList.add('hidden');
  }

  function renderDrawerContent() {
    const page = findPage(state.activeDrawerUid);
    if (!page) {
      closeDrawer();
      return;
    }

    const compMap = getCompMap();
    const isUnset = page.competitor === 'unassigned';
    els.drawerTitleInput.value = page.displayTitle || '';
    els.drawerPreviewImg.src = page.imagePath;
    els.drawerNoteInput.value = page.note || '';
    els.drawerOcrText.value = page.ocrText || '（未识别到明显文字）';

    els.drawerTagPills.innerHTML = `
      <button type="button" class="tag-pill ${isUnset ? 'comp-unset' : 'comp-set'}" id="drawerCompPill">
        <span>${esc(compMap[page.competitor] || '选竞品')}</span><span>▾</span>
      </button>
      <button type="button" class="tag-pill type-pill color-${esc(page.pageColor || 'slate')}" id="drawerTypePill">
        <span>${esc(page.pageTypeLabel)}</span><span>▾</span>
      </button>
      <button type="button" class="tag-pill ${page.subTag ? 'sub-set' : 'sub-unset'}" id="drawerSubPill">
        <span>${page.subTag ? esc(page.subTag) : '+ 子标签'}</span>${page.subTag ? '<span>▾</span>' : ''}
      </button>
    `;

    document.getElementById('drawerCompPill').addEventListener('click', (e) => {
      e.stopPropagation();
      openTagPopover(e.currentTarget, page.uid, 'competitor');
    });
    document.getElementById('drawerTypePill').addEventListener('click', (e) => {
      e.stopPropagation();
      openTagPopover(e.currentTarget, page.uid, 'pageType');
    });
    document.getElementById('drawerSubPill').addEventListener('click', (e) => {
      e.stopPropagation();
      openTagPopover(e.currentTarget, page.uid, 'subTag');
    });

    const hl = page.highlights && page.highlights.length > 0
      ? page.highlights
      : ['自动提取完成，可在下方查看完整文字'];
    els.drawerHighlights.innerHTML = hl.map((h) => `<span class="hl-chip">${esc(h)}</span>`).join('');
  }

  function stepDrawer(delta) {
    if (!state.activeDrawerUid) return;
    const list = getFilteredPages();
    const idx = list.findIndex((p) => p.uid === state.activeDrawerUid);
    if (idx === -1 || list.length <= 1) return;
    const nextIdx = (idx + delta + list.length) % list.length;
    state.activeDrawerUid = list[nextIdx].uid;
    renderDrawerContent();
  }

  /* =========================================================
   * 4. 剪贴板粘贴 (⌘V) 与批量多文件上传（图片 + 视频全自动入墙）
   * ========================================================= */
  function makePasteFileName(mimeType, idx = 0) {
    const extMap = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const ext = extMap[mimeType] || '.png';
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return idx > 0 ? `paste-${stamp}-${idx + 1}${ext}` : `paste-${stamp}${ext}`;
  }

  function normalizeClipboardFile(blobOrFile, idx = 0) {
    const rawName = (blobOrFile.name || '').trim();
    const isGeneric = !rawName || /^image\.(png|jpe?g|webp|gif)$/i.test(rawName) || rawName === 'blob';
    const finalName = isGeneric ? makePasteFileName(blobOrFile.type, idx) : rawName;
    return new File([blobOrFile], finalName, { type: blobOrFile.type || 'image/png' });
  }

  async function uploadMultipleFiles(fileList, sourceLabel = '上传') {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0) return;
    if (!state.isOnline) {
      showStatus('请双击 start-workbench.command 启动本地服务后再粘贴或上传图片', true);
      return;
    }

    let successCount = 0;
    const newlyProcessed = [];
    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      showStatus(`正在自动识别${sourceLabel}图片 (${i + 1}/${files.length})：${f.name} ...`, false, 0);
      try {
        const res = await fetch('api/upload-recording', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURIComponent(f.name),
          },
          body: f,
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || '处理失败');
        state.bundle = data.bundle;
        if (Array.isArray(data.processedIds)) {
          newlyProcessed.push(...data.processedIds);
        }
        successCount += 1;
        renderGallery();
      } catch (err) {
        showStatus(`文件 ${f.name} 处理出错：${err.message || err}`, true, 6000);
      }
    }

    if (successCount > 0) {
      // 若当前筛选条件把刚粘贴进来的新图挡住了，自动切回「全部」确保新图立刻可见
      if (newlyProcessed.length > 0) {
        state.justAddedSessionIds = new Set(newlyProcessed);
        const visibleNow = getFilteredPages();
        const isNewVisible = visibleNow.some((p) => state.justAddedSessionIds.has(p.sessionId));
        if (!isNewVisible) {
          state.filterComp = 'all';
          state.filterType = 'all';
          state.filterSubTag = 'all';
          state.searchQuery = '';
          els.searchInput.value = '';
        }
        renderGallery();
        setTimeout(() => {
          state.justAddedSessionIds.clear();
          renderScreenWall();
        }, 2800);
      }
      showStatus(`已完成 ${successCount} 张${sourceLabel}素材自动识别打标！点击卡片底部胶囊可随时秒换分类。`);
    }
  }

  /* =========================================================
   * 5. 原型注释编辑器（默认收起关闭拦截，保留持久化与导出）
   * ========================================================= */
  function collectDomAnnotations() {
    document.querySelectorAll('.annotatable[data-spec-key]').forEach((node) => {
      const key = node.getAttribute('data-spec-key');
      if (key && !annotationState.items[key]) {
        annotationState.items[key] = {
          title: node.getAttribute('data-spec-title') || key,
          note: node.getAttribute('data-spec-note') || '',
        };
      }
    });
  }

  function syncAnnotationsToDom() {
    const nodes = Array.from(document.querySelectorAll('.annotatable[data-spec-key]'));
    nodes.forEach((node) => {
      const key = node.getAttribute('data-spec-key');
      const data = annotationState.items[key];
      if (!data) return;
      node.setAttribute('data-spec-title', data.title || '');
      node.setAttribute('data-spec-note', data.note || '');
      node.classList.toggle('annotation-selected', key === annotationState.activeKey);
    });
    els.annModulePills.innerHTML = nodes
      .map((n) => {
        const k = n.getAttribute('data-spec-key');
        const it = annotationState.items[k] || {};
        return `<button type="button" class="annotation-pill-btn ${k === annotationState.activeKey ? 'active' : ''}" data-ann-pill="${esc(k)}">${esc(it.title || k)}</button>`;
      })
      .join('');
    els.annModulePills.querySelectorAll('[data-ann-pill]').forEach((b) => {
      b.addEventListener('click', () => selectAnnotatableKey(b.getAttribute('data-ann-pill')));
    });
  }

  function selectAnnotatableKey(key) {
    if (!key || !annotationState.items[key]) return;
    annotationState.activeKey = key;
    els.annActiveKey.textContent = key;
    els.annTitleInput.value = annotationState.items[key].title || '';
    els.annNoteInput.value = annotationState.items[key].note || '';
    syncAnnotationsToDom();
  }

  function setAnnotationMode(on) {
    annotationState.modeOn = Boolean(on);
    document.body.classList.toggle('annotation-mode', annotationState.modeOn);
    els.annotationModeCheckbox.checked = annotationState.modeOn;
    if (annotationState.modeOn) {
      els.annotationPanel.classList.remove('collapsed');
      els.btnCollapseAnnotation.textContent = '—';
    }
  }

  async function loadAnnotations() {
    collectDomAnnotations();
    if (window.__EMBEDDED_ANNOTATIONS__?.items) {
      Object.assign(annotationState.items, window.__EMBEDDED_ANNOTATIONS__.items);
    } else if (state.isOnline) {
      try {
        const res = await fetch('api/annotations');
        if (res.ok) {
          const d = await res.json();
          if (d?.items) Object.assign(annotationState.items, d.items);
        }
      } catch {
        // ignore
      }
    }
    syncAnnotationsToDom();
    const first = Object.keys(annotationState.items)[0];
    if (first) selectAnnotatableKey(first);
  }

  async function saveAnnotations() {
    if (annotationState.activeKey) {
      annotationState.items[annotationState.activeKey] = {
        title: els.annTitleInput.value.trim(),
        note: els.annNoteInput.value,
      };
    }
    syncAnnotationsToDom();
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ items: annotationState.items }));
    } catch {
      // ignore
    }
    if (state.isOnline) {
      const res = await fetch('api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: annotationState.items }),
      });
      els.annSaveStatus.textContent = res.ok ? '已保存' : '草稿已存';
    }
  }

  async function exportOfflineHtml() {
    await saveAnnotations();
    let cssText = '';
    try {
      const r = await fetch('css/style.css');
      if (r.ok) cssText = await r.text();
    } catch {
      // ignore
    }
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('link[rel="stylesheet"]').forEach((l) => l.remove());
    if (cssText) {
      const st = document.createElement('style');
      st.textContent = cssText;
      clone.querySelector('head')?.appendChild(st);
    }
    const emb = document.createElement('script');
    emb.textContent = `window.__EMBEDDED_ANNOTATIONS__=${JSON.stringify({ items: annotationState.items })};window.__EMBEDDED_SESSIONS__=${JSON.stringify(state.bundle)};`;
    const fsScript = clone.querySelector('body script');
    fsScript?.parentNode?.insertBefore(emb, fsScript);

    const blob = new Blob(['<!DOCTYPE html>\n' + clone.outerHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laka-competitor-gallery-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setupEvents() {
    // 密度列数切换
    document.querySelectorAll('[data-cols]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.cols = Number(btn.getAttribute('data-cols')) || 6;
        document.querySelectorAll('[data-cols]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        els.screenWall.className = `screen-wall cols-${state.cols} annotatable`;
      });
    });

    els.searchInput.addEventListener('input', () => {
      state.searchQuery = els.searchInput.value;
      renderScreenWall();
    });

    els.chkShowMerged.addEventListener('change', () => {
      state.showMergedFrames = els.chkShowMerged.checked;
      renderGallery();
    });

    els.btnUploadTrigger.addEventListener('click', () => els.fileUploadInput.click());
    els.fileUploadInput.addEventListener('change', (e) => {
      if (e.target.files?.length) uploadMultipleFiles(e.target.files, '上传');
      e.target.value = '';
    });

    // 全局支持 Command+V / Ctrl+V 直接粘贴飞书/系统复制的截图
    document.addEventListener('paste', (e) => {
      if (annotationState.modeOn) return;
      const pastedImages = [];
      if (e.clipboardData?.items) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            if (blob) pastedImages.push(normalizeClipboardFile(blob, pastedImages.length));
          }
        }
      }
      if (pastedImages.length === 0 && e.clipboardData?.files) {
        for (const f of Array.from(e.clipboardData.files)) {
          if (f.type && f.type.startsWith('image/')) {
            pastedImages.push(normalizeClipboardFile(f, pastedImages.length));
          }
        }
      }

      if (pastedImages.length > 0) {
        e.preventDefault();
        uploadMultipleFiles(pastedImages, '剪贴板粘贴');
      } else if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        showStatus('剪贴板中未检测到图片：请先在飞书/桌面复制截图，再切回本页按 ⌘V 粘贴', true);
      }
    });

    // 顶栏「粘贴截图 (⌘V)」按钮：鼠标一键读取系统剪贴板图片
    if (els.btnPasteClipboard) {
      els.btnPasteClipboard.addEventListener('click', async () => {
        if (!navigator.clipboard || !navigator.clipboard.read) {
          showStatus('当前浏览器不支持按钮读取剪贴板，请直接按键盘 ⌘V (或 Ctrl+V) 粘贴图片', true);
          return;
        }
        try {
          const clipItems = await navigator.clipboard.read();
          const files = [];
          for (const ci of clipItems) {
            const imgType = ci.types.find((t) => t.startsWith('image/'));
            if (imgType) {
              const blob = await ci.getType(imgType);
              files.push(normalizeClipboardFile(blob, files.length));
            }
          }
          if (files.length === 0) {
            showStatus('剪贴板中暂时没有复制的图片，请先截图复制后再试', true);
            return;
          }
          await uploadMultipleFiles(files, '剪贴板粘贴');
        } catch {
          showStatus('请直接按键盘 ⌘V（Mac）或 Ctrl+V 直接粘贴刚才复制的图片', false, 5000);
        }
      });
    }

    // 全屏拖放上传
    let dragDepth = 0;
    window.addEventListener('dragenter', (e) => {
      if (annotationState.modeOn) return;
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragDepth += 1;
        els.dragOverlay.classList.remove('hidden');
      }
    });
    window.addEventListener('dragover', (e) => {
      if (annotationState.modeOn) return;
      e.preventDefault();
    });
    window.addEventListener('dragleave', () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) els.dragOverlay.classList.add('hidden');
    });
    window.addEventListener('drop', (e) => {
      if (annotationState.modeOn) return;
      e.preventDefault();
      dragDepth = 0;
      els.dragOverlay.classList.add('hidden');
      if (e.dataTransfer?.files?.length) uploadMultipleFiles(e.dataTransfer.files);
    });

    // 同步当前筛选视图到收件箱
    els.btnSyncInbox.addEventListener('click', async () => {
      const visible = getFilteredPages();
      if (visible.length === 0) {
        showStatus('当前没有可同步的页面', true);
        return;
      }
      try {
        const res = await fetch('api/export-to-inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uids: visible.map((p) => p.uid) }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || '同步失败');
        showStatus(`已将当前筛选的 ${data.copiedCount} 页自动命名备份至 ../laka/pm-inbox/raw/`);
      } catch (err) {
        showStatus(`同步失败：${err.message || err}`, true);
      }
    });

    // 点击空白关闭标签浮层
    document.addEventListener('click', (e) => {
      if (!els.tagPopover.classList.contains('hidden') && !els.tagPopover.contains(e.target)) {
        els.tagPopover.classList.add('hidden');
      }
    });

    // 浮层内新增子标签并立即绑定到当前卡片
    const commitNewSubTagFromPopover = async () => {
      const val = els.newSubTagInput.value.trim();
      if (!val || !state.popoverTarget) return;
      const page = findPage(state.popoverTarget.uid);
      els.tagPopover.classList.add('hidden');
      if (page) {
        await updatePageField(page, { subTag: val });
        showStatus(`已新增并标记子标签「${val}」`);
      }
    };
    els.btnAddNewSubTag.addEventListener('click', commitNewSubTagFromPopover);
    els.newSubTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitNewSubTagFromPopover();
      }
    });

    // 抽屉交互
    els.btnCloseDrawer.addEventListener('click', closeDrawer);
    els.detailBackdrop.addEventListener('click', closeDrawer);
    els.btnPrevPage.addEventListener('click', () => stepDrawer(-1));
    els.btnNextPage.addEventListener('click', () => stepDrawer(1));
    els.btnDeleteCurrent.addEventListener('click', () => {
      if (state.activeDrawerUid) deletePageByUid(state.activeDrawerUid);
    });

    els.drawerTitleInput.addEventListener('change', () => {
      const page = findPage(state.activeDrawerUid);
      if (page && els.drawerTitleInput.value.trim()) {
        updatePageField(page, { displayTitle: els.drawerTitleInput.value.trim() });
      }
    });

    els.drawerNoteInput.addEventListener('change', () => {
      const page = findPage(state.activeDrawerUid);
      if (page) updatePageField(page, { note: els.drawerNoteInput.value });
    });

    els.btnCopyDrawerOcr.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(els.drawerOcrText.value || '');
        showStatus('已复制页面文案！');
      } catch {
        els.drawerOcrText.select();
        document.execCommand('copy');
        showStatus('已复制页面文案！');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!state.activeDrawerUid) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'ArrowLeft') stepDrawer(-1);
      if (e.key === 'ArrowRight') stepDrawer(1);
    });

    // 原型注释面板与拖拽缩放
    document.addEventListener(
      'click',
      (e) => {
        if (!annotationState.modeOn) return;
        if (els.annotationPanel.contains(e.target)) return;
        const mod = e.target.closest('.annotatable[data-spec-key]');
        if (mod) {
          e.preventDefault();
          e.stopPropagation();
          selectAnnotatableKey(mod.getAttribute('data-spec-key'));
        }
      },
      true
    );

    els.annotationModeCheckbox.addEventListener('change', (e) => setAnnotationMode(e.target.checked));
    els.btnCollapseAnnotation.addEventListener('click', () => {
      const col = els.annotationPanel.classList.toggle('collapsed');
      els.btnCollapseAnnotation.textContent = col ? '+' : '—';
    });
    els.btnSaveAnnotation.addEventListener('click', saveAnnotations);
    els.btnExportOfflineHtml.addEventListener('click', exportOfflineHtml);

    let drag = null;
    let rsz = null;
    els.annotationDragHandle.addEventListener('mousedown', (e) => {
      if (e.target.closest('input,button,label')) return;
      const r = els.annotationPanel.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top };
      e.preventDefault();
    });
    els.annotationResizeHandle.addEventListener('mousedown', (e) => {
      const r = els.annotationPanel.getBoundingClientRect();
      rsz = { x: e.clientX, y: e.clientY, w: r.width, h: r.height };
      e.preventDefault();
      e.stopPropagation();
    });
    window.addEventListener('mousemove', (e) => {
      if (drag) {
        els.annotationPanel.style.left = `${Math.max(8, drag.l + e.clientX - drag.x)}px`;
        els.annotationPanel.style.top = `${Math.max(8, drag.t + e.clientY - drag.y)}px`;
        els.annotationPanel.style.right = 'auto';
        els.annotationPanel.style.bottom = 'auto';
      } else if (rsz) {
        els.annotationPanel.style.width = `${Math.max(240, rsz.w + e.clientX - rsz.x)}px`;
        els.annotationPanel.style.height = `${Math.max(200, rsz.h + e.clientY - rsz.y)}px`;
      }
    });
    window.addEventListener('mouseup', () => {
      drag = null;
      rsz = null;
    });
  }

  async function init() {
    setupEvents();
    setAnnotationMode(false);

    if (state.isOnline && !window.__EMBEDDED_SESSIONS__) {
      try {
        const res = await fetch('api/sessions');
        if (res.ok) state.bundle = await res.json();
      } catch {
        // fallback to sessions-data.js
      }
    }

    renderGallery();
    await loadAnnotations();
  }

  init();
})();
