/**
 * Cloudflare Worker API for Blog CMS
 * 
 * 公共 API:
 * - GET /api/blog - 获取所有文章列表
 * - GET /api/blog/:slug - 获取单篇文章详情
 * 
 * 管理 API (需要认证):
 * - GET /api/admin/blog - 获取所有文章（管理用）
 * - GET /api/admin/blog/:id - 获取单篇文章（管理用）
 * - POST /api/admin/blog - 创建新文章
 * - PUT /api/admin/blog/:id - 更新文章
 * - DELETE /api/admin/blog/:id - 删除文章
 */

import { parseMarkdown, corsHeaders, jsonResponse, errorResponse, parsePath } from './utils.js';

/**
 * 检查是否为管理 API 请求
 */
function isAdminRequest(path) {
  return path.startsWith('/api/admin');
}

/**
 * 简单的认证检查（后续可以替换为更安全的方案）
 */
async function checkAuth(request, env) {
  // 从请求头获取认证信息
  const authHeader = request.headers.get('Authorization');
  
  // 从环境变量读取 token（更安全）
  // 在 wrangler.toml 中设置: [vars] ADMIN_TOKEN = "your-secret-token"
  const expectedToken = env.ADMIN_TOKEN || 'your-secret-token';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === expectedToken;
}

/**
 * 获取所有文章列表（公共 API）
 */
async function getBlogList(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        id,
        slug,
        title,
        subtitle,
        date,
        cover_image,
        gallery_json,
        tags_json
      FROM blog_posts
      ORDER BY date DESC`
    ).all();
    
    // 解析 JSON 字段，移除原始 JSON 字段
    const posts = result.results.map(post => {
      const { gallery_json, tags_json, ...rest } = post;
      return {
        ...rest,
        gallery: gallery_json ? JSON.parse(gallery_json) : [],
        tags: tags_json ? JSON.parse(tags_json) : [],
      };
    });
    
    return jsonResponse(posts);
  } catch (error) {
    console.error('Error fetching blog list:', error);
    return errorResponse('Failed to fetch blog posts', 500);
  }
}

/**
 * 根据 slug 获取单篇文章（公共 API）
 */
async function getBlogPost(slug, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();
    
    if (!result) {
      return errorResponse('Post not found', 404);
    }
    
    // 解析 JSON 字段，移除原始 JSON 字段
    const { gallery_json, tags_json, content_markdown, ...rest } = result;
    const post = {
      ...rest,
      gallery: gallery_json ? JSON.parse(gallery_json) : [],
      tags: tags_json ? JSON.parse(tags_json) : [],
      contentHtml: parseMarkdown(content_markdown),
    };
    
    return jsonResponse(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return errorResponse('Failed to fetch blog post', 500);
  }
}

/**
 * 获取所有文章列表（管理 API）
 */
async function getAdminBlogList(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM blog_posts ORDER BY date DESC`
    ).all();
    
    // 解析 JSON 字段，移除原始 JSON 字段
    const posts = result.results.map(post => {
      const { gallery_json, tags_json, ...rest } = post;
      return {
        ...rest,
        gallery: gallery_json ? JSON.parse(gallery_json) : [],
        tags: tags_json ? JSON.parse(tags_json) : [],
      };
    });
    
    return jsonResponse(posts);
  } catch (error) {
    console.error('Error fetching admin blog list:', error);
    return errorResponse('Failed to fetch blog posts', 500);
  }
}

/**
 * 根据 ID 获取单篇文章（管理 API）
 */
