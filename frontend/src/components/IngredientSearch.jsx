// Path reference to your UI screenshot (for designer reference):
// /mnt/data/Screenshot 2025-11-22 112754.png

// IngredientSearch.jsx
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './IngredientSearch.css';

/*
Props:
 - onSelectIngredients(selectedArray)   // called whenever selection changes
 - minimal (boolean)                     // if true: render only a horizontal chips bar (compact)
 - initial (array|string)                // optional initial ingredients
 - apiBase (string)                      // optional API base (defaults to env or localhost)
*/

const DEFAULT_CATEGORIES = [
  {
    id: 'pantry',
    title: 'Pantry Essentials',
    items: ['salt', 'pepper', 'oil', 'olive oil', 'butter', 'sugar', 'flour', 'rice', 'bread', 'yeast']
  },
  {
    id: 'veggies',
    title: 'Vegetables & Greens',
    items: ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'spinach', 'cabbage', 'bell pepper', 'zucchini']
  },
  {
    id: 'proteins',
    title: 'Proteins',
    items: ['egg', 'chicken', 'paneer', 'tofu', 'lentils', 'moong dal', 'chana']
  },
  {
    id: 'dairy',
    title: 'Dairy & Fats',
    items: ['milk', 'cheese', 'yogurt', 'ghee']
  },
  {
    id: 'spices',
    title: 'Spices & Condiments',
    items: ['cumin', 'turmeric', 'coriander', 'garam masala', 'soy sauce', 'ketchup', 'mayonnaise']
  },
  {
    id: 'mushrooms',
    title: 'Mushrooms',
    items: ['button mushroom', 'shiitake mushroom', 'portobello mushroom']
  }
];

function normalizeToken(s = '') {
  return s.toString().trim().toLowerCase();
}

export default function IngredientSearch({
  onSelectIngredients = () => {},
  minimal = false,
  initial = '',
  apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000'
}) {
  // state
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [selected, setSelected] = useState(() => {
    if (!initial) return [];
    if (Array.isArray(initial)) return initial.map(normalizeToken);
    return initial.split(',').map(normalizeToken).filter(Boolean);
  });
  const [openCat, setOpenCat] = useState(categories.length ? categories[0].id : null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // debounce
  const suggestTimer = useRef(null);

  // notify parent whenever selected changes
  // keep a stable ref to the callback so effect does not retrigger when parent redeclares
const onSelectRef = useRef(onSelectIngredients);
useEffect(() => { onSelectRef.current = onSelectIngredients; }, [onSelectIngredients]);

useEffect(() => {
  // notify parent when selected changes
  try {
    onSelectRef.current(Array.from(selected));
  } catch (e) {
    // ignore
  }
}, [selected]);

  // cleanup timer
  useEffect(() => {
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, []);

  // Suggestion fetcher (debounced)
  const fetchSuggestions = (q) => {
    if (!q || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggest(true);
    axios.get(`${apiBase}/api/suggest-ingredients?q=${encodeURIComponent(q)}`, { timeout: 8000 })
      .then(res => {
        const s = (res.data && res.data.suggestions) ? res.data.suggestions : [];
        // filter out already selected
        const filtered = s.map(normalizeToken).filter(x => !selected.includes(x));
        setSuggestions(filtered.slice(0, 12));
      })
      .catch(err => {
        // fallback to local naive filter across categories
        const flat = categories.flatMap(c => c.items).map(normalizeToken);
        const local = Array.from(new Set(flat)).filter(x => x.includes(q.toLowerCase()) && !selected.includes(x));
        setSuggestions(local.slice(0, 12));
      })
      .finally(() => setLoadingSuggest(false));
  };

  const onInputChange = (val) => {
    setInput(val);
    setShowSuggestions(true);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  // toggle ingredient in selected list
  const toggleIngredient = (token) => {
    const t = normalizeToken(token);
    setSelected(prev => {
      const exists = prev.includes(t);
      const next = exists ? prev.filter(x => x !== t) : [...prev, t];
      return next;
    });
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // handle paste or enter: accepts comma separated list
  const handleAddFromInput = () => {
    if (!input) return;
    const parts = input.split(',').map(p => normalizeToken(p)).filter(Boolean);
    if (!parts.length) return;
    setSelected(prev => {
      const union = Array.from(new Set([...prev, ...parts]));
      return union;
    });
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // remove from selected
  const removeSelected = (token) => {
    const t = normalizeToken(token);
    setSelected(prev => prev.filter(x => x !== t));
  };

  // when user double-click chip -> toggle and scroll to top etc.
  const onCategoryToggle = (catId) => {
    setOpenCat(openCat === catId ? null : catId);
  };

  // keyboard handlers
  const onInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFromInput();
    }
    if (e.key === 'Backspace' && input === '') {
      // remove last selected
      setSelected(prev => prev.slice(0, Math.max(0, prev.length - 1)));
    }
  };

  // minimal mode: render compact horizontal chips only (useful for topbar)
  if (minimal) {
    const flattened = categories.flatMap(c => c.items);
    const unique = Array.from(new Set(flattened.map(normalizeToken)));
    return (
      <div className="ingredient-chips-minimal" aria-hidden="false">
        {unique.map(item => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              className={`chip ${active ? 'chip-active' : ''}`}
              onClick={() => toggleIngredient(item)}
              type="button"
            >
              {item}
            </button>
          );
        })}
      </div>
    );
  }

  // full mode UI
  return (
    <div className="ingredient-search-root">
      {/* Selected tags row (show selected ingredients) */}
      <div className="selected-row">
        {selected.length === 0 ? (
          <div className="selected-placeholder">No ingredients selected</div>
        ) : (
          selected.map(s => (
            <div key={s} className="selected-chip">
              <span>{s}</span>
              <button className="x-btn" onClick={() => removeSelected(s)} aria-label={`Remove ${s}`}>×</button>
            </div>
          ))
        )}
      </div>

      {/* Input + Suggest area */}
      <div className="input-row">
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Type or paste ingredients, press Enter to add"
          className="ingredient-input"
          aria-label="ingredient input"
        />
        <button className="add-btn" onClick={handleAddFromInput} type="button">Add</button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggest) && (
        <div className="suggestions-box">
          {loadingSuggest && <div className="suggest-loading">Searching...</div>}
          {!loadingSuggest && suggestions.map(s => (
            <button
              key={s}
              className="suggest-item"
              onClick={() => toggleIngredient(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Categories accordion */}
      <div className="categories-root">
        {categories.map(cat => (
          <div key={cat.id} className="category">
            <div className="category-header" onClick={() => onCategoryToggle(cat.id)} role="button" tabIndex={0}>
              <div>
                <strong>{cat.title}</strong>
                <div className="small-muted">{cat.items.length} ingredients</div>
              </div>
              <div className="chev">{openCat === cat.id ? '▾' : '▸'}</div>
            </div>

            {openCat === cat.id && (
              <div className="category-body">
                <div className="category-items">
                  {cat.items.map(item => {
                    const it = normalizeToken(item);
                    const active = selected.includes(it);
                    return (
                      <button
                        type="button"
                        key={it}
                        className={`chip ${active ? 'chip-active' : ''}`}
                        onClick={() => toggleIngredient(it)}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* small footer help */}
      <div className="ingredient-help">
        Tip: click chips to add ingredients. Paste comma separated list into input and press Add.
      </div>
    </div>
  );
}

IngredientSearch.propTypes = {
  onSelectIngredients: PropTypes.func,
  minimal: PropTypes.bool,
  initial: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  apiBase: PropTypes.string
};
