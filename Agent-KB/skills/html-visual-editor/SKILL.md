---
name: html-visual-editor
description: 为本地静态 HTML 原型提供可视化直改、0.5s 防抖/失焦自动写回原 .html 文件，以及停顿 6s 自动部署 Vercel Production（公网整站只读）。支持文字直改、8 向缩放、W/H 与等比 Scale、字体加粗/对齐、Cmd/Ctrl+D 复制、样式显隐、拖拽与调序、图片直换落盘相对路径。
argument-hint: "[HTML file or project directory path]"
---

# HTML Visual Editor

用于本地静态 HTML 原型的所见即所得直改、本地原文件自动写回与 Vercel 公网自动同步。

## 核心能力与边界

1. **文字与样式直改**：开启「页面编辑」后拦截原跳转/表单；点击文字纯文本直改，停顿 `500ms` 或失焦自动写回原 `.html`；支持 8 向拖拽缩放（`Shift`/锁定等比）、W/H 与 Scale (%)、加粗/对齐、颜色/字号/内外边距/圆角、显隐恢复。
2. **组件复制、调序、拖拽与换图**：`Cmd/Ctrl+D` 同级复制（自动生成唯一 `id`）、上下调序、`Alt/Option` 自由拖拽；点击或拖入图片直接替换，自动保存至 `./assets/images/` 并以相对路径写回。
3. **纯净写回与多画板/iframe 兼容**：纯静态 HTML 写回后不残留编辑器 UI 或脚本；JS 动态渲染 / 多 `<iframe>` 原型在父窗口统一挂载面板，改动存 `visual-edits.json` 并通过极简只读加载器 `.visual-editor/ve-apply.js` 生效。
4. **自动部署与公网整站只读**（遵循 `pm-delivery-workflow` 第 4 步公网只读红线）：本地落盘后进入 `6s` 静默合并倒计时（可开关或手动一键发布），自动执行 `vercel deploy --prod --yes`（未关联时先 `vercel link --yes`）；在非本地公网域名（如 `*.vercel.app`）下完全禁用编辑器与一切修改能力。

## 启用方式

1. **通用守护服务 + Chrome 扩展（双击任意本地 `.html` 即出现编辑开关）**：
   ```bash
   /usr/local/bin/node ~/.gemini/config/skills/html-visual-editor/scripts/universal-edit-daemon.mjs --port 4199
   ```
   在 `chrome://extensions/` 开启开发者模式 → 加载已解压扩展 `~/.gemini/config/skills/html-visual-editor/chrome-extension` → 详情页开启「允许访问文件网址」。
2. **单项目本地自动保存 + Vercel 自动同步服务**：
   ```bash
   /usr/local/bin/node ~/.gemini/config/skills/html-visual-editor/scripts/visual-edit-server.mjs \
     --root <html-project-dir> --port 4180
   ```
   可选：`--deploy-delay <ms>`（默认 `6000`）、`--prod-alias <url>`、`--no-auto-deploy`。
3. **显式注入单 HTML 文件**：
   ```bash
   /usr/local/bin/node ~/.gemini/config/skills/html-visual-editor/scripts/inject-visual-editor.mjs --html <path/to/index.html>
   ```

## 验证清单

- [ ] 左上角出现可拖动编辑面板，含本地保存与 Vercel 同步状态栏。
- [ ] 改字停顿 `0.5s`/失焦后显示 `已自动保存至 HTML ✓`，停顿 `6s`（或手动触发）自动执行 `vercel deploy --prod --yes` 并更新公网链接。
- [ ] 公网 Vercel 页面展示最新内容、无编辑器残留、整站只读。
