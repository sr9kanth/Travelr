import Anthropic from '@anthropic-ai/sdk';
import type { ActivityType, AISuggestion } from '@/types';
import { ACTIVITY_ICONS } from './utils';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ── Itinerary Generator ───────────────────────────────────────────────────────
export async function generateItinerary(params: {
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: string;
  style: string;
  interests: string[];
}) {
  const prompt = `You are an expert travel planner. Create a detailed day-by-day itinerary.

Destinations: ${params.destinations.join(', ')}
Dates: ${params.startDate} to ${params.endDate}
Budget: ${params.budget}
Travel Style: ${params.style}
Interests: ${params.interests.join(', ')}

Return a JSON object with this exact structure:
{
  "title": "Trip name",
  "description": "Brief overview",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Day theme",
      "activities": [
        {
          "name": "Activity name",
          "type": "food|sightseeing|culture|nature|shopping|experience|hidden_gem",
          "description": "Description",
          "location": "Area name",
          "address": "Full address",
          "lat": 0.0,
          "lng": 0.0,
          "startTime": "09:00",
          "endTime": "11:00",
          "duration": 120,
          "cost": 25,
          "timeOfDay": "morning|afternoon|evening|night",
          "rating": 4.5,
          "tags": ["tag1", "tag2"],
          "bookingUrl": null
        }
      ]
    }
  ],
  "suggestedStays": [
    {
      "name": "Hotel name",
      "type": "hotel",
      "address": "Address",
      "lat": 0.0,
      "lng": 0.0,
      "cost": 150,
      "notes": "Notes"
    }
  ],
  "suggestedTransport": [
    {
      "type": "flight|train|bus",
      "fromLocation": "From",
      "toLocation": "To",
      "notes": "Details"
    }
  ]
}

Be specific with real places. Include lat/lng coordinates. Return ONLY valid JSON, no markdown.`;

  if (!client) return getMockItinerary(params);

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
}

// ── Nearby Suggestions ────────────────────────────────────────────────────────
export async function getNearbyActivities(params: {
  lat: number;
  lng: number;
  location: string;
  timeOfDay: string;
  availableMinutes: number;
  existingActivities: string[];
  radius: number;
  interests?: string[];
}): Promise<AISuggestion[]> {
  const prompt = `You are a local travel expert. Suggest nearby activities.

Current location: ${params.location} (${params.lat}, ${params.lng})
Time of day: ${params.timeOfDay}
Available time: ${params.availableMinutes} minutes
Radius: ${params.radius} km
Existing activities to avoid: ${params.existingActivities.join(', ')}
User interests: ${(params.interests || []).join(', ')}

Return a JSON array of 6 suggestions:
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
    "reason": "Why this is perfect right now",
    "tags": ["tag1", "tag2"]
  }
]

Focus on: walkability, open at this time of day, variety of types, hidden gems.
Return ONLY valid JSON array, no markdown.`;

  if (!client) return getMockSuggestions(params);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return getMockSuggestions(params);
  } catch {
    return getMockSuggestions(params);
  }
}

