import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ========== 配置 ==========
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BAILIAN_BASE_URL;
const MODEL = process.env.BAILIAN_MODEL || 'qwen-vl-plus';
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// ========== Express 初始化 ==========
const __dir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.static(path.join(__dir, 'public')));

// ========== Multer ==========
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('不支持的图片格式，仅支持 PNG、JPG、JPEG'));
      return;
    }
    cb(null, true);
  },
});

// ========== AI 客户端 ==========
let client = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error('DASHSCOPE_API_KEY 未配置');
    client = new OpenAI({ apiKey, baseURL: BASE_URL });
  }
  return client;
}

// ========== API ==========
app.post('/api/analyze-food', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    // Multer 错误
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: '图片过大，最大 5MB' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    // 未上传图片
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请上传一张食物图片' });
    }

    const buffer = req.file.buffer;
    const base64 = buffer.toString('base64');
    const mimeType = req.file.mimetype;

    try {
      // 调用百炼
      const openai = getClient();
      const resp = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: [
              '你是食物营养分析助手，专门识别图片中的食物。',
              '请只返回严格的 JSON 格式，不要 Markdown，不要多余文字。',
              '',
              '返回格式：',
              '{',
              '  "food_name": "食物名称（中文）",',
              '  "estimated_calories": 估计热量（数字，千卡）,',
              '  "calorie_range": "热量范围，如 300-400千卡",',
              '  "ingredients": ["主要食材1", "主要食材2"],',
              '  "confidence": "high / medium / low",',
              '  "explanation": "一句话解释估算方式"',
              '}',
              '',
              '如果无法识别食物，food_name 填 "无法识别"，estimated_calories 填 0，confidence 填 "low"。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              { type: 'text', text: '请识别图片中的食物，只返回 JSON。' },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      });

      const content = resp.choices?.[0]?.message?.content;
      if (!content) {
        return res.status(502).json({
          success: false,
          error: 'AI 模型返回了空内容，请重试',
        });
      }

      // 清洗 + 解析 JSON
      let raw = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          return res.status(502).json({
            success: false,
            error: 'AI 返回了非 JSON 格式的数据，请重试',
            raw_response: content.slice(0, 300),
          });
        }
        result = JSON.parse(match[0]);
      }

      // 构造安全返回
      return res.json({
        success: true,
        data: {
          food_name: result.food_name || '未知',
          estimated_calories: parseInt(result.estimated_calories) || 0,
          calorie_range: result.calorie_range || '',
          ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
          confidence: result.confidence || 'unknown',
          explanation: result.explanation || '',
        },
      });

    } catch (err) {
      // 区分错误类型
      let message = err.message;
      if (err.status === 401 || err.status === 403) {
        message = 'API Key 无效，请联系管理员';
      } else if (err.status === 404) {
        message = '模型不可用，请确认模型名称';
      } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        message = '无法连接百炼服务，请检查网络';
      }

      return res.status(502).json({
        success: false,
        error: message,
      });
    }
  });
});

// ========== 启动 ==========
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('FoodMind App 已启动: http://0.0.0.0:' + PORT);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('端口 ' + PORT + ' 被占用，请修改 .env 中的 PORT 为 3001');
    process.exit(1);
  }
  throw err;
});
