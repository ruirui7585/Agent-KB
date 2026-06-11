# Dating Prototype State Dictionary

This document defines the state model for the Dating prototype only. It covers Discover / Swipe, Liked by Me, Match, Likes Me, Paid Chat, Paid Gift, Subscription, Single Photo Unlock, Coin Recharge, Paywall / Bottom Sheet / Modal, State Panel, and Annotation Panel.

## A. Page State 页面状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `currentPage` | Current visible page or tab | `discover`, `liked_by_me`, `matches`, `likes_me`, `chat`, `profile` | 当前用户正在浏览的页面 | 全部页面、底部 Tab、Annotation Panel | 点击底部 Tab、点击 Match 后进入聊天、状态面板切换页面 | 切换时 `activeAnnotationPage` 必须同步为 `currentPage`；可关闭非当前页面弹窗 | Yes |
| `prototypeMode` | Prototype scenario mode | `normal`, `first_time`, `paywall_demo`, `matched_demo`, `no_balance_demo` | 原型演示模式，用于快速切换核心业务场景 | State Panel、Discover、Likes Me、Chat、Paywall | State Panel 选择场景 | 可批量更新订阅、余额、匹配、聊天、弹窗状态 | Yes |

## B. User State 用户状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `userStatus` | Current account state | `guest`, `registered`, `verified`, `blocked` | 用户账号状态 | Discover、Likes Me、Chat、Payment、Profile | 登录、注册、资料审核、风控拦截 | `guest` 访问付费或聊天功能时可触发登录或订阅 Paywall；`blocked` 禁用付费和互动 | Yes |
| `genderSide` | Dating audience side | `male`, `female`, `other` | 用户侧别，用于控制展示素材、推荐对象和文案 | Discover、Likes Me、Liked by Me、Match | 完成资料设置、State Panel 切换 | 影响推荐卡片数据、付费文案、礼物默认展示 | Yes |

## C. Subscription State 订阅会员状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `subscriptionStatus` | Subscription entitlement state | `inactive`, `trial`, `active`, `expired`, `cancelled` | 会员订阅状态 | Likes Me、Discover、Paywall、Profile | 购买订阅、试用开始、订阅过期、取消订阅 | `active` 时解锁 Likes Me、提升滑卡和 Super Like；非 `active` 时 Likes Me 可锁定或半露出 | Yes |
| `subscriptionPlan` | Selected or active subscription plan | `none`, `weekly`, `monthly`, `quarterly`, `annual` | 当前选择或生效的会员套餐 | Paywall、Profile、Payment | 打开订阅 Paywall、选择套餐、支付成功 | 支付成功后根据套餐更新 `subscriptionStatus` 和权益字段 | Yes |
| `likesMePermissionStatus` | Permission to view users who liked me | `locked`, `partial_visible`, `unlocked` | 谁喜欢我页面的查看权限 | Likes Me、Paywall | 进入 Likes Me、订阅状态变化、点击查看完整资料 | `subscriptionStatus = active` 时为 `unlocked`；非 active 时为 `locked` 或 `partial_visible`，头像模糊展示 | Yes |
| `dailySwipeRemaining` | Remaining daily swipe count | number, `unlimited` | 今日剩余滑卡次数 | Discover、State Panel、Paywall | 每次滑卡、每日重置、订阅生效 | 为 0 时触发订阅或补充权益 Paywall；订阅 active 可提升或变为 `unlimited` | Yes |
| `superLikeRemaining` | Remaining Super Like count | number | 剩余 Super Like 次数 | Discover、Paywall、State Panel | 点击 Super Like、订阅生效、购买权益包 | 为 0 时点击 Super Like 触发 Paywall；订阅 active 后增加 | Yes |

## D. Balance & Payment State 余额和支付状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `balanceStatus` | Coin balance sufficiency state | `no_balance`, `low_balance`, `enough_balance` | 当前金币余额是否足够完成行为 | Chat、Gift、Photo Unlock、Coin Recharge、State Panel | 金币变化、发礼物、解锁照片、发送付费消息 | `coinBalance <= 0` 为 `no_balance`；大于 0 但小于当前价格为 `low_balance`；足够支付为 `enough_balance` | Yes |
| `coinBalance` | Current coin amount | number | 当前金币余额 | Chat、Gift、Photo Unlock、Coin Recharge、State Panel | 充值成功、付费聊天扣费、礼物扣费、照片解锁扣费 | 驱动 `balanceStatus`；支付成功或业务扣费后同步更新 | Yes |
| `paywallStatus` | Active paywall type | `none`, `subscription_paywall`, `chat_paywall`, `coin_recharge`, `photo_unlock`, `super_like_paywall` | 当前展示的付费拦截类型 | Paywall、Bottom Sheet、Modal | 点击受限功能、余额不足、订阅缺失 | 可驱动 `bottomSheetStatus` 或 `modalStatus`；支付成功后回到 `none` | Yes |
| `paymentStatus` | Payment flow state | `idle`, `pending`, `success`, `failed`, `cancelled` | 支付流程状态 | Paywall、Coin Recharge、Subscription、Modal | 点击购买、支付处理中、支付回调、用户取消 | `success` 时关闭 Bottom Sheet、显示成功 Modal，并同步业务状态 | Yes |
| `selectedPackageId` | Selected payment package | `none`, package id string | 当前选中的订阅或金币套餐 ID | Subscription Paywall、Coin Recharge | 用户选择套餐卡片 | 支付时用于决定更新 `subscriptionPlan`、`coinBalance` 或其他权益 | Yes |

