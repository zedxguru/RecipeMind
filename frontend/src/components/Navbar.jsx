// src/components/Navbar.jsx (replace entire file with this)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import axios from 'axios';
import './Navbar.css';

import IngredientSearch from './IngredientSearch';
import './IngredientSearch.css';

export default function Navbar(){
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('rm_user');
    if(u) setUser(JSON.parse(u));
    const saved = localStorage.getItem('ingredine_theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ingredine_theme', next);
  };

  const logout = () => {
    localStorage.removeItem('rm_token');
    localStorage.removeItem('rm_user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
    window.location.reload();
  };

  const initials = user ? (user.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : (user.email||'U')[0]) : '';

  return (
    <header className="rm-nav">
      <div className="rm-container">
        <div className="rm-left">
          <button className="hambtn" onClick={() => setOpen(!open)}>
            {open ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>

          <Link to="/" className="brand">
            <span className="brand-dot">Ingre</span><span className="brand-rest">Dine</span>
          </Link>
        </div>

        <div className={`rm-search ${open ? 'show-mobile' : ''}`}>
          <IngredientSearch onSearchNavigate={(param) => {
            setOpen(false);
            navigate(`/?q=${encodeURIComponent(param)}`);
          }}/>
        </div>

        <nav className={`rm-right ${open ? 'open' : ''}`}>
          <Link to="/favorites" className="nav-link">Favorites</Link>
          <Link to="/" className="nav-link">Explore</Link>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <FiMoon/> : <FiSun/>}
          </button>

          { user ? (
            <div className="user-menu">
              <div className="avatar" title={user.name || user.email}>{initials}</div>
              <div className="user-dropdown">
                <div className="ud-name">{user.name || user.email}</div>
                <button className="ud-btn" onClick={() => navigate('/profile')}>Profile</button>
                <button className="ud-btn" onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/auth" className="nav-link btn-primary">Login / Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
