Architecture documentation for AI Knowledge Platform.

## System Architecture

### Overview

The AI Knowledge Platform is built on a modern Next.js 15 stack with the App Router pattern, providing both server-side rendering and client-side interactivity.

### Components

1. **Frontend (Next.js 15 + React 19)**
   - App Router with server and client components
   - shadcn/ui component library with TailwindCSS
   - Framer Motion for animations
   - React Query for data fetching and caching

2. **API Layer (Next.js API Routes)**
   - RESTful API endpoints under `/api/`
   - Server-Sent Events (SSE) for streaming responses
   - Authentication middleware via NextAuth.js

3. **Database (PostgreSQL + Prisma)**
   - Relational data model with proper indexing
   - Vector storage support for embeddings
   - Migration-based schema management

4. **AI Layer (Multi-Provider)**
   - Abstracted provider interface
   - Streaming support across all providers
   - Provider switching at runtime

5. **RAG Pipeline**
   - Document ingestion (PDF, DOCX, TXT, CSV, MD, JSON)
   - Text chunking with configurable size/overlap
   - Keyword-based retrieval with relevance scoring
   - Context-aware prompt construction

### Data Flow

```
User → Frontend → API Route → RAG Pipeline → AI Provider → Streaming Response
  ↓              ↓              ↓               ↓
  │         React Query    Prisma ORM     Provider SDK
  │              ↓              ↓               ↓
  │         Cache Layer    PostgreSQL      OpenAI/Anthropic/etc
  └──────────────┴──────────────┴───────────────┘
```

### Security

- JWT-based authentication with HTTP-only cookies
- Rate limiting on all API endpoints
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection via React's automatic escaping
- CSRF protection via SameSite cookies
