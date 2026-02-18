import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function FavButton({ recipe }) {
  const token = getToken();
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 🔹 Check if recipe already in favorites
  useEffect(() => {
    if (!token || !recipe?.id) return;

    axios
      .get(`${API}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const exists = res.data.some((r) => r.recipeId === recipe.id);
        setFav(exists);
      })
      .catch(() => {});
  }, [recipe, token]);

  // 🔹 Toggle favorite
  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (!token) {
      setMsg("Login to save favorites ❤️");
      setTimeout(() => setMsg(""), 2000);
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/api/favorites`,
        {
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFav((prev) => !prev);
    } catch (err) {
      setMsg("Failed to update favorite");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggleFavorite}
        disabled={loading}
        title={fav ? "Remove from favorites" : "Add to favorites"}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 20,
        }}
      >
        {fav ? "❤️" : "🤍"}
      </button>

      {msg && (
        <div
          style={{
            position: "absolute",
            top: "120%",
            right: 0,
            background: "#333",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}