async function getAdminBlogPost(id, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE id = ?`
    ).bind(id).first();
    
    if (!result) {
      return errorResponse('Post not found', 404);
    }
    
    // 解析 JSON 字段
    const post = {
      ...result,
      gallery: result.gallery_json ? JSON.parse(result.gallery_json) : [],
      tags: result.tags_json ? JSON.parse(result.tags_json) : [],
    };
    
    return jsonResponse(post);
  } catch (error) {
    console.error('Error fetching admin blog post:', error);
    return errorResponse('Failed to fetch blog post', 500);
  }
}

/**
 * 创建新文章（管理 API）
 */
async function createBlogPost(request, env) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      subtitle,
      date,
      cover_image,
      gallery,
      tags,
      content_markdown,
    } = body;
    
    // 验证必填字段
    if (!slug || !title || !date || !content_markdown) {
      return errorResponse('Missing required fields', 400);
    }
    
    // 检查 slug 是否已存在
    const existing = await env.DB.prepare(
      `SELECT id FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();
    
    if (existing) {
      return errorResponse('Slug already exists', 409);
    }
    
    // 准备 JSON 字段
    const galleryJson = gallery ? JSON.stringify(gallery) : null;
    const tagsJson = tags ? JSON.stringify(tags) : null;
    
    // 插入数据库
    const result = await env.DB.prepare(
      `INSERT INTO blog_posts (
        slug, title, subtitle, date, cover_image,
        gallery_json, tags_json, content_markdown
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      slug,
      title,
      subtitle || null,
      date,
      cover_image || null,
      galleryJson,
      tagsJson,
      content_markdown
    ).run();
    
    return jsonResponse({
      id: result.meta.last_row_id,
      message: 'Post created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return errorResponse('Failed to create blog post', 500);
  }
}

/**
 * 更新文章（管理 API）
 */
async function updateBlogPost(id, request, env) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      date,
      cover_image,
      gallery,
      tags,
      content_markdown,
    } = body;
    
    // 检查文章是否存在
    const existing = await env.DB.prepare(
      `SELECT id FROM blog_posts WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return errorResponse('Post not found', 404);
    }
    
    // 准备 JSON 字段
    const galleryJson = gallery ? JSON.stringify(gallery) : null;
    const tagsJson = tags ? JSON.stringify(tags) : null;
    
    // 更新数据库
    await env.DB.prepare(
      `UPDATE blog_posts SET
        title = ?,
        subtitle = ?,
        date = ?,
        cover_image = ?,
        gallery_json = ?,
        tags_json = ?,
        content_markdown = ?
      WHERE id = ?`
    ).bind(
      title,
      subtitle || null,
      date,
      cover_image || null,
      galleryJson,
      tagsJson,
      content_markdown,
      id
    ).run();
    
    return jsonResponse({
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return errorResponse('Failed to update blog post', 500);
  }
}

/**
 * 删除文章（管理 API）
 */
async function deleteBlogPost(id, env) {
  try {
    const result = await env.DB.prepare(
      `DELETE FROM blog_posts WHERE id = ?`
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return errorResponse('Post not found', 404);
    }
    
    return jsonResponse({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return errorResponse('Failed to delete blog post', 500);
  }
}

/**
 * 上传图片到 R2（管理 API）
 */
async function uploadImage(request, env) {
  try {
    // 检查认证
    const isAuthenticated = await checkAuth(request, env);
    if (!isAuthenticated) {
      return errorResponse('Unauthorized', 401);
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // 可选指定文件名（例如覆盖简历），否则使用原名+时间戳
    const forceName = formData.get('forceName');
    let fileName;
    if (forceName) {
      fileName = forceName.toString().replace(/[^a-zA-Z0-9.-]/g, '_');
    } else {
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // 清理特殊字符
      const timestamp = Date.now();
      const fileExtension = originalName.split('.').pop() || 'jpg';
      const baseName = originalName.replace(/\.[^/.]+$/, ''); // 移除扩展名
      fileName = `${baseName}-${timestamp}.${fileExtension}`;
    }

    // 验证文件类型（CV 上传允许跳过图片校验）
    const isCvUpload = fileName.toLowerCase().endsWith('.pdf');
    if (!isCvUpload) {
      const isImage =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/gif' ||
        file.type === 'image/webp';
      if (!isImage) {
        return errorResponse('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.', 400);
      }
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 10MB.', 400);
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);

    // 上传到 R2
    if (!env.BLOG_IMAGES) {
      return errorResponse('R2 bucket not configured', 500);
    }

    await env.BLOG_IMAGES.put(fileName, fileContent, {
      httpMetadata: {
        contentType: isCvUpload ? 'application/pdf' : file.type || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000', // 缓存 1 年
      },
    });

    // 生成图片 URL
    // 注意：R2 的公共 URL 需要通过 Worker 或自定义域名访问
    // 这里返回一个可以通过 Worker 访问的路径
    const imageUrl = `/api/images/${fileName}`;

    return jsonResponse({
      url: imageUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return errorResponse('Failed to upload image', 500);
  }
}

/**
 * 从 R2 获取图片（公共 API）
 */
async function getImage(fileName, env) {
  try {
    if (!env.BLOG_IMAGES) {
      return errorResponse('R2 bucket not configured', 500);
    }

    const object = await env.BLOG_IMAGES.get(fileName);

    if (!object) {
      return errorResponse('Image not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Error getting image:', error);
    return errorResponse('Failed to get image', 500);
  }
}

/**
 * 获取 About Me 信息（公共 API）
 */
async function getAboutMe(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT value FROM site_settings WHERE key = 'about_me'`
    ).first();

    if (!result) {
      return jsonResponse(null);
    }

    const aboutMe = JSON.parse(result.value);
    return jsonResponse(aboutMe);
  } catch (error) {
    console.error('Error fetching about me:', error);
    return errorResponse('Failed to fetch about me', 500);
  }
}

/**
 * 获取 About Me 信息（管理 API）
 */
async function getAdminAboutMe(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT value, updated_at FROM site_settings WHERE key = 'about_me'`
    ).first();

    if (!result) {
      return jsonResponse(null);
    }

    return jsonResponse({
      ...JSON.parse(result.value),
      updated_at: result.updated_at,
    });
  } catch (error) {
    console.error('Error fetching admin about me:', error);
    return errorResponse('Failed to fetch about me', 500);
  }
}

/**
 * 更新 About Me 信息（管理 API）
 */
async function updateAboutMe(request, env) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.bio) {
      return errorResponse('Missing required fields (name, bio)', 400);
    }

    const aboutMeData = {
      name: body.name,
      title: body.title || '',
      bio: body.bio,
      headshot: body.headshot || '',
      email: body.email || '',
      socialLinks: body.socialLinks || {},
      researchInterests: body.researchInterests || [],
    };

    // 使用 INSERT OR REPLACE 来更新或创建
    await env.DB.prepare(
      `INSERT OR REPLACE INTO site_settings (key, value, updated_at)
       VALUES ('about_me', ?, unixepoch())`
    ).bind(JSON.stringify(aboutMeData)).run();

    return jsonResponse({
      message: 'About Me updated successfully',
    });
  } catch (error) {
    console.error('Error updating about me:', error);
    return errorResponse('Failed to update about me', 500);
  }
}

/**
 * 获取所有书籍（管理 API）
 */
async function getAdminBooks(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM books ORDER BY display_order ASC, created_at DESC`
    ).all();
    
    return jsonResponse(result.results || []);
  } catch (error) {
    console.error('Error fetching books:', error);
    return errorResponse('Failed to fetch books', 500);
  }
}

/**
 * 获取单本书（管理 API）
 */
async function getAdminBook(id, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM books WHERE id = ?`
    ).bind(id).first();
    
    if (!result) {
      return errorResponse('Book not found', 404);
    }
    
    return jsonResponse(result);
  } catch (error) {
    console.error('Error fetching book:', error);
    return errorResponse('Failed to fetch book', 500);
  }
}

