import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaArrowUp } from 'react-icons/fa';

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <button className="back-to-top" onClick={scrollToTop}>
          <FaArrowUp /> Back to Top
        </button>
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/papers">Papers</Link>
          <Link to="/teaching">Teaching</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer; 