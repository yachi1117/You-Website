import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPublicEngagement.css';

// 本地开发时如果未设置 REACT_APP_API_URL，则直接使用线上 Worker URL，避免请求落到 3001 导致返回 HTML
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function AdminPublicEngagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resolveImage = (src) => {
    if (!src) return '';
    if (src.startsWith('/api/images/')) return `${API_BASE_URL}${src}`;
    return src;
  };

  const loadItems = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/public-engagement`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`加载失败: ${res.status} ${text}`);
      }
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('加载公共参与失败:', e);
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!window.confirm('确认删除该条目？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/public-engagement/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`删除失败: ${res.status} ${text}`);
      }
      await loadItems();
    } catch (e) {
      console.error('删除失败:', e);
      alert(e.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="admin-pe">
        <h2>公共参与管理</h2>
        <p>正在加载列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-pe">
        <h2>公共参与管理</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-pe">
      <div className="admin-pe-header">
        <h2>公共参与管理</h2>
        <div className="admin-pe-actions">
          <button onClick={() => navigate('/admin')}>← 返回</button>
          <button onClick={() => navigate('/admin/public-engagement/new')}>
            新增条目
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p>目前还没有数据。</p>
      ) : (
        <div className="pe-row-list">
          {items.map((item) => (
            <div key={item.id} className="pe-row">
              <div className="pe-row-cover">
                {item.cover_image ? (
                  <img src={resolveImage(item.cover_image)} alt={item.title} />
                ) : (
                  <div className="no-cover">无封面</div>
                )}
              </div>
              <div className="pe-row-type">{item.type}</div>
              <div className="pe-row-title">{item.title}</div>
              <div className="pe-row-date">{item.date}</div>
              <div className="pe-row-actions">
                <button onClick={() => navigate(`/admin/public-engagement/${item.id}`)}>
                  编辑
                </button>
                <button onClick={() => handleDelete(item.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPublicEngagement;


