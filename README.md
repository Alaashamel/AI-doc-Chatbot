# AI Knowledge Platform

[![CI/CD Pipeline](https://github.com/Alaashamel/AI-doc-Chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/Alaashamel/AI-doc-Chatbot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Alaashamel/AI-doc-Chatbot/pulls)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

> Enterprise AI-powered document chat platform with RAG, multi-provider LLM support, and intelligent knowledge retrieval.

Build intelligent AI assistants that can understand, search, and chat with your documents using Retrieval-Augmented Generation (RAG).

## Features

- **Multi-Provider AI** — OpenAI, Anthropic Claude, Google Gemini, Groq, Mistral, DeepSeek
- **RAG Pipeline** — Upload documents, chunk them intelligently, and chat with context-aware AI
- **Document Support** — PDF, DOCX, TXT, CSV, Markdown, JSON, PowerPoint, Excel
- **Modern UI** — ChatGPT-quality interface with dark mode, markdown rendering, code highlighting
- **Streaming Responses** — Real-time SSE-based streaming with typing indicators
- **Source Citations** — Every answer includes document sources with relevance scores
- **Chat Management** — Folders, pinning, search, rename, and organize conversations
- **Authentication** — Google, GitHub, and email/password with NextAuth.js
- **Database** — PostgreSQL with Prisma ORM, proper migrations, and indexes
- **Responsive** — Works on desktop, tablet, and mobile devices
- **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- **Docker** — Full Docker Compose setup with PostgreSQL and Redis
- **CI/CD** — GitHub Actions pipeline with lint, test, build, and E2E

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- At least one AI provider API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Alaashamel/AI-doc-Chatbot.git
cd AI-doc-Chatbot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure your environment variables in .env.local
# At minimum, set:
#   DATABASE_URL
#   NEXTAUTH_SECRET
#   At least one AI provider API key (e.g., OPENAI_API_KEY)

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
# Start all services (app, database, redis)
docker compose up -d

# Run migrations
docker compose exec app npm run db:migrate

# Access the app at http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for NextAuth.js |
| `OPENAI_API_KEY` | No* | OpenAI API key |
| `ANTHROPIC_API_KEY` | No* | Anthropic API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No* | Google Gemini API key |
| `GROQ_API_KEY` | No* | Groq API key |
| `MISTRAL_API_KEY` | No* | Mistral API key |
| `DEEPSEEK_API_KEY` | No* | DeepSeek API key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

*At least one AI provider API key is required.

## Architecture

```text
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication (NextAuth.js)
│   │   ├── chat/          # Chat streaming endpoint
│   │   ├── conversations/ # Conversation CRUD
│   │   ├── documents/     # Document management
│   │   ├── folders/       # Folder management
│   │   └── health/        # Health check
│   ├── auth/              # Auth pages
│   ├── chat/              # Chat pages
│   ├── documents/         # Document management page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── chat/              # Chat-specific components
│   ├── documents/         # Document components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components (shadcn/ui)
├── config/                # Configuration constants
├── lib/                   # Utilities, validations, Prisma client
├── middleware.ts           # Auth middleware
├── services/              # Business logic (AI, RAG, documents)
└── types/                 # TypeScript type definitions
```

## API Reference

### Chat
- `POST /api/chat` — Send a message and stream the response

### Conversations
- `GET /api/conversations` — List all conversations
- `POST /api/conversations` — Create a new conversation
- `GET /api/conversations/:id` — Get a conversation with messages
- `PATCH /api/conversations/:id` — Update a conversation
- `DELETE /api/conversations/:id` — Delete a conversation

### Documents
- `GET /api/documents` — List all documents
- `POST /api/documents/upload` — Upload a document
- `GET /api/documents/:id` — Get document details
- `DELETE /api/documents/:id` — Delete a document

### Folders
- `GET /api/folders` — List all folders
- `POST /api/folders` — Create a new folder

### Health
- `GET /api/health` — Health check

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL, Prisma ORM |
| AI | OpenAI, Anthropic, Google Gemini, Groq, Mistral, DeepSeek |
| Auth | NextAuth.js (Google, GitHub, Credentials) |
| Animations | Framer Motion |
| Testing | Jest, Playwright |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Roadmap

- [x] Multi-LLM Support
- [x] Enterprise RAG Pipeline
- [x] Authentication (Google, GitHub, Email)
- [x] Streaming Chat
- [x] Docker Deployment
- [x] CI/CD Pipeline
- [ ] Vector Database (Pinecone, Qdrant, Chroma)
- [ ] Admin Dashboard with Analytics
- [ ] Mobile App
- [ ] Voice Assistant
- [ ] Team Collaboration

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Made with by **Alaa Shamel**
