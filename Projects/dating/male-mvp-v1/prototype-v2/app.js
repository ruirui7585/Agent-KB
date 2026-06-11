const appRoot = document.getElementById("app");
const annotationRoot = document.getElementById("annotation-root");

function installGlobalClickDebug() {
  if (typeof document === "undefined" || window.__datingGlobalClickDebugBound) return;
  window.__datingGlobalClickDebugBound = true;
  document.addEventListener("click", function(event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;

    console.log("[global-click-debug]", {
      tag: target.tagName,
      className: target.className,
      moduleId: target.closest("[data-module-id]")?.dataset?.moduleId,
      chatThread: target.closest("[data-chat-thread-id]")?.dataset?.chatThreadId,
      meAction: target.closest("[data-me-action]")?.dataset?.meAction,
      discoverUser: target.closest("[data-discover-user-id]")?.dataset?.discoverUserId
    });
  }, true);
}

installGlobalClickDebug();

/* ========== Toast ========== */
var toastTimer = null;

function showToast(message, duration) {
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  updateState({ toastStatus: message });
  toastTimer = setTimeout(function() {
    updateState({ toastStatus: "none" });
    toastTimer = null;
  }, duration || 3000);
}

/* ========== Icon SVGs ========== */
function iconSvg(name) {
  var icons = {
    heart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    x: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3"/></svg>',
    settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
    filter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.3A19.5 19.5 0 0 1 5 12.2 19.8 19.8 0 0 1 1.7 3.6 2 2 0 0 1 3.7 1.6h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L7.5 9.8a16 16 0 0 0 6.7 6.7l1.4-1.4a2 2 0 0 1 2.1-.5c1 .3 2 .6 3 .7a2 2 0 0 1 1.7 2z"/></svg>',
    image: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-4.5-4.5L8 19"/></svg>',
    chevronUp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    lock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };
  return icons[name] || "";
}

/* ========== Labels ========== */
var userSegmentLabels = {
  all: "全部用户",
  new_user: "新用户",
  free_user: "免费用户",
  paid_user: "付费用户",
  subscriber: "订阅用户",
  renewal_user: "续费用户",
  low_balance_user: "金币不足用户"
};

var stateLabelMap = {
  default: "默认态",
  locked: "锁定态",
  loading: "加载中",
  hidden: "隐藏",
  empty: "空状态",
  unlocked: "已解锁",
  insufficient_balance: "金币不足",
  matched: "已匹配",
  disabled: "不可用",
  blur_and_lock: "模糊并锁定",
  skeleton: "骨架屏",
  hide: "隐藏",
  none: "无"
};

function getStateLabel(key) {
  return stateLabelMap[key] || key;
}

function getAnnotationControlTypeLabel(type) {
  var labels = typeof annotationControlTypeLabels !== "undefined" ? annotationControlTypeLabels : {};
  return labels[type] || type;
}

function getFeatureScenarioKey(pageId) {
  if (pageId === "profile") {
    return "discover";
  }
  if (pageId === "verifyIdentity" || pageId === "meSubPage" || pageId === "privateAlbum") {
    return "me";
  }
  if (pageId === "chat") {
    return prototypeState.chatViewStatus === "detail" ? "chatDetail" : "chatList";
  }
  return pageId;
}

function getFeatureScenarioTargetModuleId(scenario, pageId) {
  if (!scenario) return null;
  if (pageId === "profile" && scenario.id === "discover_secondary_page") {
    return "profile_primary";
  }
  if (pageId === "profile" && scenario.id === "discover_swipe_page") {
    return "profile_primary";
  }
  return scenario.moduleId;
}

function getCurrentFeatureScenarios() {
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var pageConfig = getCurrentPageConfig();
  var modules = pageConfig.modules || {};
  var scenarioKey = getFeatureScenarioKey(pageId);
  var configured = typeof featureScenarioConfigs !== "undefined" ? featureScenarioConfigs[scenarioKey] : null;

  if (Array.isArray(configured)) {
    return configured.filter(function(scenario) {
      var targetModuleId = getFeatureScenarioTargetModuleId(scenario, pageId);
      return scenario && targetModuleId && modules[targetModuleId];
    });
  }

  return getPageModules(pageConfig).map(function(module) {
    return {
      id: module.id,
      title: getReadableModuleTitle(module),
      controlType: "info",
      moduleId: module.id
    };
  });
}

function getActiveFeatureScenario() {
  var scenarios = getCurrentFeatureScenarios();
  var activeScenarioId = prototypeState.activeFeatureScenarioId;
  var activeModuleId = normalizeAnnotationModuleId(prototypeState.activeModuleId);

  if (activeScenarioId) {
    var exact = scenarios.find(function(scenario) {
      return scenario.id === activeScenarioId;
    });
    if (exact) return exact;
  }

  if (activeModuleId) {
    var moduleMatched = scenarios.find(function(scenario) {
      return scenario.moduleId === activeModuleId;
    });
    if (moduleMatched) return moduleMatched;
  }

  return scenarios[0] || null;
}

function getPrototypeDrivenFeatureScenarioId() {
  if (prototypeState.currentPage === "profile" || prototypeState.bottomSheetStatus === "profile_sheet") {
    return "discover_secondary_page";
  }

  if (prototypeState.currentPage === "discover") {
    return "discover_swipe_page";
  }

  if (prototypeState.currentPage === "chat" && prototypeState.chatViewStatus === "detail") {
    var activeModuleId = normalizeAnnotationModuleId(prototypeState.activeModuleId);
    if (activeModuleId === "chat_private_photo_unlock" || prototypeState.activePrivatePhotoMessageId) {
      return "chat_private_photo_unlock";
    }
  }

  return null;
}

function syncFeatureScenarioWithPrototypeState() {
  var scenarios = getCurrentFeatureScenarios();
  var scenarioId = getPrototypeDrivenFeatureScenarioId();

  if (scenarioId && scenarios.some(function(scenario) { return scenario.id === scenarioId; })) {
    prototypeState.activeFeatureScenarioId = scenarioId;
    return;
  }

  if (!scenarios.some(function(scenario) { return scenario.id === prototypeState.activeFeatureScenarioId; })) {
    prototypeState.activeFeatureScenarioId = null;
  }
}

var annotationPositionStorageKey = "dating_annotation_editor_position";
var annotationPmNotesStorageKey = "dating_annotation_notes";
var annotationViewerNotesStorageKey = "dating_annotation_viewer_notes";
var annotationSizeStorageKey = "dating_annotation_editor_size";
var annotationDragState = null;

function getReadablePageName(pageId) {
  var config = pageConfigs && pageConfigs[pageId];
  var map = {
    discover: "发现 / 滑卡",
    likes: "喜欢",
    matches: "匹配",
    chat: "聊天",
    me: "我的",
    profile: "资料",
    discoverSettings: "设置",
    editProfile: "编辑资料",
    verifyIdentity: "头像认证",
    meSubPage: "我的设置",
    privateAlbum: "私密相册"
  };
  return map[pageId] || (config && config.pageName) || pageId;
}

function getReadableModuleTitle(module) {
  var map = {
    "Discover Header": "发现页头部",
    "Swipe Card": "滑卡卡片",
    "Swipe Actions": "滑卡操作",
    "Likes Segment Tabs": "喜欢页分段 Tab",
    "Likes Me Preview": "谁喜欢我预览",
    "Match List": "匹配列表",
    "Match Chat Entry": "匹配聊天入口",
    "Chat List / Messages": "聊天列表 / 消息",
    "Paid Message Lock": "付费消息锁定",
    "Private Photo Unlock": "私密内容解锁",
    "Private Content Unlock": "私密内容解锁",
    "Profile / Premium Entry": "资料 / 会员入口",
    "Coin Balance Entry": "金币余额入口"
  };
  if (!module) return "";
  return map[module.title] || module.title || module.id || "";
}

function getStatusPanelLabel() {
  var page = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var moduleId = getAnnotationTargetModuleId();
  if (page === "me") return "账户状态";
  if (page === "likes") return "权限状态";
  if (page === "chat" && moduleId === "chat_private_photo_unlock") return "消耗状态";
  if (page === "discover") return "使用计数";
  return "使用计数";
}

function formatLocalTime(date) {
  var d = date ? new Date(date) : new Date();
  var pad = function(n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function hydrateAnnotationEditorPrefs() {
  if (typeof localStorage === "undefined") return;
  try {
    var position = JSON.parse(localStorage.getItem(annotationPositionStorageKey) || "null");
    if (position && typeof position.x === "number" && typeof position.y === "number") {
      prototypeState.annotationEditorPosition = {
        mode: position.mode || "floating",
        x: position.x,
        y: position.y
      };
    }
  } catch (e) {}
  try {
    var size = localStorage.getItem(annotationSizeStorageKey);
    if (["compact", "normal", "wide"].indexOf(size) !== -1) {
      prototypeState.annotationEditorSize = size;
    }
  } catch (e) {}
  try {
    var exportMode = localStorage.getItem("dating_annotation_export_mode");
    if (exportMode === "readonly") {
      prototypeState.annotationReadOnly = true;
      prototypeState.annotationExportMode = "readonly";
    }
  } catch (e) {}
}

/* ========== Save & Export ========== */
function saveAnnotationConfig() {
  if (typeof localStorage === "undefined") return;
  try {
    var config = {
      userSegment: prototypeState.annotationUserSegment,
      activePage: prototypeState.activeAnnotationPage,
      activeModuleId: prototypeState.activeModuleId,
      activeTab: prototypeState.activeAnnotationTab,
      activeModuleState: prototypeState.activeModuleState,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem("dating.annotation.config", JSON.stringify(config));
    localStorage.setItem("dating.annotation.allNotes", JSON.stringify(collectAnnotationFieldNotes()));
    showToast("已保存");
  } catch (e) {
    showToast("保存失败");
  }
}

function collectAnnotationFieldNotes() {
  var allNotes = {};
  Object.keys(pageConfigs).forEach(function(pageId) {
    var modules = pageConfigs[pageId].modules || {};
    Object.keys(modules).forEach(function(moduleId) {
      var key = getAnnotationStorageKey(pageId, moduleId);
      var notes = getSavedAnnotationNotes(pageId, moduleId);
      if (Object.keys(notes).length > 0) {
        allNotes[key] = notes;
      }
    });
  });
  return allNotes;
}

function getPmNotesStore() {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(annotationPmNotesStorageKey) || "{}");
  } catch (e) {
    return {};
  }
}

function setPmNotesStore(notes) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(annotationPmNotesStorageKey, JSON.stringify(notes));
}

function getViewerNotesStore() {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(annotationViewerNotesStorageKey) || "{}");
  } catch (e) {
    return {};
  }
}

function setViewerNotesStore(notes) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(annotationViewerNotesStorageKey, JSON.stringify(notes));
}

function getPmNoteKey(pageId, moduleId) {
  var scenario = getActiveFeatureScenario();
  return pageId + ":" + (scenario ? scenario.id : moduleId);
}

function getCurrentPmNote() {
  var module = getActiveModule();
  if (!module) return null;
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var notes = getPmNotesStore();
  return notes[getPmNoteKey(pageId, module.id)] || notes[pageId + ":" + module.id] || null;
}

function saveCurrentPmNote(value) {
  if (prototypeState.annotationReadOnly) return;
  var module = getActiveModule();
  if (!module || typeof localStorage === "undefined") return;
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var notes = getPmNotesStore();
  var key = getPmNoteKey(pageId, module.id);
  var noteText = String(value || "").trim();
  if (!noteText) {
    delete notes[key];
  } else {
    notes[key] = {
      page: pageId,
      scenarioId: getActiveFeatureScenario() ? getActiveFeatureScenario().id : null,
      noteType: "pm",
      moduleId: module.id,
      moduleTitle: getReadableModuleTitle(module),
      note: noteText,
      content: noteText,
      updatedAt: formatLocalTime()
    };
  }
  setPmNotesStore(notes);
  updateState({});
}

function clearCurrentPmNote() {
  if (prototypeState.annotationReadOnly) return;
  var module = getActiveModule();
  if (!module || typeof localStorage === "undefined") return;
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var notes = getPmNotesStore();
  delete notes[getPmNoteKey(pageId, module.id)];
  setPmNotesStore(notes);
  updateState({});
}

function toggleAnnotationNoteView(view) {
  updateState({ annotationNoteView: ["all", "add"].indexOf(view) !== -1 ? view : "current" });
}

function saveViewerNote(value) {
  var module = getActiveModule();
  var scenario = getActiveFeatureScenario();
  if (!module || typeof localStorage === "undefined") return;
  var content = String(value || "").trim();
  if (!content) return;
  var notes = getViewerNotesStore();
  var id = "viewer_" + Date.now();
  notes[id] = {
    page: prototypeState.activeAnnotationPage || prototypeState.currentPage,
    scenarioId: scenario ? scenario.id : null,
    noteType: "viewer",
    moduleId: module.id,
    moduleTitle: scenario ? scenario.title : getReadableModuleTitle(module),
    content: content,
    note: content,
    updatedAt: formatLocalTime()
  };
  setViewerNotesStore(notes);
  showToast("查看者备注已保存");
  updateState({ annotationNoteView: "all" });
}

function collectExportState() {
  return {
    currentPage: prototypeState.currentPage,
    activeAnnotationPage: prototypeState.activeAnnotationPage,
    activeModuleId: prototypeState.activeModuleId,
    activeAnnotationTab: prototypeState.activeAnnotationTab,
    activeModuleState: prototypeState.activeModuleState,
    annotationUserSegment: prototypeState.annotationUserSegment,
    activeEntitlementKey: prototypeState.activeEntitlementKey,
    annotationEditorPosition: prototypeState.annotationEditorPosition,
    annotationEditorSize: prototypeState.annotationEditorSize || "normal",
    annotationReadOnly: prototypeState.annotationReadOnly,
    coinBalance: prototypeState.coinBalance,
    subscriptionStatus: prototypeState.subscriptionStatus,
    likesMePermissionStatus: prototypeState.likesMePermissionStatus
  };
}

function getExportFileStamp() {
  var d = new Date();
  var pad = function(n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes());
}

var exportedHtmlUrls = [];

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise(function(resolve, reject) {
    try {
      var input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      var ok = document.execCommand("copy");
      input.remove();
      ok ? resolve() : reject(new Error("copy failed"));
    } catch (e) {
      reject(e);
    }
  });
}

function downloadTextFile(filename, content, mimeType, keepUrl) {
  var blob = new Blob([content], { type: mimeType || "text/plain" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (keepUrl) {
    exportedHtmlUrls.push(url);
    return url;
  }
  URL.revokeObjectURL(url);
  return url;
}

async function fetchPrototypeSource(path) {
  try {
    var response = await fetch(path, { cache: "no-store" });
    if (response.ok) return response.text();
  } catch (e) {}

  return new Promise(function(resolve, reject) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.onload = function() {
        if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
          resolve(xhr.responseText);
        } else {
          reject(new Error("Cannot load " + path));
        }
      };
      xhr.onerror = function() { reject(new Error("Cannot load " + path)); };
      xhr.send();
    } catch (error) {
      reject(error);
    }
  });
}

async function readExportSource(path) {
  try {
    return { ok: true, text: await fetchPrototypeSource(path) };
  } catch (e) {
    return { ok: false, text: "" };
  }
}

function getLocalAssetUrl(path) {
  try {
    var base = (window.location && window.location.href) || (typeof location !== "undefined" && location.href) || document.baseURI || "";
    return new URL(path, base).href;
  } catch (e) {
    return path;
  }
}

function buildExportBootstrap(mode, pmNotes, viewerNotes, position, size, snapshot) {
  return '<script>\\n'
    + 'window.__DATING_EXPORTED_ANNOTATION_NOTES__=' + JSON.stringify(pmNotes).replace(/</g, "\\\\u003c") + ';\\n'
    + 'window.__DATING_EXPORTED_VIEWER_NOTES__=' + JSON.stringify(viewerNotes).replace(/</g, "\\\\u003c") + ';\\n'
    + 'window.__DATING_EXPORTED_POSITION__=' + JSON.stringify(position).replace(/</g, "\\\\u003c") + ';\\n'
    + 'window.__DATING_EXPORTED_SIZE__=' + JSON.stringify(size).replace(/</g, "\\\\u003c") + ';\\n'
    + 'window.__DATING_EXPORTED_STATE__=' + JSON.stringify(snapshot).replace(/</g, "\\\\u003c") + ';\\n'
    + 'try{localStorage.setItem("' + annotationPmNotesStorageKey + '",JSON.stringify(window.__DATING_EXPORTED_ANNOTATION_NOTES__));localStorage.setItem("' + annotationViewerNotesStorageKey + '",JSON.stringify(window.__DATING_EXPORTED_VIEWER_NOTES__));localStorage.setItem("' + annotationPositionStorageKey + '",JSON.stringify(window.__DATING_EXPORTED_POSITION__));localStorage.setItem("' + annotationSizeStorageKey + '",window.__DATING_EXPORTED_SIZE__);localStorage.setItem("dating_annotation_export_mode","' + mode + '");}catch(e){}\\n'
    + '</script>';
}

function buildStateOverrideScript(mode, snapshot) {
  return '<script>\\n'
    + 'try{Object.assign(prototypeState,' + JSON.stringify(snapshot).replace(/</g, "\\\\u003c") + ');prototypeState.annotationReadOnly=' + (mode === "readonly" ? "true" : "false") + ';prototypeState.annotationExportMode="' + mode + '";}catch(e){}\\n'
    + '</script>';
}

async function exportPrototypeHtml(mode) {
  try {
    saveAnnotationConfig();
    var styleSource = await readExportSource("./style.css");
    var stateSource = await readExportSource("./state.js");
    var dataSource = await readExportSource("./data.js");
    var appSource = await readExportSource("./app.js");
    var pmNotes = getPmNotesStore();
    var viewerNotes = getViewerNotesStore();
    var position = prototypeState.annotationEditorPosition || { mode: "default", x: 0, y: 0 };
    var size = prototypeState.annotationEditorSize || "normal";
    var snapshot = collectExportState();
    var canInline = styleSource.ok && stateSource.ok && dataSource.ok && appSource.ok;
    var html = "";

    if (canInline) {
      html = '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n<meta charset="UTF-8" />\\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\\n<title>Dating Prototype Export</title>\\n<style>' + styleSource.text + '\\n</style>\\n</head>\\n<body>\\n'
        + '<div class="prototype-workspace">\\n<section class="phone-preview"><div class="phone-frame"><div id="app"></div></div></section>\\n<aside class="annotation-editor-shell"><div id="annotation-root"></div></aside>\\n</div>\\n'
        + '<script>' + stateSource.text + '\\n</script>\\n'
        + buildExportBootstrap(mode, pmNotes, viewerNotes, position, size, snapshot)
        + '<script>' + dataSource.text + '\\n</script>\\n'
        + buildStateOverrideScript(mode, snapshot)
        + '<script>' + appSource.text + '\\n</script>\\n'
        + '<!-- Assets note: if images use ./assets paths, keep the assets folder next to this exported HTML. -->\\n'
        + '</body>\\n</html>';
    } else {
      html = '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n<meta charset="UTF-8" />\\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\\n<title>Dating Prototype Export</title>\\n'
        + '<link rel="stylesheet" href="' + getLocalAssetUrl("./style.css") + '" />\\n</head>\\n<body>\\n'
        + '<div class="prototype-workspace">\\n<section class="phone-preview"><div class="phone-frame"><div id="app"></div></div></section>\\n<aside class="annotation-editor-shell"><div id="annotation-root"></div></aside>\\n</div>\\n'
        + '<script src="' + getLocalAssetUrl("./state.js") + '"></script>\\n'
        + buildExportBootstrap(mode, pmNotes, viewerNotes, position, size, snapshot)
        + '<script src="' + getLocalAssetUrl("./data.js") + '"></script>\\n'
        + buildStateOverrideScript(mode, snapshot)
        + '<script src="' + getLocalAssetUrl("./app.js") + '"></script>\\n'
        + '<!-- Export fallback: browser blocked source inlining under file://. This HTML remains an HTML prototype export, but it references the original local prototype-v2 files. Keep /Users/shilv/Desktop/dating/prototype-v2 and assets available. -->\\n'
        + '</body>\\n</html>';
    }

    var exportUrl = downloadTextFile("dating-prototype-export-" + getExportFileStamp() + ".html", html, "text/html", true);
    try {
      localStorage.setItem("dating_last_export_html_url", exportUrl);
    } catch (e) {}
    try {
      await copyTextToClipboard(exportUrl);
      showToast(mode === "readonly" ? "已导出只读 HTML" : (canInline ? "已导出 HTML，URL 已复制" : "已导出 HTML，URL 已复制；请保留本地原型文件"));
    } catch (copyError) {
      if (typeof window.prompt === "function") {
        window.prompt("复制导出 HTML URL", exportUrl);
      }
      showToast(mode === "readonly" ? "已导出只读 HTML" : "已导出 HTML，请复制弹窗 URL");
    }
  } catch (e) {
    showToast("导出失败，请在 Chrome 中重试");
  }
}

function exportEditableVersion() {
  exportPrototypeHtml("editable");
}

function exportReadonlyVersion() {
  exportPrototypeHtml("readonly");
}

function applyUserSegment(segment) {
  var update = { annotationUserSegment: segment };
  if (entitlementRules[segment]) {
    update.activeEntitlementKey = segment;
  }
  updateState(update);
}

function applyEntitlementKey(key) {
  if (!entitlementRules[key]) return;
  var nextState = {
    activeEntitlementKey: key,
    annotationUserSegment: key,
    userStatus: key
  };

  if (key === "subscriber") {
    nextState.subscriptionStatus = "active";
    nextState.likesMePermissionStatus = "unlocked";
    nextState.likesMeStatus = "unlocked";
  } else {
    nextState.subscriptionStatus = "none";
    nextState.likesMePermissionStatus = "locked";
    nextState.likesMeStatus = "locked";
  }

  if (key === "low_balance_user") {
    nextState.coinBalance = Math.min(Number(prototypeState.coinBalance) || 0, 31);
    nextState.balanceStatus = "low_balance";
  }

  updateState(nextState);
}

/* ========== Entitlement Engine ========== */

function getActiveEntitlement() {
  return entitlementRules[prototypeState.activeEntitlementKey] || entitlementRules.free_user;
}

function getEntitlementLimitedFlag(actionType) {
  var map = {
    like: "isLikeLimited",
    superLike: "isSuperLikeLimited",
    pass: "isSwipeLimited",
    gift: "isGiftLimited",
    photoUnlock: "isPhotoLimited",
    chatMessage: "isMessageLimited",
    message_send: "isMessageLimited",
    likesMe: "isLikesMeLocked"
  };
  var flag = map[actionType];
  return flag ? !!prototypeState[flag] : false;
}

function getEntitlementQuotaDisplay(actionType) {
  var countMap = {
    like: "dailyLikeCount",
    superLike: "dailySuperLikeCount",
    pass: "dailyPassCount",
    gift: "dailyGiftCount",
    photoUnlock: "dailyPhotoUnlockCount",
    chatMessage: "dailyMessageCount",
    message_send: "dailyMessageCount"
  };
  var remainingMap = {
    like: "likeQuotaRemaining",
    superLike: "superLikeQuotaRemaining",
    pass: "passQuotaRemaining",
    gift: "giftQuotaRemaining",
    photoUnlock: "photoUnlockQuotaRemaining",
    chatMessage: "messageQuotaRemaining",
    message_send: "messageQuotaRemaining"
  };
  var remaining = prototypeState[remainingMap[actionType]];
  if (remaining === "unlimited") return { used: prototypeState[countMap[actionType]] || 0, total: "∞", remaining: "∞", isUnlimited: true };
  var used = prototypeState[countMap[actionType]] || 0;
  var total = (remaining || 0) + used;
  return { used: used, total: total, remaining: remaining, isUnlimited: false };
}

function checkEntitlement(actionType) {
  var ent = getActiveEntitlement();
  var quota = (ent.quotas[actionType] || {});
  var trigger = (ent.paywallTriggers || {})[actionType];

  if (quota.daily === "unlimited") {
    return { allowed: true, paywallType: null, quotaRemaining: "unlimited" };
  }

  var limited = getEntitlementLimitedFlag(actionType);
  if (limited) {
    return { allowed: false, paywallType: trigger || "subscription_paywall", quotaRemaining: 0, reason: "quota_exhausted" };
  }

  var disp = getEntitlementQuotaDisplay(actionType);
  return { allowed: true, paywallType: null, quotaRemaining: disp.remaining };
}

function consumeEntitlement(actionType) {
  var ent = getActiveEntitlement();
  var quota = (ent.quotas[actionType] || {});

  if (quota.daily === "unlimited") return;

  var countMap = {
    like: "dailyLikeCount",
    superLike: "dailySuperLikeCount",
    gift: "dailyGiftCount",
    photoUnlock: "dailyPhotoUnlockCount",
    chatMessage: "dailyMessageCount",
    message_send: "dailyMessageCount"
  };

  var countKey = countMap[actionType];
  if (countKey) {
    prototypeState[countKey] = (prototypeState[countKey] || 0) + 1;
  }

  if ((actionType === "message_send" || actionType === "chatMessage") && prototypeState.usageCounters) {
    prototypeState.usageCounters.message_send = (prototypeState.usageCounters.message_send || 0) + 1;
  }
}

function handleEntitlementAction(actionType, callback) {
  var check = checkEntitlement(actionType);
  if (!check.allowed) {
    if (actionType === "message_send" || actionType === "chatMessage") {
      openChatPaywall();
    } else if (check.paywallType === "subscription_paywall") {
      openSubscriptionPaywall();
    } else if (check.paywallType === "coin_recharge") {
      openCoinRecharge();
    }
    return false;
  }

  consumeEntitlement(actionType);
  syncDerivedState();

  if (typeof callback === "function") {
    callback();
  }

  return true;
}

function getCurrentScenarioText() {
  var pageConfig = getCurrentPageConfig();
  var pageName = getReadablePageName(prototypeState.activeAnnotationPage || prototypeState.currentPage);
  var scenario = getActiveFeatureScenario();
  var moduleTitle = scenario ? scenario.title : "页面说明";
  var moduleState = getStateLabel(prototypeState.activeModuleState || "default");
  var entName = getEntitlementDisplayName(prototypeState.activeEntitlementKey || prototypeState.annotationUserSegment);
  return entName + " · " + pageName + " · " + moduleTitle + " · " + moduleState;
}

function getApplicableEntitlementKeys(currentPage, activeModuleId) {
  if (typeof paywallPointPageMapping === "undefined") return [];
  var moduleId = normalizeAnnotationModuleId(activeModuleId || getAnnotationTargetModuleId());

  if (currentPage === "chat") {
    if (moduleId === "chat_primary") return ["message_send"];
    if (moduleId === "chat_paid_message") return ["message_send"];
    if (moduleId === "chat_private_photo_unlock") return [];
    return ["message_send"];
  }

  var keys = [];
  for (var key in paywallPointPageMapping) {
    if (!paywallPointPageMapping.hasOwnProperty(key)) continue;
    var mapping = paywallPointPageMapping[key];
    var pages = mapping.applicablePages || [];
    var modules = mapping.applicableModules || [];
    var moduleMatched = !moduleId || modules.length === 0 || modules.indexOf(moduleId) !== -1;
    if (pages.indexOf(currentPage) !== -1 && moduleMatched) {
      keys.push(key);
    }
  }
  return keys;
}

