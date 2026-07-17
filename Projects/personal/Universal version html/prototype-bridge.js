export async function savePrototypeHtml(html, fileName = "prototype.html") {
  const file = new File([html], fileName, { type: "text/html" });
  return uploadPrototypeProject([file], { type: "html", relativePaths: [fileName] });
}

export async function uploadPrototypeProject(files, options = {}) {
  const formData = new FormData();
  const type = options.type || "folder";
  formData.append("type", type);
  if (type === "zip") {
    formData.append("zip", files[0]);
  } else {
    const relativePaths = options.relativePaths || files.map((file) => file.webkitRelativePath || file.name);
    files.forEach((file) => formData.append("files", file, file.name));
    formData.append("relativePaths", JSON.stringify(relativePaths));
  }
  const response = await fetch("/api/prototype-projects", {
    method: "POST",
    body: formData
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "导入原型项目失败");
  }
  return payload;
}

export function renderPrototypeUrl(frame, sourceUrl, options = {}) {
  frame.removeAttribute("srcdoc");
  if (!sourceUrl) {
    frame.src = "about:blank";
    return;
  }
  const query = (options.urlParams || "").trim().replace(/\s+/g, "&").replace(/^\?/, "");
  frame.src = `${sourceUrl}${query ? `${sourceUrl.includes("?") ? "&" : "?"}${query}` : ""}`;
}

export function readPrototypeConfig(frame) {
  try {
    return frame.contentWindow?.PROTOTYPE_CONFIG || null;
  } catch {
    return null;
  }
}

export function applySceneToPrototype(frame, project, scene) {
  if (!scene || !project.sourceUrl) return { ok: true, message: "" };
  if (scene.entryType === "url") {
    renderPrototypeUrl(frame, project.sourceUrl, { urlParams: scene.urlParams });
    return { ok: true, message: scene.guide || "已通过 URL 参数重新加载原型。" };
  }
  if (scene.entryType === "guide") {
    return { ok: true, message: scene.guide || "请按操作指引手动调整原型。" };
  }
  if (scene.entryType === "note") {
    return { ok: true, message: "" };
  }
  if (scene.entryType === "state") {
    let state = {};
    try {
      state = scene.stateJson ? JSON.parse(scene.stateJson) : {};
    } catch {
      return { ok: false, message: "状态 JSON 格式不正确，无法调用原型状态协议。" };
    }
    try {
      const fn = frame.contentWindow?.setPrototypeState;
      if (typeof fn !== "function") {
        return { ok: false, message: "当前原型不支持自动状态切换，请使用操作指引或说明模式。" };
      }
      fn(state);
      return { ok: true, message: "" };
    } catch (error) {
      return { ok: false, message: `调用 window.setPrototypeState 失败：${error.message}` };
    }
  }
  return { ok: true, message: "" };
}
