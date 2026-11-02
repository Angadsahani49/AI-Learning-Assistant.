import React, { useState } from "react";
import { Button } from "./Button";
import { Message, Flashcard } from "../types";
import { fetchFlashcards } from "../api";

interface FlashcardsScreenProps {
  topic: string;
  messages: Message[];
  onGoQuiz?: () => void;
}

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({
  topic,
  messages,
  onGoQuiz,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "active">("idle");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function generateCards() {
    if (!topic) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchFlashcards(topic, messages);
      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error("No flashcards received.");
      }
      setCards(data.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownCards(new Set());
      setStatus("active");
    } catch (err: any) {
      setError(err.message || "Failed to generate flashcards.");
      setStatus("idle");
    }
  }

  function toggleFlip() {
    setIsFlipped((prev) => !prev);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  }

  function handleMarkKnown() {
    setKnownCards((prev) => new Set([...prev, currentIndex]));
    handleNext();
  }

  const currentCard = cards[currentIndex];
  const knownCount = knownCards.size;

  if (status === "idle" || status === "loading") {
    return (
      <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "var(--accent-bg)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            border: "1px solid var(--accent-border)",
          }}
        >
          <i
            className="ti ti-cards"
            style={{ fontSize: "28px", color: "var(--accent)" }}
          />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px" }}>
          {topic ? `Flashcards: ${topic}` : "Choose a topic first"}
        </h2>

        <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "14px" }}>
          {topic
            ? "5 AI-generated flashcards based on your learning session."
            : "Start a chat session first, then generate flashcards here."}
        </p>

        {error && (
          <div
            style={{
              padding: "16px 20px",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-lg)",
              color: "var(--danger)",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "20px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              <i className="ti ti-shield-lock" style={{ fontSize: "18px" }} />
              <span>
                {error.includes("Settings > Secrets") ? "Gemini API Key Required" : "Flashcard Generation Error"}
              </span>
            </div>
            <p style={{ margin: 0 }}>{error}</p>
            {error.includes("Settings > Secrets") && (
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
                💡 To generate flashcards, open <strong>Settings &gt; Secrets</strong> in the toolbar and select or add your Gemini API key.
              </div>
            )}
          </div>
        )}

        {topic && (
          <Button onClick={generateCards} disabled={status === "loading"} size="lg">
            {status === "loading" ? (
              <>
                <i className="ti ti-loader-2 ti-spin" />
                <span>Generating flashcards…</span>
              </>
            ) : (
              <>
                <i className="ti ti-player-play" />
                <span>Generate flashcards</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  const isCurrentKnown = knownCards.has(currentIndex);

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
            {topic}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {knownCount} of {cards.length} marked as known
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={generateCards}>
          <i className="ti ti-refresh" />
          <span>Regenerate</span>
        </Button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", justifyContent: "center" }}>
        {cards.map((_, idx) => (
          <div
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            style={{
              width: idx === currentIndex ? "20px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: knownCards.has(idx)
                ? "var(--success)"
                : idx === currentIndex
                ? "var(--accent)"
                : "var(--border-strong)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>

      <div
        onClick={toggleFlip}
        style={{
          background: "var(--surface)",
          border: `1px solid ${isCurrentKnown ? "var(--success-border)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "40px 32px",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          boxShadow: "var(--shadow-md)",
          transition: "border-color 0.2s",
          position: "relative",
          userSelect: "none",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "16px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: isFlipped ? "var(--success)" : "var(--text-muted)",
          }}
        >
          {isFlipped ? "Answer" : "Question"}
        </div>

        <p
          style={{
            fontSize: isFlipped ? "15px" : "17px",
            fontWeight: isFlipped ? 400 : 500,
            lineHeight: 1.5,
            color: "var(--text-primary)",
          }}
        >
          {isFlipped ? currentCard.back : currentCard.front}
        </p>

        <p style={{ position: "absolute", bottom: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
          {isFlipped ? "Tap to flip back" : "Tap to reveal answer"}
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <Button variant="secondary" size="sm" onClick={handlePrev}>
          <i className="ti ti-arrow-left" />
          <span>Previous</span>
        </Button>

        {isFlipped && !isCurrentKnown && (
          <Button
            size="sm"
            onClick={handleMarkKnown}
            style={{
              background: "var(--success-bg)",
              color: "var(--success)",
              border: "1px solid var(--success-border)",
            }}
          >
            <i className="ti ti-check" />
            <span>Got it</span>
          </Button>
        )}

        <Button variant="secondary" size="sm" onClick={handleNext}>
          <span>Next</span>
          <i className="ti ti-arrow-right" />
        </Button>
      </div>

      {knownCount === cards.length && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: "var(--radius)",
            textAlign: "center",
            color: "var(--success)",
            fontSize: "14px",
          }}
        >
          <strong>You know all {cards.length} cards!</strong>
          {onGoQuiz ? (
            <div style={{ marginTop: "8px" }}>
              <Button size="sm" onClick={onGoQuiz}>
                <i className="ti ti-circle-check" />
                <span>Take a quiz to lock it in</span>
              </Button>
            </div>
          ) : (
            " Take a quiz to lock it in."
          )}
        </div>
      )}
    </div>
  );
};
