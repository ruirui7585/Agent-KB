#!/bin/bash
set -e

echo "=== CalSnap 部署 ==="

# 1. 安装 Node.js (如没有)
if ! command -v node &>/dev/null; then
  echo "安装 Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi

# 2. 安装 Nginx (如没有)
if ! command -v nginx &>/dev/null; then
  echo "安装 Nginx..."
  sudo dnf install -y nginx
fi

# 3. 创建目录
sudo mkdir -p /opt/calsnap/server /opt/calsnap/web /opt/calsnap/data /etc/calsnap

# 4. 复制文件 (假设在 calsnap 目录执行)
sudo cp -r server/* /opt/calsnap/server/
sudo cp -r web/* /opt/calsnap/web/

# 5. 首次部署先生成安全配置模板，由管理员填写后重跑
if [ ! -f /etc/calsnap/calsnap.env ]; then
  sudo cp server/.env.example /etc/calsnap/calsnap.env
  sudo chmod 600 /etc/calsnap/calsnap.env
  echo "已创建 /etc/calsnap/calsnap.env"
  echo "请填写新的百练 API Key 和业务空间 URL，然后重新执行本脚本。"
  exit 1
fi

if sudo grep -q "replace-with-" /etc/calsnap/calsnap.env; then
  echo "/etc/calsnap/calsnap.env 仍包含占位值，请配置后重试。"
  exit 1
fi

# 6. 按锁文件安装生产依赖
cd /opt/calsnap/server && npm ci --omit=dev

# 7. 配置 Nginx
sudo cp /opt/calsnap/server/deploy/nginx.conf /etc/nginx/conf.d/calsnap.conf
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 8. 配置 PM2
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi
cd /opt/calsnap/server
pm2 delete calsnap 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$(id -un)" --hp "$HOME" >/dev/null

# 9. 配置防火墙 (Alibaba Cloud Linux / CentOS)
sudo firewall-cmd --add-service=http --permanent 2>/dev/null || true
sudo firewall-cmd --add-service=https --permanent 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

echo "=== 部署完成 ==="
echo "API 健康检查: curl http://localhost:3000/api/health"
echo "下一步：为域名配置 HTTPS，并只在安全组开放 80/443。"
