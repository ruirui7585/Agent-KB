# 婚礼照片下载系统 💒

一个简单易用的本地婚礼照片上传和下载系统，支持高清原图上传和下载。

## 功能特点

- ✅ **原图上传**: 支持 JPG、PNG、GIF、WebP、HEIC 等格式，单张最大 100MB
- ✅ **原图下载**: 宾客可下载高清原图，无压缩
- ✅ **图片预览**: 支持在线预览和缩略图查看
- ✅ **二维码分享**: 自动生成二维码，方便宾客扫码访问
- ✅ **响应式设计**: 支持手机、平板、电脑等多种设备
- ✅ **本地存储**: 所有照片保存在本地，无需云存储

## 快速开始

### 选择访问方式

根据您的需求选择：

- **局域网访问**：宾客连接同一 WiFi 即可访问（推荐）
- **公网访问**：宾客无需连接 WiFi，通过互联网访问

---

### 方式一：局域网访问（推荐）

宾客需要连接与您相同的 WiFi。

#### 1. 启动服务器

```bash
cd Projects/personal/wedding-photos
./start-lan.sh
```

#### 2. 获取访问地址

脚本会自动显示您的局域网地址，例如：
- 上传页面: `http://192.168.2.7:8080/upload.html`
- 下载页面: `http://192.168.2.7:8080/download.html`

#### 3. 分享给宾客

将下载页面地址分享给宾客（通过微信、短信等方式）

---

### 方式二：公网访问 - Cloudflare Tunnel（推荐）

宾客无需连接同一 WiFi，通过互联网即可访问。

#### 1. 启动服务器

```bash
cd Projects/personal/wedding-photos
./start-public.sh
```

#### 2. 自动生成公网地址

脚本会：
- 自动安装 cloudflared（如未安装）
- 生成公网地址，例如：`https://xxx-xxx.trycloudflare.com`
- 自动打开浏览器

#### 3. 分享公网地址

将显示的公网地址分享给宾客即可

---

### 方式三：公网访问 - ngrok

另一个公网访问选择。

#### 1. 安装 ngrok

```bash
brew install ngrok
```

或访问 https://ngrok.com/download 下载

#### 2. 启动服务器

```bash
cd Projects/personal/wedding-photos
./start-ngrok.sh
```

#### 3. 获取公网地址

脚本会显示类似 `https://xxx.ngrok.io` 的公网地址

---

### 访问页面说明

无论使用哪种方式，都包含两个页面：

- **上传页面**: `您的地址/upload.html`
  - 用于上传婚礼照片
  - 支持拖拽上传和点击选择
  - 可以删除已上传的照片

- **下载页面**: `您的地址/download.html`
  - 宾客访问此页面下载照片
  - 自动生成二维码供分享
  - 支持预览和下载原图

### 3. 上传照片

1. 打开上传页面 `http://localhost:8080/upload.html`
2. 点击或拖拽照片到上传区域
3. 等待上传完成
4. 上传的照片会显示在页面下方

### 4. 分享给宾客

宾客可以通过以下方式访问下载页面：

1. **二维码**: 在下载页面扫描二维码
2. **局域网访问**: 将 `localhost` 替换为本机 IP 地址
   - 例如：`http://192.168.1.100:8080/download.html`
3. **公网访问**: 如需公网访问，可以使用内网穿透工具

## 局域网访问配置

### macOS/Linux

1. 查看本机 IP 地址：
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. 将 `localhost` 替换为你的 IP 地址
   - 例如：`http://192.168.1.100:8080/download.html`

3. 确保防火墙允许 8080 端口

### Windows

1. 查看 IP 地址：
```cmd
ipconfig
```

2. 找到 "IPv4 地址" 一行，例如：`192.168.1.100`

3. 访问 `http://192.168.1.100:8080/download.html`

## 公网访问（可选）

如果需要让宾客通过公网访问，可以使用内网穿透工具：

### 使用 ngrok

1. 安装 ngrok: https://ngrok.com/download

2. 运行：
```bash
ngrok http 8080
```

3. ngrok 会生成一个公网地址，例如：`https://abc123.ngrok.io`

4. 将此地址分享给宾客即可访问

### 使用 frp

需要一台有公网 IP 的服务器，参考 frp 文档配置。

## 文件结构

```
wedding-photos/
├── server.py           # 服务器脚本
├── upload.html         # 上传页面
├── download.html       # 下载页面
├── uploads/            # 照片存储目录（自动创建）
└── README.md           # 使用说明
```

## 注意事项

1. **存储空间**: 确保 `uploads/` 目录有足够的存储空间
2. **网络安全**: 本系统无密码保护，仅在受信任的网络中使用
3. **性能**: 适合中小型婚礼（建议照片数量 < 1000 张）
4. **备份**: 建议定期备份 `uploads/` 目录

## 常见问题

**Q: 照片上传失败？**
A: 检查服务器是否正常运行，查看终端错误信息

**Q: 宾客无法访问？**
A: 确保在同一局域网，或正确配置了公网访问

**Q: 如何修改端口？**
A: 编辑 `server.py` 文件，修改 `PORT = 8080` 这一行

**Q: 支持哪些图片格式？**
A: JPG、PNG、GIF、BMP、WebP、HEIC、HEIF

**Q: 上传大小限制？**
A: 默认单张最大 100MB，可在 `server.py` 中修改 `MAX_FILE_SIZE`

## 自定义配置

### 修改端口

编辑 `server.py`：

```python
PORT = 8080  # 改为你想要的端口
```

### 修改上传大小限制

编辑 `server.py`：

```python
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB，改为需要的值
```

### 修改支持的文件类型

编辑 `server.py`：

```python
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'}
```

## 技术栈

- 后端: Python 3 (标准库)
- 前端: HTML5 + CSS3 + Vanilla JavaScript
- 二维码: QRCode.js
- 图标: Emoji 📸💒

## 许可证

MIT License

---

祝婚礼圆满成功！🎊🎉
