# Laka PM 信号收箱与资产转化 SOP（AI 执行手册）

> 适用范围：`Projects/laka/` 日常竞品预研、竞品截图拆解、竞品文案对标与短备忘治理。  
> 门禁提醒：所有新增英文词条先写入 `agents/competitor-analysis/copy-staging.md`，**严禁未经 PM 确认直接改写 `ui/COPY_GLOSSARY.md`、`DECISIONS.md` 或 `PROJECT_CONTEXT.md`**。文档与数据内一律使用相对路径。

---

## 1. 统一 8 大业务能力域（Module Taxonomy）

所有竞品能力卡片、索引条目与文案标签必须映射到以下 8 个稳定能力域之一（严禁按日期堆砌）：

| `module` 标识 | 中文能力域 | 典型覆盖内容 |
|---|---|---|
| `voice-room` | 语聊房与麦位管理 | 房间发现、排麦/上麦/锁麦、房管权限、锁房、房间模式与玩法 |
| `pk-battle` | PK 对战与榜单冲刺 | 1v1/团战 PK、加时冲刺、惩罚、MVP、房间榜/活动榜 |
| `vip-nobility` | VIP / 贵族与隐私特权 | 等级权益、隐身/神秘人、防踢、座驾/进场特效、续费与升级规则 |
| `pretty-id-honorship` | 靓号 / 勋章与荣誉体系 | 靓号规则与展示、勋章中心、称号佩戴、身份外显 |
| `gifts-events-recharge` | 礼物 / 活动与累计充值 | 礼物面板、幸运礼物/盲盒、转盘、累充档位、背包与商城 |
| `1v1-match-chat` | 1v1 发现、破冰与收费 | 推荐/附近、随机音视频匹配、打招呼、消息/通话计费、自动翻译 |
| `host-agency-supply` | 主播 / 公会与供给结算 | Host 任务、Agency 后台、邀请与分成、提现、风控与认证 |
| `profile-social-relations` | 个人主页与社交关系 | 资料卡、关注/访客、CP / 守护 / 家族 / 粉丝团、动态 Feed |

---

## 2. 三大触发口令与执行流程

### 口令 A：「需求前预研：我想做 [XXX]」
目标：**先复用，后精准补拍**，把 PM 版本前的盲目截图量砍掉 60%–80%。

1. 确定需求所属的 1–2 个 `module`。
2. 依次检索：
   - `agents/competitor-analysis/library-data.json`（筛选同 `module` 卡片与已提取文案）；
   - `agents/competitor-analysis/cards/<module>.md`（若已存在）；
   - `ui/COPY_GLOSSARY.md` 对应章节；
   - `agents/competitor-analysis/competitor-pool.md` 与 `domain-memo-log.md`。
3. 输出一份结构化《需求前预研简报》：
   - **已有可复用竞品结论**（附已入库截图路径与规则摘要）；
   - **可直接采用的成熟英文词表**（标注来自 `COPY_GLOSSARY.md` 或待拍板分叉词）；
   - **精准实机补拍清单（限 3–5 项）**：明确告诉 PM 只需去哪 1–2 个竞品补截哪几个关键页面（如付费弹窗、规则说明、空/异常态），并说明每张图要验证的核心问题。

---

### 口令 B：「收箱整理」或「入库拆解」（贴图/贴字/扫描本地收件箱）
目标：一次完成 **指纹查重 → 拆机制写卡片 → OCR 提词对标 → 碎念补全分流 → 归档并刷新看板**。

#### Step 1：扫描与查重
- 若素材在本地收件箱，运行：
  `node pm-inbox/scripts/scan-inbox.mjs scan`
- 对哈希已存在于 `library-data.json` 的完全重复图片，**直接跳过视觉拆解**，向 PM 汇报其已归档位置与卡片 ID（避免重复处理与重复烧 Token）。
- 若 PM 直接在对话中贴图，先将图片按规范命名保存至 `agents/competitor-analysis/assets/screenshots/<competitor>-<module>-<slug>-<YYYYMMDD>.<ext>` 再进入后续步骤。

