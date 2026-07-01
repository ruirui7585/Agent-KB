import { analyzeFoodWithQwen } from '../services/qwen.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 8;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default async function analyzeFoodRoutes(app) {
  app.post('/analyze-food', async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: '请上传食物图片' });
    }

    const mime = data.mimetype;
    if (!ALLOWED_TYPES.includes(mime)) {
      return reply.status(400).send({
        success: false,
        error: `不支持的图片格式: ${mime}，仅支持 jpg/jpeg/png/webp`,
      });
    }

    const buffer = await data.toBuffer();
    if (buffer.length === 0) {
      return reply.status(400).send({ success: false, error: '图片为空' });
    }
    if (buffer.length > MAX_BYTES) {
      return reply.status(400).send({
        success: false,
        error: `图片过大，最大允许 ${MAX_SIZE_MB}MB`,
      });
    }

    try {
      const result = await analyzeFoodWithQwen(buffer, mime);
      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      return reply.status(502).send({
        success: false,
        error: `识别失败: ${err.message}`,
      });
    }
  });
}
