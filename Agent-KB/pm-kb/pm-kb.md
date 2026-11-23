# PM 个人成长知识库

> 跨项目唯一事实源（Single Source of Truth）。
> 支持在本地页面 `http://127.0.0.1:4321` 直接新增/编辑（0.5 秒自动保存并自动同步云端只读页），或在 Agent 对话中以 A 模式回 `1` 自动入库。

---

## [KB-001] 社交音视频通话实现逻辑
- bucket: reinforce
- type: flow
- status: reviewing
- project: 通用
- tags: 音视频与房间
- source: 行业通用原理 · 1v1 音视频通话机制
- date: 2026-11-20
- hook: 后台管叫人与扣钱，声网管传声音画面

### nodes
- A | 📱 | 小明手机
- B | 📱 | 小红手机
- S | 🏢 | 我们后台
- R | 📡 | 声网

### steps
1. 叫人 | A->S, S->B | 后台查完有钱不忙，通知小红手机响铃
2. 开房 | B->S, S->R | 小红点接听，后台找声网开了临时房间
3. 通话扣钱 | A<->R, B<->R, S* | 声音画面走声网传，后台在旁掐表扣钱
4. 结束 | S-x-R | 任一方挂断或钱扣光，停表并解散房间

### glossary
- 信令 / IM | 我们公司后台（管叫人、接听、挂断通知）
- RTC | 声网/即构（外面按分钟租的音视频通道）
- Token | 后台发给两人的临时房间门卡
- 心跳 | 手机隔几秒报一声“我还在”，防掉线乱扣钱

### tips
- 忙线拦截：正在响铃或通话中，第二通呼叫直接报忙线
- 假接通不扣钱：点接听但 10 秒没进房，自动取消且不扣费
- 杀进程止损：掉线 15~30 秒无动静，后台强制停表
- 成本与风控：视频成本是纯语音 5~10 倍，且必须接实时 AI 鉴黄
- 双端记录：聊天页按主叫/被叫分别展示不同文案

---

## [KB-002] 按分钟计费通话：强退 App 防持续扣费
- bucket: blindspots
- type: contrast
- status: reviewing
- project: 通用
- tags: 音视频与房间, 缓存与资损
- source: 行业高频漏坑 · 1v1 通话计费边界
- date: 2026-11-20
- hook: 别等用户点挂断才停表，强退会扣光金币

### wrong
只写了点挂断才停表，没写用户直接强退 App 或断网怎么办

### right
由后台亲自掐表，超过 15~30 秒无信号自动停表挂断

### rule
凡涉及按时计费或占位，写需求必补一句：“用户突然断网/强退怎么止损？”

---

## [KB-003] 接口幂等
- bucket: reinforce
- type: flashcard
- status: reviewing
- project: 通用
- tags: 缓存与资损
- source: 研发通用概念 · 支付与送礼防重
- date: 2026-11-20
- hook: 用户手抖狂点，后台也只认第 1 次

### plain
不管用户卡顿手抖点 1 次还是 5 次，后台只认第 1 次，绝不重复扣钱或发奖。

### scenes
- 充值按钮
- 送礼按钮
- 领奖 / 提现按钮

### glossary
- 幂等 (Idempotency) | 同一个操作重复发很多遍，最终结果跟发 1 遍完全一样

---

## [KB-004] 划掉 App 后怎么让对方手机响铃？
- bucket: to-learn
- type: todo
- status: to-learn
- project: 通用
- tags: 音视频与房间
- source: 待深挖 · 1v1 通话离线呼入
- date: 2026-11-20
- hook: 离线推送通知栏 vs 像系统电话一样响

### context
写 1v1 通话需求时经常碰到：被叫把 App 切到后台甚至划掉进程了，iOS 和 Android 分别怎么叫醒对方？苹果审核对 CallKit 有什么限制？

---

## [KB-005] 阿语 RTL 镜像翻转 & 豁免红线
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 出海与风控, 前端渲染与交互
- demo: rtl-mirror
- source: 前端逻辑表 · 模块19.2 阿语RTL镜像
- date: 2026-11-23
- hook: 箭头头像要翻转，数字/VIP/视频绝不翻

