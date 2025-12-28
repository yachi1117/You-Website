import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || 'your-secret-token';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否已登录（从 localStorage）
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // 简单的密码验证（生产环境应该使用更安全的方式）
    if (password === ADMIN_TOKEN) {
      localStorage.setItem('admin_token', ADMIN_TOKEN);
      setIsAuthenticated(true);
    } else {
      setError('密码错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>管理后台登录</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">密码:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit">登录</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>网站管理后台</h1>
        <button onClick={handleLogout} className="logout-btn">退出登录</button>
      </div>
      <div className="admin-nav-grid">
        <div className="nav-card" onClick={() => navigate('/admin/blog')}>
          <div className="nav-icon">📝</div>
          <div className="nav-title">博客管理</div>
          <div className="nav-desc">管理博客文章</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/about')}>
          <div className="nav-icon">👤</div>
          <div className="nav-title">About Me</div>
          <div className="nav-desc">编辑个人信息</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/cv')}>
          <div className="nav-icon">📄</div>
          <div className="nav-title">CV 上传</div>
          <div className="nav-desc">更新 / 覆盖个人简历</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/books')}>
          <div className="nav-icon">📚</div>
          <div className="nav-title">书籍管理</div>
          <div className="nav-desc">管理出版的书籍</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/papers')}>
          <div className="nav-icon">📄</div>
          <div className="nav-title">论文管理</div>
          <div className="nav-desc">管理学术论文</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/teaching')}>
          <div className="nav-icon">🎓</div>
          <div className="nav-title">课程管理</div>
          <div className="nav-desc">管理教学课程</div>
        </div>
        <div className="nav-card" onClick={() => navigate('/admin/public-engagement')}>
          <div className="nav-icon">🎤</div>
          <div className="nav-title">公共参与</div>
          <div className="nav-desc">管理播客和公共活动</div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

