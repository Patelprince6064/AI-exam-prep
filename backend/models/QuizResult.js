const mongoose = require("mongoose");

const questionResultSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  subject: String,
  topic: String,
});

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: "",
    },
    questions: [questionResultSchema],
    score: {
      type: Number,
      required: true,
    }, // 0–100
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      default: 0,
    }, // seconds
    mode: {
      type: String,
      enum: ["practice", "mock", "ai-generated"],
      default: "practice",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
