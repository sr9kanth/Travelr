import { NextRequest, NextResponse } from 'next/server';
import { optimizeItinerary, AIError, getDefaultProvider } from '@/lib/ai';
import { prisma } from '@/lib/db';
import type { AIProvider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const provider: AIProvider = body.provider ?? getDefaultProvider();

  try {
    const optimizedOrder = await optimizeItinerary({
      activities: body.activities,
      pace: body.pace || 'moderate',
    }, provider);

    if (body.apply && body.dayId) {
      await Promise.all(
        optimizedOrder.map((id: string, index: number) =>
          prisma.activity.update({ where: { id }, data: { order: index } })
        )
      );
    }

    return NextResponse.json({ optimizedOrder });
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code, provider: error.provider },
        { status: error.code === 'rate_limited' ? 429 : 400 },
      );
    }
    console.error('AI optimize error:', error);
    return NextResponse.json({ error: 'Failed to optimize' }, { status: 500 });
  }
}
