import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string; dayId: string } }) {
  const day = await prisma.day.findUnique({
    where: { id: params.dayId },
    include: { activities: { orderBy: { order: 'asc' } } },
  });
  if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(day);
}

export async function PATCH(req: NextRequest, { params }: { params: { tripId: string; dayId: string } }) {
  const body = await req.json();
  const day = await prisma.day.update({
    where: { id: params.dayId },
    data: { ...(body.notes !== undefined && { notes: body.notes }) },
    include: { activities: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(day);
}
