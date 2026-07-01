# CalSnap 技术方案

## 一、架构总览

```
┌────────────────────────────────────────┐
│           iPhone Safari (PWA)          │
│  index.html → SPA → 5 个 Tab 页面       │
│  Service Worker → 离线壳缓存            │
└──────────────┬─────────────────────────┘
               │ HTTPS (JSON / FormData)
               ▼
┌────────────────────────────────────────┐
│       阿里云轻量应用服务器               │
│  Nginx (80/443) → 静态文件 + 反代       │
│  Node.js Fastify (127.0.0.1:3000)      │
│  SQLite (better-sqlite3)               │
└──────────────┬─────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────┐  ┌──────────────────┐
│  阿里云百练        │  │  Open Food Facts │
│  (食物识别)       │  │  (v2 扫码)       │
└──────────────────┘  └──────────────────┘
```

## 二、技术栈

| 层 | 选型 | 版本 | 理由 |
|---|---|---|---|
| 前端 | Vanilla JS SPA | - | 零依赖，零构建，即写即用 |
| 样式 | 纯 CSS | - | 移动端 480px 容器，无框架 |
| PWA | manifest.json + SW | - | Safari 支持完整 |
| 后端 | Node.js + Fastify | v5 | 轻量，TypeScript 友好 |
| 数据库 | better-sqlite3 | v11 | 同步 API，速度快，零配置 |
| 图片处理 | sharp | v0.33 | 压缩上传图片，减少 API 延迟 |
| 进程管理 | PM2 | latest | 自动重启，日志管理 |
| 反代 | Nginx | 系统自带 | HTTPS + 静态文件 + Gzip |

## 三、API 接口

### 3.1 `POST /api/food/analyze`

拍照识别食物。

```
Request: multipart/form-data
  image: <file>           # JPEG/PNG/WebP, ≤8MB

处理流程:
  1. 接收图片 → sharp 压缩到 1024px 宽
  2. 转 base64 → 调百练 qwen3.7-plus，失败时可回退 qwen3.6-flash
  3. 解析并校验结构化 JSON → 返回估算结果，不保存图片或记录

Response 200:
{
  "foods": [
    {
      "name": "番茄炒蛋",
      "calories": 180,
      "weight_g": 200,
      "calorie_min": 150,
      "calorie_max": 230,
      "protein_g": 12,
      "fat_g": 10,
      "carbs_g": 8,
      "confidence": "medium"
    }
  ],
  "total_calories": 380,
  "total_calorie_min": 330,
  "total_calorie_max": 450,
  "description": "一盘番茄炒蛋配白米饭"
}
```

### 3.1b `POST /api/food/calculate`

按用户已经称量的克重计算热量，不接收或保存图片。

```
Request JSON:
{
  "foods": [
    {"name": "熟米饭", "weight_g": 150},
    {"name": "鸡胸肉", "weight_g": 120}
  ]
}

处理流程:
  1. 校验 1–10 项、名称非空、克重 1–5000g
  2. 百练按常见每 100g 营养数据换算
  3. 服务端恢复用户输入的名称、克重和顺序
  4. 返回与图片识别一致的结果结构，不自动保存
```

### 3.2 `POST /api/records`

用户核对并修改识别结果后，确认保存。

```
Request:
{
  "meal_type": "lunch",
  "foods": [{"name": "番茄炒蛋", "weight_g": 200, "calories": 180}]
}

Response 201:
{ "id": "uuid", "date": "2026-06-15", "time": "12:30", "total_calories": 180 }
```

### 3.3 `GET /api/records?date=2026-06-15`

获取某天记录。

```
Response 200:
{
  "date": "2026-06-15",
  "meals": {
    "breakfast": [{ "id": "uuid", "time": "08:00", "foods": [...], "total_cal": 480 }],
    "lunch":    [...],
    "dinner":   [...],
    "snack":    [...]
  },
  "day_total": 1680,
  "goal": 2350,
  "remaining": 670
}
```