/**
 * 创建新书（管理 API）
 */
async function createBook(request, env) {
  try {
    const body = await request.json();
    const {
      title,
      title_zh,
      cover,
      publisher,
      publication_date,
      isbn,
      short_description,
      full_description_markdown,
      status,
      display_order,
    } = body;
    
    // 验证必填字段
    if (!title) {
      return errorResponse('Missing required field: title', 400);
    }
    
    // 插入数据库
    const result = await env.DB.prepare(
      `INSERT INTO books (
        title, title_zh, cover, publisher, publication_date,
        isbn, short_description, full_description_markdown,
        status, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      title,
      title_zh || null,
      cover || null,
      publisher || null,
      publication_date || null,
      isbn || null,
      short_description || null,
      full_description_markdown || null,
      status || 'published',
      display_order || 0
    ).run();
    
    return jsonResponse({
      id: result.meta.last_row_id,
      message: 'Book created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating book:', error);
    return errorResponse('Failed to create book', 500);
  }
}

/**
 * 更新书籍（管理 API）
 */
async function updateBook(id, request, env) {
  try {
    const body = await request.json();
    const {
      title,
      title_zh,
      cover,
      publisher,
      publication_date,
      isbn,
      short_description,
      full_description_markdown,
      status,
      display_order,
    } = body;
    
    // 检查书籍是否存在
    const existing = await env.DB.prepare(
      `SELECT id FROM books WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return errorResponse('Book not found', 404);
    }
    
    // 更新数据库
    await env.DB.prepare(
      `UPDATE books SET
        title = ?,
        title_zh = ?,
        cover = ?,
        publisher = ?,
        publication_date = ?,
        isbn = ?,
        short_description = ?,
        full_description_markdown = ?,
        status = ?,
        display_order = ?
      WHERE id = ?`
    ).bind(
      title,
      title_zh || null,
      cover || null,
      publisher || null,
      publication_date || null,
      isbn || null,
      short_description || null,
      full_description_markdown || null,
      status || 'published',
      display_order || 0,
      id
    ).run();
    
    return jsonResponse({
      message: 'Book updated successfully',
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return errorResponse('Failed to update book', 500);
  }
}

/**
 * 删除书籍（管理 API）
 */
async function deleteBook(id, env) {
  try {
    const result = await env.DB.prepare(
      `DELETE FROM books WHERE id = ?`
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return errorResponse('Book not found', 404);
    }
    
    return jsonResponse({
      message: 'Book deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return errorResponse('Failed to delete book', 500);
  }
}

/**
 * 获取所有书籍（公共 API）
 */
async function getBooks(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        id,
        title,
        title_zh,
        cover,
        publisher,
        publication_date,
        isbn,
        short_description,
        full_description_markdown,
        status
      FROM books
      ORDER BY display_order ASC, created_at DESC`
    ).all();
    
    return jsonResponse(result.results || []);
  } catch (error) {
    console.error('Error fetching books:', error);
    return errorResponse('Failed to fetch books', 500);
  }
}

/**
 * 获取所有公共参与条目（管理 API）
 */
async function getAdminPublicEngagements(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM public_engagements ORDER BY date DESC, display_order ASC`
    ).all();
    
    // 解析 JSON 字段
    const engagements = result.results.map(item => {
      const { topics_json, ...rest } = item;
      return {
        ...rest,
        topics: topics_json ? JSON.parse(topics_json) : [],
      };
    });
    
    return jsonResponse(engagements);
  } catch (error) {
    console.error('Error fetching public engagements:', error);
    return errorResponse('Failed to fetch public engagements', 500);
  }
}

/**
 * 获取单个公共参与条目（管理 API）
 */
async function getAdminPublicEngagement(id, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM public_engagements WHERE id = ?`
    ).bind(id).first();
    
    if (!result) {
      return errorResponse('Public engagement not found', 404);
    }
    
    const { topics_json, ...rest } = result;
    return jsonResponse({
      ...rest,
      topics: topics_json ? JSON.parse(topics_json) : [],
    });
  } catch (error) {
    console.error('Error fetching public engagement:', error);
    return errorResponse('Failed to fetch public engagement', 500);
  }
}

/**
 * 创建公共参与条目（管理 API）
 */
async function createPublicEngagement(request, env) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      title_en,
      date,
      cover_image,
      audio_url,
      external_link,
      show_notes,
      show_notes_en,
      duration,
      topics,
      display_order,
    } = body;
    
    // 验证必填字段
    if (!type || !title || !date) {
      return errorResponse('Missing required fields (type, title, date)', 400);
    }
    
    const topicsJson = topics ? JSON.stringify(topics) : null;
    
    // 插入数据库
    const result = await env.DB.prepare(
      `INSERT INTO public_engagements (
        type, title, title_en, date, cover_image,
        audio_url, external_link, show_notes, show_notes_en,
        duration, topics_json, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      type,
      title,
      title_en || null,
      date,
      cover_image || null,
      audio_url || null,
      external_link || null,
      show_notes || null,
      show_notes_en || null,
      duration || null,
      topicsJson,
      display_order || 0
    ).run();
    
    return jsonResponse({
      id: result.meta.last_row_id,
      message: 'Public engagement created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating public engagement:', error);
    return errorResponse('Failed to create public engagement', 500);
  }
}

/**
 * 更新公共参与条目（管理 API）
 */
async function updatePublicEngagement(id, request, env) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      title_en,
      date,
      cover_image,
      audio_url,
      external_link,
      show_notes,
      show_notes_en,
      duration,
      topics,
      display_order,
    } = body;
    
    // 检查是否存在
    const existing = await env.DB.prepare(
      `SELECT id FROM public_engagements WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return errorResponse('Public engagement not found', 404);
    }
    
    const topicsJson = topics ? JSON.stringify(topics) : null;
    
    // 更新数据库
    await env.DB.prepare(
      `UPDATE public_engagements SET
        type = ?,
        title = ?,
        title_en = ?,
        date = ?,
        cover_image = ?,
        audio_url = ?,
        external_link = ?,
        show_notes = ?,
        show_notes_en = ?,
        duration = ?,
        topics_json = ?,
        display_order = ?
      WHERE id = ?`
    ).bind(
      type,
      title,
      title_en || null,
      date,
      cover_image || null,
      audio_url || null,
      external_link || null,
      show_notes || null,
      show_notes_en || null,
      duration || null,
      topicsJson,
      display_order || 0,
      id
    ).run();
    
    return jsonResponse({
      message: 'Public engagement updated successfully',
    });
  } catch (error) {
    console.error('Error updating public engagement:', error);
    return errorResponse('Failed to update public engagement', 500);
  }
}

/**
 * 删除公共参与条目（管理 API）
 */
async function deletePublicEngagement(id, env) {
  try {
    const result = await env.DB.prepare(
      `DELETE FROM public_engagements WHERE id = ?`
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return errorResponse('Public engagement not found', 404);
    }
    
    return jsonResponse({
      message: 'Public engagement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting public engagement:', error);
    return errorResponse('Failed to delete public engagement', 500);
  }
}

/**
 * 获取所有公共参与条目（公共 API）
 */
async function getPublicEngagements(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        id,
        type,
        title,
        title_en,
        date,
        cover_image,
        audio_url,
        external_link,
        show_notes,
        show_notes_en,
        duration,
        topics_json
      FROM public_engagements
      ORDER BY date DESC, display_order ASC`
    ).all();
    
    // 解析 JSON 字段
    const engagements = result.results.map(item => {
      const { topics_json, ...rest } = item;
      return {
        ...rest,
        topics: topics_json ? JSON.parse(topics_json) : [],
      };
    });
    
    return jsonResponse(engagements);
  } catch (error) {
    console.error('Error fetching public engagements:', error);
    return errorResponse('Failed to fetch public engagements', 500);
  }
}

