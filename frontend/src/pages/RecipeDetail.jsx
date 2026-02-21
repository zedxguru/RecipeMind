import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FavButtonAuth from "../components/FavButtonAuth";
import "./RecipeDetail.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function RecipeDetail() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `${API}/api/recipe/${encodeURIComponent(id)}`,
        );
        setRecipe(res.data);
      } catch (error) {
        setErr("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id]);

  if (loading) return <div className="recipe-loading">Loading recipe...</div>;

  if (err) return <div className="recipe-error">{err}</div>;

  if (!recipe) return null;

  return (
    <div className="recipe-detail-container">
      {/* LEFT IMAGE */}
      <div className="recipe-detail-left">
        <img
          src={recipe.image || "/no-image.png"}
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/800x450?text=No+Image";
          }}
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className="recipe-detail-right">
        <div className="recipe-detail-header">
          <h1>{recipe.title}</h1>
          <FavButtonAuth
            recipe={{
              id: recipe.id || recipe._id,
              title: recipe.title,
              image: recipe.image,
            }}
          />
        </div>

        {/* Nutrition Card */}
        <div className="nutrition-card">
          <div className="nutrition-item">
            <span>🔥 Calories</span>
            <strong>{recipe.calories ?? "N/A"}</strong>
          </div>
        </div>

        {/* Ingredients */}
        <section>
          <h3>Ingredients</h3>
          {Array.isArray(recipe.ingredients) && recipe.ingredients.length ? (
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p>No ingredient information available.</p>
          )}
        </section>

        {/* Instructions */}
        <section>
          <h3>Instructions</h3>

          {recipe.instructions ? (
            recipe.instructions.split("\n").map((line, idx) => (
              <p key={idx} className="instructions-text">
                {line}
              </p>
            ))
          ) : (
            <div className="instruction-fallback">
              <p>Detailed instructions are available on the original source.</p>

              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="source-btn"
                >
                  View Full Instructions ↗
                </a>
              )}
            </div>
          )}
        </section>

        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="source-btn"
          >
            View Full Recipe ↗
          </a>
        )}
      </div>
    </div>
  );
}
