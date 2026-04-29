import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, DollarSign, Activity, BedDouble, Train, Sparkles, ArrowRight } from 'lucide-react';
import { formatDate, tripDuration, formatCurrency, getTripCoverImage, ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { MapMarkerData } from '@/types';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

export default async function TripOverviewPage({ params }: { params: { tripId: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: {
      days: { include: { activities: { orderBy: { order: 'asc' } } }, orderBy: { date: 'asc' } },
      stays: true,
      transports: true,
    },
  });

  if (!trip) notFound();

  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
  const totalCost = trip.days
    .flatMap((d) => d.activities)
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  // Build map markers
  const markers: MapMarkerData[] = [
    ...trip.days.flatMap((day, di) =>
      day.activities
        .filter((a) => a.lat && a.lng)
        .map((a) => ({
          id: a.id,
          name: a.name,
          type: 'activity' as const,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          activityType: a.type as any,
          lat: a.lat!,
          lng: a.lng!,
          day: di + 1,
        }))
    ),
    ...trip.stays
      .filter((s) => s.lat && s.lng)
      .map((s) => ({ id: s.id, name: s.name, type: 'stay' as const, lat: s.lat!, lng: s.lng! })),
  ];

  // Activity type summary
  const typeCounts = trip.days.flatMap((d) => d.activities).reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cover = getTripCoverImage({ coverImage: trip.coverImage, name: trip.name });

  return (
    <div className="flex-1 overflow-auto">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-slate-800">
        <Image src={cover} alt={trip.name} fill className="object-cover opacity-60" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
          {trip.description && <p className="text-slate-300 max-w-2xl">{trip.description}</p>}
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { icon: Calendar, label: 'Duration', value: `${tripDuration(trip.startDate.toISOString(), trip.endDate.toISOString())} days`, color: 'brand' },
            { icon: MapPin, label: 'Dates', value: `${formatDate(trip.startDate, 'MMM d')} – ${formatDate(trip.endDate, 'MMM d, yyyy')}`, color: 'violet' },
            { icon: Activity, label: 'Activities', value: totalActivities.toString(), color: 'emerald' },
            { icon: BedDouble, label: 'Stays', value: trip.stays.length.toString(), color: 'orange' },
            { icon: DollarSign, label: 'Activity Cost', value: formatCurrency(totalCost, trip.currency), color: 'sky' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className={`w-9 h-9 bg-${color}-50 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 text-${color}-500`} />
              </div>
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="font-bold text-slate-900 text-sm">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Map */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ height: 420 }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Trip Map</h2>
              <Link href={`/trips/${trip.id}/map`} className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Full map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {markers.length > 0 ? (
              <MapView markers={markers} className="h-[360px]" />
            ) : (
              <div className="h-[360px] flex items-center justify-center text-slate-400 text-sm">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Add activities with coordinates to see them on the map</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Activity breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Activity Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([type, count]) => {
                    const color = ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] || '#6366f1';
                    const icon = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || '📍';
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-sm">{icon}</span>
                        <span className="text-sm text-slate-600 capitalize flex-1">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(count / totalActivities) * 100}%`, backgroundColor: color }} />
                          </div>
                          <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Quick Access</h2>
              <div className="space-y-1">
                {[
                  { href: `/trips/${trip.id}/planner`, icon: Calendar, label: 'Day Planner', desc: `${trip.days.length} days` },
                  { href: `/trips/${trip.id}/map`, icon: MapPin, label: 'Interactive Map', desc: `${markers.length} markers` },
                  { href: `/trips/${trip.id}/stays`, icon: BedDouble, label: 'Stays', desc: `${trip.stays.length} booked` },
                  { href: `/trips/${trip.id}/transport`, icon: Train, label: 'Transport', desc: `${trip.transports.length} legs` },
                ].map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* AI Suggest */}
            <div className="bg-gradient-to-br from-brand-500 to-violet-600 rounded-2xl p-5 text-white">
              <Sparkles className="w-6 h-6 mb-3 text-brand-200" />
              <h3 className="font-semibold mb-1">AI Suggestions</h3>
              <p className="text-sm text-brand-100 mb-4">Let AI suggest nearby activities for any day in your trip.</p>
              <Link href={`/trips/${trip.id}/planner`}
                className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                Open Planner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Day-by-day summary */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Trip Timeline</h2>
            <Link href={`/trips/${trip.id}/planner`} className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              Edit in Planner <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {trip.days.map((day, i) => (
              <div key={day.id} className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs text-slate-400">Day</p>
                    <p className="text-xl font-bold text-brand-500">{i + 1}</p>
                    <p className="text-xs text-slate-500">{formatDate(day.date.toISOString(), 'MMM d')}</p>
                  </div>
                  <div className="flex-1">
                    {day.activities.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No activities planned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {day.activities.slice(0, 5).map((a) => {
                          const color = ACTIVITY_COLORS[a.type as keyof typeof ACTIVITY_COLORS] || '#6366f1';
                          const icon = ACTIVITY_ICONS[a.type as keyof typeof ACTIVITY_ICONS] || '📍';
                          return (
                            <span key={a.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${color}15`, color }}>
                              {icon} {a.name}
                            </span>
                          );
                        })}
                        {day.activities.length > 5 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">+{day.activities.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-700">{day.activities.length}</p>
                    <p className="text-xs text-slate-400">activities</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
