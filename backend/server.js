require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");
const subjectRoutes = require("./routes/subjects");
const analyticsRoutes = require("./routes/analytics");
const userRoutes = require("./routes/user");

const app = express();

// ─── Connect Database ───────────────────────────────────────────────────────
connectDB();

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: "Too many AI requests, slow down." },
});
app.use("/chat", aiLimiter);
app.use("/api/quiz", aiLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "✅ AI Exam Prep Backend Running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user", userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error ❌",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
