(function () {
  "use strict";

  const DEFAULT_CONFIG = {
    annotationsUrl: "annotations.json",
    saveUrl: "/__prototype_annotations/save",
    storageKey: "prototype-agent-annotations",
    enabled: true,
    startOpen: true,
  };

  const config = Object.assign({}, DEFAULT_CONFIG, window.PrototypeAnnotationConfig || {});
  if (!config.enabled) return;

  const state = {
    doc: { version: "1.0", annotations: [] },
    activeId: null,
    editingId: null,
    adding: false,
    rebindingId: null,
    panelOpen: config.startOpen,
    saveState: "正在加载注释",
    elements: {},
    markers: new Map(),
  };

  const runtimeSelector = ".paa-panel, .paa-toggle, .paa-marker-layer, .paa-selection-banner";

  const STATUS_LABELS = {
    active: "生效中",
    "needs-review": "待检查",
    orphaned: "目标失效",
    deprecated: "已停用",
  };

  const CONTEXT_LABELS = {
    userRole: "用户角色",
    userLevel: "用户等级",
    userState: "用户状态",
    conversationStatus: "会话状态",
    pageState: "页面状态",
    componentState: "组件状态",
    modal: "弹窗",
    tab: "标签页",
    device: "设备",
    viewport: "视口",
  };

  const DISPLAY_VALUES = {
    chat: "聊天页",
    accepted: "已接受",
    pending: "待处理",
    default: "默认",
    male: "男性用户",
    female: "女性用户",
    mobile: "移动端",
    desktop: "桌面端",
  };

  function now() {
    return new Date().toISOString();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function stableSlug(value) {
    return String(value || "annotation-target")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "annotation-target";
  }

  function uniqueAnchor(base) {
    const root = stableSlug(base);
    let candidate = root;
    let index = 2;
    while (document.querySelector(`[data-annotation-id="${cssEscape(candidate)}"]`)) {
      candidate = `${root}-${index}`;
      index += 1;
    }
    return candidate;
  }

  function uniqueAnnotationId() {
    let candidate = `ann-manual-${Date.now().toString(36)}`;
    let index = 2;
    while (state.doc.annotations.some((item) => item.id === candidate)) {
      candidate = `ann-manual-${Date.now().toString(36)}-${index}`;
      index += 1;
    }
    return candidate;
  }

  function selectorIsUnique(selector) {
    try {
      return document.querySelectorAll(selector).length === 1;
    } catch (error) {
      return false;
    }
  }

  function buildStructureSelector(element) {
    const segments = [];
    let current = element;

    while (current && current !== document.documentElement) {
      if (current.hasAttribute("data-annotation-id")) {
        segments.unshift(`[data-annotation-id="${cssEscape(current.getAttribute("data-annotation-id"))}"]`);
        break;
      }
      if (current.id) {
        segments.unshift(`#${cssEscape(current.id)}`);
        break;
      }

      let segment = current.tagName.toLowerCase();
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((item) => item.tagName === current.tagName);
        if (siblings.length > 1) segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      segments.unshift(segment);
      const selector = segments.join(" > ");
      if (selectorIsUnique(selector)) return selector;
      current = parent;
    }

    return segments.join(" > ");
  }

  function targetForElement(element) {
    const annotationId = element.getAttribute("data-annotation-id");
    if (annotationId) {
      return {
        annotationId,
        selector: `[data-annotation-id="${annotationId}"]`,
      };
    }
    if (element.id) return { selector: `#${cssEscape(element.id)}` };

    const testId = element.getAttribute("data-testid");
    if (testId) {
      const selector = `[data-testid="${cssEscape(testId)}"]`;
      if (selectorIsUnique(selector)) return { selector };
    }
    return { selector: buildStructureSelector(element) };
  }

  function pageKey() {
    const pathName = window.location.pathname.split("/").filter(Boolean).pop();
    return String(config.page || document.body.dataset.page || pathName || "当前页面").replace(/\.html?$/i, "");
  }

  function suggestedTitle(element) {
    const candidates = [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("alt"),
      element.getAttribute("placeholder"),
      element.textContent,
    ];
    const value = candidates.find((item) => String(item || "").trim());
    if (!value) return "新注释";
    const normalized = String(value).replace(/\s+/g, " ").trim();
    return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized;
  }

  function annotationNumber(annotation) {
    const index = state.doc.annotations.findIndex((item) => item.id === annotation.id);
    return index + 1;
  }

  function displayValue(value) {
    const normalized = String(value == null ? "" : value);
    return DISPLAY_VALUES[normalized.toLowerCase()] || normalized;
  }

  function getTargetElement(annotation) {
    const target = annotation.target || {};
    if (target.annotationId) {
      return document.querySelector(`[data-annotation-id="${cssEscape(target.annotationId)}"]`);
    }
    if (target.selector) {
      try {
        return document.querySelector(target.selector);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  function isRuntimeElement(element) {
    return Boolean(element && element.closest && element.closest(runtimeSelector));
  }

  function isElementAnnotated(element) {
    return state.doc.annotations.some((annotation) => getTargetElement(annotation) === element);
  }

  function markerPosition(rect, placed, preferredOffset = 0) {
    const gap = 26;
    const offsets = [
      [0, 0],
      [-gap, 0],
      [0, gap],
      [-gap, gap],
      [gap, 0],
      [gap, gap],
      [-gap * 2, 0],
      [-gap * 2, gap],
      [0, gap * 2],
      [-gap, gap * 2],
      [gap, gap * 2],
      [-gap * 2, gap * 2],
    ];
    const orderedOffsets = offsets.slice(preferredOffset).concat(offsets.slice(0, preferredOffset));

    for (const [offsetX, offsetY] of orderedOffsets) {
      const point = {
        x: Math.max(12, Math.min(window.innerWidth - 12, rect.right + offsetX)),
        y: Math.max(12, Math.min(window.innerHeight - 12, rect.top + offsetY)),
      };
      const collides = placed.some((item) => {
        const deltaX = item.x - point.x;
        const deltaY = item.y - point.y;
        return (deltaX * deltaX) + (deltaY * deltaY) < 24 * 24;
      });
      if (!collides) return point;
    }

    return {
      x: Math.max(12, Math.min(window.innerWidth - 12, rect.right)),
      y: Math.max(12, Math.min(window.innerHeight - 12, rect.top)),
    };
  }

  async function loadAnnotations() {
    try {
      const response = await fetch(config.annotationsUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.doc = await response.json();
      state.doc.annotations = Array.isArray(state.doc.annotations) ? state.doc.annotations : [];
      state.saveState = `已加载 ${state.doc.annotations.length} 条注释`;
    } catch (error) {
      const cached = window.localStorage.getItem(config.storageKey);
      if (cached) {
        state.doc = JSON.parse(cached);
        state.doc.annotations = Array.isArray(state.doc.annotations) ? state.doc.annotations : [];
        state.saveState = "已加载浏览器草稿，项目文件暂不可用";
      } else {
        state.doc = { version: "1.0", updatedAt: now(), annotations: [] };
        state.saveState = "未找到注释文件";
      }
    }
  }

  async function persist() {
    state.doc.updatedAt = now();
    window.localStorage.setItem(config.storageKey, JSON.stringify(state.doc));
    state.saveState = "正在保存…";
    renderPanel();

    try {
      const response = await fetch(config.saveUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state.doc),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.saveState = "已保存到项目文件";
    } catch (error) {
      state.saveState = "项目保存服务不可用，已暂存为浏览器草稿";
    }
    renderPanel();
  }

  function createShell() {
    const markerLayer = document.createElement("div");
    markerLayer.className = "paa-marker-layer";
    document.body.appendChild(markerLayer);

    const panel = document.createElement("aside");
    panel.className = "paa-panel";
    document.body.appendChild(panel);

    const toggle = document.createElement("button");
    toggle.className = "paa-toggle";
    toggle.type = "button";
    toggle.title = "打开或关闭注释器";
    toggle.textContent = "注";
    toggle.addEventListener("click", () => {
      if (state.panelOpen) {
        closeAnnotations();
        return;
      }
      state.panelOpen = true;
      render();
    });
    document.body.appendChild(toggle);

    state.elements = { markerLayer, panel, toggle };
  }

  function renderMarkers() {
    state.elements.markerLayer.innerHTML = "";
    state.markers.clear();
    if (!state.panelOpen) return;

    const placed = [];
    const targetCounts = new Map();

    state.doc.annotations.forEach((annotation) => {
      if (annotation.status === "deprecated") return;
      const target = getTargetElement(annotation);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;

      const targetIndex = targetCounts.get(target) || 0;
      targetCounts.set(target, targetIndex + 1);
      const position = markerPosition(rect, placed, Math.min(targetIndex, 11));
      placed.push(position);

      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `paa-marker${state.activeId === annotation.id ? " is-active" : ""}`;
      marker.textContent = String(annotationNumber(annotation));
      marker.title = annotation.title || annotation.id;
      marker.style.left = `${position.x}px`;
      marker.style.top = `${position.y}px`;
      marker.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        focusAnnotation(annotation.id, { scrollPanel: true, scrollTarget: false });
      });
      state.elements.markerLayer.appendChild(marker);
      state.markers.set(annotation.id, marker);
    });
  }

  function renderPanel() {
    const panel = state.elements.panel;
    panel.classList.toggle("is-hidden", !state.panelOpen);
    if (!state.panelOpen) return;

    const items = state.doc.annotations.map((annotation) => renderPanelItem(annotation)).join("");
    panel.innerHTML = `
      <div class="paa-panel-header">
        <div>
          <h2 class="paa-panel-title">原型注释</h2>
          <p class="paa-panel-subtitle">共 ${state.doc.annotations.length} 条</p>
        </div>
        <div class="paa-header-actions">
          <button class="paa-button is-primary" type="button" data-paa-action="add">新增注释</button>
          <button class="paa-button" type="button" data-paa-action="close">关闭</button>
        </div>
      </div>
      <div class="paa-panel-body">
        ${items || '<p class="paa-empty">暂无注释，点击“新增注释”后选择页面元素。</p>'}
      </div>
      <div class="paa-save-state">${escapeHtml(state.saveState)}</div>
    `;

    panel.querySelector('[data-paa-action="close"]')?.addEventListener("click", () => {
      closeAnnotations();
    });

    panel.querySelector('[data-paa-action="add"]')?.addEventListener("click", startAdd);

    panel.querySelectorAll("[data-paa-focus]").forEach((button) => {
      button.addEventListener("click", () => focusAnnotation(button.getAttribute("data-paa-focus"), { scrollPanel: false }));
    });
    panel.querySelectorAll("[data-paa-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-paa-toggle");
        if (state.activeId === id && state.editingId !== id) {
          state.activeId = null;
          render();
          return;
        }
        focusAnnotation(id, { scrollPanel: false });
      });
    });
    panel.querySelectorAll("[data-paa-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingId = button.getAttribute("data-paa-edit");
        renderPanel();
      });
    });
    panel.querySelectorAll("[data-paa-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteAnnotation(button.getAttribute("data-paa-delete")));
    });
    panel.querySelectorAll("[data-paa-rebind]").forEach((button) => {
      button.addEventListener("click", () => startRebind(button.getAttribute("data-paa-rebind")));
    });
    panel.querySelectorAll("[data-paa-cancel]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingId = null;
        renderPanel();
      });
    });
    panel.querySelectorAll("form[data-paa-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        saveForm(form);
      });
    });
  }

  function renderPanelItem(annotation) {
    const isActive = state.activeId === annotation.id;
    const isEditing = state.editingId === annotation.id;
    if (isEditing) return renderEditForm(annotation, isActive);

    const isExpanded = isActive;
    const context = annotation.context ? Object.entries(annotation.context).filter(([, value]) => value !== "").map(([key, value]) => `${CONTEXT_LABELS[key] || "适用条件"}：${displayValue(value)}`).join("，") : "";
    const rules = Array.isArray(annotation.rules) ? annotation.rules : [];
    const statusLabel = STATUS_LABELS[annotation.status] || "生效中";
    const pageLabel = displayValue(annotation.page || "当前页面");

    return `
      <article class="paa-item${isActive ? " is-active" : ""}" data-paa-item="${escapeHtml(annotation.id)}">
        <button class="paa-item-summary" type="button" data-paa-toggle="${escapeHtml(annotation.id)}" aria-expanded="${isExpanded}">
          <span class="paa-badge">${annotationNumber(annotation)}</span>
          <span class="paa-summary-copy">
            <span class="paa-item-title">${escapeHtml(annotation.title)}</span>
            <span class="paa-summary-meta">${escapeHtml(pageLabel)} · ${escapeHtml(statusLabel)}</span>
          </span>
          <span class="paa-expand-icon" aria-hidden="true">${isExpanded ? "−" : "+"}</span>
        </button>
        ${isExpanded ? `
          <div class="paa-item-main">
            ${context ? `<div class="paa-item-meta">${escapeHtml(context)}</div>` : ""}
            ${annotation.description ? `<p class="paa-item-desc">${escapeHtml(annotation.description)}</p>` : ""}
            ${rules.length ? `<ul class="paa-rules">${rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="paa-actions">
            <button class="paa-button" type="button" data-paa-focus="${escapeHtml(annotation.id)}">定位</button>
            <button class="paa-button" type="button" data-paa-edit="${escapeHtml(annotation.id)}">编辑</button>
            <button class="paa-button" type="button" data-paa-rebind="${escapeHtml(annotation.id)}">重新绑定</button>
            <button class="paa-button is-danger" type="button" data-paa-delete="${escapeHtml(annotation.id)}">删除</button>
          </div>
        ` : ""}
      </article>
    `;
  }

  function renderEditForm(annotation, isActive) {
    const rules = Array.isArray(annotation.rules) ? annotation.rules.join("\n") : "";
    return `
      <article class="paa-item paa-item-editing${isActive ? " is-active" : ""}" data-paa-item="${escapeHtml(annotation.id)}">
        <form class="paa-form paa-form-inline" data-paa-form="${escapeHtml(annotation.id)}">
          <div class="paa-edit-summary">
            <span class="paa-badge">${annotationNumber(annotation)}</span>
            <label class="paa-label paa-edit-title">标题
              <input class="paa-input" name="title" required value="${escapeHtml(annotation.title || "")}">
            </label>
          </div>
          <div class="paa-edit-fields">
            <label class="paa-label">功能说明
              <textarea class="paa-textarea" name="description" rows="2">${escapeHtml(annotation.description || "")}</textarea>
            </label>
            <label class="paa-label">产品规则（每行一条）
              <textarea class="paa-textarea" name="rules" rows="3">${escapeHtml(rules)}</textarea>
            </label>
            <label class="paa-label">状态
              <select class="paa-input" name="status">
                ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${(annotation.status || "active") === value ? " selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="paa-actions">
            <button class="paa-button is-primary" type="submit">保存</button>
            <button class="paa-button" type="button" data-paa-cancel="${escapeHtml(annotation.id)}">取消</button>
          </div>
        </form>
      </article>
    `;
  }

  function saveForm(form) {
    const id = form.getAttribute("data-paa-form");
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation) return;
    const data = new FormData(form);
    annotation.title = String(data.get("title") || "").trim();
    annotation.description = String(data.get("description") || "").trim();
    annotation.rules = String(data.get("rules") || "").split("\n").map((item) => item.trim()).filter(Boolean);
    annotation.status = String(data.get("status") || "active").trim() || "active";
    annotation.updatedAt = now();
    state.editingId = null;
    persist();
    render();
  }

  function deleteAnnotation(id) {
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation) return;
    const ok = window.confirm(`确定删除注释“${annotation.title || annotation.id}”吗？`);
    if (!ok) return;
    state.doc.annotations = state.doc.annotations.filter((item) => item.id !== id);
    if (state.activeId === id) state.activeId = null;
    persist();
    render();
  }

  function focusAnnotation(id, options = {}) {
    state.activeId = id;
    state.panelOpen = true;
    document.querySelectorAll(".paa-target-highlight").forEach((item) => item.classList.remove("paa-target-highlight"));
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (annotation) {
      const target = getTargetElement(annotation);
      if (target) {
        target.classList.add("paa-target-highlight");
        if (options.scrollTarget !== false) target.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
        window.setTimeout(() => target.classList.remove("paa-target-highlight"), 1600);
      }
    }
    render();
    if (options.scrollPanel) {
      window.setTimeout(() => {
        state.elements.panel.querySelector(`[data-paa-item="${cssEscape(id)}"]`)?.scrollIntoView({ block: "nearest" });
      }, 0);
    }
  }

  function startAdd() {
    stopSelection();
    state.adding = true;
    state.panelOpen = true;
    renderPanel();
    showSelectionBanner("新增注释：请点击要标注的页面元素，按 Esc 取消");
  }

  function startRebind(id) {
    stopSelection();
    state.rebindingId = id;
    state.panelOpen = true;
    renderPanel();
    showSelectionBanner("重新绑定：请点击正确的页面元素，按 Esc 取消");
  }

  function showSelectionBanner(message) {
    document.querySelector(".paa-selection-banner")?.remove();
    const banner = document.createElement("div");
    banner.className = "paa-selection-banner";
    banner.textContent = message;
    document.body.appendChild(banner);
  }

  function stopSelection() {
    state.adding = false;
    state.rebindingId = null;
    document.querySelector(".paa-selection-banner")?.remove();
    document.querySelectorAll(".paa-select-candidate").forEach((item) => item.classList.remove("paa-select-candidate"));
  }

  function closeAnnotations() {
    stopSelection();
    state.panelOpen = false;
    document.querySelectorAll(".paa-target-highlight").forEach((item) => item.classList.remove("paa-target-highlight"));
    render();
  }

  function candidateFromEvent(event) {
    const path = event.composedPath ? event.composedPath() : [];
    const raw = path.find((item) => item instanceof Element && item !== document.body && !isRuntimeElement(item));
    const element = raw || (event.target instanceof Element && !isRuntimeElement(event.target) ? event.target : null);
    if (!element) return null;

    const interactive = element.closest('button, a, input, select, textarea, [role="button"]');
    if (interactive && !isRuntimeElement(interactive)) return interactive;

    const anchored = element.closest("[data-annotation-id]");
    if (anchored) {
      if (state.adding && element !== anchored && isElementAnnotated(anchored)) return element;
      return anchored;
    }

    return element.closest("article, section") || element;
  }

  function addAnnotationAt(candidate) {
    const timestamp = now();
    const annotation = {
      id: uniqueAnnotationId(),
      page: pageKey(),
      title: suggestedTitle(candidate),
      description: "",
      rules: [],
      target: targetForElement(candidate),
      context: {},
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.doc.annotations.push(annotation);
    state.activeId = annotation.id;
    state.editingId = annotation.id;
    stopSelection();
    persist();
    render();
    window.setTimeout(() => {
      state.elements.panel.querySelector(`[data-paa-item="${cssEscape(annotation.id)}"]`)?.scrollIntoView({ block: "nearest" });
      state.elements.panel.querySelector(`[data-paa-form="${cssEscape(annotation.id)}"] input[name="title"]`)?.focus();
    }, 0);
  }

  function bindSelectionEvents() {
    document.addEventListener("mouseover", (event) => {
      if (!state.adding && !state.rebindingId) return;
      document.querySelectorAll(".paa-select-candidate").forEach((item) => item.classList.remove("paa-select-candidate"));
      const candidate = candidateFromEvent(event);
      if (candidate) candidate.classList.add("paa-select-candidate");
    }, true);

    document.addEventListener("click", (event) => {
      if (!state.adding && !state.rebindingId) return;
      const candidate = candidateFromEvent(event);
      if (!candidate) return;
      event.preventDefault();
      event.stopPropagation();

      if (state.adding) {
        addAnnotationAt(candidate);
        return;
      }

      const annotation = state.doc.annotations.find((item) => item.id === state.rebindingId);
      if (!annotation) return stopSelection();
      annotation.target = targetForElement(candidate);
      annotation.updatedAt = now();
      state.activeId = annotation.id;
      stopSelection();
      persist();
      render();
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && (state.adding || state.rebindingId)) {
        stopSelection();
        renderPanel();
      }
    });
  }

  function render() {
    document.documentElement.classList.toggle("paa-panel-open", state.panelOpen);
    renderMarkers();
    renderPanel();
  }

  function bindRefreshEvents() {
    let raf = null;
    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(renderMarkers);
    };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const observer = new MutationObserver((mutations) => {
      const onlyRuntimeChanges = mutations.every((mutation) => {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        return target && isRuntimeElement(target);
      });
      if (!onlyRuntimeChanges) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden", "data-annotation-id"] });
  }

  async function init() {
    await loadAnnotations();
    createShell();
    bindSelectionEvents();
    bindRefreshEvents();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
