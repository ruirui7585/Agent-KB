import { polishAnnotation, findMissingRules, checkRuleConflicts } from "./ai-helper.js";
import { createDemoProject } from "./demo-data.js";
import { downloadJson, exportShareHtml } from "./exporter.js";
import { applySceneToPrototype, readPrototypeConfig, renderPrototypeUrl, savePrototypeHtml, uploadPrototypeProject } from "./prototype-bridge.js";
import { clearProject, createEmptyProject, loadProject, normalizeProject, saveProject } from "./storage.js";

const $ = (selector) => document.querySelector(selector);
const els = {
  projectNameInput: $("#projectNameInput"),
  saveStatus: $("#saveStatus"),
  importHtmlBtn: $("#importHtmlBtn"),
  importFolderBtn: $("#importFolderBtn"),
  importZipBtn: $("#importZipBtn"),
  importProjectBtn: $("#importProjectBtn"),
  htmlFileInput: $("#htmlFileInput"),
  folderFileInput: $("#folderFileInput"),
  zipFileInput: $("#zipFileInput"),
  projectFileInput: $("#projectFileInput"),
  treeView: $("#treeView"),
  editorPanel: $("#editorPanel"),
  editorTitle: $("#editorTitle"),
  editorSubtitle: $("#editorSubtitle"),
  prototypeFrame: $("#prototypeFrame"),
  prototypeStage: $("#prototypeStage"),
  prototypeCanvas: $("#prototypeCanvas"),
  annotationLayer: $("#annotationLayer"),
  emptyState: $("#emptyState"),
  guideBox: $("#guideBox"),
  currentSceneTitle: $("#currentSceneTitle"),
  prototypeConfigBadge: $("#prototypeConfigBadge"),
  annotateToolBtn: $("#annotateToolBtn"),
  annotateHint: $("#annotateHint"),
  modalRoot: $("#modalRoot"),
  toast: $("#toast")
};

let project = loadProject() || createEmptyProject();
let prototypeConfig = null;
let dragState = null;

init();

function init() {
  bindEvents();
  renderAll();
  ensurePrototypePage();
}

function bindEvents() {
  // 确保「导入文件夹」以目录模式打开：部分浏览器仅识别通过属性显式开启的 webkitdirectory
  try {
    els.folderFileInput.webkitdirectory = true;
    els.folderFileInput.directory = true;
    els.folderFileInput.multiple = true;
  } catch (error) {
    console.warn("当前浏览器可能不支持文件夹选择：", error);
  }
  $("#addFeatureBtn").addEventListener("click", () => openFeatureModal());
  $("#loadDemoBtn").addEventListener("click", loadDemo);
  $("#emptyLoadDemoBtn").addEventListener("click", loadDemo);
  $("#saveProjectBtn").addEventListener("click", () => {
    project = saveProject(project);
    renderSaveStatus("已保存到 localStorage");
    toast("项目已保存");
  });
  $("#clearProjectBtn").addEventListener("click", () => {
    if (!confirm("清空当前项目会删除本机 localStorage 中的项目数据，是否继续？")) return;
    clearProject();
    project = createEmptyProject();
    renderPrototypeUrl(els.prototypeFrame, "");
    renderAll();
    toast("当前项目已清空");
  });
  $("#exportJsonBtn").addEventListener("click", () => downloadJson(touchProject()));
  $("#exportShareBtn").addEventListener("click", () => {
    exportShareHtml(touchProject());
    toast("分享版 HTML 已生成下载");
  });
  els.importHtmlBtn.addEventListener("click", () => els.htmlFileInput.click());
  els.importFolderBtn.addEventListener("click", () => els.folderFileInput.click());
  els.importZipBtn.addEventListener("click", () => els.zipFileInput.click());
  els.importProjectBtn.addEventListener("click", () => els.projectFileInput.click());
  $("#openRawPrototypeBtn").addEventListener("click", openRawPrototype);
  $("#fitOriginalBtn").addEventListener("click", () => setViewport("original", true, true));
  $("#fitPhoneBtn").addEventListener("click", () => setViewport("phone"));
  $("#fitWebBtn").addEventListener("click", () => setViewport("web"));
  els.projectNameInput.addEventListener("input", () => {
    project.project.name = els.projectNameInput.value.trim() || "未命名项目";
    scheduleDraftSave();
  });
  els.htmlFileInput.addEventListener("change", handleHtmlImport);
  els.folderFileInput.addEventListener("change", handleFolderImport);
  els.zipFileInput.addEventListener("change", handleZipImport);
  els.projectFileInput.addEventListener("change", handleProjectImport);
  document.querySelectorAll(".mode-tab").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  els.prototypeFrame.addEventListener("load", () => {
    prototypeConfig = readPrototypeConfig(els.prototypeFrame);
    renderPrototypeConfig();
    const scene = getSelectedScene();
    if (scene) showGuideResult(applySceneToPrototype(els.prototypeFrame, project, scene));
  });
  els.annotationLayer.addEventListener("click", onAnnotationLayerClick);
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
  els.annotateToolBtn.addEventListener("click", () => armAnnotation(!els.prototypeStage.classList.contains("annotate-armed")));
  window.addEventListener("keydown", onKeyAnnotate);
  window.addEventListener("keyup", onKeyAnnotate);
  window.addEventListener("blur", () => armAnnotation(false));
}

