import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../utils/auth";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  // 🔹 form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 ui states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      // 🔑 save token & user in localStorage
      saveAuth(token, user);

      // 🔥 VERY IMPORTANT (Navbar ko signal)
      window.dispatchEvent(new Event("storage"));

      // ✅ redirect to home
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Login failed, try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>Login to RecipeMind</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

// 🎨 simple styles
const styles = {
  wrapper: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 360,
    padding: 24,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#ff5c8a",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "crimson",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
};
