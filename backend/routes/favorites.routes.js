const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");

// 🔐 GET favorites
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to load favorites" });
  }
});

// ❤️ ADD favorite
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { recipe } = req.body;

    if (!recipe || !recipe.id) {
      return res.status(400).json({ message: "Recipe required" });
    }

    const user = await User.findById(req.user.userId);

    const exists = user.favorites.find((r) => r.id === recipe.id);
    if (exists) {
      return res.json(user.favorites); // already added
    }

    user.favorites.push(recipe);
    await user.save();

    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// ❌ REMOVE favorite
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;

    const user = await User.findById(req.user.userId);
    user.favorites = user.favorites.filter((r) => r.id !== recipeId);

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = router;
