// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import "../components/Hero.css";

const API = "http://localhost:5000";

export default function Home() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(async (ingredientsArr) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/search-by-ingredients`, {
        ingredients: ingredientsArr,
      });
      setResults(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Check backend or network.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // auto-run when navbar sends ?q=...
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const decoded = decodeURIComponent(q);
      const list = decoded
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length) doSearch(list);
    }
  }, [searchParams, doSearch]);

  // quick search handler from hero buttons
  const onQuickSearch = (query) => {
    const list = query
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) doSearch(list);
  };

  return (
    <div>
      <Hero onQuickSearch={onQuickSearch} />
      <div className="container">
        {/* feature row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <div className="mini-card">⭐ Save favorites</div>
          <div className="mini-card">🕒 Auto suggestions</div>
          <div className="mini-card">📋 Grocery list</div>
        </div>

        <div className="hero-right">
          <img
            src="/hero-cooking.png"
            alt="cooking"
            style={{ width: "320px", maxWidth: "45%" }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/320x220?text=Cooking";
            }}
          />
        </div>

        {/* results / empty state */}
        {loading && <p>Loading recipes...</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {!loading && !error && results.length === 0 && (
          <div
            style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}
            className="card"
          >
            <img
              src="/empty-kitchen.png"
              style={{ width: 140, opacity: 0.95 }}
              alt="empty"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/140?text=Empty";
              }}
            />
            <h3 style={{ marginTop: 12 }}>No recipes yet</h3>
            <p>
              Use the search box in the top bar to find recipes from your
              ingredients.
            </p>
            <button
              className="btn-primary"
              onClick={() => onQuickSearch("egg,tomato")}
            >
              Try a sample search
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 18,
          }}
        >
          {results.map((item) => (
            <div
              key={item.id || item.title}
              className="card"
              style={{ overflow: "hidden" }}
            >
              <img
                src={item.image || "https://via.placeholder.com/400x250"}
                alt={item.title}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
              <div style={{ padding: 12 }}>
                <h4 style={{ margin: "6px 0" }}>{item.title}</h4>
                <p
                  style={{
                    margin: "6px 0",
                    color: "var(--muted)",
                    fontSize: 14,
                  }}
                >
                  Used: {item.usedIngredients ?? item.matched?.length ?? 0}{" "}
                  • Missed: {item.missedIngredients ?? 0}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Link
                    to={`/recipe/${item.id}`}
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
                    View
                  </Link>
                  <small style={{ color: "var(--muted)" }}>
                    {item.score
                      ? `Score: ${Math.round(item.score * 100)}%`
                      : ""}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
