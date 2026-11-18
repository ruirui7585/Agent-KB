/**
 * Read-only Visual Edits Applier (ve-apply.js)
 * Applies saved patches from visual-edits.json onto JS-rendered or multi-iframe HTML prototypes.
 * Safe for public Vercel deployments: zero editor UI, zero write APIs, zero event interception.
 */
(function () {
  "use strict";

  if (window.__VE_APPLY_LOADED__) return;
  window.__VE_APPLY_LOADED__ = true;

  var scriptEl =
    document.currentScript ||
    document.querySelector('script[src*="ve-apply.js"]');
  var scriptHref = scriptEl
    ? new URL(scriptEl.getAttribute("src"), window.location.href).href
    : new URL("/.visual-editor/ve-apply.js", window.location.href).href;
  var scriptUrl = new URL(scriptHref);

  var isVirtualServerAsset = scriptUrl.pathname.indexOf("/__visual_editor/") !== -1;
  var projectRootUrl = isVirtualServerAsset
    ? new URL("/", scriptHref)
    : new URL("../", scriptHref);
  var editsUrl = isVirtualServerAsset
    ? "/__visual_editor/edits"
    : new URL("visual-edits.json", projectRootUrl.href).href;

  var editsData = null;
  var isApplying = false;
  var observer = null;
  var applyScheduled = false;

  function getScopePath() {
    var rootPath = projectRootUrl.pathname;
    if (!rootPath.endsWith("/")) rootPath += "/";
    var curPath = decodeURIComponent(window.location.pathname || "/");
    var rel = curPath.indexOf(rootPath) === 0
      ? curPath.slice(rootPath.length)
      : curPath.replace(/^\/+/, "");
    if (!rel || rel === "/") rel = "index.html";
    return "/" + rel.replace(/^\/+/, "");
  }

  function getCurrentScope() {
    var base = getScopePath();
    var activeTab = document.querySelector("#states button.active[data-go]");
    var scene = activeTab
      ? activeTab.getAttribute("data-go")
      : new URLSearchParams(window.location.search).get("scene");
    if (scene) return base + "?scene=" + scene;
    return base;
  }

  function setDirectTextNodes(el, values) {
    if (!el || !Array.isArray(values)) return;
    var textNodes = [];
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) {
        textNodes.push(el.childNodes[i]);
      }
    }
    if (textNodes.length > 0) {
      for (var j = 0; j < textNodes.length && j < values.length; j++) {
        if (textNodes[j].nodeValue !== values[j]) {
          textNodes[j].nodeValue = values[j];
        }
      }
    } else if (values.length > 0) {
      el.insertBefore(document.createTextNode(values[0]), el.firstChild);
    }
  }

  function applyPatchToElement(el, patch) {
    if (!el || !patch) return;
    // Never overwrite an element currently being actively typed into
    if (
      el.hasAttribute("data-ve-selected") &&
      el.hasAttribute("contenteditable") &&
      document.activeElement === el
    ) {
      return;
    }

    if (typeof patch.text === "string" && el.children.length === 0) {
      if (el.textContent !== patch.text) {
        el.textContent = patch.text;
      }
    } else if (Array.isArray(patch.textNodes)) {
      setDirectTextNodes(el, patch.textNodes);
    }

    if (patch.style && typeof patch.style === "object") {
      Object.keys(patch.style).forEach(function (prop) {
        var val = patch.style[prop];
        if (val != null && el.style[prop] !== val) {
          el.style[prop] = val;
        }
      });
    }

    if (patch.hidden === true) {
      el.setAttribute("data-ve-hidden", "true");
      if (el.style.display !== "none") el.style.display = "none";
    } else if (patch.hidden === false && el.hasAttribute("data-ve-hidden")) {
      el.removeAttribute("data-ve-hidden");
      if (el.style.display === "none") el.style.display = "";
    }

    if (typeof patch.tx === "string" || typeof patch.ty === "string" || typeof patch.scale === "string") {
      if (patch.tx != null) el.setAttribute("data-ve-tx", patch.tx);
      if (patch.ty != null) el.setAttribute("data-ve-ty", patch.ty);
      if (patch.scale != null) el.setAttribute("data-ve-scale", patch.scale);
      var tx = parseFloat(el.getAttribute("data-ve-tx") || "0") || 0;
      var ty = parseFloat(el.getAttribute("data-ve-ty") || "0") || 0;
      var sc = parseFloat(el.getAttribute("data-ve-scale") || "1");
      if (isNaN(sc) || sc <= 0) sc = 1;
      var parts = [];
      if (tx !== 0 || ty !== 0) parts.push("translate(" + tx + "px, " + ty + "px)");
      if (sc !== 1) parts.push("scale(" + sc + ")");
      var transformVal = parts.join(" ");
      if (transformVal && el.style.transform !== transformVal) {
        el.style.transform = transformVal;
      }
    }

    if (typeof patch.imageSrc === "string" && patch.imageSrc) {
      if (el.tagName.toLowerCase() === "img") {
        if (el.getAttribute("src") !== patch.imageSrc) {
          el.setAttribute("src", patch.imageSrc);
        }
      } else {
        var bgVal = 'url("' + patch.imageSrc + '")';
        if (el.style.backgroundImage !== bgVal) {
          el.style.backgroundImage = bgVal;
          if (!el.style.backgroundSize) el.style.backgroundSize = "cover";
          if (!el.style.backgroundPosition) el.style.backgroundPosition = "center";
        }
        if (el.tagName.toLowerCase() === "svg") {
          for (var s = 0; s < el.children.length; s++) {
            el.children[s].style.display = "none";
          }
        } else if (el.children.length === 1 && el.children[0].tagName.toLowerCase() === "svg") {
          el.children[0].style.display = "none";
        }
      }
    }
  }

  function assignUniqueCloneIds(node, suffix) {
    if (!node || node.nodeType !== 1) return;
    if (node.id && document.getElementById(node.id)) {
      node.id = node.id + suffix;
    }
    var withId = node.querySelectorAll ? node.querySelectorAll("[id]") : [];
    for (var i = 0; i < withId.length; i++) {
      if (document.getElementById(withId[i].id)) {
        withId[i].id = withId[i].id + suffix;
      }
    }
  }

  function applyScopeData(scopeData) {
    if (!scopeData) return;

    // 1. Apply chronological structural operations (duplicate / reorder)
    if (Array.isArray(scopeData.ops)) {
      scopeData.ops.forEach(function (op, idx) {
        if (!op || !op.selector) return;
        var marker = "data-ve-op-" + idx;
        if (document.querySelector("[" + marker + '="1"]')) return;
        var el = null;
        try { el = document.querySelector(op.selector); } catch (e) { el = null; }
        if (!el || !el.parentElement) return;

        if (op.type === "duplicate") {
          var clone = el.cloneNode(true);
          clone.removeAttribute("data-ve-selected");
          clone.removeAttribute("data-ve-hover");
          clone.removeAttribute("contenteditable");
          clone.removeAttribute("spellcheck");
          assignUniqueCloneIds(clone, op.suffix || ("-copy-" + (idx + 1)));
          el.parentElement.insertBefore(clone, el.nextSibling);
          clone.setAttribute(marker, "1");
        } else if (op.type === "reorder") {
          if (op.direction === "up" && el.previousElementSibling) {
            el.parentElement.insertBefore(el, el.previousElementSibling);
            el.setAttribute(marker, "1");
          } else if (op.direction === "down" && el.nextElementSibling) {
            el.parentElement.insertBefore(el.nextElementSibling, el);
            el.setAttribute(marker, "1");
          }
        }
      });
    }

    // Backward compatibility for legacy reorders array
    if (Array.isArray(scopeData.reorders)) {
      scopeData.reorders.forEach(function (op, idx) {
        if (!op || !op.selector) return;
        var el = null;
        try { el = document.querySelector(op.selector); } catch (e) { el = null; }
        if (!el || !el.parentElement) return;
        var marker = "data-ve-reordered-" + idx;
        if (el.hasAttribute(marker)) return;
        if (op.direction === "up" && el.previousElementSibling) {
          el.parentElement.insertBefore(el, el.previousElementSibling);
          el.setAttribute(marker, "1");
        } else if (op.direction === "down" && el.nextElementSibling) {
          el.parentElement.insertBefore(el.nextElementSibling, el);
          el.setAttribute(marker, "1");
        }
      });
    }

    // 2. Apply property/text/style/image patches
    if (scopeData.patches && typeof scopeData.patches === "object") {
      Object.keys(scopeData.patches).forEach(function (selector) {
        var patch = scopeData.patches[selector];
        var el = null;
        try {
          el = document.querySelector(selector);
        } catch (e) {
          el = null;
        }
        if (el) applyPatchToElement(el, patch);
      });
    }
  }

  function applyCurrentScope() {
    if (!editsData || !editsData.scopes || isApplying) return;
    var scope = getCurrentScope();
    var scopeData = editsData.scopes[scope];
    if (!scopeData) return;

    isApplying = true;
    try {
      applyScopeData(scopeData);
    } finally {
      isApplying = false;
    }
  }

  function scheduleApply() {
    if (applyScheduled || isApplying) return;
    applyScheduled = true;
    Promise.resolve().then(function () {
      applyScheduled = false;
      applyCurrentScope();
    });
  }

  function startObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver(function () {
      if (!isApplying) scheduleApply();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.__VE_APPLY_DATA__ = function (newData) {
    if (newData && typeof newData === "object") {
      editsData = newData;
      applyCurrentScope();
    }
  };

  async function init() {
    if (window.location.protocol === "file:") {
      startObserver();
      return;
    }
    try {
      var res = await fetch(editsUrl + (editsUrl.indexOf("?") === -1 ? "?t=" : "&t=") + Date.now(), {
        cache: "no-store",
      });
      if (!res.ok) return;
      var parsed = await res.json();
      if (!parsed || typeof parsed !== "object" || !parsed.scopes) return;
      editsData = parsed;
      applyCurrentScope();
      startObserver();
    } catch (e) {
      // No visual-edits.json or failed silently -> leave original prototype intact
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