// ==================== Papers API ====================

/**
 * 获取所有论文（管理 API）
 */
async function getAdminPapers(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM papers ORDER BY year DESC, CASE WHEN month IS NULL THEN 0 ELSE month END DESC, created_at DESC`
    ).all();
    
    // 处理 tags 字段，确保返回的是数组而不是字符串
    const papers = (result.results || []).map(paper => {
      try {
        paper.tags = paper.tags ? JSON.parse(paper.tags) : [];
      } catch (e) {
        paper.tags = [];
      }
      return paper;
    });
    
    return jsonResponse(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    return errorResponse('Failed to fetch papers', 500);
  }
}

/**
 * 获取单个论文（管理 API）
 */
async function getAdminPaper(id, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM papers WHERE id = ?`
    ).bind(id).first();
    
    if (!result) {
      return errorResponse('Paper not found', 404);
    }
    
    // 处理 tags 字段，确保返回的是数组而不是字符串
    try {
      result.tags = result.tags ? JSON.parse(result.tags) : [];
    } catch (e) {
      result.tags = [];
    }
    
    return jsonResponse(result);
  } catch (error) {
    console.error('Error fetching paper:', error);
    return errorResponse('Failed to fetch paper', 500);
  }
}

/**
 * 创建论文（管理 API）
 */
