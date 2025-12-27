import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPapers.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function AdminPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadPapers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/papers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`加载失败: ${res.status} ${text}`);
      }
      const data = await res.json();
      setPapers(data);
    } catch (e) {
      console.error('加载论文失败:', e);
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!window.confirm('确认删除该论文条目？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/papers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`删除失败: ${res.status} ${text}`);
      }
      await loadPapers();
    } catch (e) {
      console.error('删除失败:', e);
      alert(e.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="admin-papers">
        <h2>论文管理</h2>
        <p>正在加载论文列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-papers">
        <h2>论文管理</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-papers">
      <div className="admin-papers-header">
        <h2>论文管理</h2>
        <div className="admin-papers-actions">
          <button onClick={() => navigate('/admin')}>← 返回</button>
          <button onClick={() => navigate('/admin/papers/new')}>新增论文</button>
        </div>
      </div>

      {papers.length === 0 ? (
        <p>目前还没有论文记录。</p>
      ) : (
        <table className="admin-papers-table">
          <thead>
            <tr>
              <th>类别</th>
              <th>标题</th>
              <th>期刊</th>
              <th>年份</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.id}>
                <td>{p.category}</td>
                <td>{p.title}</td>
                <td>{p.journal}</td>
                <td>{p.year}</td>
                <td>{p.status}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/admin/papers/${p.id}`)}>
                    编辑
                  </button>
                  <button onClick={() => handleDelete(p.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPapers;


