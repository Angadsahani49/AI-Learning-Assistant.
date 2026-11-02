import React, { useState } from "react";
import { Button } from "./Button";
import { QuizQuestion } from "../types";
import { fetchQuiz } from "../api";

interface QuizScreenProps {
  topic: string;
  onScoreUpdate: (score: number) => void;
  onGoFlashcards?: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  topic,
  onScoreUpdate,
  onGoFlashcards,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "done">("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function startQuiz() {
    if (!topic) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchQuiz(topic);
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions received.");
      }
      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedOption(null);
      setCorrectCount(0);
      setStatus("active");
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz.");
      setStatus("idle");
    }
  }

  function handleSelectOption(idx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentIndex].correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  }

  function handleNext() {
    const isLast = currentIndex + 1 >= questions.length;
    if (isLast) {
      const totalCorrect = correctCount + (selectedOption === questions[currentIndex].correctIndex ? 0 : 0);
      const finalScore = Math.round((correctCount / questions.length) * 100);
      onScoreUpdate(finalScore);
      setStatus("done");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  }

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length
    ? Math.round((currentIndex / questions.length) * 100)
    : 0;
  const scorePercent = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  if (status === "idle" || status === "loading") {
    return (
      <div style={{ maxWidth: "560px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
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
            className="ti ti-circle-check"
            style={{ fontSize: "28px", color: "var(--accent)" }}
          />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px" }}>
          {topic ? `Quiz: ${topic}` : "Choose a topic first"}
        </h2>

        <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "14px" }}>
          {topic
            ? "4 AI-generated questions tailored to what you've been learning."
            : "Start a learning session from the home screen, then come back to test yourself."}
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
                {error.includes("Settings > Secrets") ? "Gemini API Key Required" : "Quiz Generation Error"}
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
                💡 To generate quizzes, open <strong>Settings &gt; Secrets</strong> in the toolbar and select or add your Gemini API key.
              </div>
            )}
          </div>
        )}

        {topic && (
          <Button onClick={startQuiz} disabled={status === "loading"} size="lg">
            {status === "loading" ? (
              <>
                <i className="ti ti-loader-2 ti-spin" />
                <span>Generating quiz…</span>
              </>
            ) : (
              <>
                <i className="ti ti-player-play" />
                <span>Start quiz</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: "52px", marginBottom: "8px" }}>
          {scorePercent >= 80 ? "🎉" : scorePercent >= 50 ? "👍" : "📚"}
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "4px" }}>
          {scorePercent >= 80 ? "Excellent!" : scorePercent >= 50 ? "Good effort!" : "Keep learning!"}
        </h2>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 600,
            color: "var(--accent)",
            margin: "16px 0 4px",
          }}
        >
          {scorePercent}%
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "14px" }}>
          {correctCount} of {questions.length} correct on <strong>{topic}</strong>
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button variant="secondary" onClick={startQuiz}>
            <i className="ti ti-refresh" />
            <span>Try again</span>
          </Button>
          {onGoFlashcards && (
            <Button onClick={onGoFlashcards}>
              <i className="ti ti-cards" />
              <span>View flashcards</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQ.correctIndex;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {topic}
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div
        style={{
          height: "4px",
          background: "var(--surface-alt)",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "var(--accent)",
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: 500, marginBottom: "20px", lineHeight: 1.5 }}>
          {currentQ.question}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentQ.options.map((optText, optIdx) => {
            let bg = "var(--surface-alt)";
            let border = "var(--border)";
            let color = "var(--text-primary)";

            if (isAnswered) {
              if (optIdx === currentQ.correctIndex) {
                bg = "var(--success-bg)";
                border = "var(--success-border)";
                color = "var(--success)";
              } else if (optIdx === selectedOption) {
                bg = "var(--danger-bg)";
                border = "var(--danger-border)";
                color = "var(--danger)";
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isAnswered}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${border}`,
                  background: bg,
                  color,
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: isAnswered ? "default" : "pointer",
                  transition: "all 0.15s",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `1px solid ${border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    flexShrink: 0,
                    background: "var(--surface)",
                  }}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span style={{ flex: 1 }}>{optText}</span>
                {isAnswered && optIdx === currentQ.correctIndex && (
                  <i className="ti ti-check" style={{ marginLeft: "auto", fontSize: "16px" }} />
                )}
                {isAnswered && optIdx === selectedOption && optIdx !== currentQ.correctIndex && (
                  <i className="ti ti-x" style={{ marginLeft: "auto", fontSize: "16px" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius)",
              border: `1px solid ${isCorrect ? "var(--success-border)" : "var(--danger-border)"}`,
              background: isCorrect ? "var(--success-bg)" : "var(--danger-bg)",
              color: isCorrect ? "var(--success)" : "var(--danger)",
              fontSize: "13px",
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            <strong>{isCorrect ? "Correct!" : "Not quite."}</strong> {currentQ.explanation}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleNext}>
              <span>{currentIndex + 1 >= questions.length ? "See results" : "Next question"}</span>
              <i className="ti ti-arrow-right" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
