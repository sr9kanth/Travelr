import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string } }) {
  const stays = await prisma.stay.findMany({
    where: { tripId: params.tripId },
    orderBy: { checkIn: 'asc' },
  });
  return NextResponse.json(stays);
}

export async function POST(req: NextRequest, { params }: { params: { tripId: string } }) {
  const body = await req.json();
  const stay = await prisma.stay.create({
    data: {
      name: body.name,
      type: body.type || 'hotel',
      address: body.address || null,
      lat: body.lat ? Number(body.lat) : null,
      lng: body.lng ? Number(body.lng) : null,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      bookingRef: body.bookingRef || null,
      bookingUrl: body.bookingUrl || null,
      cost: body.cost ? Number(body.cost) : null,
      currency: body.currency || 'USD',
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
      tripId: params.tripId,
    },
  });
  return NextResponse.json(stay, { status: 201 });
}
