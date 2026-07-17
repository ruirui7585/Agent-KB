# Laka 素材清单

> 更新日期：2026-07-14  
> 规则来源：`../ui/UI_SYSTEM.md`

## 状态定义

- `official`：从已确认的当前蓝湖设计导出，或由 PM 明确提供的正式母版。
- `official-cover`：从蓝湖设计稿封面或画布预览导入，用于 UI 结构、视觉和状态参考；不是可切图母版。
- `shipped-reference`：在 Laka iOS 1.4.7 正式版中可见，但本地尚无可复用母版。
- `provisional-ai`：需求明确允许使用的临时生成素材。
- `missing-official`：页面需要该正式素材，但本地尚未取得；禁止自行仿制或替代。
- `not-reusable`：截图内容或用户媒体，只能用于理解布局，禁止作为产品素材复用。

## 蓝湖来源

- 项目：`Laka 7-9期后`
- 地址：`https://lanhuapp.com/web/#/item/project/stage?tid=edb6ff63-e81e-4474-aef0-9c0a542f7922&pid=80169c5f-183c-440f-83a5-5e10f1427f60`
- 2026-07-13 可见分组：`iOS修改`、`LBS&私密照需求`、
  `视频核心女+推荐需求`、`账号体系需求`、`自定义房间背景&房间列表卡片`、
  `第9期`、`第8期`、`第7期`。
- 核心检查起点：`iOS修改 / 首页_匹配位置变更`。
- 初次盘点结果：蓝湖已处于登录状态，但 295 个设计稿的画布在只读素材盘点时超时；这不是登录或权限问题。
- 后续只读导入结果：已从当前画布可观察的 `SketchCover` 资源中分两批导入 40 张原型封面，分别登记在下方“蓝湖关键原型封面”和“蓝湖第二优先级原型封面”。这些文件均为 `official-cover`，不是可切图母版。

## 核心正式素材

| 素材 | 计划存放位置 | 状态 | 证据 | 使用规则 |
| --- | --- | --- | --- | --- |
| 金色宫殿顶部背景 | `backgrounds/` | missing-official | Home、Moment、Party、Message、Mine 正式版截图 | 主框架必需；禁止用 CSS 或 AI 重画。 |
| 金色宫殿底部导航背景 | `backgrounds/` | missing-official | 所有五 Tab 正式版截图 | 主框架必需。 |
| Home Tab 选中/未选中素材 | `icons/` | missing-official | 正式版主框架 | 禁止替换成通用房屋图标。 |
| Moment Tab 选中/未选中素材 | `icons/` | missing-official | 正式版主框架 | 禁止替换成通用星形图标。 |
| Party Tab 选中/未选中素材 | `icons/` | missing-official | 正式版主框架 | 禁止替换成通用月亮图标。 |
| Message Tab 选中/未选中素材 | `icons/` | missing-official | 正式版主框架 | 禁止替换成通用消息图标。 |
| Mine Tab 选中/未选中素材 | `icons/` | missing-official | 正式版主框架 | 禁止替换成通用个人图标。 |
| Laka Team 标识 | `shared/` | missing-official | 会话列表截图 | 仅允许正式素材。 |
| Coin 图标 | `shared/` | missing-official | 充值、商店、任务、礼物页面 | 具有货币语义，仅允许正式素材。 |
| Diamond 图标 | `shared/` | missing-official | Diamonds、女端任务页面 | 具有货币语义，仅允许正式素材。 |
| VIP 标识和权益素材 | `shared/` | missing-official | Mine、VIP Center | 仅允许正式素材。 |
| Relationship / CP 身份素材 | `shared/` | missing-official | Relationship 页面 | 仅允许正式素材。 |
| 性别、财富、魅力、认证徽章 | `icons/` | missing-official | 列表和个人主页 | 保持同一语义家族，优先正式来源。 |
| Message Card 图标 | `icons/` | missing-official | 任务页和悬浮推广入口 | 表示货币或权益时仅允许正式素材。 |

## 截图素材