### 3.4 `GET /api/stats?range=7|30`

获取统计数据。

```
Response 200:
{
  "daily": [
    {"date": "2026-06-15", "total": 1680, "goal": 2350},
    ...
  ],
  "avg_cal": 1850,
  "over_goal_days": 2,
  "goal": 2350,
  "tdee": 2350
}
```

### 3.5 `GET /api/profile`

```
Response 200:
{ "gender": "male", "height_cm": 175, "weight_kg": 70, "age": 28,
  "activity_level": "light", "tdee": 2350, "daily_cal_goal": 2350 }
```

### 3.6 `PUT /api/profile`

```
Request: { "gender": "male", "height_cm": 175, ... }
Response 200: { "tdee": 2350, "daily_cal_goal": 2350 }
```

### 3.7 `GET /api/settings`

```
Response 200:
{ "has_bailian_key": true, "bailian_model": "qwen3.7-plus",
  "access_protection_enabled": true, "daily_cal_goal": "2281" }
```

### 3.8 `PUT /api/settings`

```
Request: { "daily_cal_goal": "2200" }
Response 200: { "updated": ["daily_cal_goal"] }
```

### 3.9 `GET /api/health`

```
Response 200: { "status": "ok", "time": "..." }
```

## 四、数据库设计

```sql
-- 用户档案（单条，用 key-value 存）
CREATE TABLE profile (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- 预设 key: gender, height_cm, weight_kg, age, activity_level

-- 饮食记录
CREATE TABLE records (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,
  time       TEXT NOT NULL,
  meal_type  TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  foods_json TEXT NOT NULL,
  total_cal  REAL NOT NULL,
  image_path TEXT,
  source     TEXT NOT NULL DEFAULT 'vision',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX idx_records_date ON records(date);

-- 通用设置
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 扫码缓存（v2 启用）
CREATE TABLE barcode_cache (
  barcode    TEXT PRIMARY KEY,
  data_json  TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
```

## 五、项目结构

```
calsnap/
├── docs/
│   ├── prd.md              ← 产品需求文档
│   ├── ui.md               ← UI 设计文档
│   └── tech-spec.md        ← 本文档
├── server/
│   ├── package.json
│   ├── ecosystem.config.js  # PM2 配置
│   ├── src/
│   │   ├── index.js         # Fastify 入口
│   │   ├── db.js            # SQLite 初始化
│   │   ├── routes/
│   │   │   ├── food.js      # /api/food/*
│   │   │   ├── records.js   # /api/records
│   │   │   ├── stats.js     # /api/stats
│   │   │   ├── profile.js   # /api/profile
│   │   │   └── settings.js  # /api/settings
│   │   ├── services/
│   │   │   ├── gemini.js    # Gemini Vision 调用
│   │   │   └── tdee.js      # TDEE 计算
│   │   ├── middleware/
│   │   │   └── error.js     # 统一错误处理
│   │   └── utils/
│   │       ├── image.js     # sharp 图片压缩
│   │       └── response.js  # 统一响应格式
│   └── deploy/
│       ├── nginx.conf
│       └── setup.sh         # 一键部署脚本
├── web/
│   ├── index.html           # SPA 入口
│   ├── manifest.json        # PWA
│   ├── sw.js                # Service Worker
│   ├── css/
│   │   └── style.css        # 全部样式
│   ├── js/
│   │   ├── app.js           # SPA 路由 + 初始化
│   │   ├── api.js           # API 请求封装
│   │   ├── utils/
│   │   │   ├── config.js    # API 地址配置
│   │   │   ├── format.js    # 日期/数字格式化
│   │   │   └── db.js        # IndexedDB 离线缓存
│   │   ├── pages/
│   │   │   ├── dashboard.js # 首页
│   │   │   ├── camera.js    # 拍照识别
│   │   │   ├── history.js   # 历史+统计
│   │   │   ├── barcode.js   # 扫码(v2)
│   │   │   └── settings.js  # 设置
│   │   └── components/
│   │       ├── tabbar.js    # 底部导航
│   │       ├── food-card.js # 食物卡片
│   │       ├── chart.js     # Canvas 图表
│   │       ├── loader.js    # 加载动画
│   │       └── empty.js     # 空状态
│   └── assets/
│       ├── icon-192.png
│       └── icon-512.png
```

