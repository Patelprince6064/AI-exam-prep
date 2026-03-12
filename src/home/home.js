import React from "react";
import { Link } from "react-router-dom";
import "./home.css";
import logo from "../assets/logo.png";
<img src={logo} alt="logo" /> 

const Home = () => {
  return (
  <div className="home">

    {/* TOP RIGHT NAVBAR (ADD HERE) */}
    <div className="top-nav">
      <div className="nav-logo">
        <img src={logo} alt="ExamIQ Logo" />
        <span>ExamIQ</span>
      </div>

      <div className="nav-links">
        <a href="#overview">Overview</a>
     
        <a href="#contact">Contact</a>
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </div>

      
      {/* BACKGROUND PARTICLES */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${12 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></span>
        ))}
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <h1>AI-Powered Exam Preparation System</h1>
        <p>
          Personalized • Intelligent • Exam-Oriented  
          <br />
          Transforming the way students prepare for exams.
        </p>

        <div className="hero-buttons">
          <Link to="/login" className="btn primary">Login</Link>
          <Link to="/register" className="btn secondary">Get Started</Link>
        </div>
      </section>

      {/* PROJECT OVERVIEW */}
      {/* PROJECT OVERVIEW */}
{/* PROJECT OVERVIEW */}
<section className="ai-overview" id="overview">
  <h2>How ExamIQ Works</h2>
  <p className="overview-sub">
    An intelligent, step-by-step AI-driven exam preparation pipeline
  </p>

  <div className="ai-flow">

    <div className="flow-step left">
      <div className="flow-card">
        <h4>📊 Performance Data Analysis</h4>
        <p>
          Analyzes student test history, accuracy, speed, and learning patterns
          to identify strengths and weak areas.
        </p>
      </div>
    </div>

    <div className="flow-step right">
      <div className="flow-card">
        <h4>🧠 AI Failure Prediction</h4>
        <p>
          Machine learning models predict academic risk and exam failure
          probability well in advance.
        </p>
      </div>
    </div>

    <div className="flow-step left">
      <div className="flow-card">
        <h4>📅 Adaptive Study Planner</h4>
        <p>
          Generates personalized daily study plans based on weak topics and
          available preparation time.
        </p>
      </div>
    </div>

    <div className="flow-step right">
      <div className="flow-card">
        <h4>📝 Examiner-Style Evaluation</h4>
        <p>
          Automatically evaluates answers using AI, simulating real examiner
          marking behavior.
        </p>
      </div>
    </div>

    <div className="flow-step left">
      <div className="flow-card">
        <h4>🚨 Smart Alerts & Insights</h4>
        <p>
          Provides real-time feedback, alerts, and improvement suggestions
          before exams.
        </p>
      </div>
    </div>

  </div>
</section>




      {/* CONTACT SECTION */}
      {/* CONTACT SECTION */}
<section className="contact-section" id="contact">
  <div className="contact-wrapper">

    <div className="contact-left">
      <h2>Let’s Connect</h2>
      <p>
        Have questions, feedback, or ideas?  
        We’d love to hear from you.
      </p>

      <div className="contact-actions">
        <a href="mailto:pp50646464@gmail.com" className="contact-btn">
          📧 Email Us
        </a>
        <a href="tel:+919328761976" className="contact-btn secondary">
           Call Us
        </a>
      </div>
    </div>

    <div className="contact-right">
      <div className="contact-card">
        <p><strong>Email</strong><br />pp50646464@gmail.com</p>
        <p><strong>Phone</strong><br />+91 9328761976</p>
        <p><strong>Project</strong><br />Final Year AI Project</p>
      </div>
    </div>

  </div>

  <div className="contact-footer">
    © 2026 AI Exam Preparation System · ExamIQ
  </div>
</section>

    </div>
  );
};

export default Home;
