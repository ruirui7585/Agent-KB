// 本地测试脚本：验证 Vertex AI 食物识别
// 用法: node test-vision.mjs <图片路径>
// 如果没有图片，会生成一张小测试图
import { readFileSync, writeFileSync } from 'node:fs';

const SERVER = 'http://47.254.214.153';
const IMAGE_PATH = process.argv[2];

if (!IMAGE_PATH) {
  console.log('用法: node test-vision.mjs <图片路径>');
  console.log('例如: node test-vision.mjs ~/Desktop/lunch.jpg');
  console.log('');
  console.log('或者用 curl 直接测:');
  console.log(`curl -X POST "${SERVER}/api/food/analyze?meal_type=lunch" -F "image=@你的图片路径" | python3 -m json.tool`);
  process.exit(1);
}

console.log('上传图片:', IMAGE_PATH);
console.log('目标:', SERVER + '/api/food/analyze');

const formData = new FormData();
const file = new File([readFileSync(IMAGE_PATH)], 'test.jpg', { type: 'image/jpeg' });
formData.append('image', file);

const res = await fetch(`${SERVER}/api/food/analyze?meal_type=lunch`, {
  method: 'POST',
  body: formData,
});

const data = await res.json();
console.log('HTTP', res.status);
console.log(JSON.stringify(data, null, 2));
