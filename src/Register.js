import React, { useState } from "react";
import "./Auth.css";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("Registering...");

    try {

      const res = await fetch(
        "https://ai-exam-prep-7yle.onrender.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Registration successful ✅");
      } else {
        setMessage(data.message || "Registration failed ❌");
      }

    } catch (error) {
      console.error("Register error:", error);
      setMessage("Server error ❌");
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">
        <h2>Create Account 🚀</h2>
        <p>Join AI-powered exam prep</p>

        <form onSubmit={handleRegister}>

          <div className="input-group">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Full Name</label>
          </div>

          <div className="input-group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button className="login-btn">Register</button>

        </form>

        <div className="extra">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>

        <h3 className="message">{message}</h3>

      </div>

    </div>
  );
}

export default Register;