## E. Swipe State 滑卡状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `swipeStatus` | Swipe interaction state | `idle`, `swiping`, `completed`, `limited`, `empty` | 滑卡流程状态 | Discover、State Panel | 开始拖动、点击 Like/Pass、卡片耗尽、次数耗尽 | `limited` 可触发订阅 Paywall；`completed` 后推进 `currentCardIndex` | Yes |
| `currentCardIndex` | Current profile card index | number | 当前展示的推荐卡片序号 | Discover | 初始化推荐流、滑过当前卡片 | Like/Pass/Super Like 成功后递增；超过数据长度时 `swipeStatus = empty` | Yes |
| `likeStatus` | Normal like action state | `idle`, `liked`, `failed` | 普通喜欢动作状态 | Discover、Liked by Me、Match | 点击 Like 或右滑 | 成功后加入 Liked by Me；如果双方喜欢则触发 Match | Yes |
| `passStatus` | Pass action state | `idle`, `passed`, `failed` | 跳过动作状态 | Discover | 点击 Pass 或左滑 | 成功后推进下一张卡；不写入 Liked by Me | Yes |
| `superLikeStatus` | Super Like action state | `idle`, `available`, `used`, `empty` | Super Like 权益状态 | Discover、Paywall | 点击 Super Like、权益用完、订阅生效 | `empty` 时触发 `super_like_paywall`；使用成功后减少 `superLikeRemaining` | Yes |

## F. Like & Match State 喜欢和匹配状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `likedByMeStatus` | Liked by me list state | `empty`, `has_items`, `loading` | 我喜欢谁列表状态 | Liked by Me | 用户 Like 成功、进入列表页 | Like 成功后从 `empty` 变为 `has_items`；可与 Match 状态联动标记已匹配 | Yes |
| `likesMeStatus` | Likes me list state | `empty`, `blurred`, `visible`, `loading` | 谁喜欢我列表状态 | Likes Me | 进入 Likes Me、订阅状态变化 | 订阅未 active 时通常为 `blurred`；解锁后为 `visible` | Yes |
| `matchStatus` | Match relationship state | `none`, `pending`, `matched` | 是否匹配成功 | Discover、Match、Chat | Like 或 Super Like 后发现双方互相喜欢 | `matched` 后 `matchModalStatus = visible`，Chat 入口可展示 | Yes |
| `matchModalStatus` | Match success modal state | `hidden`, `visible` | 匹配成功弹窗状态 | Match Modal、Discover | `matchStatus = matched` | 显示弹窗后可引导进入 Chat；关闭后保持 `matchStatus = matched` | Yes |

## G. Chat State 聊天状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `chatPermissionStatus` | Permission to enter or continue chat | `locked`, `unlocked`, `pay_required` | 聊天权限状态 | Chat、Match、Paywall | Match 成功、点击聊天入口、付费消息限制 | Match 后可展示入口；付费限制时触发 `chat_paywall` 或充值 | Yes |
| `chatSessionStatus` | Chat session lifecycle state | `none`, `available`, `active`, `ended` | 聊天会话状态 | Chat | 进入聊天、退出聊天、会话结束 | `matchStatus = matched` 可使会话 `available`；打开聊天后为 `active` | Yes |
| `paidMessageStatus` | Paid message lock state | `free`, `locked`, `unlocked` | 付费消息状态 | Chat、Paywall、Coin Recharge | 点击锁定消息或输入框、支付成功 | 未解锁时点击消息或输入框触发 `chat_paywall` 或 `coin_recharge` | Yes |
| `messageUnlockStatus` | Message unlock flow state | `idle`, `pending`, `success`, `failed` | 消息解锁流程状态 | Chat、Modal、Toast | 确认扣金币、支付回调 | 成功后扣减 `coinBalance`，更新 `paidMessageStatus = unlocked` | Phase 2 |

## H. Gift State 礼物状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `giftPanelStatus` | Gift panel visibility state | `closed`, `open` | 礼物面板状态 | Chat、Gift Bottom Sheet | 点击礼物按钮、关闭面板 | 打开后可选择 `selectedGiftId`；发送成功或取消后关闭 | Yes |
| `selectedGiftId` | Selected gift item id | `none`, gift id string | 当前选中的礼物 ID | Gift Panel、Chat | 点击礼物卡片 | 发送时用于计算价格并检查 `balanceStatus` | Yes |
| `giftSendStatus` | Gift sending state | `idle`, `pending`, `success`, `failed`, `insufficient_balance` | 礼物发送状态 | Gift Panel、Chat、Coin Recharge、Toast | 点击发送礼物、扣费成功或失败 | 余额不足时 `bottomSheetStatus = coin_recharge`；成功后扣减 `coinBalance` | Yes |

