import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPost.css';
import Footer from '../components/Footer';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/blog-posts.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load blog posts');
        }
        return response.json();
      })
      .then(data => {
        const foundPost = data.posts.find(p => p.slug === slug);
        if (foundPost) {
          setPost(foundPost);
        } else {
          throw new Error('Post not found');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog post:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!post) {
    return <div className="not-found">Post not found</div>;
  }

  return (
    <div className="blog-post">
      <div className="blog-post-content">
        <Link to="/blog" className="back-link">← Back to Blog</Link>
        <header className="post-header">
          <h1>{post.title}</h1>
          <h2>{post.subtitle}</h2>
        </header>
        <div className="post-body">
          {post.content.map((section, index) => (
            <div key={index} className={`section ${section.type}`}>
              {section.type === 'text' ? (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              ) : section.type === 'video' ? (
                <div className="video-container">
                  <video 
                    controls
                    className="blog-post-video"
                    playsInline
                  >
                    <source src={section.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : section.type === 'image' ? (
                <figure className="image-section">
                  <img 
                    src={post.images[section.index].src}
                    alt={post.images[section.index].caption}
                    className="blog-post-image"
                  />
                  <figcaption>{post.images[section.index].caption}</figcaption>
                </figure>
              ) : (
                <figure className="image-section">
                  <img 
                    src={post.images[section.index].src}
                    alt={post.images[section.index].caption}
                    className="blog-post-image"
                  />
                  <figcaption>{post.images[section.index].caption}</figcaption>
                </figure>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BlogPost; 