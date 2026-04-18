# StartupEvents

Full-stack platform for startup-related events.

## Development Commands

### Backend
- Start development server: `npm run dev` (in `backend/`)
- Run tests: `npm test` (in `backend/`)
- Seed database: `npm run seed` (in `backend/`)

### Frontend
- Start development server: `npm run dev` (in `frontend/`)
- Build production: `npm run build` (in `frontend/`)
- Run tests: `npm test` (in `frontend/`)

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, Vanilla JS/TS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose), PostgreSQL (Prisma)
- **AI**: OpenAI API, Claude Agent SDK

## Coding Standards
- Use ES6+ syntax.
- Prettier for formatting.
- ESLint for linting.
- Prefer functional components and modular JS.
- Follow the directory structure: `frontend/` and `backend/`.

## Claude Code Instructions
- Use `claude` CLI for agentic coding.
- Skills and subagents are located in `.claude/`.
- Refer to `llms.txt` for SDK documentation.
