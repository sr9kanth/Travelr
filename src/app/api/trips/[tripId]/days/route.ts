import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string } }) {
  const days = await prisma.day.findMany({
    where: { tripId: params.tripId },
    include: { activities: { orderBy: { order: 'asc' } } },
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(days);
}

export async function POST(req: NextRequest, { params }: { params: { tripId: string } }) {
  const body = await req.json();
  const day = await prisma.day.create({
    data: { date: new Date(body.date), tripId: params.tripId, notes: body.notes },
    include: { activities: true },
  });
  return NextResponse.json(day, { status: 201 });
}