function renderAll() {
  els.projectNameInput.value = project.project.name;
  els.emptyState.classList.toggle("is-hidden", Boolean(project.sourceUrl || project.sourceHtml));
  setMode(project.settings.mode || "annotate", false);
  setViewport(project.settings.viewport || "original", false);
  renderTree();
  renderSceneHeader();
  renderAnnotations();
  renderEditor();
  renderPrototypeConfig();
}

function renderTree() {
  if (!project.functions.length) {
    els.treeView.innerHTML = `<div class="helper-note">还没有功能。点击右上角 + 新建功能，或加载示例项目。</div>`;
    return;
  }
  els.treeView.innerHTML = project.functions.map((feature) => {
    const groups = project.sceneGroups.filter((group) => group.featureId === feature.id);
    const directScenes = project.scenes.filter((scene) => scene.featureId === feature.id && !scene.groupId);
    return `<section class="tree-item">
      <div class="tree-row ${feature.id === project.settings.selectedFeatureId && !project.settings.selectedSceneId ? "is-active" : ""}" data-feature="${feature.id}">
        <div><div class="tree-title">${escapeHtml(feature.name)}</div><div class="tree-meta">${escapeHtml(feature.pageName || "未关联页面")}</div></div>
        <div class="tree-actions">
          <button class="mini-button" data-action="add-group" data-feature="${feature.id}">分组</button>
          <button class="mini-button" data-action="add-scene" data-feature="${feature.id}">场景</button>
          <button class="mini-button" data-action="edit-feature" data-feature="${feature.id}">编辑</button>
          <button class="mini-button" data-action="delete-feature" data-feature="${feature.id}">删</button>
        </div>
      </div>
      <div class="tree-children">
        ${groups.map(renderGroup).join("")}
        ${directScenes.map(renderScene).join("")}
      </div>
    </section>`;
  }).join("");
  els.treeView.querySelectorAll("[data-feature]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      selectFeature(row.dataset.feature);
    });
  });
  els.treeView.querySelectorAll("[data-scene]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      selectScene(row.dataset.scene);
    });
  });
  els.treeView.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", handleTreeAction));
}

function renderGroup(group) {
  const scenes = project.scenes.filter((scene) => scene.groupId === group.id);
  return `<div class="tree-item">
    <div class="tree-row">
      <div><div class="tree-title">${escapeHtml(group.name)}</div><div class="tree-meta">场景分组</div></div>
      <div class="tree-actions">
        <button class="mini-button" data-action="add-scene" data-feature="${group.featureId}" data-group="${group.id}">场景</button>
        <button class="mini-button" data-action="edit-group" data-group="${group.id}">编辑</button>
        <button class="mini-button" data-action="delete-group" data-group="${group.id}">删</button>
      </div>
    </div>
    <div class="tree-children">${scenes.map(renderScene).join("")}</div>
  </div>`;
}

function renderScene(scene) {
  return `<div class="tree-row ${scene.id === project.settings.selectedSceneId ? "is-active" : ""}" data-scene="${scene.id}">
    <div><div class="tree-title">${escapeHtml(scene.name)}</div><div class="tree-meta">${entryTypeLabel(scene.entryType)}</div></div>
    <div class="tree-actions">
      <button class="mini-button" data-action="edit-scene" data-scene-id="${scene.id}">编辑</button>
      <button class="mini-button" data-action="delete-scene" data-scene-id="${scene.id}">删</button>
    </div>
  </div>`;
}

function handleTreeAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  if (action === "add-group") openGroupModal(button.dataset.feature);
  if (action === "add-scene") openSceneModal({ featureId: button.dataset.feature, groupId: button.dataset.group || "" });
  if (action === "edit-feature") openFeatureModal(project.functions.find((item) => item.id === button.dataset.feature));
  if (action === "delete-feature") deleteFeature(button.dataset.feature);
  if (action === "edit-group") openGroupModal(project.sceneGroups.find((item) => item.id === button.dataset.group));
  if (action === "delete-group") deleteGroup(button.dataset.group);
  if (action === "edit-scene") openSceneModal(project.scenes.find((item) => item.id === button.dataset.sceneId));
  if (action === "delete-scene") deleteScene(button.dataset.sceneId);
}

function selectFeature(featureId) {
  project.settings.selectedFeatureId = featureId;
  project.settings.selectedSceneId = "";
  project.settings.selectedAnnotationId = "";
  scheduleDraftSave();
  renderAll();
}

function selectScene(sceneId) {
  const scene = project.scenes.find((item) => item.id === sceneId);
  if (!scene) return;
  project.settings.selectedFeatureId = scene.featureId;
  project.settings.selectedSceneId = sceneId;
  project.settings.selectedAnnotationId = "";
  scheduleDraftSave();
  renderAll();
  showGuideResult(applySceneToPrototype(els.prototypeFrame, project, scene));
}

function renderSceneHeader() {
  const scene = getSelectedScene();
  els.currentSceneTitle.textContent = scene ? scene.name : "未选择场景";
}

