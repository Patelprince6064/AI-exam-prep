import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { apiRegister, saveAuth } from "./api";

function Register() {
  const navigate    = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [loading, setLoading]   = useState(false);

  // Password strength
  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ff6b6b", "#f59e0b", "#00d4aa"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "Creating your account…", type: "" });

    try {
      const data = await apiRegister(name, email, password);
      if (data.token) {
        saveAuth(data.token, data.user);
        setMessage({ text: "Account created! Redirecting…", type: "success" });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setMessage({ text: data.message || "Registration failed ❌", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error ❌", type: "error" });
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
          Your AI tutor.<br />
          <em>Always ready.</em>
        </h1>
        <p className="auth-subtext">
          Join thousands of students who've upgraded their exam prep. Get instant
          access to AI quizzes, analytics, and adaptive study plans — free.
        </p>

        <div className="auth-features">
          {[
            { icon: "⚡", text: "Get started in 30 seconds",  sub: "No credit card needed" },
            { icon: "🎯", text: "Targeted weak-topic analysis", sub: "Know exactly what to study" },
            { icon: "📄", text: "Upload your own notes",       sub: "Generate quizzes from PDFs" },
            { icon: "🔥", text: "Daily streaks & goals",       sub: "Stay on track every day" },
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
            <Link to="/login"              >Sign In</Link>
            <Link to="/register" className="active">Create Account</Link>
          </div>

          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Start your AI-powered exam prep journey</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className="field-wrap">
                <span className="field-icon">👤</span>
                <input
                  className="field-input"
                  type="text"
                  placeholder="username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3].map((i) => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 99,
                        background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.1)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, marginTop: 5, color: strengthColor[strength] }}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span className="btn-inner">
                {loading ? (
                  <><span className="spinner" /> Creating account…</>
                ) : "Create Account →"}
              </span>
            </button>
          </form>

          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
