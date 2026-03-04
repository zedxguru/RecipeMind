import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-wrapper">

      {/* HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <h1>About RecipeMind</h1>
          <p>
            Helping you turn everyday ingredients into delicious meals.
          </p>
        </div>
      </section>

      {/* PROFILE SECTION */}
      <section className="about-profile">
        <div className="profile-left">
          <img
            src="/profile.png"
            alt="Sameer"
          />
        </div>

        <div className="profile-right">
          <h2>Hi, I'm Sameer 👋</h2>

          <p>
            I'm a full-stack developer passionate about building smart,
            practical applications. RecipeMind is my production-level
            food discovery platform built using React, Node.js and MongoDB.
          </p>

          <div className="about-stats">
            <div>
              <h3>100+</h3>
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
          </div>
        </div>
      </section>

      {/* BIG IMAGE */}
      <section className="about-image-section">
        <img
          src="/cooking.png"
          alt="Cooking"
        />
      </section>

      {/* FEATURE CARDS */}
      <section className="about-features">
        <div className="feature-card">
          <h3>⚡ Fast Recipes</h3>
          <p>Quick meals designed for busy schedules.</p>
        </div>

        <div className="feature-card">
          <h3>🧠 Smart Cooking</h3>
          <p>Use what you already have at home.</p>
        </div>

        <div className="feature-card">
          <h3>🎨 Creative Ideas</h3>
          <p>Transform simple ingredients into flavorful dishes.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Start Discovering Recipes Today</h2>
        <p>Explore, save favorites, and cook smarter.</p>
      </section>

    </div>
  );
}