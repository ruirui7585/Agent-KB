# 通用版高保真 HTML 原型讲解器

## 项目用途

这是一个本地运行的 MVP 工具，用于导入静态 HTML 原型项目，在原型上创建产品标注，手动维护功能与场景，并导出可继续编辑的项目 JSON 或可双击打开的单文件分享版 HTML。

## 如何启动

路径：

`/Users/shilv/Agent-Workspace/Projects/personal/Universal version html`

命令：

```bash
npm install
npm run dev
```

浏览器访问本地服务地址，通常是 `http://127.0.0.1:5173/`。

## 如何导入原型项目

顶部提供三种导入方式：

- 导入单 HTML：选择一个可直接运行的 `.html` 文件。
- 导入文件夹：选择完整静态原型目录，会使用 `webkitRelativePath` 保留目录结构。
- 导入 ZIP：上传 ZIP 后服务端解压，并阻止路径穿越。

导入后服务端保存到：

`imported-prototypes/<prototype-id>/`

然后通过真实 HTTP 地址加载：

`/prototypes/<prototype-id>/<entry-file>`

如果根目录没有 `index.html`，编辑器会扫描所有 HTML 文件并要求选择入口文件。当前只支持可直接运行的静态原型目录；如果检测到 `package.json` 但没有 `dist/`，需要先构建并导入 `dist/`。

## 如何新建功能

点击左侧「+」按钮，填写功能名称、功能说明、关联页面名称。功能会显示在左侧树的第一层。

## 如何新建场景

在某个功能行点击「场景」，填写场景名称、说明、进入方式、状态参数、操作指引、推荐操作和预期结果。也可以先创建「分组」，再在分组下创建场景。

## 四种场景进入方式

- 原型状态控制：调用导入原型里的 `window.setPrototypeState(state)`。
- URL 参数：保存 URL 参数配置，并在切换场景时重新加载原型。
- 操作指引：不自动改原型，展示人工步骤。
- 只做说明：只切换右侧说明，不改变原型。

## 如何添加标注

先选择一个场景，再切到「标注模式」，在中间原型区域点击即可添加编号标注。标注保存相对百分比位置，支持点击编辑、拖动位置和删除。

## 如何保存

点击「保存项目」会保存到浏览器 `localStorage`。编辑时也会保存草稿，刷新页面后自动恢复。

## 如何导出项目 JSON

点击「导出项目 JSON」下载 `prototype-project.json`。该文件包含项目名称、原型入口信息、功能、分组、场景、标注和设置，可用于备份编辑数据。

## 如何导出分享版 HTML

点击「导出分享版 HTML」下载单文件 HTML。分享版包含原型、场景、标注和交互脚本，不依赖本地编辑器、数据库、localStorage 或 npm 包。

## 如何在其他电脑继续编辑

在原电脑导出项目 JSON，在新电脑打开本项目后点击「导入项目 JSON」，选择该文件即可恢复项目。

## 如何上传分享版 HTML 到 GitHub Pages

将导出的分享版 HTML 放到 GitHub 仓库，例如命名为 `index.html`，开启 GitHub Pages 后即可通过网页访问。分享版是单文件，不需要额外资源。

## 原型状态协议

导入的 HTML 可以暴露：

```js
window.PROTOTYPE_CONFIG = {
  name: "IM Chat Prototype",
  states: {
    chatType: ["free", "paid"],
    acceptStatus: ["pending", "accepted", "rejected"]
  }
};

window.setPrototypeState = function (state) {
  // 根据 state 更新原型
};
```

编辑器会尝试读取 `PROTOTYPE_CONFIG`，并在场景编辑区提供候选状态；点击场景时会尝试调用 `setPrototypeState(scene.state)`。

## 当前 MVP 限制

- 支持单 HTML、静态文件夹和 ZIP；不支持直接运行 Vue/React 源码项目。
- AI 辅助为本地规则模拟，未接入外部大模型 API。
- 拖动排序暂未实现。
- 导入的原型项目会保存到 `imported-prototypes/`，该目录是本地运行产物。
- localStorage 适合本地 MVP，不适合作为多人协作或云同步方案。

## 文件结构

```text
index.html
styles.css
app.js
storage.js
exporter.js
prototype-bridge.js
ai-helper.js
demo-data.js
README.md
DELIVERY_CHECKLIST.md
docs/
tests/
```

本项目是高保真交互参考和 PM 讲解工具，不是生产代码。