function getCounterLabel(pointKey) {
  var labelMap = {
    swipe_limit:     "滑卡次数",
    like_action:     "喜欢次数",
    message_send:    "消息次数",
    likes_me:        "谁喜欢我",
    visitor_view:    "访客",
    private_photo:   "私密照",
    private_video:   "私密视频",
    advanced_filter: "高级筛选",
    boost_exposure:  "曝光加速",
    paid_gift:       "付费礼物",
    profile_enhance: "资料增强"
  };
  return labelMap[pointKey] || pointKey;
}

function getEntitlementDisplayName(key) {
  var map = {
    all: "全部用户",
    new_user: "新用户",
    free_user: "免费用户",
    paid_user: "付费用户",
    subscriber: "订阅用户",
    renewal_user: "续费用户",
    low_balance_user: "金币不足用户"
  };
  return map[key] || (entitlementRules[key] && entitlementRules[key].name) || key;
}

function translateAnnotationText(value) {
  var text = String(value ?? "");
  var map = {
    "展示滑卡入口、剩余滑卡次数和金币余额，帮助 PM 判断权益消耗前置提示是否清晰。": "Shows the swipe entry and entitlement summary so PMs can review whether usage hints are clear before limits are reached.",
    "顶部标题与轻量状态摘要，不应遮挡主卡片。": "Top title with lightweight status context. It must not cover the main card.",
    "点击 Me 可进入个人中心，状态变化后需要同步刷新数字。": "Tap the settings entry to review account options. State changes should refresh summary values immediately.",
    "subscriptionStatus = active 时 dailySwipeRemaining 可变为 unlimited。": "When subscriptionStatus = active, dailySwipeRemaining can become unlimited.",
    "滑卡次数为 0、金币不足、订阅激活后文案过长。": "Check zero swipes, low balance, and long copy after subscription activation.",
    "标题、剩余次数、金币数可见；切换页面后注释器同步为当前页。": "Title and entitlement summary stay visible, and the editor syncs when the page changes.",
    "展示 Discover 标题和权益摘要": "Show the Discover title and entitlement summary.",
    "展示 header skeleton": "Show the header skeleton.",
    "隐藏 header 用于沉浸态检查": "Hide the header for immersive-state checks.",
    "核心滑卡入口，用于展示推荐用户并承接 Like / Pass / Super Like。": "Core swipe entry for recommended profiles and Like / Pass intent.",
    "大图卡片，底部渐变展示姓名、年龄、城市、距离、在线状态。": "Large image card with bottom gradient for name, age, city, distance, and online status.",
    "点击卡片进入 Profile；Like 后切换下一张；互相喜欢时触发 Match。": "Tap the card to open Profile. Like advances to the next card and can trigger a Match.",
    "dailySwipeRemaining = 0 时触发 subscription_paywall；subscriptionStatus = active 时提升滑卡次数。": "When dailySwipeRemaining = 0, trigger subscription_paywall. Active subscriptions increase swipe allowance.",
    "图片加载失败、无更多用户、滑卡次数耗尽、按钮被底部 Tab 遮挡。": "Handle image failure, empty recommendations, swipe limit reached, and actions being covered by the bottom tab.",
    "图片正常展示；按钮可点击；切卡后不残留爱心/X 动效。": "Image renders correctly, actions are tappable, and no Like/Pass feedback remains after changing cards.",
    "展示当前推荐卡片": "Show the current recommendation card.",
    "展示 skeleton": "Show skeleton loading.",
    "展示无更多用户空态": "Show an empty state when there are no more users.",
    "模糊卡片并提示 Premium": "Blur the card and show a Premium prompt.",
    "Pass 和 Like 是 Discover 主转化按钮，必须保持在卡片上层且可点击。": "Pass and Like are the primary Discover conversion actions and must remain above the card and tappable.",
    "圆形按钮悬浮在卡片底部附近，不能被 Bottom Tab 遮挡。": "Circular buttons float near the card bottom and must not be covered by the bottom tab.",
    "Pass / Like 点击后切换下一张，不弹出无关 Toast 或 Modal。": "Pass / Like advances to the next card without unrelated toast or modal interruptions.",
    "superLikeRemaining = 0 时 Super Like 入口应触发订阅，当前版本仅保留 Pass / Like。": "If Super Like is unavailable, it should lead to subscription. This version keeps only Pass / Like.",
    "按钮层级低于底部导航、切卡后反馈残留。": "Watch for actions under the bottom navigation and leftover feedback after card changes.",
    "按钮处于最上层；点击后卡片切换且无残留反馈。": "Actions stay on top; tapping changes cards without residual feedback.",
    "展示 Pass / Like": "Show Pass / Like.",
    "按钮不可用": "Actions are disabled.",
    "隐藏按钮用于截图对比": "Hide actions for screenshot comparison.",
    "区分 Like you 和 Match，让未订阅用户先看到价值再进入付费。": "Separates liked-you value from Match so non-subscribers see value before the paywall.",
    "胶囊二级 Tab，当前项高亮，文案居中。": "Pill-style secondary tabs with centered labels and active highlight.",
    "点击 Like you / Match 切换列表，不应刷新页面。": "Tap Like you / Match to switch content without a page reload.",
    "likesViewStatus 控制当前二级页。": "likesViewStatus controls the active secondary view.",
    "Tab 文案过长、切换后列表空白、注释器高亮影响点击。": "Check long tab copy, blank lists after switching, and annotation highlight interfering with taps.",
    "两个 Tab 都能切换且内容非空。": "Both tabs switch correctly and show non-empty content.",
    "展示 Like you / Match": "Show Like you / Match.",
    "展示切换加载态": "Show tab switching loading state.",
    "未订阅时展示模糊喜欢你预览，推动 Premium 订阅。": "Shows blurred liked-you previews for non-subscribers to drive Premium subscription.",
    "图片卡片可模糊，CTA 固定在列表底部附近。": "Image cards can be blurred, with a CTA near the list bottom.",
    "点击预览或 CTA 打开 subscription_paywall。": "Tap preview or CTA to open subscription_paywall.",
    "subscriptionStatus = active 时 likesMePermissionStatus = unlocked。": "When subscriptionStatus = active, likesMePermissionStatus becomes unlocked.",
    "头像模糊仍需保留吸引力；无 Likes 时需要 empty 状态。": "Blurred avatars should still feel attractive; empty Likes need an empty state.",
    "未订阅时模糊；订阅入口统一打开 subscription_paywall。": "Blur for non-subscribers; all subscription entries open subscription_paywall.",
    "模糊头像并展示订阅 CTA": "Blur avatars and show a subscription CTA.",
    "显示完整头像和资料入口": "Show clear avatars and profile entry.",
    "展示暂无喜欢你的人": "Show no-liked-you empty state."
  };
  return map[text] || text;
}

function getCounterDisplayData(pointKey) {
  /* Returns { used, total, isLimited } for the given paywallPoint key.
     Prefers legacy daily counters; falls back to usageCounters. */
  var legacyMap = {
    like_action:   { countField: "dailyLikeCount",        quotaField: "likeQuotaRemaining",        limitedField: "isLikeLimited" },
    message_send:  { countField: "dailyMessageCount",      quotaField: "messageQuotaRemaining",      limitedField: "isMessageLimited" },
    paid_gift:     { countField: "dailyGiftCount",         quotaField: "giftQuotaRemaining",         limitedField: "isGiftLimited" },
    private_photo: { countField: "dailyPhotoUnlockCount",  quotaField: "photoUnlockQuotaRemaining",  limitedField: "isPhotoLimited" }
  };

  var legacy = legacyMap[pointKey];
  if (legacy) {
    var remaining = prototypeState[legacy.quotaField];
    if (remaining === "unlimited") {
      return { used: pointKey === "message_send" && prototypeState.usageCounters ? (prototypeState.usageCounters.message_send || 0) : (prototypeState[legacy.countField] || 0), total: "∞", isLimited: false };
    }
    var used = pointKey === "message_send" && prototypeState.usageCounters ? (prototypeState.usageCounters.message_send || 0) : (prototypeState[legacy.countField] || 0);
    var total = (remaining || 0) + used;
    return { used: used, total: total, isLimited: !!prototypeState[legacy.limitedField] };
  }

  /* swipe_limit: reads from dynamic pass quota (computed per user segment) */
  if (pointKey === "swipe_limit") {
    var remaining = prototypeState.passQuotaRemaining;
    if (remaining === "unlimited") {
      return { used: prototypeState.dailyPassCount || 0, total: "∞", isLimited: false };
    }
    var used = prototypeState.dailyPassCount || 0;
    var total = (remaining || 0) + used;
    return { used: used, total: total, isLimited: !!prototypeState.isSwipeLimited };
  }

  /* Fallback: read from usageCounters */
  if (prototypeState.usageCounters && typeof prototypeState.usageCounters[pointKey] === "number") {
    return { used: prototypeState.usageCounters[pointKey], total: "—", isLimited: false };
  }

  return { used: 0, total: "—", isLimited: false };
}

function getEntitlementType(pointKey) {
  /* Returns "counter", "permission", or "unknown" for a paywallPoint key */
  if (typeof entitlementRules === "undefined") return "unknown";
  var seg = entitlementRules[prototypeState.activeEntitlementKey];
  if (!seg || !seg.paywallPoints) return "unknown";
  var point = seg.paywallPoints[pointKey];
  if (!point) return "unknown";
  return point.entitlementType === "permission" ? "permission" : "counter";
}

function canViewLikesMe() {
  /* Only active subscribers can view Likes Me in full detail */
  if (prototypeState.annotationUserSegment === "free_user" || prototypeState.activeEntitlementKey === "free_user") return false;
  if (prototypeState.activeEntitlementKey === "subscriber") return true;
  if (prototypeState.subscriptionStatus === "active") return true;
  return false;
}

function handleLikesMeClick(userId) {
  if (canViewLikesMe()) {
    /* Subscriber / unlocked: open the user profile or chat */
    var thread = legacyChatThreads.find(function(t) { return t.userId === userId; });
    if (thread) {
      updateState({ currentPage: "chat", activeChatThreadId: thread.id, chatViewStatus: "detail" });
    } else {
      updateState({ currentPage: "profile", profileSheetUserId: userId, bottomSheetStatus: "profile_sheet" });
    }
    return;
  }
  /* Everyone else: open subscription paywall (including renewal users) */
  openSubscriptionPaywall();
}

function renderPermissionStatusPanel() {
  var currentPage = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var applicableKeys = getApplicableEntitlementKeys(currentPage, getAnnotationTargetModuleId());

  var permissionKeys = applicableKeys.filter(function(k) {
    return getEntitlementType(k) === "permission";
  });

  if (permissionKeys.length === 0) return "";

  var rows = permissionKeys.map(function(pointKey) {
    var label = getCounterLabel(pointKey);
    var unlocked = (pointKey === "likes_me") ? canViewLikesMe() : false;
    var badgeCls = unlocked ? "permission-badge unlocked" : "permission-badge locked";
    var badgeText = unlocked ? "已解锁" : "已锁定";
    var payModel = "订阅";
    var clickResult = unlocked ? "打开资料或聊天" : "打开订阅弹窗";

    return '<div class="permission-status-row">'
      + '<span class="permission-label">' + label + '</span>'
      + '<span class="' + badgeCls + '">' + badgeText + '</span>'
      + '<span class="permission-meta">付费模型：' + payModel + ' · 点击结果：' + clickResult + '</span>'
      + '</div>';
  }).join("");

  return '<div class="permission-status-panel"><span class="annotation-field-label">权限状态</span>' + rows + '</div>';
}

function renderEntitlementCounterSummary() {
  var currentPage = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var applicableKeys = getApplicableEntitlementKeys(currentPage, getAnnotationTargetModuleId());

  /* Separate counter-type from permission-type */
  var counterKeys = applicableKeys.filter(function(k) {
    return getEntitlementType(k) !== "permission";
  });

  if (counterKeys.length === 0) {
    /* Still show the panel if there are permission items */
    var hasPermissions = applicableKeys.some(function(k) { return getEntitlementType(k) === "permission"; });
    if (hasPermissions) {
      return renderPermissionStatusPanel();
    }
    return "";
  }

  var rows = counterKeys.map(function(pointKey) {
    var data = getCounterDisplayData(pointKey);
    var label = getCounterLabel(pointKey);

    var cls = data.isLimited ? " ent-counter-limited" : "";
    var barPct = data.total === "∞" ? 100 : (data.total === "—" || data.total <= 0 ? 0 : Math.round(data.used / data.total * 100));
    var totalText = data.total;

    return '<div class="ent-counter-row' + cls + '">'
      + '<span class="ent-counter-label">' + label + '</span>'
      + '<span class="ent-counter-bar-wrap"><span class="ent-counter-bar" style="width:' + barPct + '%"></span></span>'
      + '<span class="ent-counter-nums">' + data.used + ' / ' + totalText + '</span>'
      + '</div>';
  }).join("");

  return renderPermissionStatusPanel() + '<div class="ent-counter-summary"><span class="annotation-field-label">使用计数</span>' + rows + '</div>';
}

function renderUsageCounterPanel(keys) {
  var safeKeys = Array.isArray(keys) ? keys : [];
  if (safeKeys.length === 0) return "";

  var rows = safeKeys.map(function(pointKey) {
    var data = getCounterDisplayData(pointKey);
    var barPct = data.total === "∞" ? 100 : (data.total === "—" || data.total <= 0 ? 0 : Math.round(data.used / data.total * 100));
    return '<div class="ent-counter-row' + (data.isLimited ? " ent-counter-limited" : "") + '">'
      + '<span class="ent-counter-label">' + escapeHtml(getCounterLabel(pointKey)) + '</span>'
      + '<span class="ent-counter-bar-wrap"><span class="ent-counter-bar" style="width:' + barPct + '%"></span></span>'
      + '<span class="ent-counter-nums">' + escapeHtml(data.used) + ' / ' + escapeHtml(data.total) + '</span>'
      + '</div>';
  }).join("");

  return '<div class="ent-counter-summary"><span class="annotation-field-label">使用计数</span>' + rows + '</div>';
}

function getPrivateContentType(message) {
  return message && (message.contentType || message.type) === "private_video" ? "private_video" : "private_photo";
}

function getPrivateContentTypeLabel(type) {
  return type === "private_video" ? "私密视频" : "私密照片";
}

function getPrivateContentStatusLabel(status) {
  var labels = {
    draft: "已选择未发送",
    sent_unopened: "已发送未查看",
    opened_countdown: "已查看倒计时中",
    not_sent: "未发送",
    sent_locked: "已发送未解锁",
    unlocked_countdown: "已解锁倒计时中",
    destroyed: "已销毁",
    already_sent: "已发送过，不可重复发送",
    locked: "已发送未解锁",
    unlocked: "已解锁倒计时中",
    insufficient_balance: "金币不足"
  };
  return labels[status] || labels.not_sent;
}

function getPrivateContentGroup() {
  return Object.assign({
    id: "private_group_01",
    photosCount: 2,
    videosCount: 1,
    selectedMediaIds: [],
    mediaItems: [],
    status: "draft",
    countdownSeconds: 600,
    isFreeForReceiver: true
  }, prototypeState.privateContentGroup || {});
}

function updatePrivateContentGroup(partial) {
  var current = getPrivateContentGroup();
  updateState({
    privateContentGroup: Object.assign({}, current, partial)
  });
}

function getPrivateContentGroupStatusLabel(status) {
  var labels = {
    draft: "已选择未发送",
    sent_unopened: "已发送未查看",
    opened_countdown: "已查看倒计时中",
    destroyed: "已销毁"
  };
  return labels[status] || labels.draft;
}

function findPrivateContentGroupMessage(threadId, groupId) {
  var safeThreadId = threadId || prototypeState.activeChatThreadId;
  var group = getPrivateContentGroup();
  var safeGroupId = groupId || group.id;
  var messages = safeThreadId ? (chatMessageHistory[safeThreadId] || []) : [];
  return messages.find(function(item) {
    return item.type === "sent_private_group" && item.groupId === safeGroupId;
  }) || null;
}

function syncPrivateContentGroupFromMessage(message) {
  if (!message) return getPrivateContentGroup();
  return Object.assign({}, getPrivateContentGroup(), {
    id: message.groupId,
    photosCount: message.photosCount,
    videosCount: message.videosCount,
    selectedMediaIds: message.selectedMediaIds || [],
    mediaItems: message.mediaItems || [],
    status: message.status,
    countdownSeconds: message.countdownSeconds || 600,
    isFreeForReceiver: true
  });
}

function getPrivateContentTemplates(type) {
  if (type === "private_video" && typeof privateVideoMessageTemplates !== "undefined") return privateVideoMessageTemplates;
  if (typeof privatePhotoMessageTemplates !== "undefined") return privatePhotoMessageTemplates;
  return {};
}

function getPrivateContentTemplate(type, threadId) {
  var templates = getPrivateContentTemplates(type || prototypeState.activePrivateContentType);
  return (threadId && templates[threadId]) || templates.legacy_chat_001 || Object.values(templates)[0] || null;
}

function getPrivatePhotoUnlockTemplate() {
  if (prototypeState.activePrivatePhotoMessageId) {
    var message = findPrivatePhotoMessage(prototypeState.activePrivatePhotoMessageId);
    if (message) return message;
  }
  return getPrivateContentTemplate(prototypeState.activePrivateContentType, prototypeState.activeChatThreadId);
}

function getPrivatePhotoClickResult(message) {
  if (message && message.status === "destroyed") return "destroyed";
  if (message && isPrivatePhotoMessageUnlocked(message)) return "view_private_content";
  var price = message ? (message.priceCoins || 0) : prototypeState.photoUnlockPrice;
  return prototypeState.coinBalance >= price ? "photo_unlock" : "coin_recharge";
}

function renderConsumptionStatusPanel() {
  var group = getPrivateContentGroup();
  var message = findPrivateContentGroupMessage(prototypeState.activeChatThreadId, group.id);
  if (message) group = syncPrivateContentGroupFromMessage(message);

  return '<div class="ent-counter-summary"><span class="annotation-field-label">当前内容信息</span>'
    + '<div class="annotation-status-row"><strong>内容组状态</strong><span>' + escapeHtml(getPrivateContentGroupStatusLabel(group.status)) + '</span></div>'
    + '<div class="annotation-status-row"><strong>图片数量</strong><span>' + escapeHtml(group.photosCount) + '</span></div>'
    + '<div class="annotation-status-row"><strong>视频数量</strong><span>' + escapeHtml(group.videosCount) + '</span></div>'
    + '<div class="annotation-status-row"><strong>是否免费查看</strong><span>是</span></div>'
    + '<div class="annotation-status-row"><strong>倒计时状态</strong><span>' + escapeHtml(group.status === "opened_countdown" ? "10:00" : "未开始") + '</span></div>'
    + '</div>';
}

function getPrivateContentStatus() {
  var message = getActivePrivatePhotoMessage();
  if (!message) return prototypeState.privateContentStatus || "not_sent";
  if (message.status === "destroyed") return "destroyed";
  if (isPrivatePhotoMessageUnlocked(message)) return "unlocked_countdown";
  return "sent_locked";
}

function getPrivatePhotoSupplyStatus() {
  return getPrivateContentStatusLabel(getPrivateContentStatus());
}

function renderPrivateContentStateButtons() {
  var group = getPrivateContentGroup();
  var message = findPrivateContentGroupMessage(prototypeState.activeChatThreadId, group.id);
  var status = message ? message.status : group.status;
  var states = [
    { key: "sent_unopened", label: "已发送未查看" },
    { key: "opened_countdown", label: "已查看倒计时中" },
    { key: "destroyed", label: "已销毁" }
  ];

  return '<div class="annotation-segment-row private-content-state-row">'
    + states.map(function(item) {
      return '<button class="annotation-segment-btn' + (status === item.key ? " active" : "") + '" data-control-type="state" onclick="applyPrivateContentStatus(\'' + item.key + '\')">' + item.label + '</button>';
    }).join("")
    + '</div>';
}

function renderPrivatePhotoSimulationPanel(module) {
  if ((prototypeState.activeAnnotationPage || prototypeState.currentPage) !== "chat") return "";
  if (!module || module.id !== "chat_private_photo_unlock") return "";

  return '<div class="annotation-simulation-panel private-content-simulation-panel">'
    + '<div class="annotation-control-heading"><span class="annotation-field-label">私密内容组状态</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("state") + '</span></div>'
    + renderPrivateContentStateButtons()
    + '<div class="annotation-control-heading"><span class="annotation-field-label">模拟操作</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("simulation") + '</span></div>'
    + '<div class="private-content-action-grid">'
    + '<button class="annotation-simulate-btn secondary" data-control-type="simulation" onclick="simulatePrivateContentGroupViewed()">模拟对方查看</button>'
    + '<button class="annotation-simulate-btn secondary" data-control-type="simulation" onclick="simulatePrivateContentGroupDestroyed()">模拟倒计时结束</button>'
    + '</div>'
    + '<div class="annotation-status-row"><strong>当前状态</strong><span>' + escapeHtml(getPrivateContentGroupStatusLabel(getPrivateContentGroup().status)) + '</span></div>'
    + '</div>';
}

function simulatePrivatePhotoFromAnnotation() {
  simulatePrivateContentFromAnnotation("private_photo");
}

function renderPaidMessageStatusPanel() {
  var messageData = getCounterDisplayData("message_send");
  var clickResult = prototypeState.coinBalance <= 0 ? "coin_recharge" : "paid_message_unlock";
  var barPct = messageData.total === "∞" ? 100 : (messageData.total === "—" || messageData.total <= 0 ? 0 : Math.round(messageData.used / messageData.total * 100));
  return '<div class="ent-counter-summary"><span class="annotation-field-label">使用计数</span>'
    + '<div class="ent-counter-row' + (messageData.isLimited ? " ent-counter-limited" : "") + '">'
    + '<span class="ent-counter-label">消息次数</span>'
    + '<span class="ent-counter-bar-wrap"><span class="ent-counter-bar" style="width:' + barPct + '%"></span></span>'
    + '<span class="ent-counter-nums">' + escapeHtml(messageData.used) + ' / ' + escapeHtml(messageData.total) + '</span>'
    + '</div>'
    + '<div class="annotation-status-row"><strong>付费消息状态</strong><span>' + escapeHtml(prototypeState.paidMessageStatus) + '</span></div>'
    + '<div class="annotation-status-row"><strong>金币余额</strong><span>' + escapeHtml(prototypeState.coinBalance) + ' coins</span></div>'
    + '<div class="annotation-status-row"><strong>点击结果</strong><span>' + clickResult + '</span></div>'
    + '</div>';
}

function getAnnotationContextPanel(currentPage, moduleId) {
  var safePage = currentPage || prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var safeModuleId = normalizeAnnotationModuleId(moduleId || getAnnotationTargetModuleId());

  if (safePage !== "chat") {
    return { panelType: "default", html: null };
  }

  if (safeModuleId === "chat_private_photo_unlock") {
    return {
      panelType: "consumption",
      html: renderConsumptionStatusPanel()
    };
  }

  if (safeModuleId === "chat_paid_message") {
    return {
      panelType: "counter_or_consumption",
      html: renderPaidMessageStatusPanel()
    };
  }

  return {
    panelType: "counter",
    html: renderUsageCounterPanel(["message_send"])
  };
}

function renderPhoneApp() {
  appRoot.innerHTML = `
    <div class="app-page">
      ${renderCurrentPage()}
      ${renderBottomTab()}
      ${renderBottomSheet()}
      ${renderModal()}
      ${renderToast()}
    </div>
  `;
}

function renderAnnotationEditor() {
  if (!annotationRoot) return;
  try {
    if (typeof pageConfigs === "undefined") {
      annotationRoot.innerHTML = '<div class="annotation-error"><strong>加载错误</strong><p>缺少注释配置：pageConfigs 未定义。</p></div>';
      return;
    }
    if (typeof prototypeState === "undefined") {
      annotationRoot.innerHTML = '<div class="annotation-error"><strong>加载错误</strong><p>缺少状态数据：prototypeState 未定义。</p></div>';
      return;
    }
    var pageConfig = getCurrentPageConfig();
    if (!pageConfig) {
      annotationRoot.innerHTML = '<div class="annotation-error"><strong>当前页面暂无注释配置</strong><p>页面 "' + escapeHtml(prototypeState.currentPage || "未知") + '" 未在 pageConfigs 中定义。</p></div>';
      return;
    }
    var modules = getPageModules(pageConfig);
    if (!modules || modules.length === 0) {
      annotationRoot.innerHTML = '<div class="annotation-error"><strong>当前页面暂无模块</strong><p>' + escapeHtml(pageConfig.pageName || "") + ' 未定义模块。</p></div>';
      return;
    }
    syncFeatureScenarioWithPrototypeState();
    var panelHtml = renderAnnotationPanel();
    if (!panelHtml) {
      annotationRoot.innerHTML = '<div class="annotation-error"><strong>注释器为空</strong><p>请检查 annotationStatus 或页面配置。</p></div>';
      return;
    }
    annotationRoot.innerHTML = panelHtml;
    applyAnnotationEditorShellPosition();
  } catch (e) {
    annotationRoot.innerHTML = '<div class="annotation-error"><strong>注释器加载失败</strong><p>' + escapeHtml(e.message || "未知错误") + '</p></div>';
  }
}

function getAnnotationEditorShell() {
  return annotationRoot ? annotationRoot.closest(".annotation-editor-shell") : null;
}

function applyAnnotationEditorShellPosition() {
  var shell = getAnnotationEditorShell();
  if (!shell) return;
  var pos = prototypeState.annotationEditorPosition || { mode: "default", x: 0, y: 0 };
  var size = prototypeState.annotationEditorSize || "normal";
  shell.classList.toggle("annotation-floating", pos.mode === "floating");
  shell.classList.remove("annotation-size-compact", "annotation-size-normal", "annotation-size-wide");
  shell.classList.add("annotation-size-" + size);
  if (pos.mode === "floating") {
    shell.style.left = pos.x + "px";
    shell.style.top = pos.y + "px";
    shell.style.right = "auto";
  } else {
    shell.style.left = "";
    shell.style.top = "";
    shell.style.right = "";
  }
}

function clampAnnotationPosition(x, y, shell) {
  var width = shell ? shell.offsetWidth : 420;
  var height = shell ? shell.offsetHeight : 620;
  var maxX = Math.max(0, window.innerWidth - width - 8);
  var maxY = Math.max(0, window.innerHeight - height - 8);
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(8, y), maxY)
  };
}

function persistAnnotationEditorPosition(pos) {
  prototypeState.annotationEditorPosition = pos;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(annotationPositionStorageKey, JSON.stringify(pos));
  }
}

function startAnnotationDrag(event) {
  var shell = getAnnotationEditorShell();
  if (!shell) return;
  event.preventDefault();
  var rect = shell.getBoundingClientRect();
  annotationDragState = {
    startX: event.clientX,
    startY: event.clientY,
    originX: rect.left,
    originY: rect.top
  };
  shell.classList.add("is-dragging");
  document.addEventListener("mousemove", handleAnnotationDragMove);
  document.addEventListener("mouseup", stopAnnotationDrag);
}

function handleAnnotationDragMove(event) {
  if (!annotationDragState) return;
  var shell = getAnnotationEditorShell();
  if (!shell) return;
  var next = clampAnnotationPosition(
    annotationDragState.originX + event.clientX - annotationDragState.startX,
    annotationDragState.originY + event.clientY - annotationDragState.startY,
    shell
  );
  shell.classList.add("annotation-floating");
  shell.style.left = next.x + "px";
  shell.style.top = next.y + "px";
  shell.style.right = "auto";
  persistAnnotationEditorPosition({ mode: "floating", x: next.x, y: next.y });
}

