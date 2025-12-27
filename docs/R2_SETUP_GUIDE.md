# Cloudflare R2 设置指南

## 概述

本文档说明如何设置 Cloudflare R2 用于博客图片存储和上传功能。

## 步骤 1: 在 Cloudflare Dashboard 中启用 R2

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 在左侧菜单中找到 **"R2"** 并点击
4. 如果是第一次使用，点击 **"Enable R2"** 启用服务
5. 阅读并同意服务条款

## 步骤 2: 创建 R2 Bucket

### 方法一：通过 Dashboard 创建（推荐）

1. 在 R2 页面，点击 **"Create bucket"**
2. 输入 Bucket 名称：`blog-images`
3. 选择位置（建议选择离你最近的区域，如 `APAC`）
4. 点击 **"Create bucket"**

### 方法二：通过 Wrangler CLI 创建

```bash
cd cloudflare-worker
wrangler r2 bucket create blog-images
```

## 步骤 3: 配置 Worker 绑定

编辑 `cloudflare-worker/wrangler.toml`，确保包含以下配置：

```toml
[[r2_buckets]]
binding = "BLOG_IMAGES"
bucket_name = "blog-images"
```

## 步骤 4: 配置 R2 公共访问（可选）

默认情况下，R2 中的文件是私有的。要让图片可以通过 URL 直接访问，有两种方式：

### 方式 A：通过 Worker 代理（当前实现）

当前实现使用 Worker API (`/api/images/:fileName`) 来访问图片，这样更安全，因为可以控制访问权限。

**优点**：
- 可以添加访问控制
- 可以添加缓存策略
- 更安全

**缺点**：
- 需要通过 Worker，可能稍慢

### 方式 B：配置 R2 公共访问

1. 在 R2 Dashboard 中，选择 `blog-images` bucket
2. 进入 **Settings** 标签
3. 找到 **Public Access** 部分
4. 点击 **"Allow Access"** 并配置域名
5. 或者使用 **Custom Domain** 配置自定义域名

**优点**：
- 直接访问，速度快
- 可以使用 CDN 加速

**缺点**：
- 所有文件都是公开的
- 需要配置域名

## 步骤 5: 测试上传功能

1. 启动 Worker：
   ```bash
   cd cloudflare-worker
   npm run dev
   ```

2. 启动前端：
   ```bash
   npm start
   ```

3. 访问管理后台：`http://localhost:3000/admin/blog/new`

4. 在编辑页面，尝试拖拽或点击上传图片

5. 检查上传是否成功：
   - 图片应该自动插入到 Markdown 编辑器
   - 在预览区域可以看到图片

## 步骤 6: 部署到生产环境

### 部署 Worker

```bash
cd cloudflare-worker
npm run deploy
```

### 配置生产环境变量

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. Settings > Variables
4. 确保 `ADMIN_TOKEN` 已设置

## 图片 URL 格式

### 开发环境

```
http://localhost:8787/api/images/filename-1234567890.jpg
```

### 生产环境

```
https://your-worker.workers.dev/api/images/filename-1234567890.jpg
```

## 文件命名规则

根据配置，图片使用以下命名规则：

```
原始文件名-时间戳.扩展名
```

**示例**：
- 原始文件：`photo.jpg`
- 上传后：`photo-1703123456789.jpg`

**特点**：
- 保留原始文件名（清理特殊字符）
- 添加时间戳确保唯一性
- 避免文件名冲突

## 成本估算

### Cloudflare R2 定价

- **存储**：$0.015/GB/月
- **读取操作**：免费（前 100 万次/月）
- **写入操作**：免费（前 100 万次/月）
- **Class A 操作**：$4.50/百万次
- **Class B 操作**：$0.36/百万次

### 典型使用场景

假设：
- 100 张图片
- 每张平均 2MB
- 总存储：200MB = 0.2GB

**月度成本**：
- 存储：0.2GB × $0.015 = $0.003
- 读取：免费（在免费额度内）
- 写入：免费（在免费额度内）

**总计**：约 $0.003/月（几乎免费）

## 故障排除

### 问题 1: "R2 bucket not configured" 错误

**原因**：Worker 中无法访问 R2 bucket

**解决方法**：
1. 检查 `wrangler.toml` 中的 R2 配置
2. 确保 bucket 名称正确
3. 重新部署 Worker

### 问题 2: 上传失败

**可能原因**：
- R2 未启用
- Bucket 不存在
- 认证失败
- 文件太大或格式不支持

**解决方法**：
1. 检查 Cloudflare Dashboard 中 R2 是否已启用
2. 确认 bucket 已创建
3. 检查文件大小（最大 10MB）
4. 检查文件格式（只支持 JPG、PNG、GIF、WebP）

### 问题 3: 图片无法访问

**可能原因**：
- Worker 路由配置错误
- 图片不存在
- 权限问题

**解决方法**：
1. 检查 Worker 代码中的 `/api/images/:fileName` 路由
2. 确认图片已成功上传到 R2
3. 检查 Worker 日志

## 安全建议

1. **访问控制**：
   - 上传 API 需要管理员认证
   - 图片访问可以通过 Worker 控制

2. **文件验证**：
   - 只允许图片格式
   - 限制文件大小
   - 清理文件名中的特殊字符

3. **存储优化**：
   - 考虑添加图片压缩
   - 使用 WebP 格式减少文件大小
   - 定期清理未使用的图片

## 下一步

1. ✅ 启用 R2
2. ✅ 创建 bucket
3. ✅ 配置 Worker
4. ✅ 测试上传功能
5. ⚠️ 配置自定义域名（可选）
6. ⚠️ 添加图片压缩功能（可选）
7. ⚠️ 创建图片管理页面（可选）

## 参考文档

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Wrangler R2 命令](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
- [R2 定价](https://developers.cloudflare.com/r2/pricing/)

