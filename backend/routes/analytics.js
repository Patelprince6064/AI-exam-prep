const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
router.get("/overview", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const results = await QuizResult.find({ user: req.user._id });

    if (results.length === 0) {
      return res.json({
        message: "No quiz data yet. Take some quizzes to see analytics!",
        hasData: false,
      });
    }

    // ── Subject performance ──
    const subjectMap = {};
    results.forEach((r) => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { scores: [], totalCorrect: 0, totalQ: 0 };
      }
      subjectMap[r.subject].scores.push(r.score);
      subjectMap[r.subject].totalCorrect += r.correctAnswers;
      subjectMap[r.subject].totalQ += r.totalQuestions;
    });

    const subjectPerformance = Object.entries(subjectMap).map(([subject, val]) => ({
      subject,
      avgScore: Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length),
      bestScore: Math.max(...val.scores),
      attempts: val.scores.length,
      accuracy: Math.round((val.totalCorrect / val.totalQ) * 100),
    }));

    // ── Score trend (last 14 results) ──
    const scoreTrend = results
      .slice(-14)
      .map((r, i) => ({ index: i + 1, score: r.score, subject: r.subject, date: r.createdAt }));

    // ── Accuracy donut ──
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const totalQ = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const overallAccuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    // ── Score distribution ──
    const distribution = { "0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    results.forEach((r) => {
      if (r.score <= 40) distribution["0-40"]++;
      else if (r.score <= 60) distribution["41-60"]++;
      else if (r.score <= 80) distribution["61-80"]++;
      else distribution["81-100"]++;
    });

    // ── Weekly activity ──
    const now = new Date();
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayResults = results.filter((r) => {
        const d = new Date(r.createdAt);
        return (
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      });
      weeklyActivity.push({
        day: dayStr,
        quizzes: dayResults.length,
        avgScore: dayResults.length
          ? Math.round(dayResults.reduce((s, r) => s + r.score, 0) / dayResults.length)
          : 0,
      });
    }

    res.json({
      hasData: true,
      overview: {
        testsTaken: user.stats.testsTaken,
        overallAccuracy,
        studyHours: user.stats.studyHours,
        streak: user.stats.streak,
        avgScore: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
      },
      subjectPerformance,
      scoreTrend,
      scoreDistribution: distribution,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/analytics/leaderboard ──────────────────────────────────────────
// Top performers (anonymized)
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const topUsers = await User.find({ "stats.testsTaken": { $gt: 0 } })
      .sort({ "stats.totalCorrect": -1 })
      .limit(10)
      .select("name stats");

    const leaderboard = topUsers.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      testsTaken: u.stats.testsTaken,
      accuracy:
        u.stats.totalQuestions > 0
          ? Math.round((u.stats.totalCorrect / u.stats.totalQuestions) * 100)
          : 0,
      streak: u.stats.streak,
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
