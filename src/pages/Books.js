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

  const renderBookItem = (book) => {
    const titleDisplay = book.title || book.title_zh || 'Untitled';
    const cover = resolveImage(book.cover);
    const shortDesc = book.short_description || '';
    const fullDesc = book.full_description_markdown || '';
    const hasUrl = book.url && book.url.trim();
    
    const titleElement = hasUrl ? (
      <a 
        href={book.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="book-title-link"
        onClick={(e) => {
          console.log('Link clicked:', book.url);
          e.stopPropagation();
        }}
      >
        <h2 className="book-title-with-link">{titleDisplay}</h2>
      </a>
    ) : (
      <h2>{titleDisplay}</h2>
    );
    
    return (
      <div key={book.id} className="book-item">
        {book.status && (
          <div className="book-status-watermark">
            {book.status === 'published' ? 'Published' : book.status === 'in_progress' ? 'In Progress' : book.status}
          </div>
        )}
        <div className="book-cover">
          {cover ? <img src={cover} alt={titleDisplay} /> : null}
        </div>
        <div className="book-right">
          <div className="book-title-section">
            {titleElement}
            <div className="book-metadata">
              <div className="book-metadata-row">
                <span>{book.publisher}</span>
                {book.publication_date ? <span>{book.publication_date}</span> : null}
              </div>
              {(book.authors && book.authors.trim()) || book.role ? (
                <div className="book-metadata-row">
                  {book.authors && book.authors.trim() && (
                    <span className="book-authors">{book.authors.trim()}</span>
                  )}
                  {book.role && (
                    <span className="book-role">
                      {book.role === 'Author' ? ' as author.' : book.role === 'Editor' ? ' as editor.' : `As ${book.role}.`}
                    </span>
                  )}
                </div>
              ) : null}
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="books">
        <div className="books-content"><p>Loading...</p></div>
      </div>
    );
  }

  const isError = !!error;

  // 按publication_type分类书籍
  const publicationTypes = ['Special Issue', 'Edited Volume', 'Monograph'];
  
  const booksByType = {};
  
  (books || []).forEach(book => {
    const type = book.publication_type || 'Other';
    if (!booksByType[type]) {
      booksByType[type] = [];
    }
    booksByType[type].push(book);
  });

  // 对每个类型的书籍进行排序
  Object.keys(booksByType).forEach(type => {
    booksByType[type].sort((a, b) => {
      // 按出版时间排序，由新到旧
      const dateA = a.publication_date ? a.publication_date.trim() : '';
      const dateB = b.publication_date ? b.publication_date.trim() : '';
      
      // 如果两个都没有日期，保持原顺序
      if (!dateA && !dateB) return 0;
      
      // 没有日期的排在后面
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // 对于标准日期格式 YYYY-MM-DD，直接字符串比较即可（降序）
      // 这样可以正确处理日期排序
      if (dateA.match(/^\d{4}-\d{2}-\d{2}$/) && dateB.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // 标准日期格式，直接字符串比较（降序：新的在前）
        return dateB.localeCompare(dateA);
      }
      
      // 对于其他格式，尝试转换为Date对象比较
      try {
        const parsedA = new Date(dateA);
        const parsedB = new Date(dateB);
        if (!isNaN(parsedA.getTime()) && !isNaN(parsedB.getTime())) {
          return parsedB - parsedA; // 降序：新的在前
        }
      } catch (e) {
        // 如果解析失败，使用字符串比较作为后备
      }
      
      // 最后使用字符串比较作为后备
      return dateB.localeCompare(dateA);
    });
  });

  // 按照publicationTypes的顺序，再加上其他类型
  const sortedTypes = [
    ...publicationTypes.filter(type => booksByType[type] && booksByType[type].length > 0),
    ...Object.keys(booksByType).filter(type => !publicationTypes.includes(type) && booksByType[type].length > 0)
  ];

  return (
    <div className="books">
      <div className="books-content">
        {isError ? (
          <p className="error">
            {error || '加载失败，请稍后重试或检查后端接口 /api/books'}
          </p>
        ) : (
          <>
            {sortedTypes.length > 0 ? (
              sortedTypes.map(type => (
                <div key={type} className="books-section">
                  <h2 className="section-title">{type} × {booksByType[type].length}</h2>
                  {booksByType[type].map(renderBookItem)}
                </div>
              ))
            ) : (
              <p className="error">暂无书籍数据</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Books; 