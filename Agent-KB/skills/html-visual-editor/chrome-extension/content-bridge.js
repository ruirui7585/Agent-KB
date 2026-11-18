(function () {
  "use strict";
  if (window.__VE_CONTENT_BRIDGE_LOADED__) return;
  window.__VE_CONTENT_BRIDGE_LOADED__ = true;

  // Relay API calls from MAIN world visual-editor.js -> MV3 background worker -> 127.0.0.1:4199
  window.addEventListener("message", function (event) {
    if (event.source !== window || !event.data || !event.data.__veBridgeRequest) return;
    var req = event.data;
    chrome.runtime.sendMessage(
      {
        type: "VE_BRIDGE_FETCH",
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        bodyBase64: req.bodyBase64,
      },
      function (resp) {
        if (chrome.runtime.lastError) {
          window.postMessage(
            { __veBridgeResponse: true, id: req.id, ok: false, error: chrome.runtime.lastError.message },
            "*"
          );
          return;
        }
        window.postMessage(
          Object.assign({ __veBridgeResponse: true, id: req.id }, resp || { ok: false, error: "Empty response" }),
          "*"
        );
      }
    );
  });

  // Automatically mount compact entry bar on any local file:// HTML page
  if (window.location.protocol === "file:" && document.contentType === "text/html" && document.body) {
    chrome.runtime.sendMessage({ type: "VE_AUTO_INJECT_FILE_PAGE" });
  }
})();
