import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBooks.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadBooks = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`加载失败: ${res.status} ${text}`);
      }
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error('加载书籍失败:', e);
      setError(e.message || '加载失败');
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!window.confirm('确认删除该书籍？')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`删除失败: ${res.status} ${text}`);
      }
      await loadBooks();
    } catch (e) {
      console.error('删除失败:', e);
      alert(e.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="admin-books">
        <h2>书籍管理</h2>
        <p>正在加载书籍列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-books">
        <h2>书籍管理</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-books">
      <div className="admin-books-header">
        <h2>书籍管理</h2>
        <div className="admin-books-actions">
          <button onClick={() => navigate('/admin')}>← 返回</button>
          <button onClick={() => navigate('/admin/books/new')}>新增书籍</button>
        </div>
      </div>

      {books.length === 0 ? (
        <p>目前还没有书籍。</p>
      ) : (
        <table className="admin-books-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>中文标题</th>
              <th>出版社</th>
              <th>出版日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.title_zh}</td>
                <td>{book.publisher}</td>
                <td>{book.publication_date}</td>
                <td>{book.status}</td>
                <td className="actions">
                  <button onClick={() => navigate(`/admin/books/${book.id}`)}>
                    编辑
                  </button>
                  <button onClick={() => handleDelete(book.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminBooks;


