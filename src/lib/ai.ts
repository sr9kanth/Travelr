import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import type { AISuggestion } from '@/types';

// ── Provider types ────────────────────────────────────────────────────────────
export type AIProvider = 'anthropic' | 'gemini' | 'groq' | 'moonshot' | 'mock';

export interface ProviderStatus {
  id: AIProvider;
  name: string;
  model: string;
  available: boolean;
  hasKey: boolean;
  rateLimited: boolean;
  free: boolean;
  description: string;
}

// ── Key detection (server-side only) ─────────────────────────────────────────
export function getProviderStatuses(): ProviderStatus[] {
  return [
    {
      id: 'anthropic',
      name: 'Claude',
      model: 'claude-opus-4-5',
      hasKey: !!process.env.ANTHROPIC_API_KEY,
      available: !!process.env.ANTHROPIC_API_KEY,
      rateLimited: false,
      free: false,
      description: 'Best quality itineraries',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      model: 'gemini-1.5-flash',
      hasKey: !!process.env.GEMINI_API_KEY,
      available: !!process.env.GEMINI_API_KEY,
      rateLimited: false,
      free: true,
      description: 'Free tier available',
    },
    {
      id: 'groq',
      name: 'Groq',
      model: 'llama-3.3-70b-versatile',
      hasKey: !!process.env.GROQ_API_KEY,
      available: !!process.env.GROQ_API_KEY,
      rateLimited: false,
      free: true,
      description: 'Fast & free tier',
    },
    {
      id: 'moonshot',
      name: 'Kimi (Moonshot)',
      model: 'moonshot-v1-32k',
      hasKey: !!process.env.MOONSHOT_API_KEY,
      available: !!process.env.MOONSHOT_API_KEY,
      rateLimited: false,
      free: false,
      description: 'Long context, multilingual',
    },
    {
      id: 'mock',
      name: 'Demo',
      model: 'mock',
      hasKey: true,
      available: true,
      rateLimited: false,
      free: true,
      description: 'Sample data, no key needed',
    },
  ];
}

export function getDefaultProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.MOONSHOT_API_KEY) return 'moonshot';
  return 'mock';
}

// ── Error classification ──────────────────────────────────────────────────────
export class AIError extends Error {
  constructor(
    message: string,
    public code: 'rate_limited' | 'no_key' | 'model_error' | 'unknown',
    public provider: AIProvider,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

function classifyError(err: unknown, provider: AIProvider): AIError {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;
  if (status === 429 || msg.includes('rate') || msg.includes('quota') || msg.includes('limit')) {
    return new AIError('Rate limited', 'rate_limited', provider);
  }
  if (status === 401 || msg.includes('key') || msg.includes('auth') || msg.includes('permission')) {
    return new AIError('Invalid or missing API key', 'no_key', provider);
  }
  return new AIError(msg, 'unknown', provider);
}

// ── Moonshot (OpenAI-compatible) ──────────────────────────────────────────────
async function askMoonshot(prompt: string, maxTokens: number): Promise<string> {
  if (!process.env.MOONSHOT_API_KEY) throw new AIError('No API key', 'no_key', 'moonshot');
  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-32k',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw classifyError({ status: res.status, message: err?.error?.message ?? res.statusText }, 'moonshot');
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? '';
}

// ── Shared AI call ────────────────────────────────────────────────────────────
async function ask(prompt: string, provider: AIProvider, maxTokens = 4096): Promise<string> {
  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) throw new AIError('No API key', 'no_key', 'anthropic');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    try {
      const msg = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });
      return msg.content[0].type === 'text' ? msg.content[0].text : '';
    } catch (err) { throw classifyError(err, 'anthropic'); }
  }

  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) throw new AIError('No API key', 'no_key', 'gemini');
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) { throw classifyError(err, 'gemini'); }
  }

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) throw new AIError('No API key', 'no_key', 'groq');
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content ?? '';
    } catch (err) { throw classifyError(err, 'groq'); }
  }

  if (provider === 'moonshot') {
    try {
      return await askMoonshot(prompt, maxTokens);
    } catch (err) {
      if (err instanceof AIError) throw err;
      throw classifyError(err, 'moonshot');
    }
  }

  return '';
}

