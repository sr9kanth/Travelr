import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { transportId: string } }) {
  const body = await req.json();
  const transport = await prisma.transport.update({
    where: { id: params.transportId },
    data: {
      ...(body.type !== undefined && { type: body.type }),
      ...(body.fromLocation !== undefined && { fromLocation: body.fromLocation }),
      ...(body.toLocation !== undefined && { toLocation: body.toLocation }),
      ...(body.departureTime !== undefined && { departureTime: new Date(body.departureTime) }),
      ...(body.arrivalTime !== undefined && { arrivalTime: new Date(body.arrivalTime) }),
      ...(body.carrier !== undefined && { carrier: body.carrier }),
      ...(body.bookingRef !== undefined && { bookingRef: body.bookingRef }),
      ...(body.cost !== undefined && { cost: body.cost ? Number(body.cost) : null }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(transport);
}

export async function DELETE(_: NextRequest, { params }: { params: { transportId: string } }) {
  await prisma.transport.delete({ where: { id: params.transportId } });
  return NextResponse.json({ success: true });
}
