#!/bin/bash
# 公网访问启动脚本（使用 ngrok）

echo "═══════════════════════════════════════════════════════════"
echo "婚礼照片下载服务器 - 公网访问模式 (ngrok)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 检查是否安装 ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ 未检测到 ngrok"
    echo ""
    echo "请先安装 ngrok:"
    echo "  macOS:   brew install ngrok"
    echo "  或访问:  https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok 已就绪"
echo ""

# 启动 Python 服务器（后台）
echo "🚀 启动本地服务器..."
python3 server.py &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 启动 ngrok
echo "🌐 启动公网隧道..."
echo ""

# 获取 ngrok API 地址
NGROK_API="http://localhost:4040/api/tunnels"

# 启动 ngrok
ngrok http 8080 > /dev/null 2>&1 &
NGROK_PID=$!

# 等待 ngrok 启动
sleep 3

# 获取公网地址
PUBLIC_URL=$(curl -s $NGROK_API | grep -o 'https://[^"]*' | head -1)

if [ -n "$PUBLIC_URL" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "✅ 公网访问已启动！"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📱 上传页面 (您使用):"
    echo "   ${PUBLIC_URL}/upload.html"
    echo ""
    echo "💒 下载页面 (宾客使用):"
    echo "   ${PUBLIC_URL}/download.html"
    echo ""
    echo "二维码链接："
    echo "   访问下载页面查看自动生成的二维码"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "提示："
    echo "  • 此地址可在任何网络下访问（无需连接同一WiFi）"
    echo "  • 免费版 ngrok 地址会在每次重启后变化"
    echo "  • 按 Ctrl+C 停止服务器"
    echo ""

    # 打开浏览器
    open "${PUBLIC_URL}/upload.html"
else
    echo "❌ 获取公网地址失败"
    echo "   请确保 ngrok 已正确配置"
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# 等待中断信号
trap "echo ''; echo '🛑 停止服务器...'; kill $SERVER_PID 2>/dev/null; kill $NGROK_PID 2>/dev/null; exit 0" INT TERM

wait
