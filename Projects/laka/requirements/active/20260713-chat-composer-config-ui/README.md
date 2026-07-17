# Chat Composer and User Profile Config UI

## 需求信息

- 需求名称：聊天输入区与个人主页配置化 UI
- 创建日期：2026-07-13
- 当前版本：v0.22
- 需求类型：前端 UI / 跨页面状态原型
- 关联业务模块：1v1 文本聊天、用户个人主页
- 关联页面：IM Chat、User Profile
- UI 基线来源：`ui/screens/im-chat/reference.png`、`ui/screens/user-profile/reference.png`
- 当前有效 PRD：`PRD.md`
- 当前有效 HTML：`index.html`、`prototype.html`
- 文档状态：Draft
- 产品状态：Proposed
- 最近更新时间：2026-07-14

## 当前范围

右侧注释器新增 `Preview page`，支持在同一 HTML 中切换：

- `IM Chat`：展示聊天输入区配置化状态；
- `User Profile`：在当前个人主页基线上联动左下角通话入口。

选择 `IM Chat` 后，注释器提供三组联动选择：

- `Screen state`：`Configured`；
- `User type`：`Core woman` / `Blocked woman`；
- `Unlock status`：`Locked` / `Unlocked`。

选择用户类型或解锁状态时，原型保持 `Configured` 并展示对应组合。

选择 `User Profile` 后，注释器继续提供 `User type` 与 `Unlock status`，并同步切换标题、版本摘要、状态说明、左下角通话入口和独立页面笔记。该状态与 IM Chat 共用，切换页面不会产生两套结果。

核心女 / 屏蔽女属于女性用户维度的全局配置，主态、客态、聊天页和个人主页使用同一配置结果。正常情况下两项配置互斥；若异常同时命中，前端按核心女权益优先展示。

## 个人主页状态

- 页面类型：男性用户查看其他女性个人主页；
- 产品版本：Laka iOS 1.4.7；
- 视觉事实源：`ui/screens/user-profile/reference.png`；
- 展示方式：按完整页面比例放入 393 × 852 原型画布，只覆盖左下角通话入口；
- Core woman + Locked：保留真实截图中的原有锁定图标，点击后弹出 `Insufficient intimacy` 亲密度不足提示；
- Core woman + Unlocked：覆盖为蓝色视频 + 绿色电话组合图标，点击打开个人主页四项选择器：Invite to Video Call、Video Call、Invite to Audio Call、Audio Call；
- Blocked woman + Locked：覆盖为置灰 Audio Call，点击后弹出 `Insufficient intimacy` 亲密度不足提示；
- Blocked woman + Unlocked：覆盖为高亮绿色 Audio Call，点击打开个人主页两项语音选择器：Invite to Audio Call、Audio Call。
- 三种新增覆盖状态统一使用 45 × 45px 圆形入口，定位为 `left: 16px; bottom: 36px`，与初始化原入口的尺寸和中心点一致；入口使用不透明底色完整遮住原图标，不出现残影。
- 个人主页通话入口与右侧关注圆形按钮使用同一条垂直中心线。
- 核心女已解锁的组合图形在 45 × 45px 圆形入口内按比例缩放，保持约 8px 的上下视觉留白并与右侧图标垂直居中。
- Core woman 在个人主页资料行额外展示蓝色视频权限徽标，与 Locked / Unlocked 无关；点击徽标显示英文提示 `Officially verified`。Blocked woman 不展示该徽标。

## 状态摘要

| 用户类型 | 状态 | 底部工具栏 |
| --- | --- | --- |
| Core woman | Locked | 5 个图标；第 4 位为上锁 Audio Call，第 5 位为上锁 Video Call |
| Blocked woman | Locked | 4 个图标；隐藏 Video Call，第 4 位 Audio Call 置灰并带锁，4 项自动均分 |
| Core woman | Unlocked | 5 个图标全部高亮并去锁；Audio / Video 可打开呼叫选择器 |
| Blocked woman | Unlocked | 4 个图标全部高亮并去锁；隐藏 Video Call，Audio 可打开呼叫选择器，4 项自动均分 |

