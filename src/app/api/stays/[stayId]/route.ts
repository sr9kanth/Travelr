import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { stayId: string } }) {
  const body = await req.json();
  const stay = await prisma.stay.update({
    where: { id: params.stayId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.lat !== undefined && { lat: body.lat ? Number(body.lat) : null }),
      ...(body.lng !== undefined && { lng: body.lng ? Number(body.lng) : null }),
      ...(body.checkIn !== undefined && { checkIn: new Date(body.checkIn) }),
      ...(body.checkOut !== undefined && { checkOut: new Date(body.checkOut) }),
      ...(body.bookingRef !== undefined && { bookingRef: body.bookingRef }),
      ...(body.bookingUrl !== undefined && { bookingUrl: body.bookingUrl }),
      ...(body.cost !== undefined && { cost: body.cost ? Number(body.cost) : null }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
    },
  });
  return NextResponse.json(stay);
}

export async function DELETE(_: NextRequest, { params }: { params: { stayId: string } }) {
  await prisma.stay.delete({ where: { id: params.stayId } });
  return NextResponse.json({ success: true });
}
