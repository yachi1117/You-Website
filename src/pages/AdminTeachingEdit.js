import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './AdminTeachingEdit.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminTeachingEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const imageFileInputRef = useRef(null);

  const [form, setForm] = useState({
    level: '',
    title: '',
    image: '',
    description_markdown: '',
    syllabus_markdown: '',
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
        const res = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          level: data.level || '',
          title: data.title || '',
          image: data.image || '',
          description_markdown: data.description_markdown || '',
          syllabus_markdown: data.syllabus_markdown || '',
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
        `${API_BASE_URL}/api/admin/courses${isNew ? '' : `/${id}`}`,
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
      navigate('/admin/teaching');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 上传课程图片到 R2
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

  const handleImageDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert(err.message || '图片上传失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert(err.message || '图片上传失败');
    } finally {
      setSaving(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="admin-teaching-edit">
        <h2>课程{isNew ? '创建' : '编辑'}</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-teaching-edit">
      <h2>课程{isNew ? '创建' : '编辑'}</h2>
      {error && <div className="error">{error}</div>}

      <form className="admin-teaching-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>课程层次 (undergraduate / postgraduate)</label>
          <input
            name="level"
            value={form.level}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>课程名称</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>课程封面图 URL</label>
          <div
            className="cover-uploader"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
          >
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="/api/images/... 或 https://..."
            />
            <div className="cover-actions">
              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                disabled={saving}
              >
                选择文件
              </button>
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                style={{ display: 'none' }}
              />
              <span className="hint">可拖拽到此区域或点击选择</span>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>课程简介（Markdown）</label>
          <div className="content-row">
            <div className="markdown-editor">
              <textarea
                name="description_markdown"
                value={form.description_markdown}
                onChange={handleChange}
                rows={8}
              />
            </div>
            <div className="markdown-preview">
              <div className="preview-title">预览</div>
              <div className="preview-body">
                <ReactMarkdown>
                  {form.description_markdown || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>课程大纲（Markdown）</label>
          <div className="content-row">
            <div className="markdown-editor">
              <textarea
                name="syllabus_markdown"
                value={form.syllabus_markdown}
                onChange={handleChange}
                rows={10}
              />
            </div>
            <div className="markdown-preview">
              <div className="preview-title">预览</div>
              <div className="preview-body">
                <ReactMarkdown>
                  {form.syllabus_markdown || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>显示顺序</label>
          <input
            name="display_order"
            type="number"
            value={form.display_order}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/teaching')}>
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

export default AdminTeachingEdit;


