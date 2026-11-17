# 婚礼照片下载系统 - Vercel 版本

基于 Vercel + Cloudinary 的婚礼照片上传下载系统，支持高清原图存储和下载。

## 优势

✅ **免费托管** - Vercel 免费部署，获得固定域名
✅ **原图质量** - Cloudinary 保留原图，支持高清下载
✅ **稳定可靠** - 全球 CDN 加速，访问速度快
✅ **永久链接** - 固定的公网地址，可随时访问
✅ **无限流量** - Cloudinary 免费额度：25GB 存储 + 25GB 流量/月

## 快速部署

### 第一步：注册 Cloudinary

1. 访问 [Cloudinary](https://cloudinary.com/) 注册账号
2. 登录后，进入 Dashboard 获取以下信息：
   - Cloud Name
   - API Key
   - API Secret

### 第二步：部署到 Vercel

#### 方式一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
cd Projects/personal/wedding-photos-vercel
vercel
```

4. **设置环境变量**

在 Vercel Dashboard 中设置环境变量：
- `CLOUDINARY_CLOUD_NAME`: 你的 Cloud Name
- `CLOUDINARY_API_KEY`: 你的 API Key
- `CLOUDINARY_API_SECRET`: 你的 API Secret

5. **部署到生产环境**
```bash
vercel --prod
```

#### 方式二：通过 GitHub 自动部署

1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com/)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 在环境变量中添加 Cloudinary 配置
6. 点击 Deploy

### 第三步：访问应用

部署成功后，你会获得一个固定域名：
- 上传页面：`https://你的域名.vercel.app/index.html`
- 下载页面：`https://你的域名.vercel.app/download.html`

## 使用方法

### 上传照片

1. 访问上传页面
2. 拖拽或点击上传照片
3. 照片会自动上传到 Cloudinary 云存储

### 分享给宾客

**方法一：二维码分享**
- 宾客访问下载页面
- 页面顶部会显示二维码
- 其他宾客扫码即可访问

**方法二：链接分享**
- 将下载页面链接通过微信/短信发送给宾客
- 宾客点击即可访问

### 下载照片

宾客可以：
- 预览照片缩略图
- 点击查看原图
- 一键下载原图

## 环境变量配置

在 Vercel Dashboard 中设置：

| 变量名 | 说明 | 获取位置 |
|--------|------|----------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名称 | Dashboard 首页 |
| `CLOUDINARY_API_KEY` | API 密钥 | Dashboard 首页 |
| `CLOUDINARY_API_SECRET` | API 密钥 | Dashboard 首页 |

## 自定义域名（可选）

1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains"
3. 添加你的自定义域名
4. 按提示配置 DNS

## Cloudinary 免费额度

- **存储空间**: 25 GB
- **月流量**: 25 GB
- **转换次数**: 25,000 次/月
- **图片数量**: 无限制

对于个人婚礼使用完全足够！

## 注意事项

1. **隐私保护**: 系统无密码保护，建议婚礼结束后删除照片
2. **额度监控**: 在 Cloudinary Dashboard 查看使用情况
3. **数据备份**: 建议定期下载备份照片到本地

## 项目结构

```
wedding-photos-vercel/
├── api/
│   ├── photos.js       # 获取照片列表 API
│   └── upload.js       # 上传照片 API
├── public/
│   ├── index.html      # 上传页面
│   └── download.html   # 下载页面
├── package.json
├── vercel.json
└── README.md
```

## 常见问题

**Q: 上传大小有限制吗？**
A: Vercel Serverless Function 限制请求体大小为 4.5MB，但 Cloudinary 支持更大的文件。建议使用 client-side 上传（已实现无大小限制）。

**Q: 照片会压缩吗？**
A: 不会！Cloudinary 保留原图，下载时也会下载原图。

**Q: 免费额度够用吗？**
A: 对于个人婚礼完全够用。假设每张照片 5MB，可存储 5000 张照片。建议婚礼结束后清理。

**Q: 如何删除照片？**
A: 登录 Cloudinary Dashboard，在 Media Library 中管理照片。

**Q: 可以设置密码保护吗？**
A: 当前版本无密码保护。可以自行添加简单的密码验证。

## 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **后端**: Vercel Serverless Functions
- **存储**: Cloudinary
- **二维码**: QRCode.js

## 许可证

MIT License

---

祝婚礼圆满成功！💒🎉
