# API Fields

本地 MVP 暂无后端 API。以下为项目 JSON 数据字段，可作为后续接口设计基础。

| Field | Type | Meaning | Example | Required | Notes |
| --- | --- | --- | --- | --- | --- |
| version | string | 项目数据版本 | 1.0 | yes | 用于未来兼容 |
| project | object | 项目基本信息 | `{ name }` | yes | 包含 id、名称、更新时间 |
| sourceHtml | string | 单 HTML 原始内容 | `<!doctype html>` | no | 多文件项目可为空 |
| sourceUrl | string | 本地 HTTP 原型页面 URL | `/prototypes/abc123/index.html` | no | 编辑器 iframe 正式加载地址 |
| prototypeId | string | 导入原型目录 ID | `abc123` | no | 对应 imported-prototypes 子目录 |
| entryFile | string | 原型入口文件 | `index.html` | no | 可由用户选择 |
| sourceKind | string | 导入方式 | html / folder / zip | no | 用于恢复和提示 |
| fileCount | number | 导入文件数量 | 12 | no | 服务端返回 |
| functions | array | 功能列表 | `IM聊天` | yes | 左侧一级节点 |
| sceneGroups | array | 场景分组 | `免费聊天` | yes | 左侧二级节点 |
| scenes | array | 场景列表 | `余额不足` | yes | 左侧三级节点 |
| annotations | array | 标注列表 | `输入框` | yes | 保存百分比位置 |
| settings | object | 当前选择和视图配置 | `{ mode }` | yes | 用于恢复编辑状态 |
