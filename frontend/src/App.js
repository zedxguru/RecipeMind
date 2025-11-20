import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import Auth from './pages/Auth';

export default function App(){
  return (
    <Router>
      <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
        <Navbar />
        <main style={{flex:1}}>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/recipe/:id" element={<RecipeDetail/>}/>
            <Route path="/favorites" element={<Favorites/>}/>
            <Route path="/auth" element={<Auth/>}/>
          </Routes>
        </main>
        <footer style={{padding:20, textAlign:'center', borderTop:'1px solid rgba(0,0,0,0.04)'}}>
          © {new Date().getFullYear()} IngreDine · Built by Sameer
        </footer>
      </div>
    </Router>
  );
}