### summary
切阿语时界面左右镜像，但倒计时、视频画面与 VIP 英文标必须豁免翻转。

### rule
凡涉及出海阿语页面，PRD 必须单列「豁免翻转清单」（数字、进度条、视频流、英文徽章）。

### glossary
- RTL (Right-to-Left) | 阿拉伯语/希伯来语从右往左阅读与排版方向
- Icon Flip | 方向性图标（如返回箭头）随语言镜像水平翻转

---

## [KB-006] 全屏大礼物「触摸穿透」防卡死
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 音视频与房间
- demo: touch-pass
- source: 前端逻辑表 · 模块16.1 全屏动效触摸穿透
- date: 2026-11-23
- hook: 大礼物飘全屏时，底层麦位和退出必须能点

### summary
大礼物动效飘在最顶层，若不开「触摸穿透」，底下的麦位和退出按钮会像卡死一样点不动。

### rule
凡有全屏/半屏飘动特效，PRD 必写“动效层开启触摸穿透，严禁遮挡底层点击”；加载超 3 秒放弃播特效仅显公屏。

### glossary
- Touch Pass-Through | 让顶层动效“透明过手”，手指点击直接落到下面按钮上
- Disk Cache Miss | 手机本地还没下好大礼物视频素材，需要临时下载

---

## [KB-007] 复合头像 6 层叠加 & 1.3 倍头像框
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 音视频与房间
- demo: avatar-layers
- source: 前端逻辑表 · 模块1.3 复合头像与声波
- date: 2026-11-23
- hook: 头像框宽1.3倍留边距，闭麦压过在线点

### summary
麦位头像由 6 层叠加；头像框宽 1.3 倍需留边距，闭麦红标优先级高于在线绿点。

### rule
设计麦位或列表头像时，必按 1.3 倍头像框预留留白，并写死右下角多状态互斥优先级。

### glossary
- Z-Index | 谁叠在谁上面（数值越大越靠前，盖住下面图层）
- RTC 音量回调 | 声网实时告诉前端某人说话音量，超过阈值就亮声波光圈

---

## [KB-008] 公屏「防顶走」与未读新消息气泡
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 音视频与房间
- demo: chat-scroll
- source: 前端逻辑表 · 模块6.3 公屏防顶走气泡
- date: 2026-11-23
- hook: 上滑翻历史绝不强滚底，改弹新消息气泡

### summary
在底部时自动滚底；一旦上滑翻历史就锁住画面，新消息收成底部“↓ X条新消息”气泡。

### rule
所有高频刷新的房间公屏/聊天流，必写“看历史时不强制滚底 + 悬浮未读气泡点击回底”。

### glossary
- Scroll State | 前端监听列表当前“停在最底”还是“已被用户往上滑开”

---

## [KB-009] 大数字向下取整(Floor) + 倒计时等宽防抖
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 缓存与资损, 前端渲染与交互
- demo: number-floor
- source: 前端逻辑表 · 模块3.4 大数字与倒计时
- date: 2026-11-23
- hook: 资产严禁四舍五入，跳动数字必开等宽防晃

### summary
资产严禁四舍五入（99990 显 9.9万防索赔）；跳动倒计时开等宽数字防左右晃。

### rule
凡涉及金币/钻石/余额/榜单缩写，一律写明“向下取整(Floor)”；倒计时与跳动金额开启等宽数字。

### glossary
- Floor (向下取整) | 直接截断多余尾数绝不进位，如 99990 → 9.9万
- Tabular Nums | 等宽数字排版，让 1 和 8 占同样宽度，数字跳动时整行不晃

---

## [KB-010] 点九图(.9.png) 与缩放裁切(CenterCrop)
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互
- demo: nine-patch
- source: 前端逻辑表 · 模块2.2 缩放与点九图
- date: 2026-11-23
- hook: 气泡称号用点九图防圆角变形，头像禁拉伸

### summary
变宽气泡/称号必用点九图保圆角；头像封面用等比居中裁切，严禁硬拉把人脸压扁。

