import React, { useState } from "react";
import "./AIPractice.css";

function AIPractice() {

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    try {

      const response = await fetch(
        "https://ai-exam-prep-7y1e.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: input
          })
        }
      );

      const data = await response.json();

      const aiMessage = {
        sender: "ai",
        text: data.reply
      };

      setMessages(prev => [...prev, aiMessage]);
      setInput("");

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Server error. Try again."
        }
      ]);

      console.error(error);
    }
  };

  return (
    <div className="app-layout">
      <div className="main-panel">

        <div className="header">
          <h1>AI ChatBot</h1>
          <p>Generate AI questions and practice exams.</p>
        </div>

        <div className="chatbox">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
          />
          <button onClick={sendMessage}>Generate</button>
        </div>

      </div>
    </div>
  );
}

export default AIPractice;