import React, { useState, useEffect } from 'react';
import './PublicEngagement.css';
import Footer from '../components/Footer';
import TrackedLink from '../components/TrackedLink';
import { logEvent } from '../utils/analytics';
import { FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

function Tooltip({ content }) {
  return <div className="tooltip">{content}</div>;
}

function PublicEngagement() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/podcasts.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // 按日期降序排序播客
        const sortedPodcasts = data.podcasts.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        setPodcasts(sortedPodcasts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading podcasts:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handlePlayClick = (podcast) => {
    logEvent('Podcast', 'Play Click', podcast.title);
    window.open(podcast.externalLink, '_blank');
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
                  <img src={podcast.coverImage} alt={podcast.title} />
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
                    <span className="podcast-duration">{podcast.duration}</span>
                  </div>
                  <div 
                    className="podcast-description"
                    title={podcast.showNotesEn}
                  >
                    {podcast.showNotes}
                  </div>
                  <div className="podcast-topics">
                    {podcast.topicsEn.map((topic, index) => (
                      <span 
                        key={index} 
                        className="topic-tag"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <TrackedLink
                    href={podcast.externalLink}
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