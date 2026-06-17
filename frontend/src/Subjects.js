import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetSubjects, apiGenerateQuiz, apiSubmitQuiz } from "./api";
import { SharedSidebar } from "./SharedLayout";
import "./Subjects.css";

const DIFFICULTY_CONFIG = {
  easy:   { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", label: "Easy" },
  medium: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Medium" },
  hard:   { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Hard" },
};

function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [quiz, setQuiz]               = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers]         = useState({});
  const [result, setResult]           = useState(null);
  const [difficulty, setDifficulty]   = useState("medium");
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    apiGetSubjects()
      .then((data) => setSubjects(data.subjects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const openSubject = (subject) => {
    setSelected(subject); setQuiz(null);
    setAnswers({}); setResult(null); setActiveTopic(null);
  };

  const generateQuiz = async (topic) => {
    setActiveTopic(topic);
    setQuizLoading(true); setQuiz(null); setAnswers({}); setResult(null);
    try {
      const data = await apiGenerateQuiz(selected.code, topic, 5, difficulty);
      setQuiz({ questions: data.questions, topic, subject: selected.code });
    } catch { alert("Failed to generate quiz"); }
    finally { setQuizLoading(false); }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const questions = quiz.questions.map((q, i) => ({
      question: q.question, userAnswer: answers[i] || "",
      correctAnswer: q.correctAnswer, isCorrect: answers[i] === q.correctAnswer,
      topic: q.topic || quiz.topic, explanation: q.explanation,
    }));
    try {
      const data = await apiSubmitQuiz({ subject: quiz.subject, topic: quiz.topic, questions, timeTaken: 0, mode: "practice" });
      setResult(data);
    } catch { alert("Failed to submit quiz"); }
  };

  const SUBJECT_COLORS = ["#2563eb","#06b6d4","#10b981","#f59e0b","#8b5cf6"];

  return (
    <div className="dashboard">
      <SharedSidebar />
      <div className="main subjects-main">
        <div className="subjects-header">
          <div>
            <h1>📚 Subjects</h1>
            <p>Select a subject · Choose a topic · Practice with AI-generated MCQs</p>
          </div>
          {selected && (
            <button className="s-back-btn" onClick={() => { setSelected(null); setQuiz(null); setResult(null); }}>
              ← All Subjects
            </button>
          )}
        </div>

        {loading ? (
          <div className="subjects-loading"><div className="loading-ring"></div><p>Loading subjects…</p></div>
        ) : !selected ? (
          <div className="subject-grid">
            {subjects.map((s, idx) => (
              <div key={s.code} className="subject-card" onClick={() => openSubject(s)}>
                <div className="subject-card-accent" style={{ background: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}></div>
                <div className="subject-icon">{s.icon}</div>
                <div className="subject-code" style={{ color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}>{s.code}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-stats-row">
                  <span className="s-stat-pill">{s.quizzesTaken} quizzes</span>
                  {s.avgScore > 0 && <span className="s-stat-pill green">{s.avgScore}% avg</span>}
                </div>
                <div className="subject-arrow">Start →</div>
              </div>
            ))}
          </div>

        ) : result ? (
          <div className="result-screen">
            <div className="result-hero">
              <div className="result-emoji">{result.result.score >= 70 ? "🎉" : result.result.score >= 40 ? "💪" : "📚"}</div>
              <h2>{result.result.score >= 70 ? "Excellent Work!" : result.result.score >= 40 ? "Good Effort!" : "Keep Practicing!"}</h2>
              <p className="result-subtitle">{quiz.topic} · {selected.code}</p>
            </div>
            <div className="result-score-row">
              <div className="result-score-card"><div className="result-score-val">{result.result.score}%</div><div className="result-score-label">Score</div></div>
              <div className="result-score-card"><div className="result-score-val">{result.result.correctAnswers}/{result.result.totalQuestions}</div><div className="result-score-label">Correct</div></div>
              <div className="result-score-card"><div className="result-score-val" style={{ color: result.result.score >= 70 ? "#22c55e" : "#ef4444" }}>{result.result.score >= 70 ? "Pass" : "Retry"}</div><div className="result-score-label">Status</div></div>
            </div>
            
            <div className="result-review-section">
              <h3 className="review-heading">Review Answers</h3>
              <div className="review-list">
                {quiz.questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correctAnswer;
                  return (
                    <div className={`review-card ${isCorrect ? 'correct' : 'wrong'}`} key={i}>
                      <div className="review-q-text">
                        <span className="review-badge">Q{i + 1}</span>
                        {q.question}
                      </div>
                      <div className="review-ans-row">
                        <div className={`review-ans-box ${isCorrect ? 'green-bg' : 'red-bg'}`}>
                          <span className="ans-label">Your Answer:</span>
                          <span className="ans-val">{answers[i] || "Skipped"}</span>
                        </div>
                        {!isCorrect && (
                          <div className="review-ans-box green-bg">
                            <span className="ans-label">Correct Answer:</span>
                            <span className="ans-val">{q.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="review-explanation">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {result.subjectScores && result.subjectScores.length > 0 && (
              <div className="result-subject-scores" style={{ marginTop: "32px", padding: "20px", background: "#1e293b", borderRadius: "16px", color: "#f8fafc", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#cbd5e1", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>📊 Overall Subject Performance</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.subjectScores.map(s => (
                    <div key={s.subject} style={{ display: "flex", justifyContent: "space-between", background: "#0f172a", padding: "10px 16px", borderRadius: "8px", fontSize: "15px", fontWeight: "500", border: "1px solid #334155" }}>
                      <span style={{ color: "#93c5fd" }}>{s.subject}</span> 
                      <span>{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.feedback && (
              <div className="result-feedback" style={{ marginTop: "24px", padding: "24px", background: "#0f172a", borderRadius: "16px", border: "1px solid #334155", color: "#f8fafc", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                <div className="result-feedback-label" style={{ fontWeight: "700", marginBottom: "16px", color: "#818cf8", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>🤖</span> Weak Topic Intelligence
                </div>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: "1.7", color: "#e2e8f0", fontSize: "15px" }}>
                  {result.feedback}
                </pre>
              </div>
            )}
            <div className="result-actions">
              <button className="result-btn primary" onClick={() => { setQuiz(null); setAnswers({}); setResult(null); }}>Try Another Topic</button>
              <button className="result-btn" onClick={() => setSelected(null)}>Back to Subjects</button>
            </div>
          </div>

        ) : quiz ? (
          <div className="quiz-screen">
            <div className="quiz-topbar">
              <button className="s-back-btn" onClick={() => { setQuiz(null); setAnswers({}); }}>← Topics</button>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span className="quiz-topic-tag">{quiz.topic}</span>
                <span className="quiz-progress-txt">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              </div>
            </div>
            <div className="quiz-questions">
              {quiz.questions.map((q, i) => (
                <div className={`quiz-q-card ${answers[i] ? "answered" : ""}`} key={i}>
                  <div className="quiz-q-header-row">
                    <span className="quiz-q-badge">Q{i + 1}</span>
                    <p className="quiz-q-text">{q.question}</p>
                  </div>
                  <div className="quiz-options">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`quiz-option-label ${answers[i] === opt ? "selected" : ""}`}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers((prev) => ({ ...prev, [i]: opt }))} />
                        <span className="quiz-opt-letter">{String.fromCharCode(65 + oi)}</span>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="quiz-submit-btn" onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}>
              ✅ Submit Quiz ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </button>
          </div>

        ) : (
          <div className="topic-screen">
            <div className="topic-banner" style={{ background: `linear-gradient(135deg, ${SUBJECT_COLORS[subjects.findIndex(s=>s.code===selected.code) % SUBJECT_COLORS.length]}18, #f8fafc)` }}>
              <span className="topic-banner-icon">{selected.icon}</span>
              <div>
                <div className="topic-banner-code">{selected.code}</div>
                <div className="topic-banner-name">{selected.name}</div>
              </div>
            </div>
            <div className="difficulty-row">
              <span className="difficulty-label">Difficulty:</span>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                <button key={key} className={`diff-btn ${difficulty === key ? "active" : ""}`}
                  style={difficulty === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border } : {}}
                  onClick={() => setDifficulty(key)}>
                  {cfg.label}
                </button>
              ))}
            </div>
            <div className="topic-hint">
              {quizLoading
                ? <><span className="loading-ring sm"></span> Generating "{activeTopic}" quiz…</>
                : "Click any topic to generate a 5-question AI quiz:"}
            </div>
            <div className="topic-grid">
              {selected.topics.map((topic) => (
                <button key={topic} className={`topic-chip ${activeTopic === topic && quizLoading ? "chip-loading" : ""}`}
                  onClick={() => generateQuiz(topic)} disabled={quizLoading}>
                  {activeTopic === topic && quizLoading ? "⏳ Generating…" : topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;
