import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary, AIError, getDefaultProvider } from '@/lib/ai';
import type { AIProvider } from '@/lib/ai';
import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';

const DEMO_USER_EMAIL = 'demo@travelr.app';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const provider: AIProvider = body.provider ?? getDefaultProvider();

  try {
    const result = await generateItinerary({
      destinations: body.destinations ?? [],
      startDate: body.startDate || undefined,
      endDate: body.endDate || undefined,
      budget: body.budget,
      style: body.style,
      interests: body.interests ?? [],
      countryDays: body.countryDays,
      freePrompt: body.freePrompt,
    }, provider);

    if (body.saveToTrip) {
      const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
      if (!user) return NextResponse.json(result);

      // Use provided dates or derive from result days count
      const totalDays: number = result.days?.length ?? 1;
      const start = body.startDate ? new Date(body.startDate) : new Date();
      const end = body.endDate ? new Date(body.endDate) : addDays(start, totalDays - 1);

      const trip = await prisma.trip.create({
        data: {
          name: result.title,
          description: result.description,
          startDate: start,
          endDate: end,
          status: 'planning',
          userId: user.id,
          days: {
            create: (result.days ?? []).map((day: { dayNumber: number; activities: Array<{
              name: string; type: string; description?: string; location?: string;
              address?: string; lat?: number; lng?: number; startTime?: string;
              endTime?: string; duration?: number; cost?: number; timeOfDay?: string;
              rating?: number; bookingUrl?: string; tags?: string[];
            }> }) => ({
              date: addDays(start, day.dayNumber - 1),
              activities: {
                create: (day.activities ?? []).map((act, idx) => ({
                  name: act.name,
                  type: act.type,
                  description: act.description || null,
                  location: act.location || null,
                  address: act.address || null,
                  lat: act.lat || null,
                  lng: act.lng || null,
                  startTime: act.startTime || null,
                  endTime: act.endTime || null,
                  duration: act.duration || null,
                  cost: act.cost || null,
                  timeOfDay: act.timeOfDay || 'morning',
                  rating: act.rating || null,
                  bookingUrl: act.bookingUrl || null,
                  tags: act.tags ? JSON.stringify(act.tags) : null,
                  order: idx,
                })),
              },
            })),
          },
        },
        include: { days: { include: { activities: true } }, stays: true, transports: true },
      });

      return NextResponse.json({ ...result, tripId: trip.id });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code, provider: error.provider },
        { status: error.code === 'rate_limited' ? 429 : 400 },
      );
    }
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}
