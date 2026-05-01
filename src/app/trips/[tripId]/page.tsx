import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, BedDouble, Train, Sparkles, ArrowRight } from 'lucide-react';
import { formatDate, tripDuration, formatCurrency, ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/utils';
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
  const totalCost = trip.days.flatMap((d) => d.activities).reduce((sum, a) => sum + (a.cost || 0), 0);
  const duration = tripDuration(trip.startDate.toISOString(), trip.endDate.toISOString());

  const markers: MapMarkerData[] = [
    ...trip.days.flatMap((day, di) =>
      day.activities.filter((a) => a.lat && a.lng).map((a) => ({
        id: a.id, name: a.name, type: 'activity' as const,
        activityType: a.type as never,
        lat: a.lat!, lng: a.lng!, day: di + 1,
      }))
    ),
    ...trip.stays.filter((s) => s.lat && s.lng).map((s) => ({
      id: s.id, name: s.name, type: 'stay' as const, lat: s.lat!, lng: s.lng!,
    })),
  ];

  const typeCounts = trip.days.flatMap((d) => d.activities).reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 'var(--pad)' }}>

      {/* Overview cover */}
      <div className="overview-cover">
        <div className="overview-cover-photo" />
        <div className="overview-cover-content">
          <div className="overview-where">✈️ {trip.name}</div>
          <h1 className="overview-title">{trip.name}</h1>
        </div>
      </div>

      {/* Stats grid */}
      <div className="overview-stats">
        <div className="overview-stat">
          <div className="overview-stat-label">Duration</div>
          <div className="overview-stat-value">{duration}</div>
          <div className="overview-stat-sub">{formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d')}</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-label">Activities</div>
          <div className="overview-stat-value">{totalActivities}</div>
          <div className="overview-stat-sub">Across {trip.days.length} days</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-label">Est. cost</div>
          <div className="overview-stat-value">{totalCost > 0 ? formatCurrency(totalCost, trip.currency) : '—'}</div>
          <div className="overview-stat-sub">{trip.budget ? `Budget: ${formatCurrency(trip.budget, trip.currency)}` : 'No budget set'}</div>
        </div>
        <div className="overview-stat">
          <div className="overview-stat-label">Stays</div>
          <div className="overview-stat-value">{trip.stays.length}</div>
          <div className="overview-stat-sub">{trip.transports.length} transport leg{trip.transports.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--gap-lg)', alignItems: 'start', marginBottom: 'var(--gap-lg)' }}>
        {/* Map */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Trip map</div>
            <Link href={`/trips/${trip.id}/map`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              Full map <ArrowRight size={12} />
            </Link>
          </div>
          {markers.length > 0 ? (
            <MapView markers={markers} className="h-[360px]" />
          ) : (
            <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mute)', flexDirection: 'column', gap: 8 }}>
              <MapPin size={24} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Add activities with coordinates to see them here</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {/* Activity breakdown */}
          {Object.keys(typeCounts).length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Activity breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(typeCounts).sort(([, a], [, b]) => b - a).slice(0, 6).map(([type, count]) => {
                  const color = ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] || '#6366f1';
                  const icon = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || '📍';
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)', flex: 1, textTransform: 'capitalize' }}>{type}</span>
                      <div style={{ width: 56, height: 4, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, backgroundColor: color, width: `${(count / totalActivities) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--mute)', fontFamily: 'Geist Mono, monospace', minWidth: 16, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Quick access</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { href: `/trips/${trip.id}/planner`,  icon: Calendar,  label: 'Day Planner',  desc: `${trip.days.length} days` },
                { href: `/trips/${trip.id}/map`,       icon: MapPin,    label: 'Map',          desc: `${markers.length} markers` },
                { href: `/trips/${trip.id}/stays`,     icon: BedDouble, label: 'Stays',        desc: `${trip.stays.length} booked` },
                { href: `/trips/${trip.id}/transport`, icon: Train,     label: 'Transport',    desc: `${trip.transports.length} legs` },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 10, textDecoration: 'none', color: 'var(--ink)', transition: 'background 120ms',
                }}>
                  <Icon size={14} style={{ color: 'var(--mute)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--mute)' }}>{desc}</div>
                  </div>
                  <ArrowRight size={12} style={{ color: 'var(--mute-2)' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* AI CTA */}
          <div style={{ background: 'var(--ink)', borderRadius: 'var(--card-radius)', padding: 20, color: 'var(--bg)' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)', marginBottom: 10 }} />
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 400, marginBottom: 6 }}>AI Suggestions</div>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 14, lineHeight: 1.5 }}>
              Let AI suggest nearby activities for any day in your planner.
            </p>
            <Link href={`/trips/${trip.id}/planner`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--bg)', textDecoration: 'none' }}>
              Open Planner <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Day timeline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--gap)' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 350, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            The shape of the trip
          </div>
          <Link href={`/trips/${trip.id}/planner`}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
            Edit in Planner <ArrowRight size={12} />
          </Link>
        </div>
        <div className="trips-grid">
          {trip.days.map((day, i) => (
            <div key={day.id} className="card" style={{ padding: 'var(--pad-card)' }}>
              <div className="day-num" style={{ fontSize: 48 }}>{String(i + 1).padStart(2, '0')}</div>
              <div className="day-date" style={{ marginTop: 8 }}>{formatDate(day.date, 'EEE, MMM d')}</div>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {day.activities.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--mute)', fontStyle: 'italic' }}>No activities yet</span>
                ) : (
                  <>
                    {day.activities.slice(0, 3).map((a) => {
                      const color = ACTIVITY_COLORS[a.type as keyof typeof ACTIVITY_COLORS] || '#6366f1';
                      const icon = ACTIVITY_ICONS[a.type as keyof typeof ACTIVITY_ICONS] || '📍';
                      return (
                        <span key={a.id} style={{
                          padding: '3px 8px', borderRadius: 999, fontSize: 11,
                          background: `${color}15`, color,
                        }}>
                          {icon} {a.name}
                        </span>
                      );
                    })}
                    {day.activities.length > 3 && (
                      <span style={{ padding: '3px 8px', background: 'var(--surface-2)', color: 'var(--mute)', borderRadius: 999, fontSize: 11 }}>
                        +{day.activities.length - 3}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="trip-stats" style={{ marginTop: 16 }}>
                <div className="trip-stat">
                  <span>Activities</span>
                  <span className="trip-stat-val">{day.activities.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
