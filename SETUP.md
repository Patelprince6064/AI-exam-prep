# 🤖 AI Exam Prep — ExamIQ  
### Final Year Project — Full Stack Setup Guide

---

## 📁 Project Structure

```
AI-exam-prep/
├── src/                      ← React Frontend
│   ├── api.js                ← Central API helper (NEW)
│   ├── login.js              ← Login page
│   ├── Register.js           ← Register page
│   ├── Dashboard.js          ← Main dashboard with live stats
│   ├── AIPractice.js         ← AI Chat + Explain + Study Plan
│   ├── Analytics.js          ← Charts & Leaderboard
│   ├── Subjects.js           ← Subject quiz flow
│   ├── Settings.js           ← Profile, Password, PDF Upload
│   └── home/home.js          ← Landing page
│
├── backend/                  ← Node.js/Express Backend
│   ├── server.js             ← Entry point
│   ├── config/db.js          ← MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect middleware
│   │   └── upload.js         ← Multer file uploads
│   ├── models/
│   │   ├── User.js           ← User schema
│   │   ├── QuizResult.js     ← Quiz results schema
│   │   └── Note.js           ← Uploaded notes schema
│   ├── routes/
│   │   ├── auth.js           ← Register, Login, Me
│   │   ├── chat.js           ← AI Chat, Explain, Study Plan
│   │   ├── quiz.js           ← Generate & Submit quizzes
│   │   ├── progress.js       ← Dashboard stats
│   │   ├── subjects.js       ← CS subjects & topics
│   │   ├── analytics.js      ← Analytics & Leaderboard
│   │   └── user.js           ← Profile, Settings, PDF upload
│   └── .env.example          ← Environment variables template
│
├── public/                   ← Static files
└── package.json              ← Frontend dependencies
```

---

## ⚙️ Step 1 — Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-exam-prep
JWT_SECRET=any_long_random_secret_string_here
GROQ_API_KEY=gsk_your_groq_api_key_here
CLIENT_URL=http://localhost:3000
```

- **MongoDB Atlas (Free):** https://cloud.mongodb.com → Create cluster → Get URI
- **Groq API Key (Free):** https://console.groq.com → Create API Key

```bash
npm run dev    # starts backend on http://localhost:5000
```

---

## ⚙️ Step 2 — Run Frontend

```bash
# From project root
npm install
npm start      # starts frontend on http://localhost:3000
```

> The `"proxy": "http://localhost:5000"` in package.json handles all API calls automatically.

---

## 🌐 API Endpoints Summary

| Route | Description |
|-------|-------------|
| POST `/api/auth/register` | Register user |
| POST `/api/auth/login` | Login + get JWT |
| POST `/chat` | AI tutor chat (Groq) |
| POST `/chat/explain` | Explain a topic |
| POST `/chat/study-plan` | Personalized study plan |
| POST `/api/quiz/generate` | Generate AI MCQs |
| POST `/api/quiz/submit` | Submit quiz, save result |
| GET `/api/quiz/weak-topics` | AI weak topic analysis |
| GET `/api/progress/dashboard` | Live dashboard stats |
| GET `/api/subjects` | All subjects + progress |
| GET `/api/analytics/overview` | Charts data |
| GET `/api/analytics/leaderboard` | Top students |
| PUT `/api/user/profile` | Update profile |
| PUT `/api/user/change-password` | Change password |
| POST `/api/user/upload-note` | Upload PDF/notes |
| POST `/api/user/notes/:id/generate-quiz` | Quiz from note |

---

## 🚢 Deploy on Render (Free Hosting)

1. Push this repo to GitHub
2. Go to https://render.com → New Web Service
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from your `.env`

For frontend: deploy `src/` to Netlify or Vercel.  
Update `CLIENT_URL` in Render env vars to your Netlify URL.

---

## 👨‍💻 Author
**Prince Patel** — Final Year AI Project (2026)
