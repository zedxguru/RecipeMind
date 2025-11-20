// RecipeDetail.jsx — full final
// Path: recipemind/frontend/src/pages/RecipeDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FavButtonLocal from '../components/FavButtonLocal';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function RecipeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`${API}/api/recipe/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else {
          setErr(json.error || 'Failed to load recipe');
          setData(null);
        }
      } catch (e) {
        console.error('detail fetch err', e);
        setErr('Failed to load recipe detail');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: 24 }}><p>Loading recipe...</p></div>;
  if (err) return <div className="container" style={{ padding: 24 }}><p style={{ color: 'crimson' }}>{err}</p></div>;
  if (!data) return null;

  return (
    <div className="container" style={{ padding: '24px 20px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>{data.title}</h1>
            <FavButtonLocal recipeId={data.id || data._id} />
          </div>

          <img
            src={data.image || 'https://via.placeholder.com/800x500?text=No+Image'}
            alt={data.title}
            style={{ width: '100%', borderRadius: 8, marginTop: 12 }}
            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x500?text=No+Image'; }}
          />

          <section style={{ marginTop: 18 }}>
            <h3>Ingredients</h3>
            {Array.isArray(data.ingredients) && data.ingredients.length ? (
              <ul>
                {data.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            ) : (
              <p>No ingredient information available.</p>
            )}
          </section>

          <section style={{ marginTop: 16 }}>
            <h3>Instructions</h3>
            {data.instructions ? (
              data.instructions.split('\n').map((line, idx) => <p key={idx} style={{ margin: '6px 0' }}>{line}</p>)
            ) : data.sourceUrl ? (
              <p>
                Instructions not provided. Open original source:{" "}
                <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.sourceUrl}</a>
              </p>
            ) : (
              <p>No instructions provided.</p>
            )}
          </section>
        </div>

        <aside style={{ width: 300, minWidth: 260 }}>
          <div className="card" style={{ padding: 12 }}>
            <h4>Nutrition</h4>
            <p>Calories: {data.calories ?? 'N/A'}</p>
            {data.nutrients && Object.keys(data.nutrients || {}).length ? (
              <div style={{ fontSize: 13 }}>
                {Object.values(data.nutrients).slice(0, 6).map((n, i) => (
                  <div key={i}><strong>{n.label}</strong>: {Math.round(n.quantity)} {n.unit}</div>
                ))}
              </div>
            ) : <p>No nutrition data.</p>}
            {data.sourceUrl && <p style={{ marginTop: 8, fontSize: 13 }}>Source: <a href={data.sourceUrl} target="_blank" rel="noreferrer">Open</a></p>}
          </div>
        </aside>
      </div>
    </div>
  );
}