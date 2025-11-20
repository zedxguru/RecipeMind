// server.js — full final (Edamam + Mongo + suggest + fallback)
// Paste into recipemind/backend/server.js (replace existing)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- Models (make sure models/Recipe.js exists as discussed earlier)
let Recipe;
try {
  Recipe = require('./models/Recipe');
} catch (e) {
  console.warn('Recipe model not found — some endpoints will fallback to mocks.');
}

// --- Basic server info
const PORT = process.env.PORT || 5000;

// --- Connect MongoDB
const mongoUrl = process.env.MONGO_URI || process.env.MONGODB_URI || '';
if (mongoUrl) {
  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connect error:', err && err.message ? err.message : err));
} else {
  console.warn('No MONGO_URI in .env — running without MongoDB.');
}

// --- Local ingredients fallback list (used by suggest endpoint)
const LOCAL_INGREDIENTS = [
  'tomato','onion','garlic','egg','rice','potato','milk','butter',
  'cheese','chicken','paneer','flour','sugar','salt','pepper','carrot',
  'cabbage','spinach','beans','moong dal','chana','lentils','yogurt',
  'olive oil','oil','ginger','lemon','coriander','cumin','turmeric',
  'green chili','bell pepper','corn','mushroom','broccoli','bread','garlic'
];

// ---------- SUGGEST INGREDIENTS (tries DB first, otherwise local filter) ----------
app.get('/api/suggest-ingredients', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    if (!q) return res.json({ suggestions: [] });

    // Try DB distinct ingredients if model exists
    if (Recipe) {
      try {
        const agg = [
          { $unwind: '$ingredients' },
          { $group: { _id: '$ingredients' } },
          { $match: { _id: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } },
          { $limit: 30 },
          { $project: { name: '$_id', _id: 0 } }
        ];
        const rows = await Recipe.aggregate(agg).allowDiskUse(true);
        const suggestions = rows.map(r => r.name).slice(0, 10);
        if (suggestions && suggestions.length) return res.json({ suggestions });
      } catch (err) {
        console.warn('Suggest DB agg failed:', err && err.message ? err.message : err);
      }
    }

    // Local fallback (prefix + contains)
    const prefix = LOCAL_INGREDIENTS.filter(x => x.startsWith(q));
    const contains = LOCAL_INGREDIENTS.filter(x => !x.startsWith(q) && x.includes(q));
    const suggestions = [...new Set([...prefix, ...contains])].slice(0, 10);
    return res.json({ suggestions });
  } catch (err) {
    console.error('suggest err', err);
    return res.status(500).json({ suggestions: [] });
  }
});