## I. Single Photo Unlock State 单图解锁状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `photoUnlockStatus` | Single photo lock state | `locked`, `pending`, `unlocked`, `failed` | 单张照片解锁状态 | Profile Photo、Discover Detail、Bottom Sheet | 点击锁定照片、确认支付、扣费成功 | 未解锁时点击图片触发 `bottomSheetStatus = photo_unlock`；成功后关闭 Bottom Sheet 并显示成功 Modal | Yes |
| `selectedPhotoId` | Selected locked photo id | `none`, photo id string | 当前准备解锁的照片 ID | Photo Unlock Bottom Sheet、Profile Photo | 点击某张锁定图片 | 用于确定解锁目标和价格 | Yes |
| `photoUnlockPrice` | Coin price of selected photo | number | 当前照片解锁价格 | Photo Unlock Bottom Sheet、State Panel | 选中照片、数据初始化 | 解锁成功后从 `coinBalance` 扣除 | Yes |

## J. UI Overlay State 弹窗状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bottomSheetStatus` | Active bottom sheet type | `none`, `subscription_paywall`, `chat_paywall`, `coin_recharge`, `photo_unlock`, `gift_panel` | 当前底部弹层类型 | Paywall、Gift、Photo Unlock、Coin Recharge | 点击受限功能、打开礼物、余额不足 | 支付或解锁成功后回到 `none`；余额不足可切到 `coin_recharge` | Yes |
| `modalStatus` | Active modal type | `none`, `match_success`, `payment_success`, `unlock_success`, `error` | 当前居中弹窗类型 | Match、Payment、Photo Unlock、Toast-like Modal | Match 成功、支付成功、解锁成功、错误 | 支付成功时为 `payment_success`；照片解锁成功时为 `unlock_success` | Yes |
| `toastStatus` | Toast feedback state | `none`, `visible`, `success`, `error` | 轻提示状态 | 全部页面 | 操作成功、操作失败、状态保存 | 可配合业务状态展示短反馈，不应替代核心 Modal 或 Bottom Sheet | Phase 2 |

## K. Annotation & Tracking State 注释和埋点状态

| 字段名 | 字段含义 | 可选值 | 中文说明 | 影响页面 | 触发条件 | 联动规则 | Phase 1 必须实现 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `annotationStatus` | Annotation editor state | `enabled`, `disabled`, `editing`, `hidden` | 原型注释器状态 | Annotation Panel、全部可注释模块 | 打开注释模式、关闭注释面板、编辑注释 | `enabled` 时选择模块不触发原业务交互；不允许删除注释器 | Yes |
| `activeAnnotationPage` | Annotation page scope | same values as `currentPage` | 当前注释器绑定的页面 | Annotation Panel、全部页面 | `currentPage` 切换、注释器切换页面 | 必须与 `currentPage` 同步 | Yes |
| `trackingStatus` | Prototype tracking state | `disabled`, `enabled`, `debug` | 原型埋点展示或调试状态 | State Panel、关键交互 | State Panel 开关、调试模式 | 仅记录或展示交互事件，不应改变业务结果 | Phase 2 |

## Core Dependency Rules 核心联动规则

1. When `subscriptionStatus = active`, set `likesMePermissionStatus = unlocked`, increase `dailySwipeRemaining` or set it to `unlimited`, and increase `superLikeRemaining`.
2. When `subscriptionStatus != active`, set `likesMePermissionStatus = locked` or `partial_visible`; Likes Me avatars should be blurred, and tapping full profile triggers `subscription_paywall`.
3. When `coinBalance <= 0`, set `balanceStatus = no_balance`.
4. When `coinBalance > 0` and is lower than the current action price, set `balanceStatus = low_balance`.
5. When `coinBalance >= current action price`, set `balanceStatus = enough_balance`.
6. When a single photo is not unlocked, set `photoUnlockStatus = locked`; tapping the image sets `bottomSheetStatus = photo_unlock`.
7. After a single photo unlock succeeds, set `photoUnlockStatus = unlocked`, deduct `photoUnlockPrice` from `coinBalance`, set `bottomSheetStatus = none`, and set `modalStatus = unlock_success`.
8. When paid chat is not unlocked, set `paidMessageStatus = locked`; tapping a paid message or input field triggers `chat_paywall` or `coin_recharge`.
9. When gift sending has insufficient balance, set `giftSendStatus = insufficient_balance` and `bottomSheetStatus = coin_recharge`.
10. After Match succeeds, set `matchStatus = matched`, set `matchModalStatus = visible`, and show the Chat entry.
11. When `currentPage` changes, `activeAnnotationPage` must sync to `currentPage`.
12. After payment succeeds, set `paymentStatus = success`, set `bottomSheetStatus = none`, set `modalStatus = payment_success`, and update the corresponding business state.
