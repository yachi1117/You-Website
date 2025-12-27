import React, { useState, useEffect } from 'react';
import './PublicEngagement.css';
import Footer from '../components/Footer';
import TrackedLink from '../components/TrackedLink';
import { logEvent } from '../utils/analytics';
import { FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

function PublicEngagement() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveImage = (src) => {
    if (!src) return '';
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
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/public-engagement`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load public engagement');
        }
        const data = await res.json();
        const list = (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          titleEn: item.title_en,
          date: item.date,
          duration: item.duration,
          coverImage: resolveImage(item.cover_image),
          audioUrl: item.audio_url,
          externalLink: item.external_link,
          showNotes: item.show_notes,
          showNotesEn: item.show_notes_en,
          topicsEn: Array.isArray(item.topics_en)
            ? item.topics_en
            : item.topics_en
              ? String(item.topics_en).split(',').map((t) => t.trim()).filter(Boolean)
              : [],
          type: item.type,
        }));
        // 按日期降序
        list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setPodcasts(list);
      } catch (e) {
        console.error('Error loading public engagement:', e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePlayClick = (podcast) => {
    logEvent('Podcast', 'Play Click', podcast.title);
    const target = podcast.audioUrl || podcast.externalLink;
    if (target) window.open(target, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading podcasts...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="public-engagement">
      <div className="public-engagement-content">
        <div className="public-engagement-intro">
          <h1>Public Engagement</h1>
          <p>
          I actively engage in public scholarship through commentary, columns, podcasts, non-fiction writing, appearances on Chinese and global mainstream media, and public events in bookstores and cafés, bridging academia and public discourse with insights on global migration, American politics, and international affairs.
          </p>
        </div>

        <section className="podcasts-section">
          <h2>Podcast Host</h2>
          <div className="podcasts-grid">
            <div className="podcast-card">
              <div className="podcast-cover">
                <img 
                  src="https://bts-image.xyzcdn.net/aHR0cHM6Ly9pLnR5cGxvZy5jb20veHVhbm1laS84NDA3MDY5OTM5XzA4NjA4MTUucG5nP3gtb3NzLXByb2Nlc3M9c3R5bGUvc2w=.png@small" 
                  alt="选·美 I am Election" 
                />
              </div>
              <div className="podcast-content">
                <h3 className="podcast-title">
                  选·美 I am Election
                </h3>
                <div className="podcast-description">
                  A political podcast series produced by IPN, co-hosted by talich, You Tianlong, Zhuang Qiaoyi, and Lin Yao. The show focuses on American politics, international relations, and social issues, featuring in-depth analysis and expert interviews.
                </div>
                <div className="podcast-meta">
                  <span className="podcast-date">2018-2019</span>
                </div>
                <div className="podcast-topics">
                  {[
                    "US Politics",
                    "International Relations",
                    "Social Issues",
                    "Policy Analysis",
                    "Expert Interviews"
                  ].map((topic, index) => (
                    <span key={index} className="topic-tag">
                      {topic}
                    </span>
                  ))}
                </div>
                <TrackedLink
                  href="https://xuanmei.us/"
                  category="Podcast"
                  label="I am Election Series"
                  className="podcast-link"
                >
                  <FaExternalLinkAlt /> Visit Website
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="podcasts-section">
          <h2>Podcast Appearances</h2>
          <div className="podcasts-grid">
            {podcasts && podcasts.map((podcast) => (
              <div key={podcast.id} className="podcast-card">
                <div className="podcast-cover">
                  {podcast.coverImage ? <img src={podcast.coverImage} alt={podcast.title} /> : null}
                  <button 
                    className="play-button"
                    onClick={() => handlePlayClick(podcast)}
                    aria-label="Play podcast"
                  >
                    <FaPlay />
                  </button>
                </div>
                <div className="podcast-content">
                  <h3 className="podcast-title" title={podcast.titleEn}>
                    {podcast.title}
                  </h3>
                  <div className="podcast-meta">
                    <span className="podcast-date">{podcast.date}</span>
                    {podcast.duration && <span className="podcast-duration">{podcast.duration}</span>}
                  </div>
                  <div 
                    className="podcast-description"
                    title={podcast.showNotesEn}
                  >
                    {podcast.showNotes}
                  </div>
                  <div className="podcast-topics">
                    {podcast.topicsEn && podcast.topicsEn.map((topic, index) => (
                      <span 
                        key={index} 
                        className="topic-tag"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <TrackedLink
                    href={podcast.externalLink || podcast.audioUrl}
                    category="Podcast"
                    label={`Original Link: ${podcast.title}`}
                    className="podcast-link"
                  >
                    <FaExternalLinkAlt /> Stream on the original site
                  </TrackedLink>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default PublicEngagement; 