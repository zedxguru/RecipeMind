// Home.jsx — full final
// Path: recipemind/frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import FavButtonLocal from '../components/FavButtonLocal';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Home() {
  const query = useQuery();
  const qParam = query.get('q') || ''; // q example: tomato,egg
  const [ingredientsInput, setIngredientsInput] = useState(qParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // when URL param changes, fire search
  useEffect(() => {
    if (!qParam) {
      setResults([]);
      return;
    }
    // parse qParam into array
    const arr = qParam.split(',').map(x => x.trim()).filter(Boolean);
    doSearch(arr);
    // eslint-disable-next-line
  }, [qParam]);

  const doSearch = async (arr) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/search-by-ingredients`, { ingredients: arr }, { timeout: 15000 });
      setResults(res.data || []);
    } catch (err) {
      console.error('Search failed:', err.response?.data || err.message);
      setError('Search failed. Check backend or try different ingredients.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // optional local submit when user presses Find (if you want to support manual search here)
  const onSubmit = (e) => {
    e && e.preventDefault();
    const arr = ingredientsInput.split(',').map(x => x.trim()).filter(Boolean);
    // push to url to let Navbar/IngredientSearch handle everywhere; but we can just search here
    doSearch(arr);
  };

  return (
    <div className="container" style={{ padding: '24px 20px' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>IngreDine — Find recipes from your ingredients</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>
          Use the search box in the top bar. Or type comma separated ingredients below and press Find.
        </p>

        {/* small input fallback for quick tests */}
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={ingredientsInput}
            onChange={e => setIngredientsInput(e.target.value)}
            placeholder="e.g. tomato, egg, rice"
            style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)' }}
          />
          <button type="submit" style={{ padding: '8px 14px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 0 }}>
            Find
          </button>
        </form>
      </div>

      {loading && <p>Loading results...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && results.length === 0 && (
        <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <p>No results yet. Try: tomato, egg or rice, potato.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 18 }}>
        {results.map(item => (
          <div key={item.id || item._id} className="card" style={{ overflow: 'hidden', borderRadius: 8 }}>
            <img
              src={item.image || 'https://via.placeholder.com/400x250?text=Recipe'}
              alt={item.title}
              style={{ width: '100%', height: 160, objectFit: 'cover' }}
              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x250?text=Recipe'; }}
            />
            <div style={{ padding: 12 }}>
              <h4 style={{ margin: '8px 0' }}>{item.title}</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                Used: {item.usedIngredients ?? item.usedIngredientCount ?? 0} • Missed: {item.missedIngredients ?? item.missedIngredientCount ?? 0}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Link to={`/recipe/${item.id || item._id}`} style={{ textDecoration: 'none', color: 'var(--accent)' }}>View</Link>
                <FavButtonLocal recipeId={item.id || item._id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}