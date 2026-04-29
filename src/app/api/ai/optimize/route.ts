import { NextRequest, NextResponse } from 'next/server';
import { optimizeItinerary } from '@/lib/ai';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const optimizedOrder = await optimizeItinerary({
      activities: body.activities,
      pace: body.pace || 'moderate',
    });

    if (body.apply && body.dayId) {
      await Promise.all(
        optimizedOrder.map((id: string, index: number) =>
          prisma.activity.update({ where: { id }, data: { order: index } })
        )
      );
    }

    return NextResponse.json({ optimizedOrder });
  } catch (error) {
    console.error('AI optimize error:', error);
    return NextResponse.json({ error: 'Failed to optimize' }, { status: 500 });
  }
}