#### Step 2：看图拆机制（生成/追加能力卡片）
对每张有效竞品截图：
1. 识别：`competitor`、`module`、`page`（页面名称）、`evidence_level`（`实机截图` / `商店截图` / `公开宣传图`）、`captured_date`、`language`。
2. 拆解 4 个核心产品维度（拒绝只写“界面很好看”的空话）：
   - **入口与核心路径**：从哪进、主操作按钮是什么；
   - **关键规则与状态**：限制条件、倒计时、解锁门槛、主客态差异；
   - **商业化 / 留存钩子**：金币/钻石定价、触发付费节点、炫耀或关系杠杆；
   - **对 Laka 的结论**：标记 `借鉴` / `避坑` / `仅观察`，一句话写清可落地动作。
3. 写入或追加到 `agents/competitor-analysis/cards/<module>.md`（遵循 `cards/TEMPLATE.md`），并将归档图片移至 `agents/competitor-analysis/assets/screenshots/`（清理 `pm-inbox/raw/` 中已处理文件）。

#### Step 3：自动提词与对标（终结人肉翻译与重复发英文）
对截图中的界面英文/多语文案，以及 PM 贴入的竞品文案：
1. 完整抽取关键按钮、标签、弹窗标题、状态词、规则句。
2. 对照 `ui/COPY_GLOSSARY.md` 与 `~/.kb/skills/social-ui-copy/SKILL.md` 四条红线，为每个词条打标：
   - `Already-Standard`：已收录于 Laka 词表（直接沿用）；
   - `New-Candidate`：词表未覆盖的新词（加入 `copy-staging.md` 待 PM 确认）；
   - `Branching`：竞品间存在命名分叉（注明竞品差异，待 PM 拍板）；
   - `Banned-Risk`：存在直译或 B 端泄漏风险（给出竞品标准替换词）。
3. **在本次回复中直接输出一份“研发/UI 可直接复制的中英文案表”**，同时将 `New-Candidate` / `Branching` 写入 `agents/competitor-analysis/copy-staging.md`。

#### Step 4：14 字碎念意图分流与自动补全上下文
逐条读取 `pm-inbox/quick-notes.md`（或 PM 直接发来的短句）：
1. 自动识别意图，归入 `agents/competitor-analysis/domain-memo-log.md` 对应的 4 个分区：
   - `术语与数据口径`（如衰退机制、牵线、视频核心女分布）
   - `礼物 / 物料 / 活动评审`
   - `需求规则与文案灵感`
   - `测试口径与线上异常`
2. 结合 `PROJECT_CONTEXT.md`、`REQUIREMENTS_INDEX.md` 和 `DECISIONS.md` 尝试补全“最小上下文”（涉及模块、可能关联需求、初步业务解释、待确认问题）。
3. **极简反问原则**：只有当一条短备忘完全无法判断业务归属时，才在回复末尾集中向 PM 追问 **≤ 1 句选择题**；绝不要求 PM 自己写长备忘。
4. 归档完成后，重置 `pm-inbox/quick-notes.md` 为空白待用模板。

#### Step 5：刷新统一索引与离线看板
1. 将新增卡片、文案条目、碎念台账写入 `agents/competitor-analysis/library-data.json`。
2. 运行同步脚本刷新离线看板数据：
   `node pm-inbox/scripts/scan-inbox.mjs sync`
3. 向 PM 汇报处理摘要（新增卡片数、跳过重复图数、待确认英文词条数、分流备忘数、可直接发给研发的文案表）。

---

### 口令 C：「确认词表入库：通过第 X、Y 条」
1. 核对 `agents/competitor-analysis/copy-staging.md` 中 PM 明确同意的词条。
2. 按 `ui/COPY_GLOSSARY.md` 现有表格格式精准写入对应章节，并同步更新 `copy-staging.md` 状态为 `Approved` 与 `library-data.json` 状态。
3. 运行 `node pm-inbox/scripts/scan-inbox.mjs sync` 刷新看板。
