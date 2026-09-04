# 📧 ReachInbox Email Job Scheduler

> Production-grade email scheduling service + dashboard built for the ReachInbox hiring assignment.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis-red)](https://docs.bullmq.io/)
[![Prisma](https://img.shields.io/badge/Prisma-MySQL-green)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Features Implemented](#-features-implemented)
- [Prerequisites](#-prerequisites)
- [Running with Docker (Recommended)](#-running-with-docker-recommended)
- [Running Manually (Without Docker)](#-running-manually-without-docker)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Scheduling Architecture](#-scheduling-architecture)
- [Persistence on Restart](#-persistence-on-restart)
- [Rate Limiting & Concurrency](#-rate-limiting--concurrency)
- [Assumptions & Trade-offs](#-assumptions--trade-offs)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 14)                      │
│   /login → Google OAuth → /dashboard                         │
│   Compose | Scheduled Emails | Sent Emails | Search          │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (axios + cookies)
┌──────────────────────▼──────────────────────────────────────┐
│               Backend (Express.js + TypeScript)              │
│  ┌────────────┐  ┌───────────────┐  ┌─────────────────────┐ │
│  │  /api/auth │  │ /api/emails   │  │  /api/slack         │ │
│  │  Google    │  │ schedule/list │  │  OAuth + alerts     │ │
│  │  OAuth     │  │ /search       │  └─────────────────────┘ │
│  └────────────┘  └───────┬───────┘                          │
│                           │ addEmailJob()                    │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                BullMQ (email-jobs queue)                │  │
│  │  Delayed jobs: one per recipient, keyed by jobId UUID  │  │
│  │  Limiter: max 1 job per EMAIL_DELAY_MS (throttle)      │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                            │                                  │
│  ┌─────────────────────────▼──────────────────────────────┐  │
│  │                 BullMQ Worker (separate process)        │  │
│  │  1. Check Redis rate limit counter (Lua atomic INCR)   │  │
│  │  2a. Allowed → Ethereal SMTP → update MySQL + ES       │  │
│  │  2b. Rate limited → moveToDelayed(nextHour) + Slack    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   MySQL    │  │    Redis     │  │    Elasticsearch      │ │
│  │  (Prisma)  │  │  BullMQ +   │  │   email index for     │ │
│  │  Users     │  │  rate limit  │  │   full-text search    │ │
│  │  EmailJobs │  │  counters    │  └───────────────────────┘ │
│  └────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Features Implemented

### Backend
| Feature | Implementation |
|---|---|
| Email scheduling via API | `POST /api/emails/schedule` with CSV upload |
| BullMQ delayed jobs | One job per recipient, no cron at all |
| Persistence on restart | Redis stores all delayed jobs (AOF enabled) |
| Idempotency | Each job has unique `jobId = email_job:{uuid}` — BullMQ ignores duplicates |
| Ethereal SMTP | Auto-creates test account if credentials not set |
| Worker concurrency | Configurable via `WORKER_CONCURRENCY` env (default: 5) |
| Email delay throttle | BullMQ limiter: `max: 1, duration: EMAIL_DELAY_MS` (default: 2s) |
| Per-sender rate limiting | Redis Lua script INCR, key: `ratelimit:{sender}:{date-hour}` |
| Rate limit exceeded | Jobs rescheduled to next hour window, NOT dropped |
| Slack notifications | Real Slack OAuth → sends `chat.postMessage` on rate limit hit |
| Elasticsearch indexing | Emails indexed/updated on status change, full-text search |
| Bull Board dashboard | Live queue UI at `/admin/queues` |
| Google OAuth | Real OAuth 2.0, JWT in httpOnly cookie |
| Multiple senders | Rate limit tracked independently per sender email |

### Frontend
| Feature | Implementation |
|---|---|
| Google Login | Real OAuth redirect via `GET /api/auth/google` |
| Dashboard | Dark theme, tab-based (Scheduled / Sent) |
| Compose modal | CSV upload with PapaParse count detection |
| Scheduled emails | Table with 10s auto-refresh (SWR) |
| Sent emails | Table with Ethereal preview links |
| Email search | Full-text search via Elasticsearch |
| Slack connect | Real OAuth flow, disconnect/reconnect supported |
| Loading states | Skeleton loaders on all tables |
| Empty states | Illustrated empty states with icons |
| Toast notifications | react-hot-toast for success/error feedback |
| TypeScript | Full type coverage across all components/hooks |

---

## 🛠 Prerequisites

- **Node.js** v18+ (you have v24 ✅)
- **npm** v9+
- One of:
  - **Docker Desktop** + Docker Compose (easiest)
  - **Manual**: Redis, MySQL 8, Elasticsearch 8 installed locally
- Google Cloud Console account (for OAuth)
- Slack API account (for notifications — optional but required for full demo)

---

## 🐳 Running with Docker (Recommended)

### 1. Start infrastructure

```bash
cd reachinbox-scheduler
docker-compose up -d
```

This starts:
- **Redis** on port `6379` (with AOF persistence)
- **MySQL 8** on port `3306`
- **Elasticsearch 8** on port `9200`

Wait ~30 seconds for Elasticsearch to be healthy.

### 2. Set up backend

```bash
cd backend
copy .env.example .env   # Windows
# Edit .env and fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, SLACK_* etc.

npm install
npm run prisma:generate
npm run prisma:migrate    # Creates tables in MySQL
```

### 3. Run backend (two terminals)

```bash
# Terminal 1 — API Server
cd backend
npm run dev
# → http://localhost:3001

# Terminal 2 — BullMQ Worker (separate process!)
cd backend
npm run worker
```

### 4. Set up and run frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. Open the app

- **Dashboard**: http://localhost:3000
- **Bull Board**: http://localhost:3001/admin/queues
- **API**: http://localhost:3001/api

---

## 🔧 Running Manually (Without Docker)

### Redis (Windows)

Download [Redis for Windows](https://github.com/tporadowski/redis/releases) and run:
```bash
redis-server --appendonly yes
```

### MySQL 8

Install [MySQL Community](https://dev.mysql.com/downloads/mysql/) and create database:
```sql
CREATE DATABASE reachinbox;
```

### Elasticsearch 8

Download from [elastic.co](https://www.elastic.co/downloads/elasticsearch) and in `config/elasticsearch.yml`:
```yaml
xpack.security.enabled: false
```

Then run `elasticsearch.bat` from the bin folder.

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in these values:

### Getting Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application type)
4. Add Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

### Getting Slack Credentials
1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → From scratch
2. Under **OAuth & Permissions**, add scope: `chat:write`
3. Add Redirect URL: `http://localhost:3001/api/slack/callback`
4. Install app to workspace
5. Copy Client ID and Client Secret to `.env`

### Key Config Values

| Variable | Default | Description |
|---|---|---|
| `MAX_EMAILS_PER_HOUR_PER_SENDER` | `100` | Hourly rate limit per sender |
| `WORKER_CONCURRENCY` | `5` | Parallel jobs in BullMQ worker |
| `EMAIL_DELAY_MS` | `2000` | Minimum ms between email sends |
| `ETHEREAL_USER` / `ETHEREAL_PASS` | auto | Leave blank to auto-create test account |

---

## 📡 API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback → sets JWT cookie |
| POST | `/api/auth/logout` | Clears session |
| GET | `/api/auth/me` | Returns current user |

### Emails
| Method | Path | Description |
|---|---|---|
| POST | `/api/emails/schedule` | Schedule emails (multipart, CSV) |
| GET | `/api/emails/scheduled` | List scheduled/rate-limited jobs |
| GET | `/api/emails/sent` | List sent/failed jobs |
| GET | `/api/emails/search?q=` | Full-text search via Elasticsearch |

**POST `/api/emails/schedule` body (multipart/form-data):**
```
subject        — Email subject line
body           — HTML body
senderEmail    — From address
startTime      — ISO 8601 datetime (when to start sending)
delayBetweenMs — Milliseconds between sends
hourlyLimit    — Max sends per hour for this sender
csv            — File: CSV with 'email' column header
```

### Slack
| Method | Path | Description |
|---|---|---|
| GET | `/api/slack/connect` | Redirect to Slack OAuth |
| GET | `/api/slack/callback` | OAuth callback → saves token |
| DELETE | `/api/slack/disconnect` | Remove Slack connection |
| GET | `/api/slack/status` | Returns `{ connected, teamName }` |

### Bull Board
| URL | Description |
|---|---|
| `http://localhost:3001/admin/queues` | Live BullMQ queue dashboard |

---

## ⚙️ Scheduling Architecture

### How it works

1. Client uploads a CSV with N email addresses and calls `POST /api/emails/schedule`
2. For each recipient (index `i`):
   - A **MySQL** record is created with status `scheduled`
   - A BullMQ delayed job is added with:
     - `delay = max(0, startTime - now) + i * delayBetweenMs`
     - `jobId = email_job:{uuid}` (unique, prevents duplicates)
3. The **BullMQ Worker** (separate process) dequeues each job when its delay expires
4. Worker enforces the **minimum delay** via BullMQ's `limiter: { max: 1, duration: EMAIL_DELAY_MS }`
5. Worker sends via **Ethereal SMTP** and updates MySQL + Elasticsearch

### Why BullMQ (not cron)

- BullMQ delayed jobs persist in **Redis** even if the server restarts
- Jobs fire at the exact scheduled time (Redis TTL-based)
- No OS-level cron, no `node-cron`, no `agenda` — 100% BullMQ

---

## 🔄 Persistence on Restart

| Concern | Solution |
|---|---|
| Future jobs lost on restart | Redis stores all delayed jobs; worker reconnects on start |
| Jobs re-sent after restart | `bullJobId` uniqueness in DB + BullMQ `jobId` deduplication |
| Counter loss on restart | Redis AOF (`appendonly yes`) persists counters across restarts |
| MySQL state | All email statuses stored in MySQL; worker checks `status === 'sent'` before processing |

**Demo scenario:**
1. Schedule 10 emails for 5 minutes from now
2. Stop the backend (`Ctrl+C`) and worker
3. Wait — do NOT restart yet
4. Restart backend + worker after 2 minutes
5. The remaining jobs will still fire at the correct times ✅

---

## ⚡ Rate Limiting & Concurrency

### How rate limiting works

```
Redis key: ratelimit:{senderEmail}:{YYYY-MM-DD-HH}
TTL: 3600 seconds (auto-expires after the hour)

Lua script (atomic, multi-worker safe):
  INCR key
  if key is new → SET EXPIRE 3600
  if count > limit → decrement + reschedule to next hour
```

**Why Lua?** The INCR + check is atomic — no race condition when 5 workers run simultaneously.

### When the limit is hit

1. Worker decrements the counter (reverts the increment)
2. Job is rescheduled to the **next hour window start** (`moveToDelayed`)
3. Job is NOT dropped — order is preserved as much as possible
4. User's Slack channel receives a real notification

### Concurrency

- `WORKER_CONCURRENCY=5` → 5 jobs processed in parallel
- `EMAIL_DELAY_MS=2000` → minimum 2 seconds between any two sends (via BullMQ limiter)
- These two settings are independent: concurrency controls parallelism, limiter controls throughput

### Handling 1000+ emails burst

- 1000 jobs all scheduled for the same time
- With `MAX_EMAILS_PER_HOUR_PER_SENDER=100`, the first 100 send in hour 1
- Remaining 900 are rescheduled to hour 2 (100 each), hour 3, etc.
- No jobs are ever dropped

---

## 📝 Assumptions & Trade-offs

| Decision | Rationale |
|---|---|
| Worker as a separate process | Matches real production patterns; API stays responsive while worker sends |
| JWT in httpOnly cookie | Prevents XSS token theft vs localStorage |
| Elasticsearch disabled gracefully | If ES is down, scheduling still works; search returns 503 |
| Slack notification on each rate limit hit | Could be debounced to prevent notification spam in high-volume scenarios |
| CSV must have 'email' column | Also checks 'Email' and 'EMAIL' for case tolerance |
| No email deduplication within a batch | Same email in CSV twice = two separate scheduled jobs (by design) |
| `removeOnComplete: { count: 100 }` | Keeps last 100 completed jobs visible in Bull Board without unbounded Redis growth |
| Prisma migrations in dev | For production, use `prisma migrate deploy` instead of `migrate dev` |

---

## 🎬 Demo Video Guide (5 min)

1. **(0:00)** Show running services: Docker, backend dev, worker, frontend dev
2. **(0:30)** Google login → dashboard
3. **(1:00)** Compose: upload CSV with 5 emails, set start time 1 min from now, delay 5s, hourly limit 3
4. **(1:30)** Watch Scheduled tab auto-refresh — emails appear
5. **(2:00)** Watch Bull Board — delayed jobs become active → completed
6. **(2:30)** Sent tab — emails with Ethereal preview URLs (click one)
7. **(3:00)** **Restart scenario**: `Ctrl+C` backend + worker → schedule 3 more emails → restart → watch them still send
8. **(4:00)** Rate limit demo: set hourly limit to 2 with 5 emails → 3 get `rate_limited` → Slack notification appears
9. **(4:30)** Elasticsearch search demo
