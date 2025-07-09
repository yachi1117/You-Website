import React from 'react';
import './BlogCard.css';

function BlogCard({ title, subtitle, images, video }) {
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
        ) : (
          <img 
            src={images[0]} 
            alt={title} 
            className="preview-image"
          />
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