import React from "react";
import "./EmptyState.css";

export default function EmptyState({ message }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-emoji">🍳</div>
      <h3>No recipes found</h3>
      <p>{message || "Try different ingredients or remove filters."}</p>
    </div>
  );
}