import { HistoryItem } from "./types";

const STORAGE_KEY = "ai_learning_v1";

interface StorageSchema {
  history: HistoryItem[];
}

export function getStoredData(): StorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { history: [] };
  } catch {
    return { history: [] };
  }
}

export function saveHistory(history: HistoryItem[]): void {
  try {
    const current = getStoredData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, history }));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export function addTopicHistory(topic: string, score: number | null = null): HistoryItem[] {
  const current = getStoredData().history.filter((item) => item.topic !== topic);
  const updated: HistoryItem[] = [{ topic, ts: Date.now(), score }, ...current].slice(0, 8);
  saveHistory(updated);
  return updated;
}

export function updateTopicScore(topic: string, score: number): HistoryItem[] {
  const updated = getStoredData().history.map((item) =>
    item.topic === topic ? { ...item, score } : item
  );
  saveHistory(updated);
  return updated;
}