async function createPaper(request, env) {
  try {
    const body = await request.json();
    const {
      title,
      role,
      journal,
      status,
      issue,
      link,
      year,
      month,
      tags,
    } = body;
    
    // 验证必填字段
    if (!title) {
      return errorResponse('Missing required fields (title)', 400);
    }
    
    // 处理 tags：确保是数组，转换为 JSON 字符串，并规范化（去重、转小写、排序）
    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags
        .map(tag => String(tag).trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // 去重
      normalizedTags.sort(); // 按字母顺序排序
      tagsJson = JSON.stringify(normalizedTags);
    }
    
    // 插入数据库（不再使用category和display_order字段）
    const result = await env.DB.prepare(
      `INSERT INTO papers (
        title, role, journal, status,
        issue, link, year, month, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      title,
      role || null,
      journal || null,
      status || 'published',
      issue || null,
      link || null,
      year || null,
      month || null,
      tagsJson
    ).run();
    
    return jsonResponse({
      id: result.meta.last_row_id,
      message: 'Paper created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating paper:', error);
    return errorResponse('Failed to create paper', 500);
  }
}

/**
 * 更新论文（管理 API）
 */
async function updatePaper(id, request, env) {
  try {
    const body = await request.json();
    const {
      title,
      role,
      journal,
      status,
      issue,
      link,
      year,
      month,
      tags,
    } = body;
    
    // 检查是否存在
    const existing = await env.DB.prepare(
      `SELECT id FROM papers WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return errorResponse('Paper not found', 404);
    }
    
    // 处理 tags：确保是数组，转换为 JSON 字符串，并规范化（去重、转小写、排序）
    let tagsJson = '[]';
    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags
        .map(tag => String(tag).trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // 去重
      normalizedTags.sort(); // 按字母顺序排序
      tagsJson = JSON.stringify(normalizedTags);
    }
    
    // 更新数据库（不再更新category和display_order字段）
    await env.DB.prepare(
      `UPDATE papers SET
        title = ?,
        role = ?,
        journal = ?,
        status = ?,
        issue = ?,
        link = ?,
        year = ?,
        month = ?,
        tags = ?
      WHERE id = ?`
    ).bind(
      title,
      role || null,
      journal || null,
      status || 'published',
      issue || null,
      link || null,
      year || null,
      month || null,
      tagsJson,
      id
    ).run();
    
    return jsonResponse({
      message: 'Paper updated successfully',
    });
  } catch (error) {
    console.error('Error updating paper:', error);
    return errorResponse('Failed to update paper', 500);
  }
}

