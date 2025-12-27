import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './AdminPublicEngagementEdit.css';

// 本地开发时如果未设置 REACT_APP_API_URL，则直接使用线上 Worker URL，避免请求落到 3001 导致返回 HTML
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminPublicEngagementEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const coverFileInputRef = useRef(null);

  const [form, setForm] = useState({
    type: '',
    title: '',
    title_en: '',
    date: '',
    cover_image: '',
    audio_url: '',
    external_link: '',
    show_notes: '',
    show_notes_en: '',
    duration: '',
    topics: '',
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
        const res = await fetch(
          `${API_BASE_URL}/api/admin/public-engagement/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          type: data.type || '',
          title: data.title || '',
          title_en: data.title_en || '',
          date: data.date || '',
          cover_image: data.cover_image || '',
          audio_url: data.audio_url || '',
          external_link: data.external_link || '',
          show_notes: data.show_notes || '',
          show_notes_en: data.show_notes_en || '',
          duration: data.duration || '',
          topics: (data.topics || []).join(','),
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
        topics: form.topics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        display_order: Number(form.display_order) || 0,
      };
      const res = await fetch(
        `${API_BASE_URL}/api/admin/public-engagement${isNew ? '' : `/${id}`}`,
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
      navigate('/admin/public-engagement');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 上传图片到 R2
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
      <div className="admin-pe-edit">
        <h2>公共参与{isNew ? '创建' : '编辑'}</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-pe-edit">
      <h2>公共参与{isNew ? '创建' : '编辑'}</h2>
      {error && <div className="error">{error}</div>}

      <form className="admin-pe-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>类型</label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>标题（中文）</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>标题（英文）</label>
          <input
            name="title_en"
            value={form.title_en}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>日期 (YYYY-MM-DD)</label>
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            required
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
          <label>音频链接</label>
          <input
            name="audio_url"
            value={form.audio_url}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>外部链接</label>
          <input
            name="external_link"
            value={form.external_link}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>节目简介</label>
          <div className="content-row">
            <div className="markdown-editor">
              <textarea
                name="show_notes"
                value={form.show_notes}
                onChange={handleChange}
                rows={6}
              />
            </div>
            <div className="markdown-preview">
              <div className="preview-title">预览</div>
              <div className="preview-body">
                <ReactMarkdown>
                  {form.show_notes || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>节目简介（英文）</label>
          <div className="content-row">
            <div className="markdown-editor">
              <textarea
                name="show_notes_en"
                value={form.show_notes_en}
                onChange={handleChange}
                rows={6}
              />
            </div>
            <div className="markdown-preview">
              <div className="preview-title">预览</div>
              <div className="preview-body">
                <ReactMarkdown>
                  {form.show_notes_en || '_暂无内容_'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>时长</label>
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>主题标签（逗号分隔）</label>
          <input
            name="topics"
            value={form.topics}
            onChange={handleChange}
          />
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
          <button
            type="button"
            onClick={() => navigate('/admin/public-engagement')}
          >
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

export default AdminPublicEngagementEdit;


