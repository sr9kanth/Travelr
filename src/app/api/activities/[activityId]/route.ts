import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { activityId: string } }) {
  const body = await req.json();
  const activity = await prisma.activity.update({
    where: { id: params.activityId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.lat !== undefined && { lat: body.lat ? Number(body.lat) : null }),
      ...(body.lng !== undefined && { lng: body.lng ? Number(body.lng) : null }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.duration !== undefined && { duration: body.duration ? Number(body.duration) : null }),
      ...(body.cost !== undefined && { cost: body.cost ? Number(body.cost) : null }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.rating !== undefined && { rating: body.rating ? Number(body.rating) : null }),
      ...(body.bookingUrl !== undefined && { bookingUrl: body.bookingUrl }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.tags !== undefined && { tags: body.tags ? JSON.stringify(body.tags) : null }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.timeOfDay !== undefined && { timeOfDay: body.timeOfDay }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.dayId !== undefined && { dayId: body.dayId }),
    },
  });
  return NextResponse.json(activity);
}

export async function DELETE(_: NextRequest, { params }: { params: { activityId: string } }) {
  await prisma.activity.delete({ where: { id: params.activityId } });
  return NextResponse.json({ success: true });
}
