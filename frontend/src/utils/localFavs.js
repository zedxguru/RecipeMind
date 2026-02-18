// src/utils/localFavs.js

const KEY = "recipe_favs";

export function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function isFav(id) {
  return getFavs().some(r => (r.id || r._id) === id);
}

export function toggleLocalFav(recipe) {
  let favs = getFavs();
  const id = recipe.id || recipe._id;

  const exists = favs.find(r => (r.id || r._id) === id);

  if (exists) {
    favs = favs.filter(r => (r.id || r._id) !== id);
  } else {
    favs.push(recipe); // 👈 FULL recipe save
  }

  localStorage.setItem(KEY, JSON.stringify(favs));
  return favs;
}