function extractJSON(text: string, type: 'object' | 'array'): string | null {
  // Strip markdown code fences first
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '');

  const open = type === 'object' ? '{' : '[';
  const close = type === 'object' ? '}' : ']';

  const start = stripped.indexOf(open);
  if (start === -1) return null;

  // Walk to find the balanced closing bracket, tolerating truncation
  let depth = 0;
  let end = -1;
  for (let i = start; i < stripped.length; i++) {
    if (stripped[i] === open) depth++;
    else if (stripped[i] === close) {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (end !== -1) return stripped.slice(start, end + 1);

  // Truncated JSON: attempt to close all open brackets/braces
  let partial = stripped.slice(start);
  // Remove trailing comma if any
  partial = partial.replace(/,\s*$/, '');

  const stack: string[] = [];
  const pairs: Record<string, string> = { '{': '}', '[': ']' };
  const closes = new Set(['}', ']']);
  for (const ch of partial) {
    if (ch === '{' || ch === '[') stack.push(pairs[ch]);
    else if (closes.has(ch)) stack.pop();
  }
  return partial + stack.reverse().join('');
}

// ── Itinerary Generator ───────────────────────────────────────────────────────
export async function generateItinerary(
  params: {
    destinations?: string[];
    startDate?: string;
    endDate?: string;
    budget?: string;
    style?: string;
    interests?: string[];
    countryDays?: Array<{ country: string; days: number }>;
    freePrompt?: string;
  },
  provider: AIProvider = getDefaultProvider(),
) {
  const freeTextMode = !!params.freePrompt && (!params.destinations || params.destinations.length === 0);

  // Compute totalDays only when we have valid dates
  let totalDays = 7;
  if (params.startDate && params.endDate) {
    const start = new Date(params.startDate).getTime();
    const end = new Date(params.endDate).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
    }
  } else if (params.countryDays && params.countryDays.length > 0) {
    totalDays = params.countryDays.reduce((s, c) => s + c.days, 0);
  }

  if (provider === 'mock') {
    return getMockItinerary({
      destinations: params.destinations?.length ? params.destinations : ['Your Destination'],
      style: params.style ?? 'Moderate',
      totalDays,
    });
  }

  const countryBreakdown = params.countryDays && params.countryDays.length > 1
    ? `\nCountry breakdown:\n${params.countryDays.map((c) => `- ${c.country}: ${c.days} days`).join('\n')}`
    : '';

  // Scale max_tokens with trip length — long trips need more output room
  // Groq llama-3.3-70b supports up to 32k output; Gemini 1.5 flash supports 8k default
  const maxTokens = Math.min(32000, Math.max(8000, totalDays * 600));

  const activitySchema = `{
          "name": "Specific real place name",
          "type": "food|sightseeing|culture|nature|shopping|experience|hidden_gem",
          "description": "2-3 sentence description with what makes it special",
          "location": "Neighbourhood/district name",
          "address": "Full street address",
          "lat": 0.000000,
          "lng": 0.000000,
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120,
          "cost": 25,
          "timeOfDay": "morning|afternoon|evening|night",
          "rating": 4.5,
          "tags": ["tag1", "tag2"],
          "bookingUrl": null
        }`;

  const jsonSchema = `{
  "title": "Descriptive trip title",
  "description": "2-3 sentence overview of the whole trip",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Specific day theme e.g. 'Gothic Quarter & Barceloneta Beach'",
      "activities": [
        ${activitySchema},
        ${activitySchema},
        ${activitySchema}
      ]
    }
  ],
  "suggestedStays": [
    { "name": "Hotel name", "type": "hotel|hostel|airbnb|resort", "address": "Full address", "lat": 0.0, "lng": 0.0, "cost": 150, "notes": "Why to stay here" }
  ],
  "suggestedTransport": [
    { "type": "flight|train|bus|ferry", "fromLocation": "Origin city", "toLocation": "Destination city", "notes": "Duration, cost estimate, booking tips" }
  ]
}`;

  const qualityRules = `Rules for quality:
- Use REAL place names with accurate GPS coordinates — no generic "City Museum" or "Local Restaurant"
- Each day must have 3-4 activities spread across morning, afternoon and evening
- Vary activity types each day (don't repeat food-food-food or sightseeing-sightseeing)
- Write descriptions that are specific and enticing, not generic
- Include hidden gems and local favourites, not just tourist hotspots
- Costs should be realistic for the destination
- Return ONLY valid JSON. No markdown fences, no extra text.`;

  const prompt = freeTextMode
    ? `You are an expert travel planner. Plan a complete trip based on the traveller's request.

Traveller's request: ${params.freePrompt}

Extract all details (destinations, dates, duration, budget, style) from the request above.
Generate a complete day-by-day itinerary covering EVERY day of the trip mentioned.

${qualityRules}

Return this JSON structure:
${jsonSchema}`
    : `You are an expert travel planner. Create a detailed day-by-day itinerary.

Destinations: ${(params.destinations ?? []).join(', ')}
${params.startDate ? `Dates: ${params.startDate} to ${params.endDate}` : ''}
Total days: ${totalDays} — you MUST include exactly ${totalDays} entries in the "days" array${countryBreakdown}
Budget: ${params.budget ?? 'moderate'}
Travel Style: ${params.style ?? 'Moderate'}
Interests: ${(params.interests ?? []).join(', ')}${params.freePrompt ? `\nExtra instructions: ${params.freePrompt}` : ''}

${qualityRules}

Return this JSON structure:
${jsonSchema}`;

  try {
    const text = await ask(prompt, provider, maxTokens);
    const json = extractJSON(text, 'object');
    if (!json) throw new Error('No JSON found in response');
    const parsed = JSON.parse(json);
    // Validate we got actual days
    if (!parsed.days || parsed.days.length === 0) throw new Error('Empty days array');
    return parsed;
  } catch (err) {
    if (err instanceof AIError) throw err;
    // Surface parse errors so the user sees them rather than silent mock fallback
    const msg = err instanceof Error ? err.message : String(err);
    throw new AIError(`Failed to parse AI response: ${msg}`, 'model_error', provider);
  }
}

