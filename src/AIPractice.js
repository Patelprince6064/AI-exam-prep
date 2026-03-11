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

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Ask any questions."
            },
            {
              role: "user",
              content: input
            }
          ]
        })
      });

      const data = await response.json();

      if (!data.choices) {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: "API error: " + JSON.stringify(data)
        }]);
        return;
      }

      const aiMessage = {
        sender: "ai",
        text: data.choices[0].message.content
      };

      setMessages(prev => [...prev, aiMessage]);
      setInput("");

    } catch (error) {

      setMessages(prev => [...prev, {
        sender: "ai",
        text: "Request failed. Check API key."
      }]);

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
        onChange={(e)=>setInput(e.target.value)}
        placeholder="Ask anything"
      />
      <button onClick={sendMessage}>Generate</button>
    </div>

  </div>

</div>
  );
}

export default AIPractice;