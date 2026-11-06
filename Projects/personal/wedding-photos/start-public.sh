#!/bin/bash
# 公网访问启动脚本（使用 Cloudflare Tunnel）

echo "═══════════════════════════════════════════════════════════"
echo "婚礼照片下载服务器 - 公网访问模式"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 检查是否安装 cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "❌ 未检测到 cloudflared，正在安装..."
    echo ""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflared
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
        chmod +x cloudflared
        sudo mv cloudflared /usr/local/bin/
    else
        echo "❌ 不支持的系统，请手动安装 cloudflared"
        echo "   访问: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        exit 1
    fi
fi

echo "✅ cloudflared 已就绪"
echo ""

# 启动 Python 服务器（后台）
echo "🚀 启动本地服务器..."
python3 server.py &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 启动 Cloudflare Tunnel
echo "🌐 启动公网隧道..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "正在生成公网地址，请稍候..."
echo ""

cloudflared tunnel --url http://localhost:8080 2>&1 | tee /tmp/cloudflared.log &
TUNNEL_PID=$!

# 等待并提取公网地址
sleep 5
PUBLIC_URL=$(grep -o 'https://[^.]*\.trycloudflare\.com' /tmp/cloudflared.log | head -1)

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
    echo "  • 地址在服务器重启后会变化"
    echo "  • 按 Ctrl+C 停止服务器"
    echo ""

    # 打开浏览器
    open "${PUBLIC_URL}/upload.html"
else
    echo "❌ 获取公网地址失败，请检查网络连接"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 等待中断信号
trap "echo ''; echo '🛑 停止服务器...'; kill $SERVER_PID 2>/dev/null; kill $TUNNEL_PID 2>/dev/null; exit 0" INT TERM

wait