| 素材 | 状态 | 位置 | 允许用途 |
| --- | --- | --- | --- |
| 43 张 Laka iOS 1.4.7 截图 | shipped-reference | `../ui/references/ios-1.4.7-iphone-17-pro/` | 布局、构图、状态识别和视觉验收。 |
| 8 个页面 `reference.png` | shipped-reference | `../ui/screens/*/reference.png` | 页面快速基线；禁止被蓝湖或 AI 素材覆盖。 |
| 截图中的真实用户照片 | not-reusable | 嵌入截图中 | 禁止裁切、提取或作为可复用头像交付。 |
| 截图中的礼物、游戏、Banner、活动素材 | not-reusable | 嵌入截图中 | 取得正式母版前只作为视觉证据。 |

## 蓝湖关键原型封面

本批次按高频页面和关键状态选择 20 张蓝湖设计稿封面，用于后续需求 UI 参考和视觉对照。

- 获取日期：2026-07-14
- 来源项目：`Laka 7-9期后`
- 来源方式：Chrome 已登录蓝湖项目页，只读读取当前画布已加载的 `SketchCover` 封面资源。
- 本地目录：`lanhu/20260714-key-prototypes/`
- 详细资源 URL、蓝湖资源 ID 和 SHA-256 同步记录在：`lanhu/20260714-key-prototypes/selection-manifest.json`
- 使用限制：这些文件是蓝湖封面或画布预览，只能作为结构、视觉、状态和交互参考；不得替换 `ui/screens/*/reference.png`，不得当作当前线上截图，也不得当作可切图母版。

