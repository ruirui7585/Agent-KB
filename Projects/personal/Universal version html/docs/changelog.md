# Changelog

## v0.1.0 - Initial MVP

### Added

- 单页面桌面工作台。
- 单文件 HTML 导入和 iframe 预览。
- 功能、场景分组、场景 CRUD。
- 四种场景进入方式的数据结构和状态协议调用。
- 标注新增、拖动、编辑、删除。
- 本地规则模拟 AI 辅助区。
- localStorage 保存和刷新恢复。
- 项目 JSON 导入导出。
- 单文件分享版 HTML 导出。
- IM 聊天和视频通话示例项目。

## v0.1.2 - Static Prototype Project Import

### Added

- 支持导入单 HTML、完整文件夹和 ZIP。
- 文件夹导入使用 `webkitRelativePath` 保留目录结构。
- ZIP 导入服务端解压并阻止路径穿越。
- 根目录无 `index.html` 时扫描 HTML 并选择入口。
- 新增“新标签打开原型”用于验证原始还原。

### Changed

- 导入原型项目保存到 `imported-prototypes/<prototype-id>/`，通过 `/prototypes/<prototype-id>/<entry>` 加载。

## v0.1.1 - HTTP Prototype Runtime

### Changed

- 导入 HTML 后先写入本地静态原型目录，再通过真实 HTTP URL 加载 iframe。
- 编辑器正式原型渲染不再使用 `srcdoc` 或 Blob URL。
- 注释层继续在 iframe 外部独立叠加，不修改原型 DOM、CSS、viewport 和布局。

### Risks

- 真实 AI API、多人协作和云同步未实现。
