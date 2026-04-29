import { NextRequest, NextResponse } from 'next/server';
import { getNearbyActivities } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const body = await req.json();

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
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}
