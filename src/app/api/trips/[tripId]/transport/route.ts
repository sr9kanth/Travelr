import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { tripId: string } }) {
  const transports = await prisma.transport.findMany({
    where: { tripId: params.tripId },
    orderBy: { departureTime: 'asc' },
  });
  return NextResponse.json(transports);
}

export async function POST(req: NextRequest, { params }: { params: { tripId: string } }) {
  const body = await req.json();
  const transport = await prisma.transport.create({
    data: {
      type: body.type || 'flight',
      fromLocation: body.fromLocation,
      toLocation: body.toLocation,
      fromLat: body.fromLat ? Number(body.fromLat) : null,
      fromLng: body.fromLng ? Number(body.fromLng) : null,
      toLat: body.toLat ? Number(body.toLat) : null,
      toLng: body.toLng ? Number(body.toLng) : null,
      departureTime: new Date(body.departureTime),
      arrivalTime: new Date(body.arrivalTime),
      carrier: body.carrier || null,
      bookingRef: body.bookingRef || null,
      bookingUrl: body.bookingUrl || null,
      cost: body.cost ? Number(body.cost) : null,
      currency: body.currency || 'USD',
      notes: body.notes || null,
      tripId: params.tripId,
    },
  });
  return NextResponse.json(transport, { status: 201 });
}
