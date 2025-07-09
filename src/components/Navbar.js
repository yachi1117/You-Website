import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="name">Dr. Tianlong You</span>
      </div>
      <button className="menu-button" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`navbar-right ${isOpen ? 'active' : ''}`}>
        <NavLink to="/" end onClick={toggleMenu}>Home</NavLink>
        <NavLink to="/books" onClick={toggleMenu}>Books</NavLink>
        <NavLink to="/papers" onClick={toggleMenu}>Papers</NavLink>
        <NavLink to="/teaching" onClick={toggleMenu}>Teaching</NavLink>
        <NavLink to="/public-engagement" onClick={toggleMenu}>Public Engagement</NavLink>
        <NavLink to="/blog" onClick={toggleMenu}>Blog</NavLink>
        <NavLink to="/cv" onClick={toggleMenu}>CV</NavLink>
      </div>
    </nav>
  );
}

export default Navbar; 