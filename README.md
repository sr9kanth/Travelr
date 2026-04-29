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
- **Database**: SQLite via Prisma ORM
- **Maps**: Leaflet + OpenStreetMap (no API key needed)
- **AI**: Claude API (optional — falls back to mock data)
- **Drag & Drop**: @dnd-kit/core
- **State**: Zustand (local) + SWR-style fetch

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up database
DATABASE_URL="file:./dev.db" npx prisma db push

# 3. Seed demo data (Paris & Amsterdam + Tokyo trips)
DATABASE_URL="file:./dev.db" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 4. (Optional) Add Claude API key in .env.local
echo 'ANTHROPIC_API_KEY=your-key-here' >> .env.local

# 5. Run dev server
npm run dev
```

Open http://localhost:3000

## Environment Variables

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=""          # Optional: enables real AI generation
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

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
│   ├── stays/             # Stay components
│   ├── transport/         # Transport components
│   ├── trips/             # TripCard
│   └── ui/                # Button, Input, Modal, Badge
├── lib/                   # db.ts, ai.ts, utils.ts
├── types/                 # TypeScript types
└── prisma/                # Schema + seed data
```

## Demo Data

The seed script creates two complete trips:
- **Paris & Amsterdam Adventure** (7 days, 20+ activities, stays, transport)
- **Tokyo & Kyoto Explorer** (14 days)
