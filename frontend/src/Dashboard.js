import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from "chart.js";
import { apiDashboard, apiGenerateQuiz, getUser, clearAuth } from "./api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Sidebar navigation items
const NAV = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/practice",  icon: "🤖", label: "AI Practice" },
  { to: "/subjects",  icon: "📚", label: "Subjects" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
  { to: "/settings",  icon: "⚙️", label: "Settings" },
];

function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();

  const [dashData,    setDashData]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [quizTopic,   setQuizTopic]   = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizMsg,     setQuizMsg]     = useState("");

  // Formatted date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    apiDashboard()
      .then(setDashData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  const handleGenerateQuestions = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    setQuizMsg("");
    try {
      const subject = ["DSA","OS","DBMS","CN","AI"].find((s) =>
        quizTopic.toUpperCase().includes(s)
      ) || "DSA";
      const data = await apiGenerateQuiz(subject, quizTopic, 5);
      setQuizMsg(data.questions
        ? `✅ ${data.questions.length} questions generated! Head to AI Practice.`
        : data.message || "Generation failed ❌"
      );
    } catch {
      setQuizMsg("Error generating questions ❌");
    } finally {
      setQuizLoading(false);
    }
  };

  // Stats from backend or zeros
  const stats     = dashData?.stats     || { testsTaken: 0, accuracy: 0, studyHours: 0, streak: 0 };
  const subjects  = dashData?.subjectProgress || [];
  const activity  = dashData?.recentActivity  || [];

  // Chart config
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1e3a8a", titleColor: "#ffffff", bodyColor: "#bfdbfe" } },
    scales: {
      x: { grid: { color: "rgba(37,99,235,0.06)" }, ticks: { color: "#64748b", font: { size: 11 } } },
      y: { grid: { color: "rgba(37,99,235,0.06)" }, ticks: { color: "#64748b", font: { size: 11 } } },
    },
  };

  const barData = {
    labels: subjects.length > 0 ? subjects.map((s) => s.subject) : ["DSA","OS","DBMS","CN","AI"],
    datasets: [{
      data:            subjects.length > 0 ? subjects.map((s) => s.avgScore) : [0,0,0,0,0],
      backgroundColor: ["rgba(37,99,235,0.75)","rgba(6,182,212,0.75)","rgba(16,185,129,0.75)","rgba(245,158,11,0.75)","rgba(139,92,246,0.75)"],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: ["Correct", "Wrong"],
    datasets: [{
      data: [stats.accuracy, 100 - stats.accuracy],
      backgroundColor: ["#2563eb", "#e2e8f0"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const doughnutOptions = {
    cutout: "78%",
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1e3a8a", bodyColor: "#bfdbfe" },
    },
  };

  // Daily goal progress
  const goalHours   = user?.studyGoalHours || 5;
  const todayHours  = parseFloat((stats.studyHours % goalHours).toFixed(1));
  const goalPct     = Math.min(Math.round((todayHours / goalHours) * 100), 100);

  // Activity dot colors
  const dotColors = ["#7c6aff","#00d4aa","#ff7849","#f59e0b","#63b3ff"];

  return (
    <div className="dashboard">

      {/* ══ SIDEBAR ══════════════════════════════════════ */}
      <div className="sidebar">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🧠</div>
          <span className="logo-text">Exam<span>IQ</span></span>
        </div>

        {/* Main nav */}
        <div className="nav-section">
          <p className="nav-label">Main Menu</p>
          <nav className="menu">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`menu-item ${window.location.pathname === item.to ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User pill */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Student"}</p>
            <p className="user-role">Student</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </div>

      {/* ══ MAIN CONTENT ═════════════════════════════════ */}
      <div className="main">

        {/* Page header */}
        <div className="header">
          <div className="header-left">
            <h1>Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋</h1>
            <p>Here's your study overview for today.</p>
          </div>
          <span className="header-date">📅 {today}</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-ring" />
            <p>Loading your dashboard…</p>
          </div>
        ) : (
          <>
            {/* ── STAT CARDS ── */}
            <div className="stats">
              {[
                { label: "Tests Taken", value: stats.testsTaken, badge: stats.testsTaken > 0 ? "+1 today" : "Start now", up: true, cls: "stat1" },
                { label: "Accuracy",    value: `${stats.accuracy}%`, badge: stats.accuracy >= 70 ? "Above avg" : "Keep going", up: stats.accuracy >= 70, cls: "stat2" },
                { label: "Study Hours", value: `${stats.studyHours}h`, badge: `${goalHours}h goal`, up: true, cls: "stat3" },
                { label: "Day Streak",  value: `${stats.streak} 🔥`, badge: stats.streak > 0 ? "Keep it up!" : "Start today", up: stats.streak > 0, cls: "stat4" },
              ].map((s) => (
                <div className={`card ${s.cls}`} key={s.label}>
                  <h3>{s.label}</h3>
                  <p>{s.value}</p>
                  <span className={`card-badge ${s.up ? "up" : "down"}`}>
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* ── CHARTS ── */}
            <div className="charts">
              <div className="chart-card">
                <h3>Subject Performance</h3>
                <p className="chart-subtitle">Average quiz scores per subject</p>
                <Bar data={barData} options={chartOptions} />
              </div>

              <div className="chart-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3>Overall Accuracy</h3>
                <p className="chart-subtitle">Correct vs wrong answers</p>
                <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto" }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)", textAlign: "center",
                  }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {stats.accuracy}%
                    </p>
                    <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LOWER GRID ── */}
            <div className="lower-grid">
              {/* AI Generator */}
              <div className="ai-box">
                <h2>🤖 AI Question Generator</h2>
                <p>Enter any topic to instantly generate practice MCQs using Groq AI.</p>
                <div className="ai-input-row">
                  <input
                    type="text"
                    placeholder="e.g. Deadlock, SQL Joins, Binary Trees…"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateQuestions()}
                  />
                  <button onClick={handleGenerateQuestions} disabled={quizLoading}>
                    {quizLoading ? "…" : "Generate"}
                  </button>
                </div>
                {quizMsg && <p className="ai-result">{quizMsg}</p>}
              </div>

              {/* Recent Activity */}
              <div className="activity">
                <h2>Recent Activity</h2>
                <ul className="activity-list">
                  {activity.length > 0 ? activity.map((a, i) => (
                    <li className="activity-item" key={a._id || i}>
                      <span className="activity-dot" style={{ background: dotColors[i % dotColors.length] }} />
                      <span className="activity-text">{a.subject} — {a.topic}</span>
                      <span className="activity-score">{a.score}%</span>
                    </li>
                  )) : (
                    ["Start your first quiz to see activity!",
                     "AI Practice → ask any question",
                     "Subjects → pick a topic & quiz"].map((text, i) => (
                      <li className="activity-item" key={i}>
                        <span className="activity-dot" style={{ background: dotColors[i] }} />
                        <span className="activity-text">{text}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* ── DAILY GOAL ── */}
            <div className="goal">
              <div className="goal-header">
                <h2>Daily Study Goal</h2>
                <span className="goal-pct">{goalPct}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${goalPct}%` }} />
              </div>
              <p className="goal-label">{todayHours} of {goalHours} hours completed today</p>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="quick-actions">
              <Link to="/practice" className="action-btn primary">⚡ Start AI Chat</Link>
              <Link to="/subjects" className="action-btn">📝 Practice Quiz</Link>
              <Link to="/analytics" className="action-btn">📊 View Analytics</Link>
              <Link to="/settings" className="action-btn">📄 Upload Notes</Link>
            </div>

            {/* ── BOTTOM GRID ── */}
            <div className="bottom-grid">
              {/* Mock test card */}
              <div className="mock-test">
                <h2>📋 Mock Exam Ready</h2>
                <p>Full Length Mock Exam</p>
                <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>All 5 subjects · 50 questions · 90 min</p>
                <Link to="/subjects" className="start-btn">Start Exam →</Link>
              </div>

              {/* Weak topics */}
              <div className="weak-topics">
                <h2>⚠️ Weak Topic Analysis</h2>
                <ul className="weak-list">
                  {(dashData?.weakTopics || [
                    { topic: "Complete quizzes to", subject: "", accuracy: 0 },
                    { topic: "see weak topics here", subject: "", accuracy: 0 },
                  ]).slice(0, 4).map((t, i) => (
                    <li className="weak-item" key={i}>
                      <span style={{ flex: 1, fontSize: 13 }}>
                        {t.subject ? `${t.subject} — ` : ""}{t.topic}
                      </span>
                      {t.accuracy > 0 && (
                        <>
                          <div className="weak-bar-wrap">
                            <div className="weak-bar" style={{ width: `${t.accuracy}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#ff6b6b", fontWeight: 700, minWidth: 32, textAlign: "right" }}>
                            {t.accuracy}%
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
