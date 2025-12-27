import React, { useEffect, useMemo, useState } from 'react';
import './Papers.css';
import Footer from '../components/Footer';
import TrackedLink from '../components/TrackedLink';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://you-website.ychen10001.workers.dev';

// 分类顺序与标题映射（保持与旧版一致）
const CATEGORY_ORDER = [
  'special_issues',
  'immigrant_entrepreneurship',
  'migration_and_border',
  'ethnic_studies',
  'platform_studies',
  'others',
];

const CATEGORY_LABELS = {
  special_issues: 'Special Issues',
  immigrant_entrepreneurship: 'Immigrant Entrepreneurship',
  migration_and_border: 'Migration and Border Studies',
  ethnic_studies: 'Ethnic Studies',
  platform_studies: 'Platform Studies',
  others: 'Others',
};

const normalizeCategory = (raw) => {
  if (!raw) return 'others';
  const key = raw.trim().toLowerCase();
  // 兼容驼峰/下划线/旧写法
  if (['specialissues', 'special_issues', 'special-issues'].includes(key)) return 'special_issues';
  if (['immigrantentrepreneurship', 'immigrant_entrepreneurship', 'immigrant-entrepreneurship'].includes(key))
    return 'immigrant_entrepreneurship';
  if (
    [
      'migrationandborder',
      'migration_and_border',
      'migration-and-border',
      'migrationborder',
      'migration_border',
      'migration-border',
    ].includes(key)
  )
    return 'migration_and_border';
  if (['ethnicstudies', 'ethnic_studies', 'ethnic-studies'].includes(key)) return 'ethnic_studies';
  if (['platformstudies', 'platform_studies', 'platform-studies'].includes(key)) return 'platform_studies';
  if (['others', 'other'].includes(key)) return 'others';
  return 'others';
};

const formatAuthors = (authors) => {
  if (!authors) return '';
  return authors.replace(/Tianlong You/g, '<strong>Tianlong You</strong>');
};

function Papers() {
  const [papers, setPapers] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
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

  // 加载可用标签
  useEffect(() => {
    async function loadTags() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/papers/tags`);
        if (res.ok) {
          const tags = await res.json();
          setAvailableTags(tags || []);
        }
      } catch (e) {
        console.error('Failed to load tags:', e);
      }
    }
    loadTags();
  }, []);

  // 筛选逻辑
  useEffect(() => {
    if (selectedTags.length === 0) {
      // 显示全部
      setPapers(allPapers);
    } else {
      // 筛选包含任一选中标签的论文
      const filtered = allPapers.filter((paper) => {
        const paperTags = paper.tags || [];
        return selectedTags.some((tag) => paperTags.includes(tag));
      });
      setPapers(filtered);
    }
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

  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  // 按时间排序（从新到旧）
  const sortedPapers = useMemo(() => {
    return papers.slice().sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
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
      <div className="papers-content">
        {/* 筛选器 */}
        <div className="papers-filter">
          <div className="filter-header">
            <h3>Filter by Tags</h3>
            {selectedTags.length > 0 && (
              <button className="clear-filters" onClick={handleClearFilters}>
                Clear All ({selectedTags.length})
              </button>
            )}
          </div>
          {selectedTags.length > 0 && (
            <div className="selected-tags-info">
              Selected: {selectedTags.join(', ')}
            </div>
          )}
          <div className="tags-checkboxes">
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <label key={tag} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))
            ) : (
              <p className="no-tags-message">No tags available</p>
            )}
          </div>
        </div>

        {isError ? (
          <p className="error">
            {error ? `Error: ${error}` : 'No papers data available. Please try again later or check the backend API /api/papers'}
          </p>
        ) : (
          <section className="paper-section">
            <div className="papers-list">
              {sortedPapers.map((paper) => {
                const category = normalizeCategory(paper.category);
                const isSpecial = category === 'special_issues';
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
      <Footer />
    </div>
  );
}

export default Papers;

