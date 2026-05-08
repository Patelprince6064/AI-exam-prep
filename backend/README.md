# 🤖 AI Exam Prep — Backend API v2.0

A full-featured Node.js/Express backend for the AI Exam Prep final year project.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| AI Service | Groq API (llama-3.1-8b-instant) |
| File Uploads | Multer |
| Security | Helmet, express-rate-limit |

---

## 📁 Project Structure

```
backend/
├── server.js              # Entry point
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── auth.js            # JWT protect middleware
│   └── upload.js          # Multer file upload
├── models/
│   ├── User.js            # User schema
│   ├── QuizResult.js      # Quiz result schema
│   └── Note.js            # Uploaded notes schema
├── routes/
│   ├── auth.js            # Register, Login, Me
│   ├── chat.js            # AI Tutor chat (Groq)
│   ├── quiz.js            # Generate & submit quizzes
│   ├── progress.js        # Dashboard stats & tracking
│   ├── subjects.js        # CS subjects & topics
│   ├── analytics.js       # Charts & analytics data
│   └── user.js            # Profile, settings, PDF uploads
├── uploads/               # Uploaded files (auto-created)
├── .env.example           # Environment variables template
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-exam-prep
JWT_SECRET=any_long_random_secret_string
GROQ_API_KEY=gsk_your_groq_api_key
CLIENT_URL=http://localhost:3000
```

- **MongoDB Atlas**: https://cloud.mongodb.com → Create free cluster → Get connection string
- **Groq API Key (FREE)**: https://console.groq.com → Create API Key

### 3. Run the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user (🔒) |
| POST | `/api/auth/logout` | Logout (🔒) |

### AI Chat (`/chat`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/chat` | AI tutor chat (🔒) |
| POST | `/chat/explain` | Explain a concept (🔒) |
| POST | `/chat/study-plan` | Generate study plan (🔒) |

### Quiz (`/api/quiz`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/quiz/generate` | Generate AI questions (🔒) |
| POST | `/api/quiz/submit` | Submit quiz & save result (🔒) |
| GET | `/api/quiz/history` | Quiz history (🔒) |
| GET | `/api/quiz/history/:id` | Single quiz result (🔒) |
| GET | `/api/quiz/weak-topics` | AI weak topic analysis (🔒) |

### Progress (`/api/progress`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/progress/dashboard` | Full dashboard stats (🔒) |
| POST | `/api/progress/study-hours` | Log study hours (🔒) |
| GET | `/api/progress/stats` | Raw stats (🔒) |

### Subjects (`/api/subjects`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/subjects` | All subjects with progress (🔒) |
| GET | `/api/subjects/:code/topics` | Topics for a subject (🔒) |
| PUT | `/api/subjects/enroll` | Update enrolled subjects (🔒) |

### Analytics (`/api/analytics`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/overview` | Full analytics data (🔒) |
| GET | `/api/analytics/leaderboard` | Top performers (🔒) |

### User (`/api/user`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get profile (🔒) |
| PUT | `/api/user/profile` | Update name/goals (🔒) |
| PUT | `/api/user/change-password` | Change password (🔒) |
| GET | `/api/user/notes` | Get uploaded notes (🔒) |
| POST | `/api/user/upload-note` | Upload PDF/note (🔒) |
| DELETE | `/api/user/notes/:id` | Delete a note (🔒) |
| POST | `/api/user/notes/:id/generate-quiz` | Generate quiz from note (🔒) |

🔒 = Requires `Authorization: Bearer <token>` header

---

## 🔗 Frontend Integration

### Update your frontend API calls

Your `login.js` and `Register.js` currently call the old Render URL. Update to use the new auth routes:

```js
// login.js
const res = await fetch("http://localhost:5000/api/auth/login", { ... });
// Save the token:
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

// Register.js
const res = await fetch("http://localhost:5000/api/auth/register", { ... });

// AIPractice.js (add auth header)
const res = await fetch("http://localhost:5000/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body: JSON.stringify({ message: input })
});
```

---

## 🚢 Deploy on Render (Free)

1. Push backend folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root directory to `backend`
4. Add environment variables from your `.env`
5. Deploy! Your URL will be: `https://your-app.onrender.com`

---

## 📌 Subjects Covered

- **DSA** — Data Structures & Algorithms (15 topics)
- **OS** — Operating Systems (14 topics)
- **DBMS** — Database Management Systems (14 topics)
- **CN** — Computer Networks (14 topics)
- **AI** — Artificial Intelligence (14 topics)
