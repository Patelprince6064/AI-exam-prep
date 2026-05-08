// src/api.js
// Central API helper — all backend calls go through here

const BASE_URL = process.env.REACT_APP_API_URL || "";

// Get the JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers with optional auth
const headers = (auth = true) => ({
  "Content-Type": "application/json",
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const apiRegister = (name, email, password) =>
  fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: headers(false),
    body: JSON.stringify({ name, email, password }),
  }).then((r) => r.json());

export const apiLogin = (email, password) =>
  fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: headers(false),
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

export const apiGetMe = () =>
  fetch(`${BASE_URL}/api/auth/me`, { headers: headers() }).then((r) => r.json());

// ─── Chat / AI ───────────────────────────────────────────────────────────────
export const apiChat = (message) =>
  fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message }),
  }).then((r) => r.json());

export const apiExplain = (topic, subject) =>
  fetch(`${BASE_URL}/chat/explain`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ topic, subject }),
  }).then((r) => r.json());

export const apiStudyPlan = (examDate, weakTopics) =>
  fetch(`${BASE_URL}/chat/study-plan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ examDate, weakTopics }),
  }).then((r) => r.json());

// ─── Quiz ────────────────────────────────────────────────────────────────────
export const apiGenerateQuiz = (subject, topic, count = 5, difficulty = "medium") =>
  fetch(`${BASE_URL}/api/quiz/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ subject, topic, count, difficulty }),
  }).then((r) => r.json());

export const apiSubmitQuiz = (payload) =>
  fetch(`${BASE_URL}/api/quiz/submit`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const apiQuizHistory = (limit = 20, subject = "") =>
  fetch(`${BASE_URL}/api/quiz/history?limit=${limit}&subject=${subject}`, {
    headers: headers(),
  }).then((r) => r.json());

export const apiWeakTopics = () =>
  fetch(`${BASE_URL}/api/quiz/weak-topics`, { headers: headers() }).then((r) =>
    r.json()
  );

// ─── Progress ────────────────────────────────────────────────────────────────
export const apiDashboard = () =>
  fetch(`${BASE_URL}/api/progress/dashboard`, { headers: headers() }).then((r) =>
    r.json()
  );

export const apiLogStudyHours = (hours) =>
  fetch(`${BASE_URL}/api/progress/study-hours`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ hours }),
  }).then((r) => r.json());

// ─── Subjects ────────────────────────────────────────────────────────────────
export const apiGetSubjects = () =>
  fetch(`${BASE_URL}/api/subjects`, { headers: headers() }).then((r) => r.json());

export const apiEnrollSubjects = (subjects) =>
  fetch(`${BASE_URL}/api/subjects/enroll`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ subjects }),
  }).then((r) => r.json());

// ─── Analytics ───────────────────────────────────────────────────────────────
export const apiAnalytics = () =>
  fetch(`${BASE_URL}/api/analytics/overview`, { headers: headers() }).then((r) =>
    r.json()
  );

export const apiLeaderboard = () =>
  fetch(`${BASE_URL}/api/analytics/leaderboard`, { headers: headers() }).then((r) =>
    r.json()
  );

// ─── User / Settings ─────────────────────────────────────────────────────────
export const apiGetProfile = () =>
  fetch(`${BASE_URL}/api/user/profile`, { headers: headers() }).then((r) => r.json());

export const apiUpdateProfile = (data) =>
  fetch(`${BASE_URL}/api/user/profile`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const apiChangePassword = (currentPassword, newPassword) =>
  fetch(`${BASE_URL}/api/user/change-password`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then((r) => r.json());

export const apiGetNotes = () =>
  fetch(`${BASE_URL}/api/user/notes`, { headers: headers() }).then((r) => r.json());

export const apiUploadNote = (formData) =>
  fetch(`${BASE_URL}/api/user/upload-note`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type for multipart
    body: formData,
  }).then((r) => r.json());

export const apiDeleteNote = (id) =>
  fetch(`${BASE_URL}/api/user/notes/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then((r) => r.json());

export const apiGenerateQuizFromNote = (noteId, count = 5) =>
  fetch(`${BASE_URL}/api/user/notes/${noteId}/generate-quiz`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ count }),
  }).then((r) => r.json());

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getToken();
