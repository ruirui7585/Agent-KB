/**
 * HTML Visual Editor + Auto-Save + Vercel Auto-Deploy Runtime
 * Supports:
 * 1. Direct text editing (500ms debounce + blur auto-save), preserving child tags on mixed nodes
 * 2. Style & visibility tweaking (color, bg, font-size, padding, margin, radius, hide/restore)
 * 3. Free mouse drag positioning & sibling order up/down + z-index (including scaled iframes)
 * 4. Image replacement (click upload or drag-drop -> saves to assets/images/ relative path)
 * 5. Dual persistence: direct clean writeback to static .html + visual-edits.json for JS-rendered / multi-iframe prototypes
 * 6. Strict public read-only guard (disabled on non-local hostnames per COMMON_UI_RULES.md §10)
 */
(function () {
  "use strict";

  // 1. Public Read-Only Guard: Only run on local environments
  function isLocalEnvironment() {
    var proto = window.location.protocol;
    var host = window.location.hostname;
    if (proto === "file:") return true;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local")) {
      return true;
    }
    return false;
  }

  if (!isLocalEnvironment()) return;

  // Never mount duplicate editor instances inside iframes; parent window orchestrates same-origin iframes
  if (window.self !== window.top) return;

  if (window.__HTML_VISUAL_EDITOR_LOADED__) return;
  window.__HTML_VISUAL_EDITOR_LOADED__ = true;

  var CONFIG = Object.assign(
    {
      sourceUrl: "/__visual_editor/source",
      saveUrl: "/__visual_editor/save",
      editsUrl: "/__visual_editor/edits",
      savePatchUrl: "/__visual_editor/save-patch",
      uploadUrl: "/__visual_editor/upload-image",
      deployUrl: "/__visual_editor/deploy",
      deployStatusUrl: "/__visual_editor/deploy-status",
      deployConfigUrl: "/__visual_editor/deploy-config",
      daemonBaseUrl: "http://127.0.0.1:4199",
      debounceMs: 500,
      defaultActive: true,
      collapsed: false,
    },
    window.HTMLVisualEditorConfig || {}
  );

  var DYNAMIC_CONTAINER_IDS = new Set([
    "board",
    "phone",
    "app",
    "states",
    "scene-title",
    "scene-note",
    "caption",
    "run",
  ]);

  var docStates = new WeakMap();
  var boundDocs = new Set();
  var pendingStaticDocs = new Set();
  var touchedDynamicPaths = new Set();
  var origByScopeSelector = new Map();

  var state = {
    active: Boolean(CONFIG.defaultActive),
    dragMode: false,
    showHidden: false,
    collapsed: Boolean(CONFIG.collapsed),
    selectedEl: null,
    hoverEl: null,
    serverAvailable: false,
    autoDeployEnabled: true,
    hasVercelProject: true,
    projectHttpUrl: "",
    hasCrossOriginIframe: false,
    deployStatus: "idle",
    prodUrl: "",
    deployPollTimer: null,
    fileHandle: null,
    visualEdits: { version: "1.0", updatedAt: null, scopes: {} },
    dirtyDynamic: false,
    dirtySelected: false,
    lockAspectRatio: false,
    aspectRatio: 1,
    saveTimer: null,
    history: [],
    historyIndex: -1,
    suppressHistory: false,
    isDraggingElement: false,
    isResizingElement: false,
  };

  var STORAGE_KEY = "ve_autosave_draft::" + (window.location.href || window.location.pathname || "index.html");

  function isFileMode() {
    return window.location.protocol === "file:";
  }

  function buildApiUrl(endpoint) {
    var url = endpoint;
    if (isFileMode() && url.indexOf("http") !== 0) {
      url = CONFIG.daemonBaseUrl + url;
    }
    if (isFileMode()) {
      var sep = url.indexOf("?") === -1 ? "?" : "&";
      url += sep + "fileUrl=" + encodeURIComponent(window.location.href.split("#")[0]);
    }
    return url;
  }

  var bridgeSeq = 0;
  function apiFetch(endpoint, options) {
    var targetUrl = buildApiUrl(endpoint);
    var opts = options || {};
    if (window.__VE_EXTENSION_BRIDGE__) {
      return new Promise(function (resolve, reject) {
        var reqId = "ve_req_" + (++bridgeSeq) + "_" + Date.now();
        function onMsg(event) {
          if (event.source !== window || !event.data || !event.data.__veBridgeResponse || event.data.id !== reqId) return;
          window.removeEventListener("message", onMsg);
          if (event.data.error) {
            reject(new Error(event.data.error));
            return;
          }
          var textVal = event.data.text || "";
          resolve({
            ok: Boolean(event.data.ok),
            status: event.data.status || 200,
            text: function () { return Promise.resolve(textVal); },
            json: function () { return Promise.resolve(JSON.parse(textVal || "{}")); },
          });
        }
        window.addEventListener("message", onMsg);
        window.postMessage(
          {
            __veBridgeRequest: true,
            id: reqId,
            url: targetUrl,
            method: opts.method || "GET",
            headers: opts.headers || {},
            body: typeof opts.body === "string" ? opts.body : null,
            bodyBase64: opts.bodyBase64 || null,
          },
          "*"
        );
      });
    }
    return fetch(targetUrl, opts);
  }

  function isEditorOrAnnotationNode(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.id === "ve-editor-root" || (el.closest && el.closest("#ve-editor-root"))) return true;
    if (el.id === "ve-resize-overlay" || (el.closest && el.closest("#ve-resize-overlay"))) return true;
    if (el.id === "ve-runtime-style" || el.id === "ve-runtime-script" || el.id === "ve-resize-overlay-style") return true;
    if (
      el.closest &&
      (el.closest(".annotation-panel") ||
        el.closest(".pa-root") ||
        el.closest(".pa-panel") ||
        el.closest(".pa-popover") ||
        el.closest(".pa-marker") ||
        el.closest(".sa-panel") ||
        el.closest("[data-annotation-runtime]"))
    ) {
      return true;
    }
    var tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "html" || tag === "head" || tag === "script" || tag === "style" || tag === "link" || tag === "meta") {
      return true;
    }
    return false;
  }

  function getDocScale(doc) {
    var win = doc && doc.defaultView;
    if (!win || win === window || !win.frameElement) return 1;
    var fe = win.frameElement;
    var rect = fe.getBoundingClientRect();
    var w = fe.offsetWidth || parseFloat(window.getComputedStyle(fe).width) || rect.width;
    return w > 0 ? rect.width / w : 1;
  }

  function normalizePathname(rawPath) {
    var decoded = decodeURIComponent(String(rawPath || "/"));
    if (!decoded || decoded === "/") return "/index.html";
    return decoded.startsWith("/") ? decoded : "/" + decoded;
  }

  function getDocScope(doc) {
    var docWin = (doc && doc.defaultView) || window;
    var ds = docStates.get(doc);
    var pathname = (ds && ds.pathname) || normalizePathname(docWin.location.pathname);
    var activeTab = doc.querySelector("#states button.active[data-go]");
    var scene = activeTab
      ? activeTab.getAttribute("data-go")
      : new URLSearchParams(docWin.location.search).get("scene");
    if (scene) return pathname + "?scene=" + scene;
    return pathname;
  }

  function computeRelativeAssetPath(docPathname, rootRelativePath) {
    var cleanDoc = normalizePathname(docPathname).replace(/^\/+/, "");
    var docParts = cleanDoc.split("/");
    docParts.pop(); // directory parts of html file
    var targetParts = String(rootRelativePath || "").replace(/^\.?\/+/, "").split("/");
    while (docParts.length > 0 && targetParts.length > 0 && docParts[0] === targetParts[0]) {
      docParts.shift();
      targetParts.shift();
    }
    var ups = docParts.map(function () { return ".."; });
    var rel = ups.concat(targetParts).join("/");
    return rel.startsWith(".") ? rel : "./" + rel;
  }

  function getStructuralPath(el, rootBody) {
    var doc = el.ownerDocument || document;
    var body = rootBody || doc.body;
    if (!el || el === body || !body.contains(el)) return [];
    var path = [];
    var curr = el;
    while (curr && curr !== body && curr.parentElement) {
      var parent = curr.parentElement;
      var index = 0;
      var siblings = parent.children;
      for (var i = 0; i < siblings.length; i++) {
        var sib = siblings[i];
        if (parent === body && isEditorOrAnnotationNode(sib)) continue;
        if (sib === curr) {
          path.unshift(index);
          break;
        }
        index++;
      }
      curr = parent;
    }
    return path;
  }

  function resolveStructuralPath(doc, path) {
    if (!doc || !doc.body || !Array.isArray(path)) return null;
    var curr = doc.body;
    for (var i = 0; i < path.length; i++) {
      var targetIdx = path[i];
      var count = 0;
      var found = null;
      var children = curr.children;
      for (var j = 0; j < children.length; j++) {
        var child = children[j];
        if (curr === doc.body && isEditorOrAnnotationNode(child)) {
          continue;
        }
        if (count === targetIdx) {
          found = child;
          break;
        }
        count++;
      }
      if (!found) return null;
      curr = found;
    }
    return curr;
  }

  function buildStableSelector(el, doc) {
    if (!el || el.nodeType !== 1) return "";
    var body = doc.body;
    if (el.id && doc.querySelectorAll("#" + CSS.escape(el.id)).length === 1) {
      return "#" + CSS.escape(el.id);
    }
    var parts = [];
    var curr = el;
    while (curr && curr !== body && curr.parentElement) {
      if (curr.id && doc.querySelectorAll("#" + CSS.escape(curr.id)).length === 1) {
        parts.unshift("#" + CSS.escape(curr.id));
        break;
      }
      var parent = curr.parentElement;
      var tag = curr.tagName.toLowerCase();
      var classes = Array.from(curr.classList || []).filter(function (c) {
        return c.indexOf("ve-") !== 0 && c.indexOf("sa-") !== 0 && c !== "active";
      });
      var siblings = Array.from(parent.children).filter(function (s) {
        return !isEditorOrAnnotationNode(s);
      });
      var seg = tag;
      if (classes.length > 0) {
        var clsSel = tag + "." + classes.map(function (c) { return CSS.escape(c); }).join(".");
        var sameClsCount = siblings.filter(function (s) {
          return s.tagName === curr.tagName && classes.every(function (c) { return s.classList.contains(c); });
        }).length;
        if (sameClsCount === 1) {
          seg = clsSel;
        } else {
          var sameTagIdx = siblings.filter(function (s) { return s.tagName === curr.tagName; }).indexOf(curr) + 1;
          seg = clsSel + ":nth-of-type(" + sameTagIdx + ")";
        }
      } else {
        var sameTagSibs = siblings.filter(function (s) { return s.tagName === curr.tagName; });
        if (sameTagSibs.length > 1) {
          seg = tag + ":nth-of-type(" + (sameTagSibs.indexOf(curr) + 1) + ")";
        }
      }
      parts.unshift(seg);
      curr = parent;
    }
    if (parts.length > 0 && parts[0].charAt(0) !== "#") {
      parts.unshift("body");
    }
    return parts.join(" > ");
  }

  function isStaticElement(el, ds) {
    if (!el || !ds || !ds.rawSourceDoc) return false;
    var doc = el.ownerDocument;
    var curr = el;
    while (curr && curr !== doc.body) {
      if (curr.id && DYNAMIC_CONTAINER_IDS.has(curr.id)) return false;
      curr = curr.parentElement;
    }
    var path = getStructuralPath(el, doc.body);
    var srcEl = resolveStructuralPath(ds.rawSourceDoc, path);
    return Boolean(srcEl && srcEl.tagName === el.tagName);
  }

  function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    if (rgb.charAt(0) === "#") {
      return rgb.length === 4
        ? "#" + rgb[1] + rgb[1] + rgb[2] + rgb[2] + rgb[3] + rgb[3]
        : rgb.slice(0, 7);
    }
    var m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return "#000000";
    var r = ("0" + parseInt(m[1], 10).toString(16)).slice(-2);
    var g = ("0" + parseInt(m[2], 10).toString(16)).slice(-2);
    var b = ("0" + parseInt(m[3], 10).toString(16)).slice(-2);
    return "#" + r + g + b;
  }

  var NON_TEXT_TAGS = new Set([
    "img", "input", "textarea", "select", "iframe", "canvas", "video", "audio", "br", "hr",
    "svg", "g", "path", "circle", "ellipse", "rect", "polygon", "polyline", "line",
    "defs", "lineargradient", "radialgradient", "stop", "use", "symbol", "clippath", "mask"
  ]);

  function normalizeSelectableTarget(el) {
    if (!el || el.nodeType !== 1) return el;
    if (el.namespaceURI === "http://www.w3.org/2000/svg" && el.tagName.toLowerCase() !== "svg") {
      var svgRoot = el.closest ? el.closest("svg") : null;
      if (svgRoot) return svgRoot;
    }
    return el;
  }

  function hasDirectTextEditability(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName.toLowerCase();
    if (NON_TEXT_TAGS.has(tag) || el.namespaceURI === "http://www.w3.org/2000/svg") {
      return false;
    }
    if (el.children.length === 0) return true;
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim().length > 0) {
        return true;
      }
    }
    return false;
  }

  function getDirectTextNodesArray(el) {
    var vals = [];
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        vals.push(el.childNodes[i].nodeValue);
      }
    }
    return vals;
  }

  function getDirectText(el) {
    if (!el) return "";
    if (el.children.length === 0) return el.textContent || "";
    return getDirectTextNodesArray(el).join("");
  }

  function setDirectText(el, val) {
    if (!el) return;
    if (el.children.length === 0) {
      el.textContent = val;
      return;
    }
    var textNodes = [];
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) textNodes.push(el.childNodes[i]);
    }
    if (textNodes.length > 0) {
      textNodes[0].nodeValue = val;
      for (var j = 1; j < textNodes.length; j++) {
        textNodes[j].nodeValue = "";
      }
    } else {
      el.insertBefore(el.ownerDocument.createTextNode(val), el.firstChild);
    }
  }

  function getElementLabel(el) {
    if (!el) return "未选中元素";
    var tag = el.tagName.toLowerCase();
    var id = el.id ? "#" + el.id : "";
    var cls = "";
    if (el.classList && el.classList.length > 0) {
      cls = "." + Array.from(el.classList).slice(0, 2).join(".");
    }
    var prefix = el.ownerDocument !== document ? "[画面] " : "";
    return prefix + tag + id + cls;
  }

  function captureOrigIfNeeded(el, doc, scope, selector) {
    var key = scope + "::" + selector;
    if (origByScopeSelector.has(key)) return;
    origByScopeSelector.set(key, {
      doc: doc,
      scope: scope,
      selector: selector,
      text: el.children.length === 0 ? el.textContent : null,
      textNodes: el.children.length > 0 ? getDirectTextNodesArray(el) : null,
      styleAttr: el.getAttribute("style"),
      hidden: el.getAttribute("data-ve-hidden") === "true",
      tx: el.getAttribute("data-ve-tx"),
      ty: el.getAttribute("data-ve-ty"),
      scale: el.getAttribute("data-ve-scale"),
      src: el.tagName.toLowerCase() === "img" ? el.getAttribute("src") : null,
    });
  }

  function ensureScopeEdits(scope) {
    if (!state.visualEdits || typeof state.visualEdits !== "object") {
      state.visualEdits = { version: "1.0", updatedAt: null, scopes: {} };
    }
    if (!state.visualEdits.scopes) state.visualEdits.scopes = {};
    if (!state.visualEdits.scopes[scope]) {
      state.visualEdits.scopes[scope] = { patches: {}, ops: [], reorders: [] };
    }
    if (!Array.isArray(state.visualEdits.scopes[scope].ops)) {
      state.visualEdits.scopes[scope].ops = [];
    }
    return state.visualEdits.scopes[scope];
  }

  function applyElementTransform(el) {
    if (!el) return;
    var tx = parseFloat(el.getAttribute("data-ve-tx") || "0") || 0;
    var ty = parseFloat(el.getAttribute("data-ve-ty") || "0") || 0;
    var sc = parseFloat(el.getAttribute("data-ve-scale") || "1");
    if (isNaN(sc) || sc <= 0) sc = 1;
    var parts = [];
    if (tx !== 0 || ty !== 0) parts.push("translate(" + tx + "px, " + ty + "px)");
    if (sc !== 1) parts.push("scale(" + sc + ")");
    el.style.transform = parts.join(" ");
  }

  var PATCH_STYLE_PROPS = [
    "width",
    "height",
    "color",
    "backgroundColor",
    "fontSize",
    "fontWeight",
    "textAlign",
    "display",
    "justifyContent",
    "alignItems",
    "borderRadius",
    "padding",
    "margin",
    "position",
    "zIndex",
    "transform",
    "transformOrigin",
    "backgroundImage",
    "backgroundSize",
    "backgroundPosition",
  ];

  // Sync an edited element either to static rawSourceDoc OR to dynamic visualEdits
  function syncElementChange(liveEl) {
    if (!liveEl || !liveEl.ownerDocument) return;
    var doc = liveEl.ownerDocument;
    var ds = docStates.get(doc);

    if (ds && isStaticElement(liveEl, ds)) {
      var path = getStructuralPath(liveEl, doc.body);
      var srcEl = resolveStructuralPath(ds.rawSourceDoc, path);
      if (!srcEl) return;

      var liveStyle = liveEl.getAttribute("style");
      if (liveStyle && liveStyle.trim()) {
        srcEl.setAttribute("style", liveStyle);
      } else {
        srcEl.removeAttribute("style");
      }

      if (liveEl.hasAttribute("data-ve-hidden")) {
        srcEl.setAttribute("data-ve-hidden", "true");
        srcEl.style.display = "none";
      } else {
        srcEl.removeAttribute("data-ve-hidden");
      }

      ["data-ve-tx", "data-ve-ty", "data-ve-scale"].forEach(function (attr) {
        if (liveEl.hasAttribute(attr)) {
          srcEl.setAttribute(attr, liveEl.getAttribute(attr));
        } else {
          srcEl.removeAttribute(attr);
        }
      });

      if (liveEl.tagName.toLowerCase() === "img") {
        if (liveEl.getAttribute("src")) srcEl.setAttribute("src", liveEl.getAttribute("src"));
        if (liveEl.getAttribute("alt") != null) srcEl.setAttribute("alt", liveEl.getAttribute("alt"));
      }

      if (liveEl.children.length === 0) {
        srcEl.textContent = liveEl.textContent;
      } else if (hasDirectTextEditability(liveEl)) {
        setDirectText(srcEl, getDirectText(liveEl));
      }

      pendingStaticDocs.add(doc);
      return;
    }

    // Dynamic JS-rendered element -> upsert patch into state.visualEdits
    var scope = getDocScope(doc);
    var selector = buildStableSelector(liveEl, doc);
    if (!selector) return;

    captureOrigIfNeeded(liveEl, doc, scope, selector);
    var scopeEdits = ensureScopeEdits(scope);
    var patch = scopeEdits.patches[selector] || {};

    if (hasDirectTextEditability(liveEl)) {
      if (liveEl.children.length === 0) {
        patch.text = liveEl.textContent;
        delete patch.textNodes;
      } else {
        patch.textNodes = getDirectTextNodesArray(liveEl);
        delete patch.text;
      }
    }

    var styleObj = {};
    PATCH_STYLE_PROPS.forEach(function (prop) {
      if (liveEl.style[prop]) styleObj[prop] = liveEl.style[prop];
    });
    if (Object.keys(styleObj).length > 0) {
      patch.style = styleObj;
    } else {
      delete patch.style;
    }

    if (liveEl.getAttribute("data-ve-hidden") === "true") {
      patch.hidden = true;
    } else if (patch.hidden) {
      patch.hidden = false;
    }

    if (liveEl.hasAttribute("data-ve-tx") || liveEl.hasAttribute("data-ve-ty")) {
      patch.tx = liveEl.getAttribute("data-ve-tx") || "0";
      patch.ty = liveEl.getAttribute("data-ve-ty") || "0";
    } else {
      delete patch.tx;
      delete patch.ty;
    }

    if (liveEl.hasAttribute("data-ve-scale")) {
      patch.scale = liveEl.getAttribute("data-ve-scale");
    } else {
      delete patch.scale;
    }

    if (liveEl.tagName.toLowerCase() === "img" && liveEl.getAttribute("src")) {
      patch.imageSrc = liveEl.getAttribute("src");
    } else if (liveEl.hasAttribute("data-ve-image-src")) {
      patch.imageSrc = liveEl.getAttribute("data-ve-image-src");
    }

    scopeEdits.patches[selector] = patch;
    state.dirtyDynamic = true;
    touchedDynamicPaths.add(ds ? ds.pathname : normalizePathname(doc.defaultView.location.pathname));
  }

  function cleanDocumentTree(doc) {
    var transientSelectors = [
      "#ve-editor-root",
      "#ve-resize-overlay",
      "#ve-resize-overlay-style",
      "#ve-runtime-style",
      "#ve-runtime-script",
      "script[data-ve-injected]",
      "link[data-ve-injected]",
    ];
    transientSelectors.forEach(function (sel) {
      doc.querySelectorAll(sel).forEach(function (n) {
        n.remove();
      });
    });

    var transientAttrs = [
      "data-ve-hover",
      "data-ve-selected",
      "data-ve-mode",
      "data-ve-drag",
      "data-ve-show-hidden",
      "contenteditable",
      "spellcheck",
    ];
    doc.querySelectorAll("*").forEach(function (el) {
      transientAttrs.forEach(function (attr) {
        el.removeAttribute(attr);
      });
      Array.from(el.attributes || []).forEach(function (attr) {
        if (attr.name.indexOf("data-ve-op-") === 0 || attr.name.indexOf("data-ve-reordered-") === 0) {
          el.removeAttribute(attr.name);
        }
      });
      if (el.getAttribute("style") === "") {
        el.removeAttribute("style");
      }
    });
  }

  function serializeCleanHTML(doc) {
    var targetDocRef = doc || document;
    var ds = docStates.get(targetDocRef);
    var targetDoc = ds && ds.rawSourceDoc ? ds.rawSourceDoc.cloneNode(true) : targetDocRef.cloneNode(true);
    cleanDocumentTree(targetDoc);
    var doctype = (ds && ds.rawDoctype) || "<!DOCTYPE html>";
    var htmlStr = targetDoc.documentElement ? targetDoc.documentElement.outerHTML : "";
    return doctype + "\n" + htmlStr + "\n";
  }

  function pushHistorySnapshot() {
    if (state.suppressHistory) return;
    var snap = {
      topHtml: serializeCleanHTML(document),
      visualEdits: JSON.stringify(state.visualEdits || { version: "1.0", scopes: {} }),
    };
    var prev = state.historyIndex >= 0 ? state.history[state.historyIndex] : null;
    if (prev && prev.topHtml === snap.topHtml && prev.visualEdits === snap.visualEdits) return;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snap);
    if (state.history.length > 40) {
      state.history.shift();
    } else {
      state.historyIndex++;
    }
    updateUndoRedoButtons();
  }

  function setSaveStatus(type, text) {
    var el = document.getElementById("ve-status-text");
    if (!el) return;
    el.className = "ve-status-text " + (type ? "ve-" + type : "");
    el.textContent = text;
  }

  function formatTime(isoStr) {
    var d = isoStr ? new Date(isoStr) : new Date();
    var hh = ("0" + d.getHours()).slice(-2);
    var mm = ("0" + d.getMinutes()).slice(-2);
    var ss = ("0" + d.getSeconds()).slice(-2);
    return hh + ":" + mm + ":" + ss;
  }

  function applyDeployStateToUI(deploy) {
    if (!deploy) return;
    if (typeof deploy.enabled === "boolean") state.autoDeployEnabled = deploy.enabled;
    if (typeof deploy.hasVercelProject === "boolean") state.hasVercelProject = deploy.hasVercelProject;
    if (deploy.status) state.deployStatus = deploy.status;
    state.prodUrl = deploy.prodUrl || "";

    var bar = document.getElementById("ve-deploy-bar");
    var textEl = document.getElementById("ve-deploy-text");
    var linkEl = document.getElementById("ve-deploy-link");
    var toggleBtn = document.getElementById("ve-toggle-autodeploy");
    if (!bar || !textEl) return;

    if (toggleBtn) {
      toggleBtn.textContent = state.autoDeployEnabled ? "自动发布: 开" : "自动发布: 关";
    }

    var hidePrematureLink = deploy.status === "deploying" && !deploy.lastDeployedAt;
    if (state.prodUrl && !hidePrematureLink && linkEl) {
      linkEl.href = state.prodUrl;
      linkEl.style.display = "inline";
    } else if (linkEl) {
      linkEl.style.display = "none";
    }

    if (!state.hasVercelProject && !state.autoDeployEnabled && deploy.status === "idle") {
      textEl.textContent = "☁️ 未关联 Vercel（点「🚀 立即同步公网」首次发布）";
      stopDeployStatusPolling();
      return;
    }

    if (!state.autoDeployEnabled && deploy.status === "idle") {
      textEl.textContent = "☁️ Vercel 自动发布已关闭";
      stopDeployStatusPolling();
      return;
    }

    if (deploy.status === "scheduled") {
      textEl.textContent = "⏳ 停顿 6s 后自动部署至 Vercel 公网...";
      startDeployStatusPolling();
    } else if (deploy.status === "deploying") {
      textEl.textContent = "🚀 正在自动部署到 Vercel 公网...";
      startDeployStatusPolling();
    } else if (deploy.status === "deployed") {
      textEl.textContent = "🌐 已同步 Vercel 公网 ✓ (" + formatTime(deploy.lastDeployedAt) + ")";
      stopDeployStatusPolling();
    } else if (deploy.status === "error") {
      textEl.textContent = "⚠️ 公网部署异常: " + (deploy.lastError || "请检查 Vercel 登录状态");
      stopDeployStatusPolling();
    } else {
      textEl.textContent = "☁️ 改完自动同步 Vercel 公网 (已开启)";
      stopDeployStatusPolling();
    }
  }

  function startDeployStatusPolling() {
    if (state.deployPollTimer || !state.serverAvailable) return;
    state.deployPollTimer = setInterval(async function () {
      try {
        var res = await apiFetch(CONFIG.deployStatusUrl, { cache: "no-store" });
        if (res.ok) {
          var data = await res.json();
          applyDeployStateToUI(data);
        }
      } catch (e) {
        // ignore transient poll error
      }
    }, 1500);
  }

  function stopDeployStatusPolling() {
    if (state.deployPollTimer) {
      clearInterval(state.deployPollTimer);
      state.deployPollTimer = null;
    }
  }

  async function triggerManualDeployNow() {
    await performSaveNow("pre-manual-deploy");
    if (!state.serverAvailable) {
      setSaveStatus("error", "未连接本地服务，无法调用 Vercel CLI");
      return;
    }
    try {
      var res = await apiFetch(CONFIG.deployUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isFileMode() ? { fileUrl: window.location.href.split("#")[0] } : {}),
      });
      if (res.ok) {
        var data = await res.json();
        applyDeployStateToUI(data);
      }
    } catch (err) {
      setSaveStatus("error", "触发部署失败: " + err.message);
    }
  }

  async function toggleAutoDeployConfig() {
    var nextVal = !state.autoDeployEnabled;
    state.autoDeployEnabled = nextVal;
    if (!state.serverAvailable) return;
    try {
      var res = await apiFetch(CONFIG.deployConfigUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: nextVal,
          fileUrl: isFileMode() ? window.location.href.split("#")[0] : undefined,
        }),
      });
      if (res.ok) {
        var data = await res.json();
        applyDeployStateToUI(data);
      }
    } catch (e) {
      // ignore
    }
  }

  async function performSaveNow(reason) {
    if (state.saveTimer) {
      clearTimeout(state.saveTimer);
      state.saveTimer = null;
    }
    if (state.selectedEl && state.dirtySelected) {
      syncElementChange(state.selectedEl);
      state.dirtySelected = false;
    }
    var explicitReason =
      reason === "manual-button" ||
      reason === "pre-manual-deploy" ||
      reason === "shortcut-save" ||
      reason === "bind-file" ||
      reason === "undo-redo";
    if (!explicitReason && pendingStaticDocs.size === 0 && !state.dirtyDynamic) {
      return false;
    }

    var cleanTopHtml = serializeCleanHTML(document);
    pushHistorySnapshot();

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          updatedAt: new Date().toISOString(),
          pathname: window.location.pathname,
          html: cleanTopHtml,
          edits: state.visualEdits,
        })
      );
    } catch (e) {
      // ignore storage quota errors
    }

    setSaveStatus("saving", "正在自动保存...");

    if (state.serverAvailable) {
      try {
        var latestDeploy = null;

        // If neither static nor dynamic flagged (e.g. manual save button), still save top-level HTML
        if (pendingStaticDocs.size === 0 && !state.dirtyDynamic) {
          pendingStaticDocs.add(document);
        }

        // 1. Persist any modified static HTML documents
        var docsToSave = Array.from(pendingStaticDocs);
        for (var i = 0; i < docsToSave.length; i++) {
          var targetDoc = docsToSave[i];
          var ds = docStates.get(targetDoc);
          var docPath = ds ? ds.pathname : normalizePathname(window.location.pathname);
          var htmlStr = serializeCleanHTML(targetDoc);
          var res = await apiFetch(CONFIG.saveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: docPath,
              fileUrl: isFileMode() ? window.location.href.split("#")[0] : undefined,
              html: htmlStr,
              reason: reason || "auto",
            }),
          });
          var data = await res.json();
          if (!res.ok || !data || !data.ok) {
            throw new Error((data && data.error) || "保存接口返回错误");
          }
          if (data.deploy) latestDeploy = data.deploy;
        }
        pendingStaticDocs.clear();

        // 2. Persist dynamic JS-rendered / multi-iframe patches
        if (state.dirtyDynamic) {
          var patchRes = await apiFetch(CONFIG.savePatchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              edits: state.visualEdits,
              htmlPaths: Array.from(touchedDynamicPaths),
              fileUrl: isFileMode() ? window.location.href.split("#")[0] : undefined,
              reason: reason || "auto-patch",
            }),
          });
          var patchData = await patchRes.json();
          if (!patchRes.ok || !patchData || !patchData.ok) {
            throw new Error((patchData && patchData.error) || "保存动态补丁失败");
          }
          state.dirtyDynamic = false;
          if (patchData.deploy) latestDeploy = patchData.deploy;
        }

        setSaveStatus("saved", "已自动保存 ✓ (" + formatTime() + ")");
        if (latestDeploy) applyDeployStateToUI(latestDeploy);
        return true;
      } catch (err) {
        setSaveStatus("error", "服务保存失败: " + err.message);
        var deployTextEl = document.getElementById("ve-deploy-text");
        if (deployTextEl) {
          deployTextEl.textContent = "⚠️ 本地服务连接中断，未触发公网同步（请刷新或重试）";
        }
        stopDeployStatusPolling();
        return false;
      }
    }

    if (state.fileHandle) {
      try {
        var writable = await state.fileHandle.createWritable();
        await writable.write(cleanTopHtml);
        await writable.close();
        setSaveStatus("saved", "已自动写回本地文件 ✓ (" + formatTime() + ")");
        return true;
      } catch (err) {
        setSaveStatus("error", "文件写入失败，请重新点绑定文件");
        return false;
      }
    }

    setSaveStatus("saved", "已自动暂存 (点「绑定本地文件」可直写磁盘)");
    return false;
  }

  function scheduleAutoSave(reason) {
    if (state.selectedEl) {
      state.dirtySelected = true;
      syncElementChange(state.selectedEl);
    }
    setSaveStatus("saving", "编辑中 (0.5s 后自动保存)...");
    if (state.saveTimer) clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(function () {
      performSaveNow(reason || "debounce");
    }, CONFIG.debounceMs);
  }

  async function bindLocalHtmlFile() {
    if (!window.showSaveFilePicker) {
      alert("当前浏览器不支持直接绑定本地文件，请使用「导出 HTML」或通过 visual-edit-server 启动。");
      return;
    }
    try {
      var suggestedName = (window.location.pathname.split("/").pop() || "index.html").replace(/[^a-zA-Z0-9._-]/g, "_");
      state.fileHandle = await window.showSaveFilePicker({
        suggestedName: suggestedName || "index.html",
        types: [{ description: "HTML 文件", accept: { "text/html": [".html", ".htm"] } }],
      });
      await performSaveNow("bind-file");
    } catch (err) {
      if (err && err.name !== "AbortError") {
        setSaveStatus("error", "绑定文件取消或失败");
      }
    }
  }

  function exportCleanHtmlDownload() {
    if (state.selectedEl) syncElementChange(state.selectedEl);
    var cleanHtml = serializeCleanHTML(document);
    var blob = new Blob([cleanHtml], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var fileName = window.location.pathname.split("/").pop() || "index.html";
    if (!fileName.endsWith(".html") && !fileName.endsWith(".htm")) fileName = "index.html";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setSaveStatus("saved", "已导出 HTML 文件 ✓");
  }

  function updateHiddenCountUI() {
    var count = 0;
    boundDocs.forEach(function (doc) {
      if (!doc.defaultView || doc.defaultView.closed) return;
      count += doc.querySelectorAll("*[data-ve-hidden='true']").length;
    });
    var btn = document.getElementById("ve-toggle-show-hidden");
    if (btn) {
      btn.textContent = (state.showHidden ? "隐藏已屏蔽项" : "显示已隐藏项") + " (" + count + ")";
      btn.classList.toggle("ve-btn-active", state.showHidden);
    }
  }

  function updateUndoRedoButtons() {
    var undoBtn = document.getElementById("ve-btn-undo");
    var redoBtn = document.getElementById("ve-btn-redo");
    if (undoBtn) undoBtn.disabled = state.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = state.historyIndex >= state.history.length - 1;
  }

  function syncModeAttrsToAllDocs() {
    boundDocs.forEach(function (doc) {
      if (!doc.documentElement) return;
      doc.documentElement.setAttribute("data-ve-mode", state.active ? "on" : "off");
      doc.documentElement.setAttribute("data-ve-drag", state.dragMode ? "on" : "off");
      doc.documentElement.setAttribute("data-ve-show-hidden", state.showHidden ? "on" : "off");
    });
    updateResizeOverlay();
  }

  var OVERLAY_STYLE_TEXT = [
    "#ve-resize-overlay{position:fixed!important;pointer-events:none!important;z-index:2147483635!important;border:1.5px solid #10b981!important;box-sizing:border-box!important;display:none;}",
    "#ve-resize-overlay.ve-resize-visible{display:block!important;}",
    "#ve-resize-overlay .ve-resize-handle{position:absolute!important;width:9px!important;height:9px!important;background:#fff!important;border:1.5px solid #10b981!important;border-radius:2px!important;box-shadow:0 1px 3px rgba(0,0,0,.35)!important;pointer-events:auto!important;box-sizing:border-box!important;}",
    "#ve-resize-overlay .ve-rh-nw{top:-5px!important;left:-5px!important;cursor:nwse-resize!important;}",
    "#ve-resize-overlay .ve-rh-n{top:-5px!important;left:50%!important;transform:translateX(-50%)!important;cursor:ns-resize!important;}",
    "#ve-resize-overlay .ve-rh-ne{top:-5px!important;right:-5px!important;cursor:nesw-resize!important;}",
    "#ve-resize-overlay .ve-rh-e{top:50%!important;right:-5px!important;transform:translateY(-50%)!important;cursor:ew-resize!important;}",
    "#ve-resize-overlay .ve-rh-se{bottom:-5px!important;right:-5px!important;cursor:nwse-resize!important;}",
    "#ve-resize-overlay .ve-rh-s{bottom:-5px!important;left:50%!important;transform:translateX(-50%)!important;cursor:ns-resize!important;}",
    "#ve-resize-overlay .ve-rh-sw{bottom:-5px!important;left:-5px!important;cursor:nesw-resize!important;}",
    "#ve-resize-overlay .ve-rh-w{top:50%!important;left:-5px!important;transform:translateY(-50%)!important;cursor:ew-resize!important;}",
  ].join("\n");

  var resizeEl = null;
  var resizeHandle = "";
  var resizeStartScreenX = 0;
  var resizeStartScreenY = 0;
  var resizeBaseW = 0;
  var resizeBaseH = 0;
  var resizeBaseTx = 0;
  var resizeBaseTy = 0;
  var resizeDocScale = 1;
  var resizeElScale = 1;
  var resizeExtraW = 0;
  var resizeExtraH = 0;
  var resizeDisplay = "";
  var resizeAspect = 1;

  function ensureResizeOverlayForDoc(doc) {
    if (!doc || !doc.body) return null;
    if (doc !== document && !doc.getElementById("ve-resize-overlay-style")) {
      var st = doc.createElement("style");
      st.id = "ve-resize-overlay-style";
      st.textContent = OVERLAY_STYLE_TEXT;
      (doc.head || doc.documentElement).appendChild(st);
    }
    var overlay = doc.getElementById("ve-resize-overlay");
    if (!overlay) {
      overlay = doc.createElement("div");
      overlay.id = "ve-resize-overlay";
      ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (dir) {
        var h = doc.createElement("div");
        h.className = "ve-resize-handle ve-rh-" + dir;
        h.setAttribute("data-ve-handle", dir);
        overlay.appendChild(h);
      });
      overlay.addEventListener(
        "mousedown",
        function (e) {
          var handleEl = e.target && e.target.closest ? e.target.closest(".ve-resize-handle") : null;
          if (!handleEl) return;
          e.preventDefault();
          e.stopPropagation();
          startResizeFromHandle(e, handleEl);
        },
        true
      );
      doc.body.appendChild(overlay);
    }
    return overlay;
  }

  function hideResizeOverlay(exceptDoc) {
    boundDocs.forEach(function (d) {
      if (exceptDoc && d === exceptDoc) return;
      var ov = d.getElementById && d.getElementById("ve-resize-overlay");
      if (ov) ov.classList.remove("ve-resize-visible");
    });
  }

  function updateResizeOverlay() {
    if (!state.active || !state.selectedEl || !state.selectedEl.ownerDocument) {
      hideResizeOverlay(null);
      return;
    }
    var el = state.selectedEl;
    if (el.getAttribute("data-ve-hidden") === "true" && !state.showHidden) {
      hideResizeOverlay(null);
      return;
    }
    var doc = el.ownerDocument;
    hideResizeOverlay(doc);
    var overlay = ensureResizeOverlayForDoc(doc);
    if (!overlay) return;
    var rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) {
      overlay.classList.remove("ve-resize-visible");
      return;
    }
    overlay.style.left = Math.round(rect.left) + "px";
    overlay.style.top = Math.round(rect.top) + "px";
    overlay.style.width = Math.max(8, Math.round(rect.width)) + "px";
    overlay.style.height = Math.max(8, Math.round(rect.height)) + "px";
    overlay.classList.add("ve-resize-visible");
  }

  function startResizeFromHandle(e, handleEl) {
    if (!state.active || !state.selectedEl) return;
    var el = state.selectedEl;
    var doc = el.ownerDocument;
    var win = doc.defaultView || window;
    var cs = win.getComputedStyle(el);
    var rect = el.getBoundingClientRect();

    resizeEl = el;
    resizeHandle = handleEl.getAttribute("data-ve-handle") || "se";
    resizeDocScale = getDocScale(doc);
    resizeElScale = parseFloat(el.getAttribute("data-ve-scale") || "1");
    if (isNaN(resizeElScale) || resizeElScale <= 0) resizeElScale = 1;

    // Inside an iframe, rect is already in iframe-local CSS px (only divide by el's own data-ve-scale)
    resizeBaseW = Math.max(12, rect.width / (resizeElScale || 1));
    resizeBaseH = Math.max(12, rect.height / (resizeElScale || 1));
    resizeAspect = resizeBaseW / (resizeBaseH || 1);
    state.aspectRatio = resizeAspect;
    resizeBaseTx = parseFloat(el.getAttribute("data-ve-tx") || "0") || 0;
    resizeBaseTy = parseFloat(el.getAttribute("data-ve-ty") || "0") || 0;
    resizeDisplay = cs.display;

    if (cs.boxSizing === "border-box") {
      resizeExtraW = 0;
      resizeExtraH = 0;
    } else {
      resizeExtraW =
        (parseFloat(cs.paddingLeft) || 0) +
        (parseFloat(cs.paddingRight) || 0) +
        (parseFloat(cs.borderLeftWidth) || 0) +
        (parseFloat(cs.borderRightWidth) || 0);
      resizeExtraH =
        (parseFloat(cs.paddingTop) || 0) +
        (parseFloat(cs.paddingBottom) || 0) +
        (parseFloat(cs.borderTopWidth) || 0) +
        (parseFloat(cs.borderBottomWidth) || 0);
    }

    resizeStartScreenX = e.screenX;
    resizeStartScreenY = e.screenY;
    state.isResizingElement = true;
  }

  function selectElement(el) {
    if (state.selectedEl && state.selectedEl !== el) {
      state.selectedEl.removeAttribute("data-ve-selected");
      state.selectedEl.removeAttribute("contenteditable");
      if (state.dirtySelected) {
        syncElementChange(state.selectedEl);
        state.dirtySelected = false;
      }
    }

    state.selectedEl = el;
    state.dirtySelected = false;
    if (!el) {
      populateInspectorUI(null);
      hideResizeOverlay(null);
      return;
    }

    el.setAttribute("data-ve-selected", "true");

    // Inline contenteditable on pure leaf text elements (mixed text+child elements edit cleanly via panel textarea)
    if (state.active && !state.dragMode && hasDirectTextEditability(el) && el.children.length === 0) {
      el.setAttribute("contenteditable", "plaintext-only");
      el.setAttribute("spellcheck", "false");
      try { el.focus({ preventScroll: true }); } catch (e) {}
    } else {
      el.removeAttribute("contenteditable");
    }

    populateInspectorUI(el);
    updateResizeOverlay();
  }

  function populateInspectorUI(el) {
    var tagBadge = document.getElementById("ve-selected-tag");
    var emptyHint = document.getElementById("ve-empty-hint");
    var inspectorWrap = document.getElementById("ve-inspector-controls");
    if (!tagBadge || !inspectorWrap) return;

    if (!el) {
      tagBadge.textContent = "未选中";
      emptyHint.style.display = "block";
      inspectorWrap.style.display = "none";
      return;
    }

    emptyHint.style.display = "none";
    inspectorWrap.style.display = "flex";
    tagBadge.textContent = getElementLabel(el);

    var doc = el.ownerDocument;
    var win = doc.defaultView || window;
    var cs = win.getComputedStyle(el);

    var textArea = document.getElementById("ve-prop-text");
    var textSection = document.getElementById("ve-section-text");
    if (hasDirectTextEditability(el)) {
      textSection.classList.remove("ve-hidden");
      textArea.value = getDirectText(el);
    } else {
      textSection.classList.add("ve-hidden");
      textArea.value = "";
    }

    document.getElementById("ve-prop-color-picker").value = rgbToHex(cs.color);
    document.getElementById("ve-prop-color-hex").value = rgbToHex(cs.color);

    var bgHex =
      cs.backgroundColor === "rgba(0, 0, 0, 0)" || cs.backgroundColor === "transparent"
        ? "#ffffff"
        : rgbToHex(cs.backgroundColor);
    document.getElementById("ve-prop-bg-picker").value = bgHex;
    document.getElementById("ve-prop-bg-hex").value =
      cs.backgroundColor === "rgba(0, 0, 0, 0)" || cs.backgroundColor === "transparent"
        ? "transparent"
        : bgHex;

    document.getElementById("ve-prop-fontsize").value = parseInt(cs.fontSize, 10) || 14;
    document.getElementById("ve-prop-padding").value = el.style.padding || cs.padding || "";
    document.getElementById("ve-prop-margin").value = el.style.margin || cs.margin || "";
    document.getElementById("ve-prop-radius").value = parseInt(cs.borderRadius, 10) || 0;

    // Typography quick buttons (Bold / Align / Vertical Center)
    var fwNum = parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400);
    var boldBtn = document.getElementById("ve-btn-bold");
    if (boldBtn) boldBtn.classList.toggle("ve-btn-active", fwNum >= 600);

    var ta = (el.style.textAlign || cs.textAlign || "").toLowerCase();
    var alignNorm = ta === "center" ? "center" : (ta === "right" || ta === "end" ? "right" : (ta === "left" || ta === "start" ? "left" : ""));
    var alignLeftBtn = document.getElementById("ve-btn-align-left");
    var alignCenterBtn = document.getElementById("ve-btn-align-center");
    var alignRightBtn = document.getElementById("ve-btn-align-right");
    if (alignLeftBtn) alignLeftBtn.classList.toggle("ve-btn-active", alignNorm === "left");
    if (alignCenterBtn) alignCenterBtn.classList.toggle("ve-btn-active", alignNorm === "center");
    if (alignRightBtn) alignRightBtn.classList.toggle("ve-btn-active", alignNorm === "right");

    var vcenterBtn = document.getElementById("ve-btn-vcenter");
    if (vcenterBtn) {
      var isColVC = cs.display.indexOf("flex") !== -1 && cs.flexDirection.indexOf("column") === 0;
      var isVCentered =
        cs.display.indexOf("flex") !== -1 &&
        (isColVC ? cs.justifyContent === "center" : cs.alignItems === "center");
      vcenterBtn.classList.toggle("ve-btn-active", isVCentered);
    }

    // Geometry W / H & Proportional Scale % (getBoundingClientRect inside iframe is already in iframe-local CSS px)
    var elScale = parseFloat(el.getAttribute("data-ve-scale") || "1");
    if (isNaN(elScale) || elScale <= 0) elScale = 1;
    var rect = el.getBoundingClientRect();
    var visualW = Math.max(0, Math.round(rect.width / (elScale || 1)));
    var visualH = Math.max(0, Math.round(rect.height / (elScale || 1)));
    if (visualW > 0 && visualH > 0) state.aspectRatio = visualW / visualH;

    var wInput = document.getElementById("ve-prop-width");
    var hInput = document.getElementById("ve-prop-height");
    var lockBtn = document.getElementById("ve-btn-lock-ratio");
    var scaleRange = document.getElementById("ve-prop-scale-range");
    var scaleNum = document.getElementById("ve-prop-scale-num");
    if (wInput) wInput.value = visualW;
    if (hInput) hInput.value = visualH;
    if (lockBtn) {
      lockBtn.classList.toggle("ve-btn-active", state.lockAspectRatio);
      lockBtn.textContent = state.lockAspectRatio ? "🔒 等比: 开" : "🔓 等比: 关";
    }
    var scalePct = Math.round(elScale * 100);
    if (scaleRange) scaleRange.value = Math.min(250, Math.max(25, scalePct));
    if (scaleNum) scaleNum.value = scalePct;

    var hideBtn = document.getElementById("ve-btn-hide-toggle");
    var isHidden = el.getAttribute("data-ve-hidden") === "true";
    hideBtn.textContent = isHidden ? "👁 恢复显示该元素" : "🙈 隐藏该元素";
    hideBtn.className = isHidden ? "ve-btn ve-btn-active" : "ve-btn ve-btn-danger";

    var isImg = el.tagName.toLowerCase() === "img";
    var currentSrc = isImg
      ? el.getAttribute("src") || ""
      : (cs.backgroundImage && cs.backgroundImage !== "none"
          ? (cs.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/) || [])[1] || ""
          : "");
    document.getElementById("ve-prop-img-src").value = currentSrc;
  }

  function moveSelectedSibling(direction) {
    var el = state.selectedEl;
    if (!el || !el.parentElement) return;
    var doc = el.ownerDocument;
    var ds = docStates.get(doc);

    if (ds && isStaticElement(el, ds)) {
      var path = getStructuralPath(el, doc.body);
      var srcEl = resolveStructuralPath(ds.rawSourceDoc, path);
      if (direction === "up") {
        var prev = el.previousElementSibling;
        while (prev && isEditorOrAnnotationNode(prev)) prev = prev.previousElementSibling;
        if (!prev) return;
        el.parentElement.insertBefore(el, prev);
        if (srcEl && srcEl.parentElement && srcEl.previousElementSibling) {
          srcEl.parentElement.insertBefore(srcEl, srcEl.previousElementSibling);
        }
      } else {
        var next = el.nextElementSibling;
        while (next && isEditorOrAnnotationNode(next)) next = next.nextElementSibling;
        if (!next) return;
        el.parentElement.insertBefore(next, el);
        if (srcEl && srcEl.parentElement && srcEl.nextElementSibling) {
          srcEl.parentElement.insertBefore(srcEl.nextElementSibling, srcEl);
        }
      }
      pendingStaticDocs.add(doc);
      updateResizeOverlay();
      performSaveNow("reorder-" + direction);
      return;
    }

    // Dynamic sibling reorder
    var targetSibling = null;
    if (direction === "up") {
      targetSibling = el.previousElementSibling;
      while (targetSibling && isEditorOrAnnotationNode(targetSibling)) targetSibling = targetSibling.previousElementSibling;
      if (!targetSibling) return;
    } else {
      targetSibling = el.nextElementSibling;
      while (targetSibling && isEditorOrAnnotationNode(targetSibling)) targetSibling = targetSibling.nextElementSibling;
      if (!targetSibling) return;
    }

    var scope = getDocScope(doc);
    var scopeEdits = ensureScopeEdits(scope);
    var oldSelEl = buildStableSelector(el, doc);
    var oldSelOther = buildStableSelector(targetSibling, doc);

    if (direction === "up") {
      el.parentElement.insertBefore(el, targetSibling);
    } else {
      el.parentElement.insertBefore(targetSibling, el);
    }

    var newSelEl = buildStableSelector(el, doc);
    var newSelOther = buildStableSelector(targetSibling, doc);

    // Remap any existing patches on swapped siblings so post-reorder patches match
    var oldElPatch = scopeEdits.patches[oldSelEl];
    var oldOtherPatch = scopeEdits.patches[oldSelOther];
    if (oldElPatch) delete scopeEdits.patches[oldSelEl];
    if (oldOtherPatch) delete scopeEdits.patches[oldSelOther];
    if (oldElPatch) scopeEdits.patches[newSelEl] = oldElPatch;
    if (oldOtherPatch) scopeEdits.patches[newSelOther] = oldOtherPatch;

    var reorderOpIdx = scopeEdits.ops.length;
    el.setAttribute("data-ve-op-" + reorderOpIdx, "1");
    el.setAttribute("data-ve-reordered-" + (scopeEdits.reorders.length), "1");
    scopeEdits.ops.push({ type: "reorder", selector: oldSelEl, direction: direction });
    scopeEdits.reorders.push({ selector: oldSelEl, direction: direction });
    state.dirtyDynamic = true;
    touchedDynamicPaths.add(ds ? ds.pathname : normalizePathname(doc.defaultView.location.pathname));
    updateResizeOverlay();
    performSaveNow("reorder-" + direction);
  }

  function assignUniqueCloneIds(rootNode, targetDoc, suffix, forcedMap) {
    if (!rootNode || !targetDoc) return {};
    var usedMap = forcedMap || {};
    var nodesWithId = [];
    if (rootNode.id) nodesWithId.push(rootNode);
    rootNode.querySelectorAll("[id]").forEach(function (n) { nodesWithId.push(n); });
    nodesWithId.forEach(function (n) {
      var oldId = n.id;
      if (usedMap[oldId]) {
        n.id = usedMap[oldId];
        return;
      }
      var candidate = oldId + "-" + suffix;
      var counter = 1;
      while (targetDoc.getElementById(candidate)) {
        counter += 1;
        candidate = oldId + "-" + suffix + "-" + counter;
      }
      usedMap[oldId] = candidate;
      n.id = candidate;
    });
    return usedMap;
  }

  function stripTransientAttrsFromClone(node) {
    if (!node || node.nodeType !== 1) return;
    var removeTransient = function (el) {
      el.removeAttribute("data-ve-selected");
      el.removeAttribute("data-ve-hover");
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
      Array.from(el.attributes || []).forEach(function (attr) {
        if (attr.name.indexOf("data-ve-op-") === 0 || attr.name.indexOf("data-ve-reordered-") === 0) {
          el.removeAttribute(attr.name);
        }
      });
    };
    removeTransient(node);
    if (node.querySelectorAll) {
      node.querySelectorAll("*").forEach(removeTransient);
    }
  }

  function duplicateSelectedElement() {
    var el = state.selectedEl;
    if (!el || !el.parentElement) return;
    var doc = el.ownerDocument;
    if (!doc || el === doc.body || el === doc.documentElement || isEditorOrAnnotationNode(el)) return;
    var ds = docStates.get(doc);

    if (ds && isStaticElement(el, ds)) {
      var path = getStructuralPath(el, doc.body);
      var srcEl = resolveStructuralPath(ds.rawSourceDoc, path);
      var staticSuffix = "copy-" + Date.now().toString(36).slice(-4);

      var liveClone = el.cloneNode(true);
      stripTransientAttrsFromClone(liveClone);
      var idMap = assignUniqueCloneIds(liveClone, doc, staticSuffix, null);
      el.parentElement.insertBefore(liveClone, el.nextElementSibling);

      if (srcEl && srcEl.parentElement) {
        var srcClone = srcEl.cloneNode(true);
        stripTransientAttrsFromClone(srcClone);
        assignUniqueCloneIds(srcClone, ds.rawSourceDoc, staticSuffix, idMap);
        srcEl.parentElement.insertBefore(srcClone, srcEl.nextElementSibling);
      }

      syncElementChange(liveClone);
      pendingStaticDocs.add(doc);
      selectElement(liveClone);
      updateHiddenCountUI();
      performSaveNow("duplicate");
      return;
    }

    // Dynamic JS-rendered element duplicate
    var scope = getDocScope(doc);
    var scopeEdits = ensureScopeEdits(scope);
    var parent = el.parentElement;
    var oldSelEl = buildStableSelector(el, doc);
    if (!oldSelEl) return;

    var siblingsBefore = Array.from(parent.children).filter(function (s) {
      return !isEditorOrAnnotationNode(s);
    });
    var beforePairs = siblingsBefore.map(function (sib) {
      return [sib, buildStableSelector(sib, doc)];
    });

    var opIdx = scopeEdits.ops.length;
    var suffix = "copy" + (opIdx + 1);
    var clone = el.cloneNode(true);
    stripTransientAttrsFromClone(clone);
    assignUniqueCloneIds(clone, doc, suffix, null);
    parent.insertBefore(clone, el.nextElementSibling);

    // Remap shifted sibling patches after inserting clone
    var shiftedPatches = {};
    beforePairs.forEach(function (pair) {
      var sib = pair[0];
      var oldSibSel = pair[1];
      var newSibSel = buildStableSelector(sib, doc);
      if (oldSibSel && newSibSel && oldSibSel !== newSibSel && scopeEdits.patches[oldSibSel]) {
        shiftedPatches[newSibSel] = scopeEdits.patches[oldSibSel];
        delete scopeEdits.patches[oldSibSel];
      }
    });
    Object.keys(shiftedPatches).forEach(function (k) {
      scopeEdits.patches[k] = shiftedPatches[k];
    });

    clone.setAttribute("data-ve-op-" + opIdx, "1");
    scopeEdits.ops.push({ type: "duplicate", selector: oldSelEl, suffix: suffix });

    var newSelEl = buildStableSelector(el, doc);
    var cloneSel = buildStableSelector(clone, doc);
    if (cloneSel) {
      var srcPatch = scopeEdits.patches[newSelEl] || scopeEdits.patches[oldSelEl];
      if (srcPatch) {
        scopeEdits.patches[cloneSel] = JSON.parse(JSON.stringify(srcPatch));
      }
    }

    selectElement(clone);
    syncElementChange(clone);
    state.dirtyDynamic = true;
    touchedDynamicPaths.add(ds ? ds.pathname : normalizePathname(doc.defaultView.location.pathname));
    updateHiddenCountUI();
    performSaveNow("duplicate");
  }

  async function handleImageFileUpload(file, targetEl) {
    var el = targetEl || state.selectedEl;
    if (!el || !file) return;
    var doc = el.ownerDocument;
    var ds = docStates.get(doc);
    var docPathname = ds ? ds.pathname : normalizePathname(doc.defaultView.location.pathname);

    setSaveStatus("saving", "正在上传替换图片...");
    var newSrc = "";

    if (state.serverAvailable) {
      try {
        var uploadOpts = {
          method: "POST",
          headers: {
            "Content-Type": file.type || "image/png",
            "X-Filename": encodeURIComponent(file.name || "image.png"),
          },
        };
        if (window.__VE_EXTENSION_BRIDGE__) {
          uploadOpts.bodyBase64 = await new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function () {
              var s = String(reader.result || "");
              resolve(s.indexOf(",") !== -1 ? s.split(",")[1] : s);
            };
            reader.readAsDataURL(file);
          });
        } else {
          uploadOpts.body = file;
        }
        var res = await apiFetch(CONFIG.uploadUrl, uploadOpts);
        var data = await res.json();
        if (res.ok && data && data.ok && (data.rootRelativePath || data.src)) {
          newSrc = data.rootRelativePath
            ? computeRelativeAssetPath(docPathname, data.rootRelativePath)
            : data.src;
        } else {
          throw new Error((data && data.error) || "图片上传失败");
        }
      } catch (err) {
        setSaveStatus("error", "图片上传失败: " + err.message);
        return;
      }
    } else {
      newSrc = await new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.readAsDataURL(file);
      });
    }

    applyImageSrcToElement(el, newSrc);
  }

  function applyImageSrcToElement(el, newSrc) {
    if (!el || !newSrc) return;
    if (el.tagName.toLowerCase() === "img") {
      el.setAttribute("src", newSrc);
    } else {
      el.style.backgroundImage = 'url("' + newSrc + '")';
      if (!el.style.backgroundSize) el.style.backgroundSize = "cover";
      if (!el.style.backgroundPosition) el.style.backgroundPosition = "center";
      el.setAttribute("data-ve-image-src", newSrc);
      if (el.tagName.toLowerCase() === "svg") {
        Array.from(el.children).forEach(function (c) { c.style.display = "none"; });
      } else if (el.children.length === 1 && el.children[0].tagName.toLowerCase() === "svg") {
        el.children[0].style.display = "none";
      }
    }
    var srcInput = document.getElementById("ve-prop-img-src");
    if (srcInput) srcInput.value = newSrc;
    state.dirtySelected = true;
    syncElementChange(el);
    performSaveNow("replace-image");
  }

  function applyHistorySnapshot(index) {
    if (index < 0 || index >= state.history.length) return;
    state.suppressHistory = true;
    var snap = state.history[index];
    state.historyIndex = index;

    // Restore static top-level HTML
    var parser = new DOMParser();
    var parsed = parser.parseFromString(snap.topHtml, "text/html");
    var topDs = docStates.get(document);
    var prevRaw = topDs && topDs.rawSourceDoc;
    var isPureStaticBody = false;
    if (prevRaw && prevRaw.body && document.body && !document.querySelector("iframe")) {
      var prevBodyCount = Array.from(prevRaw.body.children).filter(function (c) {
        return !isEditorOrAnnotationNode(c);
      }).length;
      var liveBodyCount = Array.from(document.body.children).filter(function (c) {
        return !isEditorOrAnnotationNode(c);
      }).length;
      if (prevBodyCount > 0 && prevBodyCount === liveBodyCount) {
        isPureStaticBody = true;
      }
    }
    if (topDs) topDs.rawSourceDoc = parsed.cloneNode(true);

    // Revert dynamic elements whose patches disappeared in this snapshot
    try {
      state.visualEdits = JSON.parse(snap.visualEdits || '{"version":"1.0","scopes":{}}');
    } catch (e) {
      state.visualEdits = { version: "1.0", scopes: {} };
    }

    var hasScopes = state.visualEdits && state.visualEdits.scopes && Object.keys(state.visualEdits.scopes).length > 0;
    if (isPureStaticBody && !hasScopes && parsed.body && document.body) {
      var preservedNodes = [];
      Array.from(document.body.children).forEach(function (child) {
        var t = child.tagName ? child.tagName.toLowerCase() : "";
        if (isEditorOrAnnotationNode(child) || t === "script") {
          preservedNodes.push(child);
        }
      });
      Array.from(document.body.children).forEach(function (child) {
        var t = child.tagName ? child.tagName.toLowerCase() : "";
        if (!isEditorOrAnnotationNode(child) && t !== "script") {
          child.remove();
        }
      });
      var anchor = preservedNodes[0] || null;
      Array.from(parsed.body.children).forEach(function (child) {
        var t = child.tagName ? child.tagName.toLowerCase() : "";
        if (isEditorOrAnnotationNode(child) || t === "script") return;
        document.body.insertBefore(document.importNode(child, true), anchor);
      });
    }

    // Remove dynamic clones created by ops beyond snapshot length
    boundDocs.forEach(function (doc) {
      var scope = getDocScope(doc);
      var scopeData = state.visualEdits.scopes && state.visualEdits.scopes[scope];
      var opLen = scopeData && Array.isArray(scopeData.ops) ? scopeData.ops.length : 0;
      doc.querySelectorAll("*").forEach(function (el) {
        Array.from(el.attributes || []).forEach(function (attr) {
          if (attr.name.indexOf("data-ve-op-") === 0) {
            var idx = parseInt(attr.name.slice("data-ve-op-".length), 10);
            if (!isNaN(idx) && idx >= opLen) {
              if (el.parentElement) el.remove();
            }
          }
        });
      });
    });

    origByScopeSelector.forEach(function (orig) {
      var scopeData = state.visualEdits.scopes && state.visualEdits.scopes[orig.scope];
      var hasPatch = scopeData && scopeData.patches && scopeData.patches[orig.selector];
      if (!hasPatch && orig.doc && orig.doc.defaultView && !orig.doc.defaultView.closed) {
        var liveEl = null;
        try { liveEl = orig.doc.querySelector(orig.selector); } catch (e) {}
        if (liveEl) {
          if (orig.text !== null && liveEl.children.length === 0) liveEl.textContent = orig.text;
          else if (orig.textNodes !== null) setDirectText(liveEl, orig.textNodes.join(""));
          if (orig.styleAttr) liveEl.setAttribute("style", orig.styleAttr);
          else liveEl.removeAttribute("style");
          if (orig.hidden) liveEl.setAttribute("data-ve-hidden", "true");
          else liveEl.removeAttribute("data-ve-hidden");
          if (orig.tx != null) liveEl.setAttribute("data-ve-tx", orig.tx);
          else liveEl.removeAttribute("data-ve-tx");
          if (orig.ty != null) liveEl.setAttribute("data-ve-ty", orig.ty);
          else liveEl.removeAttribute("data-ve-ty");
          if (orig.scale != null) liveEl.setAttribute("data-ve-scale", orig.scale);
          else liveEl.removeAttribute("data-ve-scale");
          if (orig.src !== null && liveEl.tagName.toLowerCase() === "img") liveEl.setAttribute("src", orig.src);
        }
      }
    });

    boundDocs.forEach(function (doc) {
      if (doc.defaultView && typeof doc.defaultView.__VE_APPLY_DATA__ === "function") {
        doc.defaultView.__VE_APPLY_DATA__(state.visualEdits);
      }
    });

    state.dirtyDynamic = true;
    pendingStaticDocs.add(document);
    selectElement(null);
    updateHiddenCountUI();
    updateUndoRedoButtons();
    state.suppressHistory = false;
    performSaveNow("undo-redo");
  }

  function mountEditorUI() {
    if (document.getElementById("ve-editor-root")) return;

    var root = document.createElement("div");
    root.id = "ve-editor-root";
    if (state.active) root.classList.add("ve-active");
    if (state.collapsed) root.classList.add("ve-collapsed");

    root.innerHTML = [
      '<div class="ve-header" id="ve-drag-header">',
      '  <div class="ve-title-wrap">',
      '    <span class="ve-dot"></span>',
      '    <span>静态可视化编辑</span>',
      "  </div>",
      '  <div class="ve-header-actions">',
      '    <button type="button" class="ve-switch-btn" id="ve-toggle-active">' +
        (state.active ? "编辑中: 开" : "编辑: 关") +
        "</button>",
      '    <button type="button" class="ve-icon-btn" id="ve-toggle-collapse" title="收起/展开面板">' +
        (state.collapsed ? "▸" : "▾") +
        "</button>",
      "  </div>",
      "</div>",
      '<div class="ve-status-bar">',
      '  <span class="ve-status-text ve-saved" id="ve-status-text">就绪 · 改动自动保存</span>',
      '  <div style="display:flex;gap:4px;">',
      '    <button type="button" class="ve-icon-btn" id="ve-btn-undo" title="撤销 (Cmd+Z)">↶</button>',
      '    <button type="button" class="ve-icon-btn" id="ve-btn-redo" title="重做 (Cmd+Shift+Z)">↷</button>',
      "  </div>",
      "</div>",
      '<div class="ve-deploy-bar" id="ve-deploy-bar">',
      '  <span id="ve-deploy-text" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">☁️ 改完自动同步 Vercel 公网</span>',
      '  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">',
      '    <a id="ve-deploy-link" class="ve-deploy-link" href="#" target="_blank" rel="noopener" style="display:none;">打开公网 ↗</a>',
      '    <button type="button" class="ve-btn" id="ve-toggle-autodeploy" style="padding:2px 6px !important;font-size:10px !important;">自动发布: 开</button>',
      "  </div>",
      "</div>",
      '<div class="ve-body">',
      '  <div id="ve-iframe-bridge-wrap" class="ve-section ve-hidden">',
      '    <div class="ve-hint">当前通过本地文件打开且包含多画面(iframe)，浏览器禁止跨画板直接编辑。</div>',
      '    <button type="button" class="ve-btn ve-btn-primary" id="ve-btn-open-http">⚡ 一键切到完整可编辑模式</button>',
      "  </div>",
      '  <div class="ve-row">',
      '    <button type="button" class="ve-btn" id="ve-toggle-drag" style="flex:1;" title="开启后可用鼠标直接拖拽元素位置">✥ 鼠标拖拽挪位: 关</button>',
      '    <button type="button" class="ve-btn" id="ve-toggle-show-hidden" style="flex:1;">显示已隐藏项 (0)</button>',
      "  </div>",
      '  <div id="ve-empty-hint" class="ve-section">',
      '    <div class="ve-hint">💡 <b>操作指南：</b><br/>1. 单击任意页面或画板内的<b>文字</b>直接打字修改（停顿 0.5 秒自动保存）；<br/>2. 单击任意<b>卡片/按钮/图片</b>可调颜色、字号、间距、顺序或换图；<br/>3. 停手 6 秒后<b>自动部署至 Vercel 公网</b>（多端打开均为最新）。</div>',
      "  </div>",
      '  <div id="ve-inspector-controls" style="display:none;flex-direction:column;gap:10px;">',
      '    <div class="ve-section">',
      '      <div class="ve-section-title">',
      '        <span>当前选中元素</span>',
      '        <span class="ve-tag-badge" id="ve-selected-tag">div</span>',
      "      </div>",
      '      <div class="ve-grid-3">',
      '        <button type="button" class="ve-btn" id="ve-btn-select-parent" title="选中父级容器">↑ 父容器</button>',
      '        <button type="button" class="ve-btn" id="ve-btn-move-up" title="在同级元素中上移一位">↑ 上移顺序</button>',
      '        <button type="button" class="ve-btn" id="ve-btn-move-down" title="在同级元素中下移一位">↓ 下移顺序</button>',
      "      </div>",
      '      <div class="ve-grid-3">',
      '        <button type="button" class="ve-btn" id="ve-btn-z-up" title="提升层级 z-index">层级 +1</button>',
      '        <button type="button" class="ve-btn" id="ve-btn-z-down" title="降低层级 z-index">层级 -1</button>',
      '        <button type="button" class="ve-btn" id="ve-btn-reset-pos" title="重置拖拽偏移位置">重置位置</button>',
      "      </div>",
      '      <div class="ve-grid-2">',
      '        <button type="button" class="ve-btn" id="ve-btn-duplicate" title="在同级后方复制一份当前组件 (⌘/Ctrl+D)">📋 复制组件</button>',
      '        <button type="button" class="ve-btn ve-btn-danger" id="ve-btn-hide-toggle">🙈 隐藏该元素</button>',
      "      </div>",
      "    </div>",
      '    <div class="ve-section" id="ve-section-geometry">',
      '      <div class="ve-section-title"><span>尺寸与缩放 (拖拽边框 8 点也可缩放)</span></div>',
      '      <div class="ve-grid-2">',
      '        <div class="ve-field">',
      "          <label>W 宽度 (px)</label>",
      '          <input type="number" id="ve-prop-width" min="4" max="9999" step="1" />',
      "        </div>",
      '        <div class="ve-field">',
      "          <label>H 高度 (px)</label>",
      '          <input type="number" id="ve-prop-height" min="4" max="9999" step="1" />',
      "        </div>",
      "      </div>",
      '      <div class="ve-grid-2">',
      '        <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-lock-ratio" title="锁定时按比例同步 W 与 H">🔓 等比: 关</button>',
      '        <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-reset-size" title="恢复默认宽高与缩放">↺ 重置尺寸</button>',
      "      </div>",
      '      <div class="ve-field">',
      "        <label>等比缩放 Scale (%)</label>",
      '        <div class="ve-color-wrap">',
      '          <input type="range" id="ve-prop-scale-range" min="25" max="250" step="5" value="100" style="flex:1;" />',
      '          <input type="number" id="ve-prop-scale-num" min="10" max="500" step="5" value="100" style="width:58px !important;flex:0 0 58px;" />',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-reset-scale" style="width:auto !important;padding:4px 7px !important;" title="恢复 100%">100%</button>',
      "        </div>",
      "      </div>",
      "    </div>",
      '    <div class="ve-section" id="ve-section-text">',
      '      <div class="ve-section-title"><span>文案内容 (也可直接在页面打字)</span></div>',
      '      <textarea id="ve-prop-text" placeholder="输入文案内容..."></textarea>',
      "    </div>",
      '    <div class="ve-section">',
      '      <div class="ve-section-title"><span>样式微调 (颜色 / 排版 / 间距)</span></div>',
      '      <div class="ve-grid-2">',
      '        <div class="ve-field">',
      "          <label>文字颜色</label>",
      '          <div class="ve-color-wrap">',
      '            <input type="color" id="ve-prop-color-picker" value="#000000" />',
      '            <input type="text" id="ve-prop-color-hex" value="#000000" />',
      "          </div>",
      "        </div>",
      '        <div class="ve-field">',
      "          <label>背景颜色</label>",
      '          <div class="ve-color-wrap">',
      '            <input type="color" id="ve-prop-bg-picker" value="#ffffff" />',
      '            <input type="text" id="ve-prop-bg-hex" value="transparent" />',
      "          </div>",
      "        </div>",
      "      </div>",
      '      <div class="ve-grid-2">',
      '        <div class="ve-field">',
      "          <label>字号 (px)</label>",
      '          <input type="number" id="ve-prop-fontsize" min="8" max="120" step="1" />',
      "        </div>",
      '        <div class="ve-field">',
      "          <label>圆角 (px)</label>",
      '          <input type="number" id="ve-prop-radius" min="0" max="999" step="1" />',
      "        </div>",
      "      </div>",
      '      <div class="ve-field">',
      "        <label>排版 (加粗 / 对齐 / 居中)</label>",
      '        <div class="ve-grid-5">',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-bold" title="字体加粗 / 常规"><strong>B</strong> 加粗</button>',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-align-left" title="左对齐">左</button>',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-align-center" title="水平居中">居中</button>',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-align-right" title="右对齐">右</button>',
      '          <button type="button" class="ve-btn ve-btn-sm" id="ve-btn-vcenter" title="上下左右居中 (Flex)">↕居中</button>',
      "        </div>",
      "      </div>",
      '      <div class="ve-grid-2">',
      '        <div class="ve-field">',
      "          <label>内边距 (Padding)</label>",
      '          <input type="text" id="ve-prop-padding" placeholder="如 8px 12px" />',
      "        </div>",
      '        <div class="ve-field">',
      "          <label>外边距 (Margin)</label>",
      '          <input type="text" id="ve-prop-margin" placeholder="如 0 0 12px 0" />',
      "        </div>",
      "      </div>",
      "    </div>",
      '    <div class="ve-section" id="ve-section-image">',
      '      <div class="ve-section-title"><span>图片替换 (支持拖拽图片到元素上)</span></div>',
      '      <div class="ve-row">',
      '        <input type="text" id="ve-prop-img-src" placeholder="./assets/images/..." style="flex:1;" />',
      '        <button type="button" class="ve-btn ve-btn-primary" id="ve-btn-upload-img">上传换图</button>',
      '        <input type="file" id="ve-file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none !important;" />',
      "      </div>",
      "    </div>",
      "  </div>",
      '  <div class="ve-row" style="padding-top:2px;">',
      '    <button type="button" class="ve-btn ve-btn-primary" id="ve-btn-save-now" style="flex:1;">💾 立即保存</button>',
      '    <button type="button" class="ve-btn ve-btn-active" id="ve-btn-deploy-now" style="flex:1;" title="立即将最新本地修改发布到 Vercel 生产环境">🚀 立即同步公网</button>',
      "  </div>",
      '  <div class="ve-row">',
      '    <button type="button" class="ve-btn" id="ve-btn-bind-file" style="flex:1;" title="无本地服务时，绑定本地 .html 文件实现静默直存">📂 绑定本地文件</button>',
      '    <button type="button" class="ve-btn" id="ve-btn-export-html" style="flex:1;" title="下载完整纯净的 HTML 文件">⬇ 导出 HTML</button>',
      "  </div>",
      "</div>",
    ].join("\n");

    document.body.appendChild(root);
    syncModeAttrsToAllDocs();
    bindPanelEvents(root);
    updateHiddenCountUI();
    updateUndoRedoButtons();
  }

  function bindPanelEvents(root) {
    var header = document.getElementById("ve-drag-header");
    var panelDragging = false;
    var startX = 0, startY = 0, origLeft = 16, origTop = 16;

    header.addEventListener("mousedown", function (e) {
      if (e.target.closest("button")) return;
      panelDragging = true;
      var rect = root.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (!panelDragging) return;
      var nx = Math.max(4, Math.min(window.innerWidth - 120, origLeft + (e.clientX - startX)));
      var ny = Math.max(4, Math.min(window.innerHeight - 48, origTop + (e.clientY - startY)));
      root.style.left = nx + "px";
      root.style.top = ny + "px";
      root.style.right = "auto";
    });

    window.addEventListener("mouseup", function () { panelDragging = false; });

    document.getElementById("ve-toggle-active").addEventListener("click", function () {
      state.active = !state.active;
      root.classList.toggle("ve-active", state.active);
      this.textContent = state.active ? "编辑中: 开" : "编辑: 关";
      if (state.active && state.collapsed) {
        state.collapsed = false;
        root.classList.remove("ve-collapsed");
        document.getElementById("ve-toggle-collapse").textContent = "▾";
      }
      syncModeAttrsToAllDocs();
      if (!state.active) {
        if (state.hoverEl) state.hoverEl.removeAttribute("data-ve-hover");
        selectElement(null);
      }
    });

    document.getElementById("ve-toggle-collapse").addEventListener("click", function () {
      state.collapsed = !state.collapsed;
      root.classList.toggle("ve-collapsed", state.collapsed);
      this.textContent = state.collapsed ? "▸" : "▾";
    });

    var openHttpBtn = document.getElementById("ve-btn-open-http");
    if (openHttpBtn) {
      openHttpBtn.addEventListener("click", function () {
        if (state.projectHttpUrl) window.location.href = state.projectHttpUrl;
      });
    }

    window.__VE_TOGGLE_PANEL__ = function () {
      var btn = document.getElementById("ve-toggle-active");
      if (btn) btn.click();
    };

    document.getElementById("ve-toggle-drag").addEventListener("click", function () {
      state.dragMode = !state.dragMode;
      this.textContent = state.dragMode ? "✥ 鼠标拖拽挪位: 开" : "✥ 鼠标拖拽挪位: 关";
      this.classList.toggle("ve-btn-active", state.dragMode);
      syncModeAttrsToAllDocs();
      if (state.selectedEl) {
        if (state.dragMode) {
          state.selectedEl.removeAttribute("contenteditable");
        } else if (hasDirectTextEditability(state.selectedEl) && state.selectedEl.children.length === 0) {
          state.selectedEl.setAttribute("contenteditable", "plaintext-only");
        }
      }
    });

    document.getElementById("ve-toggle-show-hidden").addEventListener("click", function () {
      state.showHidden = !state.showHidden;
      syncModeAttrsToAllDocs();
      updateHiddenCountUI();
    });

    document.getElementById("ve-btn-select-parent").addEventListener("click", function () {
      if (state.selectedEl && state.selectedEl.parentElement && state.selectedEl.parentElement !== state.selectedEl.ownerDocument.body) {
        selectElement(state.selectedEl.parentElement);
      }
    });

    document.getElementById("ve-btn-move-up").addEventListener("click", function () { moveSelectedSibling("up"); });
    document.getElementById("ve-btn-move-down").addEventListener("click", function () { moveSelectedSibling("down"); });

    document.getElementById("ve-btn-z-up").addEventListener("click", function () {
      if (!state.selectedEl) return;
      var win = state.selectedEl.ownerDocument.defaultView || window;
      var cs = win.getComputedStyle(state.selectedEl);
      if (cs.position === "static") state.selectedEl.style.position = "relative";
      state.selectedEl.style.zIndex = String((parseInt(cs.zIndex, 10) || 0) + 1);
      state.dirtySelected = true;
      performSaveNow("z-index");
    });

    document.getElementById("ve-btn-z-down").addEventListener("click", function () {
      if (!state.selectedEl) return;
      var win = state.selectedEl.ownerDocument.defaultView || window;
      var cs = win.getComputedStyle(state.selectedEl);
      if (cs.position === "static") state.selectedEl.style.position = "relative";
      state.selectedEl.style.zIndex = String((parseInt(cs.zIndex, 10) || 0) - 1);
      state.dirtySelected = true;
      performSaveNow("z-index");
    });

    document.getElementById("ve-btn-reset-pos").addEventListener("click", function () {
      if (!state.selectedEl) return;
      state.selectedEl.removeAttribute("data-ve-tx");
      state.selectedEl.removeAttribute("data-ve-ty");
      applyElementTransform(state.selectedEl);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("reset-position");
    });

    document.getElementById("ve-btn-duplicate").addEventListener("click", function () {
      duplicateSelectedElement();
    });

    document.getElementById("ve-btn-hide-toggle").addEventListener("click", function () {
      var el = state.selectedEl;
      if (!el) return;
      var isHidden = el.getAttribute("data-ve-hidden") === "true";
      if (isHidden) {
        el.removeAttribute("data-ve-hidden");
        if (el.style.display === "none") el.style.display = "";
      } else {
        el.setAttribute("data-ve-hidden", "true");
        el.style.display = "none";
      }
      updateHiddenCountUI();
      populateInspectorUI(el);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("visibility");
    });

    var textArea = document.getElementById("ve-prop-text");
    textArea.addEventListener("input", function () {
      if (!state.selectedEl || !hasDirectTextEditability(state.selectedEl)) return;
      setDirectText(state.selectedEl, this.value);
      updateResizeOverlay();
      scheduleAutoSave("panel-text");
    });
    textArea.addEventListener("blur", function () {
      if (state.saveTimer) performSaveNow("panel-text-blur");
    });

    function bindStyleInput(id, applyFn) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener("input", function () {
        if (!state.selectedEl) return;
        applyFn(state.selectedEl, this.value);
        updateResizeOverlay();
        scheduleAutoSave("style-" + id);
      });
      input.addEventListener("change", function () {
        if (!state.selectedEl) return;
        applyFn(state.selectedEl, this.value);
        updateResizeOverlay();
        state.dirtySelected = true;
        performSaveNow("style-" + id);
      });
    }

    function applyExplicitBoxSize(el, targetW, targetH) {
      var win = el.ownerDocument.defaultView || window;
      var cs = win.getComputedStyle(el);
      if (cs.display === "inline") {
        el.style.display = "inline-block";
        cs = win.getComputedStyle(el);
      }
      var isBB = cs.boxSizing === "border-box";
      if (targetW != null && !isNaN(targetW) && targetW > 0) {
        var extraW = isBB
          ? 0
          : (parseFloat(cs.paddingLeft) || 0) +
            (parseFloat(cs.paddingRight) || 0) +
            (parseFloat(cs.borderLeftWidth) || 0) +
            (parseFloat(cs.borderRightWidth) || 0);
        el.style.width = Math.max(4, Math.round(targetW - extraW)) + "px";
      }
      if (targetH != null && !isNaN(targetH) && targetH > 0) {
        var extraH = isBB
          ? 0
          : (parseFloat(cs.paddingTop) || 0) +
            (parseFloat(cs.paddingBottom) || 0) +
            (parseFloat(cs.borderTopWidth) || 0) +
            (parseFloat(cs.borderBottomWidth) || 0);
        el.style.height = Math.max(4, Math.round(targetH - extraH)) + "px";
      }
    }

    bindStyleInput("ve-prop-width", function (el, val) {
      var wVal = parseFloat(val);
      if (isNaN(wVal) || wVal <= 0) return;
      var hVal = null;
      if (state.lockAspectRatio && state.aspectRatio > 0) {
        hVal = Math.max(4, Math.round(wVal / state.aspectRatio));
        var hInput = document.getElementById("ve-prop-height");
        if (hInput) hInput.value = hVal;
      }
      applyExplicitBoxSize(el, wVal, hVal);
    });

    bindStyleInput("ve-prop-height", function (el, val) {
      var hVal = parseFloat(val);
      if (isNaN(hVal) || hVal <= 0) return;
      var wVal = null;
      if (state.lockAspectRatio && state.aspectRatio > 0) {
        wVal = Math.max(4, Math.round(hVal * state.aspectRatio));
        var wInput = document.getElementById("ve-prop-width");
        if (wInput) wInput.value = wVal;
      }
      applyExplicitBoxSize(el, wVal, hVal);
    });

    document.getElementById("ve-btn-lock-ratio").addEventListener("click", function () {
      state.lockAspectRatio = !state.lockAspectRatio;
      this.classList.toggle("ve-btn-active", state.lockAspectRatio);
      this.textContent = state.lockAspectRatio ? "🔒 等比: 开" : "🔓 等比: 关";
      if (state.selectedEl && state.lockAspectRatio) {
        var w = parseFloat(document.getElementById("ve-prop-width").value) || 0;
        var h = parseFloat(document.getElementById("ve-prop-height").value) || 0;
        if (w > 0 && h > 0) state.aspectRatio = w / h;
      }
    });

    document.getElementById("ve-btn-reset-size").addEventListener("click", function () {
      var el = state.selectedEl;
      if (!el) return;
      el.style.width = "";
      el.style.height = "";
      el.removeAttribute("data-ve-scale");
      applyElementTransform(el);
      populateInspectorUI(el);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("reset-size");
    });

    function applyScalePct(el, rawVal) {
      var pct = parseFloat(rawVal);
      if (isNaN(pct) || pct <= 0) return;
      pct = Math.max(10, Math.min(500, pct));
      var rangeEl = document.getElementById("ve-prop-scale-range");
      var numEl = document.getElementById("ve-prop-scale-num");
      if (rangeEl) rangeEl.value = Math.min(250, Math.max(25, Math.round(pct)));
      if (numEl) numEl.value = Math.round(pct);
      if (Math.round(pct) === 100) {
        el.removeAttribute("data-ve-scale");
      } else {
        el.setAttribute("data-ve-scale", (pct / 100).toFixed(2).replace(/\.?0+$/, ""));
      }
      applyElementTransform(el);
      updateResizeOverlay();
    }

    bindStyleInput("ve-prop-scale-range", applyScalePct);
    bindStyleInput("ve-prop-scale-num", applyScalePct);

    document.getElementById("ve-btn-reset-scale").addEventListener("click", function () {
      var el = state.selectedEl;
      if (!el) return;
      applyScalePct(el, 100);
      state.dirtySelected = true;
      performSaveNow("reset-scale");
    });

    document.getElementById("ve-btn-bold").addEventListener("click", function () {
      var el = state.selectedEl;
      if (!el) return;
      var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
      var fw = parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400);
      el.style.fontWeight = fw >= 600 ? "400" : "700";
      populateInspectorUI(el);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("font-bold");
    });

    function applyHorizontalAlign(align) {
      var el = state.selectedEl;
      if (!el) return;
      var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
      el.style.textAlign = align;
      if (cs.display.indexOf("flex") !== -1) {
        var flexVal = align === "center" ? "center" : (align === "right" ? "flex-end" : "flex-start");
        if (cs.flexDirection.indexOf("column") === 0) {
          el.style.alignItems = flexVal;
        } else {
          el.style.justifyContent = flexVal;
        }
      }
      populateInspectorUI(el);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("align-" + align);
    }

    document.getElementById("ve-btn-align-left").addEventListener("click", function () { applyHorizontalAlign("left"); });
    document.getElementById("ve-btn-align-center").addEventListener("click", function () { applyHorizontalAlign("center"); });
    document.getElementById("ve-btn-align-right").addEventListener("click", function () { applyHorizontalAlign("right"); });

    document.getElementById("ve-btn-vcenter").addEventListener("click", function () {
      var el = state.selectedEl;
      if (!el) return;
      var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
      var isFlex = cs.display.indexOf("flex") !== -1;
      var isCol = isFlex && cs.flexDirection.indexOf("column") === 0;
      if (isCol) {
        if (cs.justifyContent === "center" && el.style.justifyContent === "center") {
          el.style.justifyContent = "";
        } else {
          el.style.justifyContent = "center";
        }
      } else {
        var isVC = isFlex && cs.alignItems === "center";
        if (isVC && el.style.alignItems === "center") {
          el.style.alignItems = "";
          if (el.style.display === "flex") el.style.display = "";
        } else {
          if (!isFlex) el.style.display = "flex";
          el.style.alignItems = "center";
          if (!el.style.justifyContent && cs.justifyContent === "normal") {
            el.style.justifyContent = "center";
          }
          if (!el.style.textAlign) el.style.textAlign = "center";
        }
      }
      populateInspectorUI(el);
      updateResizeOverlay();
      state.dirtySelected = true;
      performSaveNow("vertical-center");
    });

    bindStyleInput("ve-prop-color-picker", function (el, val) {
      el.style.color = val;
      document.getElementById("ve-prop-color-hex").value = val;
    });
    bindStyleInput("ve-prop-color-hex", function (el, val) {
      el.style.color = val;
      if (/^#[0-9a-f]{6}$/i.test(val)) document.getElementById("ve-prop-color-picker").value = val;
    });
    bindStyleInput("ve-prop-bg-picker", function (el, val) {
      el.style.backgroundColor = val;
      document.getElementById("ve-prop-bg-hex").value = val;
    });
    bindStyleInput("ve-prop-bg-hex", function (el, val) {
      el.style.backgroundColor = val;
      if (/^#[0-9a-f]{6}$/i.test(val)) document.getElementById("ve-prop-bg-picker").value = val;
    });
    bindStyleInput("ve-prop-fontsize", function (el, val) {
      if (val) el.style.fontSize = val + "px";
    });
    bindStyleInput("ve-prop-radius", function (el, val) {
      if (val !== "") el.style.borderRadius = val + "px";
    });
    bindStyleInput("ve-prop-padding", function (el, val) { el.style.padding = val; });
    bindStyleInput("ve-prop-margin", function (el, val) { el.style.margin = val; });

    var fileInput = document.getElementById("ve-file-input");
    document.getElementById("ve-btn-upload-img").addEventListener("click", function () {
      fileInput.value = "";
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) handleImageFileUpload(this.files[0], state.selectedEl);
    });
    document.getElementById("ve-prop-img-src").addEventListener("change", function () {
      if (state.selectedEl && this.value.trim()) applyImageSrcToElement(state.selectedEl, this.value.trim());
    });

    document.getElementById("ve-btn-undo").addEventListener("click", function () {
      if (state.historyIndex > 0) applyHistorySnapshot(state.historyIndex - 1);
    });
    document.getElementById("ve-btn-redo").addEventListener("click", function () {
      if (state.historyIndex < state.history.length - 1) applyHistorySnapshot(state.historyIndex + 1);
    });
    document.getElementById("ve-btn-save-now").addEventListener("click", function () { performSaveNow("manual-button"); });
    document.getElementById("ve-btn-deploy-now").addEventListener("click", function () { triggerManualDeployNow(); });
    document.getElementById("ve-toggle-autodeploy").addEventListener("click", function () { toggleAutoDeployConfig(); });
    document.getElementById("ve-btn-bind-file").addEventListener("click", function () { bindLocalHtmlFile(); });
    document.getElementById("ve-btn-export-html").addEventListener("click", function () { exportCleanHtmlDownload(); });
  }

  // Shared drag state across top window & iframe windows
  var dragEl = null;
  var dragStartScreenX = 0, dragStartScreenY = 0, baseTx = 0, baseTy = 0, dragScale = 1;

  function handleDragMove(e) {
    if (resizeEl && state.isResizingElement) {
      var scaleTotal = (resizeDocScale * resizeElScale) || 1;
      var dx = (e.screenX - resizeStartScreenX) / scaleTotal;
      var dy = (e.screenY - resizeStartScreenY) / scaleTotal;
      var hasE = resizeHandle.indexOf("e") !== -1;
      var hasW = resizeHandle.indexOf("w") !== -1;
      var hasS = resizeHandle.indexOf("s") !== -1;
      var hasN = resizeHandle.indexOf("n") !== -1;
      var isCorner = (hasE || hasW) && (hasN || hasS);
      var locked = Boolean(state.lockAspectRatio || e.shiftKey);

      var newW = resizeBaseW;
      var newH = resizeBaseH;
      if (hasE) newW = resizeBaseW + dx;
      if (hasW) newW = resizeBaseW - dx;
      if (hasS) newH = resizeBaseH + dy;
      if (hasN) newH = resizeBaseH - dy;

      if (locked && resizeAspect > 0) {
        if (isCorner) {
          if (Math.abs(dy) > Math.abs(dx)) newW = newH * resizeAspect;
          else newH = newW / resizeAspect;
        } else if (hasE || hasW) {
          newH = newW / resizeAspect;
        } else if (hasN || hasS) {
          newW = newH * resizeAspect;
        }
      }

      newW = Math.max(12, Math.round(newW));
      newH = Math.max(12, Math.round(newH));

      if (resizeDisplay === "inline") {
        resizeEl.style.display = "inline-block";
      }
      if (hasE || hasW || locked) {
        resizeEl.style.width = Math.max(4, Math.round(newW - resizeExtraW)) + "px";
      }
      if (hasN || hasS || locked) {
        resizeEl.style.height = Math.max(4, Math.round(newH - resizeExtraH)) + "px";
      }
      if (hasW) {
        resizeEl.setAttribute("data-ve-tx", String(Math.round(resizeBaseTx + (resizeBaseW - newW))));
      }
      if (hasN) {
        resizeEl.setAttribute("data-ve-ty", String(Math.round(resizeBaseTy + (resizeBaseH - newH))));
      }
      if (hasW || hasN) {
        applyElementTransform(resizeEl);
      }

      var wIn = document.getElementById("ve-prop-width");
      var hIn = document.getElementById("ve-prop-height");
      if (wIn && (hasE || hasW || locked)) wIn.value = newW;
      if (hIn && (hasN || hasS || locked)) hIn.value = newH;
      updateResizeOverlay();
      return;
    }

    if (!dragEl || !state.isDraggingElement) return;
    var nx = Math.round(baseTx + (e.screenX - dragStartScreenX) / dragScale);
    var ny = Math.round(baseTy + (e.screenY - dragStartScreenY) / dragScale);
    dragEl.setAttribute("data-ve-tx", String(nx));
    dragEl.setAttribute("data-ve-ty", String(ny));
    applyElementTransform(dragEl);
    updateResizeOverlay();
  }

  function handleDragEnd() {
    if (resizeEl && state.isResizingElement) {
      var targetResizeEl = resizeEl;
      state.isResizingElement = false;
      resizeEl = null;
      state.dirtySelected = true;
      syncElementChange(targetResizeEl);
      populateInspectorUI(targetResizeEl);
      updateResizeOverlay();
      performSaveNow("resize-handle");
      return;
    }
    if (!dragEl || !state.isDraggingElement) return;
    state.isDraggingElement = false;
    state.dirtySelected = true;
    syncElementChange(dragEl);
    dragEl = null;
    updateResizeOverlay();
    performSaveNow("drag-move");
  }

  function handleKeyDown(e) {
    if (!state.active) return;
    var isMod = e.metaKey || e.ctrlKey;
    var doc = e.target && e.target.ownerDocument ? e.target.ownerDocument : document;
    var activeEl = doc.activeElement;
    var activeTag = activeEl ? activeEl.tagName.toLowerCase() : "";
    if (isMod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      performSaveNow("shortcut-save");
    } else if (isMod && e.key.toLowerCase() === "d") {
      if (activeTag === "input" || activeTag === "textarea") return;
      e.preventDefault();
      duplicateSelectedElement();
    } else if (isMod && e.key.toLowerCase() === "z") {
      if (activeTag === "input" || activeTag === "textarea") return;
      if (activeEl && activeEl.hasAttribute("contenteditable")) return;
      e.preventDefault();
      if (e.shiftKey) {
        if (state.historyIndex < state.history.length - 1) applyHistorySnapshot(state.historyIndex + 1);
      } else {
        if (state.historyIndex > 0) applyHistorySnapshot(state.historyIndex - 1);
      }
    } else if (e.key === "Escape") {
      selectElement(null);
    }
  }

  function attachDocumentListeners(doc) {
    if (!doc || boundDocs.has(doc)) return;
    boundDocs.add(doc);
    var docWin = doc.defaultView || window;

    if (doc.documentElement) {
      doc.documentElement.setAttribute("data-ve-mode", state.active ? "on" : "off");
      doc.documentElement.setAttribute("data-ve-drag", state.dragMode ? "on" : "off");
      doc.documentElement.setAttribute("data-ve-show-hidden", state.showHidden ? "on" : "off");
    }

    doc.addEventListener(
      "mouseover",
      function (e) {
        if (!state.active || state.isDraggingElement || state.isResizingElement) return;
        var target = normalizeSelectableTarget(e.target);
        if (isEditorOrAnnotationNode(target)) return;
        if (state.hoverEl && state.hoverEl !== target) {
          state.hoverEl.removeAttribute("data-ve-hover");
        }
        state.hoverEl = target;
        target.setAttribute("data-ve-hover", "true");
      },
      true
    );

    doc.addEventListener(
      "mouseout",
      function (e) {
        var target = normalizeSelectableTarget(e.target);
        if (state.hoverEl && state.hoverEl === target) {
          state.hoverEl.removeAttribute("data-ve-hover");
          state.hoverEl = null;
        }
      },
      true
    );

    doc.addEventListener(
      "click",
      function (e) {
        if (!state.active) return;
        var target = normalizeSelectableTarget(e.target);
        if (isEditorOrAnnotationNode(target)) return;

        var tag = target.tagName ? target.tagName.toLowerCase() : "";
        var alreadyEditable =
          target === state.selectedEl &&
          target.hasAttribute("contenteditable") &&
          tag !== "a" &&
          tag !== "button";

        if (!alreadyEditable) {
          e.preventDefault();
        }
        e.stopPropagation();
        selectElement(target);
      },
      true
    );

    doc.addEventListener(
      "input",
      function (e) {
        if (!state.active) return;
        var target = e.target;
        if (isEditorOrAnnotationNode(target)) return;
        if (target === state.selectedEl) {
          var textArea = document.getElementById("ve-prop-text");
          if (textArea) textArea.value = getDirectText(target);
          updateResizeOverlay();
          scheduleAutoSave("inline-text");
        }
      },
      true
    );

    doc.addEventListener(
      "focusout",
      function (e) {
        if (!state.active) return;
        var target = e.target;
        if (isEditorOrAnnotationNode(target)) return;
        if (target === state.selectedEl && state.saveTimer) {
          performSaveNow("inline-text-blur");
        }
      },
      true
    );

    doc.addEventListener(
      "mousedown",
      function (e) {
        if (!state.active || e.button !== 0) return;
        var target = normalizeSelectableTarget(e.target);
        if (isEditorOrAnnotationNode(target)) return;
        if (!state.dragMode && !e.altKey) return;

        selectElement(target);
        dragEl = target;
        dragScale = getDocScale(doc);
        state.isDraggingElement = true;
        dragStartScreenX = e.screenX;
        dragStartScreenY = e.screenY;
        baseTx = parseFloat(dragEl.getAttribute("data-ve-tx") || "0") || 0;
        baseTy = parseFloat(dragEl.getAttribute("data-ve-ty") || "0") || 0;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );

    docWin.addEventListener("mousemove", handleDragMove, true);
    docWin.addEventListener("mouseup", handleDragEnd, true);
    docWin.addEventListener("scroll", updateResizeOverlay, true);
    doc.addEventListener("scroll", updateResizeOverlay, true);
    docWin.addEventListener("resize", updateResizeOverlay, true);
    doc.addEventListener("keydown", handleKeyDown);

    doc.addEventListener(
      "dragover",
      function (e) {
        if (!state.active) return;
        if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).indexOf("Files") !== -1) {
          e.preventDefault();
        }
      },
      true
    );

    doc.addEventListener(
      "drop",
      function (e) {
        if (!state.active) return;
        var files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files.length) return;
        var file = files[0];
        if (!file.type || file.type.indexOf("image/") !== 0) return;
        var target = normalizeSelectableTarget(e.target);
        if (isEditorOrAnnotationNode(target)) return;
        e.preventDefault();
        e.stopPropagation();
        selectElement(target);
        handleImageFileUpload(file, target);
      },
      true
    );
  }

  async function bindIframeElement(iframe) {
    if (!iframe || iframe.__veHooked) return;
    iframe.__veHooked = true;

    async function attachLoadedDoc() {
      var childDoc = null;
      try {
        childDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (childDoc && childDoc.body) void childDoc.body.tagName;
      } catch (e) {
        state.hasCrossOriginIframe = true;
        var bridgeWrap = document.getElementById("ve-iframe-bridge-wrap");
        if (bridgeWrap && state.projectHttpUrl) bridgeWrap.classList.remove("ve-hidden");
        return; // cross-origin iframe
      }
      if (!childDoc || !childDoc.body) {
        if (isFileMode()) {
          state.hasCrossOriginIframe = true;
          var bw = document.getElementById("ve-iframe-bridge-wrap");
          if (bw && state.projectHttpUrl) bw.classList.remove("ve-hidden");
        }
        return;
      }
      await initDocState(childDoc);
      attachDocumentListeners(childDoc);
      if (childDoc.defaultView && typeof childDoc.defaultView.__VE_APPLY_DATA__ === "function" && state.visualEdits) {
        childDoc.defaultView.__VE_APPLY_DATA__(state.visualEdits);
      }
      updateHiddenCountUI();
    }

    iframe.addEventListener("load", attachLoadedDoc);
    try {
      if (iframe.contentDocument && (iframe.contentDocument.readyState === "complete" || iframe.contentDocument.readyState === "interactive")) {
        attachLoadedDoc();
      }
    } catch (e) {
      // ignore
    }
  }

  function scanAndBindIframes() {
    document.querySelectorAll("iframe").forEach(function (iframe) {
      bindIframeElement(iframe);
    });
  }

  async function initDocState(doc) {
    if (!doc) return null;
    if (docStates.has(doc)) return docStates.get(doc);
    var docWin = doc.defaultView || window;
    var pathname = normalizePathname(docWin.location.pathname);
    var fallbackClone = doc.cloneNode(true);
    cleanDocumentTree(fallbackClone);
    var ds = {
      doc: doc,
      pathname: pathname,
      rawSourceDoc: fallbackClone,
      rawDoctype: "<!DOCTYPE html>",
      initialDeploy: null,
    };
    docStates.set(doc, ds);

    if (docWin.location.protocol === "http:" || docWin.location.protocol === "https:" || docWin.location.protocol === "file:") {
      try {
        var res = await apiFetch(CONFIG.sourceUrl + "?path=" + encodeURIComponent(pathname), { cache: "no-store" });
        if (res.ok) {
          var data = await res.json();
          if (data && data.ok && typeof data.html === "string") {
            if (data.docRelativePath) ds.pathname = normalizePathname(data.docRelativePath);
            if (doc === document) {
              state.serverAvailable = true;
              if (data.deploy) ds.initialDeploy = data.deploy;
              if (data.projectHttpUrl) state.projectHttpUrl = data.projectHttpUrl;
            }
            var doctypeMatch = data.html.match(/^<!DOCTYPE[^>]*>/i);
            if (doctypeMatch) ds.rawDoctype = doctypeMatch[0];
            var parser = new DOMParser();
            ds.rawSourceDoc = parser.parseFromString(data.html, "text/html");
          }
        }
      } catch (e) {
        // fallback clone stays
      }
    }
    return ds;
  }

  async function initEditor() {
    var topDs = await initDocState(document);

    if (state.serverAvailable) {
      try {
        var editsRes = await apiFetch(CONFIG.editsUrl + "?t=" + Date.now(), { cache: "no-store" });
        if (editsRes.ok) {
          var editsJson = await editsRes.json();
          if (editsJson && typeof editsJson === "object" && editsJson.scopes) {
            state.visualEdits = editsJson;
            if (typeof window.__VE_APPLY_DATA__ === "function") {
              window.__VE_APPLY_DATA__(state.visualEdits);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    mountEditorUI();
    attachDocumentListeners(document);
    scanAndBindIframes();
    if (state.hasCrossOriginIframe && state.projectHttpUrl) {
      var bw = document.getElementById("ve-iframe-bridge-wrap");
      if (bw) bw.classList.remove("ve-hidden");
    }

    // Watch for dynamically rendered iframes (e.g. from js/gallery.js)
    if (document.body) {
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType !== 1) continue;
            if (node.tagName === "IFRAME") bindIframeElement(node);
            else if (node.querySelectorAll) node.querySelectorAll("iframe").forEach(bindIframeElement);
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }

    pushHistorySnapshot();

    if (state.serverAvailable) {
      setSaveStatus("saved", "已连接本地自动保存服务 ✓");
      if (topDs && topDs.initialDeploy) applyDeployStateToUI(topDs.initialDeploy);
    } else {
      setSaveStatus("saved", "本地离线模式 (点「绑定本地文件」可自动直写磁盘)");
      var deployBar = document.getElementById("ve-deploy-bar");
      if (deployBar) deployBar.style.display = "none";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditor);
  } else {
    initEditor();
  }
})();
