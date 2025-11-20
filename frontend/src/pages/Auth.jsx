// src/pages/Auth.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function Auth(){
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      if(mode === 'signup'){
        await axios.post(`${API}/api/auth/register`, { name, email, password });
        alert('Registered — now login');
        setMode('login');
      } else {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        const { token, user } = res.data;
        localStorage.setItem('rm_token', token);
        localStorage.setItem('rm_user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        alert('Login success');
        navigate('/');
        window.location.reload();
      }
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.error || 'Auth failed');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 20, borderRadius: 8, background: 'var(--card)' }}>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <button onClick={()=>setMode('login')} style={{ flex:1, padding:8, borderRadius:6, border: mode==='login' ? `2px solid var(--accent)` : '1px solid #ccc', background:'transparent' }}>Login</button>
        <button onClick={()=>setMode('signup')} style={{ flex:1, padding:8, borderRadius:6, border: mode==='signup' ? `2px solid var(--accent)` : '1px solid #ccc', background:'transparent' }}>Signup</button>
      </div>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <div style={{ marginBottom:10 }}>
            <label style={{ display:'block', marginBottom:6 }}>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd' }} />
          </div>
        )}

        <div style={{ marginBottom:10 }}>
          <label style={{ display:'block', marginBottom:6 }}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd' }} />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd' }} />
        </div>

        <button type="submit" style={{ padding:'10px 14px', background:'var(--accent)', color:'#fff', border:0, borderRadius:6 }}>{ mode === 'login' ? 'Login' : 'Create account' }</button>
      </form>
    </div>
  );
}
