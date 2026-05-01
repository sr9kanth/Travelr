# Travelr — Design Brief

AI-powered trip planning web app. Built with Next.js 14, Tailwind CSS, Framer Motion.
Live at: https://travelr-plgr.vercel.app

---

## 1. Design Goals

Travelr should feel like a premium travel product — the kind you'd expect from a well-funded startup. The visual language should evoke **wanderlust, clarity, and intelligence**. Users are planning real trips; they need confidence, not clutter.

**Core feelings to design for:**
- Premium but approachable (not corporate, not playful)
- Calm and spacious — travel planning is stressful; the UI should breathe
- Smart — AI-powered product that feels ahead of its time
- Trustworthy — maps, costs, real places — data should feel authoritative

---

## 2. Current Stack & Constraints

- **Framework:** Next.js 14 App Router, React 18, TypeScript
- **Styling:** Tailwind CSS v3 (utility-first, no CSS-in-JS)
- **Animations:** Custom CSS keyframes + Framer Motion available
- **Icons:** Lucide React (stroke icons, consistent weight)
- **Maps:** Leaflet + OpenStreetMap (no Google Maps)
- **Fonts:** Inter (300–900 weight range loaded via Google Fonts)
- **Layout:** Fixed 260px left sidebar + scrollable main content area

---

## 3. Current Design System

### 3.1 Colour Palette

**Brand (Indigo)**
```
brand-50:  #eef2ff   — very light tints, hover states
brand-100: #e0e7ff   — subtle backgrounds
brand-200: #c7d2fe
brand-300: #a5b4fc
brand-400: #818cf8   — icons, accents
brand-500: #6366f1   — primary action colour
brand-600: #4f46e5   — hover on primary
brand-700: #4338ca
brand-800: #3730a3
brand-900: #312e81
```

**Sidebar**
```
Background: linear-gradient(180deg, #0c0f1d 0%, #0f172a 100%)
Active nav item: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(167,139,250,0.1))
Active border: rgba(99,102,241,0.3)
Text: white / slate-400
```

**Content background:** `#f1f5f9` (slate-100)

**Activity type colours** (used for card accents, icons, badges):
```
food:        #f59e0b  — amber
sightseeing: #6366f1  — indigo
culture:     #8b5cf6  — violet
nature:      #10b981  — emerald
shopping:    #ec4899  — pink
experience:  #06b6d4  — cyan
transport:   #64748b  — slate
nightlife:   #a855f7  — purple
sport:       #14b8a6  — teal
wellness:    #84cc16  — lime
hidden_gem:  #f43f5e  — rose
```

**AI provider colours:**
```
Claude (Anthropic): #d97706  — amber
Gemini:             #4285f4  — Google blue
Groq:               #10b981  — emerald
Kimi (Moonshot):    #6366f1  — indigo
Demo:               #8b5cf6  — violet
```

### 3.2 Typography

All text uses **Inter**. Key scales in use:

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title | 24–32px | 700–800 | `text-2xl font-bold` to `text-3xl font-bold` |
| Section heading | 18–20px | 700 | |
| Card title | 14px | 600–700 | `text-sm font-semibold` |
| Body | 14px | 400 | `text-sm` |
| Meta / label | 11–12px | 400–500 | `text-xs` |
| Micro / badge | 10px | 500–600 | `text-[10px] font-semibold` |
| Monospace (model names) | 10px | 400 | `font-mono` |

### 3.3 Spacing & Radius

- **Sidebar width:** 260px fixed
- **Content padding:** 32px (`p-8`)
- **Card padding:** 24–32px (`p-6` to `p-8`)
- **Border radius:** 
  - Cards / modals: 16px (`rounded-2xl`)
  - Buttons: 12px (`rounded-xl`)
  - Chips/badges: 999px (`rounded-full`)
  - Small elements: 8px (`rounded-lg`)

### 3.4 Shadows

