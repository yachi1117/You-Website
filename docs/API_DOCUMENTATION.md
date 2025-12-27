# API 文档

本文档描述了博客系统的 Cloudflare Worker API 接口。

## 基础信息

- **Base URL**: `https://your-worker.workers.dev` (部署后)
- **本地开发**: `http://localhost:8787` (使用 `wrangler dev`)
- **Content-Type**: `application/json`
- **CORS**: 已启用，支持跨域请求

## 公共 API

### 1. 获取所有文章列表

**端点**: `GET /api/blog`

**描述**: 获取所有已发布的博客文章列表（不包含正文内容）

**请求示例**:
```bash
curl https://your-worker.workers.dev/api/blog
```

**响应示例**:
```json
[
  {
    "id": 1,
    "slug": "ruili-fieldwork",
    "title": "Fieldwork Reflection: Navigating Immigration...",
    "subtitle": "A Study of Four Distinct Immigrant Communities",
    "date": "2024-01-15",
    "cover_image": "/images/blog1a.jpeg",
    "gallery": [
      {
        "src": "/images/blog1a.jpeg",
        "caption": "The vibrant border market in Ruili"
      }
    ],
    "tags": ["Fieldwork", "Immigration", "Border Studies"]
  }
]
```

**响应字段说明**:
- `id`: 文章 ID
- `slug`: URL 友好标识符
- `title`: 文章标题
- `subtitle`: 副标题（可选）
- `date`: 发布日期（YYYY-MM-DD）
- `cover_image`: 封面图片路径
- `gallery`: 图片数组
- `tags`: 标签数组

---

### 2. 获取单篇文章详情

**端点**: `GET /api/blog/:slug`

**描述**: 根据 slug 获取单篇文章的完整内容（包含转换后的 HTML）

**路径参数**:
- `slug`: 文章的 slug（例如：`ruili-fieldwork`）

**请求示例**:
```bash
curl https://your-worker.workers.dev/api/blog/ruili-fieldwork
```

**响应示例**:
```json
{
  "id": 1,
  "slug": "ruili-fieldwork",
  "title": "Fieldwork Reflection: Navigating Immigration...",
  "subtitle": "A Study of Four Distinct Immigrant Communities",
  "date": "2024-01-15",
  "cover_image": "/images/blog1a.jpeg",
  "gallery": [
    {
      "src": "/images/blog1a.jpeg",
      "caption": "The vibrant border market in Ruili"
    }
  ],
  "tags": ["Fieldwork", "Immigration", "Border Studies"],
  "contentHtml": "<p>Ruili, as a key border city...</p><figure>...</figure>",
  "created_at": 1705276800,
  "updated_at": 1705276800
}
```

**响应字段说明**:
- `contentHtml`: Markdown 转换后的 HTML 内容
- `created_at`: 创建时间（Unix 时间戳）
- `updated_at`: 更新时间（Unix 时间戳）
- 其他字段同列表接口

**错误响应**:
- `404`: 文章不存在
  ```json
  {
    "error": "Post not found"
  }
  ```

---

## 管理 API

所有管理 API 都需要认证。在请求头中添加：

```
Authorization: Bearer your-secret-token
```

### 1. 获取所有文章列表（管理用）

**端点**: `GET /api/admin/blog`

**描述**: 获取所有文章，包含完整的 Markdown 内容（用于编辑）

**请求示例**:
```bash
curl -H "Authorization: Bearer your-secret-token" \
  https://your-worker.workers.dev/api/admin/blog
```

**响应**: 同公共 API，但包含 `content_markdown` 字段

---

### 2. 获取单篇文章（管理用）

**端点**: `GET /api/admin/blog/:id`

**描述**: 根据 ID 获取单篇文章的完整信息（包含 Markdown 源码）

**路径参数**:
- `id`: 文章 ID（整数）

**请求示例**:
```bash
curl -H "Authorization: Bearer your-secret-token" \
  https://your-worker.workers.dev/api/admin/blog/1
```

**响应示例**:
```json
{
  "id": 1,
  "slug": "ruili-fieldwork",
  "title": "...",
  "subtitle": "...",
  "date": "2024-01-15",
  "cover_image": "/images/blog1a.jpeg",
  "gallery_json": "[{\"src\":\"/images/blog1a.jpeg\",\"caption\":\"...\"}]",
  "tags_json": "[\"Fieldwork\",\"Immigration\"]",
  "content_markdown": "Ruili, as a key border city...",
  "created_at": 1705276800,
  "updated_at": 1705276800
}
```

---

### 3. 创建新文章

**端点**: `POST /api/admin/blog`