// ── Optimizer ─────────────────────────────────────────────────────────────────
export async function optimizeItinerary(params: {
  activities: Array<{ id: string; name: string; lat?: number | null; lng?: number | null; duration?: number | null; timeOfDay: string; type: string }>;
  pace: 'relaxed' | 'moderate' | 'packed';
}) {
  const prompt = `You are a route optimization expert. Reorder these activities for the optimal route.

Activities: ${JSON.stringify(params.activities, null, 2)}
Pace: ${params.pace}

Rules:
- Cluster geographically nearby activities together
- Consider logical time-of-day flow (morning → afternoon → evening)
- Minimize travel distance between consecutive activities
- For "relaxed" pace: max 3 activities
- For "moderate" pace: max 4-5 activities
- For "packed" pace: up to 6-7 activities

Return a JSON array of activity IDs in the optimized order:
["id1", "id2", "id3"]

Return ONLY the JSON array, no markdown.`;

  if (!client) {
    return params.activities.map((a) => a.id);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return params.activities.map((a) => a.id);
  } catch {
    return params.activities.map((a) => a.id);
  }
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
function getMockItinerary(params: { destinations: string[]; startDate: string; endDate: string; budget: string; style: string; interests: string[] }) {
  const dest = params.destinations[0] || 'Paris';
  return {
    title: `${dest} Getaway`,
    description: `A wonderful trip to ${dest} tailored to your ${params.style} travel style.`,
    days: [
      {
        dayNumber: 1,
        theme: `Arrival & First Impressions of ${dest}`,
        activities: [
          { name: `${dest} City Center Walk`, type: 'sightseeing', description: `Explore the heart of ${dest}`, location: 'City Center', address: `City Center, ${dest}`, lat: 48.8566, lng: 2.3522, startTime: '14:00', endTime: '16:00', duration: 120, cost: 0, timeOfDay: 'afternoon', rating: 4.5, tags: ['walk', 'explore'] },
          { name: 'Welcome Dinner', type: 'food', description: 'Local cuisine to kick off the trip', location: 'Old Town', address: `Old Town, ${dest}`, lat: 48.8556, lng: 2.3510, startTime: '19:00', endTime: '21:00', duration: 120, cost: 50, timeOfDay: 'evening', rating: 4.3, tags: ['dinner', 'local'] },
        ],
      },
    ],
    suggestedStays: [
      { name: `${dest} Central Hotel`, type: 'hotel', address: `Central District, ${dest}`, lat: 48.8566, lng: 2.3522, cost: 150, notes: 'Great location' },
    ],
    suggestedTransport: [],
  };
}

function getMockSuggestions(params: { lat: number; lng: number; location: string; timeOfDay: string }): AISuggestion[] {
  const suggestions: AISuggestion[] = [
    { id: 'mock-1', name: 'Local Market', type: 'shopping', description: 'Vibrant local market with fresh produce and crafts', location: params.location, address: `Market St, ${params.location}`, lat: params.lat + 0.003, lng: params.lng + 0.002, duration: 60, cost: 20, rating: 4.4, distance: 0.3, distanceText: '300m walk', timeText: '4 min walk', reason: 'Highly rated local experience, perfect for this time of day', tags: ['market', 'local', 'shopping'] },
    { id: 'mock-2', name: 'Cozy Café', type: 'food', description: 'Artisan coffee and homemade pastries', location: params.location, address: `Café Lane, ${params.location}`, lat: params.lat - 0.002, lng: params.lng + 0.004, duration: 45, cost: 12, rating: 4.6, distance: 0.5, distanceText: '500m walk', timeText: '6 min walk', reason: 'Excellent reviews, great for a break', tags: ['coffee', 'cafe', 'cozy'] },
    { id: 'mock-3', name: 'City Park', type: 'nature', description: 'Beautiful park with gardens and fountains', location: params.location, address: `Park Ave, ${params.location}`, lat: params.lat + 0.005, lng: params.lng - 0.003, duration: 90, cost: 0, rating: 4.5, distance: 0.8, distanceText: '800m walk', timeText: '10 min walk', reason: 'Free, relaxing, and highly recommended', tags: ['park', 'nature', 'free'] },
    { id: 'mock-4', name: 'Hidden Gallery', type: 'hidden_gem', description: 'Small independent art gallery off the beaten path', location: params.location, address: `Arts District, ${params.location}`, lat: params.lat - 0.004, lng: params.lng - 0.005, duration: 60, cost: 8, rating: 4.8, distance: 1.2, distanceText: '1.2km', timeText: '15 min walk', reason: 'Hidden gem with stunning local art', tags: ['art', 'hidden gem', 'culture'] },
    { id: 'mock-5', name: 'Street Food Corner', type: 'food', description: 'Popular street food spot with local delicacies', location: params.location, address: `Food St, ${params.location}`, lat: params.lat + 0.001, lng: params.lng + 0.006, duration: 30, cost: 8, rating: 4.3, distance: 0.2, distanceText: '200m walk', timeText: '3 min walk', reason: 'Quick stop, very close, great local food', tags: ['street food', 'quick', 'local'] },
    { id: 'mock-6', name: 'Historic Church', type: 'sightseeing', description: 'Beautiful historic church with stunning architecture', location: params.location, address: `Church Square, ${params.location}`, lat: params.lat - 0.006, lng: params.lng + 0.001, duration: 45, cost: 0, rating: 4.4, distance: 1.5, distanceText: '1.5km', timeText: '18 min walk', reason: 'Free to enter, remarkable architecture', tags: ['historic', 'architecture', 'free'] },
  ];
  return suggestions;
}
