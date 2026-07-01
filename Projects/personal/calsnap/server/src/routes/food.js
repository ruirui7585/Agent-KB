import { randomUUID } from 'node:crypto';
import { analyzeFoodWithQwen, calculateFoodByWeight } from '../services/qwen.js';
import { lookupBarcode } from '../services/openfoodfacts.js';
import db from '../db.js';
import { ok, sendError } from '../utils/response.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const rateBuckets = new Map();

function allowAnalyzeRequest(ip) {
  const now = Date.now();
  const windowMs = Number.parseInt(process.env.ANALYZE_RATE_WINDOW_MS || '600000', 10);
  const maxRequests = Number.parseInt(process.env.ANALYZE_RATE_LIMIT || '10', 10);
  const recent = (rateBuckets.get(ip) || []).filter((time) => now - time < windowMs);
  if (recent.length >= maxRequests) return false;
  recent.push(now);
  rateBuckets.set(ip, recent);
  return true;
}

export default async function foodRoutes(app) {
  app.post('/analyze', async (req, reply) => {
    if (!allowAnalyzeRequest(req.ip)) {
      return sendError(reply, 429, '识别请求过于频繁，请稍后再试');
    }

    const data = await req.file();
    if (!data) return sendError(reply, 400, '请上传食物图片');
    if (!ALLOWED_IMAGE_TYPES.has(data.mimetype)) {
      return sendError(reply, 400, '仅支持 JPEG、PNG、WebP 图片');
    }

    try {
      const buffer = await data.toBuffer();
      if (!buffer.length) return sendError(reply, 400, '图片内容为空');

      const result = await analyzeFoodWithQwen(buffer, data.mimetype);
      reply.header('Cache-Control', 'no-store');
      return ok(reply, result);
    } catch (err) {
      req.log.error({ err }, 'food analysis failed');
      if (err?.code === 'FST_REQ_FILE_TOO_LARGE') {
        return sendError(reply, 413, '图片过大，最大允许 8MB');
      }
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        return sendError(reply, 504, 'AI 识别超时，请稍后重试或换一张更清晰的图片');
      }
      return sendError(reply, 502, `识别失败：${err.message}`);
    }
  });

  app.post('/calculate', async (req, reply) => {
    if (!allowAnalyzeRequest(req.ip)) {
      return sendError(reply, 429, '计算请求过于频繁，请稍后再试');
    }

    try {
      const result = await calculateFoodByWeight(req.body?.foods);
      reply.header('Cache-Control', 'no-store');
      return ok(reply, result);
    } catch (err) {
      if (err?.code === 'INVALID_FOOD_INPUT') {
        return sendError(reply, 400, err.message);
      }
      req.log.error({ err }, 'food weight calculation failed');
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        return sendError(reply, 504, 'AI 计算超时，请稍后重试');
      }
      return sendError(reply, 502, `计算失败：${err.message}`);
    }
  });

  app.post('/barcode', async (req, reply) => {
    const { barcode, meal_type } = req.body;
    if (!barcode) return sendError(reply, 400, '请输入条形码');

    const result = await lookupBarcode(barcode);
    if (!result) return sendError(reply, 404, '未找到该商品信息');

    const id = randomUUID();
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);
    const meal = meal_type || 'snack';

    db.prepare(`INSERT INTO records (id, date, time, meal_type, foods_json, total_cal, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, date, time, meal, JSON.stringify(result.foods), result.total_calories, 'barcode');

    return ok(reply, {
      id, product_name: result.product_name, brand: result.brand,
      foods: result.foods, total_calories: result.total_calories,
      date, time, meal_type: meal, source: 'barcode'
    });
  });
}
