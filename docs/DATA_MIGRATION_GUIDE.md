# 数据迁移指南

本指南说明如何将现有的 JSON 数据迁移到 Cloudflare D1 数据库中。

## 前置条件

1. **启动 Worker 开发服务器**
   ```bash
   cd cloudflare-worker
   wrangler dev --local
   ```

2. **设置环境变量**（可选）
   ```bash
   export API_URL=http://localhost:8787
   export ADMIN_TOKEN=your-secret-token
   ```

   如果不设置，脚本会使用默认值：
   - `API_URL`: `http://localhost:8787`
   - `ADMIN_TOKEN`: `your-secret-token`

## 迁移步骤

### 方法一：一键迁移所有数据（推荐）

```bash
npm run migrate:all
```

这会依次迁移：
1. About Me 数据
2. Books 数据
3. Public Engagement 数据

### 方法二：分别迁移各个模块

#### 1. 迁移 About Me 数据

```bash
npm run migrate:about
```

从 `src/pages/Home.js` 中提取的个人信息数据。

#### 2. 迁移 Books 数据

```bash
npm run migrate:books
```

从 `src/pages/Books.js` 中提取的书籍数据。

#### 3. 迁移 Public Engagement 数据

```bash
npm run migrate:public-engagement
```

从 `public/podcasts.json` 中读取的播客数据。

## 数据来源

### About Me
- **来源**: `src/pages/Home.js` 中的硬编码数据
- **包含**: 姓名、职称、简介、头像、邮箱、社交媒体链接、研究兴趣

### Books
- **来源**: `src/pages/Books.js` 中的硬编码数据
- **包含**: 标题、封面、出版社、描述等

### Public Engagement
- **来源**: `public/podcasts.json`
- **包含**: 播客标题、封面、音频链接、节目说明、话题等

## 验证迁移结果

迁移完成后，可以通过以下方式验证：

1. **访问管理后台**
   - About Me: `http://localhost:3000/admin/about`
   - Books: `http://localhost:3000/admin/books`
   - Public Engagement: `http://localhost:3000/admin/public-engagement`

2. **使用 API 查询**
   ```bash
   # 查询 About Me
   curl http://localhost:8787/api/about
   
   # 查询 Books
   curl http://localhost:8787/api/books
   
   # 查询 Public Engagement
   curl http://localhost:8787/api/public-engagement
   ```

## 注意事项

1. **重复运行**: 脚本可以安全地重复运行。对于 About Me，会更新现有数据；对于 Books 和 Public Engagement，会创建新条目（如果 ID 已存在可能会报错）。

2. **数据修改**: 如果需要修改迁移的数据，可以编辑对应的脚本文件：
   - `scripts/migrate-about-me.js`
   - `scripts/migrate-books.js`
   - `scripts/migrate-public-engagement.js`

3. **生产环境**: 在生产环境迁移时，需要：
   - 设置正确的 `API_URL`（生产环境的 Worker URL）
   - 设置正确的 `ADMIN_TOKEN`（生产环境的管理员 token）
   - 使用 `--remote` 标志执行数据库迁移：
     ```bash
     cd cloudflare-worker
     wrangler d1 execute tianlong-blog-db --remote --file=./migrations/002_about_me_schema.sql
     wrangler d1 execute tianlong-blog-db --remote --file=./migrations/003_books_schema.sql
     wrangler d1 execute tianlong-blog-db --remote --file=./migrations/004_public_engagement_schema.sql
     ```

## 故障排除

### 错误：Unauthorized (401)
- **原因**: ADMIN_TOKEN 不正确
- **解决**: 检查环境变量或 wrangler.toml 中的 ADMIN_TOKEN 设置

### 错误：Connection refused
- **原因**: Worker 开发服务器未启动
- **解决**: 确保 `wrangler dev --local` 正在运行

### 错误：Table doesn't exist
- **原因**: 数据库表未创建
- **解决**: 先执行数据库迁移脚本：
  ```bash
  cd cloudflare-worker
  wrangler d1 execute tianlong-blog-db --local --file=./migrations/002_about_me_schema.sql
  wrangler d1 execute tianlong-blog-db --local --file=./migrations/003_books_schema.sql
  wrangler d1 execute tianlong-blog-db --local --file=./migrations/004_public_engagement_schema.sql
  ```

