const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ─── POST /api/quiz/generate ──────────────────────────────────────────────────
// Generate AI quiz questions for a given subject/topic
router.post("/generate", protect, async (req, res) => {
  try {
    const { subject, topic, count = 5, difficulty = "medium" } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required ❌" });
    }

    const prompt = `Generate exactly ${count} multiple choice questions about "${topic || subject}" 
for a ${difficulty} difficulty CS exam.

Return ONLY a valid JSON array (no extra text, no markdown) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"],
    "correctAnswer": "A) Option1",
    "explanation": "Brief explanation of why this is correct.",
    "topic": "${topic || subject}",
    "difficulty": "${difficulty}"
  }
]`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 2048,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You are a CS exam question generator. Always respond with valid JSON only, no extra text.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Strip markdown code fences if present
    content = content.replace(/```json|```/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(content);
    } catch (parseErr) {
      console.error("JSON parse error:", content);
      return res.status(500).json({ message: "Failed to parse AI response ❌" });
    }

    res.json({
      questions,
      subject,
      topic: topic || subject,
      count: questions.length,
    });
  } catch (error) {
    console.error("Quiz generate error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /api/quiz/submit ────────────────────────────────────────────────────
// Submit quiz answers and save results
router.post("/submit", protect, async (req, res) => {
  try {
    const { subject, topic, questions, timeTaken, mode } = req.body;

    if (!subject || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid quiz data ❌" });
    }

    const correctAnswers = questions.filter((q) => q.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    // Save quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      subject,
      topic: topic || subject,
      questions,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeTaken: timeTaken || 0,
      mode: mode || "ai-generated",
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.testsTaken += 1;
    user.stats.totalCorrect += correctAnswers;
    user.stats.totalQuestions += questions.length;
    await user.save();

    // Fetch all past quiz results to calculate subject-wise performance
    const allResults = await QuizResult.find({ user: req.user._id });
    const subjectStats = {};
    allResults.forEach((r) => {
      if (!subjectStats[r.subject]) subjectStats[r.subject] = { correct: 0, total: 0 };
      subjectStats[r.subject].correct += r.correctAnswers;
      subjectStats[r.subject].total += r.totalQuestions;
    });

    let subjectScoresStr = "";
    const subjectScores = [];
    for (const [sub, stats] of Object.entries(subjectStats)) {
      const pct = Math.round((stats.correct / stats.total) * 100);
      subjectScoresStr += `${sub}: ${pct}%\n`;
      subjectScores.push({ subject: sub, score: pct });
    }

    // AI feedback on performance (Weak Topic Intelligence)
    let feedback = "";
    try {
      const feedbackRes = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: `You are an AI Exam Prep Tutor. Provide 'Weak Topic Intelligence'.
You MUST respond ONLY with a valid JSON object. Do not include any markdown formatting, backticks, or conversational text. Use this exact schema:
{
  "subject": "The main subject they are struggling with",
  "analysis": "1-2 sentences explaining exactly what concepts they missed from the wrong topics provided.",
  "recommended": ["Sub-topic 1", "Sub-topic 2", "Sub-topic 3"],
  "actionable_advice": "1 specific sentence on how to practice this",
  "study_time_hours": 3
}`,
            },
            {
              role: "user",
              content: `Student's overall performance:
${subjectScoresStr || "No past data."}

The student just scored ${score}% on a ${subject} quiz.
Their wrong answers were related to these topics: ${questions.filter((q) => !q.isCorrect).map((q) => q.topic || subject).join(", ") || "none"}.

Provide the JSON feedback.`,
            },
          ],
          response_format: { type: "json_object" }
        }),
      });
      const feedbackData = await feedbackRes.json();
      const rawFeedback = feedbackData.choices[0].message.content;
      const parsed = JSON.parse(rawFeedback);
      
      feedback = `You are struggling with ${parsed.subject}.

Detailed Analysis:
${parsed.analysis}

Recommended Topics to Master:
${parsed.recommended.map(t => `- ${t}`).join('\n')}

Actionable Advice:
${parsed.actionable_advice}

Study Time:
${parsed.study_time_hours} hours this week`;
    } catch (e) {
      feedback = `You scored ${score}%. Review the topics you missed and keep practicing!`;
    }

    res.json({
      message: "Quiz submitted ✅",
      result: {
        _id: quizResult._id,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken,
        subject,
        topic,
      },
      subjectScores,
      feedback,
      updatedStats: user.stats,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/history ────────────────────────────────────────────────────
// Get user's quiz history
router.get("/history", protect, async (req, res) => {
  try {
    const { limit = 20, subject } = req.query;
    const filter = { user: req.user._id };
    if (subject) filter.subject = subject;

    const results = await QuizResult.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("-questions");

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/history/:id ────────────────────────────────────────────────
// Get detailed single quiz result
router.get("/history/:id", protect, async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found ❌" });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/quiz/weak-topics ────────────────────────────────────────────────
// Identify weak topics based on quiz history
router.get("/weak-topics", protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id });

    if (results.length === 0) {
      return res.json({ weakTopics: [] });
    }

    // Aggregate topic-level accuracy
    const topicMap = {};
    results.forEach((result) => {
      result.questions.forEach((q) => {
        const key = `${q.topic || result.topic}||${result.subject}`;
        if (!topicMap[key]) {
          topicMap[key] = { correct: 0, total: 0, subject: result.subject };
        }
        topicMap[key].total += 1;
        if (q.isCorrect) topicMap[key].correct += 1;
      });
    });

    const weakTopics = Object.entries(topicMap)
      .map(([key, val]) => ({
        topic: key.split("||")[0],
        subject: val.subject,
        accuracy: Math.round((val.correct / val.total) * 100),
        attempted: val.total,
      }))
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    res.json({ weakTopics });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