// ── Nearby Activity Suggestions ───────────────────────────────────────────────
export async function getNearbyActivities(
  params: {
    lat: number;
    lng: number;
    location: string;
    timeOfDay: string;
    availableMinutes: number;
    existingActivities: string[];
    radius: number;
    interests?: string[];
  },
  provider: AIProvider = getDefaultProvider(),
): Promise<AISuggestion[]> {
  if (provider === 'mock') return getMockSuggestions(params);

  const prompt = `You are a local travel expert. Suggest nearby activities.

Current location: ${params.location} (${params.lat}, ${params.lng})
Time of day: ${params.timeOfDay}
Available time: ${params.availableMinutes} minutes
Radius: ${params.radius} km
Avoid: ${params.existingActivities.join(', ')}
User interests: ${(params.interests || []).join(', ')}

Return a JSON array of exactly 6 suggestions:
[
  {
    "id": "unique-id-1",
    "name": "Place name",
    "type": "food|sightseeing|culture|nature|shopping|experience|hidden_gem",
    "description": "Brief description",
    "location": "Area name",
    "address": "Full address",
    "lat": 0.0,
    "lng": 0.0,
    "duration": 60,
    "cost": 15,
    "rating": 4.5,
    "distance": 0.5,
    "distanceText": "500m walk",
    "timeText": "6 min walk",
    "reason": "Why this is great right now",
    "tags": ["tag1", "tag2"]
  }
]

Focus on: walkable distance, open at this time, variety, hidden gems. Return ONLY a valid JSON array.`;

  try {
    const text = await ask(prompt, provider, 2048);
    const json = extractJSON(text, 'array');
    if (json) return JSON.parse(json);
    return getMockSuggestions(params);
  } catch (err) {
    if (err instanceof AIError) throw err;
    return getMockSuggestions(params);
  }
}