### rule
PRD 标注图片展示方式：头像/封面用 CenterCrop（等比裁切），不定宽气泡/靓号底板配点九图。

### glossary
- .9.png (点九图) | 只拉伸图片中间指定像素、锁死四个圆角不变形的特种切图
- CenterCrop vs FitXY | CenterCrop 等比放大居中裁掉多余边；FitXY 强行拉满会把图压扁

---

## [KB-011] 小图标热区外扩（HitSlop 24→40dp）
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互
- demo: hit-slop
- source: 前端逻辑表 · 模块4.2 小图标热区扩张
- date: 2026-11-23
- hook: 小叉号看着小，手指可点范围要外扩到40

### summary
小于 24dp 的关闭、复制小图标，视觉不变，透明点击热区须外扩至 ≥40dp。

### rule
设计图里任何小图标（关闭、复制、提示），写 PRD 顺手注明“视觉不变，点击热区外扩至 ≥40dp”。

### glossary
- HitSlop / TouchDelegate | 不改图标大小，把周围一圈空白也算进它的点击命中区

---

## [KB-012] 列表「有效曝光」埋点（50%面积 + 500ms）
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 缓存与资损
- demo: exposure-track
- source: 前端逻辑表 · 模块19.3 有效曝光埋点
- date: 2026-11-23
- hook: 露出超一半且停满0.5秒，才算有效曝光

### summary
快划不算看到；行业标准是卡片露出 ≥50% 且停留满 0.5 秒才计 1 次曝光。

### rule
定义列表/Banner 曝光埋点时，必须写死“可见面积阈值 + 停留时长阈值 + 批量合并上报”，否则转化率虚低。

### glossary
- Viewport Visibility | 前端实时测算某张卡片有百分之多少露在手机当前屏幕里

---

## [KB-013] 敏感词「单边自嗨(Shadow Ban)」vs 强拦截
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 出海与风控
- demo: shadow-ban
- source: 前端逻辑表 · 模块17.2 敏感词拦截模式
- date: 2026-11-23
- hook: 防引流别直接报错，让黑产以为发成了

### summary
防黑产发引流词用单边自嗨：发信人显成功扣费，对面静默不收，防其试探词库边界。

### rule
风控需求区分两档：常规敏感词强拦截不扣费；黑产引流词走“单边自嗨”防止对方试探敏感词库边界。

### glossary
- Shadow Ban (单边自嗨) | 只有发送者自己看得到消息已发出，接收方与全房完全静默拦截

---

## [KB-014] 1v1 防截屏/录屏双端死限制（安卓 vs iOS）
- bucket: to-learn
- type: demo
- status: to-learn
- project: 通用
- tags: 出海与风控, 音视频与房间
- demo: screen-shield
- source: 前端逻辑表 · 模块19.1 防截屏双端差异
- date: 2026-11-23
- hook: 安卓能黑屏拦死，iOS截屏只能事后告警

### summary
苹果底层不让拦截屏：安卓能直接黑屏防截录屏，iOS 只能截屏事后告警+录屏模糊静音。

### rule
防截屏/录屏需求严禁写“双端禁止截屏”，必须按安卓黑屏、iOS 事后告警+录屏模糊拆开写。

### glossary
- FLAG_SECURE | 安卓系统安全窗口开关，打开后截屏和录屏直接变纯黑
- isCaptured | iOS 提供的录屏检测信号，检测到录屏时前端立刻盖模糊遮罩

---

## [KB-015] 语音房进房三通道 + 断网重连防乱序
- bucket: to-learn
- type: flow
- status: to-learn
- project: 通用
- tags: 音视频与房间
- source: 前端逻辑表 · 模块13.1 & 13.2 进房与重连
- date: 2026-11-23
- hook: 进房要连三条线，切回前台必拉最新快照

### nodes
- U | 📱 | 手机端
- H | 🏢 | HTTP快照
- R | 📡 | RTC声音
- M | 💬 | RTM公屏

### steps
1. 进房拉底图 | U->H | 先拉全量麦位和房间信息，失败直接退房
2. 连声音公屏 | U<->R, U<->M | 并行进声道和公屏，任一失败重试3次
3. 切后台丢包 | U* | 弱网或切后台时，中途上下麦通知漏接了
4. 回前台校准 | U->H | 重连回前台拉全量快照，按版本号丢旧消息

