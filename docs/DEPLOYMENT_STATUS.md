# 部署状态

## 当前进度

### ✅ 已完成

1. **Worker 部署**
   - ✅ Worker 名称: `you-website`
   - ✅ Worker URL: `https://you-website.ychen10001.workers.dev`
   - ✅ ADMIN_TOKEN: 已在 Cloudflare Dashboard 中设置（Secrets）
   - ✅ D1 数据库绑定: `tianlong-blog-db`
   - ✅ R2 Bucket 绑定: `blog-images`

2. **数据库迁移**
   - ✅ 所有迁移脚本已执行（生产环境）
   - ✅ 所有表已创建：
     - blog_posts
     - site_settings
     - books
     - public_engagements
     - papers
     - courses

### 🔄 待完成

1. **数据迁移**
   - ⏳ 需要运行数据迁移脚本
   - 命令: `npm run migrate:all`
   - 需要设置环境变量：
     - `API_URL=https://you-website.ychen10001.workers.dev`
     - `ADMIN_TOKEN=你的token（与 Dashboard 中一致）`

2. **前端部署**
   - ✅ 构建前端: `npm run build`（已完成）
   - ✅ 部署到 Cloudflare Pages（已完成）
   - ⏳ 配置环境变量（需要在 Dashboard 中设置）
     - `REACT_APP_API_URL=https://you-website.ychen10001.workers.dev`
     - `REACT_APP_ADMIN_TOKEN=你的token`

---

## 下一步操作

### 步骤 1: 迁移数据

```bash
# 设置环境变量
export API_URL=https://you-website.ychen10001.workers.dev
export ADMIN_TOKEN=你的token

# 运行迁移
npm run migrate:all
```

### 步骤 2: 构建前端

```bash
npm run build
```

### 步骤 3: 部署前端 ✅ 已完成

前端已部署到 Cloudflare Pages：
- 项目名称: `you-website`
- 预览 URL: `https://8e9bee80.you-website.pages.dev`
- 生产域名: `www.tianlongyou.com`

**⚠️ 重要：配置环境变量**

在 Cloudflare Dashboard 中设置：
1. Workers & Pages > you-website > Settings > Environment variables
2. 添加以下变量：
   - `REACT_APP_API_URL = https://you-website.ychen10001.workers.dev`
   - `REACT_APP_ADMIN_TOKEN = 你的token（与 Worker 中的一致）`
3. 环境变量配置后需要重新部署才能生效

---

## 重要信息

- **Worker URL**: `https://you-website.ychen10001.workers.dev`
- **Worker 名称**: `you-website`
- **ADMIN_TOKEN**: 已在 Dashboard 中设置（Secrets）
- **数据库**: `tianlong-blog-db` (ID: 663b4713-c75d-45d0-8086-832dedca55fa)
- **R2 Bucket**: `blog-images`

---

## 测试命令

### 测试公共 API

```bash
# 测试博客列表
curl https://you-website.ychen10001.workers.dev/api/blog

# 测试书籍列表
curl https://you-website.ychen10001.workers.dev/api/books
```

### 测试管理 API

```bash
# 需要替换 YOUR_TOKEN 为实际的 token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://you-website.ychen10001.workers.dev/api/admin/blog
```

