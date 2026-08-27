# StudySphere AI 🎓

> **Your AI-Powered Academic Companion** — Intelligent Study Planning, RAG Document Q&A, Collaborative Study Rooms, Wellness Eye-Rest Reminders, and 12 Cognitive Mini-Games.

[![GitHub Repo](https://img.shields.io/badge/GitHub-jetsanranious%2Fstudysphere--ai-blue?logo=github)](https://github.com/jetsanranious)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-StudySphere%20AI-00C853?logo=google-cloud)](https://ais-pre-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live & Public URLs

- **Development App**: [https://ais-dev-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app](https://ais-dev-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app)
- **GitHub Profile**: [https://github.com/jetsanranious](https://github.com/jetsanranious)

---

## 🌟 Overview

**StudySphere AI** is a production-grade full-stack platform built for university students, educators, and independent researchers. It bridges high-yield AI intelligence (Google Gemini & OpenAI ChatGPT) with evidence-based cognitive study habits (Spaced Repetition, Active Recall, and 30-minute eye-rest intervals).

### ✨ Core Capabilities

1. **AI Weekly Study Planner**: Tell the AI your upcoming exam dates, assignments, and available study hours; it generates a balanced, non-overlapping weekly study plan with built-in review periods.
2. **RAG Document Intelligence**: Upload lecture slides, research papers, and textbooks (PDF, DOCX, TXT). Semantic chunking and vector retrieval let you ask questions, generate summaries, and take quizzes with direct source citations.
3. **Dedicated Study Rooms & Subtopics**: Organize coursework by subject (e.g. *Cloud Security*, *Machine Learning*, *Discrete Math*). Every room maintains its own syllabus hierarchy and localized AI context.
4. **Study Session Tracker & 30-Min Wellness Reminders**: Live study timer that tracks subject-level focus. Automatically alerts you every 30 minutes to look away from your screen (20-20-20 rule) or take a mindful break.
5. **Relax Zone (12 Mini-Games & Wellness Tools)**: Mindful break activities including:
   - **Cyber Snake**: Retro arcade snake game with neon grid styling and collision tracking.
   - **Hue Harmony (Color Sort)**: Harmonic spectrum puzzle restoring continuous color gradients.
   - **Simon Sequence**: Multi-tone audio memory recall with resonant chime feedback.
   - **Zen Mandala Sand**: Interactive calming radial sand art canvas with 4/6/8/12-way symmetry.
   - **2048 Number Merge**: Classic sliding tile brain teaser.
   - **Zen Bubble Wrap**: Haptic sound-enabled stress relief bubble popper.
   - **Memory Card Match**: Cognitive visual pairing grid.
   - **Reaction Speed Test**: Millisecond reflex benchmark.
   - **Word Scramble**: Academic vocabulary anagram unscrambler.
   - **Math Sprint**: Rapid mental arithmetic challenges.
   - **Tic-Tac-Toe**: Easy, Medium, and Unbeatable Minimax AI.
   - **4-7-8 Breathing Ring**: Guided diaphragmatic breathing rhythm.
6. **Isolated Google & Email Authentication**: Multi-user session isolation with JWT authorization, profile persistence, and verified badges.
7. **Night Light Mode & Screen Dimmer**: Warm ambient lighting presets for safe late-night study sessions.
8. **Gamification & Growth Engine**: Earn XP (+50 XP/hour studied, +20 XP/task), maintain daily focus streaks, level up your scholar rank, and unlock achievements.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend Server**: Node.js + Express + TypeScript (`server.ts` bundled with `esbuild`)
- **AI Integrations**: Google Gemini AI (`@google/genai`) & OpenAI ChatGPT Proxy
- **Authentication**: JWT & Google OAuth 2.0
- **Audio Engine**: Web Audio API Synthesizer (`audioChime.ts`)

```
studysphere-ai/
├── server.ts                 # Full-Stack Express TypeScript API & Vite Middleware
├── src/
│   ├── components/           # Reusable UI, Layouts, Timer, Modals, Relax Games
│   │   ├── auth/             # Google Auth Modal & Login Components
│   │   ├── layout/           # Navbar, Sidebar, Focus Mode wrappers
│   │   ├── relax/            # 12 Cognitive Mini-Games & Wellness Tools
│   │   └── timer/            # Live Study Session Tracker & Screen Dimmer
│   ├── contexts/             # Auth, Live Study Timer, Night Light, Focus Mode
│   ├── pages/                # Landing, Login, Dashboard, Rooms, Chat, Planner, Relax, Settings
│   ├── services/             # Axios API Client & Endpoints
│   ├── types/                # TypeScript Interface Definitions
│   ├── utils/                # Audio chime synthesizer & helpers
│   ├── App.tsx               # Route definitions & guards
│   └── main.tsx              # Application entrypoint
├── package.json              # NPM configuration & dependencies
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18+` or `v20+` ([Download Node.js](https://nodejs.org/))
- **npm**: `v9+` or `v10+`

---

### Step 1: Clone Repository

```bash
git clone https://github.com/jetsanranious/studysphere-ai.git
cd studysphere-ai
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and provide your API keys (optional for demo/local heuristics mode):
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

### Step 4: Start Full-Stack Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`.

---

### Step 5: Build for Production

```bash
npm run build
npm start
```

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
