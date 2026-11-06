#!/bin/bash
# 局域网访问启动脚本

# 获取本机 IP
 LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "═══════════════════════════════════════════════════════════"
echo "婚礼照片下载服务器 - 局域网访问模式"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📱 上传页面 (您使用):"
echo "   http://${LOCAL_IP}:8080/upload.html"
echo ""
echo "💒 下载页面 (宾客使用):"
echo "   http://${LOCAL_IP}:8080/download.html"
echo ""
echo "二维码链接已更新为局域网地址"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 server.py
