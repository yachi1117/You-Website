import React from 'react';
import BlogCard from '../components/BlogCard';
import './Blog.css';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// 博客数据
const blogPosts = [
  {
    id: 1,
    title: "Fieldwork Reflection: Navigating Immigration and Governance in Ruili's Transnational Borderland",
    subtitle: "A Study of Four Distinct Immigrant Communities",
    images: [
      '/images/blog1a.jpeg',
      '/images/blog1b.jpeg',
      '/images/blog1c.jpeg',
      '/images/blog1d.jpeg'
    ],
    slug: "ruili-fieldwork"
  },
  {
    id: 2,
    title: "Fieldwork Reflection: Livestream Commerce and the Revival of Ruili's Border Markets",
    subtitle: "Digital Innovation in Cross-Border Trade",
    images: ['/images/blog1a.jpeg'],  // 使用一张预览图
    video: '/images/IMG_9625.mov',  // 添加视频
    slug: "ruili-livestream"
  },
  {
    id: 3,
    title: "Fieldwork Reflection: Jadeite Trade, Cross-Border Networks, and the Role of Industry Associations in Ruili",
    subtitle: "Examining the Social Infrastructure of Transnational Commerce",
    images: ['/images/blog3.jpeg'],
    slug: "ruili-jadeite"
  },
  {
    id: 4,
    title: "Fieldwork Reflection: The Spectacle of Livestream Jadeite Trade in Ruili's Border Economy",
    subtitle: "Digital Performance and the Transformation of Traditional Commerce",
    images: ['/images/blog4.jpeg'],
    slug: "ruili-livestream-jadeite"
  },
  {
    id: 5,
    title: "Fieldwork Reflection: Cross-Border Social Work and Community Support in the China-Myanmar Borderland",
    subtitle: "Building Bridges Through Social Services and Academic Partnership",
    images: ['/images/blog5.jpeg'],
    slug: "cross-border-social-work"
  },
  {
    id: 6,
    title: "Fieldwork Reflection: Chain Migration and the Shifting Labor Regimes in Ruili's Border Economy",
    subtitle: "Examining Industrial Relocation and Cross-Border Labor Dynamics",
    images: ['/images/blog6.jpeg'],
    slug: "chain-migration-labor"
  }
];

function Blog() {
  return (
    <div className="blog">
      <div className="blog-content">
        <h1>Blog Posts</h1>
        <div className="blog-grid">
          {blogPosts.map(post => (
            <div key={post.id} className="blog-card-wrapper">
              <Link 
                to={`/blog/${post.slug}`} 
                className="blog-link"
              >
                <BlogCard 
                  title={post.title}
                  subtitle={post.subtitle}
                  images={post.images}
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