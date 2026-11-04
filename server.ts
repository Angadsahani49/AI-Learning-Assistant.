import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Google GenAI Client Helper ────────────────────────────────────────────────
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function checkApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key.trim() === "") {
    return "Gemini API key is not configured. Please select or check your API key in Settings > Secrets.";
  }
  return null;
}

function extractErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred.";
  let msg = typeof err === "string" ? err : err.message || JSON.stringify(err);
  try {
    const parsed = typeof msg === "string" && msg.trim().startsWith("{") ? JSON.parse(msg) : null;
    if (parsed?.error?.message) {
      msg = parsed.error.message;
    }
  } catch {
    // not JSON
  }
  if (
    msg.includes("API key not valid") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("PERMISSION_DENIED") ||
    msg.includes("API key should be set") ||
    msg.includes("pass a valid API key")
  ) {
    return "Gemini API key is missing or invalid. Please check or select your API key in Settings > Secrets.";
  }
  if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
    return "API rate limit reached. Please wait a moment and try again.";
  }
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
    return "This model is currently experiencing high demand. Please try again in a few moments.";
  }
  return msg;
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again in a few minutes." },
});
app.use("/api/", limiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// ── System prompts ────────────────────────────────────────────────────────────
function chatSystemPrompt(topic: string) {
  return `You are an expert, friendly learning tutor helping a student understand: "${topic}".

Your teaching style:
- Break concepts into clear, digestible steps
- Use real-world analogies and examples
- Check for understanding naturally
- Celebrate curiosity and good questions
- Adjust complexity based on the student's questions
- Use markdown formatting: **bold** for key terms, bullet points for lists, \`code\` for technical terms

Keep responses focused and under 200 words unless the student asks for more depth.
Always end with either a clarifying question or an offer to explore a related concept.`;
}

function quizSystemPrompt(topic: string) {
  return `You are a quiz generator for the topic: "${topic}".

Generate exactly 4 multiple-choice questions that test genuine understanding (not just memorisation).

Respond ONLY with valid JSON in this exact format — no markdown fences, no extra text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this is correct and why others are wrong."
    }
  ]
}

Rules:
- correctIndex is 0-based (0 = first option)
- Make distractors plausible, not obviously wrong
- Explanations should reinforce learning, not just restate the answer
- Vary question difficulty: 1 easy, 2 medium, 1 hard`;
}

function flashcardSystemPrompt(topic: string, messages: Array<{ role: string; content: string }>) {
  const context =
    messages.length > 0
      ? `\n\nBased on this conversation:\n${messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n")}`
      : "";

  return `You are a flashcard generator for the topic: "${topic}".${context}

Create exactly 5 flashcards targeting the most important concepts from this topic.

Respond ONLY with valid JSON — no markdown fences, no extra text:
{
  "flashcards": [
    {
      "front": "Clear, specific question or prompt",
      "back": "Concise, accurate answer (1-3 sentences max)"
    }
  ]
}

Rules:
- Questions should be specific, not vague
- Answers should be self-contained and memorable
- Cover different aspects: definition, mechanism, example, comparison, application`;
}

function summarySystemPrompt(topic: string, messages: Array<{ role: string; content: string }>) {
  const history = messages
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  return `Summarise what was learned about "${topic}" in this session.

Conversation:
${history}

Create a structured summary. Respond ONLY with valid JSON:
{
  "summary": {
    "keyPoints": ["point 1", "point 2", "point 3"],
    "conceptsCovered": ["concept A", "concept B"],
    "suggestedNextTopics": ["topic 1", "topic 2"],
    "oneLineSummary": "A single sentence capturing the essence of what was learned."
  }
}`;
}

function deepDiveSystemPrompt(topic: string, depthLevel: string = "Comprehensive") {
  return `You are a world-class educator, subject-matter expert, and communicator specializing in deep conceptual explanations.
Topic: "${topic}"
Depth Level: "${depthLevel}" (Options: Intuitive, Comprehensive, Advanced, Feynman).
Intuitive: focus on visceral metaphors, mental models, and clear intuition.
Comprehensive: thorough step-by-step breakdown from first principles to real-world applications.
Advanced: deep technical, mathematical, architectural, or edge-case nuances and trade-offs.
Feynman: explain from first principles without jargon as if teaching a curious beginner, revealing exact mechanisms.

Explain this topic deeply and thoroughly.
Respond ONLY with valid JSON in this exact structure — no markdown fences, no extra text:
{
  "topic": "${topic}",
  "depthLevel": "${depthLevel}",
  "overview": "Thorough executive summary unpacking the core essence and significance...",
  "mentalModel": {
    "title": "A crystal-clear mental model or metaphor",
    "description": "How to visualize and internalize this concept...",
    "keyTakeaway": "Single most transformative insight to remember"
  },
  "firstPrinciples": [
    {
      "step": 1,
      "principle": "Core foundation",
      "explanation": "Detailed explanation of this foundational law or concept..."
    },
    {
      "step": 2,
      "principle": "Building upon the base",
      "explanation": "How the underlying mechanisms assemble and interact..."
    },
    {
      "step": 3,
      "principle": "Emergence & application",
      "explanation": "Real-world implications and behavior..."
    }
  ],
  "misconceptions": [
    {
      "myth": "A pervasive misconception or simplified half-truth",
      "reality": "The nuanced reality and why the myth fails"
    },
    {
      "myth": "Another common misconception",
      "reality": "The deeper explanation"
    }
  ],
  "technicalNuances": [
    {
      "aspect": "Critical mechanism / edge case / governing constraint",
      "details": "Technical breakdown of what really happens under the hood"
    },
    {
      "aspect": "Trade-offs and boundary conditions",
      "details": "When this breaks down, limits, and real-world trade-offs"
    }
  ],
  "connectedConcepts": [
    "Related concept 1",
    "Related concept 2",
    "Related concept 3",
    "Related concept 4"
  ],
  "selfTestQuestion": {
    "question": "A probing conceptual question to test if the student truly grasped the deep mechanics",
    "hint": "Hint to steer the inquiry",
    "answer": "Comprehensive answer explaining the underlying principles"
  }
}`;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// ── POST /api/chat (Gemini Streaming SSE) ────────────────────────────────────
app.post("/api/chat", async (req: Request, res: Response) => {
  const { topic, messages } = req.body;

  if (!topic || !Array.isArray(messages)) {
    return res.status(400).json({
      error: "topic and messages are required.",
    });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const keyError = checkApiKey();
  if (keyError) {
    res.write(`data: ${JSON.stringify({ error: keyError })}\n\n`);
    res.end();
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `${chatSystemPrompt(topic)}

Conversation:
${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}`;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Chat Error:", err);
    res.write(`data: ${JSON.stringify({ error: extractErrorMessage(err) })}\n\n`);
    res.end();
  }
});

// ── POST /api/quiz ────────────────────────────────────────────────────────────
app.post("/api/quiz", async (req: Request, res: Response) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required." });

  const keyError = checkApiKey();
  if (keyError) {
    return res.status(401).json({ error: keyError });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: quizSystemPrompt(topic) + "\nGenerate a quiz on " + topic,
    });

    const raw = response.text?.trim() || "{}";
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    console.error("Quiz error:", err?.message);
    res.status(500).json({ error: extractErrorMessage(err) });
  }
});

