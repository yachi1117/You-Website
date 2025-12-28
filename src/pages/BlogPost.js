import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './BlogPost.css';
import Footer from '../components/Footer';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to load blog post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const renderers = {
    img: ({ node, ...props }) => {
      const src = props.src && props.src.startsWith('/api/images/')
        ? `${API_BASE_URL}${props.src}`
        : props.src;
      return <img {...props} src={src} alt={props.alt || 'Blog post image'} />;
    },
    video: ({ node, ...props }) => {
      const src = props.src && props.src.startsWith('/api/images/')
        ? `${API_BASE_URL}${props.src}`
        : props.src;
      return (
        <div className="video-container">
          <video controls className="blog-post-video" playsInline>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    },
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!post) {
    return <div className="not-found">Post not found</div>;
  }

  const contentHtmlWithBase =
    post.contentHtml &&
    post.contentHtml.replace(/src="\/api\/images\//g, `src="${API_BASE_URL}/api/images/`);

  return (
    <div className="blog-post">
      <div className="blog-post-content">
        <Link to="/blog" className="back-link">← Back to Blog</Link>
        <header className="post-header">
          <h1>{post.title}</h1>
          <h2>{post.subtitle}</h2>
          <p className="post-date">{post.date}</p>
        </header>
        <div className="post-body">
          {post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: contentHtmlWithBase }} />
          ) : (
            <ReactMarkdown components={renderers}>
              {post.content_markdown}
            </ReactMarkdown>
          )}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default BlogPost; 