/**
 * 删除论文（管理 API）
 */
async function deletePaper(id, env) {
  try {
    const result = await env.DB.prepare(
      `DELETE FROM papers WHERE id = ?`
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return errorResponse('Paper not found', 404);
    }
    
    return jsonResponse({
      message: 'Paper deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return errorResponse('Failed to delete paper', 500);
  }
}

/**
 * 获取所有论文标签（公共 API）
 */
async function getPapersTags(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT tags FROM papers WHERE tags IS NOT NULL AND tags != '' AND tags != '[]'`
    ).all();
    
    // 收集所有标签
    const allTags = new Set();
    (result.results || []).forEach(paper => {
      // 从 tags 字段收集
      try {
        const tags = paper.tags ? JSON.parse(paper.tags) : [];
        tags.forEach(tag => {
          const normalizedTag = tag ? tag.trim().toLowerCase() : '';
          if (normalizedTag && normalizedTag.length > 0) {
            allTags.add(normalizedTag);
          }
        });
      } catch (e) {
        // 忽略解析错误
      }
    });
    
    // 转换为数组并按字母顺序排序
    const tagsArray = Array.from(allTags).sort();
    
    return jsonResponse(tagsArray);
  } catch (error) {
    console.error('Error fetching papers tags:', error);
    return errorResponse('Failed to fetch papers tags', 500);
  }
}

async function getPapers(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        id,
        title,
        role,
        journal,
        status,
        issue,
        link,
        year,
        month,
        tags,
        created_at
      FROM papers
      ORDER BY year DESC, CASE WHEN month IS NULL THEN 0 ELSE month END DESC, created_at DESC`
    ).all();
    
    // 处理 tags 字段，确保返回的是数组而不是字符串
    const papers = (result.results || []).map(paper => {
      try {
        paper.tags = paper.tags ? JSON.parse(paper.tags) : [];
      } catch (e) {
        paper.tags = [];
      }
      return paper;
    });
    
    return jsonResponse(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    return errorResponse('Failed to fetch papers', 500);
  }
}

// ==================== Courses (Teaching) API ====================

/**
 * 获取所有课程（管理 API）
 */
async function getAdminCourses(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM courses ORDER BY level ASC, display_order ASC`
    ).all();
    
    return jsonResponse(result.results || []);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return errorResponse('Failed to fetch courses', 500);
  }
}

/**
 * 获取单个课程（管理 API）
 */
async function getAdminCourse(id, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM courses WHERE id = ?`
    ).bind(id).first();
    
    if (!result) {
      return errorResponse('Course not found', 404);
    }
    
    return jsonResponse(result);
  } catch (error) {
    console.error('Error fetching course:', error);
    return errorResponse('Failed to fetch course', 500);
  }
}

