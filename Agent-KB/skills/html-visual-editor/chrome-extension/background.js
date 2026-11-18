// Background Service Worker: injects runtime into local pages & relays fetch to 127.0.0.1:4199

async function injectEditorIntoTab(tabId, autoActivate) {
  const [{ result: alreadyLoaded }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (activateNow) => {
      if (window.location.protocol === "file:") {
        window.__VE_EXTENSION_BRIDGE__ = true;
      }
      if (window.__HTML_VISUAL_EDITOR_LOADED__) {
        if (activateNow && typeof window.__VE_TOGGLE_PANEL__ === "function") {
          window.__VE_TOGGLE_PANEL__();
        }
        return true;
      }
      window.HTMLVisualEditorConfig = Object.assign(
        {
          defaultActive: Boolean(activateNow),
          collapsed: !activateNow,
        },
        window.HTMLVisualEditorConfig || {}
      );
      return false;
    },
    args: [Boolean(autoActivate)],
  });

  if (alreadyLoaded) return;

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["runtime/visual-editor.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    files: ["runtime/ve-apply.js", "runtime/visual-editor.js"],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id || !tab.url) return;
  if (!tab.url.startsWith("file://") && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(tab.url)) {
    return;
  }
  if (tab.url.startsWith("file://")) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-bridge.js"],
      });
    } catch (e) {
      // bridge may already be injected
    }
  }
  try {
    await injectEditorIntoTab(tab.id, true);
  } catch (err) {
    console.error("Failed to inject Visual Editor:", err);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  if (msg.type === "VE_AUTO_INJECT_FILE_PAGE") {
    if (sender && sender.tab && sender.tab.id) {
      injectEditorIntoTab(sender.tab.id, false)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }
    return;
  }

  if (msg.type === "VE_BRIDGE_FETCH") {
    (async () => {
      try {
        const fetchOpts = {
          method: msg.method || "GET",
          headers: msg.headers || {},
          cache: "no-store",
        };
        if (msg.bodyBase64) {
          const bin = atob(msg.bodyBase64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          fetchOpts.body = bytes;
        } else if (typeof msg.body === "string" && fetchOpts.method !== "GET" && fetchOpts.method !== "HEAD") {
          fetchOpts.body = msg.body;
        }
        const res = await fetch(msg.url, fetchOpts);
        const text = await res.text();
        sendResponse({ ok: res.ok, status: res.status, text });
      } catch (err) {
        sendResponse({ ok: false, status: 0, error: err instanceof Error ? err.message : String(err) });
      }
    })();
    return true;
  }
});
