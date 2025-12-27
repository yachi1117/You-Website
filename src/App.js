import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Books from './pages/Books';
import Papers from './pages/Papers';
import CV from './pages/CV';
import Teaching from './pages/Teaching';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Admin from './pages/Admin';
import AdminBlog from './pages/AdminBlog';
import AdminBlogEdit from './pages/AdminBlogEdit';
import AdminAbout from './pages/AdminAbout';
import AdminBooks from './pages/AdminBooks';
import AdminBooksEdit from './pages/AdminBooksEdit';
import AdminPapers from './pages/AdminPapers';
import AdminPapersEdit from './pages/AdminPapersEdit';
import AdminTeaching from './pages/AdminTeaching';
import AdminTeachingEdit from './pages/AdminTeachingEdit';
import AdminPublicEngagement from './pages/AdminPublicEngagement';
import AdminPublicEngagementEdit from './pages/AdminPublicEngagementEdit';
import AdminCV from './pages/AdminCV';
import ScrollToTop from './components/ScrollToTop';
import PublicEngagement from './pages/PublicEngagement';
import { initGA, logPageView, logPageTiming } from './utils/analytics';

// 创建一个追踪组件
function TrackingComponent() {
  const location = useLocation();
  const [pageLoadTime, setPageLoadTime] = useState(Date.now());

  useEffect(() => {
    // 记录页面加载时间
    setPageLoadTime(Date.now());

    // 页面访问追踪
    const pageName = location.pathname.replace('/', '') || 'Home';
    logPageView(pageName);

    // 在组件卸载或路由变化时记录停留时间
    return () => {
      const timeSpent = Date.now() - pageLoadTime;
      logPageTiming('Page Engagement', `Time on ${pageName}`, timeSpent);
    };
  }, [location, pageLoadTime]);

  return null;
}

function App() {
  useEffect(() => {
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
      initGA(measurementId);
    } else {
      console.warn('Google Analytics Measurement ID is not defined');
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <TrackingComponent />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<AdminBlogEdit />} />
          <Route path="/admin/blog/:id" element={<AdminBlogEdit />} />
          <Route path="/admin/about" element={<AdminAbout />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/books/new" element={<AdminBooksEdit />} />
          <Route path="/admin/books/:id" element={<AdminBooksEdit />} />
          <Route path="/admin/papers" element={<AdminPapers />} />
          <Route path="/admin/papers/new" element={<AdminPapersEdit />} />
          <Route path="/admin/papers/:id" element={<AdminPapersEdit />} />
          <Route path="/admin/teaching" element={<AdminTeaching />} />
          <Route path="/admin/teaching/new" element={<AdminTeachingEdit />} />
          <Route path="/admin/teaching/:id" element={<AdminTeachingEdit />} />
          <Route
            path="/admin/public-engagement"
            element={<AdminPublicEngagement />}
          />
          <Route
            path="/admin/public-engagement/new"
            element={<AdminPublicEngagementEdit />}
          />
          <Route path="/admin/cv" element={<AdminCV />} />
          <Route
            path="/admin/public-engagement/:id"
            element={<AdminPublicEngagementEdit />}
          />
          <Route path="/books" element={<Books />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/teaching" element={<Teaching />} />
          <Route path="/public-engagement" element={<PublicEngagement />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cv" element={<CV />} />
        </Routes>
        <footer>
          {/* Add footer content if needed */}
        </footer>
      </div>
    </Router>
  );
}

export default App; 