function stopAnnotationDrag() {
  var shell = getAnnotationEditorShell();
  if (shell) shell.classList.remove("is-dragging");
  annotationDragState = null;
  document.removeEventListener("mousemove", handleAnnotationDragMove);
  document.removeEventListener("mouseup", stopAnnotationDrag);
}

function resetAnnotationEditorPosition() {
  prototypeState.annotationEditorPosition = { mode: "default", x: 0, y: 0 };
  prototypeState.annotationEditorSize = "normal";
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(annotationPositionStorageKey);
    localStorage.removeItem(annotationSizeStorageKey);
  }
  applyAnnotationEditorShellPosition();
  updateState({});
}

function setAnnotationEditorSize(size) {
  if (["compact", "normal", "wide"].indexOf(size) === -1) return;
  prototypeState.annotationEditorSize = size;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(annotationSizeStorageKey, size);
  }
  applyAnnotationEditorShellPosition();
  updateState({});
}

var carouselTimer = null;

function renderApp() {
  renderPhoneApp();
  renderAnnotationEditor();

  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }

  if (prototypeState.bottomSheetStatus === "profile_sheet") {
    if (typeof setInterval === "function") {
      carouselTimer = setInterval(advanceProfileCarousel, 2000);
    }
  }

  const annotationTargetModuleId = getAnnotationTargetModuleId();
  if (annotationTargetModuleId && (prototypeState.activeModuleId || hasPrivatePhotoInActiveChatThread())) {
    if (typeof setTimeout === "function") {
      setTimeout(() => highlightAnnotationTarget(annotationTargetModuleId), 0);
    }
  }
}

function renderCurrentPage() {
  switch (prototypeState.currentPage) {
    case "discover":
      return renderDiscoverPage();
    case "likes":
      return renderLikesPage();
    case "matches":
      return renderMatchesPage();
    case "chat":
      return renderChatPage();
    case "me":
      return renderMePage();
    case "privateAlbum":
      return renderPrivateAlbumPage();
    case "profile":
      return renderProfilePage();
    case "discoverSettings":
      return renderDiscoverSettingsPage();
    case "editProfile":
      return renderEditProfilePage();
    case "verifyIdentity":
      return renderVerifyIdentityPage();
    case "meSubPage":
      return renderMeSubPage();
    default:
      return renderDiscoverPage();
  }
}

function getCurrentUser() {
  return mockUsers[prototypeState.currentCardIndex % mockUsers.length];
}

/* ========== Safe Image Rendering ========== */

function getSafeImage(src, fallback) {
  return {
    src: src || "",
    fallback: fallback || fallbackImage.fallback
  };
}

function handleImageError(img, fallbackSrc) {
  if (!img || img.dataset.failed === "true") return;
  img.dataset.failed = "true";
  img.onerror = null;
  img.classList.add("has-image-error");
  if (fallbackSrc) {
    img.src = fallbackSrc;
  }
}

function renderSafeImage(opts) {
  var src = opts.src || "";
  var fallback = opts.fallback || fallbackImage.fallback;
  var alt = opts.alt || "";
  var cls = opts.className || "";
  var fallbackText = opts.fallbackText || "";
  var extraAttrs = opts.attrs || "";

  return '<img class="image-safe ' + cls + '"'
    + ' src="' + src + '"'
    + ' alt="' + alt + '"'
    + ' data-fallback="' + fallback + '"'
    + ' data-fallback-text="' + fallbackText + '"'
    + ' onerror="handleImageError(this,\'' + fallback + '\')"'
    + (extraAttrs ? ' ' + extraAttrs : '')
    + ' />';
}

function renderAvatarImg(user, className, alt) {
  var pool = getAvatar(user.id);
  var safe = getSafeImage(pool.src, pool.fallback);
  return renderSafeImage({
    src: safe.src,
    fallback: safe.fallback,
    alt: alt || user.name || pool.name || "",
    className: className || "",
    fallbackText: pool.initial || ""
  });
}

function getCurrentPageConfig() {
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  if (pageId === "verifyIdentity" || pageId === "meSubPage" || pageId === "privateAlbum") {
    return pageConfigs.me;
  }
  return pageConfigs[pageId] || pageConfigs[prototypeState.currentPage] || pageConfigs.discover;
}

function getPageModules(pageConfig = getCurrentPageConfig()) {
  return Object.entries(pageConfig.modules || {}).map(([id, module]) => ({ id, ...module }));
}

function hasPrivatePhotoInActiveChatThread() {
  if (prototypeState.currentPage !== "chat" || prototypeState.chatViewStatus !== "detail") return false;
  var threadId = prototypeState.activeChatThreadId;
  var messages = threadId ? (chatMessageHistory[threadId] || []) : [];
  return messages.some(function(message) {
    return message.type === "private_photo";
  });
}

function normalizeAnnotationModuleId(moduleId) {
  if (moduleId === "private_photo_message") return "chat_private_photo_unlock";
  if (moduleId === "chat_thread") return "chat_primary";
  return moduleId;
}

function getAnnotationTargetModuleId() {
  var pageConfig = getCurrentPageConfig();
  var modules = pageConfig.modules || {};
  var activeModuleId = normalizeAnnotationModuleId(prototypeState.activeModuleId);
  var activeScenario = getActiveFeatureScenario();

  if ((prototypeState.activeAnnotationPage || prototypeState.currentPage) === "chat"
    && prototypeState.chatViewStatus !== "detail"
    && modules.chat_primary) {
    return "chat_primary";
  }

  if (activeScenario) {
    var scenarioModuleId = getFeatureScenarioTargetModuleId(activeScenario, prototypeState.activeAnnotationPage || prototypeState.currentPage);
    if (scenarioModuleId && modules[scenarioModuleId]) {
      return scenarioModuleId;
    }
  }

  if (activeModuleId && modules[activeModuleId]) return activeModuleId;
  return getPageModules(pageConfig)[0] ? getPageModules(pageConfig)[0].id : null;
}

function getActiveModule() {
  const pageConfig = getCurrentPageConfig();
  const modules = getPageModules(pageConfig);
  const targetModuleId = getAnnotationTargetModuleId();
  return modules.find(module => module.id === targetModuleId) || modules[0];
}

function getModuleClass(moduleId, baseClass = "") {
  const classes = [baseClass, "annotatable-module"].filter(Boolean);

  if (getAnnotationTargetModuleId() === moduleId && prototypeState.annotationStatus === "visible") {
    classes.push("annotation-highlight", "hotspot", "active");
    const activeModule = getActiveModule();
    const stateConfig = activeModule && activeModule.states ? activeModule.states[prototypeState.activeModuleState] : null;
    const action = stateConfig ? stateConfig.action : "none";

    if (action === "hide") {
      classes.push("state-hidden");
    }

    if (action === "blur_and_lock") {
      classes.push("state-blur");
    }

    if (action === "skeleton") {
      classes.push("state-skeleton");
    }

    if (action === "empty") {
      classes.push("state-empty");
    }

    if (action === "disabled") {
      classes.push("state-disabled");
    }

    if (action === "matched") {
      classes.push("state-matched");
    }

    if (action === "unlocked") {
      classes.push("state-unlocked");
    }
  }

  return classes.join(" ");
}

function handleAnnotatedModuleClick(event, moduleId) {
  if (prototypeState.annotationMode === "select" && prototypeState.annotationPanelStatus === "expanded") {
    updateState({
      activeModuleId: moduleId,
      activeModuleState: "default"
    });
    if (typeof setTimeout === "function") {
      setTimeout(() => highlightAnnotationTarget(moduleId), 0);
    }
  }

  return true;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsString(value) {
  return JSON.stringify(String(value ?? "")).replace(/</g, "\\u003c");
}

function getAnnotationStorageKey(pageId, moduleId) {
  return `dating.annotation.${pageId}.${moduleId}`;
}

function getSavedAnnotationNotes(pageId, moduleId) {
  if (typeof localStorage === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(getAnnotationStorageKey(pageId, moduleId)) || "{}");
  } catch (error) {
    return {};
  }
}

function getModuleNotes(module) {
  const savedNotes = getSavedAnnotationNotes(prototypeState.activeAnnotationPage, module.id);
  return { ...module.notes, ...savedNotes };
}

function renderDiscoverPage() {
  const user = getCurrentUser();

  return `
    <main class="page discover-page">
      <header class="${getModuleClass("discover_primary", "top-header")}" data-module-id="discover_primary" onclick="return handleAnnotatedModuleClick(event, 'discover_primary')">
        <div>
          <h1>Discover</h1>
        </div>
        <button class="settings-entry-btn" onclick="goToPage('discoverSettings')" aria-label="Settings">
          <span class="settings-icon" aria-hidden="true">${iconSvg("settings")}</span>
        </button>
      </header>

      <section class="${getModuleClass("discover_card", "swipe-card")}" data-module-id="discover_card" data-discover-user-id="${user.id}" onclick="console.log('[click-debug] discover card clicked', '${user.id}'); if (handleAnnotatedModuleClick(event, 'discover_card')) { console.log('[route-debug] openProfileDetail called', '${user.id}'); openProfile('${user.id}'); }">
        ${renderAvatarImg(user, "", user.name)}
        <div class="card-gradient"></div>
        <button class="card-profile-btn" onclick="event.stopPropagation(); console.log('[click-debug] discover card clicked', '${user.id}'); console.log('[route-debug] openProfileDetail called', '${user.id}'); openProfile('${user.id}')" aria-label="View profile">
          ${iconSvg("chevronUp")}
        </button>
        <div class="card-info">
          <h2 class="card-title-row">${user.online ? '<span class="card-online-dot" aria-hidden="true"></span>' : ''}<span>${user.name}, ${user.age}</span>${user.verified ? '<span class="card-verified-badge" aria-label="Verified"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' : ''}</h2>
          <p>${user.city}, ${user.country} · ${user.distance}</p>
          <div class="interests">
            ${user.interests.map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>
      </section>

      <section class="${getModuleClass("discover_actions", "swipe-actions")}" data-module-id="discover_actions" onclick="return handleAnnotatedModuleClick(event, 'discover_actions')">
        <button class="swipe-btn pass-btn" onclick="swipePass()">${iconSvg("x")}</button>
        <button class="swipe-btn like-btn" onclick="swipeLike()">${iconSvg("heart")}</button>
      </section>
    </main>
  `;
}

function renderDiscoverSettingsPage() {
  var genderOptions = [
    { value: "women", label: "Women" },
    { value: "men", label: "Men" },
    { value: "everyone", label: "Everyone" }
  ];

  var ageMin = prototypeState.discoverFilterAgeMin;
  var ageMax = prototypeState.discoverFilterAgeMax;
  var distance = Math.min(Math.max(Number(prototypeState.discoverFilterDistance) || 50, 1), 1000);

  return `
    <main class="page discover-settings-page">
      <header class="settings-head">
        <button class="settings-back" onclick="goToPage('discover')">‹</button>
        <h1>Discovery Settings</h1>
        <span class="settings-head-spacer"></span>
      </header>

      <section class="discover-filter-section">
        <h3>Show me</h3>
        <div class="filter-options-row">
          ${genderOptions.map(function(opt) {
            var active = prototypeState.discoverFilterGender === opt.value ? ' active' : '';
            return '<button class="filter-option' + active + '" onclick="setDiscoverFilter(\'gender\', \'' + opt.value + '\')">' + opt.label + '</button>';
          }).join("")}
        </div>
      </section>

      <section class="discover-filter-section">
        <h3>Age Range</h3>
        <p class="filter-range-label"><span id="age-label">${ageMin} – ${ageMax}</span> years</p>
        <div class="filter-slider-group">
          <div class="filter-slider-row">
            <span class="filter-slider-tag">Min</span>
            <input type="range" min="18" max="60" value="${ageMin}" class="filter-slider"
              oninput="updateDiscoverAgeSlider('min', this.value)"
              onchange="applyDiscoverAge('min', parseInt(this.value))" />
            <span id="age-min-val" class="filter-slider-num">${ageMin}</span>
          </div>
          <div class="filter-slider-row">
            <span class="filter-slider-tag">Max</span>
            <input type="range" min="18" max="60" value="${ageMax}" class="filter-slider"
              oninput="updateDiscoverAgeSlider('max', this.value)"
              onchange="applyDiscoverAge('max', parseInt(this.value))" />
            <span id="age-max-val" class="filter-slider-num">${ageMax}</span>
          </div>
        </div>
      </section>

      <section class="discover-filter-section">
        <h3>Maximum Distance</h3>
        <p class="filter-range-label"><span id="dist-label">${distance}</span> km</p>
        <div class="filter-slider-row">
          <span class="filter-slider-tag">0 km</span>
          <input type="range" min="1" max="1000" value="${distance}" class="filter-slider"
            oninput="updateDiscoverDistSlider(this.value)"
            onchange="updateState({ discoverFilterDistance: parseInt(this.value) })" />
          <span id="dist-val" class="filter-slider-num">${distance}</span>
        </div>
      </section>

      <button class="filter-apply-btn" onclick="openFilterConfirm()">Apply Filters</button>
    </main>
  `;
}

function setDiscoverFilter(key, value) {
  var update = {};
  if (key === 'gender') update.discoverFilterGender = value;
  if (key === 'distance') update.discoverFilterDistance = value;
  updateState(update);
}

function updateDiscoverAgeSlider(which, value) {
  var el = document.getElementById('age-' + which + '-val');
  var label = document.getElementById('age-label');
  if (el) el.textContent = value;
  if (label && which === 'min') label.textContent = value + ' – ' + prototypeState.discoverFilterAgeMax;
  if (label && which === 'max') label.textContent = prototypeState.discoverFilterAgeMin + ' – ' + value;
}

function updateDiscoverDistSlider(value) {
  var el = document.getElementById('dist-val');
  var label = document.getElementById('dist-label');
  if (el) el.textContent = value;
  if (label) label.textContent = value;
}

function applyDiscoverAge(which, value) {
  if (which === 'min') {
    if (value >= prototypeState.discoverFilterAgeMax) value = prototypeState.discoverFilterAgeMax - 1;
    updateState({ discoverFilterAgeMin: value });
  } else {
    if (value <= prototypeState.discoverFilterAgeMin) value = prototypeState.discoverFilterAgeMin + 1;
    updateState({ discoverFilterAgeMax: value });
  }
}

function openFilterConfirm() {
  updateState({ bottomSheetStatus: 'filter_confirm' });
}

function applyDiscoverFilters() {
  closeSheet();
  showToast('Filters applied');
  updateState({ currentPage: 'discover' });
}

function renderLikesPage() {
  const locked = !canViewLikesMe();

  return `
    <main class="page likes-page">
      <header class="likes-head">
        <div>
          <h1>Like you</h1>
          <p>People who already showed interest</p>
        </div>
      </header>

      ${renderLikedGridPane(locked)}
    </main>
  `;
}

function renderUserRow(user, locked) {
  return `
    <div class="user-row ${locked ? "locked" : ""}" onclick="${locked ? "openSubscriptionPaywall()" : `handleLikesMeClick('${user.id}')`}">
      ${renderAvatarImg(user, "", user.name)}
      <div style="flex:1;min-width:0;">
        <h3>${locked ? "Hidden Admirer" : `${user.name}, ${user.age}`}</h3>
        <p>${locked ? "Upgrade to see who liked you" : `${user.city} · ${user.distance}`}</p>
      </div>
      <button class="secondary-btn">${locked ? "Unlock" : "View"}</button>
    </div>
  `;
}

function getLikedGridFilters() {
  var all = likedGridUsers.length;
  var active = likedGridUsers.filter(function(u) { return u.active; }).length;
  var nearby = likedGridUsers.filter(function(u) { return u.nearby; }).length;
  var isNew = likedGridUsers.filter(function(u) { return u.isNew; }).length;
  var popular = likedGridUsers.filter(function(u) { return u.popular; }).length;
  return [
    { key: "all", label: "All", count: all },
    { key: "active", label: "Active", count: active },
    { key: "nearby", label: "Nearby", count: nearby },
    { key: "new", label: "New", count: isNew },
    { key: "popular", label: "Popular", count: popular }
  ];
}

function dismissLikedUser(userId) {
  if (prototypeState.activeEntitlementKey === "free_user") {
    openSubscriptionPaywall();
    return;
  }
  handleEntitlementAction("pass", function() {
    var idx = likedGridUsers.findIndex(function(u) { return u.id === userId; });
    if (idx !== -1) {
      likedGridUsers.splice(idx, 1);
    }
    updateState({});
  });
}

function likeLikedUser(userId) {
  if (prototypeState.activeEntitlementKey === "free_user") {
    openSubscriptionPaywall();
    return;
  }
  handleEntitlementAction("like", function() {
    var idx = likedGridUsers.findIndex(function(u) { return u.id === userId; });
    if (idx !== -1) {
      likedGridUsers.splice(idx, 1);
    }
    updateState({});
  });
}

function renderLikedGridCard(user, index) {
  var unlocked = canViewLikesMe();
  var avatar = getAvatar(user.id) || { src: user.avatar, fallback: createFallbackSvg((user.name || "?")[0], "#8B5CF6", "#D946EF") };

  var cardCls = 'liked-grid-card' + (unlocked ? '' : ' locked');
  var clickHandler = unlocked ? ("handleLikesMeClick('" + user.id + "')") : "openSubscriptionPaywall()";

  var html = '<div class="' + cardCls + '">'
    + '<button class="liked-card-tap" onclick="' + clickHandler + '">'
    + renderSafeImage({ src: avatar.src || user.avatar, fallback: avatar.fallback || createFallbackSvg((user.name || "?")[0], "#8B5CF6", "#D946EF"), alt: user.name, className: "" });

  if (unlocked) {
    html += '<span class="liked-grid-time">' + (user.likedAt || "recently") + '</span>';
  } else {
    html += '<div class="liked-grid-shade"></div>'
      + '<span class="liked-grid-lock">' + iconSvg("heart") + '</span>'
      + '<span class="liked-grid-time">' + (user.likedAt || "recently") + '</span>';
  }

  html += '</button>'
    + '<div class="liked-grid-actions">'
    + '<button class="liked-act dismiss" onclick="event.stopPropagation(); dismissLikedUser(\'' + user.id + '\')">' + iconSvg("x") + '</button>'
    + '<button class="liked-act like' + (user.liked ? ' active' : '') + '" onclick="event.stopPropagation(); likeLikedUser(\'' + user.id + '\')">' + iconSvg("heart") + '</button>'
    + '</div>';

  if (user.liked) {
    html += '<div class="liked-grid-flash">Liked!</div>';
  }

  html += '</div>';
  return html;
}

function switchLikedGridFilter(filterKey) {
  if (typeof prototypeState.activeLikedFilter === "undefined") {
    prototypeState.activeLikedFilter = "all";
  }
  prototypeState.activeLikedFilter = filterKey;
  updateState({});
}

function renderLikedGridPane(locked) {
  var activeFilter = prototypeState.activeLikedFilter || "all";
  var users = likedGridUsers;
  var filters = getLikedGridFilters();

  return `
    <section class="${getModuleClass("likes_me_list", "liked-grid-section")}" data-module-id="likes_me_list" onclick="return handleAnnotatedModuleClick(event, 'likes_me_list')">
      <div class="liked-filter-row" aria-label="Liked you filters">
        ${filters.map(function(f) {
          return '<button class="' + (f.key === activeFilter ? 'active' : '') + '" onclick="switchLikedGridFilter(\'' + f.key + '\')">' + f.label + ' <span>' + f.count + '</span></button>';
        }).join("")}
      </div>
      <div class="liked-grid">
        ${users.map(function(user, i) {
          return renderLikedGridCard(user, i);
        }).join("")}
      </div>
    </section>
    ${locked ? '<div class="liked-bottom-cta"><button onclick="openSubscriptionPaywall()">See who likes you</button></div>' : ""}
  `;
}

function renderLegacyMatchesPane() {
  return `
    <section class="${getModuleClass("matches_primary", "matches-hero")}" data-module-id="matches_primary" onclick="return handleAnnotatedModuleClick(event, 'matches_primary')">
      <div class="match-hero-icon">${iconSvg("heart")}</div>
      <div>
        <h2>${legacyMatchUsers.length} active matches</h2>
        <p>Start a chat while they are online and keep the momentum fresh.</p>
      </div>
    </section>
    <section class="matches-list">
      ${legacyMatchUsers.map(user => `
        <button class="${getModuleClass("matches_chat_entry", "match-row")}" data-module-id="matches_chat_entry" onclick="if (handleAnnotatedModuleClick(event, 'matches_chat_entry')) openChat('${user.id}')">
          <span class="match-avatar" style="background-image:url('${user.avatar}')">${user.initial}</span>
          <span>
            <strong>${user.name}, ${user.age}</strong>
            <em>${user.status}</em>
          </span>
          <b>${user.action}</b>
        </button>
      `).join("")}
    </section>
  `;
}

function renderMatchesPage() {
  return `
    <main class="page matches-page">
      <header class="top-header">
        <h1>Matches</h1>
      </header>

      <section class="${getModuleClass("matches_primary", "matches-list")}" data-module-id="matches_primary" onclick="return handleAnnotatedModuleClick(event, 'matches_primary')">
        ${matchUsers.map(user => `
        <div class="match-card">
          ${renderAvatarImg(user, "", user.name)}
          <div style="flex:1;">
            <h3>${user.name}, ${user.age}</h3>
            <p class="sub-text">${user.prompt}</p>
          </div>
          <button class="${getModuleClass("matches_chat_entry", "primary-btn")}" data-module-id="matches_chat_entry" onclick="if (handleAnnotatedModuleClick(event, 'matches_chat_entry')) goToPage('chat')">Chat</button>
        </div>
        `).join("")}
      </section>
    </main>
  `;
}

function renderChatPage() {
  if (prototypeState.chatViewStatus === "detail") {
    return renderChatDetailPage();
  }

  return `
    <main class="page chat-page chat-inbox-page">
      <header class="chat-status-bar" aria-label="Phone status">
        <span>16:18</span>
        <div>
          <span class="status-bars"></span>
          <span class="status-wifi"></span>
          <span class="status-battery">84</span>
        </div>
      </header>

      <section class="${getModuleClass("chat_primary", "chat-list")}" data-module-id="chat_primary" onclick="return handleAnnotatedModuleClick(event, 'chat_primary')">
        <div class="chat-title-row">
          <h1>Chat</h1>
          <div class="chat-tools" aria-label="Chat tools">
            <button onclick="showMeHint('Boost preview')" aria-label="Boost"><span class="tool-gauge"></span></button>
            <button onclick="showMeHint('Notifications')" aria-label="Notifications"><span class="tool-bell"></span></button>
            <button onclick="showMeHint('Search')" aria-label="Search"><span class="tool-search"></span></button>
          </div>
        </div>

        <h2 class="chat-subtitle">Swipe right on people you like</h2>

        <div class="chat-match-strip" aria-label="People you like">
          <button class="chat-match-story liked-summary" onclick="openSubscriptionPaywall()">
            <span class="match-story-avatar blurred-grid">
              ${renderAvatarImg(likesMeUsers[0], "", "")}
              ${renderAvatarImg(likesMeUsers[1], "", "")}
            </span>
            <b>You like</b>
            <em>13</em>
          </button>
          ${legacyChatThreads.slice(0, 4).map(thread => `
            <button class="chat-match-story" onclick="openSubscriptionPaywall()">
              <span class="match-story-avatar story-blurred ${thread.locked ? "empty" : ""}" style="${thread.locked ? "" : `background-image:url('${thread.avatar}')`}"></span>
              <b>${thread.locked ? "Locked" : thread.name}</b>
            </button>
          `).join("")}
        </div>

        <div class="chat-section-head">
          <h2>Messages</h2>
          <button onclick="openChatSortSheet()"><span class="sort-icon"></span> Sort</button>
        </div>

        <button class="chat-like-card" onclick="goToPage('likes')">
          <span class="like-collage">
            ${likesMeUsers.concat(mockUsers).slice(0, 4).map(function(user) { return renderAvatarImg(user, "", ""); }).join("")}
          </span>
          <span>Want to see the 13 women who liked you?</span>
        </button>

        ${legacyChatThreads.map((thread, index) => `
          <button class="${getModuleClass(thread.locked ? "chat_paid_message" : "chat_primary", `chat-message-row ${thread.locked ? "locked-row" : ""}`)}" data-module-id="${thread.locked ? "chat_paid_message" : "chat_primary"}" data-chat-thread-id="${thread.id}" onclick="${thread.locked ? "if (handleAnnotatedModuleClick(event, 'chat_paid_message')) openChatPaywall()" : `console.log('[click-debug] chat thread clicked', '${thread.id}'); if (handleAnnotatedModuleClick(event, 'chat_primary')) { console.log('[route-debug] openChatThread called', '${thread.id}'); openChatThread('${thread.id}'); }`}">
            <span class="chat-message-avatar ${index === 2 ? "brand-avatar" : ""}" style="${index === 2 ? "" : `background-image:url('${thread.avatar}')`}">
              ${index === 2 ? "DATING" : ""}
              ${thread.online ? `<i class="online-dot"></i>` : ""}
            </span>
            <span class="chat-message-meta">
              <b>${index === 2 ? "Dating Team" : `${thread.name}${index === 0 ? " · online" : ""}`}</b>
              <span>${index === 2 ? "Welcome. Here, everyone wants to meet someone real..." : thread.lastMessage}</span>
            </span>
            <span class="chat-message-side">
              ${index < 3 ? `<span class="star-btn" onclick="event.stopPropagation(); showMeHint('Favorite')">${iconSvg("star")}</span>` : `<span class="chat-time">${thread.time}</span>`}
              ${thread.unreadCount ? `<span class="unread-badge">${thread.unreadCount}</span>` : ""}
            </span>
          </button>
        `).join("")}
      </section>
    </main>
  `;
}

function renderEmojiPanel() {
  var grid = emojiList.map(function(emoji, idx) {
    return '<button class="emoji-btn" onclick="insertEmojiByIndex(' + idx + ')" title="Send ' + emoji + '">' + emoji + '</button>';
  }).join("");
  return '<div class="emoji-panel">'
    + '<div class="emoji-panel-header"><span>Tap an emoji to send</span><button class="emoji-panel-close" onclick="toggleEmojiPanel()">\u00D7</button></div>'
    + '<div class="emoji-grid">' + grid + '</div>'
    + '</div>';
}

function insertEmojiByIndex(idx) {
  var emoji = emojiList[idx];
  if (emoji) sendEmojiDirect(emoji);
}

function sendEmojiAsText() {
  var input = document.querySelector(".composer-input");
  var text = input ? input.value.trim() : "";
  if (!text) return;
  sendChatMessage();
}

function findPrivatePhotoMessage(messageId) {
  for (var threadId in chatMessageHistory) {
    if (!chatMessageHistory.hasOwnProperty(threadId)) continue;
    var message = chatMessageHistory[threadId].find(function(item) {
      return item.id === messageId && (item.type === "private_photo" || item.type === "private_video");
    });
    if (message) return message;
  }
  return null;
}

function getActivePrivatePhotoMessage() {
  if (prototypeState.activePrivatePhotoMessageId) {
    var activeMessage = findPrivatePhotoMessage(prototypeState.activePrivatePhotoMessageId);
    if (activeMessage) return activeMessage;
  }

  var threadId = prototypeState.activeChatThreadId;
  var messages = threadId ? (chatMessageHistory[threadId] || []) : [];
  return messages.find(function(item) {
    return item.type === "private_photo" || item.type === "private_video";
  }) || null;
}

