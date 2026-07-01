import { readFileSync, existsSync } from 'node:fs';
import OpenAI from 'openai';
import 'dotenv/config';

const IMAGE_PATH = '/root/food.png';
const BASE_URL = 'https://ws-a6y61vr85puqg6o5.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';
const MODEL = 'qwen-vl-plus';

async function main() {
  console.log('========== FoodMind 百炼 API 测试 ==========\n');

  console.log('[1/4] 检查测试图片...');
  if (!existsSync(IMAGE_PATH)) {
    console.error(`❌ 图片不存在: ${IMAGE_PATH}`);
    console.log('请先将食物图片上传到 ' + IMAGE_PATH);
    process.exit(1);
  }
  const buffer = readFileSync(IMAGE_PATH);
  const base64 = buffer.toString('base64');
  console.log('✅ 图片已读取 (' + (buffer.length / 1024).toFixed(1) + ' KB)\n');

  console.log('[2/4] 检查 API Key...');
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.error('❌ DASHSCOPE_API_KEY 未设置，请检查 .env 文件');
    process.exit(1);
  }
  console.log('✅ Key 已配置 (' + apiKey.slice(0, 8) + '***' + apiKey.slice(-4) + ')\n');

  console.log('[3/4] 初始化客户端...');
  const client = new OpenAI({ apiKey, baseURL: BASE_URL });
  console.log('✅ 客户端就绪，模型: ' + MODEL + '\n');

  console.log('[4/4] 调用百炼视觉模型...\n');
  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: [
            '你是食物营养识别助手。识别图片中的食物，只返回严格 JSON，不要 Markdown，不要多余文字。',
            '',
            '格式：',
            '{"food_name":"","estimated_calories":0,"calorie_range":"","ingredients":[],"confidence":"","explanation":""}',
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: 'data:image/png;base64,' + base64 } },
            { type: 'text', text: '识别图片中的食物，只返回 JSON。' },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const content = resp.choices?.[0]?.message?.content;
    if (!content) {
      console.error('❌ 模型返回空内容');
      console.log('完整响应:', JSON.stringify(resp, null, 2));
      process.exit(1);
    }

    let raw = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let result;
    try {
      result = JSON.parse(raw);
    } catch (e) {
      var match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('❌ 无法提取 JSON');
        console.log('模型原始返回:', content);
        process.exit(1);
      }
      result = JSON.parse(match[0]);
    }

    console.log('========== 识别成功 ==========');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('🍔 食物: ' + result.food_name);
    console.log('🔥 热量: ' + result.estimated_calories + ' 千卡');
    console.log('📊 置信度: ' + result.confidence);
    if (result.explanation) console.log('📝 说明: ' + result.explanation);

  } catch (err) {
    if (err.status === 401) {
      console.error('❌ API Key 无效 (401)，请在百炼控制台重新生成');
    } else if (err.status === 404) {
      console.error('❌ 模型 ' + MODEL + ' 不存在 (404)，请确认模型名称');
    } else if (err.status === 429) {
      console.error('❌ 请求频率超限 (429)，请稍后再试');
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('❌ 网络不通，无法连接百炼服务');
    } else {
      console.error('❌ 调用失败:', err.message);
    }
    process.exit(1);
  }
}

main();
