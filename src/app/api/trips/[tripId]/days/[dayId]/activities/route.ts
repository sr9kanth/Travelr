import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string; dayId: string } }) {
  const activities = await prisma.activity.findMany({
    where: { dayId: params.dayId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest, { params }: { params: { tripId: string; dayId: string } }) {
  const body = await req.json();

  const count = await prisma.activity.count({ where: { dayId: params.dayId } });

  const activity = await prisma.activity.create({
    data: {
      name: body.name,
      type: body.type || 'sightseeing',
      description: body.description || null,
      location: body.location || null,
      address: body.address || null,
      lat: body.lat ? Number(body.lat) : null,
      lng: body.lng ? Number(body.lng) : null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      duration: body.duration ? Number(body.duration) : null,
      cost: body.cost ? Number(body.cost) : null,
      currency: body.currency || 'USD',
      rating: body.rating ? Number(body.rating) : null,
      bookingUrl: body.bookingUrl || null,
      notes: body.notes || null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      imageUrl: body.imageUrl || null,
      timeOfDay: body.timeOfDay || 'morning',
      order: body.order ?? count,
      dayId: params.dayId,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