| 本地路径 | 状态 | 蓝湖分组 / 页面 | SHA-256 | 允许用途 |
| --- | --- | --- | --- | --- |
| `lanhu/20260714-key-prototypes/01-im-incoming-call-outside-chat.webp` | official-cover | `Laka 7-9期后` / IM / 被叫通话入口 | `11d006e59e1bc0a5e6cc6d92ce2075acab6d21e6544848cb053e4c4c9dccace4` | IM 被叫、通话权限和私聊外来电入口参考。 |
| `lanhu/20260714-key-prototypes/02-beauty-settings.webp` | official-cover | `Laka 7-9期后` / 视频 / 美颜设置 | `d7a204c5dcbcacc63cdc136ff248b39e1faea4ea17004517748a59fb02e553eb` | 视频美颜设置页结构参考。 |
| `lanhu/20260714-key-prototypes/03-chat-settings-icon-list.webp` | official-cover | `Laka 7-9期后` / 设置 / 聊天设置图标 | `3a9061ba465af3a9575a565f13821d455475ceaffc4870b431d6b40ed048c523` | 聊天设置和图标样式参考。 |
| `lanhu/20260714-key-prototypes/04-voice-room-ludo-default.webp` | official-cover | `Laka 7-9期后` / 语音房 / Ludo 默认态 | `f7b8bf72c02674be175676f736f4d3617a83c4f33888668c62e2b8754b236817` | 语音房 Ludo 状态参考。 |
| `lanhu/20260714-key-prototypes/07-voice-room-ludo-exit-notice.webp` | official-cover | `Laka 7-9期后` / 语音房 / Ludo 退出提醒 | `71389629fc5f135520bb463b858cf8c412b03eb5f130a43f4001e7bd925cb2a7` | 语音房游戏退出提醒参考。 |
| `lanhu/20260714-key-prototypes/08-voice-room-ludo-exit-confirm.webp` | official-cover | `Laka 7-9期后` / 语音房 / Ludo 二次确认 | `52efe4a99fd9ceeae788271e679a8ff540b7e87de397abef7c588b2f6a1cda93` | 语音房游戏二次确认参考。 |
| `lanhu/20260714-key-prototypes/18-mine-shop-entry.webp` | official-cover | `Laka 7-9期后` / Mine / Shop 入口 | `4a3352ccd9beadba89fc01f4a38fd5bc079e6e3aba04fa0f9a3bf6f10bc65fc9` | Mine 页面 Shop 入口参考。 |
| `lanhu/20260714-key-prototypes/20-user-profile-female-action-bar.webp` | official-cover | `Laka 7-9期后` / 用户主页 / 女性资料与操作栏 | `f3058852bdaa3353dc91a72bbb90951cbeb8daa1948d69938029e6e29cc29c92` | 用户主页资料区和底部操作参考。 |
| `lanhu/20260714-key-prototypes/22-profile-call-permission-sheet.webp` | official-cover | `Laka 7-9期后` / 用户主页 / 拨打权限弹窗 | `a37a310b79dd1378e042cc2a0ae99d31d5b5338ff1786293d811b351078408ba` | 用户主页拨打权限和付费入口参考。 |
| `lanhu/20260714-key-prototypes/23-gift-panel-catalog.webp` | official-cover | `Laka 7-9期后` / IM / 礼物面板 | `7001ba7e7fc8210e19d3489588e2e21bf709638203463bc8c10cc4d1cc3efd08` | IM 礼物面板和礼物分类参考。 |
| `lanhu/20260714-key-prototypes/24-shop-background-detail.webp` | official-cover | `Laka 7-9期后` / 商城 / 背景详情 | `60d7475547840e6162d582a85516c701e66b4ab46209d3f6e7ae72426f674b02` | 商城背景详情参考。 |
| `lanhu/20260714-key-prototypes/30-home-kingkong-area-feed.webp` | official-cover | `Laka 7-9期后` / 首页 / 金刚区与信息流 | `db793a0bf6732611088e844dc42d70ae14367734ee76bf283bcef26d9659384b` | 首页金刚区、推荐流和入口布局参考。 |
| `lanhu/20260714-key-prototypes/39-home-match-popup.webp` | official-cover | `Laka 7-9期后` / 首页 / 匹配弹窗 | `0db42c99d6613dd5679528436f0649739ccf8fdea543e7d7bfbeb0d8ef1ace93` | 首页匹配弹窗和推荐操作参考。 |
| `lanhu/20260714-key-prototypes/41-chat-service-center-list.webp` | official-cover | `Laka 7-9期后` / 聊天服务中心 / 列表 | `bc54bc6a3b689a8ceeebaf58bd6e65e54ec41097905a4265a753f7e3cdee4991` | 聊天服务中心列表页参考。 |
| `lanhu/20260714-key-prototypes/44-bd-income-list.webp` | official-cover | `Laka 7-9期后` / BD / 收入列表 | `d204e11a3a68561ae4f63a386135fca7f0b7f9e052e3c7fc4a208b5817c75fa5` | BD 收入与榜单信息层级参考。 |
| `lanhu/20260714-key-prototypes/49-user-profile-other-detail.webp` | official-cover | `Laka 7-9期后` / 用户主页 / 他人详情 | `7e51bc53575e9273ca8981f71024c32b0d580f4fa205138345ea9ad7d6247965` | 他人主页详情页参考。 |
| `lanhu/20260714-key-prototypes/57-agency-application-entry.webp` | official-cover | `Laka 7-9期后` / 代理申请 / 入口态 | `2648a0a684d6572aa8decefae8a8f664d1ea258f8ec2d8c1caa79a30f575e80a` | 代理申请入口和弹窗参考。 |
| `lanhu/20260714-key-prototypes/60-chat-center-performance.webp` | official-cover | `Laka 7-9期后` / 聊天服务中心 / 绩效 | `030299b3c58a9a7c59cf5f4f831a19c0022a281b8fbcbf6017723c0fb72fed47` | 女端聊天服务中心绩效页参考。 |
| `lanhu/20260714-key-prototypes/67-shop-background-purchase.webp` | official-cover | `Laka 7-9期后` / 商城 / 背景购买 | `d217ca5d6627b704cf91a5cc6ede30207520d39241109ff6380a5681313099e9` | 商城背景购买流程参考。 |
| `lanhu/20260714-key-prototypes/78-video-match-waiting.webp` | official-cover | `Laka 7-9期后` / 视频匹配 / 等待态 | `3eecb672dbedf3b007223f21297134eb09ae78b533cc4c9fbe337aa6254debbc` | 视频匹配等待态参考。 |

