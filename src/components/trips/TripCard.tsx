'use client';
import Link from 'next/link';
import { Loader2, Trash2 } from 'lucide-react';
import { formatDate, tripDuration } from '@/lib/utils';
import type { Trip } from '@/types';
import { useState } from 'react';

const STATUS_LABEL: Record<string, string> = {
  active: 'On now',
  planning: 'Planning',
  completed: 'Past trip',
};

function getTripKey(trip: Trip): string {
  return `${trip.name} ${trip.description ?? ''}`.toLowerCase();
}

function getHue(trip: Trip): number {
  const key = getTripKey(trip);
  if (key.includes('japan') || key.includes('kyoto') || key.includes('tokyo')) return 0;
  if (key.includes('portugal') || key.includes('lisbon')) return 35;
  if (key.includes('spain') || key.includes('barcelona')) return 38;
  if (key.includes('italy')) return 45;
  if (key.includes('france') || key.includes('paris')) return 50;
  if (key.includes('greece')) return 210;
  if (key.includes('iceland')) return 200;
  if (key.includes('morocco')) return 30;
  if (key.includes('thailand')) return 150;
  return (trip.name.charCodeAt(0) * 47) % 360;
}

function getFlagEmoji(trip: Trip): string {
  const key = getTripKey(trip);
  if (key.includes('japan') || key.includes('tokyo') || key.includes('kyoto')) return '🇯🇵';
  if (key.includes('portugal') || key.includes('lisbon')) return '🇵🇹';
  if (key.includes('spain') || key.includes('barcelona') || key.includes('madrid')) return '🇪🇸';
  if (key.includes('france') || key.includes('paris')) return '🇫🇷';
  if (key.includes('italy') || key.includes('rome')) return '🇮🇹';
  if (key.includes('greece') || key.includes('athens')) return '🇬🇷';
  if (key.includes('iceland')) return '🇮🇸';
  if (key.includes('morocco')) return '🇲🇦';
  if (key.includes('thailand')) return '🇹🇭';
  return '✈️';
}

interface TripCardProps { trip: Trip; onDelete?: (id: string) => void; }

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [deleting, setDeleting] = useState(false);
  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
  const duration = tripDuration(trip.startDate, trip.endDate);
  const hue = getHue(trip);
  const flag = getFlagEmoji(trip);
  const statusLabel = STATUS_LABEL[trip.status] ?? 'Planning';
  const density = trip.days.slice(0, 7).map((d) => Math.min(10, d.activities.length));

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${trip.name}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' });
      onDelete?.(trip.id);
    } finally { setDeleting(false); }
  };

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="trip-card"
      style={{ ['--card-h' as string]: hue }}
    >
      {/* Cover */}
      <div className="trip-cover">
        <div className="trip-cover-grad" />

        <div className="trip-status-pill">
          <span className="trip-status-dot" data-status={trip.status} />
          {statusLabel}
        </div>

        <div className="trip-meta-row">
          <span className="trip-meta-date">
            {formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d')}
          </span>
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '4px 8px', borderRadius: 8,
                background: 'rgba(0,0,0,0.35)', border: 'none', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
            >
              {deleting
                ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
                : <Trash2 style={{ width: 12, height: 12 }} />}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="trip-body">
        <div>
          <div className="trip-destination">
            <span className="trip-flag">{flag}</span>
            <h3 className="trip-name">{trip.name}</h3>
          </div>
          {trip.description && (
            <div className="trip-place">{trip.description}</div>
          )}
        </div>

        <div className="trip-stats">
          <div className="trip-stat">
            <span>Days</span>
            <span className="trip-stat-val">{duration}</span>
          </div>
          <div className="trip-stat">
            <span>Activities</span>
            <span className="trip-stat-val">{totalActivities}</span>
          </div>
          {trip.budget && (
            <div className="trip-stat">
              <span>Budget</span>
              <span className="trip-stat-val">${(trip.budget / 1000).toFixed(1)}k</span>
            </div>
          )}
          <div className="trip-stat" style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
            <span>Density</span>
            <div className="trip-density">
              {(density.length > 0 ? density : [3, 5, 7, 4, 6]).map((d, i) => (
                <div key={i} className="trip-density-bar" style={{ height: `${Math.max(4, d * 1.5)}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
