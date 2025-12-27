# 完整部署指南

本文档提供从开发环境到生产环境的完整部署步骤。

---

## 部署前准备

### 1. 检查清单

- [ ] Cloudflare 账号已登录
- [ ] Wrangler CLI 已安装并登录
- [ ] 所有代码已提交到 Git
- [ ] 本地测试通过

### 2. 需要准备的信息

- [ ] 生产环境 `ADMIN_TOKEN`（强密码，至少 32 字符）
- [ ] 前端域名（如 `yourdomain.com`）
- [ ] API 域名（如 `api.yourdomain.com` 或使用 Workers 默认域名）

---

## 步骤 1: 部署 Cloudflare Worker

### 1.1 检查 Worker 配置

```bash
cd cloudflare-worker
cat wrangler.toml
```

确保配置正确：
- D1 数据库绑定
- R2 bucket 绑定
- Worker 名称

### 1.2 设置生产环境变量

在 Cloudflare Dashboard 中设置：
1. 进入 [Workers & Pages](https://dash.cloudflare.com/)
2. 选择你的 Worker（或创建新 Worker）
3. Settings > Variables
4. 添加环境变量：
   - `ADMIN_TOKEN`: 你的强密码 token（至少 32 字符随机字符串）

**生成强密码**：
```bash
# 使用 openssl 生成随机 token
openssl rand -hex 32
```

### 1.3 部署 Worker

```bash
cd cloudflare-worker
wrangler deploy
```

部署成功后，你会看到 Worker URL，例如：
```
https://tianlong-blog-api.your-subdomain.workers.dev
```

**保存这个 URL**，后续需要用到。

---

## 步骤 2: 配置生产环境 D1 数据库

### 2.1 创建生产环境 D1 数据库（如果还没有）

```bash
cd cloudflare-worker
wrangler d1 create tianlong-blog-db
```

**注意**：如果数据库已存在，跳过此步骤。

### 2.2 执行数据库迁移（生产环境）

```bash
# 执行所有迁移脚本
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/001_initial_schema.sql
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/002_about_me_schema.sql
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/003_books_schema.sql
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/004_public_engagement_schema.sql
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/005_papers_schema.sql
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/006_courses_schema.sql
```

### 2.3 验证数据库

```bash
# 检查表是否创建成功
wrangler d1 execute tianlong-blog-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

应该看到所有表：
- `blog_posts`
- `site_settings`
- `books`
- `public_engagements`
- `papers`
- `courses`

---

## 步骤 3: 迁移数据到生产环境

### 3.1 设置环境变量

```bash
# 设置生产环境 API URL（替换为你的 Worker URL）
export API_URL=https://tianlong-blog-api.your-subdomain.workers.dev

# 设置生产环境 ADMIN_TOKEN（与 Worker 中的一致）
export ADMIN_TOKEN=your-production-token-here
```

### 3.2 运行数据迁移脚本

```bash
# 在项目根目录
npm run migrate:all
```

这会依次迁移：
1. About Me 数据
2. Books 数据
3. Public Engagement 数据
4. Papers 数据
5. Teaching 数据

### 3.3 验证数据迁移

```bash
# 检查数据是否导入成功
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://tianlong-blog-api.your-subdomain.workers.dev/api/admin/blog

curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://tianlong-blog-api.your-subdomain.workers.dev/api/admin/books
```

---

## 步骤 4: 配置 R2 存储桶

### 4.1 确认 R2 Bucket 已创建

```bash
wrangler r2 bucket list
```

如果 bucket `blog-images` 不存在，创建它：
```bash
wrangler r2 bucket create blog-images
```

### 4.2 配置 CORS（如果需要公共访问）

在 Cloudflare Dashboard 中：
1. 进入 R2
2. 选择 `blog-images` bucket
3. Settings > CORS Policy
4. 添加 CORS 规则（如果需要）

**注意**：如果图片只通过 Worker 访问，可能不需要配置 CORS。

---

## 步骤 5: 部署前端到 Cloudflare Pages

### 5.1 准备构建

确保 `.env.production` 文件存在（或使用环境变量）：

```bash
# 创建生产环境变量文件
cat > .env.production << EOF
REACT_APP_API_URL=https://tianlong-blog-api.your-subdomain.workers.dev
REACT_APP_ADMIN_TOKEN=your-production-token-here
EOF
```

**注意**：`.env.production` 应该添加到 `.gitignore`，不要提交到 Git。

### 5.2 构建前端

```bash
npm run build
```

构建完成后，检查 `build/` 目录是否生成。

### 5.3 部署到 Cloudflare Pages

**方法一：通过 Dashboard（推荐）**

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages > Create application > Pages
3. 连接你的 Git 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/`（项目根目录）
5. 添加环境变量：
   - `REACT_APP_API_URL`: 你的 Worker URL
   - `REACT_APP_ADMIN_TOKEN`: 你的生产环境 token
6. 点击 Deploy

**方法二：通过 Wrangler CLI**

```bash
# 安装 Pages CLI（如果还没有）
npm install -g wrangler

# 部署
wrangler pages deploy build --project-name=tianlong-frontend
```

### 5.4 配置自定义域名（可选）

在 Cloudflare Pages Dashboard 中：
1. 进入你的 Pages 项目
2. Custom domains
3. 添加你的域名

---

## 步骤 6: 配置 CORS

### 6.1 更新 Worker CORS 设置

编辑 `cloudflare-worker/src/utils.js`，更新 CORS 配置：

```javascript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // 你的前端域名
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

### 6.2 重新部署 Worker

```bash
cd cloudflare-worker
wrangler deploy
```

---

## 步骤 7: 测试部署

### 7.1 测试公共 API

```bash
# 测试博客列表
curl https://your-worker.workers.dev/api/blog

# 测试书籍列表
curl https://your-worker.workers.dev/api/books

# 测试论文列表
curl https://your-worker.workers.dev/api/papers
```

### 7.2 测试管理 API

```bash
# 测试登录（通过前端）
# 访问 https://yourdomain.com/admin

# 测试管理 API
curl -H "Authorization: Bearer your-token" \
  https://your-worker.workers.dev/api/admin/blog
```

### 7.3 测试前端页面

访问以下页面，确保正常显示：
- `https://yourdomain.com/` - 首页
- `https://yourdomain.com/blog` - 博客列表
- `https://yourdomain.com/books` - 书籍
- `https://yourdomain.com/papers` - 论文
- `https://yourdomain.com/teaching` - 课程
- `https://yourdomain.com/admin` - 管理后台

### 7.4 测试管理功能

1. 登录管理后台
2. 测试各个管理模块：
   - 博客管理（创建、编辑、删除）
   - About Me 编辑
   - Books 管理
   - Papers 管理
   - Teaching 管理
   - Public Engagement 管理
3. 测试图片上传功能

---

## 步骤 8: 配置 HTTPS 和域名

### 8.1 确保使用 HTTPS

Cloudflare Pages 和 Workers 默认使用 HTTPS，无需额外配置。

### 8.2 配置自定义域名

**前端域名**：
- 在 Cloudflare Pages 中配置
- 确保 DNS 记录正确

**API 域名**（可选）：
- 在 Worker 中配置自定义路由
- 或使用 Workers 默认域名

---

## 故障排除

### 问题 1: Worker 部署失败

**检查**：
- Wrangler 是否已登录：`wrangler whoami`
- `wrangler.toml` 配置是否正确
- 代码是否有语法错误

### 问题 2: 数据库迁移失败

**检查**：
- 数据库 ID 是否正确
- 是否使用 `--remote` 标志
- 迁移脚本语法是否正确

### 问题 3: 数据迁移失败

**检查**：
- Worker 是否已部署
- `API_URL` 环境变量是否正确
- `ADMIN_TOKEN` 是否与 Worker 中的一致
- Worker 是否可访问

### 问题 4: 前端无法访问 API

**检查**：
- CORS 配置是否正确
- API URL 是否正确
- 浏览器控制台错误信息

### 问题 5: 图片无法显示

**检查**：
- R2 bucket 是否正确配置
- 图片路径是否正确
- Worker 中的图片访问 API 是否正常

---

## 生产环境安全检查清单

- [ ] 使用强密码 `ADMIN_TOKEN`（至少 32 字符）
- [ ] 环境变量不在代码中硬编码
- [ ] CORS 配置限制为特定域名
- [ ] 使用 HTTPS（Cloudflare 默认提供）
- [ ] 定期备份 D1 数据库
- [ ] 监控 Worker 使用情况
- [ ] 设置错误日志和告警

---

## 后续步骤

部署完成后，建议：

1. **监控和日志**
   - 设置 Cloudflare Analytics
   - 监控 Worker 性能
   - 查看错误日志

2. **备份策略**
   - 定期备份 D1 数据库
   - 备份 R2 中的图片

3. **性能优化**
   - 启用 Cloudflare CDN 缓存
   - 优化图片大小
   - 使用 Cloudflare Workers KV 缓存（如需要）

4. **安全增强**
   - 添加 2FA（TOTP）
   - 添加操作日志
   - 实现登录失败限制

---

## 快速部署命令总结

```bash
# 1. 部署 Worker
cd cloudflare-worker
wrangler deploy

# 2. 执行数据库迁移
wrangler d1 execute tianlong-blog-db --remote --file=./migrations/001_initial_schema.sql
# ... 其他迁移脚本

# 3. 迁移数据
export API_URL=https://your-worker.workers.dev
export ADMIN_TOKEN=your-token
cd ..
npm run migrate:all

# 4. 构建前端
npm run build

# 5. 部署前端（通过 Dashboard 或 CLI）
wrangler pages deploy build --project-name=tianlong-frontend
```

---

## 需要帮助？

如果遇到问题，请检查：
- [API 文档](./API_DOCUMENTATION.md)
- [设置指南](./SETUP_GUIDE.md)
- [故障排除指南](./DEPLOYMENT_PRIORITY.md)