// ── Route Optimizer ───────────────────────────────────────────────────────────
export async function optimizeItinerary(
  params: {
    activities: Array<{ id: string; name: string; lat?: number | null; lng?: number | null; duration?: number | null; timeOfDay: string; type: string }>;
    pace: 'relaxed' | 'moderate' | 'packed';
  },
  provider: AIProvider = getDefaultProvider(),
) {
  if (provider === 'mock') return params.activities.map((a) => a.id);

  const prompt = `You are a route optimization expert. Reorder these activities for the optimal route.

Activities: ${JSON.stringify(params.activities, null, 2)}
Pace: ${params.pace}

Rules:
- Cluster geographically nearby activities together
- Logical time-of-day flow (morning → afternoon → evening)
- Minimize travel distance between consecutive stops

Return ONLY a JSON array of activity IDs in optimized order: ["id1", "id2", "id3"]`;

  try {
    const text = await ask(prompt, provider, 512);
    const json = extractJSON(text, 'array');
    if (json) return JSON.parse(json);
    return params.activities.map((a) => a.id);
  } catch (err) {
    if (err instanceof AIError) throw err;
    return params.activities.map((a) => a.id);
  }
}

// ── Mock fallbacks ────────────────────────────────────────────────────────────
const MOCK_THEMES = [
  'Arrival & First Impressions', 'City Highlights', 'Culture & History', 'Food & Markets',
  'Day Trip & Nature', 'Hidden Gems', 'Art & Architecture', 'Local Neighbourhood Walk',
  'Museums & Galleries', 'Outdoor Adventures', 'Shopping & Souvenirs', 'Sunset & Evening Out',
  'Beach & Relaxation', 'Street Food & Night Markets', 'Departure Day',
];

const MOCK_ACTIVITIES = [
  { name: 'City Centre Walk', type: 'sightseeing', timeOfDay: 'morning', startTime: '09:00', endTime: '11:00', duration: 120, cost: 0, rating: 4.5, tags: ['walk', 'explore'] },
  { name: 'Historic Old Town', type: 'culture', timeOfDay: 'morning', startTime: '10:00', endTime: '12:00', duration: 120, cost: 5, rating: 4.6, tags: ['history', 'culture'] },
  { name: 'Local Market', type: 'shopping', timeOfDay: 'morning', startTime: '09:30', endTime: '11:00', duration: 90, cost: 20, rating: 4.4, tags: ['market', 'local'] },
  { name: 'Museum Visit', type: 'culture', timeOfDay: 'afternoon', startTime: '13:00', endTime: '15:30', duration: 150, cost: 15, rating: 4.7, tags: ['museum', 'art'] },
  { name: 'Viewpoint Hike', type: 'nature', timeOfDay: 'afternoon', startTime: '14:00', endTime: '16:30', duration: 150, cost: 0, rating: 4.8, tags: ['hike', 'views'] },
  { name: 'Café & Coffee', type: 'food', timeOfDay: 'afternoon', startTime: '15:00', endTime: '16:00', duration: 60, cost: 10, rating: 4.5, tags: ['coffee', 'relax'] },
  { name: 'Welcome Dinner', type: 'food', timeOfDay: 'evening', startTime: '19:00', endTime: '21:00', duration: 120, cost: 50, rating: 4.3, tags: ['dinner', 'local'] },
  { name: 'Rooftop Bar', type: 'experience', timeOfDay: 'evening', startTime: '20:00', endTime: '22:00', duration: 120, cost: 30, rating: 4.6, tags: ['drinks', 'views'] },
  { name: 'Street Food Tour', type: 'food', timeOfDay: 'evening', startTime: '18:30', endTime: '20:30', duration: 120, cost: 25, rating: 4.5, tags: ['food', 'street'] },
];

