import React, { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard';
import './Blog.css';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// API 基础 URL（开发环境使用本地，生产环境使用 Worker URL）
// 优先使用构建时注入的 REACT_APP_API_URL，否则回退到线上 Worker URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';
const PLACEHOLDER_IMAGE = '/images/blog1a.jpeg';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/blog`);
        if (!response.ok) {
          throw new Error('Failed to load blog posts');
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error loading blog list:', err);
        setError(err.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const resolveImage = (src) => {
    if (!src) return PLACEHOLDER_IMAGE;
    if (src.startsWith('/api/images/')) return `${API_BASE_URL}${src}`;
    if (src.startsWith('/assets/images/')) return src.replace('/assets/images/', '/images/');
    return src;
  };

  const renderPosts = posts.map((post) => {
    const previewImage =
      post.cover_image
        ? resolveImage(post.cover_image)
        : post.gallery && post.gallery.length > 0
          ? resolveImage(post.gallery[0].src)
          : PLACEHOLDER_IMAGE;

    return {
      ...post,
      previewImage,
    };
  });

  if (loading) {
    return (
      <div className="blog">
        <div className="blog-content">
          <h1>Blog Posts</h1>
          <div className="loading">Loading posts...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog">
        <div className="blog-content">
          <h1>Blog Posts</h1>
          <div className="error">Error: {error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog">
      <div className="blog-content">
        <h1>Blog Posts</h1>
        <div className="blog-grid">
          {renderPosts.map((post) => (
            <div key={post.id} className="blog-card-wrapper">
              <Link 
                to={`/blog/${post.slug}`} 
                className="blog-link"
              >
                <BlogCard 
                  title={post.title}
                  subtitle={post.subtitle}
                  images={[post.previewImage]}
                  video={post.video}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Blog;