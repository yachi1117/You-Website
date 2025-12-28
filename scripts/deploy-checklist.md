# 部署检查清单

## 部署前检查

### 1. 环境准备
- [ ] Wrangler CLI 已安装：`wrangler --version`
- [ ] 已登录 Cloudflare：`wrangler whoami`
- [ ] 所有代码已提交到 Git
- [ ] 本地测试通过

### 2. 配置准备
- [ ] 生成强密码 ADMIN_TOKEN（至少 32 字符）
- [ ] 确定前端域名
- [ ] 确定 API 域名（或使用 Workers 默认域名）

### 3. Cloudflare 资源
- [ ] D1 数据库已创建（或准备创建）
- [ ] R2 bucket `blog-images` 已创建
- [ ] Worker 项目已准备（或准备创建）

---

## 部署步骤

### 步骤 1: 部署 Worker
- [ ] 检查 `wrangler.toml` 配置
- [ ] 在 Cloudflare Dashboard 设置 `ADMIN_TOKEN` 环境变量
- [ ] 执行 `wrangler deploy`
- [ ] 保存 Worker URL

### 步骤 2: 数据库迁移
- [ ] 执行所有迁移脚本（`--remote`）
- [ ] 验证表是否创建成功

### 步骤 3: 数据迁移
- [ ] 设置环境变量（`API_URL`, `ADMIN_TOKEN`）
- [ ] 运行 `npm run migrate:all`
- [ ] 验证数据是否导入成功

### 步骤 4: 前端部署
- [ ] 创建 `.env.production` 文件
- [ ] 执行 `npm run build`
- [ ] 部署到 Cloudflare Pages
- [ ] 配置环境变量

### 步骤 5: 测试
- [ ] 测试公共 API
- [ ] 测试管理 API
- [ ] 测试前端页面
- [ ] 测试管理功能
- [ ] 测试图片上传

---

## 部署后检查

- [ ] 所有页面正常显示
- [ ] 管理后台可以登录
- [ ] 所有 CRUD 操作正常
- [ ] 图片上传和显示正常
- [ ] CORS 配置正确
- [ ] HTTPS 正常工作

---

## 故障排除

遇到问题时，检查：
1. Worker 日志
2. 浏览器控制台
3. 网络请求（Network tab）
4. Cloudflare Dashboard 中的错误

