// src/components/IngredientSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './IngredientSearch.css';

const API = 'http://localhost:5000';

export default function IngredientSearch({ onSearchNavigate }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [showList, setShowList] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // auto add from URL param on mount? handled by Navbar/Home navigation
  }, []);

  useEffect(() => {
    if (!q.trim()) { setSuggestions([]); return; }
    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchSuggest, 220);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  const fetchSuggest = async () => {
    try {
      const res = await axios.get(`${API}/api/suggest-ingredients?q=${encodeURIComponent(q)}`);
      setSuggestions(res.data.suggestions || []);
      setActiveIdx(-1);
      setShowList(true);
    } catch (err) {
      console.warn('suggest err', err);
      setSuggestions([]);
    }
  };

  const addTag = (val) => {
    const clean = val.trim();
    if (!clean) return;
    if (tags.includes(clean)) return; // dedupe
    setTags(prev => [...prev, clean]);
    setQ('');
    setSuggestions([]);
    setShowList(false);
    inputRef.current?.focus();
  };

  const removeTag = (val) => {
    setTags(prev => prev.filter(t => t !== val));
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Backspace' && !q && tags.length) {
      // remove last tag
      removeTag(tags[tags.length - 1]);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        addTag(suggestions[activeIdx]);
      } else if (q.trim()) {
        addTag(q.trim());
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
      setShowList(true);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Escape') {
      setShowList(false);
      setActiveIdx(-1);
    }
  };

  const onSubmit = (e) => {
    e && e.preventDefault();
    if (tags.length === 0 && q.trim()) {
      addTag(q.trim());
      return;
    }
    // navigate to search results — pass comma separated ingredients
    const param = tags.join(',');
    if (param) {
      onSearchNavigate(param); // parent will navigate
    } else {
      // nothing
      inputRef.current?.focus();
    }
  };

  return (
    <div className="is-wrapper" onKeyDown={onKeyDown}>
      <form className="is-form" onSubmit={onSubmit} onBlur={() => setTimeout(()=>setShowList(false),150)}>
        <div className="chips" onClick={() => inputRef.current?.focus()}>
          {tags.map(t => (
            <div className="chip" key={t}>
              <span>{t}</span>
              <button type="button" className="chip-x" onClick={() => removeTag(t)}>✕</button>
            </div>
          ))}

          <input
            ref={inputRef}
            className="is-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={tags.length ? '' : 'Search ingredients — e.g. tomato, egg'}
            onFocus={() => setShowList(true)}
            aria-label="ingredient"
          />
        </div>

        <button type="submit" className="is-find-btn">Find</button>
      </form>

      {showList && suggestions && suggestions.length > 0 && (
        <ul className="is-list" ref={listRef}>
          {suggestions.map((s, idx) => (
            <li
              key={s}
              className={idx === activeIdx ? 'active' : ''}
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
