const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const QuizResult = require("../models/QuizResult");

// Predefined CS subjects and topics
const SUBJECTS = {
  DSA: {
    name: "Data Structures & Algorithms",
    icon: "🧩",
    topics: [
      "Arrays", "Linked Lists", "Stacks", "Queues",
      "Trees", "Binary Search Tree", "Graphs", "Hashing",
      "Sorting Algorithms", "Searching Algorithms", "Dynamic Programming",
      "Greedy Algorithms", "Recursion", "Heaps", "Tries",
    ],
  },
  OS: {
    name: "Operating Systems",
    icon: "💻",
    topics: [
      "Process Management", "Threads", "CPU Scheduling", "Deadlock",
      "Memory Management", "Virtual Memory", "Paging", "Segmentation",
      "File Systems", "I/O Management", "Semaphores", "Mutex",
      "Inter-process Communication", "Disk Scheduling",
    ],
  },
  DBMS: {
    name: "Database Management Systems",
    icon: "🗄️",
    topics: [
      "ER Model", "Relational Model", "SQL", "Joins",
      "Normalization", "Transactions", "ACID Properties", "Concurrency Control",
      "Indexing", "B-Trees", "Query Optimization", "NoSQL",
      "Stored Procedures", "Triggers",
    ],
  },
  CN: {
    name: "Computer Networks",
    icon: "🌐",
    topics: [
      "OSI Model", "TCP/IP", "HTTP/HTTPS", "DNS",
      "IP Addressing", "Subnetting", "Routing Protocols", "Switching",
      "TCP vs UDP", "Network Security", "Firewalls", "VPN",
      "Wireless Networks", "Socket Programming",
    ],
  },
  AI: {
    name: "Artificial Intelligence",
    icon: "🤖",
    topics: [
      "Search Algorithms", "BFS & DFS", "A* Algorithm", "Heuristics",
      "Machine Learning Basics", "Neural Networks", "Decision Trees",
      "Naive Bayes", "Clustering", "Regression", "NLP Basics",
      "Reinforcement Learning", "Expert Systems", "Knowledge Representation",
    ],
  },
};

// ─── GET /api/subjects ────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get quiz counts per subject for this user
    const quizCounts = await QuizResult.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$subject", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    ]);

    const countMap = {};
    quizCounts.forEach((q) => {
      countMap[q._id] = {
        quizzesTaken: q.count,
        avgScore: Math.round(q.avgScore),
      };
    });

    const subjects = Object.entries(SUBJECTS).map(([key, val]) => ({
      code: key,
      name: val.name,
      icon: val.icon,
      topics: val.topics,
      isEnrolled: user.subjects.includes(key),
      ...(countMap[key] || { quizzesTaken: 0, avgScore: 0 }),
    }));

    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── GET /api/subjects/:code/topics ──────────────────────────────────────────
router.get("/:code/topics", protect, (req, res) => {
  const subject = SUBJECTS[req.params.code.toUpperCase()];
  if (!subject) {
    return res.status(404).json({ message: "Subject not found ❌" });
  }
  res.json({ subject: req.params.code.toUpperCase(), topics: subject.topics });
});

// ─── PUT /api/subjects/enroll ─────────────────────────────────────────────────
// Update user's enrolled subjects
router.put("/enroll", protect, async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: "Subjects must be an array ❌" });
    }

    const validSubjects = subjects.filter((s) => SUBJECTS[s.toUpperCase()]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subjects: validSubjects.map((s) => s.toUpperCase()) },
      { new: true }
    );

    res.json({
      message: "Subjects updated ✅",
      subjects: user.subjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