function renderAnnotations() {
  const sceneId = project.settings.selectedSceneId;
  const visible = project.annotations.filter((annotation) => annotation.sceneId === sceneId);
  const pageAnnotations = getPageAnnotations().annotations;
  els.annotationLayer.innerHTML = visible.map((annotation, index) => {
    const pageIndex = pageAnnotations.findIndex((item) => item.id === annotation.id);
    const label = pageIndex >= 0 ? pageIndex + 1 : index + 1;
    return `<button class="annotation-dot ${annotation.id === project.settings.selectedAnnotationId ? "is-active" : ""}" style="left:${annotation.xPercent}%;top:${annotation.yPercent}%" data-annotation="${annotation.id}" title="${escapeHtml(annotation.title)}">${label}</button>`;
  }).join("");
  els.annotationLayer.querySelectorAll("[data-annotation]").forEach((dot) => {
    dot.addEventListener("click", (event) => {
      event.stopPropagation();
      selectAnnotation(dot.dataset.annotation);
    });
    dot.addEventListener("pointerdown", (event) => startDrag(event, dot.dataset.annotation));
  });
}

function selectAnnotation(id) {
  project.settings.selectedAnnotationId = id;
  scheduleDraftSave();
  renderAnnotations();
  renderEditor();
  scrollSelectedAnnotationIntoView();
}

function onAnnotationLayerClick(event) {
  if (project.settings.mode !== "annotate") return;
  if (!els.prototypeStage.classList.contains("annotate-armed")) return;
  if (!project.sourceUrl || !project.settings.selectedSceneId) {
    toast("请先导入原型并选择一个场景");
    return;
  }
  if (event.target.closest(".annotation-dot")) return;
  const rect = els.annotationLayer.getBoundingClientRect();
  const xPercent = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const yPercent = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
  const now = new Date().toISOString();
  const annotation = {
    id: crypto.randomUUID(),
    featureId: project.settings.selectedFeatureId,
    sceneId: project.settings.selectedSceneId,
    xPercent: Number(xPercent.toFixed(2)),
    yPercent: Number(yPercent.toFixed(2)),
    title: `标注 ${project.annotations.filter((item) => item.sceneId === project.settings.selectedSceneId).length + 1}`,
    manualFact: "",
    functionDescription: "",
    displayCondition: "当前场景命中时展示。",
    interactionRule: "",
    notes: "",
    createdAt: now,
    updatedAt: now
  };
  project.annotations.push(annotation);
  project.settings.selectedAnnotationId = annotation.id;
  scheduleDraftSave();
  renderAnnotations();
  renderEditor();
}

function startDrag(event, annotationId) {
  if (project.settings.mode !== "annotate") return;
  event.preventDefault();
  dragState = { annotationId };
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function onDragMove(event) {
  if (!dragState) return;
  const annotation = project.annotations.find((item) => item.id === dragState.annotationId);
  if (!annotation) return;
  const rect = els.annotationLayer.getBoundingClientRect();
  annotation.xPercent = Number(clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100).toFixed(2));
  annotation.yPercent = Number(clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100).toFixed(2));
  annotation.updatedAt = new Date().toISOString();
  renderAnnotations();
}

function onDragEnd() {
  if (!dragState) return;
  dragState = null;
  scheduleDraftSave();
}

function renderEditor() {
  const annotation = project.annotations.find((item) => item.id === project.settings.selectedAnnotationId);
  const scene = getSelectedScene();
  const feature = project.functions.find((item) => item.id === project.settings.selectedFeatureId);
  if (annotation || scene || feature) return renderPageAnnotationPanel({ annotation, scene, feature });
  if (scene) return renderSceneEditor(scene);
  if (feature) return renderFeatureEditor(feature);
  els.editorTitle.textContent = "说明编辑";
  els.editorSubtitle.textContent = "选择功能、场景或标注后编辑";
  els.editorPanel.innerHTML = `<div class="helper-note">当前没有选中内容。导入 HTML 后可创建功能、场景，并在标注模式下点击原型区域添加编号标注。</div>`;
}

function renderFeatureEditor(feature) {
  els.editorTitle.textContent = "功能说明";
  els.editorSubtitle.textContent = feature.name;
  els.editorPanel.innerHTML = `<div class="form-grid">
    ${inputField("功能名称", "name", feature.name)}
    ${textareaField("功能说明", "description", feature.description)}
    ${inputField("关联页面名称", "pageName", feature.pageName || "")}
    <div class="button-row"><button class="button button-primary" data-save-feature="${feature.id}">保存功能</button></div>
  </div>`;
  bindFormSave("[data-save-feature]", () => updateObject(feature, readFields(["name", "description", "pageName"])));
}

