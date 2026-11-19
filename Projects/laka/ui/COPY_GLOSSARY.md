# Laka 英文文案与社交竞品专有名词词表（Copy Glossary）

> 状态：生效中  
> 适用范围：`Projects/laka/` 所有 App 前台高保真原型与需求页面设计  
> 最后更新：2026-11-19

## 1. 取词原则：新功能优先对标成熟竞品

输出原型时，很多新功能在 Laka 线上产品中并无现成界面可对照。**对照 Laka 只是既有入口的局部锚点；设计新功能、新玩法、新活动或新商业化模块时，必须以成熟海外社交竞品的真实英文 UI 作为第一参照基准**，严禁自己按中文直译或强行从旧界面拼凑用词。

### 1.1 按场景分流取词
1. **新功能 / 新玩法 / Laka 尚无现成界面（最常见）**：
   - `用户本轮提供或确认的竞品截图原文` ＞ `同赛道成熟头部竞品真实英文 UI（第 2 节标准词库 + 实时联网核验）`。
   - 查竞品时优先核对英文版商店截图、App 内界面、官方 Help Center / Zendesk 与官方玩法指南，**不采信中文文章机翻出来的英文**。
2. **既有模块延展 / 共用底盘入口**：
   - 沿用 Laka 已确认的核心底盘词（第 3 节），但**严格排除** [reference-index.md](references/reference-index.md) 已标注“不继承”的旧版瑕疵英文；新加的状态标签与动作按钮仍对齐成熟竞品。

### 1.2 新功能竞品对标矩阵（找不到 Laka 现成页面时看谁）

基于 Laka 竞品池（[competitor-pool.md](../agents/competitor-analysis/competitor-pool.md)）与高频新功能场景，优先对标以下成熟产品：

| 新功能模块 | 首选对标成熟竞品 | 重点参考英文描述域 |
|---|---|---|
| 语聊房玩法、麦位权限、家族/部落 | `SUGO`、`Yalla`、`SoulChill`、`YoHo` | 麦位动作、房间模式、房管控制、`Family / Clan / Tribe` |
| 运营活动、累计充值、幸运转盘、榜单、背包、客服入口 | `SUGO`、`Yalla`、`BIGO Live`、`Chamet` | `Claim`、`Leaderboard`、`Lucky Wheel / Spin`、`Backpack`、`Help & Feedback`、`Support` |
| PK 对战、礼物特效、VIP/贵族与荣誉体系 | `BIGO Live`、`Chamet`、`Yalla`、`SUGO`（及专项参考 `SALFA`、`YOOY`） | `PK`、`Multi-Guest`、`Nobility / Privilege`、`Entry Effect`、`Pretty ID` |
| 1v1 破冰、音视频匹配、美颜翻译、主播公会体系 | `SUGO`、`Timo`、`Chamet`、`Azar`、`Litmatch` | `Voice/Video Match`、`Say Hi`、`Host`、`Agency`、`Withdraw` |

---

## 2. 新功能成熟竞品通用标准词库（新功能默认直接采用）

> 状态说明：
> - `Competitor-Standard`：在 `SUGO`、`Yalla`、`Chamet`、`BIGO Live`、`SoulChill`、`YoHo`、`Timo` 等成熟竞品中高度通用且已核验的行业标准表达，**新功能可直接采用**；
> - `Branching`：不同成熟竞品之间存在品牌选词差异（或与 Laka 底盘有细微区别），需结合页面语境选用并在原型外注明；
> - `Banned`：严禁出现的中文直译或 B 端泄漏词。

