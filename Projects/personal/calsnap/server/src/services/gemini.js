import { compressImage, bufferToBase64 } from '../utils/image.js';
import db from '../db.js';

export async function analyzeFoodImage(imageBuffer) {
  const { buffer: compressed } = await compressImage(imageBuffer);
  const base64 = bufferToBase64(compressed);

  const prompt = `Identify all foods in this image, especially Chinese dishes.
For each food, estimate:
- Name (in Chinese if it's a Chinese dish)
- Calories (kcal)
- Weight in grams (estimate)

If it's a mixed dish (like 盖浇饭, 拌面, 炒饭), list main ingredients separately.

Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "foods": [
    {"name": "food name", "calories": number, "weight_g": number}
  ],
  "description": "brief one-line description of what you see"
}`;

  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'gemini_api_key'").get()?.value;
  if (!apiKey) throw new Error('API Key 未配置，请在设置页面填入 Gemini API Key');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: base64 } }
      ]
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 错误 ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 未能识别图片内容');

  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const result = JSON.parse(cleaned);

  const foods = (result.foods || []).map(f => ({
    name: f.name || '未知',
    calories: Math.round(f.calories || 0),
    weight_g: Math.round(f.weight_g || 0),
  }));

  const totalCal = foods.reduce((sum, f) => sum + f.calories, 0);

  return { foods, total_calories: totalCal, description: result.description || '' };
}
