---
name: pm-delivery-workflow
description: 从浏览器云端模型聊天内容、零散思路或 Feature Contract 全自动推进到轻量契约、静态黑白线框图与完整 PRD + 7 维边界自检；是否生成带色彩的高保真原型为可选项（非必选），严格拦截 AI 擅自加戏并控制色彩原型的 Token 消耗。
---

# PM Delivery Workflow

## 定位与交付模式（默认黑白线框+PRD，上色高保真为可选项）

作为唯一的产品需求与原型交付编排器，将“自动拿到云端聊天思路 → 轻量契约 → 静态黑白线框看结构 → 补全完整 `PRD.md` + 7 维边界自检 →（可选）色彩高保真”串成**无缝自动化闭环**。执行准备检查内置于本 Skill，不调用独立 `contract-review`。

### 按 `Mode` 分流执行（未指定上色时默认 `wireframe-only`）
- **`wireframe-only`（默认主交付 · 不上色直接完结）**：`第0步（自动抓云端聊天）→ 第1步（自动提炼轻量契约与白名单）→ 第2步（直接自动出黑白静态线框 index.html）→ 第3步（自动补全 PRD.md + 运行 prd-boundary-audit 7维自检）→ 打开本地预览并交付完成`。**到此正式完成，不强制上色高保真、重型标注或 Vercel 部署。**
- **`two-stage`（仅当用户明确表示“先线框、确认后再上色”时选用）**：跑完第 0～3 步后**停 1 次**，等你确认结构与 P0/P1 边界后，再执行 `第4步（原地升级色彩高保真 + 标注）→ 第5步（审查修复）→ 第6步（Vercel 只读部署）`，避免高耗 Token 的色彩原型返工。
- **`high-fidelity`（仅当用户明确指定“直接出带色彩的高保真原型”时选用）**：`第0步 → 第1步 → 第3步（先补全 PRD.md + 7维边界自检，有阻塞 P0 才暂停）→ 第4步 → 第5步 → 第6步`。

```text
用户最新明确确认 > Feature Contract > 项目规范 > 已有旧逻辑 > Agent 默认判断
```
- 保留未被废弃的旧逻辑；每个阶段开始只报一句：`当前阶段：[阶段名称]｜预期产出：[一句话]`。

---

## 执行流程

### 第零步：自动抓取云端模型“收口总结”（免搬运 · 严控 Token）
当用户指出思路在云端模型（ChatGPT / Claude / Gemini / Kimi / DeepSeek / 豆包等）或网页文档中时，按以下顺序只读获取：
1. **浏览器标签页精准截取（首选，只抓最后 1 条收口总结）**：
   - 调用 `chrome-devtools` MCP 的 `list_pages` 查看已打开标签页，按模型名、URL 或标题关键词定位唯一对话标签页（若存在多个候选标签且无法区分，列出标题请用户点选 1 个，不得猜错页面）。
   - 执行 `evaluate_script` 在浏览器端完成裁剪后再回传：**默认只提取最后 1 条 AI 助手完整回复**（即你在云端发“收口”后模型吐出的 1 页总结，匹配如 ChatGPT `[data-message-author-role="assistant"]`、Claude `.font-claude-response`、Gemini `model-response` 的最后一个节点；硬上限 `6,000` 字符）。
   - **禁止无脑拉全量历史或全页 `body.innerText` / `take_snapshot`**：只有当最后 1 条明显不是总结且缺失背景时，才返回“末尾 2 轮对话 + 前序用户提问前 30 字索引”，并按需单点回查指定轮次；仅在脚本受执行策略限制时才降级用 `take_snapshot`。
   - **安全与权限边界**：严格只读，不点击发送、不改动网页状态；遇未登录页、授权拦截或人机验证（CAPTCHA）**立即停止并诚实告知**，绝不绕过任何验证。
2. **桌面端剪贴板兜底**：若用户使用原生桌面客户端，可按需通过 `pbpaste` 读取刚复制的收口总结。

