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
import { apiDashboard, getUser, clearAuth } from "./api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Sidebar navigation items
const NAV = [
  { to: "/dashboard",  icon: "🏠", label: "Dashboard" },
  { to: "/practice",   icon: "🤖", label: "AI Practice" },
  { to: "/subjects",   icon: "📚", label: "Subjects" },
  { to: "/analytics",  icon: "📊", label: "Analytics" },
  { to: "/pdf-upload", icon: "📄", label: "PDF Upload" },
  { to: "/paper-analyzer", icon: "📝", label: "Paper Analyzer" },
  { to: "/roadmap", icon: "🗺️", label: "Skill Roadmap" },
  { to: "/settings",   icon: "⚙️", label: "Settings" },
];

function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();

  const [dashData,    setDashData]    = useState(null);
  const [loading,     setLoading]     = useState(true);

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
              <Link to="/practice"   className="action-btn primary">⚡ Start AI Chat</Link>
              <Link to="/subjects"   className="action-btn">📝 Practice Quiz</Link>
              <Link to="/analytics"  className="action-btn">📊 View Analytics</Link>
              <Link to="/pdf-upload" className="action-btn">📄 Upload PDF</Link>
            </div>

            {/* ── WEAK TOPICS GRID ── */}
            <div className="full-width-section">
              <div className="weak-topics-container">
                <div className="weak-topics-header">
                  <h2>⚠️ Weak Topic Analysis</h2>
                  <p>Topics requiring your immediate attention based on recent quizzes</p>
                </div>
                <div className="weak-topics-grid">
                  {(dashData?.weakTopics || [
                    { topic: "Binary Trees", subject: "DSA", accuracy: 35 },
                    { topic: "Deadlocks", subject: "OS", accuracy: 42 },
                    { topic: "Normalization", subject: "DBMS", accuracy: 50 },
                    { topic: "TCP/IP", subject: "CN", accuracy: 55 },
                  ]).slice(0, 4).map((t, i) => (
                    <div className="weak-topic-card" key={i}>
                      <div className="wt-header">
                        <span className="wt-subject">{t.subject || "General"}</span>
                        {t.accuracy > 0 && (
                          <span className={`wt-accuracy ${t.accuracy < 40 ? 'critical' : 'warning'}`}>
                            {t.accuracy}%
                          </span>
                        )}
                      </div>
                      <h3 className="wt-title">{t.topic}</h3>
                      {t.accuracy > 0 && (
                        <div className="wt-progress-wrap">
                          <div 
                            className={`wt-progress ${t.accuracy < 40 ? 'critical' : 'warning'}`} 
                            style={{ width: `${t.accuracy}%` }} 
                          />
                        </div>
                      )}
                      <Link to="/subjects" className="wt-practice-btn">Review Topic →</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
