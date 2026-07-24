# Contributing to AI Knowledge Platform

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/AI-doc-Chatbot.git
   cd AI-doc-Chatbot
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file based on `.env.example`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Branch Naming

Use the following prefixes:

| Prefix | Use Case |
|--------|----------|
| `feature/` | New features |
| `bugfix/` | Bug fixes |
| `refactor/` | Code refactoring |
| `hotfix/` | Critical production fixes |
| `docs/` | Documentation changes |
| `test/` | Adding or updating tests |
| `ci/` | CI/CD changes |
| `security/` | Security improvements |

Example: `feature/add-streaming-chat`

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance
- `ci`: CI/CD changes
- `perf`: Performance improvement
- `security`: Security fix

### Scopes

- `chat`: Chat functionality
- `auth`: Authentication
- `api`: API routes
- `ui`: UI components
- `db`: Database
- `rag`: RAG pipeline
- `docs`: Documentation
- `docker`: Docker configuration

### Examples

```
feat(chat): add streaming responses
fix(pdf): resolve parser memory leak
refactor(api): simplify upload service
docs(readme): improve installation guide
test(chat): add integration tests
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Write or update tests as needed
4. Ensure all checks pass:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
5. Push your branch and create a Pull Request
6. Fill out the PR template completely
7. Request a review from maintainers

### PR Title

Use the same convention as commit messages:

```
feat(chat): add streaming responses
```

### PR Description

Include:
- What the PR does
- Why the change is needed
- How to test it
- Screenshots (for UI changes)

## Coding Standards

### TypeScript

- Use strict TypeScript
- Avoid `any` types
- Use proper interfaces and types
- Export types from `src/types/`

### React

- Use functional components with hooks
- Use `"use client"` directive for client components
- Keep components small and focused
- Use proper prop types

### Styling

- Use Tailwind CSS utility classes
- Follow the shadcn/ui component patterns
- Use the `cn()` utility for conditional classes
- Maintain dark/light mode support

### API Routes

- Validate all inputs with Zod
- Return consistent `{ success, data, error }` format
- Handle errors properly
- Use proper HTTP status codes

## Testing

- Write unit tests for business logic
- Write integration tests for API routes
- Aim for >90% code coverage
- Test edge cases and error scenarios

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Questions?

Open a [Discussion](https://github.com/Alaashamel/AI-doc-Chatbot/discussions) on GitHub.
