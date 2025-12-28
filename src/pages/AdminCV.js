import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAbout.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function AdminCV() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file); // 后端字段名为 image
    formData.append('forceName', 'cv.pdf'); // 覆盖为固定文件名
    try {
      setUploading(true);
      setError('');
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
      setCvUrl(`${API_BASE_URL}${data.url}`);
    } catch (e) {
      console.error('上传失败', e);
      setError(e.message || '上传失败');
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

  const onDragOver = (e) => e.preventDefault();

  return (
    <div className="admin-about">
      <h2>CV 管理</h2>
      {error && <div className="error">{error}</div>}
      <div className="admin-about-form">
        <div className="form-row">
          <label>上传新的 CV（PDF，覆盖旧文件）</label>
          <div
            className="upload-dropzone"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <p>拖拽 PDF 到此或点击选择文件（将覆盖为 cv.pdf）</p>
            <button
              type="button"
              onClick={() => document.getElementById('cv-file-input')?.click()}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '选择 PDF'}
            </button>
            <input
              id="cv-file-input"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={onFileInputChange}
            />
          </div>
        </div>
        {cvUrl && (
          <div className="form-row">
            <label>最新文件链接</label>
            <a href={cvUrl} target="_blank" rel="noreferrer">
              {cvUrl}
            </a>
          </div>
        )}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin')}>
            返回
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCV;

