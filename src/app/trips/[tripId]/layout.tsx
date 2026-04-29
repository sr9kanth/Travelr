import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TripNav from '@/components/layout/TripNav';

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tripId: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    select: { id: true, name: true },
  });

  if (!trip) notFound();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
        <TripNav tripId={trip.id} tripName={trip.name} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
