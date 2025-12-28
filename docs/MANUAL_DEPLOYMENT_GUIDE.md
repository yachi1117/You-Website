# 手动部署完整指南

## 当前部署状态

### ✅ 已完成

1. **Worker 部署**
   - Worker URL: `https://you-website.ychen10001.workers.dev`
   - ADMIN_TOKEN: 已在 Dashboard 中设置（Secrets）

2. **数据库迁移**
   - 所有表已创建（6 个表）

3. **前端部署**
   - 项目: `you-website`
   - 预览 URL: `https://60f0a6de.you-website.pages.dev`
   - 生产域名: `www.tianlongyou.com`

---

## 剩余步骤

### 步骤 1: 配置 Pages 环境变量 ⚠️ 重要

**必须在 Dashboard 中手动配置**：

1. 进入: https://dash.cloudflare.com/
2. Workers & Pages > you-website > Settings > Environment variables
3. 添加以下变量（Production 环境）：
   ```
   REACT_APP_API_URL = https://you-website.ychen10001.workers.dev
   REACT_APP_ADMIN_TOKEN = 你的token（与 Worker Secrets 中的一致）
   ```
4. 保存后，需要重新部署前端才能生效

**重新部署命令**：
```bash
npm run build
wrangler pages deploy build --project-name=you-website --commit-dirty=true
```

---

### 步骤 2: 迁移数据到生产环境

**设置环境变量**：
```bash
export API_URL=https://you-website.ychen10001.workers.dev
export ADMIN_TOKEN=你的token（与 Dashboard 中的一致）
```

**运行迁移**：
```bash
npm run migrate:all
```

这会迁移：
- About Me 数据
- Books 数据（2 本）
- Public Engagement 数据（11 个播客）
- Papers 数据（约 40+ 篇论文）
- Teaching 数据（4 门课程）

---

### 步骤 3: 测试部署

**测试公共 API**：
```bash
# 测试博客列表
curl https://you-website.ychen10001.workers.dev/api/blog

# 测试书籍列表
curl https://you-website.ychen10001.workers.dev/api/books
```

**测试前端**：
- 访问: https://60f0a6de.you-website.pages.dev
- 或: www.tianlongyou.com
- 检查浏览器控制台是否有错误

**测试管理后台**：
- 访问: https://60f0a6de.you-website.pages.dev/admin
- 使用 ADMIN_TOKEN 登录

---

## 快速部署命令

### 完整部署流程

```bash
# 1. 部署 Worker（如果需要更新）
cd cloudflare-worker
wrangler deploy

# 2. 构建前端
cd ..
npm run build

# 3. 部署前端
wrangler pages deploy build --project-name=you-website --commit-dirty=true

# 4. 迁移数据（如果需要）
export API_URL=https://you-website.ychen10001.workers.dev
export ADMIN_TOKEN=你的token
npm run migrate:all
```

---

## 重要信息

- **Worker URL**: `https://you-website.ychen10001.workers.dev`
- **Worker 名称**: `you-website`
- **Pages 项目**: `you-website`
- **生产域名**: `www.tianlongyou.com`
- **数据库**: `tianlong-blog-db` (ID: 663b4713-c75d-45d0-8086-832dedca55fa)
- **R2 Bucket**: `blog-images`

---

## 常见问题

### 1. 前端无法连接 API

**原因**：环境变量未配置或配置错误

**解决**：
1. 检查 Dashboard 中的环境变量是否正确
2. 确保重新部署了前端
3. 检查浏览器控制台的错误信息

### 2. 管理后台无法登录

**原因**：ADMIN_TOKEN 不匹配

**解决**：
1. 确保 Pages 环境变量中的 `REACT_APP_ADMIN_TOKEN` 与 Worker Secrets 中的 `ADMIN_TOKEN` 一致
2. 确保前端已重新部署

### 3. 数据迁移失败

**原因**：环境变量未设置或 API 无法访问

**解决**：
1. 检查 `API_URL` 和 `ADMIN_TOKEN` 环境变量
2. 测试 API 是否可访问：`curl $API_URL/api/blog`
3. 检查 Worker 日志

