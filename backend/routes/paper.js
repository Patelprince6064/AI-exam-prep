const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

router.post("/analyze", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const { subject, mode } = req.body;
    const mimeType = req.file.mimetype;
    let extractedText = "";
    
    // Read the file and parse text
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.startsWith("image/")) {
      const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
      extractedText = text;
    } else {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Unsupported file type. Please upload a PDF or an Image." });
    }

    // Delete the file after extraction
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (!extractedText || extractedText.trim() === "") {
      return res.status(400).json({ message: "No readable text found in PDF. If this is a scanned image or screenshot, please use a text-based PDF." });
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "solve") {
      systemPrompt = `You are an AI Exam Solver. You extract all the questions from the given university paper and provide detailed, accurate answers.
Return ONLY valid JSON in this exact format:
{
  "subject": "Detected Subject",
  "qaList": [
    { "question": "Question text from paper", "answer": "Detailed AI generated answer" }
  ]
}`;
      userPrompt = `Subject Context: ${subject || "Unknown"}
Extract all questions from this exam paper and answer them thoroughly.
Text to analyze:
${extractedText.substring(0, 15000)}`;
    } else {
      systemPrompt = `You are an AI Exam Paper Analyzer. You extract the most frequently asked topics/questions from university papers.
Return ONLY valid JSON in this exact format:
{
  "subject": "Detected Subject",
  "topics": [
    { "name": "Topic Name", "count": 8, "subTopics": ["sub 1", "sub 2"] }
  ]
}`;
      userPrompt = `Subject Context: ${subject || "Unknown"}
Analyze the following exam paper text and extract the most frequently asked or highest-weight topics. Estimate 'count' as the number of times it appears or its importance scale (e.g., 5-10).
Text to analyze:
${extractedText.substring(0, 15000)}`;
    }

    // Call Groq AI
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 3000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      }
    );

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    res.json({
      message: "Analysis complete ✅",
      result
    });

  } catch (error) {
    console.error("Paper analysis error:", error);
    res.status(500).json({ message: "Failed to analyze paper ❌", error: error.toString() });
  }
});

module.exports = router;
