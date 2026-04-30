import { NextRequest, NextResponse } from 'next/server';
import { getNearbyActivities, AIError, getDefaultProvider } from '@/lib/ai';
import type { AIProvider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const provider: AIProvider = body.provider ?? getDefaultProvider();

  try {
    const suggestions = await getNearbyActivities({
      lat: body.lat,
      lng: body.lng,
      location: body.location || 'Current Location',
      timeOfDay: body.timeOfDay || 'afternoon',
      availableMinutes: body.availableMinutes || 120,
      existingActivities: body.existingActivities || [],
      radius: body.radius || 2,
      interests: body.interests || [],
    }, provider);

    return NextResponse.json(suggestions);
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code, provider: error.provider },
        { status: error.code === 'rate_limited' ? 429 : 400 },
      );
    }
    console.error('AI suggestions error:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}
