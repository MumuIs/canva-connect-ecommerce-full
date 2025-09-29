#!/bin/bash

# 设置 Vercel 环境变量的脚本

echo "🔧 设置 Vercel 环境变量..."

# 从 .env 文件读取变量
CANVA_CLIENT_ID=$(grep CANVA_CLIENT_ID .env | cut -d'=' -f2)
CANVA_CLIENT_SECRET=$(grep CANVA_CLIENT_SECRET .env | cut -d'=' -f2)
DATABASE_ENCRYPTION_KEY=$(grep DATABASE_ENCRYPTION_KEY .env | cut -d'=' -f2)

# 设置生产环境的 URL
BACKEND_URL="https://ecommerceshop-mpgkp01ki-bingnan-6756s-projects.vercel.app"
FRONTEND_URL="https://ecommerceshop-mpgkp01ki-bingnan-6756s-projects.vercel.app"

echo "设置环境变量..."
echo "CANVA_CLIENT_ID: $CANVA_CLIENT_ID"
echo "CANVA_CLIENT_SECRET: ${CANVA_CLIENT_SECRET:0:10}..."
echo "DATABASE_ENCRYPTION_KEY: ${DATABASE_ENCRYPTION_KEY:0:10}..."
echo "BACKEND_URL: $BACKEND_URL"
echo "FRONTEND_URL: $FRONTEND_URL"

# 使用 echo 和管道来设置环境变量
echo "$CANVA_CLIENT_ID" | npx vercel env add CANVA_CLIENT_ID production
echo "$CANVA_CLIENT_SECRET" | npx vercel env add CANVA_CLIENT_SECRET production
echo "$DATABASE_ENCRYPTION_KEY" | npx vercel env add DATABASE_ENCRYPTION_KEY production
echo "$BACKEND_URL" | npx vercel env add BACKEND_URL production
echo "$FRONTEND_URL" | npx vercel env add FRONTEND_URL production

echo "✅ 环境变量设置完成！"
echo "🚀 重新部署应用..."
npx vercel --prod --yes