function renderSceneEditor(scene) {
  els.editorTitle.textContent = "场景说明";
  els.editorSubtitle.textContent = scene.name;
  const groups = project.sceneGroups.filter((group) => group.featureId === scene.featureId);
  els.editorPanel.innerHTML = `<div class="form-grid">
    ${inputField("场景名称", "name", scene.name)}
    <div class="field"><label>场景分组</label><select name="groupId"><option value="">不分组</option>${groups.map((group) => `<option value="${group.id}" ${group.id === scene.groupId ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}</select></div>
    ${textareaField("场景说明", "description", scene.description)}
    <div class="field"><label>进入方式</label><select name="entryType">${["state", "url", "guide", "note"].map((type) => `<option value="${type}" ${type === scene.entryType ? "selected" : ""}>${entryTypeLabel(type)}</option>`).join("")}</select></div>
    ${textareaField("状态参数 JSON", "stateJson", scene.stateJson || "", "code-textarea")}
    ${inputField("URL 参数", "urlParams", scene.urlParams || "")}
    ${textareaField("操作指引", "guide", scene.guide || "")}
    ${textareaField("推荐操作", "recommendedAction", scene.recommendedAction || "")}
    ${textareaField("预期结果", "expectedResult", scene.expectedResult || "")}
    ${renderConfigCandidates()}
    <div class="button-row"><button class="button button-primary" data-save-scene="${scene.id}">保存场景</button><button class="button button-secondary" data-apply-scene="${scene.id}">应用到原型</button></div>
  </div>`;
  bindFormSave("[data-save-scene]", () => updateObject(scene, readFields(["name", "groupId", "description", "entryType", "stateJson", "urlParams", "guide", "recommendedAction", "expectedResult"])));
  els.editorPanel.querySelector("[data-apply-scene]").addEventListener("click", () => showGuideResult(applySceneToPrototype(els.prototypeFrame, project, scene)));
  els.editorPanel.querySelectorAll("[data-candidate]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = JSON.parse(button.dataset.candidate);
      els.editorPanel.querySelector('[name="stateJson"]').value = JSON.stringify(state, null, 2);
      toast("候选状态已填入，保存后生效");
    });
  });
}

function renderPageAnnotationPanel(context = {}) {
  const pageContext = getPageAnnotations(context);
  const selectedAnnotation = pageContext.annotations.find((item) => item.id === project.settings.selectedAnnotationId) || context.annotation || pageContext.annotations[0] || null;
  els.editorTitle.textContent = "页面标注";
  els.editorSubtitle.textContent = `${pageContext.pageName} · ${pageContext.annotations.length} 条`;
  const sceneGroups = groupPageAnnotationsByScene(pageContext.annotations);
  els.editorPanel.innerHTML = `<div class="page-annotation-panel">
    <div class="page-annotation-summary">
      <div>
        <span class="toolbar-kicker">Annotation Page</span>
        <h3>${escapeHtml(pageContext.pageName)}</h3>
        <p>同一页面下的标注集中展示，点击列表项可定位并编辑。</p>
      </div>
      <span class="annotation-count">${pageContext.annotations.length} 条</span>
    </div>
    ${pageContext.annotations.length ? sceneGroups.map((group) => renderAnnotationSceneGroup(group, selectedAnnotation)).join("") : `<div class="empty-annotation-list">当前页面还没有标注。选择场景后，在标注模式下点击原型画布添加。</div>`}
  </div>`;

  els.editorPanel.querySelectorAll("[data-select-annotation]").forEach((button) => {
    button.addEventListener("click", () => {
      const annotation = project.annotations.find((item) => item.id === button.dataset.selectAnnotation);
      if (!annotation) return;
      const scene = project.scenes.find((item) => item.id === annotation.sceneId);
      if (scene && scene.id !== project.settings.selectedSceneId) {
        project.settings.selectedFeatureId = scene.featureId;
        project.settings.selectedSceneId = scene.id;
        showGuideResult(applySceneToPrototype(els.prototypeFrame, project, scene));
      }
      project.settings.selectedAnnotationId = annotation.id;
      scheduleDraftSave();
      renderAll();
      scrollSelectedAnnotationIntoView();
    });
  });

  if (!selectedAnnotation) return;
  bindFormSave("[data-save-annotation]", () => updateObject(selectedAnnotation, readFields(["title", "sceneId", "manualFact", "functionDescription", "displayCondition", "interactionRule", "notes"])));
  els.editorPanel.querySelector("[data-delete-annotation]").addEventListener("click", () => {
    if (!confirm("删除当前标注？")) return;
    project.annotations = project.annotations.filter((item) => item.id !== selectedAnnotation.id);
    project.settings.selectedAnnotationId = "";
    scheduleDraftSave();
    renderAll();
  });
  els.editorPanel.querySelector('[data-ai="polish"]').addEventListener("click", async () => {
    const result = await polishAnnotation(els.editorPanel.querySelector('[name="manualFact"]').value);
    for (const [key, value] of Object.entries(result)) {
      const field = els.editorPanel.querySelector(`[name="${key}"]`);
      if (field) field.value = value;
    }
    $("#aiResult").textContent = "已生成结构化说明，请检查后保存。";
  });
  els.editorPanel.querySelector('[data-ai="missing"]').addEventListener("click", async () => {
    $("#aiResult").textContent = `可能缺少：${(await findMissingRules(project)).join("、") || "未发现明显遗漏"}`;
  });
  els.editorPanel.querySelector('[data-ai="conflict"]').addEventListener("click", async () => {
    $("#aiResult").textContent = (await checkRuleConflicts(project)).join("\n") || "未发现明显关键词冲突。";
  });
}

function renderAnnotationSceneGroup(group, selectedAnnotation) {
  return `<section class="annotation-group">
    <div class="annotation-group-title">
      <span>${escapeHtml(group.scene?.name || "未归属场景")}</span>
      <em>${group.items.length}</em>
    </div>
    <div class="annotation-list">
      ${group.items.map(({ annotation, pageIndex }) => renderAnnotationListItem(annotation, pageIndex, selectedAnnotation)).join("")}
    </div>
  </section>`;
}

function renderAnnotationListItem(annotation, pageIndex, selectedAnnotation) {
  const scene = project.scenes.find((item) => item.id === annotation.sceneId);
  const isActive = selectedAnnotation?.id === annotation.id;
  return `<div class="annotation-list-entry ${isActive ? "is-active" : ""}" data-annotation-entry="${annotation.id}">
    <button class="annotation-list-item ${isActive ? "is-active" : ""}" data-select-annotation="${annotation.id}">
      <span class="annotation-list-index">${pageIndex + 1}</span>
      <span class="annotation-list-copy">
        <strong>${escapeHtml(annotation.title || `标注 ${pageIndex + 1}`)}</strong>
        <small>${escapeHtml(scene?.name || "未归属场景")}</small>
        <span>${escapeHtml(annotation.manualFact || annotation.functionDescription || "暂无说明，点击后补充标注内容。")}</span>
      </span>
      <span class="annotation-edit-hint">${isActive ? "正在编辑" : "点击编辑"}</span>
    </button>
    ${isActive ? renderAnnotationInlineEditor(annotation) : ""}
  </div>`;
}

function renderAnnotationInlineEditor(annotation) {
  return `<div class="annotation-inline-editor form-grid annotation-panel">
    <div class="helper-note">当前为本地规则模拟，后续可接入大模型 API。</div>
    ${inputField("标注标题", "title", annotation.title)}
    ${sceneSelectField(annotation.sceneId)}
    ${textareaField("人工补充事实", "manualFact", annotation.manualFact)}
    <div class="ai-box">
      <div class="button-row">
        <button class="button button-secondary" data-ai="polish">润色表达</button>
        <button class="button button-secondary" data-ai="missing">补全遗漏</button>
        <button class="button button-secondary" data-ai="conflict">检查冲突</button>
      </div>
      <p id="aiResult" class="helper-note">AI 辅助区会把口语化事实整理为产品说明。</p>
    </div>
    ${textareaField("功能说明", "functionDescription", annotation.functionDescription)}
    ${textareaField("展示条件", "displayCondition", annotation.displayCondition)}
    ${textareaField("交互规则", "interactionRule", annotation.interactionRule)}
    ${textareaField("注意事项", "notes", annotation.notes)}
    <div class="button-row"><button class="button button-primary" data-save-annotation="${annotation.id}">保存标注</button><button class="button button-danger" data-delete-annotation="${annotation.id}">删除标注</button></div>
  </div>`;
}

function getPageAnnotations(context = {}) {
  const selectedScene = context.scene || getSelectedScene();
  const selectedFeature = context.feature || project.functions.find((item) => item.id === (selectedScene?.featureId || project.settings.selectedFeatureId));
  const selectedPageName = getFeaturePageName(selectedFeature);
  const pageFeatures = project.functions.filter((feature) => getFeaturePageName(feature) === selectedPageName);
  const pageFeatureIds = new Set(pageFeatures.map((feature) => feature.id));
  const pageScenes = project.scenes.filter((scene) => pageFeatureIds.has(scene.featureId));
  const pageSceneIds = new Set(pageScenes.map((scene) => scene.id));
  const annotations = project.annotations.filter((annotation) => pageSceneIds.has(annotation.sceneId));
  return {
    pageName: selectedPageName || "未关联页面",
    features: pageFeatures,
    scenes: pageScenes,
    annotations
  };
}

function scrollSelectedAnnotationIntoView() {
  requestAnimationFrame(() => {
    const entry = els.editorPanel.querySelector(`[data-annotation-entry="${project.settings.selectedAnnotationId}"]`);
    entry?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function groupPageAnnotationsByScene(annotations) {
  const sceneOrder = new Map(project.scenes.map((scene, index) => [scene.id, index]));
  const groups = new Map();
  annotations.forEach((annotation, pageIndex) => {
    const scene = project.scenes.find((item) => item.id === annotation.sceneId);
    const key = scene?.id || "unknown";
    if (!groups.has(key)) groups.set(key, { scene, items: [], order: sceneOrder.get(key) ?? 9999 });
    groups.get(key).items.push({ annotation, pageIndex });
  });
  return Array.from(groups.values()).sort((a, b) => a.order - b.order);
}

function getFeaturePageName(feature) {
  return (feature?.pageName || feature?.name || "未关联页面").trim();
}

function renderConfigCandidates() {
  if (!prototypeConfig?.states) return `<div class="config-box helper-note">未读取到 window.PROTOTYPE_CONFIG。仍可手动创建场景和标注。</div>`;
  const keys = Object.keys(prototypeConfig.states);
  const samples = keys.slice(0, 4).map((key) => ({ [key]: prototypeConfig.states[key][0] }));
  return `<div class="config-box"><strong>状态协议候选</strong><p class="helper-note">已读取 ${escapeHtml(prototypeConfig.name || "PROTOTYPE_CONFIG")}。点击候选只填入状态，不会自动创建正式场景。</p><div class="button-row">${samples.map((item) => `<button type="button" class="button button-secondary" data-candidate="${escapeHtml(JSON.stringify(item))}">${escapeHtml(Object.keys(item)[0])}</button>`).join("")}</div></div>`;
}

function renderPrototypeConfig() {
  if (prototypeConfig?.states) {
    els.prototypeConfigBadge.textContent = `已读取状态协议：${prototypeConfig.name || "PROTOTYPE_CONFIG"}`;
    els.prototypeConfigBadge.classList.remove("muted");
  } else {
    els.prototypeConfigBadge.textContent = "未读取到状态协议";
    els.prototypeConfigBadge.classList.add("muted");
  }
}

function sceneSelectField(value) {
  return `<div class="field"><label>所属场景</label><select name="sceneId">${project.scenes.map((scene) => `<option value="${scene.id}" ${scene.id === value ? "selected" : ""}>${escapeHtml(scene.name)}</option>`).join("")}</select></div>`;
}

function inputField(label, name, value) {
  return `<div class="field"><label>${label}</label><input name="${name}" value="${escapeHtml(value || "")}" /></div>`;
}

function textareaField(label, name, value, className = "") {
  return `<div class="field"><label>${label}</label><textarea class="${className}" name="${name}">${escapeHtml(value || "")}</textarea></div>`;
}

function bindFormSave(selector, saveFn) {
  els.editorPanel.querySelector(selector).addEventListener("click", () => {
    saveFn();
    scheduleDraftSave();
    renderAll();
    toast("已保存");
  });
}

function readFields(names) {
  return Object.fromEntries(names.map((name) => [name, els.editorPanel.querySelector(`[name="${name}"]`)?.value || ""]));
}

function updateObject(target, values) {
  Object.assign(target, values, { updatedAt: new Date().toISOString() });
}

function openFeatureModal(feature) {
  openModal(feature ? "编辑功能" : "新建功能", [
    { label: "功能名称", name: "name", value: feature?.name || "" },
    { label: "功能说明", name: "description", value: feature?.description || "", type: "textarea" },
    { label: "关联页面名称", name: "pageName", value: feature?.pageName || "" }
  ], (values) => {
    if (feature) updateObject(feature, values);
    else {
      const now = new Date().toISOString();
      project.functions.push({ id: crypto.randomUUID(), ...values, createdAt: now, updatedAt: now });
    }
    scheduleDraftSave();
    renderAll();
  });
}

function openGroupModal(featureOrGroup) {
  const group = typeof featureOrGroup === "object" ? featureOrGroup : null;
  const featureId = group?.featureId || featureOrGroup;
  openModal(group ? "编辑场景分组" : "新建场景分组", [
    { label: "分组名称", name: "name", value: group?.name || "" }
  ], (values) => {
    if (group) updateObject(group, values);
    else {
      const now = new Date().toISOString();
      project.sceneGroups.push({ id: crypto.randomUUID(), featureId, name: values.name, createdAt: now, updatedAt: now });
    }
    scheduleDraftSave();
    renderAll();
  });
}

function openSceneModal(sceneOrDefaults) {
  const scene = sceneOrDefaults?.id ? sceneOrDefaults : null;
  const defaults = scene || sceneOrDefaults;
  const fields = [
    { label: "场景名称", name: "name", value: scene?.name || "" },
    { label: "场景说明", name: "description", value: scene?.description || "", type: "textarea" },
    { label: "状态参数 JSON", name: "stateJson", value: scene?.stateJson || "{\n  \n}", type: "textarea" },
    { label: "URL 参数", name: "urlParams", value: scene?.urlParams || "" },
    { label: "操作指引", name: "guide", value: scene?.guide || "", type: "textarea" },
    { label: "推荐操作", name: "recommendedAction", value: scene?.recommendedAction || "", type: "textarea" },
    { label: "预期结果", name: "expectedResult", value: scene?.expectedResult || "", type: "textarea" }
  ];
  openModal(scene ? "编辑场景" : "新建场景", fields, (values, form) => {
    const entryType = form.querySelector('[name="entryType"]').value;
    const groupId = form.querySelector('[name="groupId"]').value;
    if (scene) updateObject(scene, { ...values, entryType, groupId });
    else {
      const now = new Date().toISOString();
      const item = { id: crypto.randomUUID(), featureId: defaults.featureId, groupId: groupId || defaults.groupId || "", entryType, ...values, createdAt: now, updatedAt: now };
      project.scenes.push(item);
      project.settings.selectedSceneId = item.id;
      project.settings.selectedFeatureId = item.featureId;
    }
    scheduleDraftSave();
    renderAll();
  }, `<div class="field"><label>进入方式</label><select name="entryType">${["state", "url", "guide", "note"].map((type) => `<option value="${type}" ${type === (scene?.entryType || "state") ? "selected" : ""}>${entryTypeLabel(type)}</option>`).join("")}</select></div><div class="field"><label>场景分组</label><select name="groupId"><option value="">不分组</option>${project.sceneGroups.filter((group) => group.featureId === defaults.featureId).map((group) => `<option value="${group.id}" ${group.id === (scene?.groupId || defaults.groupId) ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("")}</select></div>`);
}

function openModal(title, fields, onSubmit, extraHtml = "") {
  els.modalRoot.innerHTML = `<form class="modal-card"><h3>${title}</h3><div class="form-grid">${fields.map((field) => field.type === "textarea" ? textareaField(field.label, field.name, field.value) : inputField(field.label, field.name, field.value)).join("")}${extraHtml}<div class="button-row"><button class="button button-primary" type="submit">保存</button><button class="button button-secondary" type="button" data-close>取消</button></div></div></form>`;
  const form = els.modalRoot.querySelector("form");
  form.querySelector("[data-close]").addEventListener("click", closeModal);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    onSubmit(values, form);
    closeModal();
  });
}