function getPrivatePhotoStateSync(moduleId, stateKey) {
  if (moduleId !== "chat_private_photo_unlock") return {};
  var message = getActivePrivatePhotoMessage();
  if (!message) return {};

  var photoIds = message.photoIds || [];
  var unlocked = (prototypeState.unlockedPhotoIds || []).slice();
  var shouldUnlock = stateKey === "unlocked";
  var shouldLock = stateKey === "locked" || stateKey === "insufficient_balance" || stateKey === "default";

  if (shouldUnlock) {
    photoIds.forEach(function(photoId) {
      if (unlocked.indexOf(photoId) < 0) unlocked.push(photoId);
    });
    message.status = "unlocked_countdown";
  }

  if (shouldLock) {
    unlocked = unlocked.filter(function(photoId) {
      return photoIds.indexOf(photoId) === -1;
    });
    message.status = "locked";
  }

  return {
    activePrivatePhotoMessageId: message.id,
    activePrivateContentType: getPrivateContentType(message),
    privateContentStatus: shouldUnlock ? "unlocked_countdown" : (stateKey === "insufficient_balance" ? "sent_locked" : "sent_locked"),
    unlockedPhotoIds: unlocked,
    photoUnlockStatus: stateKey === "unlocked" ? "unlocked" : (stateKey === "insufficient_balance" ? "insufficient_balance" : "locked"),
    bottomSheetStatus: "none",
    paywallStatus: "none",
    activePhotoUnlockSheet: {
      visible: false,
      messageId: message.id,
      unlockMode: null
    }
  };
}

function isPrivatePhotoMessageUnlocked(message) {
  if (!message) return false;
  if (message.status === "unlocked_countdown" || message.status === "unlocked") return true;
  if (message.status === "destroyed") return false;
  var unlocked = prototypeState.unlockedPhotoIds || [];
  var unlockIds = (message.photoIds || []).concat(message.contentId ? [message.contentId] : []);
  return unlockIds.some(function(photoId) {
    return unlocked.indexOf(photoId) >= 0;
  });
}

function isPrivateContentAlreadySent(message) {
  if (!message) return false;
  var sentIds = prototypeState.sentPrivateContentIds || [];
  return sentIds.indexOf(message.contentId || message.id) >= 0;
}

function renderPrivatePhotoMessage(message) {
  var photoIds = message.photoIds || [];
  var firstPhotoId = photoIds[0];
  var photo = getPhoto(firstPhotoId) || {};
  var contentType = getPrivateContentType(message);
  var unlocked = isPrivatePhotoMessageUnlocked(message);
  var destroyed = message.status === "destroyed";
  var messageId = escapeHtml(message.id);
  var defaultTitle = contentType === "private_video" ? "Private video" : "Private photo";
  var title = destroyed ? "Content destroyed" : (unlocked ? (contentType === "private_video" ? "Private video unlocked" : "Private photo unlocked") : (message.copy && message.copy.lockedTitle ? message.copy.lockedTitle : defaultTitle));
  var desc = destroyed ? "This private content is no longer available." : (unlocked ? "Available for " + (prototypeState.privateContentCountdownLabel || "10:00") + "." : (message.copy && message.copy.lockedDesc ? message.copy.lockedDesc : "Unlock to view her private content."));
  var price = message.priceCoins || 0;
  var bundlePrice = message.bundlePriceCoins || price;
  var bundleCount = message.bundleCount || photoIds.length || 1;
  var singleCta = message.copy && message.copy.singleCta ? message.copy.singleCta : (contentType === "private_video" ? "Unlock video" : "Unlock 1 photo");
  var bundleCta = "Unlock bundle";
  var stateClass = destroyed ? "destroyed" : (unlocked ? "unlocked" : "locked");

  return '<div role="button" tabindex="0" class="' + getModuleClass("chat_private_photo_unlock", "message-bubble incoming private-photo-message " + stateClass) + '" '
    + 'data-module-id="chat_private_photo_unlock" onclick="handlePrivatePhotoClick(\'' + messageId + '\')">'
    + '<span class="private-photo-preview">'
    + renderSafeImage({ src: message.previewImage || photo.src, fallback: photo.fallback, alt: "private photo preview", className: "private-photo-img" })
    + (contentType === "private_video" ? '<span class="private-content-type-badge">Video</span>' : "")
    + (destroyed ? '<span class="private-photo-overlay destroyed"><span class="private-content-destroyed">Destroyed</span></span>' : (!unlocked ? '<span class="private-photo-overlay"><span class="private-photo-lock">' + iconSvg("lock") + '</span></span>' : '<span class="private-content-countdown">' + escapeHtml(prototypeState.privateContentCountdownLabel || "10:00") + '</span>'))
    + '</span>'
    + '<span class="private-photo-copy">'
    + '<strong>' + title + '</strong>'
    + '<span>' + desc + '</span>'
    + (!unlocked && !destroyed ? '<span class="private-photo-prices"><b>' + price + ' coins</b><b>' + bundleCount + (contentType === "private_video" ? ' item' : ' photos') + ' · ' + bundlePrice + ' coins</b></span>' : "")
    + (!unlocked && !destroyed ? '<span class="private-photo-actions"><button type="button" class="private-photo-action-btn" onclick="event.stopPropagation(); openPhotoUnlockSheet(\'' + messageId + '\')">' + singleCta + '</button><button type="button" class="private-photo-action-btn" onclick="event.stopPropagation(); openPhotoUnlockSheet(\'' + messageId + '\')">' + bundleCta + '</button></span>' : "")
    + '</span>'
    + '</div>';
}

function renderSentPrivateMediaMessage(message) {
  var mediaType = message.mediaType === "video" ? "video" : "photo";
  var title = message.title || (mediaType === "video" ? "Private video" : "Private photo");
  var preview = "";

  if (mediaType === "photo" && message.image) {
    preview = renderSafeImage({
      src: message.image,
      fallback: message.fallback || fallbackImage.fallback,
      alt: title,
      className: "sent-media-img"
    });
  } else {
    preview = '<span class="sent-media-placeholder">' + (mediaType === "video" ? "Video" : "Photo") + '</span>';
  }

  return '<div class="message-bubble outgoing sent-media-message">'
    + '<span class="sent-media-preview">' + preview + '</span>'
    + '<span class="sent-media-caption">' + escapeHtml(title) + '</span>'
    + '<span class="msg-time">' + escapeHtml(message.time || "") + '</span>'
    + '</div>';
}

function renderSentPrivateContentGroupMessage(message) {
  var status = message.status || "sent_unopened";
  var destroyed = status === "destroyed";
  var opened = status === "opened_countdown";
  var statusText = destroyed ? "Content destroyed" : (opened ? "Available for 10 minutes" : "Tap to view");
  var countText = formatPrivateContentGroupCount(message.photosCount || 0, message.videosCount || 0);
  var videoIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="12" rx="3"/><path d="m17 10 4-3v10l-4-3"/></svg>';
  var clickAttr = destroyed ? "" : ' onclick="handlePrivateContentGroupClick(\'' + escapeHtml(message.id) + '\')"';
  var mediaItems = normalizePrivateContentMediaItems(message.mediaItems || []);
  var isMyPhotoGroup = mediaItems.length > 0 && mediaItems.every(function(item) {
    return item.source === "my_photo";
  });
  var tiles = [];

  mediaItems.forEach(function(item) {
    var isVideo = item.mediaType === "video";
    tiles.push(renderSentPrivateMediaTile({
      type: isVideo ? "video" : "photo",
      item: item,
      icon: isVideo ? videoIcon : iconSvg("image"),
      label: isVideo ? "Private<br>Video" : "Private<br>Photo",
      revealed: opened
    }));
  });

  var coverContent = destroyed
    ? '<span class="sent-private-destroyed-state"><span class="sent-private-destroyed-icon">⌛</span><strong>Content destroyed</strong><small>This private content is no longer available</small></span>'
    : '<span class="sent-private-group-title">Private Profile</span>'
      + '<span class="sent-private-media-row ' + (tiles.length === 1 ? "single" : "") + '">' + tiles.join("") + '</span>'
      + '<span class="sent-private-group-count">' + escapeHtml(countText) + '</span>'
      + (opened ? '<span class="sent-private-group-countdown">10:00</span>' : "");

  return '<div role="button" tabindex="0" class="' + getModuleClass("chat_private_photo_unlock", "message-bubble outgoing sent-private-group-message " + status + (isMyPhotoGroup ? " my-photo-group" : "")) + '" data-module-id="chat_private_photo_unlock"' + clickAttr + '>'
    + '<span class="sent-private-group-cover">'
    + coverContent
    + '</span>'
    + '<span class="sent-private-group-copy">'
    + '<strong>Private content</strong>'
    + '<span>' + escapeHtml(countText) + '</span>'
    + '<small>' + escapeHtml(statusText) + '</small>'
    + '</span>'
    + '<span class="msg-time">' + escapeHtml(message.time || "") + '</span>'
    + '</div>';
}

function renderSentPrivateMediaTile(options) {
  var item = normalizePrivateContentMediaItem(options.item || {}, options.item && options.item.source);
  var previewUrl = options.revealed ? (item.fullUrl || item.thumbUrl || item.src) : (item.thumbUrl || item.src || item.fullUrl);
  var mediaStyle = previewUrl ? ' style="background-image:url(\'' + escapeHtml(previewUrl) + '\')"' : "";
  var revealed = !!options.revealed;
  return '<span class="sent-private-media-tile ' + escapeHtml(options.type) + ' ' + escapeHtml(item.source || "") + (revealed ? " clear" : "") + '"' + mediaStyle + '>'
    + (revealed ? "" : '<span class="sent-private-media-scrim"></span>')
    + (options.countLabel ? '<span class="sent-private-media-count">' + escapeHtml(options.countLabel) + '</span>' : "")
    + (revealed && options.type === "video" ? '<span class="sent-private-video-badge">Video</span>' : "")
    + (revealed ? "" : '<span class="sent-private-media-icon">' + options.icon + '</span><strong>' + options.label + '</strong>')
    + '</span>';
}

function formatPrivateContentGroupCount(photosCount, videosCount) {
  var parts = [];
  if (photosCount > 0) parts.push(photosCount + " " + (photosCount === 1 ? "photo" : "photos"));
  if (videosCount > 0) parts.push(videosCount + " " + (videosCount === 1 ? "video" : "videos"));
  return parts.length ? parts.join(" · ") : "0 photos";
}

function renderChatDetailPage() {
  console.log("[render-debug] renderChatThread", prototypeState.activeChatThreadId);
  const thread = legacyChatThreads.find(item => item.id === prototypeState.activeChatThreadId) || legacyChatThreads[0];
  var messages = chatMessageHistory[thread.id] || [];

  function renderMessage(msg) {
    if (msg.type === "divider") {
      return '<div class="chat-divider"><span>' + msg.label + '</span></div>';
    }

    if (msg.type === "locked") {
      return '<button class="' + getModuleClass("chat_paid_message", "private-message-card") + '" data-module-id="chat_paid_message" onclick="if (handleAnnotatedModuleClick(event, \'chat_paid_message\')) openChatPaywall()">'
        + '<strong>' + msg.title + '</strong>'
        + '<span>' + msg.text + '</span>'
        + '<b>Unlock HD</b>'
        + '</button>';
    }

    if (msg.type === "private_photo" || msg.type === "private_video") {
      return renderPrivatePhotoMessage(msg);
    }

    if (msg.type === "sent_private_group") {
      return renderSentPrivateContentGroupMessage(msg);
    }

    if (msg.type === "sent_private_media") {
      return renderSentPrivateMediaMessage(msg);
    }

    if (msg.image) {
      return '<div class="message-bubble ' + msg.type + ' msg-photo-bubble">'
        + '<img class="msg-photo" src="' + msg.image + '" alt="sent photo" loading="lazy" />'
        + '<span class="msg-time">' + msg.time + '</span>'
        + '</div>';
    }

    if (msg.audio) {
      return '<div class="message-bubble ' + msg.type + '">'
        + '<span class="msg-audio">'
        + '<span class="msg-audio-icon">▶</span>'
        + '<span class="msg-audio-track"></span>'
        + '<span class="msg-audio-dur">' + msg.duration + '</span>'
        + '</span>'
        + '<span class="msg-time">' + msg.time + '</span>'
        + '</div>';
    }

    if (msg.gift) {
      return '<div class="message-bubble outgoing gift-message-bubble">'
        + '<span class="gift-message-icon">' + escapeHtml(msg.gift.icon) + '</span>'
        + '<span class="gift-message-copy"><strong>' + escapeHtml(msg.gift.name) + '</strong><small>Gift sent</small></span>'
        + '<span class="msg-time">' + escapeHtml(msg.time) + '</span>'
        + '</div>';
    }

    return '<div class="message-bubble ' + msg.type + '">'
      + '<span class="msg-text">' + msg.text + '</span>'
      + '<span class="msg-time">' + msg.time + '</span>'
      + '</div>';
  }

  return `
    <main class="page chat-detail-page chat-thread-page">
      <header class="chat-detail-head">
        <button class="chat-detail-back" onclick="closeChat()">‹</button>
        <span class="chat-detail-avatar" style="background-image:url('${thread.avatar}')">${thread.initial}</span>
        <div class="chat-detail-user">
          <h1>${thread.name}, ${thread.age}</h1>
          <p>${thread.online ? "Online now" : "Recently active"}</p>
        </div>
        <button class="chat-detail-call" onclick="event.stopPropagation(); openAudioCall()" aria-label="Call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.3A19.5 19.5 0 0 1 5 12.2 19.8 19.8 0 0 1 1.7 3.6 2 2 0 0 1 3.7 1.6h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L7.5 9.8a16 16 0 0 0 6.7 6.7l1.4-1.4a2 2 0 0 1 2.1-.5c1 .3 2 .6 3 .7a2 2 0 0 1 1.7 2v.1z"/></svg>
        </button>
      </header>

      <section class="${getModuleClass("chat_primary", "chat-messages")}" data-module-id="chat_primary" onclick="return handleAnnotatedModuleClick(event, 'chat_primary')">
        ${messages.map(function(msg) { return renderMessage(msg); }).join("")}
      </section>

      ${prototypeState.chatEmojiPanelOpen ? renderEmojiPanel() : ""}
      <div class="chat-composer">
        <button class="composer-attach" onclick="openPhotoPicker()" aria-label="Photo">
          ${iconSvg("image")}
        </button>
        <div class="composer-input-wrap">
          <input class="composer-input" placeholder="Type a message..." aria-label="Chat message" onkeydown="if(event.key==='Enter')sendChatMessage()" />
          <button class="composer-send" onclick="sendChatMessage()" aria-label="Send">
            ${iconSvg("send")}
          </button>
        </div>
        <button class="composer-emoji" onclick="toggleEmojiPanel()" aria-label="Emoji">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </button>
        <button class="composer-gift" onclick="openGiftPanel()" aria-label="Gift">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 1 1 2.2-3.7C10.8 5 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 1 0-2.2-3.7C13.2 5 12 7 12 7z"/></svg>
        </button>
      </div>
    </main>
  `;
}

function renderProfilePage() {
  console.log("[render-debug] renderProfileDetail", prototypeState.currentCardIndex);
  const user = getCurrentUser();
  return `
    <main class="page profile-page">
      <header class="top-header">
        <button class="secondary-btn" onclick="goToPage('discover')">Back</button>
        <button class="primary-btn" onclick="openGiftPanel()">Gift</button>
      </header>

      <section class="${getModuleClass("profile_primary", "profile-hero")}" data-module-id="profile_primary" onclick="return handleAnnotatedModuleClick(event, 'profile_primary')">
        ${renderAvatarImg(user, "", user.name)}
        <h1>${user.name}, ${user.age}</h1>
        <p class="sub-text">${user.city}, ${user.country} · ${user.distance}</p>
        <p>${user.bio}</p>
      </section>

      <section class="${getModuleClass("profile_photos", "profile-basic-info")}" data-module-id="profile_photos" onclick="return handleAnnotatedModuleClick(event, 'profile_photos')">
        <h2>Basic Info</h2>
        <div class="profile-info-block">
          <span class="profile-info-label">Interests</span>
          <div class="profile-info-chips">
            ${user.interests.map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>
        <div class="profile-info-block">
          <span class="profile-info-label">Hobbies</span>
          <div class="profile-info-chips">
            ${(user.lifestyle || "Coffee · Travel · Music").split(" · ").slice(0, 4).map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>
        <div class="profile-info-block">
          <span class="profile-info-label">Personal Details</span>
          <div class="profile-detail-grid">
            <span>Age <strong>${user.age}</strong></span>
            <span>City <strong>${user.city}</strong></span>
            <span>Distance <strong>${user.distance}</strong></span>
            <span>Status <strong>${user.online ? "Online" : "Recently active"}</strong></span>
          </div>
        </div>
      </section>

      <div style="display:flex;gap:10px;margin-top:18px;">
        <button class="primary-btn" style="flex:1;" onclick="startChatWithMatchedUser('${user.id}')">Start Chat</button>
        <button class="secondary-btn" style="flex:1;" onclick="openGiftPanel()">Send Gift</button>
      </div>
    </main>
  `;
}

function renderVerifyIdentityPage() {
  return `
    <main class="page verify-identity-page">
      <header class="settings-head verify-identity-head">
        <button class="settings-back" onclick="goToPage('me')">‹</button>
        <h1>Verify Identity</h1>
        <span class="settings-head-spacer"></span>
      </header>

      <section class="verify-identity-card">
        <div class="verify-avatar-wrap">
          ${renderSafeImage({ src: getAvatar('me').src, fallback: getAvatar('me').fallback, alt: "Rui profile avatar", className: "verify-avatar" })}
          <span class="verify-shield-badge">${iconSvg('shield')}</span>
        </div>
        <h2>Face Verification</h2>
        <p>Confirm that your profile photo matches you. Verified profiles receive more trust in matches and chat.</p>
      </section>

      <section class="verify-steps">
        <div class="verify-step">
          <strong>1</strong>
          <span>Use a clear front-facing photo</span>
        </div>
        <div class="verify-step">
          <strong>2</strong>
          <span>Keep your face inside the frame</span>
        </div>
        <div class="verify-step">
          <strong>3</strong>
          <span>Submit for quick review</span>
        </div>
      </section>

      <div class="verify-actions">
        <button class="primary-btn" onclick="showToast('Verification submitted')">Start verification</button>
        <button class="secondary-btn" onclick="goToPage('me')">Maybe later</button>
      </div>
    </main>
  `;
}

function isSubscriberUser() {
  return prototypeState.activeEntitlementKey === "subscriber" || prototypeState.subscriptionStatus === "active";
}

function getMessageSendRemainingLabel() {
  if (isSubscriberUser()) return "∞";
  var used = prototypeState.usageCounters ? (prototypeState.usageCounters.message_send || 0) : 0;
  return String(Math.max(0, 3 - used));
}

function getPrivateAlbumCounts() {
  if (prototypeState.privateAlbumStatus === "empty") {
    return { photos: 0, videos: 0 };
  }

  return {
    photos: Number(prototypeState.privatePhotoCount) || 0,
    videos: Number(prototypeState.privateVideoCount) || 0
  };
}

function getRawPrivateAlbumCounts() {
  return {
    photos: Number(prototypeState.privatePhotoCount) || 0,
    videos: Number(prototypeState.privateVideoCount) || 0
  };
}

function applyPrivateAlbumStatus(status) {
  if (status === "empty") {
    updateState({
      privateAlbumStatus: "empty",
      privatePhotoCount: 0,
      privateVideoCount: 0
    });
    return;
  }

  var counts = getRawPrivateAlbumCounts();
  updateState({
    privateAlbumStatus: "uploaded",
    privatePhotoCount: counts.photos + counts.videos > 0 ? counts.photos : 1,
    privateVideoCount: counts.videos
  });
}

function renderMeStat(label, value) {
  return '<button class="me-stat-card" onclick="openSubscriptionPaywall()">'
    + '<strong>' + escapeHtml(String(value)) + '</strong>'
    + '<span>' + escapeHtml(label) + '</span>'
    + '<em>get more</em>'
    + '</button>';
}

function copyMeUserId(event) {
  if (event && typeof event.stopPropagation === "function") event.stopPropagation();
  var userId = "888666";
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(userId).then(function() {
      showToast("ID copied");
    }).catch(function() {
      showToast("ID: " + userId);
    });
    return;
  }
  showToast("ID: " + userId);
}

function renderMePage() {
  var counts = getPrivateAlbumCounts();
  var messageRemainingLabel = getMessageSendRemainingLabel();

  return `
    <main class="page settings-page me-page-v2">
      <header class="settings-head me-main-head">
        <button class="settings-back" onclick="goToPage('discover')" aria-label="Back">‹</button>
        <h1>Me</h1>
        <button class="me-private-album-entry" data-me-action="privateAlbum" onclick="console.log('[click-debug] me item clicked', 'privateAlbum'); openPrivateAlbum()">Private Album</button>
      </header>

      <section class="me-profile-hero" data-me-action="profile">
        ${renderSafeImage({ src: getAvatar('me').src, fallback: getAvatar('me').fallback, alt: "Rui profile avatar", className: "me-hero-avatar" })}
        <div class="me-hero-copy">
          <h2>rui</h2>
          <button class="me-id-row" onclick="copyMeUserId(event)" aria-label="Copy user ID"><span>ID: 888666</span><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></i></button>
        </div>
        <button class="settings-edit-btn" onclick="goToPage('editProfile')" aria-label="Edit profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
        </button>
      </section>

      <section class="me-stats-row">
        ${renderMeStat("Private Videos", counts.videos)}
        ${renderMeStat("Private Photos", counts.photos)}
        ${renderMeStat("Messages", messageRemainingLabel)}
      </section>

      <button class="me-premium-benefit-card" data-me-action="subscribe" onclick="console.log('[click-debug] me item clicked', 'subscribe'); openSubscriptionPaywall()">
        <div class="me-premium-title">
          <span>Premium</span>
        </div>
        <div class="me-premium-benefits" aria-label="Premium benefits">
          <span>${iconSvg('heart')} See who likes you</span>
          <span>${iconSvg('send')} Unlimited messages</span>
          <span>${iconSvg('star')} Priority exposure</span>
          <span>${iconSvg('filter')} Advanced filters</span>
          <span>${iconSvg('shield')} More privacy</span>
          <span>${iconSvg('check')} Verified badge</span>
        </div>
        <b>${isSubscriberUser() ? "Manage Plan" : "Subscribe"}</b>
      </button>

      <section class="settings-menu me-settings-list">
        <button class="settings-verify-entry me-inline-entry" data-me-action="verify" onclick="console.log('[click-debug] me item clicked', 'verify'); openVerifyIntro()">
          <span class="settings-verify-icon">${iconSvg('shield')}</span>
          <span>
            <strong>Verify Identity</strong>
            <em>Build trust and get more attention</em>
          </span>
          <span class="settings-menu-arrow">${iconSvg('chevronRight')}</span>
        </button>

        <button class="${getModuleClass('me_balance', 'settings-menu-item')}" data-module-id="me_balance" data-me-action="coins" onclick="console.log('[click-debug] me item clicked', 'coins'); if (handleAnnotatedModuleClick(event, 'me_balance')) openCoinRecharge()">
          <span class="settings-menu-icon settings-coin-icon"></span>
          <span class="settings-menu-label">Coins</span>
          <span class="settings-menu-value">${prototypeState.coinBalance} coins</span>
          <span class="settings-menu-arrow">${iconSvg('chevronRight')}</span>
        </button>

        ${settingsMenuItems.map(function(item) {
          return '<button class="settings-menu-item" data-me-action="' + item.id + '" onclick="console.log(\'[click-debug] me item clicked\', \'' + item.id + '\'); console.log(\'[route-debug] openMeSubPage called\', \'' + item.id + '\'); openMeSubPage(\'' + item.id + '\')">'
            + '<span class="settings-menu-icon">' + iconSvg(item.icon) + '</span>'
            + '<span class="settings-menu-label">' + item.label + '</span>'
            + '<span class="settings-menu-arrow">' + iconSvg('chevronRight') + '</span>'
            + '</button>';
        }).join("")}
      </section>
    </main>
  `;
}

function openPrivateAlbum() {
  updateState({
    currentPage: "privateAlbum",
    bottomSheetStatus: "none",
    modalStatus: "none"
  });
}

function uploadPrivatePhoto() {
  updateState({
    privateAlbumStatus: "uploaded",
    privatePhotoCount: (Number(prototypeState.privatePhotoCount) || 0) + 1
  });
  showToast("已上传私密照片");
}

function uploadPrivateVideo() {
  updateState({
    privateAlbumStatus: "uploaded",
    privateVideoCount: (Number(prototypeState.privateVideoCount) || 0) + 1
  });
  showToast("已上传私密视频");
}

function uploadPrivateContent() {
  uploadPrivatePhoto();
}

function renderPrivateAlbumPage() {
  var counts = getPrivateAlbumCounts();
  var isEmpty = prototypeState.privateAlbumStatus === "empty";
  var cards = [];

  if (!isEmpty) {
    var albumPhotoAsset = getAvatar("me");
    for (var i = 0; i < counts.photos; i += 1) {
      cards.push('<div class="private-album-card">'
        + renderSafeImage({ src: albumPhotoAsset.src, fallback: albumPhotoAsset.fallback, alt: "private photo " + (i + 1), className: "private-album-card-img" })
        + '<span>Photo</span><strong>私密照片 ' + (i + 1) + '</strong></div>');
    }
    for (var j = 0; j < counts.videos; j += 1) {
      cards.push('<div class="private-album-card video">'
        + renderSafeImage({ src: albumPhotoAsset.src, fallback: albumPhotoAsset.fallback, alt: "private video " + (j + 1), className: "private-album-card-img" })
        + '<span>Video</span><strong>私密视频 ' + (j + 1) + '</strong></div>');
    }
  }

  return `
    <main class="page settings-page private-album-page">
      <header class="settings-head">
        <button class="settings-back" onclick="goToPage('me')" aria-label="Back">‹</button>
        <h1>Private Album</h1>
        <span class="settings-head-spacer"></span>
      </header>

      <section class="private-album-summary">
        <h2>Your paid content</h2>
        <p>Simulate private content uploads for prototype review.</p>
        <div class="private-album-counts">
          <span><strong>${counts.photos}</strong><em>Private Photos</em></span>
          <span><strong>${counts.videos}</strong><em>Private Videos</em></span>
        </div>
      </section>

      ${isEmpty ? `
        <section class="private-album-empty-state">
          <h2>暂无私密内容</h2>
          <p>上传私密照片或视频后，会在这里展示。</p>
        </section>
      ` : `
        <section class="private-album-list">
          ${cards.join("")}
        </section>
      `}

      <section class="private-album-actions">
        <button class="primary-btn" onclick="uploadPrivateContent()">上传私密内容</button>
      </section>
    </main>
  `;
}

function getMeSubPageConfig(key) {
  var configs = {
    account: {
      title: "Account",
      subtitle: "Manage sign-in, security, and account status.",
      rows: ["Email and phone", "Password", "Blocked users", "Delete account"]
    },
    notifications: {
      title: "Notifications",
      subtitle: "Choose which dating updates you want to receive.",
      rows: ["New likes", "New matches", "Messages", "Promotions"]
    },
    privacy: {
      title: "Privacy & Safety",
      subtitle: "Control profile visibility and safety settings.",
      rows: ["Who can see me", "Online status", "Photo privacy", "Report and safety tools"]
    },
    help: {
      title: "Help & Support",
      subtitle: "Get help with your account and purchases.",
      rows: ["Contact support", "Payment help", "Safety center", "FAQ"]
    },
    about: {
      title: "About",
      subtitle: "Dating prototype app information.",
      rows: ["Version 0.1", "Terms", "Privacy policy"]
    },
    logout: {
      title: "Log Out",
      subtitle: "Preview only. No account session will be changed.",
      rows: ["Log out preview"]
    }
  };
  return configs[key] || configs.account;
}

