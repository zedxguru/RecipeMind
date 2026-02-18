// frontend/src/components/Hero.jsx
import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">

        <h1 className="hero-title">
          Discover Recipes from <span>Your Ingredients</span>
        </h1>

        <p className="hero-subtitle">
          Turn everyday ingredients into delicious meals instantly.
          Smart search. Clean results. Zero waste.
        </p>

      </div>
    </section>
  );
}