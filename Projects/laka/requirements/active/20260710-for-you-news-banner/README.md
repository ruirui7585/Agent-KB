# Laka 关系新闻墙（News Wall）原型

Laka 社交 App 首页关系事件聚合功能的高保真原型。

## 项目结构

```
foryou-newsbanner/
├── newsbanner.html        # 主页面（结构 + 外联引用 CSS/JS）
├── REQUIREMENTS.md        # 需求规格文档（12 章）
├── README.md              # 本文件
├── css/
│   └── style.css          # 全部样式（设计 Token + 主样式）
├── js/
│   └── app.js             # 业务逻辑（图标/头像/数据/轮播/视图栈/排行榜/Highlights）
└── .workbuddy/memory/     # 工作记录
```

## 文件说明

### newsbanner.html
单页三状态原型（`show-home` / `show-highlights` / `show-rank`），通过外联引用 CSS 和 JS。

### css/style.css
- `:root` 设计 Token（主色 `#6237ee`、标题色、背景、圆角、阴影等）
- `@import` 引入 Google Fonts Inter（400–900）
- 主样式：状态栏 / 顶部栏 / Banner / 信息流 / 底部导航 / Highlights 动态流 / 排行榜

### js/app.js
- `CP_SVG` / `GUARD_SVG` / `FIRE_SVG`：关系与火焰图标 SVG 常量
- `menaAvatar(name, i)`：中东男女扁平风头像生成（按名字识别性别，男性短发、女性 hijab/长发，多肤色）
- `genderOf(name)`：按 `MALE_NAMES` 名单判定性别
- `sceneDataUri(i)`：画廊照片渐变占位
- `items`：Banner 轮播数据（4 条关系事件）
- `rankData`：排行榜数据（cp / guard）
- 轮播逻辑（2500ms）、视图栈（`viewStack`）、`openRank(type)` 排行榜渲染

## 如何运行

可直接双击用浏览器打开（`file://` 即可，无网络依赖），或本地 HTTP 服务：

```bash
cd /Users/shilv/Agent-Workspace/Projects/laka/foryou-newsbanner
python3 -m http.server 8765
```

浏览器访问：`http://localhost:8765/newsbanner.html`

## 设计目标

| 项 | 值 |
|---|---|
| 设备 | iPhone 16（393 × 852 pt） |
| 市场 | MENA（中东及北非） |
| UI 文案 | 英文 + 阿拉伯文混合 |
| 主色 | `#6237ee` |
| 字体 | Inter |

## 三级页面结构

1. **Home 首页**：For You 顶部栏（🏆 排行榜入口） + Laka News Banner（轮播） + 用户信息流 + 底部导航
2. **Laka Highlights 关系动态流**：Tab 过滤（All/Relationships/Gifts/Lucky） + CP 升级卡 / 奢华礼物卡 / 幸运中奖卡
3. **关系排行榜**：周期切换（Daily/Weekly/Monthly） + 倒计时 + Top3 领奖台 + 列表 + 自己状态行

## 交互流程

```
Home ──点 Banner──→ Laka Highlights 动态流 ──点 CP 卡 View Relationship──→ 关系排行榜
  │                                                                          │
  └──点 🏆 奖杯──→ 关系排行榜（直跳）                                           └──点 ‹ 返回──→ Highlights
```

## 备注

- 头像由 JS 本地生成（SVG），不依赖网络图片，断网永不白屏。
- 原型注释面板（`annotation-panel` / `js/annotation.js`）已剥离，原型现仅含产品功能，可直接用于评审与开发对接。
