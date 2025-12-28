import React, { useEffect, useMemo, useState, useCallback } from 'react';
import WordCloud from 'react-wordcloud';
import './Papers.css';
import Footer from '../components/Footer';
import TrackedLink from '../components/TrackedLink';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

const formatAuthors = (authors) => {
  if (!authors) return '';
  return authors.replace(/Tianlong You/g, '<strong>Tianlong You</strong>');
};

function Papers() {
  const [papers, setPapers] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showWordCloud, setShowWordCloud] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载论文数据
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/papers`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load');
        }
        const data = await res.json();
        // 仅展示发布的，并处理 tags
        const publishedPapers = (data || [])
          .filter((p) => (p.status || '').toLowerCase() === 'published')
          .map((p) => ({
            ...p,
            tags: Array.isArray(p.tags) ? p.tags : [],
          }));
        setAllPapers(publishedPapers);
        setPapers(publishedPapers);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 计算标签使用次数和生成文字云数据
  const tagCounts = useMemo(() => {
    const counts = {};
    allPapers.forEach((paper) => {
      const tags = paper.tags || [];
      tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [allPapers]);

  // 生成文字云数据（按数量排序）
  const wordCloudData = useMemo(() => {
    const entries = Object.entries(tagCounts).map(([text, value]) => ({ text, value }));
    return entries.sort((a, b) => b.value - a.value);
  }, [tagCounts]);

  // 生成可用标签列表（按数量从多到少排序）
  const sortedAvailableTags = useMemo(() => {
    return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
  }, [tagCounts]);

  // 筛选逻辑（按年月从新到旧排序）
  useEffect(() => {
    let filtered = [];
    if (selectedTags.length === 0) {
      // 显示全部
      filtered = allPapers;
    } else {
      // 筛选包含任一选中标签的论文
      filtered = allPapers.filter((paper) => {
        const paperTags = paper.tags || [];
        return selectedTags.some((tag) => paperTags.includes(tag));
      });
    }
    // 按年月从新到旧排序（如果年月相同，按创建时间）
    filtered.sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      if (yearB !== yearA) {
        return yearB - yearA; // 年份从新到旧
      }
      // 年份相同，比较月份
      const monthA = a.month || 0;
      const monthB = b.month || 0;
      if (monthB !== monthA) {
        return monthB - monthA; // 月份从新到旧
      }
      // 年月都相同，按创建时间
      const createdA = a.created_at || 0;
      const createdB = b.created_at || 0;
      return createdB - createdA; // 创建时间从新到旧
    });
    setPapers(filtered);
  }, [selectedTags, allPapers]);

  // 处理标签选择
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag].sort();
      }
    });
  };

  // 文字云点击事件：关闭cloud并选中该tag
  const handleWordCloudClick = useCallback((word) => {
    setSelectedTags([word.text]);
    setShowWordCloud(false);
  }, []);

  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  // 记忆化WordCloud配置，避免hover状态改变时重新渲染
  const wordCloudOptions = useMemo(() => ({
    rotations: 0,
    rotationSteps: 0,
    fontSizes: [18, 56],
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontWeight: '600',
    // 蓝黑灰配色方案，从深到浅（高频tag更深）
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#2c3e50', '#34495e', '#5d6d7e', '#7f8c8d'],
    enableTooltip: false, // 禁用tooltip避免频繁弹出
    deterministic: true, // 使用确定性布局，避免重新渲染时改变布局
    transitionDuration: 0, // 禁用过渡动画，避免布局变化时的动画效果
    spiral: 'archimedean', // 使用阿基米德螺旋布局（更自然）
    padding: 5,
  }), []);

  const wordCloudCallbacks = useMemo(() => ({
    onWordClick: handleWordCloudClick,
  }), [handleWordCloudClick]);

  // 按年月排序（从新到旧）- 这个排序是冗余的，因为筛选逻辑已经排序了
  // 但保留以确保显示顺序正确
  const sortedPapers = useMemo(() => {
    return papers.slice().sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      // 年份相同，比较月份
      const monthDiff = (b.month || 0) - (a.month || 0);
      if (monthDiff !== 0) return monthDiff;
      // 年月都相同，按创建时间
      const createdDiff = (b.created_at || 0) - (a.created_at || 0);
      return createdDiff;
    });
  }, [papers]);

  if (loading) {
    return (
      <div className="papers">
        <div className="papers-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const isError = !!error || !papers || papers.length === 0;

  return (
    <div className="papers">
      <div className={`papers-content ${showWordCloud ? 'with-wordcloud' : 'with-sidebar'}`}>
        {/* 文字云或侧边栏 */}
        {showWordCloud ? (
          <div className="wordcloud-container">
            <div className="wordcloud-header">
              <h3>Tags Cloud</h3>
              <button className="close-wordcloud" onClick={() => setShowWordCloud(false)}>
                ×
              </button>
            </div>
            {wordCloudData.length > 0 ? (
              <div className="wordcloud-wrapper">
                <WordCloud
                  words={wordCloudData}
                  size={[900, 450]}
                  options={wordCloudOptions}
                  callbacks={wordCloudCallbacks}
                />
              </div>
            ) : (
              <p className="no-tags-message">No tags available</p>
            )}
            {selectedTags.length > 0 && (
              <div className="selected-tags-info">
                Selected: {selectedTags.join(', ')}
                <button className="clear-filters" onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="tags-sidebar">
            <div className="sidebar-header">
              <h3>Filter by Tags</h3>
              <button className="show-wordcloud" onClick={() => setShowWordCloud(true)}>
                Show Word Cloud
              </button>
            </div>
            {selectedTags.length > 0 && (
              <div className="selected-tags-info">
                Selected: {selectedTags.join(', ')}
                <button className="clear-filters" onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
            )}
            <div className="tags-list">
              {sortedAvailableTags.length > 0 ? (
                sortedAvailableTags.map((tag) => (
                  <label key={tag} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span>
                      {tag} <span className="tag-count">({tagCounts[tag]})</span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="no-tags-message">No tags available</p>
              )}
            </div>
          </div>
        )}

        {/* 论文列表 */}
        <div className="papers-main">

          {isError ? (
            <p className="error">
              {error ? `Error: ${error}` : 'No papers data available. Please try again later or check the backend API /api/papers'}
            </p>
          ) : (
            <section className="paper-section">
              <div className="papers-list">
                {sortedPapers.map((paper) => {
                // 检查tags中是否包含"special issues"来判断是否为Special Issue
                const tags = paper.tags || [];
                const isSpecial = tags.some(tag => String(tag).toLowerCase().includes('special issue'));
                const authors = paper.authors || paper.role || '';
                const issueOrPages = paper.issue || paper.pages || '';
                const hasLink = !!paper.link;

                // 统一显示格式：显示作者（加粗 Tianlong You），标题/期刊/卷期页码/年份
                const content = (
                  <div className="paper-citation">
                    {authors && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formatAuthors(authors),
                        }}
                      />
                    )}
                    {authors ? '. ' : ''}
                    {paper.year ? `${paper.year}. ` : ''}
                    {paper.title}
                    {paper.title_cn ? ` (${paper.title_cn})` : ''}
                    {paper.journal && (
                      <>
                        {' '}
                        <em>{paper.journal}</em>
                      </>
                    )}
                    {paper.journal_cn && ` (${paper.journal_cn})`}
                    {issueOrPages && `, ${issueOrPages}`}
                    {paper.pages && !issueOrPages && `, ${paper.pages}`}
                    {(paper.pages || issueOrPages || paper.journal) && '.'}
                  </div>
                );

                return (
                  <div key={paper.id} className={`paper-item ${isSpecial ? 'special-issue' : ''}`}>
                    {isSpecial && <div className="special-issue-watermark">Special Issue</div>}
                    {hasLink ? (
                      <TrackedLink
                        href={paper.link}
                        category="Papers"
                        label={`${paper.title}`}
                        className="paper-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content}
                      </TrackedLink>
                    ) : (
                      content
                    )}
                  </div>
                );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Papers;

