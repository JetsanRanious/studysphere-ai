# StudySphere AI - Technical Architecture

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 + Vite Frontend                 │
│  (Tailwind CSS, React Router, Study Timer & Break Reminders)│
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Server                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Auth & Security (JWT, OAuth2, CryptContext)             │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Document Processing (PyPDF, Docx, Overlapping Chunker)  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ RAG Retrieval & Cosine Similarity Hybrid Ranker         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ AI Service Layer (Ollama LLM + Heuristics Fallback)     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Gamification & Sudoku Logic Engine                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼──────────────┐
│     SQL Database            ││       Ollama Local LLM      │
│ (PostgreSQL / SQLite)       ││ (Llama3, nomic-embed-text)  │
│ Users, Rooms, Chunks, Tasks ││ RAG Generation & Embeddings │
└─────────────────────────────┘└─────────────────────────────┘
```

## 2. RAG Pipeline
1. User uploads PDF/DOCX via `/api/documents/upload`.
2. `DocumentService` parses text by page, cleans whitespace, and splits into 600-character overlapping chunks.
3. `VectorService` generates embedding vectors (Ollama embedding or normalized term vectors).
4. When student asks a question in `/api/ai/chat`, top-k similar chunks are retrieved and injected into prompt context.
5. AI cites specific page excerpts in its response.