### 第一步：自动提炼轻量契约与防加戏锁（不阻塞推进）
1. **自动收口**：若已有 `~/.kb/templates/feature-contract-template.md` 契约则直接读取；否则从第零步抓回的云端聊天记录或用户口述中，**自动提炼**出轻量 `Feature Contract`（含需求目标、Mode、**画板白名单**、**Strict Non-Goals** 与 `TBD` 清单），写入需求目录 `README.md` / `FEATURE_CONTRACT.md`。
2. **范围自锁**：未写入白名单的状态、弹窗、统计卡或交互，**严禁画进原型**，仅归入 `TBD` 或后续第 3 步的边界报告。
3. 仅当缺少目标项目/目录或存在无法兼容的致命规则冲突时才暂停；其余情况**不停顿、直接进入第二步**。

### 第二步：自动生成黑白静态线框图（调用 `ui-html-build` 阶段一）
- 按白名单**直接生成**极简黑白静态画板 `index.html`（不额外停下来等文本清单确认，避免打断自动化节奏；防加戏靠白名单硬锁 + 审查拦截保证）。
- 仅画白名单内的画板与元素，不做双语文案、不做重型标注 Runtime、不写业务点击 JS。

### 第三步：自动补全 `PRD.md` + 7 维边界自检（调用 `prd-boundary-audit`）
- 紧接着黑白线框（或 `high-fidelity` 上色前），依据轻量契约与线框结构按 `~/.kb/templates/prd-template.md` **自动补全完整 `PRD.md`**。
- **自动运行 `~/.kb/skills/prd-boundary-audit/SKILL.md`**：从权限、时序时区并发、逆向回滚、存量级联、统计口径、极限值混排、前后台联动 7 个维度扫雷，列出 P0/P1/P2 边界缺口及推荐默认口径。
- **分流出口**：
  - `Mode = wireframe-only`（默认）：完成轻量静态检查（白名单一致、无越界加戏、画布尺寸正确、无报错），自动打开本地 `index.html` 预览并一次性交付（`轻量契约 + 黑白线框 + PRD.md + 7维边界自检报告`），流程到此完结。
  - `Mode = two-stage`：**在此停 1 次**，向用户呈现黑白线框预览与 P0/P1 边界推荐方案；待用户确认“结构确认 + 边界选哪项 + 开始上色”后，自动执行第四～六步。

### 第四步（可选 · 仅上色时）：原地升级色彩高保真 + 产品标注
- 调用 `~/.kb/skills/ui-html-build/SKILL.md`（阶段二）在同一 `index.html` 原地升级为色彩高保真静态原型，并按 `~/.kb/skills/prototype-annotation/SKILL.md` 接入标注层（外联拆包、按需双语与后续 `Patch-Only` 微调由 `ui-html-build` 控制）。

### 第五步（可选 · 仅上色时）：审查与修复
- 调用 `~/.kb/skills/implementation-review/SKILL.md` 执行高保真全量审查（含 Scope Creep 拦截）；明确偏差直接局部 Patch 修复（不重写整页），同一问题最多修 3 轮；超限则暂停。

### 第六步（可选 · 仅上色时）：自动部署 Vercel Production 与最终同步
`implementation-review` 通过即获 Vercel 发布授权（`wireframe-only` 不触发），按工作区 `COMMON_UI_RULES.md` §10 部署整站只读版：
1. 检查无敏感内容，优先用 `vercel`（否则 `npx --yes vercel@latest`，禁全局安装），`vercel whoami` / `vercel link --yes`；
2. `vercel deploy --dry --format=json` 查上传清单（`.vercelignore` 排除 `PRD.md` 等内部文档）→ `vercel deploy --prod --yes`；
3. 匿名访问验证页面非空、资源正常、修改型交互与写入接口全不可用且与本地一致，并核查目标地区访问（未验则诚实标“部分完成”），最终一次性同步交付报告。

---

## 暂停与禁止事项

- **仅在以下情况暂停**：无法访问或定位云端聊天页（含未登录/人机验证）；目标目录缺失或核心规则致命冲突；`two-stage` 完成黑白线框 + 边界报告等待上色确认；`high-fidelity` 首轮存在涉及收费/权限/状态机的 P0 阻塞矛盾；同一修复或部署超 3 轮失败；存在无法排除的敏感数据。
- **禁止**：强迫用户在不需要上色时执行色彩高保真与 Vercel 部署；绕过登录/CAPTCHA；未锁结构与边界就直接反复重画带色彩的高保真浪费 Token；越界加戏；生成 `delivery.html`；把 `wireframe-only` 卡在双语/标注检查上；虚报未执行的验证。
