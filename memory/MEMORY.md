# Standor – Project Memory

## Project Overview
**Standor** is a real-time collaborative coding interview platform.
- Frontend: Vite + React 18, DaisyUI + Tailwind CSS, Framer Motion, Clerk auth, Stream.io (video + chat), Monaco Editor
- Backend: Node.js + Express (ESM), MongoDB + Mongoose, Clerk middleware, Stream.io SDK, Inngest, `@anthropic-ai/sdk`

## Branding
- Project name: **Standor** (NOT "Talent IQ", NOT "InterviewForge")
- Tagline: "Code Together"
- Logo: SparklesIcon with gradient from-primary via-secondary to-accent

## Key Architecture
- Auth: Clerk (clerkId stored in User model)
- Video/Chat: Stream.io (StreamCall + StreamVideo + chat channel)
- Code Editor: Monaco Editor via `@monaco-editor/react`
- Code Execution: Piston API
- AI Analysis: Claude Opus 4.6 with adaptive thinking (`@anthropic-ai/sdk`)
- Email: Resend API (`resend` package)
- Background Jobs: Inngest (app id: "standor")

## Feature Status (All Complete)
- ✅ Clerk authentication + user sync
- ✅ Session CRUD (create, join, end)
- ✅ Stream.io video call + chat
- ✅ Monaco Editor with multi-language support
- ✅ Code execution via Piston API
- ✅ AI code analysis (Claude Opus 4.6, adaptive thinking)
- ✅ Code snapshots every 30s (max 20 per session, `$slice: -20`)
- ✅ Post-session Resend email feedback to host + participant
- ✅ Framer Motion animations on all pages
- ✅ Dashboard with active/recent sessions
- ✅ Problems practice page (ProblemsPage + ProblemPage)
- ✅ Standor branding everywhere

## Critical File Paths
- `frontend/src/App.jsx` – Routes (uses AnimatePresence for page transitions)
- `frontend/src/pages/HomePage.jsx` – Landing page with Framer Motion
- `frontend/src/pages/DashboardPage.jsx` – Dashboard (active/recent sessions)
- `frontend/src/pages/SessionPage.jsx` – Full session UI (editor + video + AI panel)
- `frontend/src/components/AIAnalysisPanel.jsx` – AI analysis results display
- `frontend/src/hooks/useAiAnalysis.js` – React Query hooks for AI/snapshots
- `frontend/src/hooks/useSession.js` – Session CRUD hooks
- `backend/src/controllers/aiController.js` – Claude API integration
- `backend/src/controllers/sessionController.js` – Session lifecycle + email sending
- `backend/src/lib/resend.js` – Resend email with dark HTML template
- `backend/src/lib/env.js` – All env vars (includes ANTHROPIC_API_KEY, RESEND_API_KEY)
- `backend/src/routes/SessionRoute.js` – All session routes

## Backend .env Variables Required
```
PORT=5001
DB_URL=mongodb+srv://...
NODE_ENV=development
CLIENT_URL=http://localhost:5173
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
STREAM_API_KEY=...
STREAM_API_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
```

## Session Model Schema
- `problem`: String (problem title)
- `difficulty`: enum ["easy", "medium", "hard"]
- `host`: ObjectId ref User
- `participant`: ObjectId ref User (optional)
- `status`: enum ["active", "completed"]
- `callId`: String (Stream.io call ID)
- `codeSnapshots`: [{content, language, timestamp}] — max 20
- `aiAnalysis`: {timeComplexity, spaceComplexity, correctness, bugs[], suggestions[], codeStyle, overallScore, summary, analyzedAt}

## AI Analysis API
- POST /:id/analyze — body: {code, language, problem}
- GET /:id/analysis — returns stored analysis
- Uses `claude-opus-4-6` with `thinking: {type: "adaptive"}`, max_tokens: 2048

## Snapshot API
- POST /:id/snapshot — body: {content, language}
- GET /:id/snapshots — returns all snapshots

## User Preferences
- Always use Standor branding (never "Talent IQ" or "InterviewForge")
- Framer Motion for all page/component animations
- DaisyUI components for UI
- React Query for all data fetching
