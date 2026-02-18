// frontend/src/components/TopSearchBar.jsx
import React, { useState, useCallback, useRef } from "react";
import IngredientSearch from "./IngredientSearch";
import PropTypes from "prop-types";
import "./TopSearchBar.css";

/*
Props:
 - onSearch(arrayOfIngredients)  // called when user presses Search or Enter
 - initial (string) optional initial comma-separated value
 - apiBase optional (not used here)
 - showChips boolean (default true) -> shows category groups under the search input
*/

export default function TopSearchBar({ onSearch = () => {}, initial = "", showChips = true }) {
  const [input, setInput] = useState(initial || "");
  const selectedRef = useRef([]); // hold selected chips from IngredientSearch

  // stable callback passed to IngredientSearch
  const onSelectIngredients = useCallback((list) => {
    // store in ref, but don't force rerender here
    selectedRef.current = Array.isArray(list) ? list : [];
    // if user hasn't typed anything, reflect chips in input visually (non-destructive)
    setInput(prev => {
      const typed = prev && prev.toString().trim() !== "";
      if (typed) return prev;
      return selectedRef.current.join(", ");
    });
  }, []);

  // search trigger (stable)
  const handleSearch = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();

    // build array from input + selected chips
    const arr = [];
    (input || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => arr.push(x.toLowerCase()));
    (selectedRef.current || []).forEach(c => {
      const t = (c || "").toString().trim().toLowerCase();
      if (t && !arr.includes(t)) arr.push(t);
    });

    if (arr.length === 0) return;
    onSearch(arr);
  }, [input, onSearch]);

  return (
    <div className="top-searchbar">
      <form className="top-search-form" onSubmit={handleSearch}>
        <input
          className="top-search-input"
          placeholder="Add ingredients (e.g. tomato, egg) — press Enter or click Search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
          aria-label="Search ingredients"
        />
        <button type="button" className="top-search-btn" onClick={handleSearch}>Search</button>
      </form>

      {showChips && (
        // minimal mode shows horizontal chips only (fast selection)
        <div style={{ marginTop: 10 }}>
          <IngredientSearch minimal onSelectIngredients={onSelectIngredients} />
        </div>
      )}
    </div>
  );
}

TopSearchBar.propTypes = {
  onSearch: PropTypes.func,
  initial: PropTypes.string,
  showChips: PropTypes.bool
};
