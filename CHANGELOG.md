# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added
- Multi-provider AI support (OpenAI, Anthropic, Google Gemini, Groq, Mistral, DeepSeek)
- RAG-powered document chat with source citations
- Modern ChatGPT-quality UI with dark mode
- Real-time streaming responses via SSE
- Document upload and management (PDF, DOCX, TXT, CSV, MD, JSON)
- Chat conversation management (folders, pinning, search, rename)
- Authentication with Google, GitHub, and email/password
- PostgreSQL database with Prisma ORM
- Responsive design for desktop, tablet, and mobile
- Code syntax highlighting with copy buttons
- Markdown rendering with GFM support
- File drag-and-drop upload
- Loading skeletons and animations
- Health check endpoint
- Docker and Docker Compose support
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation

### Security
- bcrypt password hashing (12 rounds)
- JWT with HTTP-only cookies
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection via React
- CSRF protection
- Non-root Docker container
