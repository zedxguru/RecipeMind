// src/components/FavButtonLocal.jsx
import React, { useState, useEffect } from "react";
import { isFav, toggleLocalFav } from "../utils/localFavs";

export default function FavButtonLocal({ recipe }) {
  const recipeId = recipe?.id || recipe?._id;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (recipeId) setFav(isFav(recipeId));
  }, [recipeId]);

  const toggle = (e) => {
    e.stopPropagation();
    toggleLocalFav(recipe);
    setFav(isFav(recipeId));
  };

  return (
    <button
      onClick={toggle}
      title={fav ? "Remove from favorites" : "Add to favorites"}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 26,          // ❤️ bada
        lineHeight: 1,
        padding: 4
      }}
    >
      <span style={{ color: fav ? "#ff4d6d" : "#aaa" }}>
        {fav ? "❤️" : "🤍"}
      </span>
    </button>
  );
}
