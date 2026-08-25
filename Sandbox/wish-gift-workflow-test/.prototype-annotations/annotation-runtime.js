(function () {
  "use strict";

  const DEFAULT_CONFIG = {
    annotationsUrl: "annotations.json",
    saveUrl: "/__prototype_annotations/save",
    uploadUrl: "/__prototype_annotations/upload",
    mode: "auto",
    preferencesKey: "prototype-annotation-ui",
    enabled: true,
    startOpen: true,
    minWidth: 320,
    minHeight: 360,
  };

  const config = Object.assign({}, DEFAULT_CONFIG, window.PrototypeAnnotationConfig || {});
  if (!config.enabled) return;

  function runtimeMode() {
    if (config.readOnly === true || config.readonly === true || config.public === true || config.publicReview === true || config.editable === false) return "public-review";
    const requested = String(config.mode || "auto").trim().toLowerCase();
    if (["local-edit", "local", "edit", "editable"].includes(requested)) return "local-edit";
    if (["public-review", "public", "readonly", "read-only", "review"].includes(requested)) return "public-review";
    if (requested !== "auto") return "public-review";
    const protocol = String(window.location?.protocol || "").toLowerCase();
    const hostname = String(window.location?.hostname || "").toLowerCase();
    const localHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    return /^(https?:)$/.test(protocol) && localHost ? "local-edit" : "public-review";
  }

  const mode = runtimeMode();
  const isEditable = mode === "local-edit";
  const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const state = {
    doc: { version: "1.0", annotations: [] },
    visible: config.startOpen,
    activeId: null,
    selectedPageId: "all",
    annotationKind: "content",
    previewId: null,
    popupEditingId: null,
    agentEditingId: null,
    agentPrompt: "",
    agentSuggestion: false,
    editingId: null,
    adding: false,
    rebindingId: null,
    dirty: false,
    saving: false,
    saveQueued: false,
    uploadingId: null,
    uploadState: "",
    saveState: "正在加载标注",
    elements: {},
    markers: new Map(),
    draftIds: new Set(),
  };

  const runtimeSelector = ".paa-panel, .paa-toggle, .paa-marker-layer, .paa-selection-banner, .paa-preview-card";
  const CATEGORY_ORDER = ["background", "scenario", "page-flow", "state", "permission", "edge", "acceptance"];
  const CATEGORY_LABELS = {
    background: "需求背景",
    scenario: "用户场景",
    "page-flow": "页面流程",
    state: "状态规则",
    permission: "权限规则",
    edge: "边界处理",
    acceptance: "验收标准",
  };
  const STATUS_LABELS = {
    active: "生效中",
    "needs-review": "待检查",
    orphaned: "目标失效",
    deprecated: "已停用",
  };
  const CONTEXT_LABELS = {
    ruleId: "规则编号",
    contractSection: "契约章节",
    triggerCondition: "触发条件",
    judgmentLogic: "判断逻辑",
    expectedOutcome: "预期结果",
    dataSource: "数据来源",
    valueConstraint: "取值约束",
    permissionCondition: "权限条件",
    exceptionBehavior: "异常表现",
    acceptanceCriteria: "验收标准",
    ruleVersion: "规则版本",
    decisionRef: "决策编号",
    userRole: "用户角色",
    userLevel: "用户等级",
    userState: "用户状态",
    conversationStatus: "会话状态",
    pageState: "页面状态",
    componentState: "组件状态",
    route: "页面路由",
    container: "所在容器",
    state: "适用状态",
    visibleWhen: "显示条件",
    modal: "弹窗",
    tab: "标签页",
    device: "设备",
    viewport: "视口",
  };
  const CONTEXT_ORDER = Object.keys(CONTEXT_LABELS);

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

  function isSafeImageSrc(value) {
    if (typeof value !== "string") return false;
    const src = String(value == null ? "" : value).trim();
    if (src !== value || !src || src.length > 2048 || /^[\\/]/.test(src)) return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(src) || /^\/\//.test(src)) return false;
    if (/[\\?#%\s]/.test(src)) return false;
    return !/(^|\/)\.\.(\/|$)/.test(src);
  }

  function canEdit() {
    return isEditable;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function stableSlug(value) {
    return String(value || "current-page")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "current-page";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readPreferences() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(config.preferencesKey) || "{}");
      if (typeof parsed.visible === "boolean") state.visible = parsed.visible;
      if (typeof parsed.activeId === "string") state.activeId = parsed.activeId;
      if (typeof parsed.selectedPageId === "string") state.selectedPageId = parsed.selectedPageId;
      if (parsed.annotationKind === "content" || parsed.annotationKind === "state") state.annotationKind = parsed.annotationKind;
    } catch (error) {
      state.saveState = "面板偏好读取失败，已使用默认值";
    }
  }

  function savePreferences() {
    const preferences = {
      visible: state.visible,
      activeId: state.activeId,
      selectedPageId: state.selectedPageId,
      annotationKind: state.annotationKind,
    };
    try {
      window.localStorage.setItem(config.preferencesKey, JSON.stringify(preferences));
    } catch (error) {
      // UI preferences are optional and must never replace annotations.json.
    }
  }

  function syncPrototypeWorkspace() {
    if (!document.body) return;
    const panel = state.elements.panel;
    const panelWidth = panel?.getBoundingClientRect().width || Math.min(380, Math.max(280, window.innerWidth - 32));
    const reservedRight = state.visible ? Math.ceil(panelWidth + 40) : 0;
    document.documentElement.classList.toggle("paa-panel-open", state.visible);
    document.body.style.paddingRight = state.visible ? `${reservedRight}px` : "";
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

  function selectorIsUnique(selector, root = document) {
    try {
      return root.querySelectorAll(selector).length === 1;
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
      return { annotationId, selector: `[data-annotation-id="${annotationId}"]` };
    }
    if (element.id) return { selector: `#${cssEscape(element.id)}` };
    const testId = element.getAttribute("data-testid");
    if (testId) {
      const selector = `[data-testid="${cssEscape(testId)}"]`;
      if (selectorIsUnique(selector)) return { selector };
    }
    return { selector: buildStructureSelector(element) };
  }

  function fallbackPageId() {
    const pathName = window.location.pathname.split("/").filter(Boolean).pop();
    return stableSlug(config.pageId || document.body.dataset.pageId || pathName?.replace(/\.html?$/i, "") || "current-page");
  }

  function pageInfoForElement(element) {
    const container = element?.closest?.("[data-page-id]") || document.querySelector("[data-page-id]");
    const pageId = stableSlug(container?.dataset.pageId || fallbackPageId());
    const heading = container?.querySelector?.("[data-page-title], h1, h2, h3");
    const page = container?.dataset.pageName || heading?.textContent?.trim() || config.page || document.body.dataset.page || pageId;
    return { pageId, page };
  }

  function annotationPageId(annotation) {
    return stableSlug(annotation.pageId || annotation.page || fallbackPageId());
  }

  function pageRoot(pageId) {
    if (!pageId) return document;
    return document.querySelector(`[data-page-id="${cssEscape(pageId)}"]`) || document;
  }

  function getTargetElement(annotation) {
    const target = annotation.target || {};
    const root = pageRoot(annotationPageId(annotation));
    if (target.annotationId) {
      return root.querySelector(`[data-annotation-id="${cssEscape(target.annotationId)}"]`);
    }
    if (target.selector) {
      try {
        return root.querySelector(target.selector);
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

  function suggestedTitle(element) {
    const candidates = [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("alt"),
      element.getAttribute("placeholder"),
      element.textContent,
    ];
    const value = candidates.find((item) => String(item || "").trim());
    if (!value) return "新标注";
    const normalized = String(value).replace(/\s+/g, " ").trim();
    return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized;
  }

  function annotationNumber(annotation) {
    return state.doc.annotations.findIndex((item) => item.id === annotation.id) + 1;
  }

  function annotationCategory(annotation) {
    const category = String(annotation?.category || "page-flow");
    return CATEGORY_ORDER.includes(category) ? category : "page-flow";
  }

  function annotationKind(annotation) {
    return annotationCategory(annotation) === "state" ? "state" : "content";
  }

  function isContentAnnotation(annotation) {
    return annotationKind(annotation) === "content";
  }

  function categoryClass(annotation) {
    return `paa-category-${annotationCategory(annotation)}`;
  }

  function visibleAnnotations() {
    return state.doc.annotations.filter((annotation) => annotation.status !== "deprecated" && annotationKind(annotation) === state.annotationKind);
  }

  function selectedAnnotations() {
    return visibleAnnotations();
  }

  function markerAnnotations() {
    return state.doc.annotations.filter((annotation) => annotation.status !== "deprecated");
  }

  function renderInlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
  }

  function tableCells(value) {
    const source = String(value || "").trim();
    const normalized = source.startsWith("|") ? source.slice(1) : source;
    const withoutTrailing = normalized.endsWith("|") ? normalized.slice(0, -1) : normalized;
    return withoutTrailing.split("|").map((cell) => cell.trim());
  }

  function isMarkdownTableDivider(value) {
    const cells = tableCells(value);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  }

  function renderMarkdownTable(header, rows) {
    const headerCells = tableCells(header);
    const body = rows.map((row) => {
      const cells = tableCells(row);
      return `<tr>${headerCells.map((_, index) => `<td>${renderInlineMarkdown(cells[index] || "")}</td>`).join("")}</tr>`;
    }).join("");
    return `<table><thead><tr>${headerCells.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>${body ? `<tbody>${body}</tbody>` : ""}</table>`;
  }

  function renderMarkdown(value) {
    const lines = String(value || "").replace(/\r\n?/g, "\n").split("\n");
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
      if (!lines[index].trim()) {
        index += 1;
        continue;
      }
      if (index + 1 < lines.length && lines[index].includes("|") && isMarkdownTableDivider(lines[index + 1])) {
        const header = lines[index];
        index += 2;
        const rows = [];
        while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
          rows.push(lines[index]);
          index += 1;
        }
        blocks.push(renderMarkdownTable(header, rows));
        continue;
      }
      if (/^>\s?/.test(lines[index])) {
        const quoteLines = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^>\s?/, ""));
          index += 1;
        }
        blocks.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
        continue;
      }
      if (/^\s*[-*+]\s+/.test(lines[index])) {
        const items = [];
        while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
          items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
          index += 1;
        }
        blocks.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
        continue;
      }
      if (/^\s*\d+\.\s+/.test(lines[index])) {
        const items = [];
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
          index += 1;
        }
        blocks.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
        continue;
      }
      const paragraph = [];
      while (index < lines.length && lines[index].trim() && !/^>\s?/.test(lines[index]) && !/^\s*[-*+]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index])) {
        if (index + 1 < lines.length && lines[index].includes("|") && isMarkdownTableDivider(lines[index + 1])) break;
        paragraph.push(lines[index]);
        index += 1;
      }
      if (paragraph.length) blocks.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
    }
    return blocks.join("");
  }

  async function loadAnnotations() {
    try {
      const response = await fetch(config.annotationsUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const loaded = await response.json();
      if (!loaded || !Array.isArray(loaded.annotations)) throw new Error("annotations must be an array");
      state.doc = loaded;
      state.doc.annotations.forEach((annotation) => {
        annotation.pageId = annotationPageId(annotation);
      });
      if (state.activeId && !state.doc.annotations.some((item) => item.id === state.activeId)) state.activeId = null;
      state.saveState = `已加载 ${state.doc.annotations.length} 条标注${canEdit() ? "" : " · 公网只读"}`;
    } catch (error) {
      state.doc = { version: "1.0", updatedAt: now(), annotations: [] };
      state.saveState = `无法加载 annotations.json：${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async function persist() {
    if (!canEdit()) return false;
    state.dirty = true;
    if (state.saving) {
      state.saveQueued = true;
      state.saveState = "正在保存，最新修改已进入队列…";
      renderPanel();
      return false;
    }
    state.saving = true;
    let saved = false;
    try {
      do {
        state.saveQueued = false;
        state.doc.updatedAt = now();
        state.saveState = "正在保存到 annotations.json…";
        renderPanel();
        const response = await fetch(config.saveUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(state.doc),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        saved = true;
      } while (state.saveQueued);
      state.dirty = false;
      state.saveState = "已保存到 annotations.json";
      return saved;
    } catch (error) {
      state.dirty = true;
      state.saveState = `保存失败，修改仅保留在当前窗口：${error instanceof Error ? error.message : String(error)}`;
      return false;
    } finally {
      state.saving = false;
      renderPanel();
    }
  }

  function createShell() {
    const markerLayer = document.createElement("div");
    markerLayer.className = "paa-marker-layer";
    document.body.appendChild(markerLayer);

    const panel = document.createElement("aside");
    panel.className = "paa-panel";
    panel.setAttribute("aria-label", "原型产品标注");
    document.body.appendChild(panel);

    const toggle = document.createElement("button");
    toggle.className = "paa-toggle";
    toggle.type = "button";
    toggle.textContent = "显示标注";
    toggle.addEventListener("click", showAnnotations);
    document.body.appendChild(toggle);

    state.elements = { markerLayer, panel, toggle };
    syncPrototypeWorkspace();
  }

  function markerPosition(rect, placed, preferredOffset = 0) {
    const gap = 26;
    const offsets = [[0, 0], [-gap, 0], [0, gap], [-gap, gap], [gap, 0], [gap, gap], [-gap * 2, 0], [-gap * 2, gap], [0, gap * 2], [-gap, gap * 2], [gap, gap * 2], [-gap * 2, gap * 2]];
    const ordered = offsets.slice(preferredOffset).concat(offsets.slice(0, preferredOffset));
    for (const [offsetX, offsetY] of ordered) {
      const point = {
        x: clamp(rect.right + offsetX, 12, window.innerWidth - 12),
        y: clamp(rect.top + offsetY, 12, window.innerHeight - 12),
      };
      if (!placed.some((item) => ((item.x - point.x) ** 2) + ((item.y - point.y) ** 2) < 24 ** 2)) return point;
    }
    return { x: clamp(rect.right, 12, window.innerWidth - 12), y: clamp(rect.top, 12, window.innerHeight - 12) };
  }

  function clearTargetHighlights() {
    document.querySelectorAll(".paa-target-highlight").forEach((element) => {
      element.classList.remove("paa-target-highlight");
      CATEGORY_ORDER.forEach((category) => element.classList.remove(`paa-category-${category}`));
    });
  }

  function removePreviewCard() {
    state.elements.preview?.remove();
    state.elements.preview = null;
  }

  function clearAgentEditState() {
    state.agentEditingId = null;
    state.agentPrompt = "";
    state.agentSuggestion = false;
  }

  function closePreview() {
    state.previewId = null;
    state.popupEditingId = null;
    clearAgentEditState();
    removePreviewCard();
    clearTargetHighlights();
    renderMarkers();
  }

  function positionPreviewCard() {
    const card = state.elements.preview;
    const annotation = state.doc.annotations.find((item) => item.id === state.previewId);
    const panel = state.elements.panel;
    const target = annotation ? getTargetElement(annotation) : null;
    if (!card || !target || !panel || !state.visible) return;
    const targetRect = target.getBoundingClientRect();
    const prototypeRect = target.closest(".phone")?.getBoundingClientRect() || targetRect;
    const panelRect = panel.getBoundingClientRect();
    const rowRight = Array.from(document.querySelectorAll(".phone")).reduce((right, phone) => {
      const rect = phone.getBoundingClientRect();
      const sharesRow = Math.min(rect.bottom, prototypeRect.bottom) > Math.max(rect.top, prototypeRect.top);
      return sharesRow ? Math.max(right, rect.right) : right;
    }, prototypeRect.right);
    const left = rowRight + 12;
    const availableWidth = Math.max(120, panelRect.left - left - 12);
    card.style.left = `${left}px`;
    card.style.width = `${Math.min(280, availableWidth)}px`;
    const cardHeight = card.getBoundingClientRect().height;
    card.style.top = `${clamp(targetRect.top, 12, Math.max(12, window.innerHeight - cardHeight - 12))}px`;
  }

  function renderPreview() {
    const annotation = state.doc.annotations.find((item) => item.id === state.previewId);
    if (!state.visible || !annotation || annotation.status === "deprecated") {
      removePreviewCard();
      return;
    }
    let card = state.elements.preview;
    if (!card) {
      card = document.createElement("aside");
      card.setAttribute("aria-label", "标注浮窗");
      document.body.appendChild(card);
      state.elements.preview = card;
    }
    const rules = Array.isArray(annotation.rules) ? annotation.rules : [];
    const popupEditing = canEdit() && state.popupEditingId === annotation.id;
    const agentEditing = canEdit() && state.agentEditingId === annotation.id;
    const description = annotation.description
      ? (isContentAnnotation(annotation) ? `<div class="paa-preview-markdown">${renderMarkdown(annotation.description)}</div>` : `<p>${escapeHtml(annotation.description)}</p>`)
      : '<p class="paa-preview-empty">暂无说明。</p>';
    card.className = `paa-preview-card ${categoryClass(annotation)}`;
    card.innerHTML = `
      <div class="paa-preview-header">
        <div class="paa-preview-heading">
          <span class="paa-preview-kicker">${annotationKind(annotation) === "state" ? "状态标注" : "内容标注"} · ${escapeHtml(CATEGORY_LABELS[annotationCategory(annotation)])}</span>
          <h3 class="paa-preview-title">${escapeHtml(annotation.title || annotation.id)}</h3>
        </div>
        <div class="paa-preview-header-actions">
          ${canEdit() && !popupEditing && !agentEditing ? `<button class="paa-button paa-preview-agent" type="button" data-paa-preview-agent="${escapeHtml(annotation.id)}">Agent 修改</button><button class="paa-button paa-preview-edit" type="button" data-paa-preview-edit="${escapeHtml(annotation.id)}">手动修改</button>` : ""}
          <button class="paa-preview-close" type="button" data-paa-preview-close aria-label="关闭标注浮窗">×</button>
        </div>
      </div>
      ${popupEditing
        ? `<div class="paa-preview-editor">${renderEditForm(annotation, state.activeId === annotation.id)}</div>`
        : agentEditing
          ? renderAgentWorkspace(annotation)
        : `<div class="paa-preview-body">
          ${description}
          ${renderImages(annotation)}
          ${renderContext(annotation)}
          ${rules.length ? `<section class="paa-preview-rules"><h4>规则</h4><ul>${rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></section>` : ""}
        </div>`}
    `;
    card.querySelector("[data-paa-preview-close]")?.addEventListener("click", closePreview);
    card.querySelector("[data-paa-preview-edit]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startPopupEdit(annotation.id);
    });
    card.querySelector("[data-paa-preview-agent]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startAgentEdit(annotation.id);
    });
    if (popupEditing) bindPreviewEditorEvents(card);
    if (agentEditing) bindAgentEditorEvents(card);
    bindImageLoadStates(card);
    positionPreviewCard();
  }

  function bindPreviewEditorEvents(card) {
    card.querySelectorAll("[data-paa-remove-image]").forEach((button) => button.addEventListener("click", () => removeImageReference(button.getAttribute("data-paa-remove-image"), button.getAttribute("data-paa-image-index"))));
    card.querySelectorAll("[data-paa-upload]").forEach((input) => input.addEventListener("change", () => uploadImages(input.getAttribute("data-paa-upload"), input)));
    card.querySelectorAll("[data-paa-cancel]").forEach((button) => button.addEventListener("click", () => cancelPopupEdit(button.getAttribute("data-paa-cancel"))));
    card.querySelectorAll("form[data-paa-form]").forEach((form) => form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveForm(form);
    }));
  }

  function compactAgentValue(value, fallback = "未设置") {
    const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    if (!text) return fallback;
    return text.length > 72 ? `${text.slice(0, 72)}…` : text;
  }

  function renderAgentSuggestion(annotation) {
    const context = annotation.context || {};
    const rules = Array.isArray(annotation.rules) && annotation.rules.length ? annotation.rules.join("；") : "未设置";
    const fields = [
      ["标题", annotation.title],
      ["说明", annotation.description],
      ["触发条件", context.triggerCondition],
      ["预期结果", context.expectedOutcome],
      ["规则", rules],
    ];
    return `<section class="paa-agent-suggestion" aria-live="polite">
      <p class="paa-agent-demo-note">交互演示 · 尚未调用真实 Agent</p>
      <div class="paa-agent-request"><b>用户要求</b><p>${escapeHtml(state.agentPrompt)}</p></div>
      <h4>将影响的字段</h4>
      <dl>${fields.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(compactAgentValue(value))}</dd></div>`).join("")}</dl>
      <p class="paa-agent-next-state">状态将变为 <strong>待确认</strong></p>
      <div class="paa-agent-actions"><button class="paa-button" type="button" data-paa-agent-retry="${escapeHtml(annotation.id)}">重新描述</button><button class="paa-button" type="button" disabled aria-disabled="true">应用修改（待接入）</button></div>
    </section>`;
  }

  function renderAgentWorkspace(annotation) {
    const kindLabel = annotationKind(annotation) === "state" ? "状态标注" : "内容标注";
    const categoryLabel = CATEGORY_LABELS[annotationCategory(annotation)] || "未分类";
    return `<div class="paa-agent-workspace">
      <h4 class="paa-agent-workspace-title">告诉 Agent 你想怎么修改</h4>
      <dl class="paa-agent-context">
        <div><dt>当前标注</dt><dd>${escapeHtml(compactAgentValue(annotation.title, annotation.id))}</dd></div>
        <div><dt>页面</dt><dd>${escapeHtml(compactAgentValue(annotation.page || annotation.pageId))}</dd></div>
        <div><dt>类型</dt><dd>${escapeHtml(`${kindLabel} · ${categoryLabel}`)}</dd></div>
      </dl>
      <form class="paa-agent-form" data-paa-agent-form="${escapeHtml(annotation.id)}">
        <label class="paa-label" for="paa-agent-prompt-${escapeHtml(annotation.id)}">修改要求<textarea id="paa-agent-prompt-${escapeHtml(annotation.id)}" class="paa-textarea" name="agentPrompt" rows="4" required placeholder="例如：补充该状态的进入条件，并说明访客不能重复赠送">${escapeHtml(state.agentPrompt)}</textarea></label>
        <div class="paa-agent-form-actions"><button class="paa-button is-primary" type="submit">生成修改建议</button><button class="paa-button" type="button" data-paa-agent-cancel="${escapeHtml(annotation.id)}">取消</button></div>
      </form>
      ${state.agentSuggestion && state.agentPrompt ? renderAgentSuggestion(annotation) : ""}
    </div>`;
  }

  function bindAgentEditorEvents(card) {
    card.querySelector("form[data-paa-agent-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const form = event.currentTarget;
      const prompt = String(new FormData(form).get("agentPrompt") || "").trim();
      const textarea = form.querySelector("textarea[name=agentPrompt]");
      if (!prompt) {
        textarea?.setCustomValidity("请先描述想要修改的内容");
        textarea?.reportValidity();
        return;
      }
      if (textarea) textarea.setCustomValidity("");
      state.agentPrompt = prompt;
      state.agentSuggestion = true;
      render();
    });
    card.querySelector("[data-paa-agent-cancel]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      cancelAgentEdit(event.currentTarget.getAttribute("data-paa-agent-cancel"));
    });
    card.querySelector("[data-paa-agent-retry]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.agentSuggestion = false;
      render();
      window.setTimeout(() => state.elements.preview?.querySelector("textarea[name=agentPrompt]")?.focus(), 0);
    });
  }

  function renderMarkers() {
    if (!state.elements.markerLayer) return;
    state.elements.markerLayer.innerHTML = "";
    state.markers.clear();
    if (!state.visible) {
      return;
    }
    const placed = [];
    const targetCounts = new Map();
    markerAnnotations().forEach((annotation) => {
      const target = getTargetElement(annotation);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if ((rect.width === 0 && rect.height === 0) || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;
      const targetIndex = targetCounts.get(target) || 0;
      targetCounts.set(target, targetIndex + 1);
      const position = markerPosition(rect, placed, Math.min(targetIndex, 11));
      placed.push(position);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `paa-marker ${categoryClass(annotation)}${state.activeId === annotation.id ? " is-active" : ""}`;
      marker.textContent = String(annotationNumber(annotation));
      marker.title = annotation.title || annotation.id;
      marker.style.left = `${position.x}px`;
      marker.style.top = `${position.y}px`;
      marker.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        focusAnnotation(annotation.id, { scrollPanel: true, scrollTarget: false, showPreview: true });
      });
      state.elements.markerLayer.appendChild(marker);
      state.markers.set(annotation.id, marker);
    });
  }

  function renderAnnotationGroups() {
    const annotations = selectedAnnotations();
    if (!annotations.length) return `<p class="paa-empty">暂无${state.annotationKind === "content" ? "内容" : "状态"}标注。</p>`;
    return CATEGORY_ORDER.map((category) => {
      const items = annotations.filter((item) => (item.category || "page-flow") === category);
      if (!items.length) return "";
      return `<section class="paa-group"><h3 class="paa-group-title">${CATEGORY_LABELS[category]}</h3>${items.map(renderPanelItem).join("")}</section>`;
    }).join("");
  }

  function renderPanel() {
    const panel = state.elements.panel;
    if (!panel) return;
    panel.classList.toggle("is-hidden", !state.visible);
    state.elements.toggle.classList.toggle("is-hidden", state.visible);
    if (!state.visible) return;
    panel.innerHTML = `
      <div class="paa-panel-header">
        <div>
          <h2 class="paa-panel-title">原型产品标注</h2>
          <p class="paa-panel-subtitle">当前显示 ${visibleAnnotations().length} 条 · 全部 ${state.doc.annotations.filter((item) => item.status !== "deprecated").length} 条${state.dirty ? " · 有未保存修改" : ""}${canEdit() ? " · 本地编辑" : " · 公网只读"}</p>
        </div>
        <div class="paa-header-actions">
          ${canEdit() && state.dirty ? '<button class="paa-button" type="button" data-paa-action="retry">重试保存</button>' : ""}
          ${canEdit() ? '<button class="paa-button is-primary" type="button" data-paa-action="add">新增</button>' : ""}
          <button class="paa-button" type="button" data-paa-action="hide">隐藏</button>
        </div>
      </div>
      <div class="paa-kind-tabs" role="tablist" aria-label="标注类型">
        <button class="paa-kind-tab paa-category-background${state.annotationKind === "content" ? " is-active" : ""}" type="button" role="tab" aria-selected="${state.annotationKind === "content"}" data-paa-kind="content"><span>内容标注</span><b>${state.doc.annotations.filter((item) => item.status !== "deprecated" && annotationKind(item) === "content").length}</b></button>
        <button class="paa-kind-tab paa-category-state${state.annotationKind === "state" ? " is-active" : ""}" type="button" role="tab" aria-selected="${state.annotationKind === "state"}" data-paa-kind="state"><span>状态标注</span><b>${state.doc.annotations.filter((item) => item.status !== "deprecated" && annotationKind(item) === "state").length}</b></button>
      </div>
      <div class="paa-panel-body">${renderAnnotationGroups()}</div>
      <div class="paa-save-state" role="status">${escapeHtml(state.saveState)}</div>
    `;
    bindPanelEvents();
    bindImageLoadStates();
  }

  function renderContext(annotation) {
    const context = annotation.context || {};
    const ordered = [...CONTEXT_ORDER, ...Object.keys(context).filter((key) => !CONTEXT_ORDER.includes(key))];
    const hiddenInDetails = new Set(["ruleId", "contractSection", "acceptanceCriteria", "device", "viewport"]);
    const rows = ordered.filter((key) => !hiddenInDetails.has(key) && context[key] !== "" && context[key] != null).map((key) => `<div class="paa-detail-row"><dt>${escapeHtml(CONTEXT_LABELS[key] || key)}</dt><dd>${escapeHtml(context[key])}</dd></div>`);
    return rows.length ? `<dl class="paa-details">${rows.join("")}</dl>` : "";
  }

  function renderImages(annotation, options = {}) {
    const images = Array.isArray(annotation?.images) ? annotation.images : [];
    if (!images.length) return "";
    const allowRemove = options.allowRemove === true && canEdit();
    const allowEdit = options.allowEdit === true && canEdit();
    const cards = images.map((image, index) => {
      const rawAlt = typeof image?.alt === "string" ? image.alt : "";
      const alt = rawAlt.trim() || "未提供替代文字";
      const caption = typeof image?.caption === "string" ? image.caption.trim() : "";
      const safeSrc = isSafeImageSrc(image?.src);
      const fallback = `<span class="paa-image-fallback"${safeSrc ? " hidden" : ""} role="status">图片无法显示：${escapeHtml(alt)}</span>`;
      const imageMarkup = safeSrc
        ? `<img class="paa-image" data-paa-image src="${escapeHtml(image.src)}" alt="${escapeHtml(alt)}" loading="lazy">`
        : "";
      return `<figure class="paa-image-card">
        <div class="paa-image-frame">${imageMarkup}${fallback}</div>
        <div class="paa-image-copy"><span class="paa-image-alt"><b>替代文字</b>${escapeHtml(alt)}</span>${caption ? `<span class="paa-image-caption">${escapeHtml(caption)}</span>` : ""}</div>
        ${allowEdit ? `<div class="paa-image-edit-fields">
          <label class="paa-label">图片路径（只读）<input class="paa-input paa-image-src" value="${escapeHtml(image?.src || "")}" readonly aria-readonly="true" tabindex="-1"></label>
          <label class="paa-label">替代文字<input class="paa-input" data-paa-image-alt="${index}" name="imageAlt-${index}" required value="${escapeHtml(rawAlt)}"></label>
          <label class="paa-label">图片说明（可选）<textarea class="paa-textarea" data-paa-image-caption="${index}" name="imageCaption-${index}" rows="2">${escapeHtml(caption)}</textarea></label>
        </div>` : ""}
        ${allowRemove ? `<button class="paa-button paa-image-remove" type="button" data-paa-remove-image="${escapeHtml(annotation.id)}" data-paa-image-index="${index}">移除引用</button>` : ""}
      </figure>`;
    }).join("");
    return `<section class="paa-images" aria-label="图片附件"><h3 class="paa-images-title">图片附件</h3><div class="paa-image-grid">${cards}</div></section>`;
  }

  function bindImageLoadStates(root = state.elements.panel) {
    root?.querySelectorAll("img[data-paa-image]").forEach((image) => {
      const fallback = image.parentElement?.querySelector(".paa-image-fallback");
      const showFallback = () => {
        image.hidden = true;
        if (fallback) fallback.hidden = false;
      };
      const showImage = () => {
        image.hidden = false;
        if (fallback) fallback.hidden = true;
      };
      image.addEventListener("error", showFallback, { once: true });
      image.addEventListener("load", showImage, { once: true });
      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  function renderPanelItem(annotation) {
    const isActive = state.activeId === annotation.id;
    if (state.editingId === annotation.id && canEdit()) return renderEditForm(annotation, isActive);
    const category = annotationCategory(annotation);
    const rules = Array.isArray(annotation.rules) ? annotation.rules : [];
    const description = annotation.description
      ? (isContentAnnotation(annotation) ? `<div class="paa-item-desc paa-markdown">${renderMarkdown(annotation.description)}</div>` : `<p class="paa-item-desc">${escapeHtml(annotation.description)}</p>`)
      : "";
    return `
      <article class="paa-item ${categoryClass(annotation)}${isActive ? " is-active" : ""}" data-paa-item="${escapeHtml(annotation.id)}" data-paa-category="${category}">
        <button class="paa-item-summary" type="button" data-paa-toggle="${escapeHtml(annotation.id)}" aria-expanded="${isActive}">
          <span class="paa-badge ${categoryClass(annotation)}">${annotationNumber(annotation)}</span>
          <span class="paa-summary-copy">
            <span class="paa-item-title">${escapeHtml(annotation.title)}</span>
            <span class="paa-summary-meta">${escapeHtml(annotation.page || annotation.pageId)} · ${escapeHtml(STATUS_LABELS[annotation.status] || "生效中")}</span>
          </span>
          <span class="paa-expand-icon" aria-hidden="true">${isActive ? "−" : "+"}</span>
        </button>
        ${isActive ? `
          <div class="paa-item-main">
            ${description}
            ${renderImages(annotation)}
            ${renderContext(annotation)}
            ${rules.length ? `<ul class="paa-rules">${rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="paa-actions">
            <button class="paa-button" type="button" data-paa-focus="${escapeHtml(annotation.id)}">定位</button>
            ${canEdit() ? `<button class="paa-button" type="button" data-paa-edit="${escapeHtml(annotation.id)}">编辑</button>
            <button class="paa-button" type="button" data-paa-rebind="${escapeHtml(annotation.id)}">重新绑定</button>
            <button class="paa-button is-danger" type="button" data-paa-delete="${escapeHtml(annotation.id)}">删除</button>` : ""}
          </div>
        ` : ""}
      </article>`;
  }

  function renderEditForm(annotation, isActive) {
    const context = annotation.context || {};
    const rules = Array.isArray(annotation.rules) ? annotation.rules.join("\n") : "";
    const uploadState = state.uploadingId === annotation.id ? state.uploadState : "";
    const descriptionLabel = isContentAnnotation(annotation) ? "Markdown 内容（安全子集）" : "功能说明";
    return `
      <article class="paa-item ${categoryClass(annotation)} paa-item-editing${isActive ? " is-active" : ""}" data-paa-item="${escapeHtml(annotation.id)}" data-paa-category="${annotationCategory(annotation)}">
        <form class="paa-form" data-paa-form="${escapeHtml(annotation.id)}">
          <label class="paa-label">标题<input class="paa-input" name="title" required value="${escapeHtml(annotation.title || "")}"></label>
          <div class="paa-form-row">
            <label class="paa-label">页面 ID<input class="paa-input" name="pageId" required value="${escapeHtml(annotation.pageId || "")}"></label>
            <label class="paa-label">页面名称<input class="paa-input" name="page" required value="${escapeHtml(annotation.page || "")}"></label>
          </div>
          <label class="paa-label">目录分类<select class="paa-input" name="category">${CATEGORY_ORDER.map((value) => `<option value="${value}"${(annotation.category || "page-flow") === value ? " selected" : ""}>${CATEGORY_LABELS[value]}</option>`).join("")}</select></label>
          <label class="paa-label">${descriptionLabel}<span class="paa-field-hint">支持段落、加粗、列表、行内 code、blockquote 和简单表格；原始 HTML 会被转义。</span><textarea class="paa-textarea" name="description" rows="4">${escapeHtml(annotation.description || "")}</textarea></label>
          <label class="paa-label">规则编号<input class="paa-input" name="ruleId" required value="${escapeHtml(context.ruleId || "")}"></label>
          <label class="paa-label">触发条件<textarea class="paa-textarea" name="triggerCondition" required rows="2">${escapeHtml(context.triggerCondition || "")}</textarea></label>
          <label class="paa-label">判断逻辑（有来源时填写）<textarea class="paa-textarea" name="judgmentLogic" rows="2">${escapeHtml(context.judgmentLogic || "")}</textarea></label>
          <label class="paa-label">预期结果<textarea class="paa-textarea" name="expectedOutcome" required rows="2">${escapeHtml(context.expectedOutcome || "")}</textarea></label>
          <label class="paa-label">验收标准<textarea class="paa-textarea" name="acceptanceCriteria" required rows="2">${escapeHtml(context.acceptanceCriteria || "")}</textarea></label>
          <label class="paa-label">补充规则（每行一条）<textarea class="paa-textarea" name="rules" rows="3">${escapeHtml(rules)}</textarea></label>
          <label class="paa-label">状态<select class="paa-input" name="status">${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${(annotation.status || "active") === value ? " selected" : ""}>${label}</option>`).join("")}</select></label>
          ${renderImages(annotation, { allowRemove: true, allowEdit: true })}
          <label class="paa-label paa-upload-label">上传图片（PNG、JPEG 或 WebP，单张不超过 5 MB）<input class="paa-input paa-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple data-paa-upload="${escapeHtml(annotation.id)}"${state.uploadingId === annotation.id ? " disabled" : ""}></label>
          ${uploadState ? `<p class="paa-upload-state" role="status">${escapeHtml(uploadState)}</p>` : ""}
          <div class="paa-actions">
            <button class="paa-button is-primary" type="submit">保存</button>
            <button class="paa-button" type="button" data-paa-cancel="${escapeHtml(annotation.id)}">取消</button>
          </div>
        </form>
      </article>`;
  }

  function imageUploadRecords(payload) {
    if (Array.isArray(payload?.files)) return payload.files;
    if (Array.isArray(payload?.images)) return payload.images;
    return payload?.src ? [payload] : [];
  }

  async function uploadImages(annotationId, input) {
    if (!canEdit()) return;
    const annotation = state.doc.annotations.find((item) => item.id === annotationId);
    const files = Array.from(input?.files || []);
    if (!annotation || !files.length) return;
    input.value = "";
    state.uploadingId = annotationId;
    state.uploadState = `正在上传 ${files.length} 张图片…`;
    renderEditorSurfaces(annotationId);
    let added = 0;
    let saved = false;
    try {
      for (const file of files) {
        if (!IMAGE_TYPES.has(String(file.type || "").toLowerCase())) throw new Error(`${file.name || "图片"} 不是 PNG、JPEG 或 WebP`);
        if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name || "图片"} 超过 5 MB 限制`);
        const formData = new FormData();
        formData.append("file", file, file.name);
        const response = await fetch(config.uploadUrl, { method: "POST", body: formData });
        let payload = null;
        try {
          payload = await response.json();
        } catch (error) {
          payload = null;
        }
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
        const record = imageUploadRecords(payload).find((item) => isSafeImageSrc(item?.src));
        if (!record) throw new Error("上传接口未返回安全的相对图片路径");
        if (!Array.isArray(annotation.images)) annotation.images = [];
        const image = { src: String(record.src), alt: String(record.alt || file.name || "上传图片").trim() || "上传图片" };
        if (record.caption) image.caption = String(record.caption).trim();
        annotation.images.push(image);
        added += 1;
        state.uploadState = `已上传 ${added}/${files.length} 张图片`;
        renderEditorSurfaces(annotationId);
      }
      if (added) {
        annotation.updatedAt = now();
        saved = await persist();
      }
    } catch (error) {
      state.uploadState = `上传失败：${error instanceof Error ? error.message : String(error)}`;
      state.saveState = state.uploadState;
      if (added && !saved) {
        annotation.updatedAt = now();
        await persist();
      }
    } finally {
      state.uploadingId = null;
      renderEditorSurfaces(annotationId);
    }
  }

  function renderEditorSurfaces(annotationId) {
    if (state.popupEditingId === annotationId) render();
    else renderPanel();
  }

  function removeImageReference(annotationId, index) {
    if (!canEdit()) return;
    const annotation = state.doc.annotations.find((item) => item.id === annotationId);
    const images = Array.isArray(annotation?.images) ? annotation.images : null;
    const numericIndex = Number(index);
    if (!annotation || !images || !Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= images.length) return;
    images.splice(numericIndex, 1);
    if (!images.length) delete annotation.images;
    annotation.updatedAt = now();
    state.saveState = "已移除图片引用，物理文件未删除";
    persist();
    render();
  }

  function setAnnotationKind(kind) {
    if (kind !== "content" && kind !== "state") return;
    state.annotationKind = kind;
    const active = state.doc.annotations.find((item) => item.id === state.activeId);
    if (!active || annotationKind(active) !== kind) {
      state.activeId = null;
      state.previewId = null;
      state.popupEditingId = null;
      clearAgentEditState();
      removePreviewCard();
      clearTargetHighlights();
    }
    savePreferences();
    render();
  }

  function toggleAnnotation(id) {
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation || annotationKind(annotation) !== state.annotationKind) return;
    if (state.activeId === id) {
      state.activeId = null;
      state.previewId = null;
      state.popupEditingId = null;
      clearAgentEditState();
      removePreviewCard();
      clearTargetHighlights();
      savePreferences();
      render();
      return;
    }
    focusAnnotation(id, { scrollPanel: false, scrollTarget: false });
  }

  function bindPanelEvents() {
    const panel = state.elements.panel;
    panel.querySelector('[data-paa-action="hide"]')?.addEventListener("click", hideAnnotations);
    panel.querySelector('[data-paa-action="add"]')?.addEventListener("click", startAdd);
    panel.querySelector('[data-paa-action="retry"]')?.addEventListener("click", persist);
    panel.querySelectorAll("[data-paa-kind]").forEach((button) => {
      button.addEventListener("click", () => setAnnotationKind(button.getAttribute("data-paa-kind")));
    });
    panel.querySelectorAll("[data-paa-toggle]").forEach((button) => {
      button.addEventListener("click", () => toggleAnnotation(button.getAttribute("data-paa-toggle")));
    });
    panel.querySelectorAll("[data-paa-focus]").forEach((button) => button.addEventListener("click", () => focusAnnotation(button.getAttribute("data-paa-focus"))));
    panel.querySelectorAll("[data-paa-edit]").forEach((button) => button.addEventListener("click", () => {
      state.popupEditingId = null;
      state.editingId = button.getAttribute("data-paa-edit");
      render();
    }));
    panel.querySelectorAll("[data-paa-delete]").forEach((button) => button.addEventListener("click", () => deleteAnnotation(button.getAttribute("data-paa-delete"))));
    panel.querySelectorAll("[data-paa-rebind]").forEach((button) => button.addEventListener("click", () => startRebind(button.getAttribute("data-paa-rebind"))));
    panel.querySelectorAll("[data-paa-remove-image]").forEach((button) => button.addEventListener("click", () => removeImageReference(button.getAttribute("data-paa-remove-image"), button.getAttribute("data-paa-image-index"))));
    panel.querySelectorAll("[data-paa-upload]").forEach((input) => input.addEventListener("change", () => uploadImages(input.getAttribute("data-paa-upload"), input)));
    panel.querySelectorAll("[data-paa-cancel]").forEach((button) => button.addEventListener("click", () => cancelEdit(button.getAttribute("data-paa-cancel"))));
    panel.querySelectorAll("form[data-paa-form]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); saveForm(form); }));
  }

  function saveForm(form) {
    if (!canEdit()) return;
    const id = form.getAttribute("data-paa-form");
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation) return;
    const isPopupForm = Boolean(form.closest(".paa-preview-card"));
    const data = new FormData(form);
    const nextPageId = stableSlug(data.get("pageId"));
    if (!document.querySelector(`[data-page-id="${cssEscape(nextPageId)}"]`)) {
      const input = form.querySelector('[name="pageId"]');
      input?.setCustomValidity("页面 ID 必须对应原型中的 data-page-id");
      input?.reportValidity();
      state.saveState = `保存失败：未找到 data-page-id="${nextPageId}"`;
      const saveState = state.elements.panel.querySelector(".paa-save-state");
      if (saveState) saveState.textContent = state.saveState;
      return;
    }
    const existingImages = Array.isArray(annotation.images) ? annotation.images : null;
    const nextImages = [];
    if (existingImages) {
      for (const [index, image] of existingImages.entries()) {
        const altInput = form.querySelector(`[data-paa-image-alt="${index}"]`);
        const alt = String(altInput?.value || "").trim();
        if (!alt) {
          altInput?.setCustomValidity("替代文字不能为空");
          altInput?.reportValidity();
          state.saveState = "保存失败：每张图片都必须填写替代文字";
          const saveState = state.elements.panel.querySelector(".paa-save-state");
          if (saveState) saveState.textContent = state.saveState;
          return;
        }
        if (!isSafeImageSrc(image?.src)) {
          state.saveState = "保存失败：图片路径必须是项目相对路径，请移除无效引用";
          const saveState = state.elements.panel.querySelector(".paa-save-state");
          if (saveState) saveState.textContent = state.saveState;
          return;
        }
        const caption = String(form.querySelector(`[data-paa-image-caption="${index}"]`)?.value || "").trim();
        const nextImage = { src: image.src, alt };
        if (caption) nextImage.caption = caption;
        nextImages.push(nextImage);
      }
    }
    annotation.title = String(data.get("title") || "").trim();
    annotation.pageId = nextPageId;
    annotation.page = String(data.get("page") || "").trim();
    annotation.category = String(data.get("category") || "page-flow");
    annotation.description = String(data.get("description") || "").trim();
    annotation.rules = String(data.get("rules") || "").split("\n").map((item) => item.trim()).filter(Boolean);
    annotation.status = String(data.get("status") || "active");
    annotation.context = Object.assign({}, annotation.context || {}, {
      ruleId: String(data.get("ruleId") || "").trim(),
      triggerCondition: String(data.get("triggerCondition") || "").trim(),
      expectedOutcome: String(data.get("expectedOutcome") || "").trim(),
      acceptanceCriteria: String(data.get("acceptanceCriteria") || "").trim(),
    });
    const judgmentLogic = String(data.get("judgmentLogic") || "").trim();
    if (judgmentLogic) annotation.context.judgmentLogic = judgmentLogic;
    else delete annotation.context.judgmentLogic;
    if (existingImages) annotation.images = nextImages;
    annotation.updatedAt = now();
    state.draftIds.delete(id);
    if (isPopupForm) state.popupEditingId = null;
    state.editingId = null;
    state.selectedPageId = annotation.pageId;
    persist();
    render();
  }

  function cancelEdit(id) {
    if (state.draftIds.has(id)) {
      state.doc.annotations = state.doc.annotations.filter((item) => item.id !== id);
      state.draftIds.delete(id);
      if (state.activeId === id) state.activeId = null;
    }
    state.editingId = null;
    render();
  }

  function startPopupEdit(id) {
    if (!canEdit() || state.previewId !== id || !state.doc.annotations.some((item) => item.id === id)) return;
    state.editingId = null;
    clearAgentEditState();
    state.popupEditingId = id;
    render();
    window.setTimeout(() => state.elements.preview?.querySelector('input[name="title"]')?.focus(), 0);
  }

  function cancelPopupEdit(id) {
    if (!canEdit()) return;
    state.popupEditingId = null;
    clearAgentEditState();
    cancelEdit(id);
  }

  function startAgentEdit(id) {
    if (!canEdit() || state.previewId !== id || !state.doc.annotations.some((item) => item.id === id)) return;
    state.editingId = null;
    state.popupEditingId = null;
    state.agentEditingId = id;
    state.agentPrompt = "";
    state.agentSuggestion = false;
    render();
    window.setTimeout(() => state.elements.preview?.querySelector("textarea[name=agentPrompt]")?.focus(), 0);
  }

  function cancelAgentEdit(id) {
    if (!canEdit() || state.agentEditingId !== id) return;
    clearAgentEditState();
    render();
  }

  function deleteAnnotation(id) {
    if (!canEdit()) return;
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation || !window.confirm(`确定删除标注“${annotation.title || annotation.id}”吗？`)) return;
    state.doc.annotations = state.doc.annotations.filter((item) => item.id !== id);
    state.draftIds.delete(id);
    if (state.activeId === id) state.activeId = null;
    if (state.previewId === id) {
      state.previewId = null;
      state.popupEditingId = null;
      clearAgentEditState();
      removePreviewCard();
    }
    clearTargetHighlights();
    persist();
    render();
  }

  function focusAnnotation(id, options = {}) {
    const annotation = state.doc.annotations.find((item) => item.id === id);
    if (!annotation || annotation.status === "deprecated") return;
    state.visible = true;
    if (state.popupEditingId && state.popupEditingId !== id) state.popupEditingId = null;
    if (state.agentEditingId && state.agentEditingId !== id) clearAgentEditState();
    state.annotationKind = annotationKind(annotation);
    state.activeId = id;
    state.selectedPageId = annotationPageId(annotation);
    state.previewId = options.showPreview ? id : null;
    if (!state.previewId) removePreviewCard();
    clearTargetHighlights();
    const target = getTargetElement(annotation);
    if (target) {
      target.classList.add("paa-target-highlight", categoryClass(annotation));
      if (options.scrollTarget !== false) target.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    }
    savePreferences();
    render();
    if (options.scrollPanel) window.setTimeout(() => state.elements.panel.querySelector(`[data-paa-item="${cssEscape(id)}"]`)?.scrollIntoView({ block: "nearest" }), 0);
  }

  function startAdd() {
    if (!canEdit()) return;
    stopSelection();
    state.adding = true;
    showSelectionBanner("新增标注：请选择业务元素，按 Esc 取消");
  }

  function startRebind(id) {
    if (!canEdit()) return;
    stopSelection();
    state.rebindingId = id;
    showSelectionBanner("重新绑定：请选择正确业务元素，按 Esc 取消");
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

  function hideAnnotations() {
    stopSelection();
    state.visible = false;
    state.previewId = null;
    state.popupEditingId = null;
    clearAgentEditState();
    removePreviewCard();
    clearTargetHighlights();
    savePreferences();
    render();
  }

  function showAnnotations() {
    state.visible = true;
    syncPrototypeWorkspace();
    savePreferences();
    render();
  }

  function candidateFromEvent(event) {
    const path = event.composedPath ? event.composedPath() : [];
    if (path.some((item) => item instanceof Element && isRuntimeElement(item))) return null;
    if (event.target instanceof Element && isRuntimeElement(event.target)) return null;
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
    if (!canEdit()) return;
    const timestamp = now();
    const page = pageInfoForElement(candidate);
    const annotation = {
      id: uniqueAnnotationId(),
      pageId: page.pageId,
      page: page.page,
      category: "page-flow",
      title: suggestedTitle(candidate),
      description: "",
      rules: [],
      target: targetForElement(candidate),
      context: { ruleId: "", triggerCondition: "", expectedOutcome: "", acceptanceCriteria: "" },
      status: "needs-review",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.doc.annotations.push(annotation);
    state.draftIds.add(annotation.id);
    state.activeId = annotation.id;
    state.editingId = annotation.id;
    state.selectedPageId = annotation.pageId;
    stopSelection();
    render();
    window.setTimeout(() => state.elements.panel.querySelector(`[data-paa-form="${cssEscape(annotation.id)}"] input[name="title"]`)?.focus(), 0);
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
      if (state.adding) return addAnnotationAt(candidate);
      const annotation = state.doc.annotations.find((item) => item.id === state.rebindingId);
      if (!annotation) return stopSelection();
      annotation.target = targetForElement(candidate);
      const page = pageInfoForElement(candidate);
      annotation.pageId = page.pageId;
      annotation.page = page.page;
      annotation.updatedAt = now();
      state.activeId = annotation.id;
      state.selectedPageId = annotation.pageId;
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
    document.addEventListener("click", (event) => {
      const path = event.composedPath ? event.composedPath() : [event.target];
      if (!state.previewId || path.some((item) => item instanceof Element && item.matches(".paa-preview-card, .paa-marker"))) return;
      closePreview();
    });
  }

  function render() {
    if (!state.elements.panel) return;
    renderPanel();
    syncPrototypeWorkspace();
    renderMarkers();
    renderPreview();
  }

  function bindRefreshEvents() {
    let raf = null;
    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        renderMarkers();
        positionPreviewCard();
      });
    };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", () => {
      syncPrototypeWorkspace();
      schedule();
    });
    const observer = new MutationObserver((mutations) => {
      const onlyRuntimeChanges = mutations.every((mutation) => {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        return target && isRuntimeElement(target);
      });
      if (!onlyRuntimeChanges) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden", "data-page-id", "data-annotation-id", "data-state"] });
  }

  async function init() {
    readPreferences();
    await loadAnnotations();
    createShell();
    bindSelectionEvents();
    bindRefreshEvents();
    render();
    window.requestAnimationFrame(() => {
      const hashTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      hashTarget?.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
    });
    window.PrototypeAnnotationRuntime = {
      mode,
      editable: canEdit(),
      refresh: render,
      show: showAnnotations,
      hide: hideAnnotations,
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
