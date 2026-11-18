# 项目结构和交付清单

## 使用原则

项目结构要随交付目标增长，不要默认把轻量原型扩成大型工程。

分三档处理：

1. **MVP 原型**：只保留核心五文件和 assets。
2. **模块化 H5 原型**：增加页面、组件、分层 CSS/JS。
3. **专业交付包**：增加文档、演示、截图、版本归档和配置文件。

已有项目结构优先。新增目录前必须确认用户需要，或任务明确涉及该目录职责。

## 1. MVP 核心结构

适合单入口、多状态、多页面由 JS 渲染的 HTML 原型：

```text
product-prototype/
├── index.html
├── style.css
├── app.js
├── data.js
├── state.js
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

职责：
- `index.html`：入口壳和脚本引用。
- `style.css`：全局样式和页面样式。
- `app.js`：渲染、路由、交互、注释器。
- `data.js`：mock 数据、配置、资源。
- `state.js`：状态默认值、状态更新、派生状态。
- `assets/`：图片、图标、字体。

## 2. 页面与组件扩展

当用户明确要求多页面、落地页、独立登录页、独立设置页时，可增加：

```text
pages/
├── login.html
├── home.html
├── profile.html
└── settings.html

components/
├── header.html
├── footer.html
└── modal.html
```

规则：
- 如果当前原型是 SPA 样式，不要主动拆成多个 HTML。
- `pages/` 适合真实多页面 H5；`renderXxxPage()` 适合原型内路由。
- `components/` 只能放可复用片段，不要把业务状态塞进组件 HTML。
- 局部修改时不要新增页面文件，除非用户明确要“独立页面”。

## 3. 样式扩展

当样式文件过大、多个页面需要共享样式时，可增加：

```text
css/
├── reset.css
├── variables.css
├── layout.css
├── components.css
└── responsive.css
```

可选 Sass：

```text
scss/
└── main.scss
```

规则：
- 原生 HTML/CSS/JS 原型默认不需要 Sass。
- 不要为了分类而拆 CSS；只有样式规模或复用需要时再拆。
- 变量应集中在 `variables.css` 或 `:root`，不要页面里散落新色值。
- 局部 patch 优先修改现有 owner 文件。

## 4. 脚本扩展

当逻辑复杂度提升时，可增加：

```text
js/
├── utils.js
├── api.js
├── router.js
└── validators.js

libs/
├── jquery.min.js
└── vue.min.js
```

规则：
- 本 skill 限定为原生 HTML/CSS/JS 多文件 H5 原型。
- 不要主动引入 Vue / jQuery / 第三方库，除非项目已使用或用户明确要求。
- `utils.js`：只放多处复用的纯工具函数。
- `api.js`：只放 mock API 或接口模拟。
- `router.js`：只在路由逻辑已经复杂到影响维护时拆出。
- `validators.js`：只在表单校验较多时拆出。

## 5. 文档交付

专业交付建议补齐：

```text
README.md
CHANGELOG.md
交付清单.md
docs/
├── 原型说明.md
├── 交互说明.md
├── 接口文档.md
└── 需求文档.pdf
```

规则：
- `README.md`：预览方式、文件结构、关键状态、导出说明。
- `CHANGELOG.md`：版本变更、风险、下一步。
- `交付清单.md`：交付文件、预览地址、依赖 assets、已知问题。
- 不要把文档写成通用模板；要写当前项目的真实状态。

## 6. 配置文件

按需要增加：

```text
package.json
.gitignore
favicon.ico
manifest.json
```

规则：
- 没有 npm 工作流时，不要主动创建 `package.json`。
- `manifest.json` 只在 PWA 或移动安装演示需要时创建。
- `favicon.ico` 属于交付细节，不影响主原型可用性。

## 7. 演示和截图

专业评审或客户演示可增加：

```text
demo/
├── demo-data.js
└── walkthrough.html

screenshots/
├── desktop/
├── tablet/
└── mobile/
```

规则：
- `demo-data.js` 用于演示场景，不要污染主 `data.js`。
- `walkthrough.html` 用于引导评审，不替代主原型。
- 截图应对应当前主版本，不要混入旧版本截图。

## 8. 版本归档

可选结构：

```text
v1.0/
v1.1/
latest/ -> v1.1/
```

规则：
- 归档目录只用于交付备份，不作为当前开发目录。
- 当前开发必须有唯一主版本目录。
- 不要读写 `backup`、`broken`、`checkpoint`、旧版本目录，除非用户明确要求。
- 使用 `latest` 时必须确认它指向当前主版本。

## 9. 创建文件的判断

新增文件前问自己：

1. 用户是否明确要求这个文件？
2. 当前任务是否没有它就无法完成？
3. 这个文件是否有明确 owner 和职责？
4. 会不会导致局部修改变成重构？
5. 是否会影响当前预览路径或导出能力？

如果答案不清楚，优先不创建。

## 10. 推荐交付结构

当用户要求“完整专业 H5 原型交付包”时，可使用：

```text
product-prototype/
├── index.html
├── style.css
├── app.js
├── data.js
├── state.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── docs/
│   ├── 原型说明.md
│   ├── 交互说明.md
│   └── 接口文档.md
├── demo/
│   ├── demo-data.js
│   └── walkthrough.html
├── screenshots/
│   ├── desktop/
│   ├── tablet/
│   └── mobile/
├── README.md
├── CHANGELOG.md
├── 交付清单.md
├── .gitignore
└── favicon.ico
```

如果用户要求多页面 H5，再补 `pages/` 和 `components/`。
