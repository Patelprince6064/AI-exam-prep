const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required ❌" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters ❌" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered ❌" });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subjects: user.subjects,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required ❌" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // Update streak
    const today = new Date();
    const last = user.stats.lastStudied;
    if (last) {
      const diff =
        (today.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24);
      if (diff === 1) {
        user.stats.streak += 1;
      } else if (diff > 1) {
        user.stats.streak = 1;
      }
    } else {
      user.stats.streak = 1;
    }
    user.stats.lastStudied = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subjects: user.subjects,
        stats: user.stats,
        studyGoalHours: user.studyGoalHours,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", protect, (req, res) => {
  res.json({ message: "Logged out successfully ✅" });
});

module.exports = router;
