import React from "react";
import "./SkeletonCard.css";

export default function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-img shimmer"></div>
      <div className="skeleton-text shimmer"></div>
      <div className="skeleton-text short shimmer"></div>
    </div>
  );
}