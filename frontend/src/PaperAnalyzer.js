import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { apiAnalyzePaper, getUser, clearAuth } from "./api";
import "./PdfUpload.css";
import "./PaperAnalyzer.css";

const NAV = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/practice",  icon: "🤖", label: "AI Practice" },
  { to: "/subjects",  icon: "📚", label: "Subjects" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
  { to: "/pdf-upload",icon: "📄", label: "PDF Upload" },
  { to: "/paper-analyzer", icon: "📝", label: "Paper Analyzer" },
  { to: "/roadmap", icon: "🗺️", label: "Skill Roadmap" },
  { to: "/settings",  icon: "⚙️", label: "Settings" },
];

function PaperAnalyzer() {
  const navigate = useNavigate();
  const user = getUser();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("General");
  const [mode, setMode] = useState("topics");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); }
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.type.startsWith("image/"))) {
      setFile(dropped);
    } else {
      showToast("Please upload a PDF or Image file", "error");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleAnalyze = async () => {
    if (!file) {
      showToast("Please select a PDF file", "error");
      return;
    }
    setAnalyzing(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subject", subject);
      fd.append("mode", mode);
      
      const data = await apiAnalyzePaper(fd);
      if (data.result) {
        setResult(data.result);
        showToast("Paper analyzed successfully! 🎉");
      } else {
        showToast(data.message || "Failed to analyze paper", "error");
      }
    } catch (e) {
      showToast("Error connecting to analyzer", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  return (
    <div className="pdf-page">
      {/* SIDEBAR */}
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
                className={`menu-item ${window.location.pathname === item.to ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Student"}</p>
            <p className="user-role">Student</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="pdf-main">
        {toast && <div className={`pdf-toast ${toast.type}`}>{toast.msg}</div>}

        <div className="pdf-header">
          <div>
            <h1>📝 Paper Analyzer</h1>
            <p>Upload a past University or Mid Sem paper. AI will instantly extract the most frequently asked topics to help you prioritize your studying.</p>
          </div>
        </div>

        <div className="upload-card">
          <div className="upload-card-header">
            <div className="upload-card-icon">⬆️</div>
            <div>
              <h2>Upload Exam Paper</h2>
              <p>PDF or Image files · Max 10 MB</p>
            </div>
          </div>

          <div
            className={`drop-zone ${dragOver ? "active" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <div className="drop-file-icon">📄</div>
                <div className="drop-file-name">{file.name}</div>
                <div className="drop-file-size">{formatSize(file.size)} · Ready to analyze</div>
                <button className="drop-change" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Change File ×
                </button>
              </>
            ) : (
              <>
                <div className="drop-icon">📂</div>
                <div className="drop-text">Drag & drop your exam paper here</div>
                <div className="drop-sub">or click to browse</div>
              </>
            )}
          </div>

          <div className="upload-form-row">
            <div className="upload-field" style={{ flex: 1 }}>
              <label>SUBJECT CONTEXT (OPTIONAL BUT HELPFUL FOR AI)</label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="upload-field" style={{ flex: 1, marginLeft: "16px" }}>
              <label>ANALYSIS MODE</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="topics">Extract Most Asked Topics</option>
                <option value="solve">Solve Entire Paper (Q&A)</option>
              </select>
            </div>
          </div>

          <button
            className="upload-btn"
            style={{ marginTop: "16px", background: "#3b82f6" }}
            onClick={handleAnalyze}
            disabled={analyzing || !file}
          >
            {analyzing ? (
              <><span className="btn-spinner"></span> Analyzing Paper…</>
            ) : (
              mode === "solve" ? "💡 Solve Entire Paper" : "🔍 Extract Most Asked Topics"
            )}
          </button>
        </div>

        {/* RESULTS SECTION */}
        {result && result.topics && (
          <div className="analyzer-result-card">
            <div className="result-header">
              <h2>🎯 Most Asked Topics</h2>
              <span className="result-subject-badge">{result.subject}</span>
            </div>

            <div className="topics-list">
              {result.topics && result.topics.length > 0 ? (
                result.topics.sort((a, b) => b.count - a.count).map((topic, i) => (
                  <div key={i} className="topic-item">
                    <div className="topic-item-header">
                      <h3>{topic.name}</h3>
                      <span className="topic-count">{topic.count} {topic.count === 1 ? 'time' : 'times'}</span>
                    </div>
                    {topic.subTopics && topic.subTopics.length > 0 && (
                      <ul className="subtopics-list">
                        {topic.subTopics.map((sub, j) => (
                          <li key={j}>{sub}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <p>No major topics found. Ensure the PDF contains recognizable text.</p>
              )}
            </div>
          </div>
        )}

        {result && result.qaList && (
          <div className="analyzer-result-card">
            <div className="result-header">
              <h2>💡 Paper Solution</h2>
              <span className="result-subject-badge">{result.subject}</span>
            </div>

            <div className="topics-list">
              {result.qaList && result.qaList.length > 0 ? (
                result.qaList.map((qa, i) => (
                  <div key={i} className="topic-item">
                    <div className="topic-item-header">
                      <h3 style={{ color: "#3b82f6", fontSize: "16px", lineHeight: "1.4" }}>Q{i + 1}: {qa.question}</h3>
                    </div>
                    <p style={{ margin: 0, color: "#475569", fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      <strong>Answer:</strong><br />{qa.answer}
                    </p>
                  </div>
                ))
              ) : (
                <p>No questions found. Ensure the PDF contains recognizable text.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaperAnalyzer;
