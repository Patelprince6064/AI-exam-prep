const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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


app.listen(5000, () => {
  console.log("Server running on port 5000");
});