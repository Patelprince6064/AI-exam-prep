import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { apiGetSubjects, apiEnrollSubjects, apiGenerateQuiz, apiSubmitQuiz, clearAuth } from "./api";
import "./Dashboard.css";

function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // currently open subject
  const [quiz, setQuiz] = useState(null);          // generated questions
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState({});      // user's selected answers
  const [result, setResult] = useState(null);       // submitted result
  const [difficulty, setDifficulty] = useState("medium");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    apiGetSubjects()
      .then((data) => setSubjects(data.subjects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  const openSubject = (subject) => {
    setSelected(subject);
    setQuiz(null);
    setAnswers({});
    setResult(null);
  };

  const generateQuiz = async (topic) => {
    setQuizLoading(true);
    setQuiz(null);
    setAnswers({});
    setResult(null);
    try {
      const data = await apiGenerateQuiz(selected.code, topic, 5, difficulty);
      setQuiz({ questions: data.questions, topic, subject: selected.code });
    } catch {
      alert("Failed to generate quiz ❌");
    } finally {
      setQuizLoading(false);
    }
  };

  const selectAnswer = (idx, answer) => {
    setAnswers((prev) => ({ ...prev, [idx]: answer }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const questions = quiz.questions.map((q, i) => ({
      question: q.question,
      userAnswer: answers[i] || "",
      correctAnswer: q.correctAnswer,
      isCorrect: answers[i] === q.correctAnswer,
      topic: q.topic || quiz.topic,
      explanation: q.explanation,
    }));

    try {
      const data = await apiSubmitQuiz({
        subject: quiz.subject,
        topic: quiz.topic,
        questions,
        timeTaken: 0,
        mode: "practice",
      });
      setResult(data);
    } catch {
      alert("Failed to submit quiz ❌");
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="logo">AI Prep</h2>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item"><span>🏠</span> Dashboard</Link>
          <Link to="/practice" className="menu-item"><span>🤖</span> AI Practice</Link>
          <Link to="/subjects" className="menu-item active"><span>📚</span> Subjects</Link>
          <Link to="/analytics" className="menu-item"><span>📊</span> Analytics</Link>
          <Link to="/settings" className="menu-item"><span>⚙</span> Settings</Link>
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </nav>
      </div>

      <div className="main">
        <div className="header">
          <h1>Subjects 📚</h1>
          <p>Select a subject, pick a topic and practice with AI-generated questions</p>
        </div>

        {loading ? (
          <div style={{ color: "#0f172a", padding: 40 }}>Loading subjects...</div>
        ) : !selected ? (
          /* ── SUBJECT GRID ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, padding: "20px 0" }}>
            {subjects.map((s) => (
              <div
                key={s.code}
                onClick={() => openSubject(s)}
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ fontSize: 40 }}>{s.icon}</div>
                <h3 style={{ color: "#0f172a", margin: "8px 0 4px" }}>{s.code}</h3>
                <p style={{ color: "#64748b", fontSize: 13 }}>{s.name}</p>
                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <span style={{ color: "#6366f1", fontSize: 13 }}>{s.quizzesTaken} quizzes</span>
                  {s.avgScore > 0 && <span style={{ color: "#22c55e", fontSize: 13 }}>Avg: {s.avgScore}%</span>}
                </div>
              </div>
            ))}
          </div>
        ) : !quiz ? (
          /* ── TOPIC LIST ── */
          <div>
            <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "1px solid #e2e8f0", color: "#0f172a", padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 20 }}>
              ← Back to Subjects
            </button>
            <h2 style={{ color: "#0f172a", marginBottom: 8 }}>{selected.icon} {selected.name}</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#475569", marginRight: 8 }}>Difficulty:</label>
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    marginRight: 8, padding: "4px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: difficulty === d ? "#6366f1" : "rgba(255,255,255,0.1)",
                    color: "#0f172a", fontSize: 13,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <p style={{ color: "#64748b", marginBottom: 16 }}>
              {quizLoading ? "⏳ Generating questions..." : "Click any topic to generate a quiz:"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {selected.topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => generateQuiz(topic)}
                  disabled={quizLoading}
                  style={{
                    padding: "10px 18px", borderRadius: 8,
                    background: "#eff6ff",
                    border: "1.5px solid #93c5fd",
                    color: "#0f172a", cursor: "pointer", fontSize: 14,
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : result ? (
          /* ── RESULT ── */
          <div style={{ color: "#0f172a" }}>
            <h2>Quiz Complete! 🎉</h2>
            <div className="stats" style={{ margin: "20px 0" }}>
              <div className="card stat1"><h3>Score</h3><p>{result.result.score}%</p></div>
              <div className="card stat2"><h3>Correct</h3><p>{result.result.correctAnswers}/{result.result.totalQuestions}</p></div>
            </div>
            <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h3>AI Feedback 🤖</h3>
              <p style={{ marginTop: 8, lineHeight: 1.6 }}>{result.feedback}</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setQuiz(null); setAnswers({}); setResult(null); }} style={{ padding: "10px 20px", background: "#2563eb", color: "#0f172a", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Try Another Topic
              </button>
              <button onClick={() => setSelected(null)} style={{ padding: "10px 20px", background: "transparent", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer" }}>
                Back to Subjects
              </button>
            </div>
          </div>
        ) : (
          /* ── QUIZ ── */
          <div style={{ color: "#0f172a" }}>
            <button onClick={() => setQuiz(null)} style={{ background: "transparent", border: "1px solid #e2e8f0", color: "#0f172a", padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 20 }}>
              ← Back to Topics
            </button>
            <h2 style={{ marginBottom: 20 }}>📝 {quiz.topic} Quiz</h2>
            {quiz.questions.map((q, i) => (
              <div key={i} style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 12 }}>Q{i + 1}. {q.question}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt) => (
                    <label key={opt} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderRadius: 8, cursor: "pointer",
                      background: answers[i] === opt ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)",
                      border: answers[i] === opt ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                      <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => selectAnswer(i, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < quiz.questions.length}
              style={{
                padding: "12px 28px", background: "#2563eb", color: "#0f172a", border: "none",
                borderRadius: 8, cursor: "pointer", fontSize: 16, marginTop: 8,
                opacity: Object.keys(answers).length < quiz.questions.length ? 0.5 : 1,
              }}
            >
              Submit Quiz ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;
