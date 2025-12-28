#!/bin/bash

# 数据迁移辅助脚本
# 使用方法: ./scripts/set-env-and-migrate.sh

echo "📋 数据迁移准备"
echo ""
echo "请提供以下信息："
echo ""

# 提示输入 API URL
read -p "API URL [默认: https://you-website.ychen10001.workers.dev]: " API_URL_INPUT
API_URL=${API_URL_INPUT:-https://you-website.ychen10001.workers.dev}

# 提示输入 ADMIN_TOKEN
read -sp "ADMIN_TOKEN (输入时不会显示): " ADMIN_TOKEN_INPUT
echo ""

if [ -z "$ADMIN_TOKEN_INPUT" ]; then
    echo "❌ ADMIN_TOKEN 不能为空"
    exit 1
fi

# 设置环境变量
export API_URL=$API_URL_INPUT
export ADMIN_TOKEN=$ADMIN_TOKEN_INPUT

echo ""
echo "✅ 环境变量已设置"
echo "  API_URL: $API_URL"
echo "  ADMIN_TOKEN: 已设置（隐藏）"
echo ""
echo "🚀 开始迁移数据..."
echo ""

# 运行迁移
npm run migrate:all
