import React, {useEffect} from "react";
import { initTheme } from "./utils/theme";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import ProtectedRoute from "./components/ProtectedRoute";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastProvider } from "./context/ToastContext";

// temporary pages (blank avoid karne ke liye)
function Explore() {
  return <div style={{ padding: 20 }}>Explore page coming soon 🚀</div>;
}

export default function App() {
  useEffect(()=> {
    initTheme();
  },[]);
  return (
    <ToastProvider>
    <Router>
      <Navbar />
      {/* IMPORTANT: main-content wrapper */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>}/>
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
    </ToastProvider>
  );
}
