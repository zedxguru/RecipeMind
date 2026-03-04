import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h2>
            <span>Recipe</span>Mind
          </h2>
          <p>
            Discover recipes from ingredients you already have.
            Smart. Fast. Delicious.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="footer-contact">
          <h4>Connect</h4>
          <p>Email: support@recipemind.com</p>
          <p>Made with ❤️ by Sameer</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} RecipeMind. All rights reserved.
      </div>
    </footer>
  );
}