// ---------- SEARCH BY INGREDIENTS (Edamam primary, fallback to Mongo & mocks) ----------
app.post('/api/search-by-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients required (array)' });
    }

    // Normalize
    const input = ingredients.map(i => i.toString().toLowerCase().trim()).filter(Boolean);
    if (!input.length) return res.json([]);

    // Try Edamam first (stable for dev)
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
    const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
    const userHeader = process.env.EDAMAM_ACCOUNT_USER || 'dev_user';

    if (EDAMAM_APP_ID && EDAMAM_APP_KEY) {
      try {
        const query = input.join(', ');
        const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

        const headers = {
          'Edamam-Account-User': userHeader,
          'Accept': 'application/json'
        };

        const r = await axios.get(url, { timeout: 12000, headers });
        const hits = r.data.hits || [];
        const formatted = hits.map(item => {
          const rcp = item.recipe;
          return {
            id: (rcp.uri || '').split('#recipe_')[1] || rcp.uri, // safe id
            title: rcp.label,
            image: rcp.image,
            usedIngredients: input.length,
            missedIngredients: 0,
            calories: Math.round(rcp.calories || 0),
            ingredientsList: rcp.ingredientLines
          };
        });
        if (formatted.length) return res.json(formatted);
      } catch (err) {
        console.warn('Edamam search failed:', err.response?.data || err.message || err);
        // continue to fallback
      }
    }

    // Fallback 1: If we have Recipe model, use Mongo aggregation search
    if (Recipe) {
      try {
        const pipeline = [
          {
            $addFields: {
              usedIngredients: { $size: { $setIntersection: ['$ingredients', input] } },
              totalIngredients: { $size: '$ingredients' }
            }
          },
          {
            $addFields: {
              missedIngredients: { $subtract: ['$totalIngredients', '$usedIngredients'] },
              score: {
                $cond: [{ $gt: ['$totalIngredients', 0] }, { $divide: ['$usedIngredients', '$totalIngredients'] }, 0]
              }
            }
          },
          { $match: { usedIngredients: { $gt: 0 } } },
          { $sort: { usedIngredients: -1, score: -1, readyInMinutes: 1 } },
          { $limit: 50 },
          {
            $project: {
              title: 1, image: 1, ingredients: 1, usedIngredients: 1, missedIngredients: 1, score: 1, readyInMinutes: 1
            }
          }
        ];
        const results = await Recipe.aggregate(pipeline).allowDiskUse(true);
        if (results && results.length) {
          // map to same shape
          const mapped = results.map(r => ({
            id: r._id.toString(),
            title: r.title,
            image: r.image,
            usedIngredients: r.usedIngredients,
            missedIngredients: r.missedIngredients,
            ingredientsList: r.ingredients || []
          }));
          return res.json(mapped);
        }
      } catch (err) {
        console.warn('Mongo search failed:', err && err.message ? err.message : err);
      }
    }

    // Final fallback: simple mock results (guarantee some output)
    const mockResults = [
      {
        id: '900001',
        title: "Quick Tomato Egg Stir-fry",
        image: "https://via.placeholder.com/400x250?text=Tomato+Egg",
        usedIngredients: input.filter(i => ['tomato','egg'].includes(i)).length,
        missedIngredients: 0
      },
      {
        id: '900002',
        title: "Simple Rice & Veg",
        image: "https://via.placeholder.com/400x250?text=Rice+Veg",
        usedIngredients: input.filter(i => ['rice','potato'].includes(i)).length,
        missedIngredients: 1
      },
      {
        id: '900003',
        title: "Garlic Butter Toast",
        image: "https://via.placeholder.com/400x250?text=Garlic+Toast",
        usedIngredients: input.filter(i => ['bread','garlic','butter'].includes(i)).length,
        missedIngredients: 1
      }
    ];

    return res.json(mockResults);
  } catch (err) {
    console.error('search error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// ---------- RECIPE DETAIL (Mongo -> Edamam -> mocks) ----------
app.get('/api/recipe/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // 1) If it's a Mongo ObjectId and model exists, try DB first
    if (Recipe && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const doc = await Recipe.findById(id).lean();
        if (doc) {
          return res.json({
            id: doc._id,
            title: doc.title,
            image: doc.image,
            ingredients: doc.ingredients || [],
            instructions: doc.instructions || (Array.isArray(doc.ingredients) ? doc.ingredients.join('\n') : null),
            nutrients: doc.nutrition || {},
            calories: doc.calories || null
          });
        }
      } catch (err) {
        console.warn('recipe detail DB fetch failed:', err && err.message ? err.message : err);
      }
    }

    // 2) Try Edamam detail (if id looks like Edamam recipe id)
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
    const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
    const userHeader = process.env.EDAMAM_ACCOUNT_USER || 'dev_user';

    if (EDAMAM_APP_ID && EDAMAM_APP_KEY) {
      try {
        const url = `https://api.edamam.com/api/recipes/v2/${encodeURIComponent(id)}?type=public&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
        const headers = { 'Edamam-Account-User': userHeader, 'Accept': 'application/json' };
        const r = await axios.get(url, { timeout: 12000, headers });
        const recipe = r.data.recipe;

        // prepare fallback instructions
        const ingredientLines = recipe.ingredientLines || [];
        const sourceUrl = recipe.url || recipe.sourceUrl || null;
        const instructions =
          (recipe.instructions && recipe.instructions.trim()) ||
          (Array.isArray(ingredientLines) && ingredientLines.length ? ingredientLines.join('\n') : null) ||
          (sourceUrl ? `Open original: ${sourceUrl}` : null);

        return res.json({
          id,
          title: recipe.label,
          image: recipe.image,
          ingredients: ingredientLines,
          instructions,
          sourceUrl,
          nutrients: recipe.totalNutrients || {},
          calories: Math.round(recipe.calories || 0),
          cuisine: recipe.cuisineType || [],
          mealType: recipe.mealType || []
        });
      } catch (err) {
        console.warn('Edamam detail failed:', err.response?.data || err.message || err);
        // continue to fallback
      }
    }

    // 3) Final mock fallback (for mock ids)
    const mockMap = {
      '900001': {
        id: '900001',
        title: "Quick Tomato Egg Stir-fry",
        image: "https://via.placeholder.com/800x500?text=Tomato+Egg",
        ingredients: ["2 tomatoes, chopped", "2 eggs", "1 tbsp oil", "salt"],
        instructions: "Heat oil.\nCook tomatoes.\nAdd eggs and scramble.\nSeason and serve.",
        calories: 200
      },
      '900002': {
        id: '900002',
        title: "Simple Rice & Veg",
        image: "https://via.placeholder.com/800x500?text=Rice+Veg",
        ingredients: ["1 cup rice", "1 potato", "salt", "oil"],
        instructions: "Boil rice.\nSauté vegetables.\nMix and serve.",
        calories: 320
      },
      '900003': {
        id: '900003',
        title: "Garlic Butter Toast",
        image: "https://via.placeholder.com/800x500?text=Garlic+Toast",
        ingredients: ["Bread slices", "Garlic", "Butter"],
        instructions: "Toast bread.\nSpread garlic butter.\nServe hot.",
        calories: 150
      }
    };

    if (mockMap[id]) return res.json(mockMap[id]);

    return res.status(404).json({ error: 'Recipe not found' });
  } catch (err) {
    console.error('recipe detail error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// --- simple root
app.get('/', (req, res) => res.send('RecipeMind Backend OK'));

// serve static if you later build frontend here (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});