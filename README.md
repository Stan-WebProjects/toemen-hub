# Toemen Hub

AI-platform voor klantenservice, verkoop en beheer. Jappie is de AI-assistent.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion
- **Backend:** Supabase (PostgreSQL + pgvector + Realtime + Auth + Storage)
- **AI:** Google Gemini 2.0 Flash
- **Orchestratie:** n8n
- **Deployment:** Lovable (via GitHub sync)

## Routes

- `/` — Chat widget (embeddable)
- `/chat` — Full-screen Jappie (jappie.toemen.nl)
- `/auth` — Login
- `/dashboard` — Staff dashboard (hub.toemen.nl)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```
