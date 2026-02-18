require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const recipeRoutes = require("./routes/recipe.routes");

const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");
const favoriteRoutes = require("./routes/favorites.routes");

const app = express();

// ===Middleware=== /
app.use(cors());
app.use(express.json());

// ===Routes=== //
app.use("/api/auth", authRoutes);
app.use("/api/favorites",authMiddleware, favoriteRoutes);
app.use("/api/recipe",recipeRoutes);

// MongoDB connect
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ Mongo error:", err.message));
}

// ===Health check=== //
app.get("/", (req, res) => {
  res.send("RecipeMind Backend Running 🚀");
});

// ===PROTECTED TEST ROUTE=== //
app.get("/api/protected-test", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user.userId,
  });
});

// ===== INGREDIENT SUGGESTIONS =====
const LOCAL_INGREDIENTS = [
  "tomato","onion","potato","paneer","chicken","egg",
  "milk","cheese","butter","garlic","ginger","rice",
  "chili","spinach","cabbage","carrot","peas"
];

app.get("/api/suggest-ingredients", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) {return res.json({ suggestions: [] });}

  const suggestions = LOCAL_INGREDIENTS
    .filter((i) => i.includes(q))
    .slice(0, 10);

  res.json({ suggestions });
});

// ===== SEARCH BY INGREDIENTS ===== //
app.post("/api/search-by-ingredients", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: "Ingredients required" });
    }

    const query = ingredients.join(", ");

    const url = "https://api.edamam.com/api/recipes/v2";

    const response = await axios.get(url, {
      params: {
        type: "public",
        q: query,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
      },
      headers: {
        "Edamam-Account-User":
          process.env.EDAMAM_ACCOUNT_USER || "sameervarma",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const hits = response.data.hits || [];

    const recipes = hits.map((h) => ({
      id: h.recipe.uri,
      title: h.recipe.label,
      image: h.recipe.image,
      usedIngredients: ingredients.length,
      missedIngredients: 0,
      calories: Math.round(h.recipe.calories || 0),
    }));

    res.json(recipes);
  } catch (err) {
    console.error(
      "❌ Edamam error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Search failed" });
  }
});

// ====RECIPE DETAIL==== //
app.get("/api/recipe/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    id,
    title: "Sample Recipe",
    image: "https://via.placeholder.com/800x500?text=Recipe",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    instructions: "Cooking steps will be here.",
    calories: 250,
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
