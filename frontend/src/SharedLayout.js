import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { clearAuth, getUser } from "./api";

const NAV = [
  { to: "/dashboard",  icon: "🏠", label: "Dashboard" },
  { to: "/practice",   icon: "🤖", label: "AI Practice" },
  { to: "/subjects",   icon: "📚", label: "Subjects" },
  { to: "/analytics",  icon: "📊", label: "Analytics" },
  { to: "/pdf-upload", icon: "📄", label: "PDF Upload" },
  { to: "/paper-analyzer", icon: "📝", label: "Paper Analyzer" },
  { to: "/settings",   icon: "⚙️", label: "Settings" },
];

export function SharedSidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const path = window.location.pathname;

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">🧠</div>
        <span className="logo-text">Exam<span>IQ</span></span>
      </div>
      <div className="nav-section">
        <p className="nav-label">Main Menu</p>
        <nav className="menu">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`menu-item ${path === item.to ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
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
  );
}
