import React, { useState } from "react";
import { Button } from "./Button";
import { HistoryItem } from "../types";

interface HomeScreenProps {
  history: HistoryItem[];
  onStart: (topic: string) => void;
  onContinue: (topic: string) => void;
  onDeepDive?: (topic: string) => void;
}

const SUGGESTIONS = [
  { label: "Black holes", icon: "ti-planet" },
  { label: "Machine learning", icon: "ti-cpu" },
  { label: "World War II", icon: "ti-world" },
  { label: "Python basics", icon: "ti-code" },
  { label: "Human psychology", icon: "ti-brain" },
  { label: "Climate change", icon: "ti-leaf" },
  { label: "Quantum physics", icon: "ti-atom" },
  { label: "Roman Empire", icon: "ti-building" },
];

function formatRelativeTime(ts: number): string {
  const diffMinutes = Math.round((Date.now() - ts) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  history,
  onStart,
  onContinue,
  onDeepDive,
}) => {
  const [topicInput, setTopicInput] = useState("");

  const handleStart = (t?: string) => {
    const target = (t || topicInput).trim();
    if (target) {
      onStart(target);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "var(--accent-bg)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            border: "1px solid var(--accent-border)",
          }}
        >
          <i
            className="ti ti-brain"
            style={{ fontSize: "28px", color: "var(--accent)" }}
          />
        </div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            marginBottom: "8px",
            letterSpacing: "-0.3px",
          }}
        >
          What do you want to learn today?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Ask anything — conversational AI tutoring, quizzes, and flashcards.
          <br />
          No signup. Your progress stays in this browser.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg)",
          padding: "6px 6px 6px 16px",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "16px",
        }}
      >
        <i
          className="ti ti-search"
          style={{ fontSize: "18px", color: "var(--text-muted)", alignSelf: "center" }}
        />
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="e.g. How does photosynthesis work?"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "15px",
            color: "var(--text-primary)",
            padding: "4px 0",
          }}
          autoFocus
        />
        <Button onClick={() => handleStart()} disabled={!topicInput.trim()}>
          Start learning
        </Button>
        {onDeepDive && (
          <Button
            variant="ghost"
            onClick={() => {
              const target = topicInput.trim();
              if (target) onDeepDive(target);
            }}
            disabled={!topicInput.trim()}
          >
            <i className="ti ti-zoom-in" />
            <span>Deep Dive</span>
          </Button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "48px",
        }}
      >
        {SUGGESTIONS.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => handleStart(label)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "100px",
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              fontSize: "13px",
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
            <i className={`ti ${icon}`} style={{ fontSize: "14px" }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            Continue learning
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "10px",
            }}
          >
            {history.map((item) => (
              <div
                key={item.topic}
                onClick={() => onContinue(item.topic)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-border)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: "13px",
                    marginBottom: "4px",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.topic}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {formatRelativeTime(item.ts)}
                </div>
                {item.score !== null && (
                  <div
                    style={{
                      marginTop: "6px",
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      fontSize: "11px",
                      background: "var(--success-bg)",
                      color: "var(--success)",
                      border: "1px solid var(--success-border)",
                    }}
                  >
                    Quiz: {item.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
