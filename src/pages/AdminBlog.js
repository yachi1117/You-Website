import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBlog.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadPosts = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`加载失败: ${res.status} ${text}`);
      }
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error('加载博客列表失败:', e);
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!window.confirm('确认删除该文章？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`删除失败: ${res.status} ${text}`);
      }
      await loadPosts();
    } catch (e) {
      console.error('删除失败:', e);
      alert(e.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="admin-blog">
        <h2>博客管理</h2>
        <p>正在加载博客列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-blog">
        <h2>博客管理</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-blog">
      <div className="admin-blog-header">
        <h2>博客管理</h2>
        <div className="admin-blog-actions">
          <button onClick={() => navigate('/admin')}>← 返回</button>
          <button onClick={() => navigate('/admin/blog/new')}>新增文章</button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p>目前还没有文章。</p>
      ) : (
        <table className="admin-blog-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>日期</th>
              <th>Slug</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.date}</td>
                <td>{post.slug}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/admin/blog/${post.id}`)}>
                    编辑
                  </button>
                  <button onClick={() => handleDelete(post.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminBlog;


