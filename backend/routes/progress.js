const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

// ─── GET /api/progress/dashboard ─────────────────────────────────────────────
// Full dashboard stats for the logged-in user
router.get("/dashboard", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const results = await QuizResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Subject-wise scores
    const subjectMap = {};
    results.forEach((r) => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { total: 0, count: 0 };
      }
      subjectMap[r.subject].total += r.score;
      subjectMap[r.subject].count += 1;
    });

    const subjectProgress = Object.entries(subjectMap).map(([subject, val]) => ({
      subject,
      avgScore: Math.round(val.total / val.count),
      attempts: val.count,
    }));

    // Recent activity (last 5 quizzes)
    const recentActivity = results.slice(0, 5).map((r) => ({
      _id: r._id,
      subject: r.subject,
      topic: r.topic,
      score: r.score,
      date: r.createdAt,
    }));

    // Overall accuracy
    const accuracy =
      user.stats.totalQuestions > 0
        ? Math.round((user.stats.totalCorrect / user.stats.totalQuestions) * 100)
        : 0;

    // Daily progress (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyResults = await QuizResult.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    });

    const dailyMap = {};
    dailyResults.forEach((r) => {
      const day = new Date(r.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (!dailyMap[day]) dailyMap[day] = { quizzes: 0, avgScore: 0, total: 0 };
      dailyMap[day].quizzes += 1;
      dailyMap[day].total += r.score;
      dailyMap[day].avgScore = Math.round(dailyMap[day].total / dailyMap[day].quizzes);
    });

    res.json({
      stats: {
        testsTaken: user.stats.testsTaken,
        accuracy,
        studyHours: user.stats.studyHours,
        streak: user.stats.streak,
      },
      subjectProgress,
      recentActivity,
      dailyActivity: dailyMap,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /api/progress/study-hours ──────────────────────────────────────────
// Log study hours
router.post("/study-hours", protect, async (req, res) => {
  try {
    const { hours } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({ message: "Valid hours required ❌" });
    }

    const user = await User.findById(req.user._id);
    user.stats.studyHours += parseFloat(hours);
    await user.save();

    res.json({
      message: "Study hours logged ✅",
      totalStudyHours: user.stats.studyHours,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/progress/stats ──────────────────────────────────────────────────
// Get raw user stats
router.get("/stats", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accuracy =
      user.stats.totalQuestions > 0
        ? Math.round((user.stats.totalCorrect / user.stats.totalQuestions) * 100)
        : 0;

    res.json({ stats: { ...user.stats.toObject(), accuracy } });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
