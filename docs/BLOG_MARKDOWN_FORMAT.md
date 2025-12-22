# 博客 Markdown 格式规范

本文档定义了博客文章从 JSON 转换为 Markdown 的标准格式。

## 文件结构

每篇博客文章存储为一个独立的 `.md` 文件，文件名使用 `slug.md` 格式（例如：`ruili-fieldwork.md`）。

## 格式规范

### Frontmatter（元数据）

使用 YAML frontmatter 存储文章的元数据，位于文件开头，用 `---` 分隔：

```yaml
---
slug: ruili-fieldwork
title: Fieldwork Reflection: Navigating Immigration and Governance in Ruili's Transnational Borderland
subtitle: A Study of Four Distinct Immigrant Communities
date: 2024-01-15
coverImage: /images/blog1a.jpeg
gallery:
  - src: /images/blog1a.jpeg
    caption: The vibrant border market in Ruili, where traders from both sides conduct daily business
  - src: /images/blog1b.jpeg
    caption: Local mosque serving the Myanmar Muslim community
tags:
  - Fieldwork
  - Immigration
  - Border Studies
  - Digital Economy
  - Ruili
---
```

### Frontmatter 字段说明

- **slug** (必需): 文章的唯一标识符，用于 URL 路由
- **title** (必需): 文章标题
- **subtitle** (可选): 文章副标题
- **date** (必需): 发布日期，格式：`YYYY-MM-DD`
- **coverImage** (可选): 封面图片路径，用于列表页展示
- **gallery** (可选): 图片数组，每个图片包含 `src` 和 `caption`
- **tags** (可选): 标签数组

### 正文内容

正文使用标准 Markdown 格式，支持以下元素：

#### 1. 文本段落

直接使用 Markdown 段落，无需 HTML 标签：

```markdown
Ruili, as a key border city between China and Myanmar, is a place you can find four distinct groups of immigrants: Burmese immigrants, Myanmar Muslims, cross-border ethnic minorities, and Chinese overseas returnees.
```

#### 2. 图片

使用标准 Markdown 图片语法：

```markdown
![图片说明文字](/images/blog1a.jpeg)
```

#### 3. 视频

使用自定义语法（后续在渲染时会转换为 HTML `<video>` 标签）：

```markdown
:::video
/images/IMG_9625.mov
:::
```

#### 4. 其他 Markdown 语法

支持所有标准 Markdown 语法：
- **粗体**: `**文本**`
- *斜体*: `*文本*`
- 标题: `# H1`, `## H2`, `### H3`
- 列表: `- 项目` 或 `1. 项目`
- 引用: `> 引用文本`
- 代码块: ` ```代码``` `

## 完整示例

```markdown
---
slug: ruili-fieldwork
title: Fieldwork Reflection: Navigating Immigration and Governance in Ruili's Transnational Borderland
subtitle: A Study of Four Distinct Immigrant Communities
date: 2024-01-15
coverImage: /images/blog1a.jpeg
gallery:
  - src: /images/blog1a.jpeg
    caption: The vibrant border market in Ruili
  - src: /images/blog1b.jpeg
    caption: Local mosque serving the Myanmar Muslim community
tags:
  - Fieldwork
  - Immigration
  - Border Studies
---

Ruili, as a key border city between China and Myanmar, is a place you can find four distinct groups of immigrants: Burmese immigrants, Myanmar Muslims, cross-border ethnic minorities, and Chinese overseas returnees.

![The vibrant border market in Ruili, where traders from both sides conduct daily business](/images/blog1a.jpeg)

Burmese immigrants form the largest migrant population, consisting of traders, laborers, and farmers who rely on Ruili's cross-border economy.

![Local mosque serving the Myanmar Muslim community](/images/blog1b.jpeg)
```

## 转换规则

从 JSON 格式转换到 Markdown 时的规则：

1. **文本内容**: 移除 HTML 标签（如 `<p>`, `</p>`），保留纯文本
2. **图片**: 将 `{"type": "image", "index": 0}` 转换为 `![caption](src)` 格式
3. **视频**: 将 `{"type": "video", "src": "..."}` 转换为 `:::video\n...\n:::` 格式
4. **Frontmatter**: 将 JSON 的顶层字段转换为 YAML frontmatter

## 注意事项

1. 所有图片路径保持相对路径格式（以 `/images/` 开头）
2. 日期格式统一为 `YYYY-MM-DD`
3. 标签使用数组格式，每个标签一行
4. Gallery 中的图片顺序与正文中出现的顺序保持一致

