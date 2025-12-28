# 网站后端管理架构设计

## 概述

本文档设计整个网站的后端管理架构，包括所有内容模块的管理入口和数据结构设计。

## 管理模块清单

### 已实现
- ✅ **博客管理** (`/admin/blog`) - 已完成

### 待实现
- ⏳ **About Me** (`/admin/about`) - 首页个人信息管理
- ⏳ **Books** (`/admin/books`) - 书籍管理
- ⏳ **Papers** (`/admin/papers`) - 论文管理
- ⏳ **Teaching** (`/admin/teaching`) - 课程管理
- ⏳ **Public Engagement** (`/admin/public-engagement`) - 公共参与（播客等）管理

---

## 数据结构设计

### 1. About Me (首页信息)

**当前状态**：硬编码在 `Home.js` 中

**数据结构**：
```json
{
  "name": "Dr. Tianlong You",
  "title": "Immigration Sociologist",
  "bio": "简介文本（支持 Markdown）",
  "headshot": "/images/headshot.png",
  "email": "tyou0410@gmail.com",
  "socialLinks": {
    "googleScholar": "https://...",
    "linkedIn": "https://...",
    "researchGate": "https://..."
  },
  "researchInterests": ["移民研究", "边界研究", "数字经济"],
  "updated_at": 1234567890
}
```

**管理功能**：
- 编辑个人信息
- 更新头像
- 编辑简介（Markdown）
- 管理社交媒体链接
- 管理研究兴趣标签

**存储方案**：
- 选项 A：D1 单表 `site_settings`（键值对）
- 选项 B：D1 表 `about_me`（单条记录）

---

### 2. Books (书籍)

**当前状态**：硬编码在 `Books.js` 中

**数据结构**：
```json
{
  "id": 1,
  "title": "The Rise and Fall of Digital Developmental Villages...",
  "titleZh": "中文标题（可选）",
  "cover": "/images/alibaba.png",
  "publisher": "Palgrave Macmillan",
  "publicationDate": "2024-01-01",
  "isbn": "978-3-030-12345-6",
  "shortDescription": "简短描述",
  "fullDescription": "完整描述（Markdown）",
  "order": 1, // 显示顺序
  "status": "published", // published, in_progress, contracted
  "created_at": 1234567890,
  "updated_at": 1234567890
}
```

**管理功能**：
- 列表展示（表格）
- 创建新书
- 编辑书籍信息
- 删除书籍
- 拖拽排序
- 上传封面图片

**存储方案**：D1 表 `books`

---

### 3. Papers (论文)

**当前状态**：硬编码在 `Papers.js` 中，结构复杂（多个分类）

**数据结构**：
```json
{
  "id": 1,
  "category": "specialIssues", // specialIssues, immigrantEntrepreneurship, etc.
  "title": "Global China from the Ground up.",
  "role": "Co-Guest Editor",
  "journal": "Comparative Migration Studies (Q1)",
  "status": "in_progress", // in_progress, published
  "issue": "139",
  "link": "https://...",
  "year": 2024,
  "order": 1,
  "created_at": 1234567890,
  "updated_at": 1234567890
}
```

**管理功能**：
- 按分类管理（Special Issues, Immigrant Entrepreneurship, 等）
- 创建新论文
- 编辑论文信息
- 删除论文
- 分类内排序
- 批量操作

**存储方案**：D1 表 `papers`

**分类管理**：
- 可以创建自定义分类
- 每个分类可以设置显示顺序

---

### 4. Teaching (课程)

**当前状态**：硬编码在 `Teaching.js` 中

**数据结构**：
```json
{
  "id": 1,
  "level": "undergraduate", // undergraduate, postgraduate
  "title": "Sociology of Immigration",
  "image": "/images/Visualizing-Migration.jpg",
  "description": "课程描述（Markdown）",
  "syllabus": "课程大纲（Markdown，可选）",
  "order": 1,
  "created_at": 1234567890,
  "updated_at": 1234567890
}
```

**管理功能**：
- 按级别分类（本科生/研究生）
- 创建新课程
- 编辑课程信息
- 删除课程
- 上传课程图片
- 排序

**存储方案**：D1 表 `courses`

---

### 5. Public Engagement (公共参与)

**当前状态**：从 `podcasts.json` 读取

**数据结构**：
```json
{
  "id": 1,
  "type": "podcast", // podcast, interview, article, etc.
  "title": "进步主义破产了吗 Is Progressivism Falling Apart?",
  "titleEn": "Is Progressivism Falling Apart? A Dialogue with You Tianlong",
  "date": "2025-01-03",
  "coverImage": "https://...",
  "audioUrl": "https://...",
  "externalLink": "https://...",
  "showNotes": "中文说明",
  "showNotesEn": "English notes",
  "duration": "132 min",
  "topicsEn": ["Crisis of Progressivism", "..."],
  "order": 1,
  "created_at": 1234567890,
  "updated_at": 1234567890
}
```

**管理功能**：
- 列表展示（表格）
- 创建新条目
- 编辑条目信息
- 删除条目
- 按日期排序
- 支持多种类型（播客、采访、文章等）

**存储方案**：D1 表 `public_engagements`

---

## 数据库 Schema 设计

### 表结构概览

