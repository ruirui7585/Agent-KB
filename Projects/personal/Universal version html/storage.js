export const STORAGE_KEY = "universal-html-prototype-explainer";

export function createEmptyProject() {
  const now = new Date().toISOString();
  return {
    version: "1.0",
    project: {
      id: crypto.randomUUID(),
      name: "通用版 HTML 原型讲解器",
      description: "本地 MVP 项目",
      createdAt: now,
      updatedAt: now
    },
    sourceHtml: "",
    sourceUrl: "",
    sourceFileName: "",
    prototypeId: "",
    entryFile: "",
    sourceKind: "",
    fileCount: 0,
    htmlFiles: [],
    functions: [],
    sceneGroups: [],
    scenes: [],
    annotations: [],
    settings: {
      mode: "annotate",
      viewport: "original",
      selectedFeatureId: "",
      selectedSceneId: "",
      selectedAnnotationId: ""
    }
  };
}

export function normalizeProject(input) {
  const base = createEmptyProject();
  const project = {
    ...base,
    ...input,
    project: { ...base.project, ...(input?.project || {}) },
    settings: { ...base.settings, ...(input?.settings || {}) },
    functions: Array.isArray(input?.functions) ? input.functions : [],
    sceneGroups: Array.isArray(input?.sceneGroups) ? input.sceneGroups : [],
    scenes: Array.isArray(input?.scenes) ? input.scenes : [],
    annotations: Array.isArray(input?.annotations) ? input.annotations : [],
    htmlFiles: Array.isArray(input?.htmlFiles) ? input.htmlFiles : []
  };
  project.version = project.version || "1.0";
  return project;
}

export function saveProject(project) {
  const next = normalizeProject(project);
  next.project.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeProject(JSON.parse(raw));
  } catch (error) {
    console.warn("无法读取本地项目", error);
    return null;
  }
}

export function clearProject() {
  localStorage.removeItem(STORAGE_KEY);
}
