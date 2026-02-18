const express = require("express");
const axios = require("axios");

const router = express.Router();

// 🍲 Recipe Detail Route
router.get("/:uri", async (req, res) => {
  try {
    const encodedUri = req.params.uri;
    const decodedUri = decodeURIComponent(encodedUri);

    const APP_ID = process.env.EDAMAM_APP_ID;
    const APP_KEY = process.env.EDAMAM_APP_KEY;

    if (!APP_ID || !APP_KEY) {
      return res.status(500).json({ message: "Edamam API keys missing" });
    }

    const response = await axios.get(
      "https://api.edamam.com/api/recipes/v2/by-uri",
      {
        params: {
          uri: decodedUri,
          app_id: APP_ID,
          app_key: APP_KEY,
          type: "public",
        },
       headers: {
        "Edamam-Account-User":
          process.env.EDAMAM_ACCOUNT_USER || "sameervarma",
        Accept: "application/json",}
      }
    );

    const recipe = response.data.hits?.[0]?.recipe;

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      id: recipe.uri,
      title: recipe.label,
      image: recipe.image,
      ingredients: recipe.ingredientLines,
      instructions:
        recipe.instructions ||
        "Instructions available on source website",
      calories: Math.round(recipe.calories),
      sourceUrl: recipe.url,
    });
  } catch (err) {
    console.error("❌ Recipe detail error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to load recipe detail" });
  }
});

module.exports = router;