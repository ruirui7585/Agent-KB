#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")" || exit 1

if [ ! -d "node_modules/express" ]; then
  echo "正在初始化本地服务依赖..."
  npm install --no-audit --no-fund
fi

# 先扫描一次 recordings/ 下是否有新录屏
node scripts/process-capture.mjs

# 若 3460 端口已启动则直接打开浏览器，否则启动本地挑图服务
if lsof -iTCP:3460 -sTCP:LISTEN >/dev/null 2>&1; then
  open "http://localhost:3460"
else
  (sleep 1 && open "http://localhost:3460") &
  node server.js
fi
