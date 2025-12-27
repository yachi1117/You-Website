import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAbout.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminAbout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    title: '',
    bio: '',
    headshot: '',
    email: '',
    googleScholar: '',
    linkedIn: '',
    researchGate: '',
    researchInterests: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/admin/about`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 404) {
            // 没有数据也可以正常编辑
            setLoading(false);
            return;
          }
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          name: data.name || '',
          title: data.title || '',
          bio: data.displayBio || data.bio || '',
          headshot: data.headshot || '',
          email: data.email || '',
          googleScholar: data.socialLinks?.googleScholar || '',
          linkedIn: data.socialLinks?.linkedIn || '',
          researchGate: data.socialLinks?.researchGate || '',
          researchInterests: (data.researchInterests || []).join(','),
        });
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '上传失败');
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, headshot: data.url || prev.headshot }));
    } catch (e) {
      console.error('上传失败', e);
      alert(e.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
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
        name: form.name,
        title: form.title,
        bio: form.bio,
        headshot: form.headshot,
        email: form.email,
        socialLinks: {
          googleScholar: form.googleScholar,
          linkedIn: form.linkedIn,
          researchGate: form.researchGate,
        },
        researchInterests: form.researchInterests
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${API_BASE_URL}/api/admin/about`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`保存失败: ${res.status} ${text}`);
      }

      alert('保存成功');
      navigate('/admin');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-about">
        <h2>About Me 管理</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-about">
      <h2>About Me 管理</h2>
      {error && <div className="error">{error}</div>}
      <form className="admin-about-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>姓名</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>头衔（Title）</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>个人简介（支持多行）</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={8}
            required
          />
        </div>
        <div className="form-row">
          <label>头像图片 URL</label>
          <input
            name="headshot"
            value={form.headshot}
            onChange={handleChange}
            placeholder="/assets/images/... 或 https://..."
          />
          <div
            className="upload-dropzone"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <p>拖拽图片到此或点击上传（支持 jpg/png/gif/webp，≤10MB）</p>
            <button
              type="button"
              onClick={() => document.getElementById('headshot-file-input')?.click()}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '选择文件'}
            </button>
            <input
              id="headshot-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFileInputChange}
            />
          </div>
        </div>
        <div className="form-row">
          <label>邮箱</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Google Scholar 链接</label>
          <input
            name="googleScholar"
            value={form.googleScholar}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>LinkedIn 链接</label>
          <input
            name="linkedIn"
            value={form.linkedIn}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>ResearchGate 链接</label>
          <input
            name="researchGate"
            value={form.researchGate}
            onChange={handleChange}
          />
        </div>
        <div className="form-row research-section">
          <label>研究兴趣（逗号分隔）</label>
          <input
            name="researchInterests"
            value={form.researchInterests}
            onChange={handleChange}
            placeholder="如：Migration, Border Studies, Digital Economy"
          />
          <p className="tip">多个请用英文逗号分隔，保存后前台会以标签形式显示</p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin')}>
            返回
          </button>
          <button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAbout;