## 蓝湖第二优先级原型封面

本批次在首批 20 张核心原型之外，补充 20 张第二优先级设计稿封面，重点覆盖设置、关系链、账号体系、房间工具、私密内容和商业化状态。

- 获取日期：2026-07-14
- 来源项目：`Laka 7-9期后`
- 来源方式：Chrome 已登录蓝湖项目页，只读读取当前画布已加载的 `SketchCover` 封面资源。
- 本地目录：`lanhu/20260714-secondary-prototypes/`
- 详细资源 URL、蓝湖资源 ID、原始排序和 SHA-256：`lanhu/20260714-secondary-prototypes/selection-manifest.json`
- 使用限制：保持 `official-cover` 定义，仅作为结构、视觉、状态和交互参考；不得替换真实产品截图或作为可切图母版。

| 本地路径 | 状态 | 蓝湖分组 / 页面 | SHA-256 | 允许用途 |
| --- | --- | --- | --- | --- |
| `lanhu/20260714-secondary-prototypes/01-voice-match-country-filter.webp` | official-cover | 视频匹配 / 国家筛选 | `6105d1502c37f0162e972b432c2fe4cb7ea2cbee5a5ef8ea796ae6797cb0e0f0` | 视频匹配筛选层和地区范围参考。 |
| `lanhu/20260714-secondary-prototypes/02-chat-settings-detail.webp` | official-cover | 设置 / 聊天设置详情 | `bb90012b2ffbeab5f7c7abfaa4d493a57045350da4a961d8556e9111ebcd97cd` | 消息、问候和通话开关参考。 |
| `lanhu/20260714-secondary-prototypes/03-voice-room-ludo-gameplay.webp` | official-cover | 语音房 / Ludo 进行态 | `8097d3b83ddbc517b4fce19484cdaa442d99696855c249374070b3c85adccf35` | 游戏进行态与房间叠层参考。 |
| `lanhu/20260714-secondary-prototypes/04-voice-room-type-selector.webp` | official-cover | 语音房 / 房间类型选择 | `15228cda9b0757d55afbaad9dad94ed1096b6c5e7642fa30008c5f844d066074` | 房间类型、人数和费用设置参考。 |
| `lanhu/20260714-secondary-prototypes/05-private-photo-delete-sheet.webp` | official-cover | 私密照 / 删除操作面板 | `bc68191a3d1b08f99d48d7ff1542d04798229e5dc232882ab1cb096b9de5f6f5` | 私密照管理和危险操作参考。 |
| `lanhu/20260714-secondary-prototypes/06-relationship-unlock-sheet.webp` | official-cover | 关系 / 亲密等级解锁 | `8b926b12a3b2c3a47f8e47a1bd5c142b6c3382bb03c35b27164dc11fee04fec3` | 关系等级、权益和解锁条件参考。 |
| `lanhu/20260714-secondary-prototypes/07-custom-background-editor.webp` | official-cover | 自定义背景 / 编辑器 | `e2e3712f8390bd456bd26d2d1d31dcb0c503f530891ad4186e8d80ad731afac9` | 图片裁切和背景提交参考。 |
| `lanhu/20260714-secondary-prototypes/08-voice-room-toolbox.webp` | official-cover | 语音房 / 工具箱 | `8231e5647b24a086074bd6f9dbde698e406226cedc2ec2952d76c1696d8a3eaa` | 房间管理和快捷工具布局参考。 |
| `lanhu/20260714-secondary-prototypes/09-shop-border-catalog.webp` | official-cover | 商城 / 头像边框目录 | `99cab2ee19345386dd4295e2fb8f46afa3415b92830c31632c76aad41493ce94` | 商城边框分类与购买入口参考。 |
| `lanhu/20260714-secondary-prototypes/10-edit-profile.webp` | official-cover | 用户资料 / 编辑资料 | `791f11e59269f90af143b2eb0553459b80f4a00b2008ce740b06e929b278718a` | 资料字段、头像和标签编辑参考。 |
| `lanhu/20260714-secondary-prototypes/11-relationship-notice-center.webp` | official-cover | 关系 / 通知中心 | `33257eaea30f1304becdc9c26626c3ad4438597950a4d6db58d9c167d1935aeb` | 关系邀请、绑定和失败通知参考。 |
| `lanhu/20260714-secondary-prototypes/12-relationship-gift-send.webp` | official-cover | 关系 / 关系礼物发送 | `0c6ae50191bb092f3348f7d6f97ca3d6838cb48902fd59d36674fd7d922ae825` | 关系礼物选择、周期和付费动作参考。 |
| `lanhu/20260714-secondary-prototypes/13-relationship-pick-friend.webp` | official-cover | 关系 / 选择好友 | `696fb30655d4eaae66aa0f0b6420ac36accb9885fabdb0d4f8766669a6fb80b4` | 建立关系的好友选择列表参考。 |
| `lanhu/20260714-secondary-prototypes/14-chat-service-leaderboard.webp` | official-cover | 聊天服务中心 / 绩效榜单 | `8c2a3ea4343c6ec6cd23fa518a6c9ce8fe006d74ffd68b5e98c5f2300db69659` | 女端绩效排名和指标层级参考。 |
| `lanhu/20260714-secondary-prototypes/15-gift-gallery.webp` | official-cover | 用户主页 / 礼物墙 | `c97ad34ccb02ee496657a890befc3695e48c6d22ff36054bbbad465e478df447` | 礼物墙分类、数量和展示密度参考。 |
| `lanhu/20260714-secondary-prototypes/16-creator-center-earnings.webp` | official-cover | 创作者中心 / 收益概览 | `5b6df50c01143f25c38aaad0370763565db64b4ffcac9ed468e424f5d5a49727` | 收益、通话与消息指标参考。 |
| `lanhu/20260714-secondary-prototypes/17-chat-message-request.webp` | official-cover | IM / 消息请求状态 | `952bb6ab8ed3e355c313c5ba2cfb995f124363eddad41e0d33ffcc65f452b7d9` | 陌生人消息请求与付费前置状态参考。 |
| `lanhu/20260714-secondary-prototypes/18-vip-center.webp` | official-cover | VIP / 权益中心 | `f40c3e71e3145822408c43a945fecd36b3d33fb95dcea1142afbae345655da56` | VIP 权益列表和订阅入口参考。 |
| `lanhu/20260714-secondary-prototypes/19-password-setting.webp` | official-cover | 账号体系 / 密码设置 | `33326f3e3cffbb39077c113fb2565f4b74956e203d4dd20c8cba2c49226a22b0` | 密码设置确认弹窗参考。 |
| `lanhu/20260714-secondary-prototypes/20-sign-in.webp` | official-cover | 账号体系 / 登录页 | `77a893bf75e72637b40079bb7145405147961ebaa9e3c3388e2fd0d402aa5c7b` | 多渠道登录和账号入口参考。 |

## 蓝湖素材导入流程

新增蓝湖素材前必须依次完成：

1. 确认所属分组和页面是当前需求的有效设计。
2. 仅执行只读导出或下载，不修改蓝湖源文件。
3. 保留原始文件格式，不覆盖任何本地已有文件。
4. 按产品用途重命名本地副本。
5. 在本清单中补充来源分组、页面、获取日期、校验值、状态和允许用途。
6. 两个候选素材发生冲突时均不导入，先由 PM 确认。

正式登记格式：

| 本地路径 | 状态 | 蓝湖分组 / 页面 | 获取日期 | SHA-256 | 允许用途 |
| --- | --- | --- | --- | --- | --- |

## 临时素材流程

只有一次性礼物、短期活动和非品牌装饰实验可以使用 `provisional-ai`，且必须由需求明确允许。
登记时必须附生成提示词以及后续删除或转正结论。临时素材不得占用预期正式素材的文件名。
