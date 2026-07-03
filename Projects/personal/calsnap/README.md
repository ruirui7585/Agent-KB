# FoodMind

## 唯一正式本地页面

正式静态输出目录：

`/Users/shilv/Agent-Workspace/Projects/personal/calsnap/web`

固定入口文件：

`/Users/shilv/Agent-Workspace/Projects/personal/calsnap/web/index.html`

本项目是原生 HTML/CSS/JavaScript 页面，没有重复的 `dist/` 或 `build/` 目录。`web/` 同时是活动源文件和本地正式输出目录。

每次修改后必须执行：

```bash
npm run build
```

构建会检查资源引用和 JavaScript 语法，并把当前正式输出的文件哈希写入：

`web/build-manifest.json`

## 本地运行

路径：

`/Users/shilv/Agent-Workspace/Projects/personal/calsnap`

命令：

```bash
npm run build
npm run dev
```

固定访问地址：

`http://127.0.0.1:4174/`

本地预览服务会从 `web/` 读取页面、关闭静态资源缓存，并把 `/api/` 请求转发到本地 FoodMind API。

不要再打开已移除的 `app/public/` 旧页面，也不要使用 `file://` 作为正式预览方式。
