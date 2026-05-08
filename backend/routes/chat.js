const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ─── POST /chat ───────────────────────────────────────────────────────────────
// Main AI tutor chat (used by AIPractice.js)
router.post("/", protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please provide a message ❌" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are an expert AI tutor helping students prepare for computer science exams. 
You specialize in: Data Structures & Algorithms (DSA), Operating Systems (OS), 
Database Management Systems (DBMS), Computer Networks (CN), and Artificial Intelligence (AI).

When answering:
- Be clear, concise, and educational
- Use examples when helpful
- If asked to generate questions, format them as numbered MCQs with 4 options (A, B, C, D) and indicate the correct answer
- If explaining concepts, break them down step by step
- Encourage the student`,
          },
          {
            role: "user",
            content: message.trim(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return res.status(502).json({ reply: "AI service error. Try again ❌" });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ reply: "Server error ❌" });
  }
});

// ─── POST /chat/explain ───────────────────────────────────────────────────────
// Explain a specific concept in detail
router.post("/explain", protect, async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required ❌" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content:
              "You are an expert CS tutor. Explain concepts in a structured, easy-to-understand way for exam preparation.",
          },
          {
            role: "user",
            content: `Explain the topic: "${topic}" ${subject ? `from the subject ${subject}` : ""}. 
Include: definition, key points, real-world example, and common exam question on this topic.`,
          },
        ],
      }),
    });

    const data = await response.json();
    res.json({ explanation: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /chat/study-plan ────────────────────────────────────────────────────
// Generate a personalized study plan
router.post("/study-plan", protect, async (req, res) => {
  try {
    const user = req.user;
    const { examDate, weakTopics } = req.body;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content:
              "You are an AI study planner. Create detailed, realistic study plans for CS students.",
          },
          {
            role: "user",
            content: `Create a study plan for a student with these details:
- Subjects: ${user.subjects?.join(", ") || "DSA, OS, DBMS, CN, AI"}
- Daily study goal: ${user.studyGoalHours || 5} hours
- Exam date: ${examDate || "in 2 weeks"}
- Weak topics: ${weakTopics?.join(", ") || "not specified"}
- Current accuracy: ${user.stats?.totalQuestions > 0 ? Math.round((user.stats.totalCorrect / user.stats.totalQuestions) * 100) : 0}%

Provide a day-by-day study plan with topics and time allocation.`,
          },
        ],
      }),
    });

    const data = await response.json();
    res.json({ studyPlan: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