## 六、关键算法

### TDEE 计算

```
BMR(男) = 10×体重 + 6.25×身高 - 5×年龄 + 5
BMR(女) = 10×体重 + 6.25×身高 - 5×年龄 - 161

TDEE = BMR × 活动系数
  久坐 1.2 / 轻度 1.375 / 中度 1.55 / 重度 1.725 / 运动员 1.9

热量差 = 今日摄入 - TDEE
```

### 百练视觉理解 Prompt

```
识别所有可见食物，返回中文名称、估算重量、热量及区间、三大营养素和置信度。
非食物图片返回空 foods。模型输出必须经过服务端解析、截断和数值校验。
```

## 七、部署方案

### 服务器环境

- 轻量应用服务器，需确认系统镜像（推荐 Ubuntu 20.04+）
- Node.js 20 LTS（通过 nvm 或二进制安装）
- Nginx（系统自带或 apt 安装）
- 百练业务空间专属 Base URL、重新生成的 API Key
- 识别限流、HTTPS 与 SQLite 定时备份

### 部署步骤（setup.sh）

```bash
# 1. 安装 Node.js（如未安装）
# 2. cd /opt/calsnap/server && npm install
# 3. 配置 Nginx + Let's Encrypt
# 4. pm2 start ecosystem.config.js
# 5. pm2 save && pm2 startup
```

### 部署后的服务

| 服务 | 端口 | 说明 |
|---|---|---|
| Nginx | 80/443 | 反代 /api → 3000, / → /opt/calsnap/web |
| Fastify | 3000 (仅本地) | API 服务 |
| PM2 | - | 进程守护 |

## 八、测试方案

### 自动化测试范围

| 层 | 工具 | 测什么 |
|---|---|---|
| API 接口 | Node.js 内置 test + `node:test` | 8 个接口的请求/响应格式 |
| TDEE 计算 | 单元测试 | BMR/TDEE 公式正确性 |
| 前端页面 | Playwright | 5 个页面可渲染、关键元素存在 |
| E2E 流程 | Playwright | 拍照→识别→首页更新的完整链路 |

### 手动验证清单

- [ ] PWA 安装到 iPhone 桌面
- [ ] 拍照功能 → 百练返回正确结构化 JSON
- [ ] 确认前无记录，确认后只新增一条记录
- [ ] 修改食物名/份量/热量后保存值一致
- [ ] 设置页填写资料 → TDEE 自动计算
- [ ] 历史页 7/30 天切换图表正确
- [ ] 热量超标时红色提示正确

## 九、当前实现状态

- 活动主线为 `web/ + server/`；`app/` 仅保留为旧 Demo，不参与部署。
- `/api/food/analyze` 使用百练且不落盘原图。
- `/api/records` 在用户确认后保存经过修正的数据。
- Key 仅从环境变量读取；公网接口直接访问，识别接口保留 IP 限流。
- 待用户提供阿里云实例、域名、业务空间 ID 和新 API Key 后执行云端部署。

## 十、执行顺序

| 阶段 | 内容 | 文件数 |
|---|---|---|
| 1. 后端新功能 | profile 路由 + tdee 服务 + prompt 改 | ~3 新 + 3 改 |
| 2. 后端修正 | records/stats/settings 对齐 UI | ~3 改 |
| 3. 前端页面 | 5 个页面按 UI 重写 | ~5 改 |
| 4. CSS | 全部样式对齐设计规范 | 1 改 |
| 5. 部署脚本 | setup.sh 一键部署 | 1 新 |
| 6. 自动化测试 | API 测试 + 单元测试 | ~5 新 |
| 7. 部署上线 | scp → npm install → pm2 start | - |