### glossary
- HTTP 快照 | 一次性把当前房间“完整静态画面”（谁在几号麦）全拉下来
- Version 版本校准 | 每条麦位变化带递增编号，比本地旧的直接丢弃防状态倒退

### tips
- 为什么会“有画无声”：HTTP 成功了但 RTC 进房失败，必须独立重试 3 次，仍失败弹窗重进
- 为什么会“麦位僵尸”：切后台漏了 RTM 通知，回到前台必须自动拉全量快照覆盖

---

## [KB-016] H5 活动页与原生 App 通信（JSBridge）
- bucket: to-learn
- type: flow
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 缓存与资损
- source: 前端逻辑表 · 模块10.1 & 10.2 H5通信与刷新
- date: 2026-11-23
- hook: H5调不动原生功能，新增桥接能力要发版

### nodes
- W | 🌐 | H5活动页
- B | 🌉 | JSBridge
- N | 📱 | 原生App

### steps
1. 借原生能力 | W->B, B->N | H5拿不到余额，靠桥梁喊原生拉充值弹窗
2. 原生完成扣款 | N* | 原生收银台支付成功，账号金币实时增加
3. 返回刷新数据 | N->B, B->W | 关H5回语音房时，原生重显自动拉新余额

### glossary
- JSBridge | 嵌在 App 里的网页(H5)跟原生代码互相传话的专用“翻译桥”
- onResume | 页面重新回到屏幕最前面时触发的回调，用来静默刷新余额

### tips
- 排期大坑：H5 虽然随时能发版，但只要用到原生新能力（新加一个桥接方法），就必须等 App 发新版本

---

## [KB-017] 多弹窗打架队列 & 退房自动销毁
- bucket: to-learn
- type: contrast
- status: to-learn
- project: 通用
- tags: 前端渲染与交互, 音视频与房间
- source: 前端逻辑表 · 模块5.3 & 5.4 弹窗队列与销毁
- date: 2026-11-23
- hook: 进房多个弹窗别叠罗汉，退房全销毁防残留

### wrong
进房同时弹3个活动框黑底叠一起，被踢出房间弹窗还留在首页

### right
全站统一排队(来电/强更最高优)，退房或切页立刻销毁所有弹窗

### rule
凡是进房/进首页自动弹出的弹窗，PRD 必写优先级队列、互斥规则和离页销毁条件。

### glossary
- DialogQueue | 全局弹窗排队管家，规定一次只弹最高优，关一个再弹下一个

---

## [KB-018] 本地缓存必须绑账号（userId）防串号
- bucket: to-learn
- type: contrast
- status: to-learn
- project: 通用
- tags: 缓存与资损
- source: 前端逻辑表 · 模块4.3 & 11.3 缓存维度隔离
- date: 2026-11-23
- hook: 红点引导和美颜按账号存，别换小号全串了

### wrong
把新手弹窗、红点或美颜参数存设备本地，换小号登录后全串号

### right
业务状态和红点缓存一律绑 userId，退出登录或切号自动隔离

### rule
凡涉及“只弹1次、草稿、未读红点、本地记忆”，必明确按设备还是按 userId 存。

### glossary
- MMKV / UserDefaults | 手机本地小记事本，存红点、草稿和开关状态，读写极快

---

## [KB-019] 付费私聊失败重发，严禁绕过扣费校验
- bucket: to-learn
- type: contrast
- status: to-learn
- project: 通用
- tags: 缓存与资损, 出海与风控
- source: 前端逻辑表 · 模块17.1 消息重发防漏单
- date: 2026-11-23
- hook: 点红叹号重发消息，必须重走扣费和风控

### wrong
弱网发付费私聊变红叹号，点重发直接走底层发出去导致白嫖

### right
点红叹号重发必须重新走扣费和敏感词校验，且加幂等防扣两次

### rule
凡是带失败重试的付费动作，必写明“重试同样要重走权限、风控与扣费校验”。
