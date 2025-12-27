import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminPapersEdit.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminPapersEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: 'special_issues',
    title: '',
    role: '',
    journal: '',
    status: 'published',
    issue: '',
    link: '',
    year: '',
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
        const res = await fetch(`${API_BASE_URL}/api/admin/papers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`加载失败: ${res.status} ${text}`);
        }
        const data = await res.json();
        setForm({
          category: data.category || 'special_issues',
          title: data.title || '',
          role: data.role || '',
          journal: data.journal || '',
          status: data.status || 'published',
          issue: data.issue || '',
          link: data.link || '',
          year: data.year || '',
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
        year: form.year ? Number(form.year) : null,
        display_order: Number(form.display_order) || 0,
      };
      const res = await fetch(
        `${API_BASE_URL}/api/admin/papers${isNew ? '' : `/${id}`}`,
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
      navigate('/admin/papers');
    } catch (e) {
      console.error(e);
      setError(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-papers-edit">
        <h2>论文{isNew ? '创建' : '编辑'}</h2>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="admin-papers-edit">
      <h2>论文{isNew ? '创建' : '编辑'}</h2>
      {error && <div className="error">{error}</div>}

      <form className="admin-papers-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>类别</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="special_issues">Special Issues</option>
            <option value="immigrant_entrepreneurship">Immigrant Entrepreneurship</option>
            <option value="migration_and_border">Migration and Border Studies</option>
            <option value="ethnic_studies">Ethnic Studies</option>
            <option value="platform_studies">Platform Studies</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className=" form-row">
          <label>标题</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>{form.category === 'special_issues' ? '角色（Guest Editor 等）' : '作者/角色'}</label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder={form.category === 'special_issues' ? 'Guest Editor / Co-Guest Editor' : '作者列表（可含逗号）'}
          />
        </div>
        <div className="form-row">
          <label>期刊/出版物</label>
          <input
            name="journal"
            value={form.journal}
            onChange={handleChange}
            placeholder="如：Comparative Migration Studies (Q1)"
          />
        </div>
        <div className="form-row">
          <label>状态</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="published">已发表</option>
            <option value="in_progress">进行中</option>
          </select>
        </div>
        <div className="form-row">
          <label>{form.category === 'special_issues' ? '卷/期' : '卷/期/页码'}</label>
          <input
            name="issue"
            value={form.issue}
            onChange={handleChange}
            placeholder={form.category === 'special_issues' ? '如：139 / 36(3)' : '如：2021(6), 22-27'}
          />
        </div>
        <div className="form-row">
          <label>链接</label>
          <input
            name="link"
            value={form.link}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>年份</label>
          <input
            name="year"
            type="number"
            value={form.year}
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
          <button type="button" onClick={() => navigate('/admin/papers')}>
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

export default AdminPapersEdit;


