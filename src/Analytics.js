import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import { apiAnalytics, apiLeaderboard, clearAuth } from "./api";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend
);

function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    Promise.all([apiAnalytics(), apiLeaderboard()])
      .then(([analytics, lb]) => {
        setData(analytics);
        setLeaderboard(lb.leaderboard || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="logo">AI Prep</h2>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item"><span>🏠</span> Dashboard</Link>
          <Link to="/practice" className="menu-item"><span>🤖</span> AI Practice</Link>
          <Link to="/subjects" className="menu-item"><span>📚</span> Subjects</Link>
          <Link to="/analytics" className="menu-item active"><span>📊</span> Analytics</Link>
          <Link to="/settings" className="menu-item"><span>⚙</span> Settings</Link>
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </nav>
      </div>

      <div className="main">
        <div className="header">
          <h1>Analytics 📊</h1>
          <p>Your performance insights and progress tracking</p>
        </div>

        {loading ? (
          <div style={{ color: "var(--text)", padding: "40px" }}>Loading analytics...</div>
        ) : !data?.hasData ? (
          <div style={{ color: "var(--text)", padding: "40px" }}>
            <h2>No data yet 📭</h2>
            <p>Take some quizzes to see your analytics!</p>
            <Link to="/practice"><button style={{ marginTop: 16, padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Start Practicing</button></Link>
          </div>
        ) : (
          <>
            {/* OVERVIEW STATS */}
            <div className="stats">
              <div className="card stat1"><h3>Tests Taken</h3><p>{data.overview.testsTaken}</p></div>
              <div className="card stat2"><h3>Accuracy</h3><p>{data.overview.overallAccuracy}%</p></div>
              <div className="card stat3"><h3>Avg Score</h3><p>{data.overview.avgScore}%</p></div>
              <div className="card stat4"><h3>Streak</h3><p>{data.overview.streak} 🔥</p></div>
            </div>

            {/* CHARTS ROW 1 */}
            <div className="charts">
              <div className="chart-card">
                <h3>Subject Performance</h3>
                <Bar
                  data={{
                    labels: data.subjectPerformance.map((s) => s.subject),
                    datasets: [
                      { label: "Avg Score %", data: data.subjectPerformance.map((s) => s.avgScore), backgroundColor: "#2563eb" },
                      { label: "Best Score %", data: data.subjectPerformance.map((s) => s.bestScore), backgroundColor: "#10b981" },
                    ],
                  }}
                />
              </div>
              <div className="chart-card">
                <h3>Overall Accuracy</h3>
                <Doughnut
                  data={{
                    labels: ["Correct", "Wrong"],
                    datasets: [{ data: [data.overview.overallAccuracy, 100 - data.overview.overallAccuracy], backgroundColor: ["#2563eb", "#e2e8f0"] }],
                  }}
                />
              </div>
            </div>

            {/* CHARTS ROW 2 */}
            <div className="charts">
              <div className="chart-card">
                <h3>Score Trend (Last 14 Quizzes)</h3>
                <Line
                  data={{
                    labels: data.scoreTrend.map((t) => `#${t.index}`),
                    datasets: [{ label: "Score %", data: data.scoreTrend.map((t) => t.score), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.08)", fill: true, tension: 0.4 }],
                  }}
                />
              </div>
              <div className="chart-card">
                <h3>Weekly Activity</h3>
                <Bar
                  data={{
                    labels: data.weeklyActivity.map((d) => d.day),
                    datasets: [{ label: "Quizzes", data: data.weeklyActivity.map((d) => d.quizzes), backgroundColor: "#06b6d4" }],
                  }}
                />
              </div>
            </div>

            {/* SCORE DISTRIBUTION */}
            <div className="chart-card" style={{ maxWidth: 500 }}>
              <h3>Score Distribution</h3>
              <Bar
                data={{
                  labels: Object.keys(data.scoreDistribution),
                  datasets: [{ label: "Quizzes", data: Object.values(data.scoreDistribution), backgroundColor: ["#ef4444", "#f97316", "#2563eb", "#10b981"] }],
                }}
              />
            </div>

            {/* LEADERBOARD */}
            {leaderboard.length > 0 && (
              <div className="activity" style={{ marginTop: 24 }}>
                <h2>🏆 Leaderboard</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ textAlign: "left", padding: "8px" }}>Rank</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Tests</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Accuracy</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((u) => (
                      <tr key={u.rank} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px" }}>{u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank}</td>
                        <td style={{ padding: "8px" }}>{u.name}</td>
                        <td style={{ padding: "8px" }}>{u.testsTaken}</td>
                        <td style={{ padding: "8px" }}>{u.accuracy}%</td>
                        <td style={{ padding: "8px" }}>{u.streak} 🔥</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
