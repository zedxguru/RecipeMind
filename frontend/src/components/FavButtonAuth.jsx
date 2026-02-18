// src/components/FavButtonAuth.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function FavButtonAuth({ recipe }) {
  const navigate = useNavigate();
  const token = getToken();

  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 check if already favorite
  useEffect(() => {
    if (!token || !recipe?.id) return;

    const checkFav = async () => {
      try {
        const res = await axios.get(`${API}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const exists = res.data.some((r) => r.id === recipe.id);
        setFav(exists);
      } catch (err) {
        console.log("Fav check failed");
      }
    };

    checkFav();
  }, [recipe?.id, token]);

  // ❤️ toggle favorite
  const toggleFavorite = async (e) => {
    e.stopPropagation();

    // 🔐 not logged in
    if (!token) {
      alert("Login to save favorites ❤️");
      navigate("/login");
      return;
    }

    if (!recipe?.id) return;

    try {
      setLoading(true);

      if (fav) {
        // REMOVE
        await axios.post(`${API}/api/favorites/remove`,
                {recipeId: recipe.id},
                {headers: { Authorization: `Bearer ${token}` },
        });
        setFav(false);
      } else {
        // ❤️ADD
        await axios.post(
          `${API}/api/favorites/add`,
          {recipe},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFav(true);
      }
    } catch (err) {
      alert("Failed to update favorite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      title={fav ? "Remove from favorites" : "Add to favorites"}
      style={{
        border: "none",
        background: "transparent",
        fontSize: 22,
        cursor: "pointer",
        color: fav ? "#ff4c77" : "#aaa",
      }}
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}