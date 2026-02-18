// RecipeDetail.jsx — FULL & FINAL (stable)

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FavButtonAuth from "../components/FavButtonAuth";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function RecipeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/api/recipe/${encodeURIComponent(id)}`
        );
        const json = await res.json();
        if (!cancelled) {
          setData(json);

          // ⭐ VERY IMPORTANT for Favorites
          window.__CURRENT_RECIPE__ = json;
        }
      } catch (e) {
        if (!cancelled) setErr("Failed to load recipe");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <p>Loading recipe...</p>
      </div>
    );

  if (err)
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>{err}</p>
      </div>
    );

  if (!data) return null;

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ flex: "1 1 600px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <h1 style={{ margin: 0 }}>{data.title}</h1>
            <FavButtonAuth recipe={{
              id:data.id || data._id,
              title: data.title,
              image: data.image
            }} />
          </div>

          <img
            src={data.image || "/no-image.png"}
            alt={data.title}
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              borderRadius: 14,
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/800x450?text=No+Image";
            }}
          />

          {/* INGREDIENTS */}
          <section style={{ marginTop: 20 }}>
            <h3>Ingredients</h3>
            {Array.isArray(data.ingredients) && data.ingredients.length ? (
              <ul>
                {data.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            ) : (
              <p>No ingredient information available.</p>
            )}
          </section>

          {/* INSTRUCTIONS */}
          <section style={{ marginTop: 18 }}>
            <h3>Instructions</h3>
            {data.instructions ? (
              data.instructions
                .split("\n")
                .map((line, idx) => (
                  <p key={idx} style={{ margin: "6px 0" }}>
                    {line}
                  </p>
                ))
            ) : data.sourceUrl ? (
              <p>
                Instructions not provided.{" "}
                <a
                  href={data.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original source
                </a>
              </p>
            ) : (
              <p>No instructions provided.</p>
            )}
          </section>
        </div>

        {/* RIGHT SIDE */}
        <aside style={{ width: 300, minWidth: 260 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <h4>Nutrition</h4>
            <p>Calories: {data.calories ?? "N/A"}</p>

            {data.nutrients && Object.keys(data.nutrients).length ? (
              <div style={{ fontSize: 13 }}>
                {Object.values(data.nutrients)
                  .slice(0, 6)
                  .map((n, i) => (
                    <div key={i}>
                      <strong>{n.label}</strong>:{" "}
                      {Math.round(n.quantity)} {n.unit}
                    </div>
                  ))}
              </div>
            ) : (
              <p>No nutrition data.</p>
            )}

            {data.sourceUrl && (
              <p style={{ marginTop: 8, fontSize: 13 }}>
                Source:{" "}
                <a href={data.sourceUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
