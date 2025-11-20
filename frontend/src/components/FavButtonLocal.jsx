// src/components/FavButtonLocal.jsx
import React, { useState, useEffect } from 'react';
import { isFav, toggleLocalFav } from '../utils/localFavs';

export default function FavButtonLocal({ recipeId, className }) {
  const [fav, setFav] = useState(isFav(recipeId));

  useEffect(() => {
    setFav(isFav(recipeId));
    // listen to storage events (if user has multiple tabs)
    const onStorage = (e) => {
      if(e.key === 'rm_favs') setFav(isFav(recipeId));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [recipeId]);

  const toggle = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    const arr = toggleLocalFav(recipeId);
    setFav(arr.includes(recipeId));
  };

  return (
    <button
      onClick={toggle}
      className={`fav-btn-local ${className || ''}`}
      title={fav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={fav}
      style={{ border:0, background:'transparent', cursor:'pointer', fontSize:18 }}
    >
      <span style={{ color: fav ? '#ff5a5a' : '#aaa' }}>{fav ? '♥' : '♡'}</span>
    </button>
  );
}
