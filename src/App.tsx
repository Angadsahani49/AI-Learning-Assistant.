import React, { useState, useEffect } from "react";
import { Screen, Message, HistoryItem } from "./types";
import { getStoredData, addTopicHistory, updateTopicScore } from "./storage";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { ChatScreen } from "./components/ChatScreen";
import { QuizScreen } from "./components/QuizScreen";
import { FlashcardsScreen } from "./components/FlashcardsScreen";
import { DeepDiveScreen } from "./components/DeepDiveScreen";

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [topic, setTopic] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const data = getStoredData();
    setHistory(data.history || []);
  }, []);

  function handleStart(newTopic: string) {
    setTopic(newTopic);
    setMessages([]);
    setScreen("chat");
    const updated = addTopicHistory(newTopic);
    setHistory(updated);
  }

  function handleContinue(existingTopic: string) {
    setTopic(existingTopic);
    setMessages([]);
    setScreen("chat");
  }

  function handleScoreUpdate(score: number) {
    if (!topic) return;
    const updated = updateTopicScore(topic, score);
    setHistory(updated);
  }

  function handleDeepDiveTopic(selectedTopic: string) {
    setTopic(selectedTopic);
    const updated = addTopicHistory(selectedTopic);
    setHistory(updated);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header screen={screen} setScreen={setScreen} topic={topic} />
      <main>
        {screen === "home" && (
          <HomeScreen
            history={history}
            onStart={handleStart}
            onContinue={handleContinue}
            onDeepDive={(t) => {
              handleDeepDiveTopic(t);
              setScreen("deep-dive");
            }}
          />
        )}
        {screen === "chat" && (
          <ChatScreen
            topic={topic}
            messages={messages}
            setMessages={setMessages}
            onGoQuiz={() => setScreen("quiz")}
            onGoDeepDive={() => setScreen("deep-dive")}
          />
        )}
        {screen === "deep-dive" && (
          <DeepDiveScreen
            topic={topic || "Machine Learning"}
            onSelectTopic={handleDeepDiveTopic}
            onGoChat={() => setScreen("chat")}
            onGoQuiz={() => setScreen("quiz")}
            onGoFlashcards={() => setScreen("flashcards")}
          />
        )}
        {screen === "quiz" && (
          <QuizScreen
            topic={topic}
            onScoreUpdate={handleScoreUpdate}
            onGoFlashcards={() => setScreen("flashcards")}
          />
        )}
        {screen === "flashcards" && (
          <FlashcardsScreen
            topic={topic}
            messages={messages}
            onGoQuiz={() => setScreen("quiz")}
          />
        )}
      </main>
    </div>
  );
};

export default App;
