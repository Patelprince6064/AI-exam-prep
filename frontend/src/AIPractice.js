import React, { useState, useRef, useEffect } from "react";
import "./AIPractice.css";
import { apiChat, apiExplain, apiStudyPlan } from "./api";
import { Link } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";

function AIPractice() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I'm your AI Tutor. Ask me anything about DSA, OS, DBMS, CN or AI — or say **'generate 5 questions on Deadlock'** to practice!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat | explain | studyplan
  const [explainTopic, setExplainTopic] = useState("");
  const [explainSubject, setExplainSubject] = useState("DSA");
  const [examDate, setExamDate] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiChat(input);
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply || "No response." }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: "Server error. Try again ❌" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Explain ───────────────────────────────────────────────────────────────
  const [explanation, setExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  const handleExplain = async () => {
    if (!explainTopic.trim()) return;
    setExplainLoading(true);
    setExplanation("");
    try {
      const data = await apiExplain(explainTopic, explainSubject);
      setExplanation(data.explanation || "No explanation returned.");
    } catch {
      setExplanation("Error fetching explanation ❌");
    } finally {
      setExplainLoading(false);
    }
  };

  // ── Study Plan ────────────────────────────────────────────────────────────
  const [studyPlan, setStudyPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const handleStudyPlan = async () => {
    setPlanLoading(true);
    setStudyPlan("");
    try {
      const data = await apiStudyPlan(examDate, []);
      setStudyPlan(data.studyPlan || "No plan returned.");
    } catch {
      setStudyPlan("Error generating study plan ❌");
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">AI Prep</h2>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item"><span>🏠</span> Dashboard</Link>
          <Link to="/practice" className="menu-item active"><span>🤖</span> AI Practice</Link>
          <Link to="/subjects" className="menu-item"><span>📚</span> Subjects</Link>
          <Link to="/analytics" className="menu-item"><span>📊</span> Analytics</Link>
          <Link to="/settings" className="menu-item"><span>⚙</span> Settings</Link>
          <Link to="/login" className="menu-item" onClick={() => { localStorage.clear(); }}>
            <HiOutlineLogout /> Logout
          </Link>
        </nav>
      </div>

      {/* MAIN PANEL */}
      <div className="main-panel">
        <div className="header">
          <h1>AI Tutor 🤖</h1>
          <p>Chat, get explanations, or generate a personalized study plan.</p>
        </div>

        {/* TABS */}
        <div className="tabs">
          {["chat", "explain", "studyplan"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "chat" ? "💬 Chat" : tab === "explain" ? "📖 Explain" : "📅 Study Plan"}
            </button>
          ))}
        </div>

        {/* ── CHAT TAB ── */}
        {activeTab === "chat" && (
          <>
            <div className="chatbox">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.sender}`}>
                  <span className="bubble">{msg.text}</span>
                </div>
              ))}
              {loading && (
                <div className="message ai">
                  <span className="bubble typing">AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or say: generate 5 questions on Trees"
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading}>
                {loading ? "..." : "Send"}
              </button>
            </div>
          </>
        )}

        {/* ── EXPLAIN TAB ── */}
        {activeTab === "explain" && (
          <div className="explain-panel">
            <h3>📖 Deep Explain Any Topic</h3>
            <div className="explain-form">
              <select value={explainSubject} onChange={(e) => setExplainSubject(e.target.value)}>
                {["DSA", "OS", "DBMS", "CN", "AI"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter topic (e.g. Deadlock, SQL Joins, TCP Handshake)"
                value={explainTopic}
                onChange={(e) => setExplainTopic(e.target.value)}
              />
              <button onClick={handleExplain} disabled={explainLoading}>
                {explainLoading ? "Explaining..." : "Explain"}
              </button>
            </div>
            {explanation && (
              <div className="explanation-box">
                <pre>{explanation}</pre>
              </div>
            )}
          </div>
        )}

        {/* ── STUDY PLAN TAB ── */}
        {activeTab === "studyplan" && (
          <div className="explain-panel">
            <h3>📅 Generate Personalized Study Plan</h3>
            <div className="explain-form">
              <label>Exam Date:</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <button onClick={handleStudyPlan} disabled={planLoading}>
                {planLoading ? "Generating..." : "Generate Plan"}
              </button>
            </div>
            {studyPlan && (
              <div className="explanation-box">
                <pre>{studyPlan}</pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AIPractice;
