#!/bin/bash

# 完整部署脚本
# 使用方法: ./scripts/deploy-all.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署流程..."
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查环境变量
if [ -z "$API_URL" ]; then
    echo -e "${YELLOW}⚠️  警告: API_URL 未设置${NC}"
    echo "请设置: export API_URL=https://your-worker.workers.dev"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  警告: ADMIN_TOKEN 未设置${NC}"
    echo "请设置: export ADMIN_TOKEN=your-production-token"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤 1: 部署 Worker
echo -e "${GREEN}步骤 1/5: 部署 Cloudflare Worker...${NC}"
cd cloudflare-worker
wrangler deploy
cd ..
echo -e "${GREEN}✅ Worker 部署完成${NC}"
echo ""

# 步骤 2: 执行数据库迁移
echo -e "${GREEN}步骤 2/5: 执行数据库迁移...${NC}"
cd cloudflare-worker

echo "执行迁移脚本..."
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/001_initial_schema.sql || echo "⚠️  迁移 001 可能已执行"
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/002_about_me_schema.sql || echo "⚠️  迁移 002 可能已执行"
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/003_books_schema.sql || echo "⚠️  迁移 003 可能已执行"
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/004_public_engagement_schema.sql || echo "⚠️  迁移 004 可能已执行"
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/005_papers_schema.sql || echo "⚠️  迁移 005 可能已执行"
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/006_courses_schema.sql || echo "⚠️  迁移 006 可能已执行"

cd ..
echo -e "${GREEN}✅ 数据库迁移完成${NC}"
echo ""

# 步骤 3: 迁移数据
echo -e "${GREEN}步骤 3/5: 迁移数据到生产环境...${NC}"
if [ -z "$API_URL" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  跳过数据迁移（环境变量未设置）${NC}"
    echo "请手动运行: npm run migrate:all"
else
    npm run migrate:all
    echo -e "${GREEN}✅ 数据迁移完成${NC}"
fi
echo ""

# 步骤 4: 构建前端
echo -e "${GREEN}步骤 4/5: 构建前端...${NC}"
npm run build
echo -e "${GREEN}✅ 前端构建完成${NC}"
echo ""

# 步骤 5: 部署前端（提示）
echo -e "${GREEN}步骤 5/5: 部署前端${NC}"
echo -e "${YELLOW}⚠️  前端需要通过 Cloudflare Dashboard 部署${NC}"
echo ""
echo "请执行以下步骤："
echo "1. 进入 Cloudflare Dashboard > Workers & Pages"
echo "2. Create application > Pages"
echo "3. 连接 Git 仓库或直接上传 build/ 目录"
echo "4. 配置环境变量："
echo "   - REACT_APP_API_URL=$API_URL"
echo "   - REACT_APP_ADMIN_TOKEN=$ADMIN_TOKEN"
echo ""
echo "或使用 CLI："
echo "  wrangler pages deploy build --project-name=tianlong-frontend"
echo ""

echo -e "${GREEN}✅ 部署流程完成！${NC}"
echo ""
echo "下一步："
echo "1. 部署前端到 Cloudflare Pages"
echo "2. 测试所有功能"
echo "3. 配置自定义域名（可选）"

