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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/papers`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || '加载失败');
        }
        const data = await res.json();
        // 仅展示发布的
        setPapers((data || []).filter((p) => (p.status || '').toLowerCase() === 'published'));
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 按分类分组，并按设定顺序排序
  const grouped = useMemo(() => {
    const map = new Map();
    papers.forEach((p) => {
      const key = normalizeCategory(p.category);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    // 按 display_order / year 排序
    const sortItems = (arr) =>
      arr.slice().sort((a, b) => {
        const od = (a.display_order || 0) - (b.display_order || 0);
        if (od !== 0) return od;
        return (b.year || 0) - (a.year || 0);
      });
    const ordered = [];
    CATEGORY_ORDER.forEach((k) => {
      if (map.has(k)) ordered.push([k, sortItems(map.get(k))]);
    });
    // 追加未定义的其他分类
    Array.from(map.entries()).forEach(([k, v]) => {
      if (!CATEGORY_ORDER.includes(k)) ordered.push([k, sortItems(v)]);
    });
    return ordered;
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
        {isError ? (
          <p className="error">
            {error ? `Error: ${error}` : '暂无论文数据，请稍后重试或检查后端接口 /api/papers'}
          </p>
        ) : (
          grouped.map(([category, items]) => (
            <section key={category} className="paper-section">
              <h2>{CATEGORY_LABELS[category] || category}</h2>
              <div className="papers-list">
                {items.map((paper) => {
                  const isSpecial = category === 'special_issues';
                  const authors = paper.authors || paper.role || '';
                  const issueOrPages = paper.issue || paper.pages || '';
                  const hasLink = !!paper.link;

                  // Special Issues 样式：role, title, journal(+issue/status)
                  if (isSpecial) {
                    const content = (
                      <>
                        {paper.role && <div className="paper-role">{paper.role}</div>}
                        <div className="paper-title">{paper.title}</div>
                        <div className="paper-journal">
                          {paper.journal && <em>{paper.journal}</em>}
                          {paper.issue && `, ${paper.issue}`}
                          {paper.status && `, ${paper.status}`}
                        </div>
                      </>
                    );
                    return (
                      <div key={paper.id} className="paper-item special-issue">
                        {hasLink ? (
                          <TrackedLink
                            href={paper.link}
                            category="Papers"
                            label={`${CATEGORY_LABELS[category] || category}: ${paper.title}`}
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
                  }

                  // 其他分类：显示作者（加粗 Tianlong You），标题/期刊/卷期页码/年份
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
                    <div key={paper.id} className="paper-item">
                      {hasLink ? (
                        <TrackedLink
                          href={paper.link}
                          category="Papers"
                          label={`${CATEGORY_LABELS[category] || category}: ${paper.title}`}
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
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Papers;

