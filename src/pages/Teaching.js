import React, { useEffect, useState } from 'react';
import './Teaching.css';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://api.tianlongyou.com';

function Teaching() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/courses`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || '加载失败');
        }
        const data = await res.json();
        setCourses(data || []);
      } catch (e) {
        console.error(e);
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = courses.reduce(
    (acc, c) => {
      const level = (c.level || 'undergraduate').toLowerCase();
      if (level === 'postgraduate' || level === 'graduate') acc.postgraduate.push(c);
      else acc.undergraduate.push(c);
      return acc;
    },
    { undergraduate: [], postgraduate: [] }
  );

  return (
    <div className="teaching">
      <div className="teaching-content">
        <div className="teaching-intro">
          <h1>Teaching</h1>
          <p>
            I teach a range of courses at both the undergraduate and graduate levels, focusing on the
            intersections of migration, globalization, borders, and sociological methods. My teaching philosophy
            centers on empowering students to develop a keen sociological perspective, fostering their ability to
            critically analyze complex social phenomena. I strive to provide my students with the tools necessary
            for academic excellence and to inspire them to become actively engaged and informed citizens. Through
            a blend of theoretical frameworks and practical applications, my courses aim to cultivate a deep
            understanding of the sociopolitical dynamics shaping our world.
          </p>
        </div>

        {loading && (
          <section className="course-section">
            <h2>Undergraduate Courses</h2>
            <p>Loading...</p>
          </section>
        )}

        {error && !loading && (
          <section className="course-section">
            <h2>Undergraduate Courses</h2>
            <p className="error">{error}</p>
          </section>
        )}

        {!loading && !error && (
          <>
            <section className="course-section">
              <h2>Undergraduate Courses</h2>
              <div className="courses-grid">
                {grouped.undergraduate.length === 0 ? (
                  <p className="error">暂无本科课程</p>
                ) : (
                  grouped.undergraduate.map((course) => {
                    const img = resolveImage(course.image);
                    return (
                      <div key={course.id} className="course-card">
                        <div className="course-image">
                          {img ? <img src={img} alt={course.title} /> : null}
                        </div>
                        <div className="course-content">
                          <h3>{course.title}</h3>
                          <ReactMarkdown>
                            {course.description_markdown || course.description || ''}
                          </ReactMarkdown>
                          {course.syllabus_markdown && (
                            <div className="course-syllabus">
                              <ReactMarkdown>{course.syllabus_markdown}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="course-section">
              <h2>Postgraduate Courses</h2>
              <div className="courses-grid">
                {grouped.postgraduate.length === 0 ? (
                  <p className="error">暂无研究生课程</p>
                ) : (
                  grouped.postgraduate.map((course) => {
                    const img = resolveImage(course.image);
                    return (
                      <div key={course.id} className="course-card">
                        <div className="course-image">
                          {img ? <img src={img} alt={course.title} /> : null}
                        </div>
                        <div className="course-content">
                          <h3>{course.title}</h3>
                          <ReactMarkdown>
                            {course.description_markdown || course.description || ''}
                          </ReactMarkdown>
                          {course.syllabus_markdown && (
                            <div className="course-syllabus">
                              <ReactMarkdown>{course.syllabus_markdown}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Teaching;