```sql
-- 网站设置（About Me）
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 书籍
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_zh TEXT,
  cover TEXT,
  publisher TEXT,
  publication_date TEXT,
  isbn TEXT,
  short_description TEXT,
  full_description_markdown TEXT,
  status TEXT DEFAULT 'published', -- published, in_progress, contracted
  display_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 论文
CREATE TABLE papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- specialIssues, immigrantEntrepreneurship, etc.
  title TEXT NOT NULL,
  role TEXT, -- Guest Editor, Co-Guest Editor, Author, etc.
  journal TEXT,
  status TEXT DEFAULT 'published', -- published, in_progress
  issue TEXT,
  link TEXT,
  year INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 课程
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL, -- undergraduate, postgraduate
  title TEXT NOT NULL,
  image TEXT,
  description_markdown TEXT,
  syllabus_markdown TEXT,
  display_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 公共参与
CREATE TABLE public_engagements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- podcast, interview, article, etc.
  title TEXT NOT NULL,
  title_en TEXT,
  date TEXT NOT NULL,
  cover_image TEXT,
  audio_url TEXT,
  external_link TEXT,
  show_notes TEXT,
  show_notes_en TEXT,
  duration TEXT,
  topics_json TEXT, -- JSON 数组
  display_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

---

## 管理后台界面设计

### 主页面 (`/admin`)

```
┌─────────────────────────────────────────┐
│  网站管理后台              [退出登录]   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ 📝 博客  │  │ 👤 About │           │
│  │          │  │    Me    │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ 📚 书籍  │  │ 📄 论文  │           │
│  │          │  │          │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ 🎓 课程  │  │ 🎤 公共参与│          │
│  │          │  │          │           │
│  └──────────┘  └──────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

### 各模块管理页面

**统一设计模式**：
- 列表页：表格展示 + 新建按钮 + 编辑/删除操作
- 编辑页：表单 + Markdown 编辑器（如需要）+ 图片上传

---

## API 端点设计

### About Me

- `GET /api/admin/about` - 获取 About Me 信息
- `PUT /api/admin/about` - 更新 About Me 信息

### Books

- `GET /api/admin/books` - 获取所有书籍
- `GET /api/admin/books/:id` - 获取单本书
- `POST /api/admin/books` - 创建新书
- `PUT /api/admin/books/:id` - 更新书籍
- `DELETE /api/admin/books/:id` - 删除书籍

### Papers

- `GET /api/admin/papers` - 获取所有论文（可按分类筛选）
- `GET /api/admin/papers/:id` - 获取单篇论文
- `POST /api/admin/papers` - 创建新论文
- `PUT /api/admin/papers/:id` - 更新论文
- `DELETE /api/admin/papers/:id` - 删除论文
- `GET /api/admin/papers/categories` - 获取所有分类

### Courses

- `GET /api/admin/courses` - 获取所有课程（可按级别筛选）
- `GET /api/admin/courses/:id` - 获取单门课程
- `POST /api/admin/courses` - 创建新课程
- `PUT /api/admin/courses/:id` - 更新课程
- `DELETE /api/admin/courses/:id` - 删除课程

### Public Engagement

- `GET /api/admin/public-engagement` - 获取所有条目
- `GET /api/admin/public-engagement/:id` - 获取单个条目
- `POST /api/admin/public-engagement` - 创建新条目
- `PUT /api/admin/public-engagement/:id` - 更新条目
- `DELETE /api/admin/public-engagement/:id` - 删除条目

---

## 实施优先级

### 阶段一：基础架构（当前）
- ✅ 博客管理（已完成）
- ✅ 图片上传功能（已完成）

### 阶段二：核心内容管理（推荐优先）
1. **About Me** - 最简单，单条记录
2. **Books** - 结构清晰，类似博客
3. **Public Engagement** - 已有 JSON 数据，迁移容易

### 阶段三：复杂内容管理
4. **Papers** - 需要处理分类
5. **Teaching** - 需要处理级别分类

---

## 数据迁移策略

### 从硬编码迁移到数据库

1. **Books**：
   - 读取 `Books.js` 中的硬编码数据
   - 转换为 JSON
   - 批量导入到 D1

2. **Papers**：
   - 读取 `Papers.js` 中的硬编码数据
   - 按分类组织
   - 批量导入到 D1

3. **Teaching**：
   - 读取 `Teaching.js` 中的硬编码数据
   - 按级别分类
   - 批量导入到 D1

4. **Public Engagement**：
   - 读取 `podcasts.json`
   - 直接导入到 D1

5. **About Me**：
   - 从 `Home.js` 提取信息
   - 手动输入到管理后台

---

## 前端页面更新策略

### 方案：渐进式迁移

1. **保持向后兼容**：
   - 先实现管理后台
   - 前端仍从硬编码读取
   - 逐步切换到 API

2. **切换步骤**：
   - 实现 API 端点
   - 测试 API 数据
   - 更新前端组件使用 API
   - 移除硬编码数据

---

## 推荐实施顺序

1. **更新 Admin 主页面** - 添加所有管理入口
2. **实现 About Me 管理** - 最简单，快速验证流程
3. **实现 Books 管理** - 复用博客管理的经验
4. **实现 Public Engagement 管理** - 迁移现有 JSON 数据
5. **实现 Papers 管理** - 处理分类逻辑
6. **实现 Teaching 管理** - 处理级别分类

---

## 注意事项

1. **数据一致性**：迁移时确保数据完整
2. **URL 兼容性**：保持现有 URL 结构
3. **图片处理**：统一使用 R2 存储
4. **Markdown 支持**：所有描述性文本支持 Markdown
5. **多语言支持**：考虑中英文内容

---

## 下一步

1. 更新 `Admin.js` 添加所有管理入口
2. 设计各模块的数据库表结构
3. 实现各模块的管理页面
4. 实现 API 端点
5. 迁移现有数据
6. 更新前端页面使用 API

