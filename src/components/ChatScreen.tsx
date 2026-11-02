import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./Button";
import { Message } from "../types";
import { streamChat } from "../api";

interface ChatScreenProps {
  topic: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onGoQuiz: () => void;
  onGoDeepDive: () => void;
}

const QUICK_ACTIONS = [
  { label: "Simplify", prompt: "Can you explain that more simply?", icon: "ti-sparkles" },
  { label: "Analogy", prompt: "Give me a real-world analogy for that.", icon: "ti-bulb" },
  { label: "Explain deeper", prompt: "Can you explain the core mechanics deeper from first principles?", icon: "ti-zoom-in" },
  { label: "Key points", prompt: "What are the key takeaways so far?", icon: "ti-list-check" },
  { label: "Example", prompt: "Give me a concrete example of that.", icon: "ti-code-asterisk" },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  topic,
  messages,
  setMessages,
  onGoQuiz,
  onGoDeepDive,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  useEffect(() => {
    if (topic && messages.length === 0) {
      sendMessage([
        {
          role: "user",
          content: `I want to learn about: ${topic}. Give me an engaging introduction and ask me what I already know.`,
        },
      ]);
    }
  }, [topic]);

  async function sendMessage(convo: Message[]) {
    setLoading(true);
    setStreamBuffer("");
    setError(null);
    let fullText = "";

    await streamChat({
      topic,
      messages: convo,
      onChunk: (chunk) => {
        fullText += chunk;
        setStreamBuffer(fullText);
      },
      onDone: () => {
        setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
        setStreamBuffer("");
        setLoading(false);
        inputRef.current?.focus();
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
        setStreamBuffer("");
      },
    });
  }

  function handleSend(promptText?: string) {
    const text = promptText || input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const nextConvo = [...messages, userMsg];
    setMessages(nextConvo);
    sendMessage(nextConvo);
  }

  const displayMessages = streamBuffer
    ? [...messages, { role: "assistant" as const, content: streamBuffer, streaming: true }]
    : messages;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {displayMessages.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "60px" }}>
              <i
                className="ti ti-message-circle"
                style={{ fontSize: "40px", marginBottom: "12px", display: "block" }}
              />
              <p>
                Starting your session on <strong>{topic}</strong>…
              </p>
            </div>
          )}

          {displayMessages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: m.role === "assistant" ? "var(--accent-bg)" : "var(--surface-alt)",
                  border: `1px solid ${m.role === "assistant" ? "var(--accent-border)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${m.role === "assistant" ? "ti-brain" : "ti-user"}`}
                  style={{
                    fontSize: "15px",
                    color: m.role === "assistant" ? "var(--accent-text)" : "var(--text-secondary)",
                  }}
                />
              </div>

              <div
                style={{
                  maxWidth: "72%",
                  padding: "12px 16px",
                  borderRadius:
                    m.role === "assistant" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                  background: m.role === "assistant" ? "var(--surface)" : "var(--accent-bg)",
                  border: `1px solid ${m.role === "assistant" ? "var(--border)" : "var(--accent-border)"}`,
                  color: m.role === "assistant" ? "var(--text-primary)" : "var(--accent-text)",
                  fontSize: "14px",
                  lineHeight: "1.65",
                }}
              >
                {m.role === "assistant" ? (
                  <div className="prose">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
                {m.streaming && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "14px",
                      background: "var(--accent)",
                      borderRadius: "2px",
                      marginLeft: "2px",
                      animation: "blink 0.8s step-end infinite",
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </div>
            </div>
          ))}

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
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                <i className="ti ti-shield-lock" style={{ fontSize: "18px" }} />
                <span>
                  {error.includes("Settings > Secrets") ? "Gemini API Key Required" : "Connection Issue"}
                </span>
              </div>
              <p style={{ margin: 0 }}>{error}</p>
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
                  💡 To activate the AI tutor, open <strong>Settings &gt; Secrets</strong> in the toolbar and select or add your Gemini API key.
                </div>
              ) : (
                <div>
                  <Button size="sm" variant="secondary" onClick={() => sendMessage(messages)}>
                    <i className="ti ti-refresh" /> Try again
                  </Button>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: "6px", padding: "0 20px 8px", flexWrap: "wrap" }}>
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSend(item.prompt)}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "100px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                fontSize: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: "13px" }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "10px 20px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a follow-up question…"
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              background: "var(--bg)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || loading}>
            {loading ? (
              <>
                <i className="ti ti-loader-2 ti-spin" />
                <span>Thinking</span>
              </>
            ) : (
              <>
                <i className="ti ti-send" />
                <span>Send</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        style={{
          width: "200px",
          borderLeft: "1px solid var(--border)",
          padding: "20px 16px",
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            Topic
          </p>
          <p style={{ fontSize: "13px", fontWeight: 500 }}>{topic}</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {messages.filter((m) => m.role === "user").length} questions asked
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Next steps
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={onGoDeepDive}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--accent-border)",
                background: "var(--accent-bg)",
                color: "var(--accent-text)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <i className="ti ti-zoom-in" />
              <span>Deep Dive</span>
            </button>
            <button
              onClick={onGoQuiz}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <i className="ti ti-circle-check" />
              <span>Take a quiz</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <i className="ti ti-lock" style={{ marginRight: 4 }} />
            Your conversation never leaves this device.
          </p>
        </div>
      </div>
    </div>
  );
};
