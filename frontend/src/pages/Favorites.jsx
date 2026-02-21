import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Favorites() {
  const token = getToken();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 protect page
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // 📥 load favorites from backend
  useEffect(() => {
    if (!token) return;

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${API}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(res.data || []);
      } catch (err) {
        console.error("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading favorites…</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2>Your Favorites ❤️</h2>

      {favorites.length === 0 ? (
        <p style={{ color: "#666", marginTop: 20 }}>
          No favorites yet. ❤️ some recipes!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {favorites.map((r) => (
            <div
              key={r.uri}
              style={{
                borderRadius: 12,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <img
                src={r.image || "https://via.placeholder.com/400x250"}
                alt={r.title}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
              <div style={{ padding: 12 }}>
                <h4 style={{ marginBottom: 8 }}>{r.title}</h4>
                <Link to={`/recipe/${encodeURIComponent(r.id)}`}>View recipe</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}