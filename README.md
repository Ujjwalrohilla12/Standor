# Standor — Code Together 


**Standor** is a real-time collaborative coding interview platform with AI-powered evaluation and structured hiring analytics.

## Features

- **Real-time Collaboration** — Monaco Editor with live code syncing via Socket.IO
- **Code Execution** — Run code in 20+ languages using Piston API
- **AI Analysis** — DeepSeek Coder via OpenRouter for code evaluation
- **Email Feedback** — Automated session reports via Nodemailer + Brevo
- **Authentication** — JWT + Google OAuth
- **Session Management** — Create, join, and manage interview sessions
- **Code Snapshots** — Automatic code saving every 30 seconds
- **Dashboard** — View active and completed sessions

## Tech Stack

### Frontend (`app/frontend`)
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Monaco Editor · Socket.IO Client

### Backend (`app/backend`)
- Node.js + Express + TypeScript
- Prisma ORM (MongoDB) · Socket.IO · JWT Auth

## Project Structure

```
Standor/
├── app/
│   ├── frontend/     # Next.js 14 app
│   └── backend/      # Express + Prisma API
└── README.md
```

## Getting Started

### Backend

```bash
cd app/backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate        # prisma db push
npm run dev            # http://localhost:4000
```

### Frontend

```bash
cd app/frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

## API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/sessions` — Create session
- `GET  /api/sessions/:id` — Get session
- `POST /api/code/execute` — Run code
- `GET  /api/health` — Health check

---

**Standor — The Standard for Technical Interviews**
