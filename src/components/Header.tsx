import React from "react";
import { Screen } from "../types";

interface HeaderProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  topic: string;
}

const NAV_ITEMS: { id: Screen; icon: string; label: string }[] = [
  { id: "home", icon: "ti-home", label: "Home" },
  { id: "chat", icon: "ti-message", label: "Chat" },
  { id: "deep-dive", icon: "ti-zoom-in", label: "Deep Dive" },
  { id: "quiz", icon: "ti-circle-check", label: "Quiz" },
  { id: "flashcards", icon: "ti-cards", label: "Flashcards" },
];

export const Header: React.FC<HeaderProps> = ({ screen, setScreen, topic }) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 20px",
        height: "56px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 600,
          fontSize: "15px",
          color: "var(--text-primary)",
          marginRight: "8px",
          cursor: "pointer",
        }}
        onClick={() => setScreen("home")}
      >
        <i
          className="ti ti-brain"
          style={{ fontSize: "20px", color: "var(--accent)" }}
        />
        <span>LearnAI</span>
      </div>

      {topic && (
        <div
          style={{
            padding: "3px 10px",
            background: "var(--accent-bg)",
            color: "var(--accent-text)",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: 500,
            border: "1px solid var(--accent-border)",
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
          title={topic}
        >
          <i className="ti ti-book-open" style={{ marginRight: 4, fontSize: "13px" }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{topic}</span>
        </div>
      )}

      <nav style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "var(--radius)",
                border: "none",
                background: isActive ? "var(--accent-bg)" : "transparent",
                color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                fontWeight: isActive ? 500 : 400,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: "16px" }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
