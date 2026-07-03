# Changelog

## 2026-07-03

- 固化每次修改后必须执行的 `npm run build` 流程。
- 新增 `web/build-manifest.json` 正式输出清单，用哈希验证本地页面已同步。
- 新增项目级 `AGENTS.md`，固定项目目录、预览根目录和交付报告格式。
- 将 `web/` 确认为 FoodMind 唯一正式静态输出目录。
- 移除 `app/public/` 下的旧版重复页面。
- 新增固定的 `npm run dev` 本地预览命令。
- 本地预览统一使用 `127.0.0.1:4174`，并代理 `/api/` 到本地 API。
- 对 HTML、CSS、JavaScript 和 Service Worker 使用新版本标识，并在本地预览中禁用静态资源缓存。
