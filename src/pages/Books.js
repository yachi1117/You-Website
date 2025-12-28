import React, { useEffect, useState } from 'react';
import './Books.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/Footer';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function Books() {
  const [expandedBook, setExpandedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const resolveImage = (raw) => {
    if (!raw) return '';
    const src = raw.trim();
    // 已是绝对地址
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return src;
    // R2 透传
    if (src.startsWith('/api/images/')) return `${API_BASE_URL}${src}`;
    // 静态资源：常见几种写法
    if (src.startsWith('/assets/images/')) return src.replace('/assets/images/', '/images/');
    if (src.startsWith('assets/images/')) return src.replace('assets/images/', '/images/');
    if (src.startsWith('/images/')) return src;
    if (src.startsWith('images/')) return `/${src}`;
    // 兜底原样返回
    return src;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/books`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || '加载失败');
        }
        const data = await res.json();
        console.log('Books API response:', data);
        setBooks(data || []);
      } catch (e) {
        console.error('Books API error:', e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleDescription = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  if (loading) {
    return (
      <div className="books">
        <div className="books-content"><p>Loading...</p></div>
      </div>
    );
  }

  const isError = !!error || !books || books.length === 0;

  return (
    <div className="books">
      <div className="books-content">
        {isError ? (
          <p className="error">
            {error ? `Error: ${error}` : '暂无书籍数据，请稍后重试或检查后端接口 /api/books'}
          </p>
        ) : (
          books.map((book) => {
            const titleDisplay = book.title || book.title_zh || 'Untitled';
            const cover = resolveImage(book.cover);
            const shortDesc = book.short_description || '';
            const fullDesc = book.full_description_markdown || '';
            return (
          <div key={book.id} className="book-item">
            <div className="book-header">
              <div className="book-cover">
                    {cover ? <img src={cover} alt={titleDisplay} /> : null}
              </div>
              <div className="book-title-section">
                    <h2>{titleDisplay}</h2>
                <div className="book-metadata">
                  <span>{book.publisher}</span>
                      {book.publication_date ? <span>{book.publication_date}</span> : null}
                </div>
              </div>
            </div>
            <div className="book-description">
                  {expandedBook === book.id ? (
                    <ReactMarkdown>{fullDesc || shortDesc || '暂无内容'}</ReactMarkdown>
                  ) : (
                    <p>{shortDesc || '暂无简介'}</p>
                  )}
                  {fullDesc && (
              <button 
                className="expand-button"
                onClick={() => toggleDescription(book.id)}
                      aria-label={expandedBook === book.id ? 'Show less' : 'Show more'}
              >
                {expandedBook === book.id ? <FaMinus /> : <FaPlus />}
              </button>
                  )}
            </div>
          </div>
            );
          })
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Books; 