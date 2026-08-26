# StudySphere AI 🎓

> **Your AI-Powered Academic Companion** — Intelligent Study Planning, RAG Document Q&A, Collaborative Study Rooms, Wellness Eye-Rest Reminders, and Cognitive Mini-Games.

[![GitHub Repo](https://img.shields.io/badge/GitHub-jetsanranious%2Fstudysphere--ai-blue?logo=github)](https://github.com/jetsanranious)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-StudySphere%20AI-00C853?logo=google-cloud)](https://ais-pre-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live & Public URLs

- **Development App**: [https://ais-dev-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app](https://ais-dev-t3243hbrkaz4w3ulwds34z-144346548797.asia-east1.run.app)
- **GitHub Profile**: [https://github.com/jetsanranious](https://github.com/jetsanranious)

---

## 🌟 Overview

**StudySphere AI** is a production-grade full-stack platform built for modern university students and independent researchers. It bridges high-yield AI intelligence with evidence-based cognitive study habits (Spaced Repetition, Active Recall, and 30-minute eye-rest intervals).

### ✨ Core Capabilities

1. **AI Weekly Study Planner**: Tell the AI your upcoming exam dates, assignments, and available study hours; it generates a balanced, non-overlapping weekly study plan with built-in review periods.
2. **RAG Document Intelligence**: Upload lecture slides, research papers, and textbooks (PDF, DOCX, TXT). Semantic chunking and vector retrieval let you ask questions, generate summaries, and take quizzes with direct source citations.
3. **Dedicated Study Rooms & Subtopics**: Organize coursework by subject (e.g. *Cloud Security*, *Cryptography*, *Network Security*). Every room maintains its own syllabus hierarchy and localized AI context.
4. **Study Session Tracker & 30-Min Wellness Reminders**: Live study timer that tracks subject-level focus. Automatically alerts you every 30 minutes to look away from your screen (20-20-20 rule) or take a mindful break.
5. **Relax Zone Cognitive Games**: Mindful break activities including:
   - **Tic-Tac-Toe**: Easy, Medium, and Unbeatable Minimax AI.
   - **Sudoku Master**: 9x9 board with automated validation and **Step-by-Step AI Deduction Hints** (explains *Naked Singles* and *Constraint Elimination*).
   - **Study Bird**: Smooth HTML5 Canvas arcade game with high-score tracking.
6. **Gamification & Growth Engine**: Earn XP (+50 XP/hour studied, +20 XP/task), maintain daily focus streaks, level up your scholar rank, and unlock achievements.
7. **Visual Study Analytics**: Clean data charts tracking weekly consistency, subject time distribution, and task completion velocity.

---

## 🎨 Visual Design Palette

StudySphere AI is built with a calm, modern academic SaaS theme:
- **Primary Backgrounds**: `#FFFFFF`, `#F8FAFC`, `#F0F7FF`
- **Brand Accents**: `#3B82F6` (Calm Blue), `#60A5FA` (Sky), `#0284C7` (Cyan)
- **Status Colors**: Soft Emerald (`#10B981`), Soft Amber (`#F59E0B`), Soft Rose (`#F43F5E`)
- **Typography**: Inter & Plus Jakarta Sans

---

## 🏗️ Architecture & Tech Stack

```
studysphere-ai/
├── backend/                  # FastAPI Python Application
│   ├── app/
│   │   ├── api/              # REST Endpoints (Auth, Rooms, Docs, AI, Tasks, Games, Analytics)
│   │   ├── core/             # Configuration, Database Engine, JWT Security, Dependencies
│   │   ├── models/           # SQLAlchemy Database Models (PostgreSQL / SQLite)
│   │   ├── schemas/          # Pydantic Request/Response Schemas
│   │   ├── services/         # Document Extraction, Vector RAG, Ollama Service, Sudoku Solver
│   │   ├── seed_data.py      # Demo seed database initializer
│   │   └── main.py           # FastAPI entrypoint with CORS & auto-migrations
│   ├── tests/                # Pytest unit & integration test suites
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable UI, Layouts, Timer, Modals, Games
│   │   ├── contexts/         # Auth, Live Study Timer, Toast Notifications
│   │   ├── pages/            # Landing, Login, Dashboard, Rooms, Chat, Planner, Relax, Analytics
│   │   ├── services/         # Axios API Client & Endpoints
│   │   ├── types/            # TypeScript Interface Definitions
│   │   ├── App.tsx           # Route definitions & guards
│   │   └── main.tsx          # Application bootstrapper
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration (Backend + Frontend + Postgres)
├── .env.example              # Sample environment template
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18+` or `v20+` ([Download Node.js](https://nodejs.org/))
- **Python**: `3.10+`, `3.11+`, or `3.14+` ([Download Python](https://python.org/))
- **Ollama** (Optional for local LLM inference): ([Download Ollama](https://ollama.com/))

---

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/studysphere-ai.git
cd studysphere-ai
```

---

### Step 2: Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .env\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   ```bash
   cp .env.example .env
   ```
   *(By default, `DATABASE_URL` is configured to `sqlite:///./studysphere.db` for zero-configuration instant local running)*.

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will start at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

---

### Step 3: Frontend Setup

1. Open a second terminal window and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 🤖 Ollama Local AI Setup (Optional)

StudySphere AI natively integrates with **Ollama** for 100% private, local LLM generation and vector embeddings.

1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull your preferred language and embedding models:
   ```bash
   ollama pull llama3
   ollama pull nomic-embed-text
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```

> 💡 **Graceful Fallback**: If Ollama is offline or not installed, StudySphere AI automatically activates its internal heuristic engine, providing intelligent context summaries, TF-IDF chunk retrieval, and quiz synthesis without crashing!

---

## 🔑 Authentication

1. **Instant Demo Login**: Click **"Instant Demo Login (Jetsan)"** on the login screen to jump directly into the pre-populated dashboard.
2. **Email & Password**: Register a new student account.
3. **Google OAuth**: Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` to enable Google authentication.

---

## 🐳 Running with Docker Compose

To run the entire multi-container stack (PostgreSQL + FastAPI Backend + React Frontend):

```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 🧪 Running Automated Tests

Run backend integration and unit tests with `pytest`:

```bash
cd backend
python -m pytest tests/ -v
```

---

## 📚 REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/demo-login` | Zero-config instant developer/demo login |
| `POST` | `/api/auth/login` | Standard JWT email & password authentication |
| `GET` | `/api/users/profile` | Retrieve student profile and gamification stats |
| `GET` | `/api/rooms` | List all student study rooms |
| `POST` | `/api/rooms` | Create new subject room with subtopics |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX and trigger RAG chunk indexing |
| `POST` | `/api/ai/chat` | RAG grounded Q&A with document chunk citations |
| `POST` | `/api/ai/summarize` | Generate structured executive summary & takeaways |
| `POST` | `/api/ai/quiz` | Generate multiple choice practice quiz |
| `POST` | `/api/ai/study-plan` | Synthesize structured weekly study schedule |
| `GET` | `/api/tasks` | List active study tasks |
| `POST` | `/api/study-sessions` | Record completed focus session and award XP |
| `POST` | `/api/games/sudoku/hint` | Compute step-by-step AI logical deduction hint |
| `GET` | `/api/analytics` | Fetch 7-day consistency and subject analytics |

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