// ── POST /api/flashcards ──────────────────────────────────────────────────────
app.post("/api/flashcards", async (req: Request, res: Response) => {
  const { topic, messages = [] } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required." });

  const keyError = checkApiKey();
  if (keyError) {
    return res.status(401).json({ error: keyError });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: flashcardSystemPrompt(topic, messages),
    });

    const raw = response.text?.trim() || "{}";
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    console.error("Flashcard error:", err?.message);
    res.status(500).json({ error: extractErrorMessage(err) });
  }
});

// ── POST /api/summary ─────────────────────────────────────────────────────────
app.post("/api/summary", async (req: Request, res: Response) => {
  const { topic, messages = [] } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required." });

  const keyError = checkApiKey();
  if (keyError) {
    return res.status(401).json({ error: keyError });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: summarySystemPrompt(topic, messages),
    });

    const raw = response.text?.trim() || "{}";
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    console.error("Summary error:", err?.message);
    res.status(500).json({ error: extractErrorMessage(err) });
  }
});

// ── POST /api/deep-dive ───────────────────────────────────────────────────────
app.post("/api/deep-dive", async (req: Request, res: Response) => {
  const { topic, depthLevel = "Comprehensive" } = req.body;
  if (!topic) return res.status(400).json({ error: "topic is required." });

  const keyError = checkApiKey();
  if (keyError) {
    return res.status(401).json({ error: keyError });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: deepDiveSystemPrompt(topic, depthLevel),
    });

    const raw = response.text?.trim() || "{}";
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    console.error("Deep dive error:", err?.message);
    res.status(500).json({ error: extractErrorMessage(err) });
  }
});

// ── Vite integration & static handling ────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🧠 AI Learning Assistant server running on http://0.0.0.0:${PORT}\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
