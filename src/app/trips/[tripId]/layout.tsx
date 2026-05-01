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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TripNav tripId={trip.id} tripName={trip.name} />
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
