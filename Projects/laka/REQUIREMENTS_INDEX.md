# Laka 需求总台账

> 目录结构与文件职责见 [AGENTS.md](AGENTS.md) 第 2 节；本文件专注维护需求状态、关联页面与阻塞项。

## 活跃需求索引（`requirements/active/`）

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