**描述**: 创建一篇新的博客文章

**请求体**:
```json
{
  "slug": "new-post-slug",
  "title": "New Post Title",
  "subtitle": "Optional Subtitle",
  "date": "2024-01-20",
  "cover_image": "/images/cover.jpg",
  "gallery": [
    {
      "src": "/images/image1.jpg",
      "caption": "Image caption"
    }
  ],
  "tags": ["Tag1", "Tag2"],
  "content_markdown": "# Title\n\nContent here..."
}
```

**必填字段**:
- `slug`: 唯一标识符
- `title`: 标题
- `date`: 发布日期
- `content_markdown`: Markdown 格式的正文

**请求示例**:
```bash
curl -X POST \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"slug":"new-post","title":"New Post","date":"2024-01-20","content_markdown":"Content"}' \
  https://your-worker.workers.dev/api/admin/blog
```

**响应示例**:
```json
{
  "id": 7,
  "message": "Post created successfully"
}
```

**错误响应**:
- `400`: 缺少必填字段
- `409`: slug 已存在

---

### 4. 更新文章

**端点**: `PUT /api/admin/blog/:id`

**描述**: 更新已存在的文章

**路径参数**:
- `id`: 文章 ID（整数）

**请求体**: 同创建接口，但 `slug` 字段不可修改

**请求示例**:
```bash
curl -X PUT \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","date":"2024-01-20","content_markdown":"Updated content"}' \
  https://your-worker.workers.dev/api/admin/blog/1
```

**响应示例**:
```json
{
  "message": "Post updated successfully"
}
```

**错误响应**:
- `404`: 文章不存在

---

### 5. 删除文章

**端点**: `DELETE /api/admin/blog/:id`

**描述**: 删除指定的文章

**路径参数**:
- `id`: 文章 ID（整数）

**请求示例**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer your-secret-token" \
  https://your-worker.workers.dev/api/admin/blog/1
```

**响应示例**:
```json
{
  "message": "Post deleted successfully"
}
```

**错误响应**:
- `404`: 文章不存在

---

## 认证

### 设置认证 Token

在 `wrangler.toml` 中配置：

```toml
[vars]
ADMIN_TOKEN = "your-secret-token-here"
```

或者在本地开发时创建 `.dev.vars` 文件：

```
ADMIN_TOKEN=your-secret-token-here
```

### 使用认证

在所有管理 API 请求中添加请求头：

```
Authorization: Bearer your-secret-token-here
```

---

## 错误处理

所有错误响应都遵循以下格式：

```json
{
  "error": "Error message"
}
```

常见 HTTP 状态码：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误（缺少字段、格式错误等）
- `401`: 未授权（认证失败）
- `404`: 资源不存在
- `409`: 冲突（例如 slug 已存在）
- `500`: 服务器错误

---

## Markdown 支持

API 支持以下 Markdown 语法：

- **标题**: `# H1`, `## H2`, `### H3`
- **粗体**: `**text**`
- **斜体**: `*text*`
- **图片**: `![caption](src)`
- **链接**: `[text](url)`
- **代码**: `` `code` `` 和 ` ```code``` ``
- **引用**: `> quote`
- **列表**: `- item` 和 `1. item`

### 自定义语法

**视频**:
```markdown
:::video
/images/video.mov
:::
```

会被转换为：
```html
<div class="video-container">
  <video controls class="blog-post-video" playsinline>
    <source src="/images/video.mov" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>
```

---

## 本地开发

### 启动开发服务器

```bash
cd cloudflare-worker
npm run dev
```

Worker 将在 `http://localhost:8787` 启动

### 测试 API

```bash
# 获取文章列表
curl http://localhost:8787/api/blog

# 获取单篇文章
curl http://localhost:8787/api/blog/ruili-fieldwork

# 创建文章（需要认证）
curl -X POST \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","title":"Test","date":"2024-01-20","content_markdown":"Test content"}' \
  http://localhost:8787/api/admin/blog
```

---

## 部署

### 部署到 Cloudflare

```bash
cd cloudflare-worker
npm run deploy
```

### 配置环境变量

在 Cloudflare Dashboard 中设置环境变量：
- `ADMIN_TOKEN`: 管理 API 的认证 token

---

## 注意事项

1. **认证安全**: 生产环境建议使用 Cloudflare Access 或更安全的认证方案
2. **CORS**: 当前配置允许所有来源，生产环境应该限制为特定域名
3. **Markdown 解析**: 当前使用简化版解析器，复杂 Markdown 可能需要专业库
4. **错误处理**: 建议添加更详细的错误日志和监控

