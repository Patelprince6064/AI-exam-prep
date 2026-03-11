import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Home from "./home/home";

import AIPractice from "./AIPractice";
import Subjects from "./Subjects";
import Analytics from "./Analytics";
import Settings from "./Settings";

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/practice" element={<AIPractice />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />

      <Route path="/" element={<Home />} />

    </Routes>
  );
}

export default App;