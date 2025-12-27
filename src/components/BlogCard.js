import React from 'react';
import './BlogCard.css';

function BlogCard({ title, subtitle, images = [], video }) {
  const firstImage = images.length > 0 ? images[0] : null;

  return (
    <div className="blog-card">
      <div className="blog-card-image">
        {video ? (
          <video 
            src={video} 
            className="preview-video"
            muted
            loop
            playsInline
          />
        ) : firstImage ? (
          <img 
            src={firstImage} 
            alt={title} 
            className="preview-image"
          />
        ) : (
          <div className="preview-image placeholder">No Image</div>
        )}
      </div>
      <div className="blog-card-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default BlogCard; 