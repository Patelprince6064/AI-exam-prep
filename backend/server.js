const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("AI Exam Prep Backend Running 🚀");
});

/* REGISTER */
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  console.log("REGISTER:", name, email, password);

  res.json({
    message: "User registered successfully ✅"
  });
});

/* LOGIN */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN:", email, password);

  if (email && password) {
    res.json({
      message: "Login successful ✅"
    });
  } else {
    res.status(400).json({
      message: "Invalid credentials ❌"
    });
  }
});

/* AI CHAT */
app.post("/chat", async (req, res) => {
  try {

    const { message } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are an AI tutor that helps students prepare for exams."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "AI service error ❌"
    });
  }
});

/* SERVER PORT (IMPORTANT FOR RENDER) */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});