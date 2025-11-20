import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const navigate = useNavigate();

  const login = async () => {
    try{
      const res = await axios.post('http://localhost:5000/api/auth/login',{ email, password });
      const { token, user } = res.data;
      localStorage.setItem('rm_token', token);
      localStorage.setItem('rm_user', JSON.stringify(user));
      // set axios default so future requests use token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      alert('Login success');
      navigate('/');
    } catch(err){
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button onClick={login}>Login</button>
    </div>
  );
}
