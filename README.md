# FootballPredictor — Phase 1 MVP

A full-stack football prediction platform. Users predict match scores, earn points,
and compete on a leaderboard across the top 5 European leagues.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14, React, Tailwind CSS     |
| Backend      | Node.js, Express, TypeScript        |
| Database     | PostgreSQL + Prisma ORM             |
| Auth         | JWT + bcrypt                        |
| Data source  | API-Football (via RapidAPI)         |
| Deployment   | Vercel (frontend) + Railway (backend) |

---

## Phase 1 Features

- Match listings for Premier League, La Liga, Serie A, Bundesliga, Ligue 1
- Score predictions (submit before kickoff)
- Automatic scoring: 3 pts exact score, 1 pt correct result
- User accounts (register / login)
- Leaderboard ranked by total points
- Team profiles with recent form
- Hourly background sync from API-Football

---

## Quick Start

### 1. Prerequisites

- Node.js 18+ — https://nodejs.org
- PostgreSQL — https://postgresql.org OR use Supabase (free cloud): https://supabase.com
- API-Football key — sign up free at https://rapidapi.com/api-sports/api/api-football

### 2. Clone and install

```bash
git clone <your-repo-url>
cd football-predictor
npm install          # installs root tools
cd frontend && npm install
cd ../backend && npm install
```

### 3. Set up environment variables

**Backend** — copy and fill in:
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and FOOTBALL_API_KEY
```

**Frontend** — copy and fill in:
```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Set up the database

```bash
cd backend
npm run db:generate   # generates Prisma client
npm run db:push       # creates all tables in your database
npm run db:studio     # optional: opens visual database browser
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev
# → Server running at http://localhost:3001

# Terminal 2 — frontend
cd frontend
npm run dev
# → App running at http://localhost:3000
```

### 6. Seed initial data

On first run, trigger a manual data sync to populate matches and teams:

```bash
cd backend
npx ts-node -e "
  require('dotenv').config();
  const { runManualSync } = require('./src/jobs/syncMatches');
  runManualSync().then(() => process.exit(0));
"
```

This fetches all teams and matches for the current season from API-Football.
Free tier allows 100 requests/day — enough to seed all 5 leagues.

---

## API Endpoints

### Auth
| Method | Path                  | Auth? | Description          |
|--------|-----------------------|-------|----------------------|
| POST   | /api/auth/register    | No    | Create account       |
| POST   | /api/auth/login       | No    | Login, returns JWT   |
| GET    | /api/auth/me          | Yes   | Get current user     |

### Matches
| Method | Path                   | Auth? | Description              |
|--------|------------------------|-------|--------------------------|
| GET    | /api/matches           | No    | List matches (filterable)|
| GET    | /api/matches/upcoming  | No    | Next 7 days              |
| GET    | /api/matches/:id       | No    | Single match with stats  |

### Teams
| Method | Path          | Auth? | Description              |
|--------|---------------|-------|--------------------------|
| GET    | /api/teams    | No    | List teams               |
| GET    | /api/teams/:id| No    | Team + recent form       |

### Predictions
| Method | Path                         | Auth? | Description           |
|--------|------------------------------|-------|-----------------------|
| POST   | /api/predictions             | Yes   | Submit prediction     |
| GET    | /api/predictions/mine        | Yes   | My predictions + stats|
| GET    | /api/predictions/leaderboard | Yes   | Top 50 leaderboard    |

---

## Points System

| Result           | Points |
|------------------|--------|
| Exact score      | 3      |
| Correct outcome  | 1      |
| Wrong outcome    | 0      |

---

## Deployment (Phase 1)

### Backend → Railway
1. Create account at https://railway.app
2. New project → Deploy from GitHub
3. Add environment variables (same as your .env)
4. Railway auto-detects Node.js and runs `npm start`

### Frontend → Vercel
1. Create account at https://vercel.com
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app`
5. Deploy

### Database → Railway PostgreSQL
1. In Railway, add a PostgreSQL plugin to your project
2. Copy the `DATABASE_URL` it provides into your backend env vars
3. Run `npm run db:push` against the production database

---

## Phase 2 Roadmap (next)

- [ ] Live score WebSocket updates
- [ ] Individual match stats page with charts
- [ ] ML prediction model (Dixon-Coles)
- [ ] Push notifications for match events
- [ ] 20+ leagues added
- [ ] Mobile app (React Native)