function closeModal() {
  els.modalRoot.innerHTML = "";
}

function deleteFeature(id) {
  if (!confirm("删除功能会同时删除其分组、场景和标注，是否继续？")) return;
  const sceneIds = project.scenes.filter((scene) => scene.featureId === id).map((scene) => scene.id);
  project.functions = project.functions.filter((item) => item.id !== id);
  project.sceneGroups = project.sceneGroups.filter((item) => item.featureId !== id);
  project.scenes = project.scenes.filter((item) => item.featureId !== id);
  project.annotations = project.annotations.filter((item) => !sceneIds.includes(item.sceneId));
  project.settings.selectedFeatureId = "";
  project.settings.selectedSceneId = "";
  project.settings.selectedAnnotationId = "";
  scheduleDraftSave();
  renderAll();
}

function deleteGroup(id) {
  if (!confirm("删除分组会保留场景并移动为不分组，是否继续？")) return;
  project.sceneGroups = project.sceneGroups.filter((item) => item.id !== id);
  project.scenes.forEach((scene) => {
    if (scene.groupId === id) scene.groupId = "";
  });
  scheduleDraftSave();
  renderAll();
}

function deleteScene(id) {
  if (!confirm("删除场景会同时删除该场景标注，是否继续？")) return;
  project.scenes = project.scenes.filter((item) => item.id !== id);
  project.annotations = project.annotations.filter((item) => item.sceneId !== id);
  project.settings.selectedSceneId = "";
  project.settings.selectedAnnotationId = "";
  scheduleDraftSave();
  renderAll();
}

