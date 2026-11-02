import {
  Message,
  QuizResponse,
  FlashcardResponse,
  SummaryData,
  DeepDiveData,
  DepthLevel,
} from "./types";

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

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(cleanErrorMessage(err.error || "Chat request failed."));
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported in response.");
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
              onError(cleanErrorMessage(data.error));
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
    onError(cleanErrorMessage(err.message || "Failed to communicate with tutor."));
  }
}

export async function fetchQuiz(topic: string): Promise<QuizResponse> {
  const response = await fetch(`${API_BASE}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(err.error || "Failed to generate quiz."));
  }
  return response.json();
}

export async function fetchFlashcards(
  topic: string,
  messages: Message[] = []
): Promise<FlashcardResponse> {
  const response = await fetch(`${API_BASE}/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, messages }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(err.error || "Failed to generate flashcards."));
  }
  return response.json();
}

export async function fetchSummary(
  topic: string,
  messages: Message[] = []
): Promise<SummaryData> {
  const response = await fetch(`${API_BASE}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, messages }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(err.error || "Failed to generate summary."));
  }
  return response.json();
}

export async function fetchDeepDive(
  topic: string,
  depthLevel: DepthLevel = "Comprehensive"
): Promise<DeepDiveData> {
  const response = await fetch(`${API_BASE}/deep-dive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, depthLevel }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(err.error || "Failed to generate deep dive explanation."));
  }
  return response.json();
}
