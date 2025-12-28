import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTeaching.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function AdminTeaching() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadCourses = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`加载失败: ${res.status} ${text}`);
      }
      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error('加载课程失败:', e);
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!window.confirm('确认删除该课程？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`删除失败: ${res.status} ${text}`);
      }
      await loadCourses();
    } catch (e) {
      console.error('删除失败:', e);
      alert(e.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="admin-teaching">
        <h2>课程管理</h2>
        <p>正在加载课程列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-teaching">
        <h2>课程管理</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-teaching">
      <div className="admin-teaching-header">
        <h2>课程管理</h2>
        <div className="admin-teaching-actions">
          <button onClick={() => navigate('/admin')}>← 返回</button>
          <button onClick={() => navigate('/admin/teaching/new')}>新增课程</button>
        </div>
      </div>

      {courses.length === 0 ? (
        <p>目前还没有课程。</p>
      ) : (
        <table className="admin-teaching-table">
          <thead>
            <tr>
              <th>层次</th>
              <th>课程名称</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.level}</td>
                <td>{c.title}</td>
                <td>{c.display_order}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/admin/teaching/${c.id}`)}>
                    编辑
                  </button>
                  <button onClick={() => handleDelete(c.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminTeaching;
