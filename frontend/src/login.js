import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { apiLogin, saveAuth } from "./api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const data = await apiLogin(email, password);
      if (data.token) {
        saveAuth(data.token, data.user);
        setMessage({ text: "Login successful! Redirecting…", type: "success" });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setMessage({ text: data.message || "Invalid credentials ❌", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="auth-left"><div className="auth-left-inner">
        <div className="brand-logo">
          <div className="brand-icon">🧠</div>
          <span className="brand-name">Exam<span>IQ</span></span>
        </div>

        <h1 className="auth-headline">
          Study smarter.<br />
          Score <em>higher.</em>
        </h1>
        <p className="auth-subtext">
          AI-powered exam preparation that adapts to you. Master DSA, OS, DBMS,
          CN and AI with personalized quizzes and real-time analytics.
        </p>

        <div className="auth-features">
          {[
            { icon: "🤖", text: "AI Question Generator",   sub: "Groq LLaMA 3.1 powered" },
            { icon: "📊", text: "Live Performance Charts", sub: "Track every subject" },
            { icon: "📅", text: "Personalized Study Plans", sub: "Adaptive scheduling" },
            { icon: "🏆", text: "Leaderboard & Streaks",   sub: "Stay motivated daily" },
          ].map((f) => (
            <div className="feature-pill" key={f.text}>
              <div className="pill-icon">{f.icon}</div>
              <div>
                <span className="pill-text">{f.text}</span>
                <span className="pill-sub">{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Tab switcher */}
          <div className="auth-tab-switch">
            <Link to="/login"    className="active">Sign In</Link>
            <Link to="/register"            >Create Account</Link>
          </div>

          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your study session</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Email address</label>
              <div className="field-wrap">
                <span className="field-icon">✉️</span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔒</span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span className="btn-inner">
                {loading ? (
                  <><span className="spinner" /> Signing in…</>
                ) : "Sign In →"}
              </span>
            </button>
          </form>

          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
