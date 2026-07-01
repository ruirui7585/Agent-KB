// 纯 Node.js 内置模块，零依赖，验证 GCP 服务账号鉴权
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_PATH = '/Users/shilv/googlecloudkey/project-360b66e6-e5e2-4f76-bf9-9596eddbbb73.json';

const key = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const { client_email, private_key, project_id } = key;

console.log('账号:', client_email);
console.log('项目:', project_id);

// 生成 JWT
const now = Math.floor(Date.now() / 1000);
const header = { alg: 'RS256', typ: 'JWT' };
const claim = {
  iss: client_email,
  scope: 'https://www.googleapis.com/auth/cloud-platform',
  aud: 'https://oauth2.googleapis.com/token',
  exp: now + 3600,
  iat: now,
};

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const headerB64 = b64(header);
const claimB64 = b64(claim);
const unsigned = `${headerB64}.${claimB64}`;

const sign = createSign('RSA-SHA256');
sign.update(unsigned);
const sig = sign.sign(private_key, 'base64url');
const jwt = `${unsigned}.${sig}`;

// 换 access token
console.log('\n正在换取 access token...');
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
});
const tokenData = await tokenRes.json();

if (tokenData.error) {
  console.error('❌ 鉴权失败:', tokenData.error_description || tokenData.error);
  process.exit(1);
}

console.log('✅ Access token 获取成功');

// 调 Gemini API 验证
console.log('\n正在调用 Gemini API...');
const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Say hello in Chinese' }] }],
    }),
  }
);
const geminiData = await geminiRes.json();

if (geminiData.error) {
  console.error('❌ Gemini API 调用失败:', JSON.stringify(geminiData.error, null, 2));
  process.exit(1);
}

console.log('✅ Gemini API 调用成功');
console.log('回复:', geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '(空)');
console.log('\n🎉 GCP 服务账号鉴权验证通过，可以正常使用 Gemini API');
