export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardResponse {
  flashcards: Flashcard[];
}

export interface SummaryData {
  summary: {
    keyPoints: string[];
    conceptsCovered: string[];
    suggestedNextTopics: string[];
    oneLineSummary: string;
  };
}

export interface HistoryItem {
  topic: string;
  ts: number;
  score: number | null;
}

export type DepthLevel = "Intuitive" | "Comprehensive" | "Advanced" | "Feynman";

export interface DeepDiveData {
  topic: string;
  depthLevel: DepthLevel;
  overview: string;
  mentalModel: {
    title: string;
    description: string;
    keyTakeaway: string;
  };
  firstPrinciples: Array<{
    step: number;
    principle: string;
    explanation: string;
  }>;
  misconceptions: Array<{
    myth: string;
    reality: string;
  }>;
  technicalNuances: Array<{
    aspect: string;
    details: string;
  }>;
  connectedConcepts: string[];
  selfTestQuestion: {
    question: string;
    hint: string;
    answer: string;
  };
}

export type Screen = "home" | "chat" | "quiz" | "flashcards" | "deep-dive";
