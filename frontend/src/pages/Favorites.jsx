// src/pages/Favorites.jsx
import React, { useEffect, useState } from 'react';
import { getLocalFavs } from '../utils/localFavs';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FavButtonLocal from '../components/FavButtonLocal';

const API = 'http://localhost:5000';

export default function Favorites(){
  const [ids, setIds] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const arr = getLocalFavs();
    setIds(arr);
  }, []);

  useEffect(() => {
    async function load(){
      if(!ids || ids.length === 0) { setRecipes([]); return; }
      setLoading(true);
      try {
        // fetch details for each id (parallel)
        const requests = ids.map(id => axios.get(`${API}/api/recipe/${id}`).then(r => r.data).catch(()=>null));
        const results = await Promise.all(requests);
        setRecipes(results.filter(Boolean));
      } catch(err){
        console.error('fav load err', err);
      } finally { setLoading(false); }
    }
    load();
  }, [ids]);

  return (
    <div className="container" style={{ padding:'28px 20px' }}>
      <h2>Your Favorites</h2>
      {loading && <p>Loading favorites...</p>}
      {!loading && recipes.length === 0 && <p>No favorites yet. Add some recipes to favorites ❤️</p>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16, marginTop:16 }}>
        {recipes.map(r => (
          <div key={r.id || r._id} className="card">
            <img src={r.image || 'https://via.placeholder.com/400x250'} alt={r.title} style={{ width:'100%', height:140, objectFit:'cover' }}
                 onError={e=>{ e.target.onerror=null; e.target.src='https://via.placeholder.com/400x250?text=Recipe'; }} />
            <div style={{ padding:10 }}>
              <h4 style={{ margin:'6px 0' }}>{r.title}</h4>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Link to={`/recipe/${r.id || r._id}`}>View</Link>
                <FavButtonLocal recipeId={r.id || r._id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