function openMeSubPage(key) {
  console.log("[route-debug] openMeSubPage called", key);
  updateState({
    currentPage: "meSubPage",
    activeMeSubPage: key || "account",
    bottomSheetStatus: "none",
    modalStatus: "none"
  });
}

function renderMeSubPage() {
  console.log("[render-debug] renderMeSubPage", prototypeState.activeMeSubPage);
  var key = prototypeState.activeMeSubPage || "account";
  var config = getMeSubPageConfig(key);

  return `
    <main class="page settings-page me-subpage">
      <header class="settings-head">
        <button class="settings-back" onclick="goToPage('me')">‹</button>
        <h1>${escapeHtml(config.title)}</h1>
        <span class="settings-head-spacer"></span>
      </header>

      <section class="me-subpage-card">
        <h2>${escapeHtml(config.title)}</h2>
        <p>${escapeHtml(config.subtitle)}</p>
      </section>

      <section class="settings-menu">
        ${config.rows.map(function(row) {
          return '<button class="settings-menu-item" onclick="showMeHint(' + jsString(row) + ')">'
            + '<span class="settings-menu-icon">' + iconSvg(key === "notifications" ? "bell" : key === "privacy" ? "lock" : "shield") + '</span>'
            + '<span class="settings-menu-label">' + escapeHtml(row) + '</span>'
            + '<span class="settings-menu-arrow">' + iconSvg('chevronRight') + '</span>'
            + '</button>';
        }).join("")}
      </section>
    </main>
  `;
}

function getEditProfileDraft() {
  return Object.assign({}, editProfileDefaults.fields, prototypeState.editProfileDraft || {});
}

function getEditProfilePhotos() {
  var defaultPhotos = [getAvatar('me').src];
  var photos = prototypeState.editProfilePhotos || defaultPhotos;
  return photos.slice(0, 9);
}

function renderEditProfileInput(key, label, value, placeholder) {
  return '<label class="edit-profile-field">'
    + '<span>' + escapeHtml(label) + '</span>'
    + '<input value="' + escapeHtml(value || "") + '" placeholder="' + escapeHtml(placeholder || "") + '" onchange="updateEditProfileField(\'' + key + '\', this.value)" />'
    + '</label>';
}

function getEditProfileBasicDetailConfig(key) {
  var options = typeof editProfileBasicDetailOptions !== "undefined" ? editProfileBasicDetailOptions : [];
  return options.find(function(item) {
    return item.key === key;
  }) || null;
}

function renderEditProfileFilterEntry(item, value) {
  return '<button class="edit-profile-filter-entry" onclick="openEditProfileFilter(' + jsString(item.key) + ')">'
    + '<span class="edit-profile-filter-label">' + escapeHtml(item.label) + '</span>'
    + '<strong class="edit-profile-filter-value">' + escapeHtml(value || "Select") + '</strong>'
    + '<span class="edit-profile-filter-arrow">' + iconSvg("chevronRight") + '</span>'
    + '</button>';
}

function renderEditProfileBasicDetails(draft) {
  var options = typeof editProfileBasicDetailOptions !== "undefined" ? editProfileBasicDetailOptions : [];
  return '<div class="edit-profile-filter-list">'
    + options.map(function(item) {
      return renderEditProfileFilterEntry(item, draft[item.key]);
    }).join("")
    + '</div>';
}

function renderEditProfilePage() {
  var draft = getEditProfileDraft();
  var photos = getEditProfilePhotos();

  return `
    <main class="page edit-profile-page">
      <header class="settings-head edit-profile-head">
        <button class="settings-back" onclick="goToPage('me')">‹</button>
        <h1>Edit Profile</h1>
        <button class="edit-profile-save" onclick="saveEditProfile()">Save</button>
      </header>

      <section class="edit-profile-section">
        <div class="edit-profile-section-title">
          <h2>Photos</h2>
          <span>${photos.length}/9</span>
        </div>
        <div class="edit-photo-grid">
          ${photos.map(function(photo, index) {
            return '<div class="edit-photo-tile">'
              + renderSafeImage({ src: photo, fallback: getAvatar('me').fallback, alt: "profile photo", className: "edit-photo-img" })
              + '<button onclick="removeEditProfilePhoto(' + index + ')" aria-label="Remove photo">×</button>'
              + '</div>';
          }).join("")}
          ${photos.length < 9 ? '<button class="edit-photo-add" onclick="openEditProfilePhotoPicker()"><span>+</span><strong>Add Photo</strong></button>' : ""}
        </div>
      </section>

      <section class="edit-profile-section">
        <h2>Work & Education</h2>
        ${renderEditProfileInput("work", "Work", draft.work, "Add your job")}
        ${renderEditProfileInput("education", "Education", draft.education, "Add your school")}
      </section>

      <section class="edit-profile-section">
        <h2>About Me</h2>
        <label class="edit-profile-field">
          <span>Self introduction</span>
          <textarea rows="5" placeholder="Describe yourself" onchange="updateEditProfileField('bio', this.value)">${escapeHtml(draft.bio || "")}</textarea>
        </label>
      </section>

      <section class="edit-profile-section">
        <h2>Basic Details</h2>
        ${renderEditProfileBasicDetails(draft)}
      </section>
    </main>
  `;
}

function updateEditProfileField(key, value) {
  prototypeState.editProfileDraft = Object.assign({}, editProfileDefaults.fields, prototypeState.editProfileDraft || {}, {
    [key]: value
  });
}

function selectEditProfileOption(key, value) {
  updateEditProfileField(key, value);
  updateState({
    bottomSheetStatus: "none",
    activeEditProfileFilterKey: null
  });
}

function openEditProfileFilter(key) {
  if (!getEditProfileBasicDetailConfig(key)) return;
  updateState({
    activeEditProfileFilterKey: key,
    bottomSheetStatus: "edit_profile_filter"
  });
}

function renderEditProfileFilterSheet() {
  var key = prototypeState.activeEditProfileFilterKey;
  var config = getEditProfileBasicDetailConfig(key);
  if (!config) return "";

  var draft = getEditProfileDraft();
  var value = draft[key];

  return '<div class="sheet-mask" onclick="closeSheet()"></div>'
    + '<section class="bottom-sheet edit-profile-filter-sheet">'
    + '<button class="paywall-close" onclick="closeSheet()">&times;</button>'
    + '<h2>' + escapeHtml(config.label) + '</h2>'
    + '<p class="sub-text">Choose one option for your profile.</p>'
    + '<div class="edit-profile-filter-options">'
    + config.options.map(function(option) {
      var active = value === option ? " active" : "";
      return '<button class="edit-profile-filter-option' + active + '" onclick="selectEditProfileOption(' + jsString(key) + ', ' + jsString(option) + ')">'
        + '<span>' + escapeHtml(option) + '</span>'
        + (active ? '<strong>' + iconSvg("check") + '</strong>' : "")
        + '</button>';
    }).join("")
    + '</div>'
    + '</section>';
}