`Configured` 是当前评审状态。Emoji 位于输入框最右侧、发送按钮之前。

## 原型价格说明

通过第 4 个 Audio Call 入口打开选择器时，两行统一展示绿色电话图标及 `Audio Call` 标题；通过第 5 个 Video Call 入口打开时，两行统一展示蓝色视频图标及 `Video Call` 标题。第一档 `300 diamonds per minute` 使用钻石图标，第二档 `200 coins per minute` 使用金币图标。

上述价格仅用于原型演示，不代表正式收费规则、结算口径或后台配置值。

个人主页选择器中，Invite 选项使用 `Earn + diamond`，直接呼叫选项使用 `Cost + coin`。聊天输入区已经确认的两行选择器保持不变。

个人主页处于未解锁状态时，两类用户点击左下角通话入口均弹出亲密度不足提示：标题为 `Insufficient intimacy`，说明达到 intimacy 1 后可解锁通话，并提供 `Send a gift` 与 `Chat` 两个操作。核心女未解锁状态只增加与原入口同位置的透明点击热区，不改变真实截图中的图标外观。聊天页未解锁状态继续沿用原有轻提示，不使用该弹窗。

## UI 基线说明

IM Chat 公共 `baseline.html` 当前无可复用内容，因此聊天原型使用真实产品截图作为未改区域的视觉基底，只在底部输入区域叠加增量 UI。User Profile 的公共 `baseline.html` 为空，本版直接展示项目登记的 M09 真实产品截图。两者均用于方案评审，不代表公共 UI 基线已升级。

## 预览稳定性

- 测试版 `index.html` 已使用 Axhub Annotation standalone runtime 替换原右侧注释器；原型目录负责切换 IM Chat / User Profile，Axhub 状态控件继续驱动 User type 与 Unlock status；
- Axhub 标注数据与桥接代码位于 `axhub/`，现有聊天、个人主页、弹窗和状态组合逻辑保持不变；
- Axhub runtime 为只读展示，不再提供旧注释器的浏览器内 PM notes 编辑与 localStorage 保存；
- `index.html` 是 GitHub Pages / 静态托管默认入口，已内嵌 CSS、JS 和关键截图资源；
- `prototype.html` 保留为本地维护入口，继续引用 `css/prototype.css`、`js/prototype.js` 和 `assets/images/`；
- CSS 已拆分到 `css/prototype.css`，用于本地维护；
- JS 已拆分到 `js/prototype.js`，用于本地维护；
- IM Chat 和 User Profile 真实截图已复制到 `assets/images/`，并已内嵌到 `index.html`；
- `prototype.html` 继续支持直接打开；测试版 `index.html` 需要与 `axhub/` 目录一起交付；
- 在限制 `file://` 的内置浏览器中，应通过以 `PROJECT_ROOT` 为根目录的本地 HTTP 服务打开；
- 页面已处理首次加载视口尺寸为 0、`localStorage` 不可用和背景图片加载失败三类异常，不应出现无提示空白页。

## GitHub 共享方式

将当前需求目录上传到 GitHub 后，应开启 GitHub Pages，并以仓库根目录的 `index.html` 作为访问入口。

`index.html` 仍内嵌原型 CSS、JS 和关键截图，但 Axhub 测试运行时依赖同级 `axhub/` 目录；GitHub Pages 发布时必须同时上传该目录。

如果只发送 GitHub 代码文件链接，浏览器会显示源码或下载文件，不等同于高保真页面预览；对外评审应发送 GitHub Pages 链接。

## 待解决问题

- 正式解锁条件、锁定原因文案及后端状态字段。
- 正式字段名、下发时机、缓存策略和异常兜底策略。
