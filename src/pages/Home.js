import React, { useEffect, useState } from 'react';
import './Home.css';
import headshotPlaceholder from '../assets/images/headshot.png';
import { SiGooglescholar } from 'react-icons/si';
import { FaLinkedinIn, FaResearchgate } from 'react-icons/fa';
import TrackedLink from '../components/TrackedLink';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function Home() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const resolveImage = (src) => {
    if (!src) return headshotPlaceholder;
    const s = src.trim();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) return s;
    if (s.startsWith('/api/images/')) return `${API_BASE_URL}${s}`;
    if (s.startsWith('/assets/images/')) return s.replace('/assets/images/', '/images/');
    if (s.startsWith('assets/images/')) return s.replace('assets/images/', '/images/');
    if (s.startsWith('/images/')) return s;
    if (s.startsWith('images/')) return `/${s}`;
    return s;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/about`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || '加载失败');
        }
        const data = await res.json();
        setAbout(data);
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const email = about?.email || 'tyou0410@gmail.com';
  const bioMarkdown = about?.displayBio || about?.bio || '';
  const researchInterests = Array.isArray(about?.researchInterests)
    ? about.researchInterests
    : [];
  const social = about?.socialLinks || {};
  const headshot = resolveImage(about?.headshot);

  return (
    <article className="home">
      <div className="home-content">
        <div className="profile-container">
          <div className="profile-left">
            <div className="profile-image">
              <img src={headshot} alt={about?.name || 'Profile'} />
            </div>
            <div className="contact-me">
              <h2>Contact Me</h2>
              <div className="contact-links">
                <div className="social-links">
                  <TrackedLink 
                    href={social.googleScholar || "https://scholar.google.com/citations?hl=zh-CN&user=4sSuatgAAAAJ"}
                    category="Social"
                    label="Google Scholar"
                    className="icon-link"
                  >
                    <SiGooglescholar />
                  </TrackedLink>
                  
                  <TrackedLink 
                    href={social.linkedIn || "https://www.linkedin.com/in/tianlong-you-6a771431b/"}
                    category="Social"
                    label="LinkedIn"
                    className="icon-link"
                  >
                    <FaLinkedinIn />
                  </TrackedLink>
                  
                  <TrackedLink 
                    href={social.researchGate || "https://www.researchgate.net/profile/Tianlong-You"}
                    category="Social"
                    label="ResearchGate"
                    className="icon-link"
                  >
                    <FaResearchgate />
                  </TrackedLink>
                </div>
                <div className="contact-info">
                  <a 
                    href={`mailto:${email}`} 
                    className="email"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(email)
                        .then(() => {
                          const target = e.target;
                          target.textContent = 'Copied!';
                          setTimeout(() => {
                            target.textContent = email;
                          }, 1500);
                        })
                        .catch(err => {
                          console.error('Failed to copy:', err);
                        });
                    }}
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-text">
            <h1>About Me</h1>
            <div className="introduction">
              {loading && <p>Loading...</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !error && bioMarkdown && <ReactMarkdown>{bioMarkdown}</ReactMarkdown>}
              {!loading && !error && !bioMarkdown && (
                <>
                  <p>
                    Hello, world! I am an Associate Professor from Yunnan University and an Affiliate Faculty of the Center for Global Health at Arizona State University. I earned Ph.D. from ASU and J.D. from Hofstra University. I also held a Graduate Certificate in Immigration Studies from ASU.
                  </p>
                  <p>
                    As an immigration sociologist, my research focuses on how the global forces influence immigrant entrepreneurship in little-known emerging county-level economic hubs, particularly in our increasingly digital world. My book project, <em>The Rise and Fall of Digital Development Villages: The Political Economy of China's Rural E-Commerce in the New Era</em>, forthcoming from Palgrave Macmillan, explores how China's dynamic political economy, especially the rise of e-commerce, is transforming thousands of villages in the New Era. My scholarly work has been published in leading journals such as the American Behavioral Scientist, China Information, Citizenship Studies and Chinese Journal of Communication.
                  </p>
                  <p>
                    Currently, I am an Associate Editor for <em>Comparative Migration Studies, PLOS One, and Citizenship Studies, </em> as well as the executive editor-in-chief for <em>Kuige Sociological Review</em> (《魁阁学刊》) and editorial member for <em>China Studies</em> (《中国研究》). I have also served as a guest editor for special issues on China's borderlands in journals like <em>China Information</em>, <em>China Perspectives</em>, and <em>Citizenship Studies</em>.
                  </p>
                  <p>
                    Beyond academia, I have contributed to public discourse as a columnist and podcaster, offering insights on global migration issues for various media outlets, including The New York Times and BBC.
                  </p>
                </>
              )}
            </div>
            {researchInterests.length > 0 && (
              <div className="research-block">
                <h2>Research Interests</h2>
                <div className="research-tags">
                  {researchInterests.map((tag, idx) => (
                    <span key={idx} className="research-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": about?.name || "Tianlong You",
          "honorificPrefix": "Dr.",
          "jobTitle": about?.title || "Associate Professor",
          "worksFor": {
            "@type": "Organization",
            "name": "Yunnan University"
          },
          "alumniOf": [
            {
              "@type": "Organization",
              "name": "Arizona State University"
            },
            {
              "@type": "Organization",
              "name": "Hofstra University"
            }
          ],
          "description": "Immigration sociologist specializing in immigrant entrepreneurship and digital development in emerging economic hubs.",
          "url": "https://yourwebsite.com",
          "sameAs": [
            "https://scholar.google.com/citations?hl=zh-CN&user=4sSuatgAAAAJ",
            "https://www.linkedin.com/in/tianlong-you-6a771431b/",
            "https://www.researchgate.net/profile/Tianlong-You"
          ]
        })}
      </script>
      
      <div className="last-updated">
        Last updated: October 2025
      </div>
    </article>
  );
}

export default Home; 