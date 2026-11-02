# AI Learning Assistant

An interactive AI-powered learning assistant built with React 19, TypeScript, and a full-stack Express server integrating the Google Gemini API (`@google/genai`).

## Features

- **Deep Explainer & First-Principles Deep Dive (New)**:
  - Explain any topic or concept with 4 specialized depth lenses:
    - 🧠 **Intuitive**: Visceral mental models and memorable analogies.
    - 📘 **Comprehensive**: Step-by-step breakdown from first principles to emergence.
    - 🔬 **Advanced**: Underlying mechanics, mathematics, trade-offs, and boundary conditions.
    - 💡 **Feynman Technique**: Jargon-free explanation built from basic laws.
  - Interactive sections:
    - **Mental Model & Metaphor Card** highlighting the single core takeaway.
    - **First-Principles Breakdown** with numbered progressive foundational steps.
    - **Misconceptions vs. Reality** directly debunking common pitfalls.
    - **Technical Nuances** exploring edge cases and system mechanics.
    - **Test Your Deep Understanding** with conceptual self-test questions, hints, and expandable deep explanations.
    - **Connected Concepts** interactive clickable network allowing instant exploration of related topics.
- **Interactive AI Tutoring**: Real-time conversational tutoring with SSE streaming responses and rich markdown formatting.
- **Smart Follow-Up Prompts**: One-click quick action chips (*Simplify*, *Analogy*, *Explain deeper*, *Key points*, *Example*).
- **AI-Generated Quizzes**: 4 targeted multiple-choice questions assessing comprehension, with instant feedback and explanations.
- **Interactive Flashcards**: 5 concept flashcards with flip card interaction, question-to-answer reveals, and mastery status tracking.
- **Local Progress**: Session history and quiz scores stored locally in browser storage without requiring an account.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tabler Icons, React Markdown
- **Backend**: Express, TSX, `@google/genai` (Gemini Flash Lite)
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`), Dockerfile

## Deployment on GitHub Push

### 1. GitHub Pages (Static Web Deployment)
Pushing to the `main` or `master` branch automatically triggers `.github/workflows/deploy.yml`, which:
1. Runs TypeScript validation (`npm run lint`).
2. Builds the Vite production bundle into `./dist`.
3. Deploys the application directly to GitHub Pages.

To enable in your GitHub repository:
- Go to **Settings > Pages**.
- Under **Build and deployment > Source**, select **GitHub Actions**.

### 2. Docker / Cloud Deployment (Full-Stack)
A production-ready `Dockerfile` is included for hosting platforms (Cloud Run, Render, Railway, Fly.io):
```bash
docker build -t ai-learning-assistant .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key ai-learning-assistant
```

## Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server (serves on port 3000):
   ```bash
   npm run dev
   ```

3. Type check & build:
   ```bash
   npm run lint
   npm run build
   ```
