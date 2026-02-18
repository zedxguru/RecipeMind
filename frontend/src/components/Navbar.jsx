import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, logout } from "../utils/auth";
import axios from "axios";
import "./Navbar.css";
import { toggleTheme,getTheme } from "../utils/theme";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // 🔐 AUTH STATE
  const [user, setUser] = useState(null);

  // 🔍 SEARCH STATE
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [theme, setTheme] = useState(getTheme());
  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  }

  // sync user on route change (login / logout ke baad)
  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  const POPULAR_RECIPES = [
    { id: "paneer-butter", title: "Paneer Butter Masala" },
    { id: "paneer-bhurji", title: "Paneer Bhurji" },
    { id: "chicken-curry", title: "Chicken Curry" },
    { id: "veg-pulao", title: "Veg Pulao" },
  ];

  // 🔹 Ingredient suggestions
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API}/api/suggest-ingredients?q=${encodeURIComponent(text)}`
      );
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  };

  // 🔹 Trigger search
  const triggerSearch = (value) => {
    if (!value.trim()) return;

    setShowSuggestions(false);
    setActiveIndex(-1);
    setQuery("");
    navigate(`/?q=${encodeURIComponent(value.trim())}`);
  };

  // 🔹 Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) =>
        p < suggestions.length - 1 ? p + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) =>
        p > 0 ? p - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        triggerSearch(suggestions[activeIndex]);
      } else {
        triggerSearch(query);
      }
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <header className="navbar">
      <div className="nav-inner">

        {/* LEFT */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
             <span>Recipe</span><span>Mind</span>
          </Link>
        </div>

        {/* CENTER SEARCH */}
        <div className="nav-center" ref={searchRef}>
          <input
            type="text"
            placeholder="Find a recipe or ingredient"
            className="nav-search"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);

              fetchSuggestions(val);

              const matched = POPULAR_RECIPES.filter((r) =>
                r.title.toLowerCase().includes(val.toLowerCase())
              );
              setRecipeSuggestions(matched);

              setShowSuggestions(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            className="nav-search-btn"
            onClick={() => triggerSearch(query)}
          >
            🔍
          </button>

          {showSuggestions && (
            <div className="nav-suggestions">
              {suggestions.length > 0 && (
                <>
                  <div className="suggestion-section">Ingredients</div>
                  {suggestions.map((item, i) => (
                    <div
                      key={item}
                      className={`nav-suggestion-item ${
                        i === activeIndex ? "active" : ""
                      }`}
                      onClick={() => triggerSearch(item)}
                    >
                      🥬 {item}
                    </div>
                  ))}
                </>
              )}

              {recipeSuggestions.length > 0 && (
                <>
                  <div className="suggestion-section">Recipes</div>
                  {recipeSuggestions.map((r) => (
                    <div
                      key={r.id}
                      className="nav-suggestion-item recipe"
                      onClick={() => triggerSearch(r.title)}
                    >
                      🍳 {r.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-user">
                Hi {user.name || user.email} 👋
              </span>

              <Link to="/favorites" className="nav-link">
                ❤️ Favorites
              </Link>

              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
              <button className="theme-toggle" onClick={handleThemeToggle}>
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login">
                Log In
              </Link>
              <Link to="/signup" className="nav-link signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}