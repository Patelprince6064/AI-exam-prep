import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import {
  apiGetProfile, apiUpdateProfile, apiChangePassword,
  apiGetNotes, apiUploadNote, apiDeleteNote,
  apiGenerateQuizFromNote, clearAuth, saveAuth
} from "./api";
import "./Dashboard.css";

function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [studyGoal, setStudyGoal] = useState(5);
  const [profileMsg, setProfileMsg] = useState("");

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // Notes / PDF
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("DSA");
  const [noteFile, setNoteFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    Promise.all([apiGetProfile(), apiGetNotes()])
      .then(([pData, nData]) => {
        setProfile(pData.user);
        setName(pData.user?.name || "");
        setStudyGoal(pData.user?.studyGoalHours || 5);
        setNotes(nData.notes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  const handleProfileSave = async () => {
    setProfileMsg("");
    try {
      const data = await apiUpdateProfile({ name, studyGoalHours: studyGoal });
      if (data.user) {
        saveAuth(localStorage.getItem("token"), data.user);
        setProfileMsg("Profile updated ✅");
      } else {
        setProfileMsg(data.message || "Update failed ❌");
      }
    } catch { setProfileMsg("Server error ❌"); }
  };

  const handlePasswordChange = async () => {
    setPwMsg("");
    if (!currentPw || !newPw) { setPwMsg("Fill both fields ❌"); return; }
    try {
      const data = await apiChangePassword(currentPw, newPw);
      setPwMsg(data.message || "Done");
      setCurrentPw(""); setNewPw("");
    } catch { setPwMsg("Server error ❌"); }
  };

  const handleUploadNote = async () => {
    if (!noteFile) { setUploadMsg("Select a file first ❌"); return; }
    setUploadLoading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", noteFile);
    formData.append("title", noteTitle || noteFile.name);
    formData.append("subject", noteSubject);
    try {
      const data = await apiUploadNote(formData);
      if (data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setUploadMsg("Note uploaded ✅");
        setNoteFile(null); setNoteTitle("");
      } else {
        setUploadMsg(data.message || "Upload failed ❌");
      }
    } catch { setUploadMsg("Upload error ❌"); }
    finally { setUploadLoading(false); }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await apiDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch { alert("Delete failed ❌"); }
  };

  const handleGenerateFromNote = async (noteId, noteTitle) => {
    alert(`Generating quiz from "${noteTitle}"... Check AI Practice tab!`);
    try {
      const data = await apiGenerateQuizFromNote(noteId, 5);
      if (data.questions) {
        alert(`✅ Generated ${data.questions.length} questions for "${data.note.title}"! Go to AI Practice to use them.`);
      }
    } catch { alert("Failed to generate quiz ❌"); }
  };

  const formatSize = (bytes) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="logo">AI Prep</h2>
        <nav className="menu">
          <Link to="/dashboard" className="menu-item"><span>🏠</span> Dashboard</Link>
          <Link to="/practice" className="menu-item"><span>🤖</span> AI Practice</Link>
          <Link to="/subjects" className="menu-item"><span>📚</span> Subjects</Link>
          <Link to="/analytics" className="menu-item"><span>📊</span> Analytics</Link>
          <Link to="/settings" className="menu-item active"><span>⚙</span> Settings</Link>
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </nav>
      </div>

      <div className="main">
        <div className="header">
          <h1>Settings ⚙</h1>
          <p>Manage your account, preferences and study notes</p>
        </div>

        {loading ? (
          <div style={{ color: "#0f172a", padding: 40 }}>Loading...</div>
        ) : (
          <>
            {/* ── PROFILE ── */}
            <div className="ai-box" style={{ marginBottom: 24 }}>
              <h2>👤 Profile</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <div>
                  <label style={{ color: "#64748b", fontSize: 13 }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "10px 14px", marginTop: 4, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ color: "#64748b", fontSize: 13 }}>Email (read-only)</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    readOnly
                    style={{ display: "block", width: "100%", padding: "10px 14px", marginTop: 4, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#94a3b8", fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ color: "#64748b", fontSize: 13 }}>Daily Study Goal (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    style={{ display: "block", width: 120, padding: "10px 14px", marginTop: 4, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 15 }}
                  />
                </div>
                <button onClick={handleProfileSave} style={{ width: "fit-content", padding: "10px 24px", background: "#2563eb", color: "#0f172a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 }}>
                  Save Profile
                </button>
                {profileMsg && <p style={{ color: profileMsg.includes("✅") ? "#22c55e" : "#ef4444" }}>{profileMsg}</p>}
              </div>
            </div>

            {/* ── PASSWORD ── */}
            <div className="ai-box" style={{ marginBottom: 24 }}>
              <h2>🔒 Change Password</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  style={{ padding: "10px 14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 15 }}
                />
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={{ padding: "10px 14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 15 }}
                />
                <button onClick={handlePasswordChange} style={{ width: "fit-content", padding: "10px 24px", background: "#2563eb", color: "#0f172a", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  Change Password
                </button>
                {pwMsg && <p style={{ color: pwMsg.includes("✅") ? "#22c55e" : "#ef4444" }}>{pwMsg}</p>}
              </div>
            </div>

            {/* ── UPLOAD NOTES / PDF ── */}
            <div className="ai-box" style={{ marginBottom: 24 }}>
              <h2>📄 Upload Notes / PDF</h2>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Upload your study notes to generate AI quizzes from them (PDF, TXT, DOC — max 10MB)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Note title (optional)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  style={{ flex: 1, minWidth: 180, padding: "10px 14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a" }}
                />
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  style={{ padding: "10px 14px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 8, color: "#0f172a" }}
                >
                  {["DSA", "OS", "DBMS", "CN", "AI"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <label style={{ padding: "10px 18px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", color: "#0f172a" }}>
                  {noteFile ? noteFile.name : "Choose File"}
                  <input type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }} onChange={(e) => setNoteFile(e.target.files[0])} />
                </label>
                <button onClick={handleUploadNote} disabled={uploadLoading} style={{ padding: "10px 20px", background: "#2563eb", color: "#0f172a", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  {uploadLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {uploadMsg && <p style={{ marginTop: 8, color: uploadMsg.includes("✅") ? "#22c55e" : "#ef4444" }}>{uploadMsg}</p>}

              {/* NOTES LIST */}
              {notes.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ color: "#334155", marginBottom: 12 }}>Your Notes ({notes.length})</h3>
                  {notes.map((note) => (
                    <div key={note._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 8, marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <p style={{ color: "#0f172a", fontWeight: 600 }}>{note.title}</p>
                        <p style={{ color: "#94a3b8", fontSize: 12 }}>{note.subject} · {note.originalName} · {formatSize(note.fileSize || 0)}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleGenerateFromNote(note._id, note.title)} style={{ padding: "6px 14px", background: "#eff6ff", border: "1.5px solid #2563eb", color: "#0f172a", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                          🤖 Generate Quiz
                        </button>
                        <button onClick={() => handleDeleteNote(note._id)} style={{ padding: "6px 14px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCOUNT STATS */}
            <div className="ai-box">
              <h2>📊 Account Stats</h2>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["Tests Taken", profile?.stats?.testsTaken ?? 0],
                  ["Study Hours", `${profile?.stats?.studyHours ?? 0}h`],
                  ["Streak", `${profile?.stats?.streak ?? 0} 🔥`],
                  ["Accuracy", profile?.stats?.totalQuestions > 0 ? `${Math.round((profile.stats.totalCorrect / profile.stats.totalQuestions) * 100)}%` : "N/A"],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8 }}>
                    <p style={{ color: "#94a3b8", fontSize: 12 }}>{label}</p>
                    <p style={{ color: "#0f172a", fontSize: 22, fontWeight: 700 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Settings;