/**
 * 创建课程（管理 API）
 */
async function createCourse(request, env) {
  try {
    const body = await request.json();
    const {
      level,
      title,
      image,
      description_markdown,
      syllabus_markdown,
      display_order,
    } = body;
    
    // 验证必填字段
    if (!level || !title) {
      return errorResponse('Missing required fields (level, title)', 400);
    }
    
    // 插入数据库
    const result = await env.DB.prepare(
      `INSERT INTO courses (
        level, title, image, description_markdown,
        syllabus_markdown, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      level,
      title,
      image || null,
      description_markdown || null,
      syllabus_markdown || null,
      display_order || 0
    ).run();
    
    return jsonResponse({
      id: result.meta.last_row_id,
      message: 'Course created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating course:', error);
    return errorResponse('Failed to create course', 500);
  }
}

/**
 * 更新课程（管理 API）
 */
async function updateCourse(id, request, env) {
  try {
    const body = await request.json();
    const {
      level,
      title,
      image,
      description_markdown,
      syllabus_markdown,
      display_order,
    } = body;
    
    // 检查是否存在
    const existing = await env.DB.prepare(
      `SELECT id FROM courses WHERE id = ?`
    ).bind(id).first();
    
    if (!existing) {
      return errorResponse('Course not found', 404);
    }
    
    // 更新数据库
    await env.DB.prepare(
      `UPDATE courses SET
        level = ?,
        title = ?,
        image = ?,
        description_markdown = ?,
        syllabus_markdown = ?,
        display_order = ?
      WHERE id = ?`
    ).bind(
      level,
      title,
      image || null,
      description_markdown || null,
      syllabus_markdown || null,
      display_order || 0,
      id
    ).run();
    
    return jsonResponse({
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return errorResponse('Failed to update course', 500);
  }
}

/**
 * 删除课程（管理 API）
 */
async function deleteCourse(id, env) {
  try {
    const result = await env.DB.prepare(
      `DELETE FROM courses WHERE id = ?`
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return errorResponse('Course not found', 404);
    }
    
    return jsonResponse({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return errorResponse('Failed to delete course', 500);
  }
}

/**
 * 获取所有课程（公共 API）
 */
async function getCourses(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        id,
        level,
        title,
        image,
        description_markdown,
        syllabus_markdown,
        display_order
      FROM courses
      ORDER BY level ASC, display_order ASC`
    ).all();
    
    return jsonResponse(result.results || []);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return errorResponse('Failed to fetch courses', 500);
  }
}

