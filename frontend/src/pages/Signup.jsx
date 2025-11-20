import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const navigate = useNavigate();

  const register = async () => {
    try{
      const res = await axios.post('http://localhost:5000/api/auth/register',{ name, email, password });
      alert('Registered. Now login.');
      navigate('/login');
    } catch(err){
      console.error(err);
      alert(err.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Signup</h2>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /><br/>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button onClick={register}>Register</button>
    </div>
  );
}