async function handleHtmlImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirmPrototypeOverwrite()) {
    event.target.value = "";
    return;
  }
  try {
    const result = await uploadPrototypeProject([file], { type: "html", relativePaths: [file.name] });
    const sourceHtml = await file.text();
    await applyPrototypeImport(result, { sourceHtml, sourceKind: "html", fallbackName: file.name });
    toast("单文件 HTML 已作为原型项目导入");
  } catch (error) {
    toast(`导入失败：${error.message}`);
  }
  event.target.value = "";
}

async function handleFolderImport(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  if (!confirmPrototypeOverwrite()) {
    event.target.value = "";
    return;
  }
  const relativePaths = files.map((file) => file.webkitRelativePath);
  if (relativePaths.some((path) => !path)) {
    event.target.value = "";
    toast("请选择整个原型文件夹（而非单个文件）。若浏览器不支持文件夹选择，可改用「导入 ZIP」。");
    return;
  }
  try {
    const result = await uploadPrototypeProject(files, { type: "folder", relativePaths });
    await applyPrototypeImport(result, { sourceKind: "folder", fallbackName: relativePaths[0]?.split("/")[0] || "原型文件夹" });
    toast(`文件夹已导入，共 ${result.fileCount} 个文件`);
  } catch (error) {
    toast(`导入失败：${error.message}`);
  }
  event.target.value = "";
}

