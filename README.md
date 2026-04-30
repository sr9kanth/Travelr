# ✈️ Travelr — AI-Powered Trip Planning

A modern, full-stack travel planning app combining structured itinerary planning (like Notion), spatial awareness (like Google Maps), and intelligent recommendations (like an AI travel agent).

## Features

- **AI Itinerary Generator** — Claude AI creates complete day-by-day itineraries from your preferences
- **Day-by-Day Planner** — Drag-and-drop activities, organized by Morning/Afternoon/Evening/Night
- **Interactive Maps** — Leaflet maps with activity markers, clustering, and route visualization
- **Explore Nearby (AI)** — Real-time AI suggestions for nearby activities based on location & time
- **Smart Route Optimizer** — AI reorders activities to minimize travel and maximize exploration
- **Stays & Transport** — Track hotels, flights, trains with full booking info
- **Trip Dashboard** — Stats, timeline, and map overview for each trip

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL via [Neon](https://neon.tech) + Prisma ORM
- **Maps**: Leaflet + OpenStreetMap (no API key needed)
- **AI**: Claude API (optional — falls back to mock data)
- **Drag & Drop**: @dnd-kit/core
- **Hosting**: [Vercel](https://vercel.com)

---

## 🚀 Deploy to Vercel (recommended)

### 1. Set up Neon Postgres (free)

1. Go to [neon.tech](https://neon.tech) → **Sign up free**
2. Create a new project — name it `travelr`
3. From the dashboard, open **Connection Details**
4. Copy both connection strings:
   - **Pooled connection** → use as `DATABASE_URL` (has `pgbouncer=true`)
   - **Direct connection** → use as `DIRECT_URL` (no pgbouncer)

### 2. Deploy to Vercel

```bash
# Option A — Vercel CLI
npm i -g vercel
vercel

# Option B — GitHub import
# Push this repo to GitHub, then go to vercel.com/new and import it
```

### 3. Add environment variables in Vercel dashboard

Go to your project → **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com) (optional) |

### 4. Run migrations & seed

After your first deploy, run these once from your local machine with the Neon URLs in `.env.local`:

```bash
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

That's it — Vercel redeploys automatically on every `git push`.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.local.example .env.local

# 3. Push schema to your database
npx prisma db push

# 4. Seed demo data (Paris & Amsterdam + Tokyo trips)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Local tip:** For quick local dev without Postgres, temporarily switch `schema.prisma` to `provider = "sqlite"` and use `DATABASE_URL="file:./dev.db"`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/               # REST API (trips, activities, stays, transport, AI)
│   ├── trips/             # Trip pages (list, new, [tripId]/*)
│   └── page.tsx           # Landing dashboard
├── components/            # React components
│   ├── activities/        # ActivityCard, ActivityForm
│   ├── ai/                # AIPanel, SuggestionCard
│   ├── layout/            # Sidebar, TripNav
│   ├── map/               # MapView (Leaflet)
│   ├── trips/             # TripCard
│   └── ui/                # Button, Input, Modal, Badge
├── lib/                   # db.ts, ai.ts, utils.ts
├── types/                 # TypeScript types
└── prisma/                # Schema + seed data
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (pooled for Vercel) |
| `DIRECT_URL` | ✅ on Vercel | Postgres direct connection (for migrations) |
| `ANTHROPIC_API_KEY` | Optional | Enables real AI generation (mock data used without it) |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployed URL |
