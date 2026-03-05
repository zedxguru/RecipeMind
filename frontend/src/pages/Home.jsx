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
  const [animateResults, setAnimateResults] = useState(false);
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile]= useState(null);

  const [searchParams] = useSearchParams();
  const navQuery = searchParams.get("q");

  // 🔹 AI Ingredient Detection
  const detectIngredients = async () => {
    if (!imageUrl) return;

    try {
      const res = await axios.post(`${API}/api/image/detect`, {
        imageUrl,
      });

      const detected = res.data.ingredients.join(", ");

      setIngredients(detected);
      handleSearchFromNav(detected);

    } catch (err) {
      setError("AI detection failed");
    }
  };

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
      setTimeout(() => setAnimateResults(true), 100);
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

  const detectFromImage = async () => {

if(!imageFile){
setError("Please upload an image");
return;
}

const formData = new FormData();

formData.append("image",imageFile);

try{

const res = await axios.post(
`${API}/api/image/detect`,
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);

const detected = res.data.ingredients.join(", ");

setIngredients(detected);

handleSearchFromNav(detected);

}catch(err){

setError("AI detection failed");

}

};
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
      setTimeout(() => setAnimateResults(true), 100);
    } catch (e) {
      setError("Search failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 20 }}>
      <Hero />
      {/* FEATURED RECIPES */}
      <section className="home-featured">
        <h2>🔥 Popular Recipes</h2>

        <div className="featured-grid">
          <div
            className="featured-card"
            onClick={() => handleSearchFromNav("pasta")}
          >
            <img src="/images/pasta.jpg" alt="Pasta" />
            <span>Italian Pasta</span>
          </div>

          <div
            className="featured-card"
            onClick={() => handleSearchFromNav("paneer")}
          >
            <img src="/images/paneer.jpg" alt="Paneer" />
            <span>Paneer Butter Masala</span>
          </div>

          <div
            className="featured-card"
            onClick={() => handleSearchFromNav("salad")}
          >
            <img src="/images/salad.jpg" alt="Salad" />
            <span>Healthy Salad</span>
          </div>

          <div
            className="featured-card"
            onClick={() => handleSearchFromNav("burger")}
          >
            <img src="/images/burger.jpg" alt="Burger" />
            <span>Homemade Burger</span>
          </div>
        </div>
      </section>

      {/* 🍳 BROWSE BY CATEGORY */}
      <section className="home-categories">
        <h2>🍳 Browse by Category</h2>

        <div className="category-grid">
          <div
            className="category-card"
            onClick={() => handleSearchFromNav("chicken")}
          >
            <img src="/images/chicken.jpg" alt="Chicken" />
            <span>Chicken</span>
          </div>

          <div
            className="category-card"
            onClick={() => handleSearchFromNav("vegetarian")}
          >
            <img src="/images/veg.jpg" alt="Vegetarian" />
            <span>Vegetarian</span>
          </div>

          <div
            className="category-card"
            onClick={() => handleSearchFromNav("pasta")}
          >
            <img src="/images/pasta.jpg" alt="Pasta" />
            <span>Pasta</span>
          </div>

          <div
            className="category-card"
            onClick={() => handleSearchFromNav("dessert")}
          >
            <img src="/images/dessert.jpg" alt="Dessert" />
            <span>Dessert</span>
          </div>
        </div>
      </section>

      {/* TITLE 
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1>RecipeMind — Find recipes from ingredients</h1>
        <p style={{ color: "#777" }}>
          Use ingredient chips or type ingredients, then press Search
        </p>
      </div> */}
      {/* ⭐ AI IMAGE DETECTION */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          style={{
            padding: 10,
            width: 300,
            marginRight: 10,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={detectFromImage}
          style={{
            marginLeft:10,
            padding: "8px 16px",
            background: "#ff5c8a",
            border: "none",
            color: "white",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Detect Ingredients
        </button>
      </div>
      
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
          }`}
        >
          Search
        </button>
      </div>

      {/* ERROR STATUS */}
      {error && (
        <p style={{ color: "crimson", textAlign: "center" }}>{error}</p>
      )}

      {/* SKELETON LOADING RESULTS */}
      {loading && (
        <div className="results-grid">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      {/* REAL RESULTS */}
      {!loading && results.length === 0 && ingredients && (
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
      {/* ⭐ WHY RECIPEMIND */}
      <section className="why-section">
        <h2>Why RecipeMind?</h2>

        <div className="why-grid">
          <div className="why-card">
            <h3>⚡ Fast Search</h3>
            <p>Find recipes instantly from ingredients you already have.</p>
          </div>

          <div className="why-card">
            <h3>❤️ Save Favorites</h3>
            <p>Bookmark your favorite recipes for quick access later.</p>
          </div>

          <div className="why-card">
            <h3>🍳 Smart Cooking</h3>
            <p>
              Reduce food waste and cook smarter with available ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* 📊 STATS */}
      <section className="stats-section">
        <div>
          <h3>1000+</h3>
          <span>Recipes Indexed</span>
        </div>

        <div>
          <h3>Fast</h3>
          <span>Search Engine</span>
        </div>

        <div>
          <h3>Modern</h3>
          <span>UI Experience</span>
        </div>
      </section>
    </div>
  );
}