async function handleZipImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirmPrototypeOverwrite()) {
    event.target.value = "";
    return;
  }
  try {
    const result = await uploadPrototypeProject([file], { type: "zip" });
    await applyPrototypeImport(result, { sourceKind: "zip", fallbackName: file.name.replace(/\.zip$/i, "") });
    toast(`ZIP 已导入，共 ${result.fileCount} 个文件`);
  } catch (error) {
    toast(`导入失败：${error.message}`);
  }
  event.target.value = "";
}

async function handleProjectImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm("导入项目将覆盖当前未导出的内容，是否继续？")) {
    event.target.value = "";
    return;
  }
  try {
    project = normalizeProject(JSON.parse(await file.text()));
    await ensurePrototypePage();
    project = saveProject(project);
    renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
    renderAll();
    toast("项目 JSON 已导入");
  } catch (error) {
    toast(`导入失败：${error.message}`);
  }
  event.target.value = "";
}

async function loadDemo() {
  if ((project.sourceUrl || project.sourceHtml) && !confirm("加载示例项目会覆盖当前项目，是否继续？")) return;
  project = createDemoProject();
  const saved = await savePrototypeHtml(project.sourceHtml, "im-chat-demo.html");
  project.prototypeId = saved.prototypeId;
  project.entryFile = saved.entryFile;
  project.sourceUrl = saved.prototypeUrl;
  project.sourceFileName = saved.entryFile;
  project.sourceKind = "html";
  project.fileCount = saved.fileCount;
  project = saveProject(project);
  renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
  renderAll();
  toast("示例项目已加载");
}