### 2.1 运营活动、累计充值、任务签到、抽奖与榜单（新功能高频）

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / B 端泄漏 (`Banned`) |
|---|---|---|---|
| 领取奖励 / 已领取 / 一键领取 | `Claim` / `Claimed` / `Claim All` | `Competitor-Standard`（SUGO / Yalla / BIGO Live / Chamet） | `Receive` / `Received`（禁止把领取按钮直译为 `Receive`） |
| 活动规则 / 倒计时 / 进度档位 | `Event Rules` / `Ends in` / `Tier` / `Milestone` / `Progress` | `Competitor-Standard`（海外活动页通用） | `Activity Instructions` / `Level Step` |
| 去完成 / 已完成 / 未解锁 / 已过期 | `Go` / `Completed` / `Locked` / `Expired` | `Competitor-Standard`（任务与活动中心通用） | `To Do` / `Cannot Get` / `Out of Date` |
| 排行榜 / 榜单 / 榜首贡献者 | `Leaderboard` / `Ranking` / `Top Gifter` / `Top Host` | `Competitor-Standard`（SUGO / Yalla / SoulChill） | `Billboard` / `Rich List` |
| 幸运转盘 / 抽奖 / 奖池 | `Lucky Wheel` / `Spin` / `Draw` / `Prize Pool` | `Competitor-Standard`（SUGO / Yalla / SoulChill 转盘玩法） | `Turntable` / `Lottery Pool` |
| 幸运礼物 / 盲盒 | `Lucky Gift` / `Lucky Box` / `Mystery Box` | `Competitor-Standard`（SUGO 商店与活动页） | `Fortune Box` |
| 人工审核发放中 | `Processing` / `In Review` | `Competitor-Standard`（C 端通用状态） | `Pending Fulfillment` / `Manual Fulfillment` |
| 联系客服 / 帮助反馈 | `Contact Support` / `Customer Service` / `Help & Feedback` / `Help Center` | `Competitor-Standard`（BIGO Live / Chamet / Yalla 官方支持入口） | `Contact Ops` / `Ops Assigns ID`（严禁 C 端出现 `Ops`） |
| 首页 Banner / 推荐位奖励 | `Homepage Banner` / `Featured Banner` | `Competitor-Standard`（C 端权益描述） | `Banner Exposure` / `Home Screen Feature` |
| 首充 / 充值入口（含分叉说明） | 竞品常用 `Top Up` 或 `Recharge`（Laka 既有钱包入口固定用 `Recharge`） | `Branching`（Yalla/BIGO 常用 `Top Up` 或 `Recharge`；Laka 用 `Recharge`） | `Charge Money` / `Pay Money` |

### 2.2 语聊房新玩法、麦位精细管理与 PK

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / 误用 (`Banned`) |
|---|---|---|---|
| 语聊房 / 多人连麦房 | `Voice Chat Room` / `Party Room` / `Multi-Guest` | `Competitor-Standard`（SUGO / Yalla / BIGO Live / Chamet） | `Chatting House` |
| 麦位 / 上麦 / 下麦 | `Mic` / `Seat`；`Take a Seat` / `Take a Mic` / `Go on Mic` / `Leave Mic` | `Competitor-Standard`（SUGO / Yalla / SoulChill） | `Wheat` / `Wheat Position` / `On Wheat` / `Off Wheat` |
| 排麦 / 申请上麦 / 抱上麦 | `Apply for Mic` / `Mic Queue` / `Invite to Mic` | `Competitor-Standard`（语聊房竞品通用） | `Queue Wheat` / `Hold to Wheat` |
| 闭麦 / 全员静音 / 锁麦 | `Mute` / `Unmute` / `Mute All` / `Lock Mic` / `Lock Seat` | `Competitor-Standard`（SUGO / Yalla / SoulChill） | `Close Wheat` / `Lock Wheat` |
| 踢出 / 禁言 / 拉黑 | `Kick` / `Kick Out` / `Mute Chat` / `Ban` / `Block` | `Competitor-Standard`（语聊房权限通用） | `Throw Out` / `Forbidden Words` |
| 房主 / 联合主持 / 房管 / 听众 | `Host` / `Co-host` / `Admin` / `Audience` | `Competitor-Standard`（SUGO / Yalla / BIGO Live） | `Anchor` / `Master` / `Wheat Manager` |
| 锁房 / 房间密码 / 房间公告 | `Room Lock` / `Lock Room` / `Passcode` / `Bulletin` / `Announcement` | `Competitor-Standard` + `20261105-room-lock` | `Close Room` / `Password Room` |
| PK 对战 / 团战 / 冲刺 / MVP / 惩罚 | `PK` / `PK Battle` / `Room PK` / `1v1` `2v2` `4v4` `8v8` / `Final Sprint` / `MVP` / `Penalty` / `Win Streak` | `Competitor-Standard`（BIGO Live / Chamet / SALFA PK） | `Battle Fight` / `Last Rush` / `Punish Show` |

