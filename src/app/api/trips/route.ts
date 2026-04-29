import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';

const DEMO_USER_ID = 'demo-user';

async function getOrCreateUser() {
  return prisma.user.upsert({
    where: { email: 'demo@travelr.app' },
    update: {},
    create: { id: DEMO_USER_ID, email: 'demo@travelr.app', name: 'Alex Wanderer' },
  });
}

export async function GET() {
  const user = await getOrCreateUser();
  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    include: { days: { include: { activities: true } }, stays: true, transports: true },
    orderBy: { startDate: 'desc' },
  });
  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  const body = await req.json();

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  const trip = await prisma.trip.create({
    data: {
      name: body.name,
      description: body.description,
      startDate: start,
      endDate: end,
      budget: body.budget ? Number(body.budget) : null,
      currency: body.currency || 'USD',
      coverImage: body.coverImage || null,
      status: 'planning',
      userId: user.id,
      days: {
        create: Array.from({ length: dayCount }, (_, i) => ({
          date: addDays(start, i),
        })),
      },
    },
    include: { days: { include: { activities: true } }, stays: true, transports: true },
  });

  return NextResponse.json(trip, { status: 201 });
}