function setMode(mode, persist = true) {
  project.settings.mode = mode;
  document.querySelectorAll(".mode-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
  els.prototypeStage.classList.toggle("annotate-mode", mode === "annotate");
  els.prototypeStage.classList.toggle("experience-mode", mode === "experience");
  els.prototypeStage.classList.toggle("preview-mode", mode === "preview");
  document.body.classList.toggle("share-preview", mode === "preview");
  if (persist) scheduleDraftSave();
  armAnnotation(false);
}

function armAnnotation(on) {
  if (project.settings.mode !== "annotate") on = false;
  els.prototypeStage.classList.toggle("annotate-armed", on);
  els.annotateToolBtn.classList.toggle("is-active", on);
  els.annotateHint.classList.toggle("is-hidden", !on);
}

function onKeyAnnotate(event) {
  if (project.settings.mode !== "annotate") return;
  if (event.type === "keydown" && (event.altKey || event.shiftKey)) {
    armAnnotation(true);
  } else if (event.type === "keyup" && !event.altKey && !event.shiftKey) {
    armAnnotation(false);
  }
}

function setViewport(viewport, persist = true, reloadPrototype = false) {
  project.settings.viewport = viewport;
  els.prototypeStage.classList.toggle("original-size", viewport === "original");
  els.prototypeStage.classList.toggle("phone-size", viewport === "phone");
  els.prototypeStage.classList.toggle("web-size", viewport === "web");
  document.querySelectorAll("[data-viewport]").forEach((button) => button.classList.toggle("is-active", button.dataset.viewport === viewport));
  if (persist) scheduleDraftSave();
  if (reloadPrototype && project.sourceUrl) {
    renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
  }
}

async function ensurePrototypePage() {
  if (hasPersistedPrototypeUrl(project.sourceUrl)) {
    renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
    return;
  }
  if (!project.sourceHtml) return;
  try {
    const saved = await savePrototypeHtml(project.sourceHtml, project.sourceFileName || `${project.project.name || "prototype"}.html`);
    project.prototypeId = saved.prototypeId;
    project.entryFile = saved.entryFile;
    project.sourceUrl = saved.prototypeUrl;
    project.sourceFileName = saved.entryFile;
    project.sourceKind = "html";
    project.fileCount = saved.fileCount;
    project = saveProject(project);
    renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
  } catch (error) {
    toast(`原型页面保存失败：${error.message}`);
  }
}

function hasPersistedPrototypeUrl(url) {
  return typeof url === "string" && url && !url.startsWith("blob:") && !url.startsWith("data:");
}

async function applyPrototypeImport(result, options = {}) {
  let entryFile = result.entryFile;
  let prototypeUrl = result.prototypeUrl;
  if (result.requiresEntry || !entryFile) {
    entryFile = await chooseEntryFile(result.htmlFiles || [], { forceChoice: Boolean(result.requiresEntry) });
    prototypeUrl = `/prototypes/${result.prototypeId}/${entryFile.split("/").map(encodeURIComponent).join("/")}`;
  }
  project.sourceHtml = options.sourceHtml || "";
  project.prototypeId = result.prototypeId;
  project.entryFile = entryFile;
  project.sourceUrl = prototypeUrl;
  project.sourceFileName = entryFile;
  project.sourceKind = options.sourceKind || "folder";
  project.fileCount = result.fileCount;
  project.htmlFiles = result.htmlFiles || [];
  project.project.name = options.fallbackName ? options.fallbackName.replace(/\.(html?|zip)$/i, "") : project.project.name;
  project.settings.viewport = "original";
  project = saveProject(project);
  renderPrototypeUrl(els.prototypeFrame, project.sourceUrl);
  renderAll();
}

function chooseEntryFile(htmlFiles, options = {}) {
  return new Promise((resolve, reject) => {
    if (!htmlFiles.length) {
      reject(new Error("未找到可运行的 HTML 入口文件"));
      return;
    }
    if (htmlFiles.length === 1 && !options.forceChoice) {
      resolve(htmlFiles[0]);
      return;
    }
    els.modalRoot.innerHTML = `<form class="modal-card"><h3>选择原型入口文件</h3><div class="form-grid">
      <p class="helper-note">根目录没有 index.html，请选择本次原型项目的入口 HTML。</p>
      <div class="field"><label>入口文件</label><select name="entryFile">${htmlFiles.map((file) => `<option value="${escapeHtml(file)}">${escapeHtml(file)}</option>`).join("")}</select></div>
      <div class="button-row"><button class="button button-primary" type="submit">加载入口</button><button class="button button-secondary" type="button" data-close>取消</button></div>
    </div></form>`;
    const form = els.modalRoot.querySelector("form");
    form.querySelector("[data-close]").addEventListener("click", () => {
      closeModal();
      reject(new Error("已取消选择入口文件"));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const entryFile = new FormData(form).get("entryFile");
      closeModal();
      resolve(entryFile);
    });
  });
}

function openRawPrototype() {
  if (!project.sourceUrl) {
    toast("请先导入原型项目");
    return;
  }
  window.open(project.sourceUrl, "_blank", "noopener,noreferrer");
}

function confirmPrototypeOverwrite() {
  return !project.sourceUrl || confirm("导入新原型项目将覆盖当前原型入口，但不会删除已有功能、场景和标注，是否继续？");
}

function scheduleDraftSave() {
  project.project.updatedAt = new Date().toISOString();
  localStorage.setItem("universal-html-prototype-explainer", JSON.stringify(project));
  renderSaveStatus("草稿已自动保存");
}

function touchProject() {
  project = saveProject(project);
  renderSaveStatus("已保存");
  return project;
}

function renderSaveStatus(text) {
  els.saveStatus.textContent = `${text} · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

function showGuideResult(result) {
  els.guideBox.classList.toggle("is-hidden", !result?.message);
  els.guideBox.textContent = result?.message || "";
  if (result && !result.ok) toast(result.message);
}

function getSelectedScene() {
  return project.scenes.find((scene) => scene.id === project.settings.selectedSceneId);
}

function entryTypeLabel(type) {
  return ({ state: "原型状态控制", url: "URL 参数", guide: "操作指引", note: "只做说明" })[type] || "只做说明";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 3000);
}
