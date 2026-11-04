import {
  Message,
  QuizResponse,
  FlashcardResponse,
  SummaryData,
  DeepDiveData,
  DepthLevel,
} from "./types";
import {
  synthesizeFallbackChat,
  synthesizeFallbackQuiz,
  synthesizeFallbackFlashcards,
  synthesizeFallbackDeepDive,
} from "./clientTutor";

const API_BASE = "/api";

export function cleanErrorMessage(raw: string): string {
  if (!raw) return "An unexpected error occurred.";
  let msg = String(raw);
  try {
    const parsed = typeof msg === "string" && msg.trim().startsWith("{") ? JSON.parse(msg) : null;
    if (parsed?.error?.message) {
      msg = parsed.error.message;
    } else if (parsed?.error && typeof parsed.error === "string") {
      msg = parsed.error;
    }
  } catch {}
  if (
    msg.includes("API key not valid") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("PERMISSION_DENIED") ||
    msg.includes("API key should be set") ||
    msg.includes("pass a valid API key")
  ) {
    return "Your Gemini API key is missing or invalid. Please select or check your API key in Settings > Secrets.";
  }
  if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
    return "API rate limit reached. Please wait a moment and try again.";
  }
  return msg;
}

function simulateStream(text: string, onChunk: (chunk: string) => void, onDone: () => void) {
  const words = text.split(" ");
  let i = 0;
  function next() {
    if (i < words.length) {
      const chunk = (i === 0 ? "" : " ") + words[i];
      onChunk(chunk);
      i++;
      setTimeout(next, 20);
    } else {
      onDone();
    }
  }
  next();
}

export interface StreamChatParams {
  topic: string;
  messages: Message[];
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamChat({
  topic,
  messages,
  onChunk,
  onDone,
  onError,
}: StreamChatParams): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, messages }),
    });

    // If backend is not hosted (e.g. 404/405 on GitHub Pages), seamlessly activate fallback engine
    if (!response.ok) {
      if (response.status === 404 || response.status === 405 || response.status === 502) {
        const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
        const fallbackText = synthesizeFallbackChat(topic, lastUserMsg, messages);
        simulateStream(fallbackText, onChunk, onDone);
        return;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(cleanErrorMessage(err.error || "Chat request failed."));
    }

    if (!response.body) {
      const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
      const fallbackText = synthesizeFallbackChat(topic, lastUserMsg, messages);
      simulateStream(fallbackText, onChunk, onDone);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.error) {
              const cleanErr = cleanErrorMessage(data.error);
              if (
                cleanErr.includes("high demand") ||
                cleanErr.includes("UNAVAILABLE") ||
                cleanErr.includes("503")
              ) {
                const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
                const fallbackText = synthesizeFallbackChat(topic, lastUserMsg, messages);
                simulateStream(fallbackText, onChunk, onDone);
                return;
              }
              onError(cleanErr);
              return;
            }
            if (data.done) {
              onDone();
              return;
            }
            if (data.text) {
              onChunk(data.text);
            }
          } catch {
            // Ignore malformed chunk
          }
        }
      }
    }
    onDone();
  } catch (err: any) {
    // If network fetch fails completely (static hosting without backend API), fall back smoothly
    const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
    const fallbackText = synthesizeFallbackChat(topic, lastUserMsg, messages);
    simulateStream(fallbackText, onChunk, onDone);
  }
}

export async function fetchQuiz(topic: string): Promise<QuizResponse> {
  try {
    const response = await fetch(`${API_BASE}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {}

  // Fallback for static hosting
  return synthesizeFallbackQuiz(topic);
}

export async function fetchFlashcards(
  topic: string,
  messages: Message[] = []
): Promise<FlashcardResponse> {
  try {
    const response = await fetch(`${API_BASE}/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, messages }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {}

  // Fallback for static hosting
  return synthesizeFallbackFlashcards(topic);
}

export async function fetchSummary(
  topic: string,
  messages: Message[] = []
): Promise<SummaryData> {
  try {
    const response = await fetch(`${API_BASE}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, messages }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {}

  return {
    summary: {
      keyPoints: [
        `Core principles and system dynamics of ${topic}`,
        "First-principles reasoning and foundational mechanics",
        "Key real-world applications and trade-offs",
      ],
      conceptsCovered: [topic, "System Mechanics", "Practical Applications"],
      suggestedNextTopics: ["Advanced Optimization", "Deep System Architecture"],
      oneLineSummary: `Gained an intuitive and structural understanding of ${topic}.`,
    },
  };
}

export async function fetchDeepDive(
  topic: string,
  depthLevel: DepthLevel = "Comprehensive"
): Promise<DeepDiveData> {
  try {
    const response = await fetch(`${API_BASE}/deep-dive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, depthLevel }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {}

  // Fallback for static hosting
  return synthesizeFallbackDeepDive(topic, depthLevel);
}
