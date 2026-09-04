# VaultIQ — Personal Finance Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" />
  <img src="https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/Redis-Upstash-red?logo=redis" />
  <img src="https://img.shields.io/badge/AI-Qwen2.5-orange" />
</p>

> **VaultIQ** is a full-stack, AI-powered personal finance platform that helps individuals take complete control of their financial health. Track income, monitor expenses by category, lock in budgets, manage savings goals, and get instant intelligent answers from **VaultMind** — a built-in local LLM assistant.

---

## ✨ Features

- 📊 **Real-time Dashboard** — Animated counters for Income, Expenses, Safe-to-Spend & FinScore
- 🧠 **VaultMind AI** — On-device RAG-powered conversational assistant aware of your personal financial data
- 🔒 **Budget Lock System** — Lock in recurring budgets; they automatically reduce your safe-to-spend balance
- 🎯 **Savings Goals** — Track progress toward multiple financial goals with visual progress bars
- 📈 **Predictive Trend Chart** — ML-based expense forecasting for the rest of the month
- 🏷️ **Category Breakdown** — Pie charts with real-time category spend tracking
- 📋 **Mini Ledger** — Filterable, paginated transaction history
- 🔑 **FinScore** — A proprietary 0–1000 financial health score calculated from your spending habits
- 💳 **Subscription Tracker** — Dedicated page to monitor recurring subscription costs
- 🧾 **Tax Estimator** — Simple income-tax estimator tool
- 🎮 **Expense Simulator** — Test "what-if" scenarios before making financial decisions

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Recharts, Lucide Icons |
| Backend | NestJS 10, TypeORM, JWT Auth, PassportJS |
| AI Service | Python, FastAPI, Qwen2.5-0.5B-Instruct (local LLM) |
| Database | PostgreSQL (Neon.tech for production) |
| Cache | Redis (Upstash for production) |
| Deployment | Vercel (Frontend) + Render (Backend + AI) |

---

## 🚀 Local Development (Docker)

The fastest way to run everything locally is using Docker Compose.

**Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/KiranKumarD875/VaultIQ-Personal-Finance-Tracker.git
cd VaultIQ-Personal-Finance-Tracker

# 2. Create your environment file
cp .env.example .env

# 3. Start all services (database, backend, ai-service, frontend, redis)
docker-compose up --build
```

Once running, open [http://localhost:3000](http://localhost:3000) in your browser.

> ⚠️ The AI model (~1GB) is downloaded automatically on first build. This may take a few minutes. Subsequent builds use the cached layer.

---

## ☁️ Cloud Deployment (Free Tier)

| Service | Platform | Purpose |
|---|---|---|
| Database | [Neon.tech](https://neon.tech) | Serverless PostgreSQL |
| Cache | [Upstash](https://upstash.com) | Serverless Redis |
| AI Service | [Render](https://render.com) | Python FastAPI server |
| Backend | [Render](https://render.com) | NestJS Node.js server |
| Frontend | [Vercel](https://vercel.com) | Next.js web application |

See the full step-by-step deployment guide in [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 🔧 Environment Variables

### Root (Docker local only)
Copy `.env.example` → `.env` and fill in your values.

### Backend
Copy `backend/.env.example` → `backend/.env`.

### Frontend
Set `NEXT_PUBLIC_API_URL` to your backend URL.

---

## 📁 Project Structure

```
VaultIQ-Personal-Finance-Tracker/
├── frontend/         # Next.js 14 web application
├── backend/          # NestJS REST API server
├── ai-service/       # Python FastAPI + local LLM
├── database/         # SQL migration scripts
├── docker-compose.yml
└── .env.example
```

---

## 🔐 Security Notes

- JWT tokens are used for all authenticated API routes
- User data is fully isolated — the AI assistant only accesses the authenticated user's data
- Never commit `.env` files — use `.env.example` as a template
- CORS is restricted to your deployed frontend URL in production

---

## 📜 License

MIT License — free to use and modify.