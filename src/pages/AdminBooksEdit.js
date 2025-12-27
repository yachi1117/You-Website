import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './AdminBooksEdit.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminBooksEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const coverFileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    title_zh: '',
    cover: '',
    publisher: '',
    publication_date: '',
    isbn: '',
    short_description: '',
    full_description_markdown: '',
    status: 'published',
    display_order: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (isNew) return;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/admin/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          title: data.title || '',
          title_zh: data.title_zh || '',
          cover: data.cover || '',
          publisher: data.publisher || '',
          publication_date: data.publication_date || '',
          isbn: data.isbn || '',
          short_description: data.short_description || '',
          full_description_markdown: data.full_description_markdown || '',
          status: data.status || 'published',
          display_order: data.display_order || 0,
        });
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }

    load();
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
        ...form,
        display_order: Number(form.display_order) || 0,
      };

      const res = await fetch(
        `${API_BASE_URL}/api/admin/books${isNew ? '' : `/${id}`}`,
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

      navigate('/admin/books');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 上传图片到 Worker（R2），字段名 image
  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('请选择图片文件');
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return '';
    }
    const formData = new FormData();
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

  const handleCoverDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, cover: url }));
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
      setForm((prev) => ({ ...prev, cover: url }));
    } catch (err) {
      alert(err.message || '封面上传失败');
    } finally {
      setSaving(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="admin-books-edit">
        <h2>书籍{isNew ? '创建' : '编辑'}</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-books-edit">
      <h2>书籍{isNew ? '创建' : '编辑'}</h2>
      {error && <div className="error">{error}</div>}

      <form className="admin-books-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>英文标题</label>
          <input
            name="title"
            value={form.title}
            onChange={e => handleChange(e)}
            required
          />
        </div>
        <div className="form-row">
          <label>中文标题</label>
          <input
            name="title_zh"
            value={form.title_zh}
            onChange={e => handleChange(e)}
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
              name="cover"
              value={form.cover}
              onChange={e => handleChange(e)}
              placeholder="/api/images/... 或 https://..."
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
          <label>出版社</label>
          <input
            name="publisher"
            value={form.publisher}
            onChange={e => handleChange(e)}
          />
        </div>
        <div className="form-row">
          <label>出版日期</label>
          <input
            name="publication_date"
            value={form.publication_date}
            onChange={e => handleChange(e)}
            placeholder="2024-01-01"
          />
        </div>
        <div className="form-row">
          <label>ISBN</label>
          <input
            name="isbn"
            value={form.isbn}
            onChange={e => handleChange(e)}
          />
        </div>
        <div className="form-row">
          <label>简要描述</label>
          <textarea
            name="short_description"
            value={form.short_description}
            onChange={e => handleChange(e)}
            rows={3}
          />
        </div>
        <div className="form-row">
          <label>详细描述（Markdown）</label>
          <div className="content-row">
            <div className="markdown-editor">
              <textarea
                name="full_description_markdown"
                value={form.full_description_markdown}
                onChange={e => handleChange(e)}
                rows={10}
              />
            </div>
            <div className="markdown-preview">
              <div className="preview-title">预览</div>
              <div className="preview-body">
                <ReactMarkdown>
                  {form.full_description_markdown || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>状态</label>
          <select
            name="status"
            value={form.status}
            onChange={e => handleChange(e)}
          >
            <option value="published">已出版</option>
            <option value="in_progress">创作中</option>
          </select>
        </div>
        <div className="form-row">
          <label>显示顺序（数字越小越靠前）</label>
          <input
            name="display_order"
            type="number"
            value={form.display_order}
            onChange={e => handleChange(e)}
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/books')}>
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

export default AdminBooksEdit;