```css
card-default:  0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)
card-hover:    0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)
card-elevated: 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)
dropdown:      0 20px 40px rgba(0,0,0,0.15)
glow-brand:    0 0 24px rgba(99,102,241,0.35)
```

### 3.5 Animations

```css
fade-in:  0.4s ease
slide-up: 0.35s cubic-bezier(0.16,1,0.3,1)   — spring-like
scale-in: 0.3s cubic-bezier(0.16,1,0.3,1)    — dropdowns, modals
float:    3s ease-in-out infinite              — hero elements
```

Card hover transforms:
- Trip card: `translateY(-6px)`
- Activity card: `translateX(3px)`
- Button: `scale(0.98)` on active

---

## 4. Component Inventory

### 4.1 Sidebar
- **Fixed left, full height, 260px wide**
- Deep dark gradient background (#0c0f1d → #0f172a)
- Radial glow behind logo (indigo, 20% opacity)
- Logo: gradient pill (indigo→violet) with ✈️ emoji
- Nav items: icon + label, active state has glass gradient background + right chevron
- "New Trip" CTA: full-width gradient pill (indigo→violet) with "AI" badge
- **AI Model Picker** at bottom of nav — dropdown via portal (fixed position to escape overflow)
- User row at very bottom with avatar + name + settings icon

**Current issues:**
- No visual hierarchy between nav sections
- AI picker feels cramped in the nav
- No trip count or quick stats anywhere in sidebar
- No way to collapse sidebar on smaller screens

### 4.2 Trip Card (Dashboard)
- **Size:** Variable width grid, fixed 48px tall cover image area
- Cover image with `scale(1.1)` zoom on hover (700ms transition)
- Gradient overlay: `from-black/70 via-black/20 to-transparent`
- Status badge: amber (Planning), emerald with pulse (Active), slate (Completed)
- Duration badge bottom-left (calendar icon + N days)
- Hover arrow bottom-right (fade + slide up)
- Delete button: top-right, hidden until hover, red on hover
- Activity density mini bar chart: coloured bars per day

**Current issues:**
- Cover images are always the same 3 Unsplash URLs rotated by name length
- No destination city shown on card
- Budget display uses DollarSign icon but number format is inconsistent
- Mini bar chart is barely visible at 1.5px wide

### 4.3 Activity Card
- Top 2px colour accent bar (colour from activity type)
- Drag handle (GripVertical, hidden until hover... actually always visible)
- Activity type emoji icon in gradient rounded square
- Title + location line
- Meta chips: time/duration, cost (colour-tinted), rating (amber)
- Actions row (booking URL, edit, delete, expand) — hidden until hover
- Expanded state: description, address, notes, tags, "Explore Nearby" button

**Current issues:**
- Drag handle is always visible and adds visual noise
- Expand/collapse only accessible via actions row (hidden until hover — discoverability problem)
- No visual indication the card is expandable
- Colour accent bar is only 2px tall — barely noticeable

### 4.4 AI Suggestion Card
- Same pattern as Activity Card
- Top colour bar, emoji icon, title, description
- Distance / duration / rating / cost chips
- "AI reason" box — gradient tinted background, Sparkles icon
- Tags row
- "Add to Itinerary" gradient button

**Current issues:**
- Very similar layout to Activity Card — could be distinguished more
- "Add" button is full width — wastes space when cards are narrow
- No skeleton/loading state

### 4.5 AI Panel (Explore Nearby)
- Slides in as right panel in planner view
- Header with Sparkles icon + title
- "Near:" context strip showing current activity
- Radius selector buttons (500m / 1km / 2km / 5km)
- Empty state → loading spinner → suggestion card list
- Rate limit error banner (amber)

**Current issues:**
- No animation on open/close
- Empty state illustration is just a large Sparkles icon — not very inspiring
- Radius selector has no visual feedback on selection beyond bg-brand-500
- Refresh button is small and easy to miss

### 4.6 AI Provider Picker
- Compact button showing active provider (icon + name + model)
- Opens portal dropdown upward showing all 5 providers
- Status badges: "Free" (emerald), "Pro" (blue), "No key" (slate), "Rate limited" (amber)
- Disabled state (opacity-40) for providers without keys
- Selected state: tinted background + colour outline + check mark

**Current issues:**
- No keyboard navigation
- No tooltip explaining what each model is good for
- "Rate limited" state requires a failed request to appear — no proactive warning

### 4.7 New Trip Form (AI mode)
- Two-tab toggle: "Describe in words" / "Country by country"
- **Free-text mode:** Large textarea for natural language trip description
- **Structured mode:** Country + days stepper rows + Nominatim place autocomplete + start date
- "Budget, style & interests" hidden in accordion
- Error banner (red)
- Submit button with dynamic label

**Current issues:**
- Accordion is closed by default — users may miss budget/style options
- No progress indicator during generation (can take 30–60s for long trips)
- No examples or prompts to help users write good descriptions
- Structured mode: the + / - stepper buttons are small (24px) and hard to tap

### 4.8 Planner Page
- Day sections with Day N badge + date header + activity count
- Time-of-day group headers (🌅 Morning, ☀️ Afternoon, 🌆 Evening)
- Coloured horizontal rule per time group (colour from first activity's type)
- DnD reorder within day and across days
- "Add activity" dotted row at bottom of each day
- AI Panel toggle (Sparkles button)
- "Optimize route" button per day

**Current issues:**
- No visual progress / completion feel (no checkboxes)
- Day header doesn't collapse to save space on long trips
- "Add activity" CTA is too subtle — dashed border on white bg
- No day-by-day summary stats (total cost, total time)

---

## 5. Screen Inventory

| Screen | Route | Status |
|---|---|---|
| Landing / Hero | `/` | ✅ Animated gradient hero, feature grid, testimonials |
| Trip Dashboard | `/trips` | ✅ Card grid + New Trip CTA |
| New Trip | `/trips/new` | ✅ AI + Manual modes |
| Trip Overview | `/trips/[id]` | ✅ Stats, cover, quick nav |
| Day Planner | `/trips/[id]/planner` | ✅ DnD, time groups, AI panel |
| Map View | `/trips/[id]/map` | ✅ Leaflet, emoji markers, popups |
| Stays | `/trips/[id]/stays` | ✅ Hotel cards, cost |
| Transport | `/trips/[id]/transport` | ✅ Leg cards, icons |

---

## 6. Key Design Problems to Solve

### P1 — Generation takes too long with no feedback
Long trips (15–25 days) take 20–60 seconds. The only feedback is a loading spinner on the button. Users don't know if it's working.

**Suggested approach:** Streaming progress UI — show "Generating day 3 of 25…" or an animated progress bar with status text phases: "Planning route → Finding activities → Optimising schedule → Done".

### P2 — Planner feels like a list, not a visual plan
The day-by-day planner is functional but reads like a to-do list. There's no sense of time, geography, or journey flow.

**Suggested approach:**
- Timeline view option alongside list view
- Mini map thumbnail per day showing activity pins
- Daily total cost + duration summary header
- Collapsible days to scan the whole trip at once

### P3 — Trip cards lack destination context
Cards show trip name, date range, and activity count. No destination city, no map preview, no estimated cost.

**Suggested approach:** Show primary destination prominently (large text or flag emoji), add estimated total budget, optionally a tiny static map preview.

### P4 — No empty states are designed
When a trip has no activities, or the AI panel has no suggestions, the UI just shows a generic icon. These moments are opportunities for delight.

**Suggested approach:** Illustrated empty states per context — e.g. "Your itinerary is empty — generate with AI or add manually" with a visual that fits the travel theme.

### P5 — Mobile is completely broken
The layout is desktop-only (fixed 260px sidebar + `ml-[260px]` main). No responsive breakpoints exist.

**Suggested approach:** Collapsible sidebar on mobile (slide-out drawer), stacked layout for planner, bottom tab navigation.

### P6 — No dark mode
The sidebar is dark but the content area is always light. There is a `glass-dark` CSS class defined but unused on content.

---

## 7. Design Tokens (Tailwind config excerpt)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50:  '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',  // primary
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    animation: {
      'fade-in':  'fadeIn 0.4s ease both',
      'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
      'slide-in': 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
      'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      'float':    'float 3s ease-in-out infinite',
    },
  },
}
```

---

## 8. Suggested Design Directions

### Option A — "Calm Premium" (refinement of current)
Keep the indigo/violet palette but increase whitespace dramatically. Larger type, more breathing room, fewer borders. Think Linear or Notion. Subtle micro-interactions replace bold gradients.

### Option B — "Travel Warmth"
Shift brand accent from indigo to a warm amber/terracotta. Add earth tones (sand, rust) for category colours. More photographic — let destination cover images dominate. Think Airbnb meets Google Travel.

### Option C — "Dark Mode First"
Lean into the dark sidebar. Make the planner dark by default with subtle coloured glows per day. Stars/constellation motifs in empty states. Premium and distinctive — like a luxury travel concierge tool.

---

## 9. Assets & Resources

- **Current icon library:** Lucide React — https://lucide.dev
- **Current font:** Inter — https://rsms.me/inter
- **Map tiles:** OpenStreetMap (Leaflet) — free, no API key
- **Cover images:** Unsplash (currently 3 hardcoded URLs)
- **Suggested illustration style:** Line art or flat geometric (Blush / unDraw)
- **Suggested design tool:** Figma

---

## 10. Component HTML Patterns

### Activity Card (simplified)
```html
<div class="bg-white rounded-xl border border-slate-100 overflow-hidden group">
  <!-- 2px colour accent top bar -->
  <div class="h-0.5 w-full" style="background: linear-gradient(90deg, {color}, {color}80)" />
  <div class="flex items-start gap-2.5 p-3">
    <!-- Drag handle -->
    <button class="p-1 text-slate-200 hover:text-slate-400 cursor-grab">⠿</button>
    <!-- Type icon -->
    <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
         style="background: linear-gradient(135deg, {color}20, {color}10); border: 1px solid {color}20">
      {emoji}
    </div>
    <!-- Content -->
    <div class="flex-1">
      <h4 class="font-semibold text-slate-900 text-sm">{name}</h4>
      <div class="flex items-center gap-1 mt-0.5">
        <MapPin size={10} color={color} />
        <span class="text-[11px] text-slate-400">{location}</span>
      </div>
      <!-- Meta chips -->
      <div class="flex gap-2 mt-2">
        <span class="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">🕒 {time} · {duration}</span>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full" style="background:{color}12; color:{color}">${cost}</span>
        <span class="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">★ {rating}</span>
      </div>
    </div>
    <!-- Hover actions (opacity-0 group-hover:opacity-100) -->
    <div class="opacity-0 group-hover:opacity-100 flex gap-0.5">
      <button>✏️</button>
      <button>🗑️</button>
      <button>⌄</button>
    </div>
  </div>
</div>
```

### Provider Picker Button
```html
<button class="w-full flex items-center gap-2 px-3 py-2 rounded-xl border"
        style="border-color: {color}30; background: {color}08">
  <span>{providerEmoji}</span>
  <div>
    <p class="text-xs font-semibold" style="color:{color}">{providerName}</p>
    <p class="text-[10px] text-slate-400 font-mono">{modelName}</p>
  </div>
  <ChevronDown class="ml-auto" style="color:{color}" />
</button>
```

---

*Generated from codebase on 2026-05-01. Live app: https://travelr-plgr.vercel.app*
