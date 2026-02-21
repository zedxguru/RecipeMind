import React, { useEffect, useState } from "react";
import IngredientCategories from "../components/IngredientCategories";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import FavButtonAuth from "../components/FavButtonAuth";
import "../components/RecipeCard.css";
import Hero from "../components/Hero";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animateResults,setAnimateResults] = useState(false);

  const [searchParams] = useSearchParams();
  const navQuery = searchParams.get("q");

  // 🔹 Navbar search handler
  const handleSearchFromNav = async (queryString) => {
    const list = queryString
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (!list.length) return;

    setLoading(true);
    setError("");
    setAnimateResults(false);

    try {
      const res = await axios.post(`${API}/api/search-by-ingredients`, {
        ingredients: list,
      });
      setResults(res.data || []);
      setTimeout(()=>
        setAnimateResults(true),100);
    } catch (e) {
      setError("Search failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Trigger when navbar search changes
  useEffect(() => {
    if (navQuery) {
      setIngredients(navQuery);
      const arr = navQuery
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      setSelectedIngredients(arr);
      handleSearchFromNav(navQuery);
    }
  }, [navQuery]);

  // 🔹 Normal search (Manual)
  const handleSearch = async () => {
    const list = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (!list.length) {
      setError("Please add at least one ingredient");
      return;
    }

    setLoading(true);
    setError("");
    setAnimateResults(false);

    try {
      const res = await axios.post(`${API}/api/search-by-ingredients`, {
        ingredients: list,
      });
      setResults(res.data || []);
      setTimeout(() =>
      setAnimateResults(true),100);
    } catch (e) {
      setError("Search failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 20 }}>
     <Hero />
      {/* TITLE 
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1>RecipeMind — Find recipes from ingredients</h1>
        <p style={{ color: "#777" }}>
          Use ingredient chips or type ingredients, then press Search
        </p>
      </div> */}
      <div className="container-home-body"></div>
      {/* INGREDIENT CATEGORIES */}
      <IngredientCategories
        selected={selectedIngredients}
        onSelect={(item) => {
          let updated;
          if (selectedIngredients.includes(item)) {
            updated = selectedIngredients.filter((i) => i !== item);
          } else {
            updated = [...selectedIngredients, item];
          }
          setSelectedIngredients(updated);
          setIngredients(updated.join(", "));
        }}
      />

      {/* SEARCH INPUT */}
      <div className="home-search-wrapper">
        <input
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. tomato, paneer, onion"
          className="home-search-input"
        />
        <button
          onClick={handleSearch}
          className={`home-search-btn ripple-btn ${
            !loading && results.length === 0 ? "pulse-btn" : ""
          }`}>
          Search
        </button>
      </div>

      {/* ERROR STATUS */}
      {error && (
        <p style={{ color: "crimson", textAlign: "center" }}>{error}</p>
      )}

      {/* SKELETON LOADING RESULTS */}
      {loading &&(
        <div className="results-grid">
          {[...Array(6)].map((_, i)=>(
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {/* REAL RESULTS */}
      {!loading && results.length === 0 && ingredients &&
      (
        <EmptyState message="We couldn't find recipe for thos ingredients. Try something else!" />
      )}
      <div className={`results-grid ${animateResults ? "fade-in" : ""}`}>
        {results.map((item) => {
          console.log("ITEM:", item);
          console.log("ITEM.URI:", item.uri);
          return (
            <div key={item.id} className="recipe-card">
              <div className="recipe-image-wrapper">
              <img src={item.image} alt={item.title} />
              {/*❤️ Favorite Button*/}
              <div className="recipe-fav-btn">
                <FavButtonAuth recipe={item} />
              </div>
              </div>
              <div className="recipe-card-body">
                <div className="recipe-title">{item.title}</div>
                <div className="recipe-meta">
                  <span>🔥{item.calories}kcal</span>
                  <span>
                    Used: {item.usedIngredients} | Missed:{" "}
                    {item.missedIngredients}
                  </span>
                </div>
                <Link to={`/recipe/${encodeURIComponent(item.id)}`}>
                  <button className="recipe-btn ripple-btn">View Recipe</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
