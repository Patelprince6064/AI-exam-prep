import React from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {

  const progressData = {
    labels: ["DSA", "OS", "DBMS", "CN", "AI"],
    datasets: [
      {
        label: "Score %",
        data: [80, 65, 75, 60, 85],
        backgroundColor: "#6366f1"
      }
    ]
  };

  const accuracyData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        data: [82, 18],
        backgroundColor: ["#22c55e", "#ef4444"]
      }
    ]
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

<div className="sidebar">
  <h2 className="logo">AI Prep</h2>

  <nav className="menu">

    <Link to="/dashboard" className="menu-item">
      <span>🏠</span> Dashboard
    </Link>

    <Link to="/practice" className="menu-item">
      <span>🤖</span> AI Practice
    </Link>

    <Link to="/subjects" className="menu-item">
      <span>📚</span> Subjects
    </Link>

    <Link to="/analytics" className="menu-item">
      <span>📊</span> Analytics
    </Link>

    <Link to="/settings" className="menu-item">
      <span>⚙</span> Settings
    </Link>

    <Link to="/login" className="menu-item">
      <HiOutlineLogout /> Logout
    </Link>

  </nav>
</div>

      {/* MAIN AREA */}
      <div className="main">

        <div className="header">
          <h1>Welcome Back 👋</h1>
          <p>Your AI Study Assistant</p>
        </div>

        {/* STATS */}
        <div className="stats">

          <div className="card stat1">
            <h3>Tests Taken</h3>
            <p>14</p>
          </div>

          <div className="card stat2">
            <h3>Accuracy</h3>
            <p>82%</p>
          </div>

          <div className="card stat3">
            <h3>Study Hours</h3>
            <p>37h</p>
          </div>

          <div className="card stat4">
            <h3>Study Streak</h3>
            <p>6 Days 🔥</p>
          </div>

        </div>

        {/* CHARTS */}
        <div className="charts">

          <div className="chart-card">
            <h3>Subject Progress</h3>
            <Bar data={progressData} />
          </div>

          <div className="chart-card">
            <h3>Accuracy</h3>
            <Doughnut data={accuracyData} />
          </div>

        </div>

        {/* AI GENERATOR */}
        <div className="ai-box">
          <h2>AI Question Generator 🤖</h2>

          <input
            type="text"
            placeholder="Enter topic (example: Operating Systems)"
          />

          <button>Generate Questions</button>
        </div>

        {/* DAILY GOAL */}
        <div className="goal">
          <h2>Daily Study Goal</h2>

          <div className="progress">
            <div className="progress-bar"></div>
          </div>

          <p>3 / 5 hours completed</p>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="activity">
          <h2>Recent Activity</h2>

          <ul>
            <li>✅ Completed Data Structures Quiz</li>
            <li>📊 Scored 78% in Operating Systems</li>
            <li>🤖 Generated AI questions for DBMS</li>
            <li>📚 Practiced Computer Networks</li>
          </ul>
        </div>
        <div className="quick-actions">
  <button>Start Mock Test</button>
  <button>Practice Questions</button>
  <button>AI Study Plan</button>
</div>

        {/* UPCOMING TEST */}
        <div className="mock-test">
          <h2>Upcoming Mock Test</h2>

          <p>Full Length Mock Exam</p>
          <p>Tomorrow • 10:00 AM</p>

          <button className="start-btn">Start Test</button>
        </div>

        {/* WEAK TOPICS */}
        <div className="weak-topics">
          <h2>AI Weak Topic Analysis</h2>

          <ul>
            <li>⚠ Deadlock (Operating Systems)</li>
            <li>⚠ Tree Traversal (Data Structures)</li>
            <li>⚠ SQL Joins (DBMS)</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;