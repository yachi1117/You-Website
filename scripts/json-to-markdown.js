#!/usr/bin/env node

/**
 * 将 blog-posts.json 转换为 Markdown 格式
 * 
 * 使用方法：
 * node scripts/json-to-markdown.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const INPUT_FILE = path.join(__dirname, '../public/blog-posts.json');
const OUTPUT_DIR = path.join(__dirname, '../content/blog');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 将 HTML 内容转换为纯文本（移除 HTML 标签）
 */
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<em>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<[^>]+>/g, '') // 移除所有剩余的 HTML 标签
    .trim();
}

/**
 * 将 content 数组转换为 Markdown 字符串
 */
function contentToMarkdown(content, images) {
  let markdown = '';
  
  for (const section of content) {
    if (section.type === 'text') {
      const text = htmlToText(section.content);
      if (text) {
        markdown += text + '\n\n';
      }
    } else if (section.type === 'image') {
      const imageIndex = section.index;
      if (images && images[imageIndex]) {
        const image = images[imageIndex];
        markdown += `![${image.caption || ''}](${image.src})\n\n`;
      }
    } else if (section.type === 'video') {
      const videoSrc = section.src || '';
      markdown += `:::video\n${videoSrc}\n:::\n\n`;
    }
  }
  
  return markdown.trim();
}

/**
 * 生成 YAML frontmatter
 */
function generateFrontmatter(post) {
  const frontmatter = {
    slug: post.slug,
    title: post.title,
    date: post.date,
  };
  
  if (post.subtitle) {
    frontmatter.subtitle = post.subtitle;
  }
  
  // 封面图片：使用第一张图片
  if (post.images && post.images.length > 0) {
    frontmatter.coverImage = post.images[0].src;
  }
  
  // Gallery：所有图片
  if (post.images && post.images.length > 0) {
    frontmatter.gallery = post.images.map(img => ({
      src: img.src,
      caption: img.caption || '',
    }));
  }
  
  // Tags
  if (post.tags && post.tags.length > 0) {
    frontmatter.tags = post.tags;
  }
  
  // 将对象转换为 YAML 格式
  let yaml = '---\n';
  yaml += `slug: ${frontmatter.slug}\n`;
  yaml += `title: ${JSON.stringify(frontmatter.title)}\n`;
  if (frontmatter.subtitle) {
    yaml += `subtitle: ${JSON.stringify(frontmatter.subtitle)}\n`;
  }
  yaml += `date: ${frontmatter.date}\n`;
  
  if (frontmatter.coverImage) {
    yaml += `coverImage: ${frontmatter.coverImage}\n`;
  }
  
  if (frontmatter.gallery && frontmatter.gallery.length > 0) {
    yaml += 'gallery:\n';
    frontmatter.gallery.forEach(img => {
      yaml += `  - src: ${img.src}\n`;
      if (img.caption) {
        yaml += `    caption: ${JSON.stringify(img.caption)}\n`;
      }
    });
  }
  
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    yaml += 'tags:\n';
    frontmatter.tags.forEach(tag => {
      yaml += `  - ${tag}\n`;
    });
  }
  
  yaml += '---\n';
  return yaml;
}

/**
 * 转换单篇文章
 */
function convertPost(post) {
  // 生成 frontmatter
  const frontmatter = generateFrontmatter(post);
  
  // 生成正文 Markdown
  const content = contentToMarkdown(post.content || [], post.images || []);
  
  // 组合成完整的 Markdown 文件
  const markdown = frontmatter + '\n' + content + '\n';
  
  return markdown;
}

/**
 * 主函数
 */
function main() {
  console.log('开始转换 JSON 到 Markdown...');
  console.log(`输入文件: ${INPUT_FILE}`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
  
  // 读取 JSON 文件
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`错误: 找不到文件 ${INPUT_FILE}`);
    process.exit(1);
  }
  
  const jsonData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const posts = jsonData.posts || [];
  
  console.log(`找到 ${posts.length} 篇文章`);
  
  // 转换每篇文章
  let successCount = 0;
  let errorCount = 0;
  
  posts.forEach((post, index) => {
    try {
      const markdown = convertPost(post);
      const outputFile = path.join(OUTPUT_DIR, `${post.slug}.md`);
      
      fs.writeFileSync(outputFile, markdown, 'utf8');
      console.log(`✓ [${index + 1}/${posts.length}] ${post.slug}.md`);
      successCount++;
    } catch (error) {
      console.error(`✗ [${index + 1}/${posts.length}] ${post.slug}: ${error.message}`);
      errorCount++;
    }
  });
  
  console.log('\n转换完成!');
  console.log(`成功: ${successCount} 篇`);
  if (errorCount > 0) {
    console.log(`失败: ${errorCount} 篇`);
  }
  console.log(`\n输出目录: ${OUTPUT_DIR}`);
}

// 运行主函数
main();

