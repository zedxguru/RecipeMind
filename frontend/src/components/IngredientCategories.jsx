import React from "react";
import "./IngredientCategories.css";
import IngredientIcon from "./IngredientIcon";

const INGREDIENT_ICONS = {
  tomato: "🍅",
  onion: "🧅",
  potato: "🥔",
  spinach: "🥬",
  carrot: "🥕",
  capsicum: "🫑",

  milk: "🥛",
  cheese: "🧀",
  butter: "🧈",
  yogurt: "🥣",
  paneer: "🧀",

  egg: "🥚",
  chicken: "🍗",
  fish: "🐟",
  lentils: "🌾",
  chickpeas: "🫘",

  garlic: "🧄",
  ginger: "🫚",
  chili: "🌶️",
  pepper: "🧂",

  rice: "🍚",
  bread: "🍞",
  oil: "🛢️"
};

const categories = [
  {
    title: "Vegetables",
    items: ["tomato", "onion", "potato", "spinach", "carrot", "capsicum"]
  },
  {
    title: "Dairy",
    items: ["milk", "cheese", "butter", "yogurt", "paneer"]
  },
  {
    title: "Proteins",
    items: ["egg", "chicken", "fish", "lentils", "chickpeas"]
  },
  {
    title: "Spices",
    items: ["garlic", "ginger", "chili", "pepper"]
  }
];

export default function IngredientCategories({ onSelect, selected = [] }) {
  return (
    <div className="ingredient-categories">
      {categories.map((cat) => (
        <div key={cat.title} className="category-block">
          <h4 className="category-title">{cat.title}</h4>

          <div className="category-row">
            {cat.items.map((name) => (
              <button
                key={name}
                className={`ingredient-chip ${
                  selected.includes(name) ? "selected" : ""
                }`}
                onClick={() => onSelect(name)}
              >
               <IngredientIcon
  name={name}
  selected={selected.includes(name)}
/>
                <span className="chip-text">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
                {selected.includes(name)&&(
                  <span className="chip-remove">✕</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
