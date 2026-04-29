import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: {
      days: { include: { activities: { orderBy: { order: 'asc' } } }, orderBy: { date: 'asc' } },
      stays: { orderBy: { checkIn: 'asc' } },
      transports: { orderBy: { departureTime: 'asc' } },
      user: true,
    },
  });
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(trip);
}

export async function PATCH(req: NextRequest, { params }: { params: { tripId: string } }) {
  const body = await req.json();
  const trip = await prisma.trip.update({
    where: { id: params.tripId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.budget !== undefined && { budget: body.budget ? Number(body.budget) : null }),
      ...(body.currency && { currency: body.currency }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.status && { status: body.status }),
    },
    include: {
      days: { include: { activities: { orderBy: { order: 'asc' } } }, orderBy: { date: 'asc' } },
      stays: true,
      transports: true,
    },
  });
  return NextResponse.json(trip);
}

export async function DELETE(_: NextRequest, { params }: { params: { tripId: string } }) {
  await prisma.trip.delete({ where: { id: params.tripId } });
  return NextResponse.json({ success: true });
}
