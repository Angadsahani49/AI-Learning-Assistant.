import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { DeepDiveData, DepthLevel } from "../types";
import { fetchDeepDive } from "../api";

interface DeepDiveScreenProps {
  topic: string;
  onSelectTopic: (topic: string) => void;
  onGoChat: () => void;
  onGoQuiz: () => void;
  onGoFlashcards: () => void;
}

const DEPTH_LEVELS: { id: DepthLevel; label: string; icon: string; desc: string }[] = [
  { id: "Intuitive", label: "Intuitive", icon: "ti-bulb", desc: "Mental models, analogies & visceral grasp" },
  { id: "Comprehensive", label: "Comprehensive", icon: "ti-book", desc: "Full step-by-step first principles breakdown" },
  { id: "Advanced", label: "Advanced", icon: "ti-microscope", desc: "Technical nuances, mathematics & edge cases" },
  { id: "Feynman", label: "Feynman", icon: "ti-sparkles", desc: "Jargon-free first principles like explaining to a beginner" },
];

export const DeepDiveScreen: React.FC<DeepDiveScreenProps> = ({
  topic,
  onSelectTopic,
  onGoChat,
  onGoQuiz,
  onGoFlashcards,
}) => {
  const [depthLevel, setDepthLevel] = useState<DepthLevel>("Comprehensive");
  const [data, setData] = useState<DeepDiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  useEffect(() => {
    if (topic) {
      loadDeepDive(topic, depthLevel);
    }
  }, [topic, depthLevel]);

  async function loadDeepDive(t: string, level: DepthLevel) {
    setLoading(true);
    setError(null);
    setShowHint(false);
    setShowAnswer(false);
    try {
      const res = await fetchDeepDive(t, level);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate deep dive explanation.");
    } finally {
      setLoading(false);
    }
  }

  function handleCustomSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const t = customTopic.trim();
    if (t) {
      onSelectTopic(t);
      setCustomTopic("");
    }
  }

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Top Header & Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--accent-bg)", padding: "2px 8px", borderRadius: "100px", border: "1px solid var(--accent-border)" }}>
                Deep Explainer
              </span>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 600, color: "var(--text-primary)" }}>
              {topic ? `Deep Dive: ${topic}` : "Explore Any Topic in Depth"}
            </h1>
          </div>

          <form onSubmit={handleCustomSearch} style={{ display: "flex", gap: "8px", minWidth: "260px" }}>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Deep dive into another topic…"
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <Button type="submit" size="sm" disabled={!customTopic.trim()}>
              <i className="ti ti-search" />
            </Button>
          </form>
        </div>

        {/* Depth Level Selector */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {DEPTH_LEVELS.map((level) => {
            const isSelected = depthLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setDepthLevel(level.id)}
                disabled={loading}
                title={level.desc}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "var(--accent-bg)" : "var(--surface)",
                  color: isSelected ? "var(--accent-text)" : "var(--text-secondary)",
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: "13px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <i className={`ti ${level.icon}`} style={{ fontSize: "15px" }} />
                <span>{level.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <i className="ti ti-loader-2 ti-spin" style={{ fontSize: "24px", color: "var(--accent)" }} />
          </div>
          <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
            Constructing {depthLevel} explanation for <strong>{topic}</strong>…
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Synthesizing mental models, first principles, and counter-intuitive nuances.
          </p>
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            padding: "18px 22px",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            borderRadius: "var(--radius-lg)",
            color: "var(--danger)",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "15px" }}>
            <i className="ti ti-shield-lock" style={{ fontSize: "18px" }} />
            <span>
              {error.includes("Settings > Secrets") ? "Gemini API Key Required" : "Deep Dive Error"}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>{error}</p>
          {error.includes("Settings > Secrets") ? (
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                background: "var(--surface)",
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              💡 To enable Deep Dives, open <strong>Settings &gt; Secrets</strong> in the top-right toolbar and select or add your Gemini API key.
            </div>
          ) : (
            <div style={{ marginTop: "4px" }}>
              <Button size="sm" variant="secondary" onClick={() => loadDeepDive(topic, depthLevel)}>
                <i className="ti ti-refresh" /> Try again
              </Button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Executive Overview */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <i className="ti ti-compass" style={{ fontSize: "20px", color: "var(--accent)" }} />
              <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Executive Overview</h2>
            </div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--text-primary)" }}>
              {data.overview}
            </p>
          </section>

          {/* Mental Model & Analogy */}
          {data.mentalModel && (
            <section style={{ background: "linear-gradient(135deg, var(--accent-bg), var(--surface))", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", padding: "24px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <i className="ti ti-bulb" style={{ fontSize: "20px", color: "var(--accent)" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Intuitive Mental Model
                </span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>
                {data.mentalModel.title}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: "14px" }}>
                {data.mentalModel.description}
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--surface)", padding: "6px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-strong)", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                <i className="ti ti-key" style={{ color: "var(--accent)", fontSize: "14px" }} />
                <span><strong>Core Takeaway:</strong> {data.mentalModel.keyTakeaway}</span>
              </div>
            </section>
          )}

          {/* First Principles Breakdown */}
          {data.firstPrinciples && data.firstPrinciples.length > 0 && (
            <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <i className="ti ti-stairs" style={{ fontSize: "20px", color: "var(--accent)" }} />
                <h2 style={{ fontSize: "16px", fontWeight: 600 }}>First-Principles Breakdown</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {data.firstPrinciples.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent-text)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flexShrink: 0, marginTop: "2px" }}>
                      {item.step || idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>
                        {item.principle}
                      </h4>
                      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Common Misconceptions */}
          {data.misconceptions && data.misconceptions.length > 0 && (
            <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "20px", color: "var(--warning)" }} />
                <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Common Misconceptions vs. Reality</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.misconceptions.map((item, idx) => (
                  <div key={idx} style={{ padding: "14px 16px", borderRadius: "var(--radius)", background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger)", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      <i className="ti ti-x" style={{ fontSize: "15px" }} />
                      <span>Myth: &ldquo;{item.myth}&rdquo;</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.5, paddingLeft: "2px" }}>
                      <i className="ti ti-check" style={{ color: "var(--success)", fontSize: "15px", marginTop: "2px" }} />
                      <span><strong>Reality:</strong> {item.reality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technical Nuances & How It Works */}
          {data.technicalNuances && data.technicalNuances.length > 0 && (
            <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <i className="ti ti-cpu" style={{ fontSize: "20px", color: "var(--accent)" }} />
                <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Deep Mechanics & Nuances</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {data.technicalNuances.map((item, idx) => (
                  <div key={idx} style={{ padding: "14px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg)" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-text)", marginBottom: "6px" }}>
                      {item.aspect}
                    </h4>
                    <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--text-secondary)" }}>
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Self-Test Conceptual Question */}
          {data.selfTestQuestion && (
            <section style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <i className="ti ti-help-circle" style={{ fontSize: "20px", color: "var(--accent)" }} />
                <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Test Your Deep Understanding</h2>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "14px" }}>
                {data.selfTestQuestion.question}
              </p>

              {showHint && data.selfTestQuestion.hint && (
                <div style={{ padding: "10px 14px", background: "var(--warning-bg)", border: "1px solid #fbd38d", borderRadius: "var(--radius)", fontSize: "13px", color: "var(--warning)", marginBottom: "12px" }}>
                  <strong>Hint:</strong> {data.selfTestQuestion.hint}
                </div>
              )}

              {showAnswer && (
                <div style={{ padding: "14px", background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: "var(--radius)", fontSize: "13px", lineHeight: 1.6, color: "var(--success)", marginBottom: "14px" }}>
                  <strong>Deep Explanation:</strong> {data.selfTestQuestion.answer}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                {!showHint && data.selfTestQuestion.hint && (
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>
                    <i className="ti ti-bulb" /> Need a hint?
                  </Button>
                )}
                <Button variant={showAnswer ? "ghost" : "primary"} size="sm" onClick={() => setShowAnswer(!showAnswer)}>
                  <i className={`ti ${showAnswer ? "ti-eye-off" : "ti-eye"}`} />
                  {showAnswer ? "Hide Explanation" : "Reveal Deep Explanation"}
                </Button>
              </div>
            </section>
          )}

          {/* Connected Concepts to Explore Next */}
          {data.connectedConcepts && data.connectedConcepts.length > 0 && (
            <section style={{ padding: "16px 20px", background: "var(--surface-alt)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Connected Topics to Explore Next
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.connectedConcepts.map((concept, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTopic(concept)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "100px",
                      border: "1px solid var(--border-strong)",
                      background: "var(--surface)",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-border)";
                      e.currentTarget.style.color = "var(--accent-text)";
                      e.currentTarget.style.background = "var(--accent-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-strong)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "var(--surface)";
                    }}
                  >
                    <i className="ti ti-arrow-right" style={{ fontSize: "12px" }} />
                    <span>{concept}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions Footer */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={onGoChat}>
              <i className="ti ti-message" /> Ask Questions in Chat
            </Button>
            <Button variant="secondary" onClick={onGoQuiz}>
              <i className="ti ti-circle-check" /> Quiz on this
            </Button>
            <Button variant="secondary" onClick={onGoFlashcards}>
              <i className="ti ti-cards" /> Flashcards
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