/**
 * Worker 主入口
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // 处理 OPTIONS 请求（CORS 预检）
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }
      
      const path = parsePath(request.url);
      const parts = path.split('/').filter(p => p);
      
      // 公共 API 路由
      if (path === '/api/blog' && request.method === 'GET') {
        return getBlogList(env);
      }
      
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'blog' && request.method === 'GET') {
        const slug = parts[2];
        return getBlogPost(slug, env);
      }
      
      // 管理 API 路由（需要认证）
      if (isAdminRequest(path)) {
        // 检查认证
        const isAuthenticated = await checkAuth(request, env);
        if (!isAuthenticated) {
          return errorResponse('Unauthorized', 401);
        }
        
        // GET /api/admin/blog
        if (path === '/api/admin/blog' && request.method === 'GET') {
          return getAdminBlogList(env);
        }
        
        // GET /api/admin/blog/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'blog' && request.method === 'GET') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return getAdminBlogPost(id, env);
        }
        
        // POST /api/admin/blog
        if (path === '/api/admin/blog' && request.method === 'POST') {
          return createBlogPost(request, env);
        }
        
        // PUT /api/admin/blog/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'blog' && request.method === 'PUT') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return updateBlogPost(id, request, env);
        }
        
        // DELETE /api/admin/blog/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'blog' && request.method === 'DELETE') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return deleteBlogPost(id, env);
        }

        // POST /api/admin/upload/image
        if (path === '/api/admin/upload/image' && request.method === 'POST') {
          return uploadImage(request, env);
        }

        // GET /api/admin/about
        if (path === '/api/admin/about' && request.method === 'GET') {
          return getAdminAboutMe(env);
        }

        // PUT /api/admin/about
        if (path === '/api/admin/about' && request.method === 'PUT') {
          return updateAboutMe(request, env);
        }

        // GET /api/admin/books
        if (path === '/api/admin/books' && request.method === 'GET') {
          return getAdminBooks(env);
        }

        // GET /api/admin/books/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'books' && request.method === 'GET') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return getAdminBook(id, env);
        }

        // POST /api/admin/books
        if (path === '/api/admin/books' && request.method === 'POST') {
          return createBook(request, env);
        }

        // PUT /api/admin/books/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'books' && request.method === 'PUT') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return updateBook(id, request, env);
        }

        // DELETE /api/admin/books/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'books' && request.method === 'DELETE') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return deleteBook(id, env);
        }

        // GET /api/admin/public-engagement
        if (path === '/api/admin/public-engagement' && request.method === 'GET') {
          return getAdminPublicEngagements(env);
        }

        // GET /api/admin/public-engagement/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'public-engagement' && request.method === 'GET') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return getAdminPublicEngagement(id, env);
        }

        // POST /api/admin/public-engagement
        if (path === '/api/admin/public-engagement' && request.method === 'POST') {
          return createPublicEngagement(request, env);
        }

        // PUT /api/admin/public-engagement/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'public-engagement' && request.method === 'PUT') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return updatePublicEngagement(id, request, env);
        }

        // DELETE /api/admin/public-engagement/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'public-engagement' && request.method === 'DELETE') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return deletePublicEngagement(id, env);
        }

        // GET /api/admin/papers
        if (path === '/api/admin/papers' && request.method === 'GET') {
          return getAdminPapers(env);
        }

        // GET /api/admin/papers/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'papers' && request.method === 'GET') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return getAdminPaper(id, env);
        }

        // POST /api/admin/papers
        if (path === '/api/admin/papers' && request.method === 'POST') {
          return createPaper(request, env);
        }

        // PUT /api/admin/papers/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'papers' && request.method === 'PUT') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return updatePaper(id, request, env);
        }

        // DELETE /api/admin/papers/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'papers' && request.method === 'DELETE') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return deletePaper(id, env);
        }

        // GET /api/admin/courses
        if (path === '/api/admin/courses' && request.method === 'GET') {
          return getAdminCourses(env);
        }

        // GET /api/admin/courses/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'courses' && request.method === 'GET') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return getAdminCourse(id, env);
        }

        // POST /api/admin/courses
        if (path === '/api/admin/courses' && request.method === 'POST') {
          return createCourse(request, env);
        }

        // PUT /api/admin/courses/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'courses' && request.method === 'PUT') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return updateCourse(id, request, env);
        }

        // DELETE /api/admin/courses/:id
        if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'courses' && request.method === 'DELETE') {
          const id = parseInt(parts[3]);
          if (isNaN(id)) {
            return errorResponse('Invalid ID', 400);
          }
          return deleteCourse(id, env);
        }
      }

      // 公共 API
      // GET /api/about
      if (path === '/api/about' && request.method === 'GET') {
        return getAboutMe(env);
      }

      // GET /api/books
      if (path === '/api/books' && request.method === 'GET') {
        return getBooks(env);
      }

      // GET /api/public-engagement
      if (path === '/api/public-engagement' && request.method === 'GET') {
        return getPublicEngagements(env);
      }

      // GET /api/papers
      if (path === '/api/papers' && request.method === 'GET') {
        return getPapers(env);
      }

      // GET /api/papers/tags
      if (path === '/api/papers/tags' && request.method === 'GET') {
        return getPapersTags(env);
      }

      // GET /api/courses
      if (path === '/api/courses' && request.method === 'GET') {
        return getCourses(env);
      }

      // 公共图片访问 API
      // GET /api/images/:fileName
      if (parts.length >= 3 && parts[0] === 'api' && parts[1] === 'images' && request.method === 'GET') {
        // 处理可能包含路径的文件名（如 subfolder/image.jpg）
        const fileName = parts.slice(2).join('/');
        return getImage(fileName, env);
      }
      
      // 404 处理
      return errorResponse('Not Found', 404);
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(error.message || 'Internal Server Error', 500);
    }
  },
};

