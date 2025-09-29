#!/bin/bash

echo "🚀 准备部署到 Railway..."

# 检查是否安装了 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

# 登录 Railway
echo "🔐 登录 Railway..."
railway login

# 创建新项目或连接到现有项目
echo "🏗️  创建/连接 Railway 项目..."
railway link

# 设置环境变量
echo "🔧 设置环境变量..."
railway variables set NODE_ENV=production
railway variables set CANVA_CLIENT_ID="$CANVA_CLIENT_ID"
railway variables set CANVA_CLIENT_SECRET="$CANVA_CLIENT_SECRET"
railway variables set DATABASE_ENCRYPTION_KEY="$DATABASE_ENCRYPTION_KEY"

# 部署
echo "🚀 开始部署..."
railway up

echo "✅ 部署完成！"
railway status
