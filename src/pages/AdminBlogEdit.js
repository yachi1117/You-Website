import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './AdminBlogEdit.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminBlogEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const coverFileInputRef = useRef(null);
  const contentRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    date: '',
    cover_image: '',
    tags: '',
    content_markdown: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (isNew) return;

    async function fetchPost() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          title: data.title || '',
          subtitle: data.subtitle || '',
          slug: data.slug || '',
          date: data.date || '',
          cover_image: data.cover_image || '',
          tags: (data.tags || []).join(','),
          content_markdown: data.content_markdown || '',
        });
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setSaving(true);
      setError('');

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug,
        date: form.date,
        cover_image: form.cover_image,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        content_markdown: form.content_markdown,
      };

      const res = await fetch(
        `${API_BASE_URL}/api/admin/blog${isNew ? '' : `/${id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`保存失败: ${res.status} ${text}`);
      }

      navigate('/admin/blog');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 上传图片到 Worker（Cloudflare R2），返回 URL（原始文件名 + 时间戳）
  const uploadImage = async (file) => {
    // 仅接受图片
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('请选择图片文件');
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return '';
    }
    const formData = new FormData();
    // 后端 uploadImage 期望字段名为 "image"
    formData.append('image', file);
    const res = await fetch(`${API_BASE_URL}/api/admin/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`上传失败: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.url;
  };

  // 从拖拽事件中获取文件（兼容 items / files）
  const extractFileFromEvent = (e) => {
    if (e.dataTransfer?.files?.length) {
      return e.dataTransfer.files[0];
    }
    if (e.dataTransfer?.items?.length) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file') {
        return item.getAsFile();
      }
    }
    return null;
  };

  const insertAtCursor = (text) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setForm((prev) => ({
        ...prev,
        content_markdown: prev.content_markdown
          ? `${prev.content_markdown}\n\n${text}`
          : text,
      }));
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = form.content_markdown || '';
    const next =
      current.slice(0, start) + text + current.slice(end, current.length);
    setForm((prev) => ({ ...prev, content_markdown: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleContentDrop = async (e) => {
    e.preventDefault();
    const file = extractFileFromEvent(e);
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      const markdownToInsert = `![${file.name}](${url})`;
      insertAtCursor(markdownToInsert);
    } catch (err) {
      alert(err.message || '上传失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverDrop = async (e) => {
    e.preventDefault();
    const file = extractFileFromEvent(e);
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      alert(err.message || '封面上传失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      alert(err.message || '封面上传失败');
    } finally {
      setSaving(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="admin-blog-edit">
        <h2>博客 {isNew ? '创建' : '编辑'}</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-blog-edit">
      <h2>博客{isNew ? '创建' : '编辑'}</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-blog-form">
        <div className="form-row">
          <label>标题</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>副标题</label>
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>日期 (YYYY-MM-DD)</label>
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            placeholder="2024-01-01"
          />
        </div>
        <div className="form-row">
          <label>封面图 URL</label>
          <div
            className="cover-uploader"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCoverDrop}
          >
            <input
              name="cover_image"
              value={form.cover_image}
              onChange={handleChange}
              placeholder="/api/images/xxx.jpg 或 https://..."
            />
            <div className="cover-actions">
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={saving}
              >
                选择文件
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFile}
                style={{ display: 'none' }}
              />
              <span className="hint">可拖拽到此区域或点击选择</span>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>标签（用逗号分隔）</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="tag1,tag2"
          />
        </div>
        <div className="form-row">
          <label>正文（Markdown）</label>
          <div className="content-row">
            <div
              className="content-uploader"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleContentDrop}
            >
              <textarea
                ref={contentRef}
                name="content_markdown"
                value={form.content_markdown}
                onChange={handleChange}
                rows={18}
                required
              />
              <div className="drop-hint">
                将图片拖拽到此区域可自动上传并插入 Markdown
              </div>
            </div>
            <div className="preview">
              <div className="preview-title">实时预览</div>
              <div className="preview-body">
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => {
                      const src = props.src || '';
                      const resolvedSrc = src.startsWith('/api/images/')
                        ? `${API_BASE_URL}${src}`
                        : src;
                      return <img {...props} src={resolvedSrc} alt={props.alt} />;
                    },
                  }}
                >
                  {form.content_markdown || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="markdown-tips">
          <div className="tips-title">Markdown 快速提示</div>
          <ul>
            <li>标题：<code># 一级</code> <code>## 二级</code> <code>### 三级</code></li>
            <li>加粗 / 斜体：<code>**粗体**</code>，<code>*斜体*</code></li>
            <li>列表：<code>- 列表项</code> 或 <code>1. 列表项</code></li>
            <li>图片：<code>![描述](图片链接)</code>（拖拽上传会自动插入）</li>
            <li>链接：<code>[文本](https://example.com)</code></li>
          </ul>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/blog')}>
            取消
          </button>
          <button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminBlogEdit;

