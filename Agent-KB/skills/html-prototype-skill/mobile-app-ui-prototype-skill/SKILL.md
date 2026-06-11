---
name: mobile-app-ui-prototype-skill
description: Use when creating, editing, or reviewing generic mobile app HTML prototypes, especially when the output must feel like a real consumer app rather than an admin dashboard, raw field dump, wireframe, or default UI kit demo.
---

# Mobile App UI Prototype Skill

通用移动端 HTML 原型 Skill。适用于 Dating、社交、聊天、直播/语音房、聊手/运营工作台、Paywall、私密内容、Call invite 等 App 原型。默认产物至少是 Level 2 review-ready mobile prototype，必须像真实 App，而不是后台仪表盘、粗糙线框或字段堆叠 demo。不要绑定任何固定项目路径、固定项目名或单一业务项目。

## 输出等级

- Level 1 Clickable Skeleton：只有用户明确要求“先做页面骨架”时才允许。
- Level 2 Review-ready Prototype：默认最低标准；有真实移动 App 层级、卡片、Pill、按钮、可用导航、无空白页。
- Level 3 High-fidelity Delivery Prototype：用户要求高保真、交付质量、真实 App 质感或 stakeholder review 时必须达到。

## 核心规则

1. Mobile-first；默认视口是 390x844 phone container。
2. 使用 App Shell：Header、内容区、Bottom Tab 或固定操作区、安全区。
3. 不要默认生成 desktop web、admin dashboard、表格、长表单或 PRD 字段堆叠。
4. 把数据转成卡片、Pill、指标卡、消息气泡、Bottom Sheet、上下文按钮。
5. 每个可点击元素必须有反馈；关键动作必须闭环。
6. 每个二级页面必须有返回导航；不要删底部 Tab、二级页或状态/注释面板逻辑。
7. 项目已有状态/注释逻辑时，保持 `pageId` 稳定，不要随意重命名。
8. HTML 原型默认包含 Prototype Annotation Editor，除非用户明确不要。
9. 交付必须是可视化 HTML 原型文件或项目，不要只返回 raw code；必须提供预览路径/URL 和可下载交付物。
10. 如果发现规则缺失、冲突、页面空白、交互失效、不可预览/下载或误删已有能力，必须直接修复 Skill/原型文件并重测。

## 设计前先判断

先识别：产品类型、用户场景、页面类型、主用户决策、主 CTA。然后从 `ui-patterns.md` 选择合适模式，不要从“列出所有字段”开始。非平凡原型都应先读 `ui-patterns.md`；它包含默认设计系统、App Shell、页面模式、组件规则、社交/Dating/MENA/聊手工作台规则、反模式修正和量化验收。

## 场景底线

- 社交/Dating/Chat/MENA：必须展示关系上下文，而不只是数据；包括当前用户/资料或模型、关系阶段、支付状态、剩余免费消息、建议动作、私密内容状态、Call invite 状态。商业动作要自然，不要硬卖。
- 聊手/女性运营工作台：优先页面是 Inbox、Chat Detail、Content Picker、Me、Models、Model Detail、Content。Inbox 回答谁先回、用哪个模型、是否接近付费、下一步动作。Chat Detail 回答男用户、模型身份、支付状态、免费消息、该聊天/发私密内容/邀约通话。Content Picker 回答选了什么、归属模型、是否发过、价格、发送后回到哪里。
- 闭环例子：发送消息后消息出现、输入清空、Toast 出现；发送私密内容后打开 picker、选择内容、回到聊天、出现 PrivateUnlockCard；切换 Online 后状态同步并 Toast；点会话后打开正确 Chat Detail。

## 完成检查

交付前确认：像真实移动 App；不似后台/admin；主页面目标 5 秒内清晰；核心点击路径可用；无空白页、死胡同页面、静默点击；按钮和卡片有反馈；`pageId` 稳定；必需页面未删除；预览可打开；下载/导出可用；适用时遵循 `ui-patterns.md` 的 Critical Fail、测试用例、Pass/Fail、自修复和报告规则。若像手机里的表格、后台配置页、默认组件展厅或空灰框集合，先改再交。
