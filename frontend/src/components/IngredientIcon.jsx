import React from "react";

const ICON_MAP = {
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
  paneer: "🧈",

  egg: "🥚",
  chicken: "🍗",
  fish: "🐟",
  lentils: "🫘",
  chickpeas: "🫘",

  garlic: "🧄",
  ginger: "🫚",
  chili: "🌶️",
  pepper: "🧂",
};

export default function IngredientIcon({ name, selected }) {
  return (
    <span
      className={`chip-icon ${selected ? "selected-icon" : ""}`}
      aria-hidden
    >
      {ICON_MAP[name] || "🍽️"}
    </span>
  );
}
