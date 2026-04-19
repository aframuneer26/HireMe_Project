import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">HireMe</Link>
      </div>
      <div className="navbar-links">
        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}
        {isLoggedIn && <Link to="/roadmap">Analyzer</Link>}
        {isLoggedIn && <Link to="/interview">Mock Interview</Link>}
        {isLoggedIn && <Link to="/resources">Resources</Link>}
        {isLoggedIn && <Link to="/mcq">MCQ Test</Link>}
        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