function openEditProfilePhotoPicker() {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = function(event) {
    var files = Array.from(event.target.files || []).slice(0, 9);
    if (!files.length) return;

    var currentPhotos = getEditProfilePhotos();
    var loaded = [];
    files.forEach(function(file) {
      var reader = new FileReader();
      reader.onload = function(loadEvent) {
        loaded.push(loadEvent.target.result);
        if (loaded.length === files.length) {
          updateState({
            editProfilePhotos: currentPhotos.concat(loaded).slice(0, 9)
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  input.click();
}

function removeEditProfilePhoto(index) {
  var photos = getEditProfilePhotos();
  photos.splice(index, 1);
  updateState({
    editProfilePhotos: photos.length ? photos : [getAvatar('me').src]
  });
}

function saveEditProfile() {
  showToast("Profile saved");
}

function renderBottomTab() {
  const tabs = [
    { key: "discover", label: "Discover", icon: "discover" },
    { key: "likes", label: "Likes", icon: "likes", svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' },
    { key: "chat", label: "Chat", icon: "chat" },
    { key: "me", label: "Me", icon: "me" }
  ];

  return `
    <nav class="bottom-tab">
      ${tabs.map(tab => `
        <button class="${prototypeState.currentPage === tab.key ? "active" : ""}" onclick="goToPage('${tab.key}')">
          ${tab.svg ? `<span class="tab-icon" aria-hidden="true">${tab.svg}</span>` : `<span class="tab-icon tab-icon-${tab.icon}" aria-hidden="true"></span>`}
          <span>${tab.label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderBottomSheet() {
  if (prototypeState.bottomSheetStatus === "none") return "";

  if (prototypeState.bottomSheetStatus === "subscription_paywall") {
    return renderSubscriptionPaywall();
  }

  if (prototypeState.bottomSheetStatus === "coin_recharge") {
    return renderCoinRechargeSheet();
  }

  if (prototypeState.bottomSheetStatus === "photo_unlock") {
    return renderPhotoUnlockSheet();
  }

  if (prototypeState.bottomSheetStatus === "gift_panel") {
    return renderGiftPanel();
  }

  if (prototypeState.bottomSheetStatus === "chat_paywall") {
    return renderChatPaywall();
  }

  if (prototypeState.bottomSheetStatus === "profile_sheet") {
    return renderProfileSheet();
  }

  if (prototypeState.bottomSheetStatus === "filter_confirm") {
    return renderFilterConfirmSheet();
  }

  if (prototypeState.bottomSheetStatus === "chat_sort") {
    return renderChatSortSheet();
  }

  if (prototypeState.bottomSheetStatus === "edit_profile_filter") {
    return renderEditProfileFilterSheet();
  }

  if (prototypeState.bottomSheetStatus === "attachment_picker") {
    return renderAttachmentPickerSheet();
  }

  return "";
}

function renderAttachmentPickerSheet() {
  var activeTab = prototypeState.attachmentPickerTab || "my_photo";
  var isPrivateAlbum = activeTab === "private_album";

  return '<div class="sheet-mask" onclick="closeSheet()"></div>'
    + '<section class="bottom-sheet attachment-sheet ' + (isPrivateAlbum ? "private-album-mode" : "") + '">'
    + '<div class="attachment-sheet-header">'
    + '<h2>Send media</h2>'
    + '<button class="sheet-close-btn" onclick="closeSheet()" aria-label="Close">&times;</button>'
    + '</div>'
    + '<div class="attachment-tabs">'
    + '<button class="attachment-tab ' + (activeTab === "my_photo" ? "active" : "") + '" onclick="switchAttachmentTab(\'my_photo\')">My Photo</button>'
    + '<button class="attachment-tab ' + (activeTab === "private_album" ? "active" : "") + '" onclick="switchAttachmentTab(\'private_album\')">Private Album</button>'
    + '</div>'
    + (activeTab === "my_photo" ? renderMyPhotoAttachmentTab() : renderPrivateAlbumAttachmentTab())
    + '</section>';
}

function renderMyPhotoAttachmentTab() {
  var items = getMyPhotoPickedItems();
  var body = items.length
    ? renderAttachmentMediaPicker(items, "Selected from system album", "Send")
    : '<div class="attachment-system-empty"><strong>No media selected</strong><span>Open the system album and select photos or videos first.</span></div>';

  return '<div class="attachment-my-photo">'
    + '<button class="attachment-open-album-btn" onclick="openSystemMediaPicker()">'
    + '<span class="attachment-open-icon">' + iconSvg("image") + '</span>'
    + '<span><strong>Open system album</strong><small>Select photos or videos from your device.</small></span>'
    + '</button>'
    + body
    + '</div>';
}

function renderPrivateAlbumAttachmentTab() {
  var items = getPrivateAlbumAttachmentItems();

  if (!items.length) {
    return '<div class="attachment-empty-state">'
      + '<strong>No private content yet</strong>'
      + '<span>Upload private photos or videos from Me · Private Album first.</span>'
      + '</div>';
  }

  return renderAttachmentMediaPicker(items, "Select private photos or videos to send", "Send");
}

function renderAttachmentMediaPicker(items, helperText, buttonLabel) {
  var selectedIds = getSelectedPrivateMediaIds();
  var selectedItems = items.filter(function(item) {
    return selectedIds.indexOf(item.id) >= 0;
  });
  var counts = getPrivateContentGroupCountsFromItems(selectedItems, false);
  var selectedText = selectedItems.length
    ? selectedItems.length + " selected · " + counts.photosCount + " photos · " + counts.videosCount + " video"
    : "Select one or more items";

  return '<div class="private-album-picker">'
    + '<div class="attachment-picker-helper">' + escapeHtml(helperText) + '</div>'
    + '<div class="private-album-picker-grid">'
    + items.map(function(item) {
      var selected = selectedIds.indexOf(item.id) >= 0;
      var typeLabel = item.mediaType === "video" ? "Video" : "Photo";
      return '<button class="private-album-picker-item ' + item.mediaType + ' ' + (selected ? "selected" : "") + '" onclick="toggleAttachmentSelection(\'' + escapeHtml(item.id) + '\')">'
        + '<span class="private-album-picker-thumb">'
        + (item.mediaType !== "video"
          ? renderSafeImage({ src: item.src, fallback: item.fallback, alt: item.title, className: "private-album-picker-img" })
          : renderSafeImage({ src: item.src, fallback: item.fallback, alt: item.title, className: "private-album-picker-img private-album-picker-video-img" }))
        + '<span class="private-album-picker-type">' + escapeHtml(typeLabel) + '</span>'
        + '<b>' + (selected ? selectedIds.indexOf(item.id) + 1 : "") + '</b>'
        + '</span>'
        + '<span class="private-album-picker-meta"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(typeLabel) + '</small></span>'
        + '</button>';
    }).join("")
    + '</div>'
    + '<div class="attachment-selection-footer">'
    + '<span>' + escapeHtml(selectedText) + '</span>'
    + '<button class="attachment-send-btn secondary" onclick="sendSelectedAttachmentMedia()" ' + (!selectedIds.length ? "disabled" : "") + '>' + escapeHtml(buttonLabel || "Send") + '</button>'
    + '</div>'
    + '</div>';
}

var paywallBenefits = [
  { label: "See Who Likes You", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
  { label: "Unlock Videos", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>' },
  { label: "Unlock Photos", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
  { label: "Direct Chat", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { label: "See Who Visited", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>' },
  { label: "Unlimited Swipes", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/><path d="M15 6a9 9 0 0 1 0 12"/><path d="M9 6a9 9 0 0 0 0 12"/></svg>' },
  { label: "Private Album", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>' },
  { label: "Free Gifts", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>' },
  { label: "Coin Rewards", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" stroke="none">$</text></svg>' }
];

function renderBenefitCarousel() {
  return paywallBenefits.map(function(b) {
    return '<div class="benefit-chip"><span class="benefit-icon">' + b.icon + '</span><span class="benefit-label">' + b.label + '</span></div>';
  }).join("");
}

function renderSubscriptionPaywall() {
  var selectedPlan = prototypeState.selectedPackageId || "sub_1month";

  return '\n    <div class="sheet-mask" onclick="closeSheet()"></div>\n    <section class="bottom-sheet paywall-sheet">\n      <button class="paywall-close" onclick="closeSheet()">&times;</button>\n\n      <div class="paywall-header">\n        <h2 class="paywall-title">Unlock All Features</h2>\n        <p class="paywall-subtitle">Upgrade to premium, unlock unlimited possibilities</p>\n      </div>\n\n      <div class="benefit-carousel">\n        ' + renderBenefitCarousel() + '\n      </div>\n\n      <div class="paywall-plans paywall-plans--three">\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_1week" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_1week\')">\n          <strong class="plan-name">1 Week</strong>\n          <span class="plan-price">$10</span>\n        </div>\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_1month" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_1month\')">\n          <span class="plan-badge popular">Most Popular</span>\n          <strong class="plan-name">1 Month</strong>\n          <span class="plan-price">$30</span>\n        </div>\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_3month" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_3month\')">\n          <span class="plan-badge value">Best Value</span>\n          <strong class="plan-name">3 Months</strong>\n          <span class="plan-price">$100</span>\n        </div>\n      </div>\n\n      <p class="paywall-note">Cancel anytime</p>\n\n      <button class="paywall-continue-btn" onclick="completeSubscriptionPurchase()">Continue</button>\n\n      <a class="paywall-restore" onclick="handleRestorePurchases()">Restore Purchases</a>\n\n      <div class="paywall-legal">\n        <a class="paywall-legal-link" onclick="event.stopPropagation()">Terms of Use</a>\n        <span class="paywall-legal-sep">|</span>\n        <a class="paywall-legal-link" onclick="event.stopPropagation()">Privacy Policy</a>\n      </div>\n    </section>\n  ';
}

function selectPaywallPlan(planId) {
  updateState({ selectedPackageId: planId });
}

function handleRestorePurchases() {
  /* Placeholder: could trigger a restore flow */
}

function renderCoinRechargeSheet() {
  var selectedPackageId = prototypeState.selectedPackageId || (coinPackages[0] && coinPackages[0].id);

  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Recharge Coins</h2>
      <p class="sub-text">Use coins for photo unlocks, gifts and paid chat.</p>
      <div class="coin-package-grid">
        ${coinPackages.map(pkg => `
          <button class="coin-package-card ${selectedPackageId === pkg.id ? "selected" : ""}" onclick="selectPackage('${pkg.id}')">
            <strong>${pkg.coins} coins</strong>
            <span>${pkg.price}</span>
            <p>${pkg.tag}</p>
          </button>
        `).join("")}
      </div>
      <button class="primary-btn" style="width:100%;margin-top:14px;" onclick="completeCoinRecharge()">Recharge</button>
    </section>
  `;
}

function renderPhotoUnlockSheet() {
  var message = prototypeState.activePrivatePhotoMessageId
    ? findPrivatePhotoMessage(prototypeState.activePrivatePhotoMessageId)
    : null;

  if (message) {
    var photoIds = message.photoIds || [];
    var firstPhotoId = photoIds[0];
    var unlocked = isPrivatePhotoMessageUnlocked(message);
    var contentType = getPrivateContentType(message);
    var isVideo = contentType === "private_video";
    var singlePrice = message.priceCoins || 0;
    var bundlePrice = message.bundlePriceCoins || singlePrice;
    var bundleCount = message.bundleCount || photoIds.length || 1;

    return `
      <div class="sheet-mask" onclick="closeSheet()"></div>
      <section class="bottom-sheet photo-unlock-sheet">
        <button class="paywall-close" onclick="closeSheet()">&times;</button>
        <h2>${unlocked ? (isVideo ? "Private Video" : "Private Photo") : (isVideo ? "Unlock Private Video" : "Unlock Private Photo")}</h2>
        <p class="sub-text">${unlocked ? "Available for " + (prototypeState.privateContentCountdownLabel || "10:00") + "." : "Use coins to unlock this paid private content."}</p>
        <div class="coin-balance-row">
          <span>Your balance</span>
          <strong>${prototypeState.coinBalance} coins</strong>
        </div>
        ${unlocked ? `
          <button class="primary-btn" style="width:100%;" onclick="closeSheet()">Done</button>
        ` : `
          <button class="photo-unlock-option" onclick="unlockSinglePhoto('${message.id}')">
            <span>
              <strong>${message.copy && message.copy.singleCta ? message.copy.singleCta : (isVideo ? "Unlock video" : "Unlock 1 photo")}</strong>
              <small>${isVideo ? "Single paid video unlock" : "Single paid photo unlock"}</small>
            </span>
            <b>${singlePrice} coins</b>
          </button>
          <button class="photo-unlock-option" onclick="unlockPhotoBundle('${message.id}')">
            <span>
              <strong>${message.copy && message.copy.bundleCta ? message.copy.bundleCta : "Unlock " + bundleCount + (isVideo ? " video" : " photos")}</strong>
              <small>Bundle unlock for this chat</small>
            </span>
            <b>${bundlePrice} coins</b>
          </button>
          <button class="secondary-btn photo-unlock-cancel" onclick="closeSheet()">Cancel</button>
        `}
      </section>
    `;
  }

  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Unlock Private Photo</h2>
      <p class="sub-text">Unlock this photo for ${prototypeState.photoUnlockPrice} coins.</p>
      <button class="primary-btn" style="width:100%;" onclick="unlockPhoto()">Unlock Now</button>
    </section>
  `;
}

function renderGiftPanel() {
  var pages = [];
  for (var i = 0; i < giftCatalog.length; i += 8) {
    pages.push(giftCatalog.slice(i, i + 8));
  }

  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet gift-sheet">
      <div class="gift-sheet-header">
        <h2>Send a Gift</h2>
        <span>${prototypeState.coinBalance} coins</span>
      </div>
      <div class="gift-carousel" aria-label="Gift pages">
        ${pages.map((page, pageIndex) => `
          <div class="gift-page" aria-label="Gift page ${pageIndex + 1}">
            ${page.map(gift => `
              <button class="gift-item" onclick="sendGift('${gift.id}')">
                <span class="gift-icon">${gift.icon}</span>
                <strong>${gift.name}</strong>
                <em>${gift.price} coins</em>
              </button>
            `).join("")}
          </div>
        `).join("")}
      </div>
      <div class="gift-page-dots">
        ${pages.map((_, index) => `<span class="${index === 0 ? "active" : ""}"></span>`).join("")}
      </div>
    </section>
  `;
}

function renderChatPaywall() {
  var selectedPlan = prototypeState.selectedPackageId || "sub_1month";

  return '\n    <div class="sheet-mask" onclick="closeSheet()"></div>\n    <section class="bottom-sheet paywall-sheet chat-vip-paywall">\n      <button class="paywall-close" onclick="closeSheet()">&times;</button>\n\n      <div class="paywall-header">\n        <h2 class="paywall-title">Unlock Unlimited Chat</h2>\n        <p class="paywall-subtitle">Upgrade to VIP to keep chatting after your free messages are used.</p>\n      </div>\n\n      <div class="benefit-carousel">\n        ' + renderBenefitCarousel() + '\n      </div>\n\n      <div class="paywall-plans paywall-plans--three">\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_1week" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_1week\')">\n          <strong class="plan-name">1 Week</strong>\n          <span class="plan-price">$10</span>\n        </div>\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_1month" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_1month\')">\n          <span class="plan-badge popular">Most Popular</span>\n          <strong class="plan-name">1 Month</strong>\n          <span class="plan-price">$30</span>\n        </div>\n        <div class="paywall-plan-card ' + (selectedPlan === "sub_3month" ? "selected" : "") + '" onclick="selectPaywallPlan(\'sub_3month\')">\n          <span class="plan-badge value">Best Value</span>\n          <strong class="plan-name">3 Months</strong>\n          <span class="plan-price">$100</span>\n        </div>\n      </div>\n\n      <p class="paywall-note">Includes unlimited chat messages</p>\n      <button class="paywall-continue-btn" onclick="completeSubscriptionPurchase()">Continue</button>\n    </section>\n  ';
}

function renderModal() {
  if (prototypeState.modalStatus === "none") return "";

  if (prototypeState.modalStatus === "call_dialing") {
    return renderCallDialingModal();
  }

  if (prototypeState.modalStatus === "match_success") {
    return renderMatchSuccessModal();
  }

  return `
    <div class="modal-mask">
      <div class="modal-card">
        <h2>${(prototypeState.modalStatus || "").replaceAll ? prototypeState.modalStatus.replaceAll("_", " ") : prototypeState.modalStatus}</h2>
        <button class="primary-btn" onclick="closeModal()">OK</button>
      </div>
    </div>
  `;
}

function renderCallDialingModal() {
  var thread = legacyChatThreads.find(function(item) {
    return item.id === prototypeState.activeChatThreadId;
  }) || legacyChatThreads[0] || {};

  return `
    <div class="modal-mask call-dialing-mask">
      <section class="call-dialing-page">
        <button class="call-dialing-close" onclick="closeModal()" aria-label="Close">×</button>
        <span class="call-dialing-avatar" style="background-image:url('${thread.avatar || ""}')">${thread.initial || ""}</span>
        <h2>${thread.name || "Contact"}</h2>
        <p>正在拨打</p>
        <div class="call-dialing-pulse" aria-hidden="true">
          <span>${iconSvg("phone")}</span>
        </div>
        <button class="call-end-btn" onclick="closeModal()">End Call</button>
      </section>
    </div>
  `;
}

function renderMatchSuccessModal() {
  var userId = prototypeState.activeChatUserId;
  var user = userId ? mockUsers.find(function(u) { return u.id === userId; }) : getCurrentUser();
  if (!user) {
    return '<div class="modal-mask"><div class="match-success-modal"><h2>It is a match</h2><button class="primary-btn" onclick="closeModal()">OK</button></div></div>';
  }
  var avatar = getAvatar(user.id) || { src: user.avatar, fallback: "" };
  var myAvatar = getAvatar("me") || { src: "./assets/avatars/avatar_04.jpg" };

  return ''
    + '<div class="modal-mask">'
    + '<div class="match-success-modal">'
    + '<div class="match-success-avatars">'
    + '<span class="match-success-avatar mine" style="background-image:url(\'' + (myAvatar.src || "./assets/avatars/avatar_04.jpg") + '\')"></span>'
    + '<span class="match-success-avatar match-match" style="background-image:url(\'' + (avatar.src || user.avatar) + '\')">'
    + '</span>'
    + '</div>'
    + '<h2 class="match-success-title">It is a match</h2>'
    + '<p class="match-success-subtitle">You and <strong>' + user.name + '</strong> liked each other.</p>'
    + '<div class="match-success-composer">'
    + '<div class="match-success-input-row">'
    + '<input class="match-success-input" aria-label="Message ' + user.name + '" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\')sendMatchModalMessage(\'' + user.id + '\')" />'
    + '<button class="match-success-send" onclick="sendMatchModalMessage(\'' + user.id + '\')" aria-label="Send">' + iconSvg("send") + '</button>'
    + '</div>'
    + '<div class="match-success-quick">'
    + '<div class="match-success-quick-row"><span>Hi, how is your day?</span><button onclick="sendMatchQuickMessage(\'' + user.id + '\', \'Hi, how is your day?\')" aria-label="Send quick message">' + iconSvg("send") + '</button></div>'
    + '<div class="match-success-quick-row"><span>The weather is lovely today.</span><button onclick="sendMatchQuickMessage(\'' + user.id + '\', \'The weather is lovely today.\')" aria-label="Send quick message">' + iconSvg("send") + '</button></div>'
    + '<div class="match-success-quick-row"><span>Are you at work right now?</span><button onclick="sendMatchQuickMessage(\'' + user.id + '\', \'Are you at work right now?\')" aria-label="Send quick message">' + iconSvg("send") + '</button></div>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function renderToast() {
  if (prototypeState.toastStatus === "none") return "";
  return `<div class="toast">${prototypeState.toastStatus}</div>`;
}

function renderStatePanel() {
  if (prototypeState.prototypeMode !== "pm_review") return "";

  return `
    <aside class="state-panel">
      <strong>States</strong>
      <select onchange="updateState({ subscriptionStatus: this.value })">
        ${stateOptions.subscriptionStatus.map(item => `<option value="${item}" ${prototypeState.subscriptionStatus === item ? "selected" : ""}>${item}</option>`).join("")}
      </select>
      <select onchange="updateState({ photoUnlockStatus: this.value })">
        ${stateOptions.photoUnlockStatus.map(item => `<option value="${item}" ${prototypeState.photoUnlockStatus === item ? "selected" : ""}>${item}</option>`).join("")}
      </select>
    </aside>
  `;
}

function renderSwipeActionStatePanel() {
  var currentPage = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  if (currentPage !== "discover") return "";

  if (typeof swipeActionStates === "undefined") return "";

  var active = prototypeState.activeSwipeActionState || "like";
  var labels = {
    pass: "点击 X",
    like: "点击爱心",
    like_match: "点击爱心并匹配"
  };
  var descs = {
    pass: "跳过当前用户并切换下一张卡片。",
    like: "喜欢当前用户并切换下一张卡片。",
    like_match: "展示 Match 成功弹窗，并允许进入 Chat。"
  };

  return ''
    + '<div class="swipe-action-state-panel">'
    + '<div class="annotation-control-heading"><span class="annotation-field-label">滑卡行为状态</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("state") + '</span></div>'
    + '<div class="swipe-action-chip-row">'
    + swipeActionStates.map(function(s) {
        var isActive = s.key === active;
        return '<button class="swipe-action-state-chip' + (isActive ? ' active' : '') + '" data-control-type="state" onclick="selectSwipeActionState(\'' + s.key + '\')">' + (labels[s.key] || s.label) + '</button>';
      }).join("")
    + '</div>'
    + '<p class="swipe-action-state-desc">' + (descs[active] || "") + '</p>'
    + '</div>';
}

function selectSwipeActionState(key) {
  var nextState = {
    activeSwipeActionState: key,
    modalStatus: "none",
    toastStatus: "none"
  };
  if (key === "pass") {
    nextState.passStatus = "passed";
    nextState.likeStatus = "not_liked";
    nextState.matchStatus = "none";
    nextState.matchModalStatus = "hidden";
    nextState.activeChatUserId = null;
  }
  if (key === "like") {
    nextState.passStatus = "idle";
    nextState.likeStatus = "liked";
    nextState.matchStatus = "none";
    nextState.matchModalStatus = "hidden";
    nextState.activeChatUserId = null;
  }
  if (key === "like_match") {
    nextState.currentCardIndex = 0;
    nextState.passStatus = "idle";
    nextState.likeStatus = "mutual_match";
    nextState.matchStatus = "matched";
    nextState.matchModalStatus = "visible";
  }
  updateState(nextState);
}

function renderAnnotationPanel() {
  if (prototypeState.annotationStatus !== "visible") return "";
  var pos = prototypeState.annotationEditorPosition || { mode: "default" };
  var size = prototypeState.annotationEditorSize || "normal";
  var readonlyBadge = prototypeState.annotationReadOnly ? '<span class="annotation-readonly-badge">只读评审版</span>' : "";

  return `
    <aside class="annotation-editor">
      <div class="annotation-editor-header">
        <button class="annotation-drag-handle" onmousedown="startAnnotationDrag(event)">拖动注释器</button>
        <div class="annotation-size-controls">
          <button class="${size === "compact" ? "active" : ""}" onclick="setAnnotationEditorSize('compact')">缩小</button>
          <button class="${size === "normal" ? "active" : ""}" onclick="setAnnotationEditorSize('normal')">100%</button>
          <button class="${size === "wide" ? "active" : ""}" onclick="setAnnotationEditorSize('wide')">放大</button>
        </div>
        <button class="annotation-reset-position-btn" onclick="resetAnnotationEditorPosition()">${pos.mode === "floating" || size !== "normal" ? "恢复默认" : "默认"}</button>
      </div>

      <div class="annotation-header">
        <div>
          <strong>原型注释器 ${readonlyBadge}</strong>
          <p>${escapeHtml(getReadablePageName(prototypeState.activeAnnotationPage || prototypeState.currentPage))}</p>
        </div>
        <button onclick="clearAllModuleEffects()">清除选择</button>
      </div>

      <div class="annotation-user-segment">
        <div class="annotation-control-heading"><span class="annotation-field-label">用户类型</span><span class="annotation-control-type-badge">${getAnnotationControlTypeLabel("state")}</span></div>
        <div class="annotation-segment-row">
          ${entitlementUserTypeKeys.map(function(key) {
            var ent = entitlementRules[key];
            var active = prototypeState.activeEntitlementKey === key ? " active" : "";
            return '<button class="annotation-segment-btn' + active + '" data-control-type="state" onclick="applyEntitlementKey(\'' + key + '\')">' + getEntitlementDisplayName(key) + '</button>';
          }).join("")}
        </div>
      </div>

      <div class="annotation-scenario-bar">
        <span>当前场景：</span><strong>${escapeHtml(getCurrentScenarioText())}</strong>
      </div>

      ${renderAnnotationStatusSummary()}

      ${renderSwipeActionStatePanel()}

      <div class="annotation-content">
        ${renderAnnotationModuleList()}
        ${renderAnnotationDetail()}
      </div>

      <div class="annotation-actions-bar">
        <div class="annotation-control-heading"><span class="annotation-field-label">导出与备注</span><span class="annotation-control-type-badge">${getAnnotationControlTypeLabel("export")}</span></div>
        <button class="annotation-action-btn save-btn" data-control-type="export" onclick="saveAnnotationConfig()">保存</button>
        <button class="annotation-action-btn export-btn" data-control-type="export" onclick="exportEditableVersion()">导出 HTML</button>
        <button class="annotation-action-btn export-ro-btn" data-control-type="export" onclick="exportReadonlyVersion()">导出只读 HTML</button>
        <p class="annotation-export-hint">如图片使用 ./assets，请将 assets 文件夹与导出的 HTML 放在同级目录。</p>
      </div>

      ${renderPmNotePanel(getActiveModule())}
    </aside>
  `;
}

function renderAnnotationTrigger() {
  return "";
}

function renderAnnotationModuleList() {
  return "";
}

function renderAnnotationDetail() {
  var activeModule = getActiveModule();
  var activeScenario = getActiveFeatureScenario();
  var activeTab = ["notes", "states", "tracking"].indexOf(prototypeState.activeAnnotationTab) === -1 ? "notes" : prototypeState.activeAnnotationTab;
  var detailTitle = getAnnotationDetailTitle(activeModule, activeScenario);
  var detailType = activeScenario ? getAnnotationControlTypeLabel(activeScenario.controlType) : "说明型";

  return `
    <section class="annotation-detail">
      <div class="annotation-detail-title">
        <strong>${escapeHtml(detailTitle)}</strong>
        <span>${escapeHtml(detailType)}</span>
      </div>
      ${prototypeState.annotationSelectorStatus === "missing" ? '<div class="annotation-missing">当前页面未找到对应 DOM 模块。</div>' : ""}
      ${renderPrivatePhotoSimulationPanel(activeModule)}
      ${renderAnnotationTabs()}
      ${activeTab === "notes" ? renderAnnotationNotes(activeModule) : ""}
      ${activeTab === "states" ? renderAnnotationStates(activeModule) : ""}
      ${activeTab === "tracking" ? renderAnnotationTracking(activeModule) : ""}
    </section>
  `;
}

function getAnnotationDetailTitle(module, scenario) {
  var page = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  if (scenario) return scenario.title;
  if (page === "likes") return "Likes 权限说明";
  if (page === "chat" && prototypeState.chatViewStatus !== "detail") return "消息发送次数";
  if (page === "me") return "账户状态说明";
  return getReadableModuleTitle(module);
}

function renderRelatedStates(module) {
  var states = module.relatedStates;
  if (!states || states.length === 0) return "";
  return '<div class="annotation-related-states"><span class="annotation-field-label">影响状态字段</span><div class="annotation-tag-row">' + states.map(function(s) { return '<span class="annotation-tag">' + escapeHtml(s) + '</span>'; }).join("") + '</div></div>';
}

function renderPaywallRules(module) {
  var rules = module.paywallRules;
  if (!rules || rules.length === 0) return "";
  return '<div class="annotation-paywall-rules"><span class="annotation-field-label">触发付费点</span><ul class="annotation-paywall-list">' + rules.map(function(r) { return '<li><strong>' + escapeHtml(r.condition) + '</strong><span class="annotation-paywall-action">→ ' + escapeHtml(r.action) + '</span></li>'; }).join("") + '</ul></div>';
}

function renderAnnotationStatusSummary() {
  var page = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var moduleId = getAnnotationTargetModuleId();
  if (page === "me" || page === "privateAlbum") {
    return '<div class="ent-counter-summary"><span class="annotation-field-label">账户状态</span>'
      + '<div class="annotation-status-row"><strong>订阅状态</strong><span>' + escapeHtml(prototypeState.subscriptionStatus) + '</span></div>'
      + '<div class="annotation-status-row"><strong>当前套餐</strong><span>' + escapeHtml(prototypeState.subscriptionPlan || "none") + '</span></div>'
      + '<div class="annotation-status-row"><strong>金币余额</strong><span>' + escapeHtml(prototypeState.coinBalance) + '</span></div>'
      + '<div class="annotation-status-row"><strong>用户类型</strong><span>' + escapeHtml(getEntitlementDisplayName(prototypeState.activeEntitlementKey)) + '</span></div>'
      + '</div>'
      + renderPrivateAlbumAnnotationControls();
  }
  if (page === "likes") {
    return '<div class="ent-counter-summary"><span class="annotation-field-label">权限状态</span>'
      + '<div class="annotation-status-row"><strong>谁喜欢我</strong><span>' + (canViewLikesMe() ? "已解锁" : "已锁定") + '</span></div>'
      + '<div class="annotation-status-row"><strong>订阅状态</strong><span>' + escapeHtml(prototypeState.subscriptionStatus) + '</span></div>'
      + '</div>';
  }
  if (page === "chat") {
    var chatPanel = getAnnotationContextPanel(page, moduleId);
    return chatPanel.html || "";
  }
  if (page === "discover") {
    return renderUsageCounterPanel(["swipe_limit", "like_action"]);
  }
  return "";
}

function renderPrivateAlbumAnnotationControls() {
  var status = prototypeState.privateAlbumStatus === "uploaded" ? "uploaded" : "empty";
  var counts = getPrivateAlbumCounts();
  var statusText = status === "uploaded" ? "用户已有私密内容，可继续上传或管理" : "用户尚未上传私密照片或视频";

  return '<div class="ent-counter-summary private-album-annotation-panel">'
    + '<div class="annotation-control-heading"><span class="annotation-field-label">私密相册状态</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("state") + '</span></div>'
    + '<div class="annotation-segment-row">'
    + '<button class="annotation-segment-btn' + (status === "empty" ? " active" : "") + '" data-control-type="state" onclick="applyPrivateAlbumStatus(\'empty\')">未上传</button>'
    + '<button class="annotation-segment-btn' + (status === "uploaded" ? " active" : "") + '" data-control-type="state" onclick="applyPrivateAlbumStatus(\'uploaded\')">已上传</button>'
    + '</div>'
    + '<div class="annotation-status-row"><strong>状态说明</strong><span>' + escapeHtml(statusText) + '</span></div>'
    + (status === "uploaded" ? '<div class="annotation-status-row"><strong>私密照片</strong><span>' + escapeHtml(counts.photos) + '</span></div><div class="annotation-status-row"><strong>私密视频</strong><span>' + escapeHtml(counts.videos) + '</span></div>' : "")
    + '<div class="annotation-control-heading private-album-sim-heading"><span class="annotation-field-label">模拟操作</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("simulation") + '</span></div>'
    + '<div class="annotation-segment-row">'
    + '<button class="annotation-simulate-btn" data-control-type="simulation" onclick="uploadPrivatePhoto()">模拟上传私密照片</button>'
    + '<button class="annotation-simulate-btn" data-control-type="simulation" onclick="uploadPrivateVideo()">模拟上传私密视频</button>'
    + '</div>'
    + '</div>';
}

function renderPmNotePanel(module) {
  var pageId = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  var scenario = getActiveFeatureScenario();
  var current = getCurrentPmNote();
  var pmNotes = getPmNotesStore();
  var viewerNotes = getViewerNotesStore();
  var noteItems = Object.keys(pmNotes).map(function(key) { return pmNotes[key]; }).concat(Object.keys(viewerNotes).map(function(key) { return viewerNotes[key]; }));
  var currentValue = current ? (current.content || current.note || "") : "";
  var readonly = prototypeState.annotationReadOnly;
  var noteView = ["current", "all", "add"].indexOf(prototypeState.annotationNoteView) === -1 ? "current" : prototypeState.annotationNoteView;
  var scenarioTitle = scenario ? scenario.title : getReadableModuleTitle(module);

  return '<section class="annotation-note-panel">'
    + '<div class="annotation-note-header"><div class="annotation-control-heading"><span class="annotation-field-label">备注</span><span class="annotation-control-type-badge">' + getAnnotationControlTypeLabel("export") + '</span></div><div class="annotation-note-actions">'
    + '<button data-control-type="export" onclick="toggleAnnotationNoteView(\'current\')" class="' + (noteView === "current" ? "active" : "") + '">当前备注</button>'
    + '<button data-control-type="export" onclick="toggleAnnotationNoteView(\'all\')" class="' + (noteView === "all" ? "active" : "") + '">全部备注</button>'
    + '<button data-control-type="export" onclick="toggleAnnotationNoteView(\'add\')" class="' + (noteView === "add" ? "active" : "") + '">添加备注</button>'
    + '</div></div>'
    + (noteView === "all"
      ? '<div class="annotation-note-list">' + (noteItems.length ? noteItems.map(function(item) {
          return '<div class="annotation-note-item"><strong>' + escapeHtml((item.noteType === "viewer" ? "查看者备注" : "PM 备注") + " · " + getReadablePageName(item.page) + " / " + (item.moduleTitle || item.scenarioId || item.moduleId)) + '</strong><p>' + escapeHtml(item.content || item.note || "") + '</p><small>' + escapeHtml(item.updatedAt || "") + '</small></div>';
        }).join("") : '<p class="annotation-note-empty">暂无备注</p>') + '</div>'
      : noteView === "add"
        ? '<textarea class="annotation-note-textarea viewer-note-input" placeholder="添加查看者备注，不会覆盖 PM 原始备注"></textarea>'
          + '<div class="annotation-note-meta"><span>页面：' + escapeHtml(getReadablePageName(pageId)) + '</span><span>场景：' + escapeHtml(scenarioTitle) + '</span><span>类型：查看者备注</span></div>'
          + '<div class="annotation-note-actions"><button data-control-type="export" onclick="saveViewerNote(document.querySelector(\'.viewer-note-input\').value)">保存查看者备注</button></div>'
        : '<textarea class="annotation-note-textarea" ' + (readonly ? "readonly" : "") + ' placeholder="当前场景暂无 PM 备注" onchange="saveCurrentPmNote(this.value)">' + escapeHtml(currentValue) + '</textarea>'
          + '<div class="annotation-note-meta"><span>页面：' + escapeHtml(getReadablePageName(pageId)) + '</span><span>场景：' + escapeHtml(scenarioTitle) + '</span>' + (current ? '<span>更新：' + escapeHtml(current.updatedAt) + '</span>' : '<span>当前场景暂无 PM 备注</span>') + '</div>'
          + '<div class="annotation-note-actions">' + (readonly ? '<span class="annotation-readonly-badge">PM 备注只读</span>' : '<button data-control-type="export" onclick="saveCurrentPmNote(document.querySelector(\'.annotation-note-textarea\').value)">保存 PM 备注</button><button data-control-type="export" onclick="clearCurrentPmNote()">清空 PM 备注</button>') + '</div>')
    + '</section>';
}

function renderAnnotationTabs() {
  var labels = {
    notes: "说明",
    states: "状态",
    tracking: "埋点"
  };
  var tabs = ["notes", "states", "tracking"];
  var activeTab = tabs.indexOf(prototypeState.activeAnnotationTab) === -1 ? "notes" : prototypeState.activeAnnotationTab;

  return `
    <div class="annotation-tabs">
      ${tabs.map(tab => `
        <button class="annotation-tab ${activeTab === tab ? "active" : ""}" data-control-type="info" onclick="switchAnnotationTab('${tab}')">
          ${labels[tab] || tab}
        </button>
      `).join("")}
    </div>
  `;
}

function renderAnnotationNotes(module) {
  var scenario = getActiveFeatureScenario();
  var notes = scenario && scenario.notes ? scenario.notes : getPageLevelAnnotationNotes(module);
  var fields = [
    ["business", "业务说明"],
    ["ui", "UI 规范"],
    ["interaction", "交互说明"],
    ["stateRules", "状态规则"],
    ["edgeCases", "边界情况"],
    ["acceptance", "验收标准"]
  ];

  return `
    <div class="annotation-note-body">
      ${fields.map(([key, label]) => `
        <label class="annotation-field">
          <span>${label}</span>
          <textarea class="annotation-textarea" data-control-type="info" ${prototypeState.annotationReadOnly ? "readonly" : ""} onchange="saveAnnotationData('${module.id}', '${key}', this.value)">${escapeHtml(notes[key])}</textarea>
        </label>
      `).join("")}
    </div>
  `;
}

function getPageLevelAnnotationNotes(module) {
  var page = prototypeState.activeAnnotationPage || prototypeState.currentPage;
  if (page === "likes") {
    return {
      business: "Likes 页面用于说明谁喜欢我权限差异：免费用户只能看到模糊头像和数量预览，订阅用户可以查看高清头像和完整信息。",
      ui: "保留当前用户类型、页面说明和权限状态卡片，减少不必要的信息层级。",
      interaction: "用户可以在页面内查看 Like you / Match 相关内容；权限不足时保持锁定提示。",
      stateRules: "paid_user 不等于 subscriber；只有订阅用户可高清查看谁喜欢我。",
      edgeCases: "免费用户、付费但未订阅用户、订阅用户需要展示不同权限状态。",
      acceptance: "免费用户 Likes Me 模糊，订阅用户 Likes Me 高清，右侧保持产品说明优先。"
    };
  }
  if (page === "chat" && prototypeState.chatViewStatus !== "detail") {
    return {
      business: "Chat 列表承接 Match 后的会话关系，并展示消息发送次数限制。",
      ui: "右侧只展示消息次数状态，不默认拆私密照或付费消息场景。",
      interaction: "点击会话进入对话框；普通消息发送次数跟随用户类型变化。",
      stateRules: "免费用户单个对象最多发送 3 条消息，订阅用户消息次数为无限。",
      edgeCases: "第 4 条免费消息应被拦截并进入对应付费提示。",
      acceptance: "消息次数 0 / 3、1 / 3、2 / 3、3 / 3 与发送行为同步。"
    };
  }
  if (page === "me") {
    return {
      business: "Me 页面展示用户账户状态、金币余额和订阅状态。",
      ui: "右侧只保留账户状态卡片和说明，减少不必要的信息层级。",
      interaction: "用于评审账户信息入口，不在注释器里展开具体充值或订阅付费路径。",
      stateRules: "账户状态展示订阅状态、当前套餐、金币余额和用户类型。",
      edgeCases: "无订阅、订阅中、金币不足等状态需要可读，但不暴露技术公式。",
      acceptance: "Me 页面只保留账户状态和产品说明。"
    };
  }
  return getModuleNotes(module);
}

function renderAnnotationStates(module) {
  var stateKeys = Object.keys(module.states || {});
  var activeState = module.states[prototypeState.activeModuleState] || module.states.default;

  return `
    <div class="annotation-states">
      <div class="annotation-section-title">快捷状态</div>
      <div class="annotation-preset-row">
        ${stateKeys.map(function(key) {
          return '<button class="annotation-preset-btn' + (prototypeState.activeModuleState === key ? ' active' : '') + '" data-control-type="state" onclick="applyAnnotationPreset(\'' + key + '\')">' + getStateLabel(key) + '</button>';
        }).join("")}
      </div>

      <label class="annotation-field">
        <span>状态选择</span>
        <select data-control-type="state" onchange="applyModuleState('${module.id}', this.value)">
          ${stateKeys.map(function(key) { return '<option value="' + key + '"' + (prototypeState.activeModuleState === key ? ' selected' : '') + '>' + getStateLabel(key) + '</option>'; }).join("")}
        </select>
      </label>

      <div class="annotation-preview-box">
        <strong>${escapeHtml(getStateLabel(prototypeState.activeModuleState))}</strong>
        <span>状态动作：${escapeHtml(getStateLabel(activeState ? activeState.action : "none"))}</span>
        <p>${escapeHtml(activeState ? activeState.text : "")}</p>
      </div>

      <button class="primary-btn annotation-apply-btn" data-control-type="state" onclick="applyModuleState('${module.id}', prototypeState.activeModuleState)">应用状态</button>
      <div class="annotation-section-title">状态矩阵</div>
      ${renderAnnotationMatrix(module)}
      <div class="annotation-section-title">页面流转</div>
      ${renderAnnotationFlow(module)}
    </div>
  `;
}

function renderAnnotationTechnicalFields(module) {
  if (!module) return "";
  return `
    <div class="annotation-technical-fields">
      <div class="annotation-section-title">技术字段</div>
      <div class="annotation-tag-row">
        <span class="annotation-tag">moduleId: ${escapeHtml(module.id)}</span>
        <span class="annotation-tag">selector: ${escapeHtml(module.selector || "")}</span>
        <span class="annotation-tag">type: ${escapeHtml(module.type || "")}</span>
      </div>
    </div>
  `;
}

function renderAnnotationMatrix(module) {
  return `
    <div class="annotation-list">
      ${(module.matrix || []).map(function(item) {
        return '<div class="annotation-row"><strong>' + escapeHtml(getStateLabel(item.state)) + '</strong><span>' + escapeHtml(translateAnnotationText(item.behavior)) + '</span></div>';
      }).join("")}
    </div>
  `;
}

function renderAnnotationFlow(module) {
  return `
    <ol class="annotation-list ordered">
      ${(module.flow || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ol>
  `;
}

function renderEntitlementMatrix() {
  var actionRows = entitlementActionTypes.map(function(action) {
    var cells = entitlementUserTypeKeys.map(function(userKey) {
      var ent = entitlementRules[userKey];
      if (!ent) return '<td class="ent-matrix-cell ent-matrix-na">—</td>';

      var quota = (ent.quotas[action.key] || {});
      var trigger = (ent.paywallTriggers || {})[action.key];
      var isActive = prototypeState.activeEntitlementKey === userKey;

      var quotaText = quota.daily === "unlimited" ? "∞" : (quota.daily || 0);
      var strategyText = quota.daily === 0 ? "Locked" : (quota.daily === "unlimited" ? "Unlimited" : quota.daily + " per day");
      var triggerText = trigger === "subscription_paywall" ? "Subscription Paywall" : (trigger === "coin_recharge" ? "Coin Recharge" : (trigger ? trigger : "None"));

      var cls = "ent-matrix-cell";
      if (isActive) cls += " ent-matrix-active";
      if (quota.daily === "unlimited") cls += " ent-matrix-unlimited";
      if (quota.daily === 0 && action.key !== "likesMe") cls += " ent-matrix-locked";
      if (trigger) cls += " ent-matrix-has-trigger";

      return '<td class="' + cls + '">'
        + '<span class="ent-matrix-quota">' + quotaText + '</span>'
        + '<span class="ent-matrix-strategy">' + strategyText + '</span>'
        + '<span class="ent-matrix-trigger">' + triggerText + '</span>'
        + '</td>';
    }).join("");

    var limited = getEntitlementLimitedFlag(action.key);
    var rowCls = limited ? " ent-matrix-row-limited" : "";

    return '<tr class="' + rowCls + '">'
      + '<td class="ent-matrix-action-label">'
      + '<span class="ent-matrix-action-icon">' + (iconSvg(action.icon) || action.label) + '</span>'
      + '<span>' + action.label + '</span>'
      + (limited ? '<span class="ent-matrix-row-badge">Exceeded</span>' : '')
      + '</td>'
      + cells
      + '</tr>';
  }).join("");

  var headerCells = entitlementUserTypeKeys.map(function(key) {
    var ent = entitlementRules[key];
    var isActive = prototypeState.activeEntitlementKey === key;
    return '<th class="ent-matrix-head' + (isActive ? ' ent-matrix-head-active' : '') + '">' + getEntitlementDisplayName(key) + '</th>';
  }).join("");

  return `
    <div class="ent-matrix-wrap">
      <div class="annotation-section-title">PRD State Matrix · User Segment × Paywall Point × Quota × Trigger</div>
      <div class="ent-matrix-scroll">
        <table class="ent-matrix-table">
          <thead>
            <tr>
              <th class="ent-matrix-head ent-matrix-action-head">Paywall Point</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${actionRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAnnotationTracking(module) {
  var scenario = getActiveFeatureScenario();
  var tracking = scenario && scenario.tracking ? scenario.tracking : (module.tracking || []);
  return `
    <div class="annotation-list">
      ${tracking.map(item => `
        <div class="annotation-row">
          <strong>${escapeHtml(item.event)}</strong>
          <span>${escapeHtml(item.trigger)}</span>
          <small>${escapeHtml((item.params || []).join(", "))}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function openAnnotationPanel() {
  var targetModuleId = getAnnotationTargetModuleId() || (getPageModules()[0] ? getPageModules()[0].id : null);
  updateState({
    annotationPanelStatus: "expanded",
    activeModuleId: targetModuleId,
    activeAnnotationTab: "notes",
    activeModuleState: "default"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(targetModuleId), 0);
  }
}

function closeAnnotationPanel() {
  clearAllModuleEffects();
  updateState({
    annotationPanelStatus: "expanded",
    activeModuleId: null,
    activeModuleState: "default",
    annotationSelectorStatus: "idle"
  });
}

function selectAnnotationModule(moduleId) {
  clearAllModuleEffects();
  updateState({
    activeModuleId: moduleId,
    activeFeatureScenarioId: null,
    activeAnnotationTab: "notes",
    activeModuleState: "default",
    annotationSelectorStatus: "idle"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(moduleId), 0);
  }
}

function selectFeatureScenario(scenarioId, moduleId) {
  clearAllModuleEffects();
  updateState({
    activeFeatureScenarioId: scenarioId,
    activeModuleId: moduleId,
    activeAnnotationTab: "notes",
    activeModuleState: "default",
    annotationSelectorStatus: "idle"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(moduleId), 0);
  }
}

function switchAnnotationTab(tab) {
  if (["notes", "states", "tracking"].indexOf(tab) === -1) {
    tab = "notes";
  }
  updateState({
    activeAnnotationTab: tab
  });
}

function applyAnnotationPreset(preset) {
  const module = getActiveModule();
  if (!module) return;
  applyModuleState(module.id, preset);
}

function setAnnotationSelectorStatusSafe(nextStatus) {
  if (prototypeState.annotationSelectorStatus === nextStatus) return;
  updateState({ annotationSelectorStatus: nextStatus });
}

function applyModuleState(moduleId, stateKey) {
  clearModuleEffects(moduleId);
  const pageConfig = getCurrentPageConfig();
  const module = pageConfig.modules[moduleId];
  const stateConfig = module && module.states ? module.states[stateKey] : null;
  var stateSync = getPrivatePhotoStateSync(moduleId, stateKey);

  updateState(Object.assign({
    activeModuleId: moduleId,
    activeModuleState: stateConfig ? stateKey : "default",
    annotationSelectorStatus: "idle"
  }, stateSync));

  if (typeof setTimeout === "function") {
    setTimeout(() => {
      const applied = applyModuleStateEffect(moduleId, stateKey);
      if (!applied) {
        setAnnotationSelectorStatusSafe("missing");
      }
    }, 0);
  }
}

function applyModuleStateEffect(moduleId, stateKey) {
  const pageConfig = getCurrentPageConfig();
  const module = pageConfig.modules[moduleId];
  const stateConfig = module && module.states ? module.states[stateKey] : null;
  if (!module || !stateConfig || typeof document === "undefined" || typeof document.querySelector !== "function") return false;

  const target = document.querySelector(module.selector);
  if (!target) return false;

  clearModuleEffects(moduleId);
  target.classList.add("annotation-highlight", "hotspot", "active");

  if (stateConfig.action === "hide") target.classList.add("state-hidden");
  if (stateConfig.action === "blur_and_lock") {
    target.classList.add("state-blur");
    target.appendChild(createLockOverlay(stateConfig.text));
  }
  if (stateConfig.action === "skeleton") target.classList.add("state-skeleton");
  if (stateConfig.action === "empty") {
    target.classList.add("state-empty");
    target.appendChild(createEmptyStatePreview(stateConfig.text));
  }
  if (stateConfig.action === "disabled") target.classList.add("state-disabled");
  if (stateConfig.action === "matched") target.classList.add("state-matched");
  if (stateConfig.action === "unlocked") target.classList.add("state-unlocked");

  return true;
}

function createLockOverlay(text) {
  const overlay = document.createElement("div");
  overlay.className = "lock-overlay";
  overlay.textContent = text || "Locked";
  return overlay;
}

function createEmptyStatePreview(text) {
  const preview = document.createElement("div");
  preview.className = "empty-state-preview";
  preview.textContent = text || "No content";
  return preview;
}

function clearModuleEffects(moduleId) {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return;

  const module = getCurrentPageConfig().modules[moduleId];
  if (!module) return;

  const target = document.querySelector(module.selector);
  if (!target) return;

  target.classList.remove(
    "annotation-highlight",
    "hotspot",
    "active",
    "state-hidden",
    "state-blur",
    "state-skeleton",
    "state-empty",
    "state-disabled",
    "state-matched",
    "state-unlocked"
  );
  target.querySelectorAll(":scope > .lock-overlay, :scope > .empty-state-preview").forEach(node => node.remove());
}

function clearAllModuleEffects() {
  getPageModules().forEach(module => clearModuleEffects(module.id));
}

function highlightAnnotationTarget(moduleId) {
  clearAllModuleEffects();
  const applied = applyModuleStateEffect(moduleId, prototypeState.activeModuleState || "default");
  setAnnotationSelectorStatusSafe(applied ? "idle" : "missing");
}

function saveAnnotationData(moduleId, field, value) {
  if (prototypeState.annotationReadOnly || typeof localStorage === "undefined") return;

  const pageId = prototypeState.activeAnnotationPage;
  const notes = getSavedAnnotationNotes(pageId, moduleId);
  notes[field] = value;
  localStorage.setItem(getAnnotationStorageKey(pageId, moduleId), JSON.stringify(notes));
}

function switchLikesTab(tab) {
  updateState({
    likesViewStatus: tab === "matches" ? "matches" : "liked"
  });
}

function openChat(threadId) {
  clearAllModuleEffects();
  updateState({
    currentPage: "chat",
    chatViewStatus: "detail",
    activeChatThreadId: threadId || legacyChatThreads[0].id,
    bottomSheetStatus: "none",
    modalStatus: "none"
  });
}

function closeChat() {
  updateState({
    chatViewStatus: "list",
    activeChatThreadId: null
  });
}

function sendChatMessage() {
  var input = document.querySelector(".composer-input");
  var text = input ? input.value.trim() : "";
  if (!text) return;

  var threadId = prototypeState.activeChatThreadId;
  if (!threadId) return;

  handleEntitlementAction("message_send", function() {
    sendReplyMessage(threadId, text);
  });
}

function openChatThread(threadId) {
  console.log("[route-debug] openChatThread called", threadId);
  openChat(threadId);
}

function openAudioCall() {
  updateState({
    modalStatus: "call_dialing",
    bottomSheetStatus: "none"
  });
}

function renderChatThread(thread) {
  console.log("[render-debug] renderChatThread", thread && thread.id);
  return renderChatDetailPage(thread);
}

function getCurrentTimeLabel() {
  var now = new Date();
  return now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
}

function sendReplyMessage(threadId, text) {
  var thread = legacyChatThreads.find(function(t) { return t.id === threadId; });
  if (!thread) return;

  var time = getCurrentTimeLabel();

  if (!chatMessageHistory[threadId]) chatMessageHistory[threadId] = [];
  chatMessageHistory[threadId].push({ type: "outgoing", text: text, time: time });
  thread.lastMessage = text;
  thread.time = time;
  thread.unreadCount = 0;

  prototypeState.chatEmojiPanelOpen = false;
  updateState({});
  showToast("Message sent");
}

function simulateSupplyPrivateContent(threadId, contentType) {
  var safeType = contentType === "private_video" ? "private_video" : "private_photo";
  var template = getPrivateContentTemplate(safeType, threadId);
  var thread = legacyChatThreads.find(function(t) { return t.id === threadId; });
  if (!template || !thread || !thread.privatePhotoFlow) return false;

  if (!chatMessageHistory[threadId]) chatMessageHistory[threadId] = [];
  var contentId = template.contentId || template.id;
  var exists = chatMessageHistory[threadId].some(function(item) {
    return item.id === template.id || item.contentId === contentId;
  });
  if (exists) {
    prototypeState.activePrivatePhotoMessageId = template.id;
    prototypeState.activePrivateContentType = safeType;
    prototypeState.privateContentStatus = "already_sent";
    prototypeState.photoUnlockStatus = "locked";
    return "exists";
  }

  var time = getCurrentTimeLabel();
  var label = safeType === "private_video" ? "video" : "photo";
  chatMessageHistory[threadId].push({
    type: "incoming",
    text: "I sent you a private " + label + ".",
    time: time
  });
  chatMessageHistory[threadId].push(Object.assign({}, template, { status: "locked" }));
  thread.lastMessage = "I sent you a private " + label + ".";
  thread.time = time;
  thread.unreadCount = 1;
  prototypeState.activePrivatePhotoMessageId = template.id;
  prototypeState.activePrivateContentType = safeType;
  prototypeState.privateContentStatus = "sent_locked";
  if (prototypeState.sentPrivateContentIds.indexOf(contentId) < 0) {
    prototypeState.sentPrivateContentIds.push(contentId);
  }
  prototypeState.photoUnlockStatus = "locked";
  return "created";
}

function simulateSupplyPrivatePhoto(threadId) {
  return simulateSupplyPrivateContent(threadId, "private_photo");
}

function getPrivateContentThreadId() {
  var threadId = prototypeState.activeChatThreadId;
  var hasPhoto = threadId && getPrivateContentTemplate("private_photo", threadId);
  var hasVideo = threadId && getPrivateContentTemplate("private_video", threadId);
  if (hasPhoto || hasVideo) return threadId;

  var fallbackThread = legacyChatThreads.find(function(thread) {
    return thread.privatePhotoFlow && getPrivateContentTemplate("private_photo", thread.id);
  });
  return fallbackThread ? fallbackThread.id : null;
}

function simulatePrivateContentFromAnnotation(contentType) {
  if (prototypeState.currentPage !== "chat") return;
  if (getAnnotationTargetModuleId() !== "chat_private_photo_unlock") return;

  var threadId = getPrivateContentThreadId();
  if (!threadId) return;

  var result = simulateSupplyPrivateContent(threadId, contentType);
  var nextState = {
    currentPage: "chat",
    chatViewStatus: "detail",
    activeChatThreadId: threadId,
    activeModuleId: "chat_private_photo_unlock",
    activePrivateContentType: contentType === "private_video" ? "private_video" : "private_photo"
  };

  if (result === "exists") {
    updateState(Object.assign({}, nextState, { privateContentStatus: "already_sent" }));
    showToast("该私密内容已发送，不能重复发送");
    return;
  }

  if (result === "created") {
    updateState(Object.assign({}, nextState, { privateContentStatus: "sent_locked", photoUnlockStatus: "locked" }));
  }
}

function getPrivateContentUnlockIds(message) {
  if (!message) return [];
  return (message.photoIds || []).concat(message.contentId ? [message.contentId] : []);
}

function setPrivateContentUnlocked(message) {
  var unlocked = prototypeState.unlockedPhotoIds.slice();
  getPrivateContentUnlockIds(message).forEach(function(id) {
    if (unlocked.indexOf(id) < 0) unlocked.push(id);
  });
  message.status = "unlocked_countdown";
  return unlocked;
}

function simulatePrivateContentUnlockFromAnnotation() {
  var message = getActivePrivatePhotoMessage();
  if (!message) {
    simulatePrivateContentFromAnnotation(prototypeState.activePrivateContentType || "private_photo");
    message = getActivePrivatePhotoMessage();
  }
  if (!message) return;

  var unlocked = setPrivateContentUnlocked(message);
  updateState({
    activePrivatePhotoMessageId: message.id,
    activePrivateContentType: getPrivateContentType(message),
    privateContentStatus: "unlocked_countdown",
    privateContentCountdownLabel: "10:00",
    unlockedPhotoIds: unlocked,
    photoUnlockStatus: "unlocked",
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
}

function simulatePrivateContentDestroyedFromAnnotation() {
  var message = getActivePrivatePhotoMessage();
  if (!message) return;
  message.status = "destroyed";
  updateState({
    activePrivatePhotoMessageId: message.id,
    activePrivateContentType: getPrivateContentType(message),
    privateContentStatus: "destroyed",
    photoUnlockStatus: "locked",
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
}

function applyPrivateContentStatus(status) {
  if (["draft", "sent_unopened", "opened_countdown", "destroyed"].indexOf(status) >= 0) {
    var group = getPrivateContentGroup();
    var message = findPrivateContentGroupMessage(prototypeState.activeChatThreadId, group.id);
    if (message) {
      message.status = status === "draft" ? "sent_unopened" : status;
    }
    updateState({
      privateContentGroup: Object.assign({}, group, { status: status }),
      activeModuleId: "chat_private_photo_unlock",
      bottomSheetStatus: "none",
      paywallStatus: "none"
    });
    return;
  }

  var message = getActivePrivatePhotoMessage();
  var nextStatus = status || "not_sent";
  var partial = { privateContentStatus: nextStatus, bottomSheetStatus: "none", paywallStatus: "none" };

  if (message) {
    partial.activePrivatePhotoMessageId = message.id;
    partial.activePrivateContentType = getPrivateContentType(message);
    if (nextStatus === "sent_locked") {
      message.status = "locked";
      partial.photoUnlockStatus = "locked";
    }
    if (nextStatus === "unlocked_countdown") {
      partial.unlockedPhotoIds = setPrivateContentUnlocked(message);
      partial.photoUnlockStatus = "unlocked";
      partial.privateContentCountdownLabel = "10:00";
    }
    if (nextStatus === "destroyed") {
      message.status = "destroyed";
      partial.photoUnlockStatus = "locked";
    }
  }

  updateState(partial);
}

function handlePrivatePhotoClick(messageId) {
  var message = findPrivatePhotoMessage(messageId);
  if (!message) return;

  if (message.status === "destroyed") {
    showToast("Content destroyed");
    return;
  }

  if (isPrivatePhotoMessageUnlocked(message)) {
    viewUnlockedPrivatePhoto(messageId);
    return;
  }

  openPhotoUnlockSheet(messageId);
}

function openPhotoUnlockSheet(messageId) {
  var message = findPrivatePhotoMessage(messageId);
  if (!message) return;

  updateState({
    activePrivatePhotoMessageId: messageId,
    activePrivateContentType: getPrivateContentType(message),
    selectedPhotoId: (message.photoIds || [])[0] || null,
    photoUnlockPrice: message.priceCoins || prototypeState.photoUnlockPrice,
    photoUnlockStatus: isPrivatePhotoMessageUnlocked(message) ? "unlocked" : "locked",
    privateContentStatus: isPrivatePhotoMessageUnlocked(message) ? "unlocked_countdown" : "sent_locked",
    activePhotoUnlockSheet: {
      visible: true,
      messageId: messageId,
      unlockMode: null
    },
    bottomSheetStatus: "photo_unlock",
    paywallStatus: "photo_unlock"
  });
}

function unlockSinglePhoto(messageId) {
  var message = findPrivatePhotoMessage(messageId);
  if (!message) return;

  var photoId = (message.photoIds || [])[0];
  var price = message.priceCoins || 0;
  if (!photoId) return;

  if (prototypeState.unlockedPhotoIds.indexOf(photoId) >= 0) {
    viewUnlockedPrivatePhoto(messageId);
    return;
  }

  if (prototypeState.coinBalance < price) {
    updateState({
      activePrivatePhotoMessageId: messageId,
      activePrivateContentType: getPrivateContentType(message),
      privateContentStatus: "sent_locked",
      photoUnlockStatus: "insufficient_balance",
      activePhotoUnlockSheet: {
        visible: false,
        messageId: messageId,
        unlockMode: "single_photo"
      },
      bottomSheetStatus: "coin_recharge",
      paywallStatus: "coin_recharge"
    });
    showToast("Insufficient coins");
    return;
  }

  var unlocked = setPrivateContentUnlocked(message);
  var usageKey = getPrivateContentType(message);

  updateState({
    activePrivatePhotoMessageId: messageId,
    activePrivateContentType: usageKey,
    unlockedPhotoIds: unlocked,
    photoUnlockStatus: "unlocked",
    privateContentStatus: "unlocked_countdown",
    privateContentCountdownLabel: "10:00",
    coinBalance: prototypeState.coinBalance - price,
    dailyPhotoUnlockCount: (Number(prototypeState.dailyPhotoUnlockCount) || 0) + 1,
    usageCounters: Object.assign({}, prototypeState.usageCounters, {
      [usageKey]: (prototypeState.usageCounters[usageKey] || 0) + 1
    }),
    activePhotoUnlockSheet: {
      visible: false,
      messageId: messageId,
      unlockMode: "single_photo"
    },
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
  showToast(getPrivateContentType(message) === "private_video" ? "Video unlocked" : "Photo unlocked");
}

function unlockPhotoBundle(messageId) {
  var message = findPrivatePhotoMessage(messageId);
  if (!message) return;

  var photoIds = message.photoIds || [];
  var price = message.bundlePriceCoins || message.priceCoins || 0;
  if (photoIds.length === 0) return;

  var hasAll = photoIds.every(function(photoId) {
    return prototypeState.unlockedPhotoIds.indexOf(photoId) >= 0;
  });
  if (hasAll) {
    viewUnlockedPrivatePhoto(messageId);
    return;
  }

  if (prototypeState.coinBalance < price) {
    updateState({
      activePrivatePhotoMessageId: messageId,
      activePrivateContentType: getPrivateContentType(message),
      privateContentStatus: "sent_locked",
      photoUnlockStatus: "insufficient_balance",
      activePhotoUnlockSheet: {
        visible: false,
        messageId: messageId,
        unlockMode: "photo_bundle"
      },
      bottomSheetStatus: "coin_recharge",
      paywallStatus: "coin_recharge"
    });
    showToast("Insufficient coins");
    return;
  }

  var unlocked = prototypeState.unlockedPhotoIds.slice();
  getPrivateContentUnlockIds(message).forEach(function(photoId) {
    if (unlocked.indexOf(photoId) < 0) unlocked.push(photoId);
  });
  message.status = "unlocked_countdown";
  var usageKey = getPrivateContentType(message);

  updateState({
    activePrivatePhotoMessageId: messageId,
    activePrivateContentType: usageKey,
    unlockedPhotoIds: unlocked,
    photoUnlockStatus: "unlocked",
    privateContentStatus: "unlocked_countdown",
    privateContentCountdownLabel: "10:00",
    coinBalance: prototypeState.coinBalance - price,
    dailyPhotoUnlockCount: (Number(prototypeState.dailyPhotoUnlockCount) || 0) + photoIds.length,
    usageCounters: Object.assign({}, prototypeState.usageCounters, {
      [usageKey]: (prototypeState.usageCounters[usageKey] || 0) + Math.max(1, photoIds.length)
    }),
    activePhotoUnlockSheet: {
      visible: false,
      messageId: messageId,
      unlockMode: "photo_bundle"
    },
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
  showToast(getPrivateContentType(message) === "private_video" ? "Video unlocked" : "Photos unlocked");
}

function viewUnlockedPrivatePhoto(messageId) {
  var message = findPrivatePhotoMessage(messageId);
  if (!message) return;
  if (message.status === "destroyed") {
    showToast("Content destroyed");
    return;
  }

  updateState({
    activePrivatePhotoMessageId: messageId,
    activePrivateContentType: getPrivateContentType(message),
    selectedPhotoId: (message.photoIds || [])[0] || null,
    photoUnlockStatus: "unlocked",
    privateContentStatus: "unlocked_countdown",
    activePhotoUnlockSheet: {
      visible: true,
      messageId: messageId,
      unlockMode: "preview"
    },
    bottomSheetStatus: "photo_unlock",
    paywallStatus: "photo_unlock"
  });
}

/* ========== Emoji Picker ========== */

var emojiList = [
  "😀","😂","🤣","😍","🥰","😘","😋","🤔","😅","😊",
  "🙄","😭","😤","🥺","🤗","👍","👎","❤️","🔥","🎉",
  "💯","✨","🙏","💪","🌟","😎","🤩","😜","🫶","👋",
  "💋","🌹","🍕","☕","🎂","🏖️","✈️","💃","🕺","🎵"
];

function toggleEmojiPanel() {
  prototypeState.chatEmojiPanelOpen = !prototypeState.chatEmojiPanelOpen;
  renderApp();
}

function insertEmojiToInput(emoji) {
  var input = document.querySelector(".composer-input");
  if (input) {
    input.value = (input.value || "") + emoji;
    input.focus();
  }
}

function sendEmojiDirect(emoji) {
  var threadId = prototypeState.activeChatThreadId;
  if (!threadId) return;

  var thread = legacyChatThreads.find(function(t) { return t.id === threadId; });
  if (!thread) return;

  var now = new Date();
  var time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");

  if (!chatMessageHistory[threadId]) chatMessageHistory[threadId] = [];
  chatMessageHistory[threadId].push({ type: "outgoing", text: emoji, time: time });

  updateState({ chatEmojiPanelOpen: false });
}

/* ========== Photo Picker ========== */

function openPhotoPicker() {
  updateState({
    bottomSheetStatus: "attachment_picker",
    attachmentPickerTab: "my_photo",
    selectedAttachmentIds: [],
    selectedPrivateMediaIds: []
  });
}

function switchAttachmentTab(tab) {
  updateState({
    attachmentPickerTab: tab,
    selectedAttachmentIds: [],
    selectedPrivateMediaIds: []
  });
}

function normalizePrivateContentMediaItem(item, source) {
  var mediaId = item.mediaId || item.id;
  var mediaType = item.type || item.mediaType || "photo";
  var normalizedType = mediaType === "video" ? "video" : "photo";
  var thumbUrl = item.thumbUrl || item.src || item.fullUrl || "";
  var fullUrl = item.fullUrl || item.src || item.thumbUrl || "";

  return Object.assign({}, item, {
    id: mediaId,
    mediaId: mediaId,
    type: normalizedType,
    mediaType: normalizedType,
    thumbUrl: thumbUrl,
    fullUrl: fullUrl,
    src: thumbUrl || fullUrl || item.src || "",
    source: source || item.source || "private_album"
  });
}

function normalizePrivateContentMediaItems(items, source) {
  return (Array.isArray(items) ? items : []).map(function(item) {
    return normalizePrivateContentMediaItem(item, source || item.source);
  });
}

function getAttachmentLibraryItems(source) {
  var library = typeof attachmentMediaLibrary !== "undefined" ? attachmentMediaLibrary : {};
  var key = source === "private_album" ? "privateAlbum" : "myPhoto";
  var items = Array.isArray(library[key]) ? library[key] : [];
  return items.map(function(item) {
    return normalizePrivateContentMediaItem(item, source);
  });
}

function getMyPhotoPickedItems() {
  var pickedItems = Array.isArray(prototypeState.myPhotoPickedItems)
    ? prototypeState.myPhotoPickedItems
    : [];
  return normalizePrivateContentMediaItems(pickedItems, "my_photo");
}

function getAttachmentItemsForActiveTab() {
  if (prototypeState.attachmentPickerTab === "private_album") {
    return getPrivateAlbumAttachmentItems();
  }

  return getMyPhotoPickedItems();
}

function getPrivateAlbumAttachmentItems() {
  var counts = getPrivateAlbumCounts();
  var baseItems = getAttachmentLibraryItems("private_album");
  var items = baseItems.slice();
  var photoBaseCount = baseItems.filter(function(item) { return item.mediaType !== "video"; }).length;
  var videoBaseCount = baseItems.filter(function(item) { return item.mediaType === "video"; }).length;
  var i;

  for (i = photoBaseCount; i < counts.photos; i += 1) {
    items.push(Object.assign({}, baseItems[i % Math.max(baseItems.length, 1)] || getAvatar("me"), {
      id: "private_photo_uploaded_" + (i + 1),
      mediaType: "photo",
      title: "Private Photo " + (i + 1),
      source: "private_album"
    }));
  }

  for (i = videoBaseCount; i < counts.videos; i += 1) {
    items.push(Object.assign({}, baseItems[i % Math.max(baseItems.length, 1)] || getAvatar("me"), {
      id: "private_video_uploaded_" + (i + 1),
      mediaType: "video",
      title: "Private Video " + (i + 1),
      source: "private_album"
    }));
  }

  return normalizePrivateContentMediaItems(items, "private_album");
}

function getSelectedPrivateMediaIds() {
  return prototypeState.selectedPrivateMediaIds || prototypeState.selectedAttachmentIds || [];
}

function toggleAttachmentSelection(itemId) {
  var selected = getSelectedPrivateMediaIds();
  var exists = selected.indexOf(itemId) >= 0;
  var nextSelected = exists
    ? selected.filter(function(id) { return id !== itemId; })
    : selected.concat(itemId);

  updateState({
    selectedAttachmentIds: nextSelected,
    selectedPrivateMediaIds: nextSelected
  });
}

function getPrivateContentGroupCountsFromItems(items, fallbackToDefault) {
  var safeItems = Array.isArray(items) ? items : [];
  var photosCount = safeItems.filter(function(item) { return item.mediaType !== "video"; }).length;
  var videosCount = safeItems.filter(function(item) { return item.mediaType === "video"; }).length;
  return {
    photosCount: photosCount || (fallbackToDefault ? 2 : 0),
    videosCount: videosCount || (fallbackToDefault ? 1 : 0)
  };
}

function findPrivateContentGroupMessageById(messageId) {
  var threadId = prototypeState.activeChatThreadId;
  var messages = threadId ? (chatMessageHistory[threadId] || []) : [];
  return messages.find(function(item) {
    return item.type === "sent_private_group" && item.id === messageId;
  }) || null;
}

function simulateSelectPrivateContentGroup() {
  updatePrivateContentGroup({
    id: "private_group_01",
    photosCount: 2,
    videosCount: 1,
    status: "draft",
    countdownSeconds: 600,
    isFreeForReceiver: true
  });
}

function appendPrivateContentGroupMessage(options) {
  var threadId = prototypeState.activeChatThreadId;
  if (!threadId) return false;

  var thread = legacyChatThreads.find(function(t) { return t.id === threadId; });
  var currentGroup = getPrivateContentGroup();
  var group = Object.assign({}, currentGroup, options || {});
  var mediaItems = normalizePrivateContentMediaItems(group.mediaItems || []);
  var selectedMediaIds = group.selectedMediaIds || mediaItems.map(function(item) {
    return item.mediaId || item.id;
  });
  var existing = findPrivateContentGroupMessage(threadId, group.id);

  if (existing) {
    updatePrivateContentGroup(syncPrivateContentGroupFromMessage(existing));
    showToast("该私密内容已发送，不能重复发送");
    return false;
  }

  var time = getCurrentTimeLabel();
	  var message = {
	    id: "sent_private_group_" + group.id,
	    type: "sent_private_group",
	    sender: "me",
	    groupId: group.id,
	    selectedMediaIds: selectedMediaIds,
	    photosCount: group.photosCount,
	    videosCount: group.videosCount,
	    mediaItems: mediaItems.map(function(item) {
	      return {
	        id: item.id,
	        mediaId: item.mediaId || item.id,
	        type: item.mediaType,
	        mediaType: item.mediaType,
	        title: item.title,
	        src: item.src,
	        thumbUrl: item.thumbUrl || item.src,
	        fullUrl: item.fullUrl || item.src,
	        fallback: item.fallback,
	        source: item.source
	      };
	    }),
    status: "sent_unopened",
    countdownSeconds: 600,
    isFreeForReceiver: true,
    time: time
  };

  if (!chatMessageHistory[threadId]) chatMessageHistory[threadId] = [];
  chatMessageHistory[threadId].push(message);

  if (thread) {
    thread.lastMessage = "Sent private content";
    thread.time = time;
    thread.unreadCount = 0;
  }

  updateState({
    privateContentGroup: Object.assign({}, group, {
      selectedMediaIds: selectedMediaIds,
      mediaItems: mediaItems,
      status: "sent_unopened"
    }),
    bottomSheetStatus: "none",
    selectedAttachmentIds: [],
    selectedPrivateMediaIds: [],
    attachmentPickerTab: "my_photo",
    activeModuleId: "chat_private_photo_unlock"
  });
  showToast("已发送私密内容");
  return true;
}

function appendChatMediaMessages(items) {
  if (!items || !items.length) return;
  var mediaItems = normalizePrivateContentMediaItems(items);
  var selectedMediaIds = mediaItems.map(function(item) {
    return item.mediaId || item.id;
  });
  var counts = getPrivateContentGroupCountsFromItems(mediaItems, false);
  var groupId = "private_group_" + selectedMediaIds.map(function(itemId) {
    return itemId;
  }).sort().join("_").replace(/[^a-zA-Z0-9_]/g, "_");
  appendPrivateContentGroupMessage({
    id: groupId,
    selectedMediaIds: selectedMediaIds,
    photosCount: counts.photosCount,
    videosCount: counts.videosCount,
    mediaItems: mediaItems,
    status: "sent_unopened"
  });
}

function sendPrivateContentGroup() {
  var group = getPrivateContentGroup();
  var selectedIds = group.selectedMediaIds || getSelectedPrivateMediaIds();
  var items = normalizePrivateContentMediaItems(group.mediaItems || []);

  if (!items.length && selectedIds.length) {
    items = getAttachmentItemsForActiveTab().filter(function(item) {
      return selectedIds.indexOf(item.id) >= 0;
    });
  }

  if (!items.length) {
    showToast("请先选择私密内容");
    return false;
  }

  var normalizedItems = normalizePrivateContentMediaItems(items);
  var normalizedIds = normalizedItems.map(function(item) {
    return item.mediaId || item.id;
  });
  var counts = getPrivateContentGroupCountsFromItems(normalizedItems, false);
  appendPrivateContentGroupMessage({
    id: group.id,
    selectedMediaIds: normalizedIds,
    photosCount: counts.photosCount,
    videosCount: counts.videosCount,
    mediaItems: normalizedItems,
    status: "sent_unopened"
  });
  return true;
}

function sendSelectedAttachmentMedia() {
  var selectedIds = getSelectedPrivateMediaIds();
  var items = getAttachmentItemsForActiveTab().filter(function(item) {
    return selectedIds.indexOf(item.id) >= 0;
  });

  if (!items.length) {
    showToast("Select at least one item");
    return;
  }

  appendChatMediaMessages(items);
}

function sendSelectedPrivateAlbumMedia() {
  sendSelectedAttachmentMedia();
}

function handlePrivateContentGroupClick(messageId) {
  var message = findPrivateContentGroupMessageById(messageId);
  if (!message) return;

  if (message.status === "destroyed") {
    showToast("Content destroyed");
    return;
  }

  message.status = "opened_countdown";
  var nextGroup = Object.assign({}, syncPrivateContentGroupFromMessage(message), {
    status: "opened_countdown"
  });
  updateState({
    privateContentGroup: nextGroup,
    activeModuleId: "chat_private_photo_unlock",
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
}

function simulatePrivateContentGroupViewed() {
  var group = getPrivateContentGroup();
  var message = findPrivateContentGroupMessage(prototypeState.activeChatThreadId, group.id);
  if (!message) {
    showToast("请先发送私密内容");
    return;
  }
  message.status = "opened_countdown";
  updateState({
    privateContentGroup: Object.assign({}, syncPrivateContentGroupFromMessage(message), { status: "opened_countdown" }),
    activeModuleId: "chat_private_photo_unlock"
  });
}

function simulatePrivateContentGroupDestroyed() {
  var group = getPrivateContentGroup();
  var message = findPrivateContentGroupMessage(prototypeState.activeChatThreadId, group.id);
  if (message) {
    message.status = "destroyed";
  }
  updateState({
    privateContentGroup: Object.assign({}, message ? syncPrivateContentGroupFromMessage(message) : group, { status: "destroyed" }),
    activeModuleId: "chat_private_photo_unlock",
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
}

function openSystemMediaPicker() {
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.onchange = function(e) {
    var files = Array.from(e.target.files || []);
    if (!files.length) { document.body.removeChild(fileInput); return; }

    var pending = files.length;
    var items = [];

	    function complete() {
	      pending -= 1;
	      if (pending > 0) return;
	      document.body.removeChild(fileInput);
	      var selectedIds = items.map(function(item) { return item.id; });
	      updateState({
	        myPhotoPickedItems: items,
	        selectedAttachmentIds: selectedIds,
	        selectedPrivateMediaIds: selectedIds,
	        attachmentPickerTab: "my_photo",
	        bottomSheetStatus: "attachment_picker"
	      });
	    }

	    files.forEach(function(file, index) {
	      var mediaType = file.type.indexOf("video/") === 0 ? "video" : "photo";
	      var itemId = "my_photo_file_" + Date.now() + "_" + index;
	      var reader = new FileReader();
	      reader.onload = function(ev) {
	        items.push(normalizePrivateContentMediaItem({
	          id: itemId,
	          mediaId: itemId,
	          type: mediaType,
	          mediaType: mediaType,
	          title: file.name || (mediaType === "video" ? "Video " : "Photo ") + (index + 1),
	          src: ev.target.result,
	          thumbUrl: ev.target.result,
	          fullUrl: ev.target.result,
	          source: "my_photo"
	        }, "my_photo"));
	        complete();
	      };
	      reader.onerror = function() {
	        items.push(normalizePrivateContentMediaItem({
	          id: itemId,
	          mediaId: itemId,
	          type: mediaType,
	          mediaType: mediaType,
	          title: file.name || (mediaType === "video" ? "Video " : "Photo ") + (index + 1),
	          source: "my_photo"
	        }, "my_photo"));
	        complete();
	      };
	      reader.readAsDataURL(file);
	    });
  };

  fileInput.click();
}

function showMeHint(label) {
  showToast(label);
}

function openVerifyIntro() {
  console.log("[route-debug] openMeSubPage called", "verify");
  goToPage("verifyIdentity");
}

function goToPage(page) {
  clearAllModuleEffects();
  const nextState = {
    currentPage: page,
    bottomSheetStatus: "none",
    modalStatus: "none"
  };

  if (page !== "chat") {
    nextState.chatViewStatus = "list";
    nextState.activeChatThreadId = null;
  }

  updateState(nextState);
}

function handleSwipePass() {
  handleEntitlementAction("pass", function() {
    updateState({
      passStatus: "passed",
      currentCardIndex: prototypeState.currentCardIndex + 1,
      toastStatus: "none"
    });
  });
}

function handleSwipeLike() {
  handleEntitlementAction("like", function() {
    var user = getCurrentUser();
    var actionState = prototypeState.activeSwipeActionState || "like";

    if (actionState === "like_match" && user) {
      handleSwipeMatch(user);
      return;
    }

    updateState({
      likeStatus: "liked",
      matchStatus: "none",
      matchModalStatus: "hidden",
      modalStatus: "none",
      currentCardIndex: prototypeState.currentCardIndex + 1,
      toastStatus: "none"
    });
  });
}

function handleSwipeMatch(user) {
  updateState({
    likeStatus: "mutual_match",
    matchStatus: "matched",
    activeChatUserId: user.id,
    modalStatus: "match_success",
    toastStatus: "none"
  });
}

function openMatchSuccessModal(user) {
  updateState({
    activeChatUserId: user ? user.id : null,
    modalStatus: "match_success"
  });
}

function getOrCreateMatchedChatThread(user) {
  if (!user) return legacyChatThreads[0] || null;

  var thread = legacyChatThreads.find(function(t) {
    return t.userId === user.id;
  });

  if (thread) return thread;

  thread = legacyChatThreads.find(function(t) {
    return String(t.name || "").toLowerCase() === String(user.name || "").toLowerCase();
  });

  if (thread) {
    thread.userId = user.id;
    return thread;
  }

  var avatar = getAvatar(user.id);
  thread = {
    id: "matched_chat_" + user.id,
    userId: user.id,
    name: user.name,
    age: user.age,
    avatar: (avatar && avatar.src) || user.avatar,
    initial: (user.name || "?").charAt(0),
    lastMessage: "You matched. Start the conversation.",
    time: "Now",
    unreadCount: 0,
    locked: false,
    online: !!user.online
  };

  legacyChatThreads.unshift(thread);
  chatMessageHistory[thread.id] = [
    { type: "divider", label: "Today" },
    { type: "incoming", text: "You matched. Say hi to start the conversation.", time: "Now" }
  ];

  return thread;
}

function startChatWithMatchedUser(userId) {
  var user = mockUsers.find(function(u) { return u.id === userId; });
  var thread = getOrCreateMatchedChatThread(user);
  updateState({
    modalStatus: "none",
    matchModalStatus: "hidden",
    currentPage: "chat",
    chatViewStatus: "detail",
    activeChatThreadId: thread ? thread.id : (legacyChatThreads[0] ? legacyChatThreads[0].id : null)
  });
}

function sendMatchMessageToThread(userId, text) {
  var message = String(text || "").trim();
  if (!message) return;

  var user = mockUsers.find(function(u) { return u.id === userId; });
  var thread = getOrCreateMatchedChatThread(user);
  if (!thread) return;

  var now = new Date();
  var time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");

  if (!chatMessageHistory[thread.id]) chatMessageHistory[thread.id] = [];
  chatMessageHistory[thread.id].push({ type: "outgoing", text: message, time: time });

  thread.lastMessage = message;
  thread.time = time;
  thread.unreadCount = 0;

  updateState({
    modalStatus: "none",
    matchModalStatus: "hidden",
    currentPage: "chat",
    chatViewStatus: "detail",
    activeChatThreadId: thread.id,
    chatEmojiPanelOpen: false
  });
}

function sendMatchModalMessage(userId) {
  var input = document.querySelector(".match-success-input");
  sendMatchMessageToThread(userId, input ? input.value : "");
}

function sendMatchQuickMessage(userId, message) {
  sendMatchMessageToThread(userId, message);
}

function continueSwipingAfterMatch() {
  updateState({
    modalStatus: "none",
    matchModalStatus: "hidden",
    currentCardIndex: prototypeState.currentCardIndex + 1,
    toastStatus: "none"
  });
}

/* Backward-compatible aliases */
function swipeLike() { handleSwipeLike(); }
function swipePass() { handleSwipePass(); }

function swipeSuperLike() {
  handleEntitlementAction("superLike", function() {
    updateState({
      superLikeStatus: "used",
      superLikeRemaining: prototypeState.subscriptionStatus === "active" ? Math.max(0, prototypeState.superLikeRemaining - 1) : 0,
      currentCardIndex: prototypeState.currentCardIndex + 1,
      toastStatus: "none"
    });
  });
}

function openProfile(userId) {
  console.log("[route-debug] openProfileDetail state update", userId);
  const index = mockUsers.findIndex(user => user.id === userId);
  clearAllModuleEffects();

  updateState({
    currentCardIndex: index >= 0 ? index : prototypeState.currentCardIndex,
    bottomSheetStatus: "profile_sheet",
    profileSheetUserId: userId,
    profileSheetPhotoIndex: 0
  });
}

function openSubscriptionPaywall() {
  console.log("[route-debug] openMeSubPage called", "subscribe");
  updateState({
    paywallStatus: "subscription_paywall",
    bottomSheetStatus: "subscription_paywall"
  });
}

function openChatSortSheet() {
  updateState({
    bottomSheetStatus: "chat_sort"
  });
}

function selectChatSort(key) {
  prototypeState.chatSortFilter = key;
  updateState({
    bottomSheetStatus: "none"
  });
}

function renderChatSortSheet() {
  var active = prototypeState.chatSortFilter || "latest";
  var options = [
    { key: "latest", label: "Latest", desc: "Most recent messages first" },
    { key: "unread", label: "Unread", desc: "Show unread conversations only" },
    { key: "favorites", label: "Your Favorites", desc: "Starred conversations" }
  ];

  return ''
    + '<div class="sheet-mask" onclick="closeSheet()"></div>'
    + '<section class="bottom-sheet chat-sort-sheet">'
    + '<div class="chat-sort-handle"></div>'
    + '<h2 class="chat-sort-title">Sort Messages</h2>'
    + '<div class="chat-sort-options">'
    + options.map(function(opt) {
        var isActive = opt.key === active;
        var checkMark = isActive ? '<span class="chat-sort-check">' + iconSvg("check") + '</span>' : '';
        return '<button class="chat-sort-option' + (isActive ? ' active' : '') + '" onclick="selectChatSort(\'' + opt.key + '\')">'
          + '<div class="chat-sort-option-text">'
          + '<span class="chat-sort-option-label">' + opt.label + '</span>'
          + '<span class="chat-sort-option-desc">' + opt.desc + '</span>'
          + '</div>'
          + checkMark
          + '</button>';
      }).join("")
    + '</div>'
    + '</section>';
}

function openCoinRecharge() {
  console.log("[route-debug] openMeSubPage called", "coins");
  updateState({
    paywallStatus: "coin_recharge",
    bottomSheetStatus: "coin_recharge"
  });
}

function openPhotoUnlock(photoId) {
  const photo = photoUnlockItems.find(item => item.id === photoId);

  updateState({
    selectedPhotoId: photoId,
    photoUnlockPrice: photo ? photo.price : prototypeState.photoUnlockPrice,
    bottomSheetStatus: "photo_unlock"
  });
}

function unlockPhoto() {
  handleEntitlementAction("photoUnlock", function() {
    if (prototypeState.balanceStatus !== "enough_balance") {
      openCoinRecharge();
      return;
    }

    updateState({
      photoUnlockStatus: "unlocked",
      coinBalance: prototypeState.coinBalance - prototypeState.photoUnlockPrice,
      bottomSheetStatus: "none",
      modalStatus: "unlock_success"
    });
  });
}

function openGiftPanel() {
  updateState({
    giftPanelStatus: "open",
    bottomSheetStatus: "gift_panel"
  });
}

function sendGift(giftId) {
  const gift = giftCatalog.find(item => item.id === giftId);
  if (!gift) return;

  if (prototypeState.coinBalance < gift.price) {
    updateState({
      selectedGiftId: giftId,
      giftSendStatus: "insufficient_balance",
      bottomSheetStatus: "coin_recharge"
    });
    showToast("Insufficient coins");
    return;
  }

  consumeEntitlement("gift");

  var nextState = {
    selectedGiftId: giftId,
    giftSendStatus: "success",
    coinBalance: prototypeState.coinBalance - gift.price,
    bottomSheetStatus: "none"
  };

  if (prototypeState.currentPage === "chat" && prototypeState.chatViewStatus === "detail" && prototypeState.activeChatThreadId) {
    var thread = legacyChatThreads.find(function(item) { return item.id === prototypeState.activeChatThreadId; });
    var time = getCurrentTimeLabel();
    if (!chatMessageHistory[prototypeState.activeChatThreadId]) {
      chatMessageHistory[prototypeState.activeChatThreadId] = [];
    }
    chatMessageHistory[prototypeState.activeChatThreadId].push({
      type: "outgoing",
      gift: {
        id: gift.id,
        name: gift.name,
        icon: gift.icon,
        price: gift.price
      },
      time: time
    });
    if (thread) {
      thread.lastMessage = "Sent a gift: " + gift.name;
      thread.time = time;
    }
    updateState(nextState);
    showToast("Gift sent");
    return;
  }

  nextState.modalStatus = "gift_success";
  updateState(nextState);
}

function openChatPaywall() {
  updateState({
    bottomSheetStatus: "chat_paywall",
    paywallStatus: "chat_paywall"
  });
}

function selectPackage(packageId) {
  updateState({
    selectedPackageId: packageId,
    paymentStatus: "package_selected"
  });
}

function completeSubscriptionPurchase() {
  updateState({
    subscriptionStatus: "active",
    activeEntitlementKey: "subscriber",
    paymentStatus: "success",
    bottomSheetStatus: "none",
    modalStatus: "payment_success"
  });
}

function completeCoinRecharge() {
  updateState({
    coinBalance: prototypeState.coinBalance + 7000,
    paymentStatus: "success",
    bottomSheetStatus: "none",
    modalStatus: "payment_success"
  });
}

function closeSheet() {
  updateState({
    bottomSheetStatus: "none",
    paywallStatus: "none",
    profileSheetUserId: null,
    profileSheetPhotoIndex: 0,
    activeEditProfileFilterKey: null,
    activePrivatePhotoMessageId: null,
    activePhotoUnlockSheet: {
      visible: false,
      messageId: null,
      unlockMode: null
    }
  });
}

function openProfileSheet(userId) {
  var user = mockUsers.find(function(u) { return u.id === userId; });
  if (!user) return;

  updateState({
    bottomSheetStatus: "profile_sheet",
    profileSheetUserId: userId,
    profileSheetPhotoIndex: 0
  });
}

function updateCarouselDOM(newIndex, totalPhotos) {
  var inner = document.querySelector('.profile-carousel-inner');
  if (inner) {
    inner.style.transform = 'translateX(-' + (newIndex * 100) + '%)';
  }
  var dots = document.querySelectorAll('.profile-carousel-dot');
  for (var i = 0; i < dots.length; i++) {
    if (i === newIndex) {
      dots[i].classList.add('active');
    } else {
      dots[i].classList.remove('active');
    }
  }
}

function advanceProfileCarousel() {
  var userId = prototypeState.profileSheetUserId;
  var photos = profileCarouselPhotos[userId] || [];
  if (photos.length === 0) return;
  var nextIndex = ((prototypeState.profileSheetPhotoIndex || 0) + 1) % photos.length;
  prototypeState.profileSheetPhotoIndex = nextIndex;
  syncDerivedState();
  updateCarouselDOM(nextIndex, photos.length);
}

function profileCarouselPrev() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
  var userId = prototypeState.profileSheetUserId;
  var photos = profileCarouselPhotos[userId] || [];
  if (photos.length === 0) return;
  var prevIndex = ((prototypeState.profileSheetPhotoIndex || 0) - 1 + photos.length) % photos.length;
  prototypeState.profileSheetPhotoIndex = prevIndex;
  syncDerivedState();
  updateCarouselDOM(prevIndex, photos.length);
  if (typeof setInterval === 'function') {
    carouselTimer = setInterval(advanceProfileCarousel, 2000);
  }
}

function profileCarouselNext() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
  var userId = prototypeState.profileSheetUserId;
  var photos = profileCarouselPhotos[userId] || [];
  if (photos.length === 0) return;
  var nextIndex = ((prototypeState.profileSheetPhotoIndex || 0) + 1) % photos.length;
  prototypeState.profileSheetPhotoIndex = nextIndex;
  syncDerivedState();
  updateCarouselDOM(nextIndex, photos.length);
  if (typeof setInterval === 'function') {
    carouselTimer = setInterval(advanceProfileCarousel, 2000);
  }
}

function profileSheetLike() {
  closeSheet();
  swipeLike();
}

function renderFilterConfirmSheet() {
  var genderLabel = prototypeState.discoverFilterGender === 'women' ? 'Women' : prototypeState.discoverFilterGender === 'men' ? 'Men' : 'Everyone';
  var ageLabel = prototypeState.discoverFilterAgeMin + ' – ' + prototypeState.discoverFilterAgeMax + ' years';
  var distLabel = prototypeState.discoverFilterDistance + ' km';

  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet filter-confirm-sheet">
      <h2>Confirm Filters</h2>
      <p class="sub-text">Your discovery feed will update based on these preferences.</p>

      <div class="filter-confirm-summary">
        <div class="filter-confirm-row">
          <span class="filter-confirm-label">Show me</span>
          <span class="filter-confirm-value">${genderLabel}</span>
        </div>
        <div class="filter-confirm-row">
          <span class="filter-confirm-label">Age Range</span>
          <span class="filter-confirm-value">${ageLabel}</span>
        </div>
        <div class="filter-confirm-row">
          <span class="filter-confirm-label">Maximum Distance</span>
          <span class="filter-confirm-value">${distLabel}</span>
        </div>
      </div>

      <div class="filter-confirm-actions">
        <button class="filter-confirm-cancel" onclick="closeSheet()">Cancel</button>
        <button class="filter-confirm-apply" onclick="applyDiscoverFilters()">Confirm</button>
      </div>
    </section>
  `;
}

function renderProfileSheet() {
  var userId = prototypeState.profileSheetUserId;
  var user = mockUsers.find(function(u) { return u.id === userId; }) || getCurrentUser();
  var photos = profileCarouselPhotos[userId] || [];
  var currentIndex = prototypeState.profileSheetPhotoIndex || 0;

  var imagesHtml = photos.map(function(photo, i) {
    return renderSafeImage({
      src: photo.src,
      fallback: photo.fallback,
      alt: user.name,
      className: ""
    });
  }).join("");

  var translateX = currentIndex * 100;

  var dotsHtml = photos.map(function(photo, i) {
    return '<span class="profile-carousel-dot' + (i === currentIndex ? ' active' : '') + '"></span>';
  }).join("");

  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet profile-sheet">
      <div class="profile-sheet-header">
        <button class="sheet-close" onclick="event.stopPropagation(); closeSheet()">×</button>
        <h2>${user.name}, ${user.age}</h2>
      </div>

      <div class="profile-carousel">
        <div class="profile-carousel-track">
          <div class="profile-carousel-inner" style="transform: translateX(-${translateX}%);">
            ${imagesHtml}
          </div>
        </div>
        <button class="profile-carousel-tap-left" onclick="event.stopPropagation(); profileCarouselPrev()"></button>
        <button class="profile-carousel-tap-right" onclick="event.stopPropagation(); profileCarouselNext()"></button>
        <div class="profile-carousel-dots">
          ${dotsHtml}
        </div>
      </div>

      <div class="profile-sheet-body">
        <h3 class="profile-section-title">Basic Info</h3>
        <p class="profile-location">${user.city}, ${user.country} · ${user.distance}</p>
        <p class="profile-status">${user.online ? "Online now" : "Recently active"} ${user.verified ? "· Verified" : ""}</p>

        <h3 class="profile-section-title">Interests</h3>
        <div class="profile-sheet-interests">
          ${user.interests.map(function(item) { return '<span>' + item + '</span>'; }).join("")}
        </div>

        <h3 class="profile-section-title">About</h3>
        <p class="profile-bio">${user.bio}</p>

        <h3 class="profile-section-title">Lifestyle</h3>
        <p class="profile-bio">${user.lifestyle || ""}</p>
      </div>

      <div class="profile-sheet-actions">
        <button class="profile-sheet-pass" onclick="event.stopPropagation(); closeSheet()">${iconSvg("x")} Pass</button>
        <button class="profile-sheet-like" onclick="event.stopPropagation(); profileSheetLike()">${iconSvg("heart")} Like</button>
      </div>
    </section>
  `;
}

function closeModal() {
  updateState({
    modalStatus: "none",
    toastStatus: "none"
  });
}

/* ========== Safe entitlement overrides (compatible with new paywallPoints model) ========== */

function getEntitlementLimitSafe(segmentKey, actionKey) {
  if (typeof entitlementRules === "undefined") return null;
  var segment = entitlementRules[segmentKey];
  if (!segment) return null;
  var paywallPoints = segment.paywallPoints;
  if (!paywallPoints) return null;
  var point = paywallPoints[actionKey];
  if (!point) return null;
  var limits = point.limits;
  if (!limits) return null;
  return limits;
}

syncDerivedState = function() {
  if (prototypeState.subscriptionStatus === "active") {
    prototypeState.likesMePermissionStatus = "unlocked";
    prototypeState.dailySwipeRemaining = "unlimited";
    prototypeState.superLikeRemaining = Math.max(Number(prototypeState.superLikeRemaining) || 0, 5);
  }

  if (prototypeState.subscriptionStatus !== "active") {
    if (prototypeState.likesMePermissionStatus === "unlocked") {
      prototypeState.likesMePermissionStatus = "locked";
    }
  }

  var actionPrice = getCurrentActionPrice();

  if (prototypeState.coinBalance <= 0) {
    prototypeState.balanceStatus = "no_balance";
  } else if (prototypeState.coinBalance < actionPrice) {
    prototypeState.balanceStatus = "low_balance";
  } else {
    prototypeState.balanceStatus = "enough_balance";
  }

  var albumItemCount = (Number(prototypeState.privatePhotoCount) || 0) + (Number(prototypeState.privateVideoCount) || 0);
  if (albumItemCount <= 0) {
    prototypeState.privateAlbumStatus = "empty";
  } else if (prototypeState.privateAlbumStatus !== "empty") {
    prototypeState.privateAlbumStatus = "uploaded";
  }

  if (prototypeState.activeAnnotationPage !== prototypeState.currentPage) {
    prototypeState.activeAnnotationPage = prototypeState.currentPage;
    prototypeState.activeModuleId = null;
    prototypeState.activeAnnotationTab = "notes";
    prototypeState.activeModuleState = "default";
    prototypeState.annotationSelectorStatus = "idle";
  }

  /* ── Entitlement-derived state (new paywallPoints model) ── */
  var quotaMappings = [
    { actionKey: "like",         pointKey: "like_action",   quotaField: "likeQuotaRemaining",         counterField: "dailyLikeCount",        defaultQuota: 5 },
    { actionKey: "superLike",    pointKey: "like_action",   quotaField: "superLikeQuotaRemaining",    counterField: "dailySuperLikeCount",    defaultQuota: 0 },
    { actionKey: "pass",         pointKey: "swipe_limit",   quotaField: "passQuotaRemaining",         counterField: "dailyPassCount",         defaultQuota: 5 },
    { actionKey: "gift",         pointKey: "paid_gift",     quotaField: "giftQuotaRemaining",         counterField: "dailyGiftCount",         defaultQuota: 0 },
    { actionKey: "photoUnlock",  pointKey: "private_photo", quotaField: "photoUnlockQuotaRemaining",  counterField: "dailyPhotoUnlockCount",  defaultQuota: 0 },
    { actionKey: "chatMessage",  pointKey: "message_send",  quotaField: "messageQuotaRemaining",      counterField: "dailyMessageCount",      defaultQuota: 3 }
  ];

  /* Ensure pass counter fields exist */
  if (typeof prototypeState.dailyPassCount !== "number") prototypeState.dailyPassCount = 0;
  if (typeof prototypeState.passQuotaRemaining !== "number") prototypeState.passQuotaRemaining = 5;

  quotaMappings.forEach(function(m) {
    var limits = getEntitlementLimitSafe(prototypeState.activeEntitlementKey, m.pointKey);
    if (!limits) {
      prototypeState[m.quotaField] = m.defaultQuota;
      return;
    }
    var quota = limits.free;
    if (quota === "unlimited") {
      prototypeState[m.quotaField] = "unlimited";
      return;
    }
    if (typeof quota !== "number") {
      quota = m.defaultQuota;
    }
    var used = prototypeState[m.counterField] || 0;
    var remaining = Math.max(0, quota - used);
    prototypeState[m.quotaField] = remaining;
  });

  prototypeState.isLikeLimited = prototypeState.likeQuotaRemaining !== "unlimited" && prototypeState.likeQuotaRemaining <= 0;
  prototypeState.isSuperLikeLimited = prototypeState.superLikeQuotaRemaining !== "unlimited" && prototypeState.superLikeQuotaRemaining <= 0;
  prototypeState.isGiftLimited = prototypeState.giftQuotaRemaining !== "unlimited" && prototypeState.giftQuotaRemaining <= 0;
  prototypeState.isPhotoLimited = prototypeState.photoUnlockQuotaRemaining !== "unlimited" && prototypeState.photoUnlockQuotaRemaining <= 0;
  prototypeState.isMessageLimited = prototypeState.messageQuotaRemaining !== "unlimited" && prototypeState.messageQuotaRemaining <= 0;
  prototypeState.isSwipeLimited = prototypeState.passQuotaRemaining !== "unlimited" && prototypeState.passQuotaRemaining <= 0;

  var likesMeLimits = getEntitlementLimitSafe(prototypeState.activeEntitlementKey, "likes_me");
  if (likesMeLimits && likesMeLimits.free === "full_access") {
    prototypeState.isLikesMeLocked = false;
  } else {
    prototypeState.isLikesMeLocked = true;
  }
};

checkEntitlement = function(actionType) {
  var actionKeyMap = {
    like: "like_action",
    superLike: "like_action",
    pass: "swipe_limit",
    gift: "paid_gift",
    photoUnlock: "private_photo",
    chatMessage: "message_send",
    message_send: "message_send",
    likesMe: "likes_me"
  };

  var pointKey = actionKeyMap[actionType];
  if (!pointKey) {
    return { allowed: true, paywallType: null, quotaRemaining: null };
  }

  var limits = getEntitlementLimitSafe(prototypeState.activeEntitlementKey, pointKey);

  if (!limits) {
    return { allowed: true, paywallType: null, quotaRemaining: null };
  }

  if (limits.free === "unlimited") {
    return { allowed: true, paywallType: null, quotaRemaining: "unlimited" };
  }

  var limited = getEntitlementLimitedFlag(actionType);
  if (limited) {
    return { allowed: false, paywallType: "subscription_paywall", quotaRemaining: 0, reason: "quota_exhausted" };
  }

  var disp = getEntitlementQuotaDisplay(actionType);
  return { allowed: true, paywallType: null, quotaRemaining: disp.remaining };
};

consumeEntitlement = function(actionType) {
  var countMap = {
    like: "dailyLikeCount",
    superLike: "dailySuperLikeCount",
    pass: "dailyPassCount",
    gift: "dailyGiftCount",
    photoUnlock: "dailyPhotoUnlockCount",
    chatMessage: "dailyMessageCount",
    message_send: "dailyMessageCount"
  };
  var countKey = countMap[actionType];
  if (countKey) {
    prototypeState[countKey] = (prototypeState[countKey] || 0) + 1;
  }
  if ((actionType === "message_send" || actionType === "chatMessage") && prototypeState.usageCounters) {
    prototypeState.usageCounters.message_send = (prototypeState.usageCounters.message_send || 0) + 1;
  }
  /* Also bump usageCounters for swipe_limit */
  if (actionType === "pass" && prototypeState.usageCounters) {
    prototypeState.usageCounters.swipe_limit = (prototypeState.usageCounters.swipe_limit || 0) + 1;
  }
};

hydrateAnnotationEditorPrefs();
renderApp();