function getMockItinerary(params: { destinations: string[]; style: string; totalDays: number }) {
  const dest = params.destinations[0] || 'Paris';
  const totalDays = Math.min(params.totalDays, 30);

  const days = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const themeIdx = i % MOCK_THEMES.length;
    const morningAct = MOCK_ACTIVITIES[(i * 2) % MOCK_ACTIVITIES.length];
    const eveningAct = MOCK_ACTIVITIES[(i * 2 + 1) % MOCK_ACTIVITIES.length];
    const baseLat = 48.8566 + (i * 0.003);
    const baseLng = 2.3522 + (i * 0.002);

    return {
      dayNumber: dayNum,
      theme: dayNum === 1 ? 'Arrival & First Impressions' : dayNum === totalDays ? 'Departure Day' : MOCK_THEMES[themeIdx],
      activities: [
        { ...morningAct, name: `${dest} ${morningAct.name}`, description: `Explore ${dest}`, location: 'City Centre', address: `City Centre, ${dest}`, lat: baseLat, lng: baseLng },
        { ...eveningAct, name: eveningAct.name, description: 'Local experience', location: 'Old Town', address: `Old Town, ${dest}`, lat: baseLat - 0.001, lng: baseLng + 0.001 },
      ],
    };
  });

  return {
    title: `${dest} ${totalDays}-Day Adventure`,
    description: `A wonderful ${totalDays}-day trip to ${dest} tailored to your ${params.style} travel style.`,
    days,
    suggestedStays: [{ name: `${dest} Central Hotel`, type: 'hotel', address: `Central District, ${dest}`, lat: 48.8566, lng: 2.3522, cost: 150, notes: 'Great location' }],
    suggestedTransport: [],
  };
}

function getMockSuggestions(params: { lat: number; lng: number; location: string; timeOfDay: string }): AISuggestion[] {
  return [
    { id: 'mock-1', name: 'Local Market', type: 'shopping', description: 'Vibrant local market with fresh produce and crafts', location: params.location, address: `Market St, ${params.location}`, lat: params.lat + 0.003, lng: params.lng + 0.002, duration: 60, cost: 20, rating: 4.4, distance: 0.3, distanceText: '300m walk', timeText: '4 min walk', reason: 'Highly rated local experience, perfect for this time of day', tags: ['market', 'local', 'shopping'] },
    { id: 'mock-2', name: 'Cozy Café', type: 'food', description: 'Artisan coffee and homemade pastries', location: params.location, address: `Café Lane, ${params.location}`, lat: params.lat - 0.002, lng: params.lng + 0.004, duration: 45, cost: 12, rating: 4.6, distance: 0.5, distanceText: '500m walk', timeText: '6 min walk', reason: 'Excellent reviews, great for a break', tags: ['coffee', 'cafe', 'cozy'] },
    { id: 'mock-3', name: 'City Park', type: 'nature', description: 'Beautiful park with gardens and fountains', location: params.location, address: `Park Ave, ${params.location}`, lat: params.lat + 0.005, lng: params.lng - 0.003, duration: 90, cost: 0, rating: 4.5, distance: 0.8, distanceText: '800m walk', timeText: '10 min walk', reason: 'Free, relaxing, and highly recommended', tags: ['park', 'nature', 'free'] },
    { id: 'mock-4', name: 'Hidden Gallery', type: 'hidden_gem', description: 'Small independent art gallery off the beaten path', location: params.location, address: `Arts District, ${params.location}`, lat: params.lat - 0.004, lng: params.lng - 0.005, duration: 60, cost: 8, rating: 4.8, distance: 1.2, distanceText: '1.2km', timeText: '15 min walk', reason: 'Hidden gem with stunning local art', tags: ['art', 'hidden gem', 'culture'] },
    { id: 'mock-5', name: 'Street Food Corner', type: 'food', description: 'Popular street food spot with local delicacies', location: params.location, address: `Food St, ${params.location}`, lat: params.lat + 0.001, lng: params.lng + 0.006, duration: 30, cost: 8, rating: 4.3, distance: 0.2, distanceText: '200m walk', timeText: '3 min walk', reason: 'Quick stop, very close, great local food', tags: ['street food', 'quick', 'local'] },
    { id: 'mock-6', name: 'Historic Church', type: 'sightseeing', description: 'Beautiful historic church with stunning architecture', location: params.location, address: `Church Square, ${params.location}`, lat: params.lat - 0.006, lng: params.lng + 0.001, duration: 45, cost: 0, rating: 4.4, distance: 1.5, distanceText: '1.5km', timeText: '18 min walk', reason: 'Free to enter, remarkable architecture', tags: ['historic', 'architecture', 'free'] },
  ];
}
