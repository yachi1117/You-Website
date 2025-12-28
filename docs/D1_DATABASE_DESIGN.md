# Cloudflare D1 数据库设计文档

## 概述

本文档描述了博客系统的 Cloudflare D1 数据库设计。D1 是 Cloudflare 提供的 SQLite 数据库服务，非常适合存储博客文章内容。

## 数据库表结构

### blog_posts 表

存储博客文章的核心信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | PRIMARY KEY, AUTOINCREMENT |
| slug | TEXT | 文章唯一标识符（URL 友好） | NOT NULL, UNIQUE |
| title | TEXT | 文章标题 | NOT NULL |
| subtitle | TEXT | 文章副标题 | 可选 |
| date | TEXT | 发布日期 | NOT NULL, 格式: YYYY-MM-DD |
| cover_image | TEXT | 封面图片路径 | 可选 |
| gallery_json | TEXT | 图片库 JSON 数组 | 可选，格式: `[{"src": "...", "caption": "..."}]` |
| tags_json | TEXT | 标签 JSON 数组 | 可选，格式: `["tag1", "tag2"]` |
| content_markdown | TEXT | Markdown 格式的正文内容 | NOT NULL |
| created_at | INTEGER | 创建时间（Unix 时间戳） | DEFAULT (unixepoch()) |
| updated_at | INTEGER | 更新时间（Unix 时间戳） | DEFAULT (unixepoch()) |

### 索引

- `idx_blog_posts_slug`: 在 `slug` 字段上创建唯一索引，用于快速查找文章
- `idx_blog_posts_date`: 在 `date` 字段上创建降序索引，用于按日期排序
- `idx_blog_posts_created_at`: 在 `created_at` 字段上创建降序索引，用于按创建时间排序

### 触发器

- `update_blog_posts_updated_at`: 当更新记录时，自动更新 `updated_at` 字段

## 数据格式说明

### gallery_json 格式

```json
[
  {
    "src": "/images/blog1a.jpeg",
    "caption": "The vibrant border market in Ruili"
  },
  {
    "src": "/images/blog1b.jpeg",
    "caption": "Local mosque serving the Myanmar Muslim community"
  }
]
```

### tags_json 格式

```json
["Fieldwork", "Immigration", "Border Studies", "Digital Economy", "Ruili"]
```

### content_markdown 格式

使用标准 Markdown 格式，支持：
- 文本段落
- 图片：`![caption](src)`
- 视频：`:::video\npath\n:::`
- 其他标准 Markdown 语法

## 使用 Cloudflare D1

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或
npm install --save-dev wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

**本地开发数据库：**
```bash
wrangler d1 create tianlong-blog-db
```

**生产环境数据库：**
在 Cloudflare Dashboard 中创建，或使用：
```bash
wrangler d1 create tianlong-blog-db --remote
```

### 4. 执行 Schema

**本地：**
```bash
wrangler d1 execute tianlong-blog-db --local --file=./cloudflare-worker/schema.sql
```

**生产环境：**
```bash
wrangler d1 execute tianlong-blog-db --file=./cloudflare-worker/schema.sql
```

### 5. 在 Worker 中使用

在 `wrangler.toml` 中配置数据库绑定：

```toml
[[d1_databases]]
binding = "DB"
database_name = "tianlong-blog-db"
database_id = "your-database-id"
```

在 Worker 代码中访问：

```javascript
export default {
  async fetch(request, env) {
    // 查询所有文章
    const result = await env.DB.prepare(
      "SELECT * FROM blog_posts ORDER BY date DESC"
    ).all();
    
    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
```

## 查询示例

### 获取所有文章（列表页）

```sql
SELECT 
  id,
  slug,
  title,
  subtitle,
  date,
  cover_image,
  gallery_json,
  tags_json
FROM blog_posts
ORDER BY date DESC;
```

### 获取单篇文章（详情页）

```sql
SELECT *
FROM blog_posts
WHERE slug = ?;
```

### 创建新文章

```sql
INSERT INTO blog_posts (
  slug,
  title,
  subtitle,
  date,
  cover_image,
  gallery_json,
  tags_json,
  content_markdown
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

### 更新文章

```sql
UPDATE blog_posts
SET 
  title = ?,
  subtitle = ?,
  date = ?,
  cover_image = ?,
  gallery_json = ?,
  tags_json = ?,
  content_markdown = ?
WHERE slug = ?;
```

### 删除文章

```sql
DELETE FROM blog_posts WHERE slug = ?;
```

## 迁移策略

### 从 Markdown 文件导入

1. 读取 `content/blog/*.md` 文件
2. 解析 frontmatter 和正文
3. 插入到 D1 数据库

参考脚本：`scripts/markdown-to-d1.js`（待创建）

## 注意事项

1. **JSON 字段存储**：D1 不支持原生 JSON 类型，所以使用 TEXT 存储 JSON 字符串，在应用层进行解析
2. **日期格式**：使用 TEXT 类型存储日期（YYYY-MM-DD），便于排序和显示
3. **时间戳**：使用 Unix 时间戳（INTEGER）存储创建和更新时间
4. **唯一性约束**：`slug` 字段必须唯一，用于 URL 路由
5. **索引优化**：为常用查询字段创建索引以提高性能

## 后续扩展

未来可以考虑添加：

- **用户表**：存储管理员信息
- **草稿表**：支持文章草稿功能
- **分类表**：更灵活的分类系统
- **评论表**：如果将来需要评论功能
- **媒体表**：统一管理图片和视频资源

