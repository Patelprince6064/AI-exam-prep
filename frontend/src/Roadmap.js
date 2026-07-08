import React, { useState } from "react";
import { SharedSidebar } from "./SharedLayout";
import { apiGenerateRoadmap } from "./api";
import "./Roadmap.css";

function Roadmap() {
  const [skill, setSkill] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!skill.trim()) return;

    setLoading(true);
    setError(null);
    setRoadmap([]);

    try {
      const res = await apiGenerateRoadmap(skill);
      if (res.roadmap) {
        setRoadmap(res.roadmap);
      } else {
        setError(res.message || "Failed to generate roadmap.");
      }
    } catch (err) {
      setError("An error occurred while generating the roadmap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="roadmap-page">
      <SharedSidebar />
      <main className="roadmap-main">
        <header className="roadmap-header">
          <div>
            <h1 className="welcome-text">Skill Roadmap Generator</h1>
            <p className="subtitle">Enter a skill you want to learn to get a step-by-step learning path.</p>
          </div>
        </header>

        <section className="roadmap-input-section">
          <form className="roadmap-form" onSubmit={handleGenerate}>
            <input
              type="text"
              placeholder="e.g., React, Python, Machine Learning..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="roadmap-input"
            />
            <button type="submit" className="roadmap-submit-btn" disabled={loading || !skill.trim()}>
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </form>
          {error && <p className="roadmap-error">{error}</p>}
        </section>

        {loading && (
          <div className="roadmap-loading">
            <div className="roadmap-spinner"></div>
            <p>Crafting your personalized roadmap...</p>
          </div>
        )}

        {!loading && roadmap.length > 0 && (
          <section className="roadmap-display-section">
            <h2 className="roadmap-title">Roadmap for "{skill}"</h2>
            <div className="timeline">
              {roadmap.map((stepData, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">{stepData.step || index + 1}</div>
                  <div className="timeline-content">
                    <h3 className="timeline-step-title">{stepData.title}</h3>
                    <p className="timeline-step-desc">{stepData.description}</p>
                    {stepData.topics && stepData.topics.length > 0 && (
                      <div className="timeline-topics">
                        {stepData.topics.map((topic, i) => (
                          <span key={i} className="topic-badge">{topic}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Roadmap;