### 2.3 VIP、贵族、背包与装扮特权

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / 误用 (`Banned`) |
|---|---|---|---|
| 会员 / 贵族等级体系 | `VIP` / `SVIP` / `Nobility`（如 Yalla `Patrician / Knight / Baron` 阶梯） | `Competitor-Standard`（Yalla / BIGO Live / SUGO） | `Nobleman Level` |
| 特权 / 权益 | `Privilege` / `Privileges` / `Perks` | `Competitor-Standard`（Yalla / BIGO Live / Laka `F19`） | `VIP Rights` |
| 背包 / 我的道具 / 佩戴使用中 | `Backpack` / `Bag` / `My Items`；`In Use` / `Equipped` / `Wear` / `Remove` | `Competitor-Standard`（BIGO Live / Chamet 用 `Backpack`；Laka 荣誉中心用 `Wear`/`Cancel`） | `Equip` / `Unequip`（用于日常装饰时优先 `Use`/`Wear`） |
| 有效期 / 永久 | `Valid for X days` / `X Days` / `Permanent` | `Competitor-Standard`（商城与背包通用） | `Forever` / `Effective Time` |
| 进场特效 / 座驾 | `Entry Effect`；`Vehicle`（或竞品 `Mount`） | `Branching`（BIGO/Chamet 用 `Entry Effect`；Laka 商店锚定 `Vehicle`） | `Entrance Car` |
| 头像框 / 聊天气泡 / 资料卡 | `Avatar Frame` / `Chat Bubble` / `Profile Card` / `Mic Skin` | `Competitor-Standard`（Laka `M22`/`M21` 与竞品通用） | `Head Frame` / `Talking Bubble` |
| 靓号 | `Pretty ID` / `Unique ID`（Laka 体系固定选 `Pretty ID`） | `Branching`（YOOY/SoulChill/Laka 用 `Pretty ID`） | 同一原型内混用多词 |
| 隐私特权（神秘人/隐身/防踢） | `Mystery Man` / `Stealth Mode` / `Invisible` / `Anti-Kick` / `Hide Online Status` | `Branching`（`SALFA` 用 `Mystery Man`，选定 1 词后须全原型统一） | 同原型内混用 `Mystery Man`/`Mystery Person`/`Anonymous Mode` |

### 2.4 家族、粉丝团与社交关系

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / 误用 (`Banned`) |
|---|---|---|---|
| 家族 / 部落 / 俱乐部 | `Family` / `Clan` / `Tribe` | `Competitor-Standard`（SUGO / Yalla / SoulChill） | `Guild`（C 端社交群组优先 `Family`/`Clan`，`Agency` 专指经纪公会） |
| 粉丝团 / 粉丝徽章 | `Fans Club` / `Fan Badge` | `Competitor-Standard`（BIGO Live / 语聊竞品通用） | `Supporter Group` |
| 情侣 / 挚友 / 守护 / 亲密度 | `CP` / `Couple` / `Bestie` / `BFF` / `Guardian` / `Intimacy` | `Competitor-Standard`（SoulChill / YoHo / Laka） | `Lover` / `Guard` / `Close Degree` |
| 关注 / 好友 / 粉丝 / 访客 | `Following` / `Friends` / `Followers` / `Visitors` / `Who Viewed Me` | `Competitor-Standard`（Laka `F07`/`F19` 与竞品通用） | `Attention` / `Fans` / `Guest` |

### 2.5 1v1 破冰、音视频与安全治理

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / 误用 (`Banned`) |
|---|---|---|---|
| 打招呼 / 随机匹配 | `Say Hi` / `Wave`；`Voice Match` / `Video Match` / `Random Match` | `Competitor-Standard`（SUGO / Timo / Azar / Laka） | `Greet` / `Random Sound` |
| 通话费率 / 自动翻译 / 美颜 | `Coins/min` / `Free Trial` / `Auto-Translate` / `Beauty` / `Filter` | `Competitor-Standard`（Chamet / Azar 1v1 视频标杆） | `Minute Price` / `Machine Translate` |
| 状态与安全控制 | `Online` / `Busy` / `Do Not Disturb` / `Verified` / `Report` / `Block` | `Competitor-Standard`（SUGO / Timo / Azar） | `Disturb Off` / `Real-Person Check` |

