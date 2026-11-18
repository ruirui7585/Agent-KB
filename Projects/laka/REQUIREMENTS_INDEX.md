# Laka 项目内容分类与需求索引

> 本文件作为 Laka 项目（`/Users/shilv/Agent-Workspace/Projects/laka`）的全局内容分类导航与需求台账。

---

## 一、项目内容按类型归类总览

| 内容类别 | 目录 / 文件路径 | 核心职责与包含内容 |
| --- | --- | --- |
| **1. 全局规则与公共上下文** | `AGENTS.md`<br>`PROJECT_CONTEXT.md`<br>`DECISIONS.md`<br>`REQUIREMENTS_INDEX.md`<br>`CHATGPT_CONTEXT.md` | 定义项目 AI 协作协议、市场与商业化基础认知、已确认长期决策、需求总台账及跨工具上下文镜像 |
| **2. 产品需求与原型交付包** | `requirements/active/`<br>`requirements/archive/2026/` | 按需求维度管理 `README.md`、`PRD.md`、高保真/线框 HTML 评审原型及专属 `assets/`（活跃需求按 4 大业务方向归类见下文） |
| **3. 真实产品 UI 基线与规范** | `ui/UI_SYSTEM.md`<br>`ui/references/`<br>`ui/screens/` | 全局设计系统规范、iOS 1.4.7 真机参考图库（34 张唯一截图），以及 8 个核心页面基线（`home-for-you`、`im-chat`、`conversation-list`、`user-profile`、`voice-room`、`cp-relationship`、`private-content`、`checkout`；`guardian` 待补充） |
| **4. 公共品牌与视觉素材库** | `assets/asset-manifest.md`<br>`assets/lanhu/` | 跨页面视觉素材清单与 40 张蓝湖封面参考（`avatars/`、`backgrounds/`、`icons/`、`shared/` 等正式切图待补充） |
| **5. 竞品监控与行业情报** | `agents/competitor-analysis/` | 针对 SUGO、Timo 等核心竞品的监控规则（`AGENT.md`）、竞品池、产品台账与监控报告（`reports/`） |
| **6. 业务数据报表** | `data/laka-ad-daily-report-20260715.xlsx` | 渠道获客与广告投放日报数据 |
| **7. Axhub Make 原型工程工具链** | `make/` | React + Vite 原型构建与预览工作台，含工程规则（`make/rules/`）、Excalidraw 线框草稿（`make/src/resources/`）、示例原型（`make/src/prototypes/`）与主题库（`make/src/themes/`） |

---

## 二、活跃需求分类索引（`requirements/active/`）

### 1. 首页与推荐分发类

| 需求 | 优先级 | 文档状态 | 产品状态 | 关联模块 | 当前目录与核心入口 | 阻塞/待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| 首页 For You 关系新闻墙 | 待定 | Ready for Delivery | Proposed | 首页 For You、关系事件墙、排行榜 | `requirements/active/20260710-for-you-news-banner/`<br>PRD：`PRD.md`<br>原型：`index.html` | 以反推规格与本地原型为准，待正式立项确认 |

### 2. 礼物与商业化打赏类

| 需求 | 优先级 | 文档状态 | 产品状态 | 关联模块 | 当前目录与核心入口 | 阻塞/待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| 心愿单礼物（Wishlist Gift） | 待定 | Draft | Proposed | 礼物面板、个人心愿单、后台配置 | `requirements/active/20260710-wishlist-gift/`<br>文档：`README.md`、`docs/`<br>原型：`index.html`、`prototype/index.html` | 前后台口径已整理至 `docs/`，待合并统一 `PRD.md` |
| 礼物系统配置优化 | 待定 | Draft | Proposed | 礼物管理、语音房、私聊、关系与等级 | `requirements/active/20260720-gift-system-optimization/`<br>PRD：`PRD.md`<br>原型：`prototype.html`、`announcement-prototype.html` | 多玩法规则、CP/Guardian 失败策略、全服范围、Banner 格式、音乐混音 |

### 3. VIP、荣誉与身份特权类

| 需求 | 优先级 | 文档状态 | 产品状态 | 关联模块 | 当前目录与核心入口 | 阻塞/待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| SALFA VIP 体系与运营后台 | 待定 | Ready for Delivery (前台原型) / Draft (后台字段) | Proposed | VIP 中心、权益设置、转赠与后台下发 | `requirements/active/20260902-salfa-vip/`<br>PRD：`PRD.md`<br>原型：`index.html` | 后台字段表待确认（部分 TBD） |
| 荣誉中心（Your Honorship） | 待定 | Ready for Delivery (`delivery-checks.cjs` 28/28 通过) | Proposed | My、个人主页、语音房、荣誉/称号/勋章中心 | `requirements/active/20261013-honorship/`<br>说明：`README.md`、`delivery-report.md`<br>原型：`delivery.html` | 缺真实正式代码与原管理隐藏流程核对 |
| 靓号兑换（Pretty ID） | 待定 | Draft | Proposed | 财富等级、靓号兑换与权益奖励 | `requirements/active/20261013-pretty-id/`<br>说明：`README.md`<br>原型：`index.html`、`delivery.html` | 财富等级已同步 14 档 53 模板，待补齐独立 `PRD.md` |

### 4. 1v1 聊天与语音房互动类

| 需求 | 优先级 | 文档状态 | 产品状态 | 关联模块 | 当前目录与核心入口 | 阻塞/待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| 聊天输入区与个人主页配置化 UI | 待定 | Draft | Proposed | IM Chat、User Profile、通话权限 | `requirements/active/20260713-chat-composer-config-ui/`<br>PRD：`PRD.md`<br>原型：`index.html`、`prototype.html` | 核心女/屏蔽女与未解锁口径联调待确认 |
| 语音房 PK（Room PK 22-screen） | 待定 | Ready for Delivery (prototype import) | Proposed | 语音房 / PK | `requirements/active/20261014-salfa-room-pk/`<br>PRD：`PRD.md`<br>原型：`index.html` | 已完成 22 屏原型与 PRD，待正式立项与后端细节确认 |
| 语音房锁房功能（Room Lock） | 待定 | Draft | Proposed | 语音房设置 / 锁房密码 | `requirements/active/20261105-room-lock/`<br>PRD：`room-lock-prd.docx`<br>说明：`README.md` | 管理权限（房主/房管/成员）与锁房后入房规则待确认 |
