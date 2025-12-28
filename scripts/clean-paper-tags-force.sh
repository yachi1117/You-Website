#!/bin/bash

# 强制清理论文错误tags辅助脚本
# 使用方法: ./scripts/clean-paper-tags-force.sh

echo "📋 强制清理论文错误tags"
echo ""
echo "将删除以下错误的tags:"
echo "  - migrationandborderstudies"
echo "  - immigrantentrepreneurship"
echo "  - ethnicstudies"
echo "  - platformstudies"
echo "  - other"
echo ""
echo "请提供以下信息："
echo ""

# 提示输入 API URL
read -p "API URL [默认: https://you-website.ychen10001.workers.dev]: " API_URL_INPUT
API_URL_RAW=${API_URL_INPUT:-https://you-website.ychen10001.workers.dev}

# 确保URL包含协议前缀
if [[ ! "$API_URL_RAW" =~ ^https?:// ]]; then
    API_URL="https://${API_URL_RAW}"
else
    API_URL="$API_URL_RAW"
fi

# 提示输入 ADMIN_TOKEN
read -sp "ADMIN_TOKEN (输入时不会显示): " ADMIN_TOKEN_INPUT
echo ""

if [ -z "$ADMIN_TOKEN_INPUT" ]; then
    echo "❌ ADMIN_TOKEN 不能为空"
    exit 1
fi

# 设置环境变量
export API_URL=$API_URL
export ADMIN_TOKEN=$ADMIN_TOKEN_INPUT

echo ""
echo "✅ 环境变量已设置"
echo "  API_URL: $API_URL"
echo "  ADMIN_TOKEN: 已设置（隐藏）"
echo ""
echo "🧹 开始强制清理错误的tags..."
echo ""

# 运行强制清理脚本
node scripts/clean-paper-tags-force.js