### 2.6 主播、公会与代理供给生态

| 中文概念 | 成熟竞品标准英文 | 状态与竞品依据 | 禁止直译 / 误用 (`Banned`) |
|---|---|---|---|
| 主播 / 聊天达人 | `Host`（复数 `Hosts`）/ `Creator` | `Competitor-Standard`（SUGO / Yalla / Chamet / BIGO Live / Laka `F03`） | `Anchor` / `Labor` |
| 经纪公会 / 加入公会 | `Agency` / `My Agency` / `Join Agency` / `Agency Owner` | `Competitor-Standard`（SUGO / Yalla / Chamet / BIGO Live / Laka `F09`） | `Labor Union` / `Guild Master` |
| 币商 / 充值代理 | `Agent` / `Coin Agent` / `Reseller` | `Competitor-Standard`（Chamet / Yalla / Laka） | `Coin Dealer` |
| 提现 / 结算 / 收益报告 | `Withdraw` / `Cash Out` / `Settlement` / `Host Reports` | `Competitor-Standard`（Chamet / BIGO Live / Laka `F09`） | `Take Money` / `Salary Table` |
| 收益币种参考 | `Diamonds`（Laka 固定用 `Diamonds`；BIGO/Chamet 竞品常见 `Beans`） | `Branching`（新功能引用竞品时注意切换为 Laka 双币） | `Golds` / `Gems` |

---

## 3. Laka 既有核心底盘锚点与禁抄旧词（Local Anchors & Do Not Copy）

> 仅在复用 Laka 已有入口或对齐既有系统名称时，遵循以下已实证（Laka iOS 1.4.7 正式版与已确认需求）的固定命名；其余新功能词均以上方第 2 节成熟竞品标准为准。

- **Laka 既有必统一定名（`Confirmed`）**：
  - 五项一级导航：`Home`（首屏 Tab `For You`）、`Moment`、`Party`、`Message`（子 Tab `Message` / `Related` / `Call`）、`Mine`
  - 个人中心与生态入口：`Income`、`Visitor`、`Tasks`、`Recharge`、`Relationship`（`Relationship Square` / `Couple` / `CP` / `Friend`）、`My Level`（`Wealth Level` / `Charm Level`）、`Shop`（`Avatar Frame` / `Vehicle` / `Entry Effect` / `Chat bubble`）、`Agency`、`Chat Center`、`Invite Friends`、`BD Center`、`Diamonds Center`（`Exchange` / `Exchange Record`）
  - 已定专项功能：`Your Honorship`（`Medal Center` / `Title Center` / `Wear` / `Cancel`）、`Pretty ID`、`Lock Room` / `Unlock Room`、`Room PK`（`1v1 / 2v2 / 4v4 / 8v8`）
- **严禁继承的 Laka 历史瑕疵英文（参见 [reference-index.md](references/reference-index.md)）**：
  - `M24` 语法错误：`Say hi to 3 girl`、`Check-In consecutively for 1 days.`
  - `M13` 亲密度病句：`+1/ Each 800 coins`
  - `F09` / `F05` 生硬中式英文：`let us work together and make win-win cooperation!`、`Invalid date`、`60 free greeting`、`Ultra exposure`
  - `F17` 首页签到奖励弹窗不自然英文

---

## 4. C 端微文案与维护守则

1. **短平快原则**：移动端按钮优先 1–3 词（如 `Claim`、`Claimed`、`Recharge`、`Join`、`Contact Support`），避免长句塞进固定宽度按钮或角标。
2. **中英分离原则**：中文业务说明写在画板外逻辑说明、标注或 `PRD.md` 中，**严禁把中文翻译或 B 端术语硬写进设备画布内**。
3. **同词一致原则**：同一功能在同一需求所有画板、弹窗、Toast 与规则正文里必须保持同一英文词。
4. **词表扩充原则**：每次通过成熟竞品核验并经 PM 确认的新功能专有名词，交付收尾时补充到第 2 节并注明竞品来源。
