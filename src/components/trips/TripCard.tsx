'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, DollarSign, Loader2, Trash2, ArrowUpRight } from 'lucide-react';
import { formatDate, tripDuration, formatCurrency, getTripCoverImage } from '@/lib/utils';
import type { Trip } from '@/types';
import { useState } from 'react';

const STATUS = {
  planning:  { label: 'Planning',  dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50/90' },
  active:    { label: 'Active',    dot: 'bg-emerald-400 dot-pulse', text: 'text-emerald-700', bg: 'bg-emerald-50/90' },
  completed: { label: 'Completed', dot: 'bg-slate-400',  text: 'text-slate-600',  bg: 'bg-slate-100/90' },
};

interface TripCardProps { trip: Trip; onDelete?: (id: string) => void; }

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [deleting, setDeleting] = useState(false);
  const status = STATUS[trip.status] ?? STATUS.planning;
  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
  const cover = getTripCoverImage(trip);
  const duration = tripDuration(trip.startDate, trip.endDate);

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
    <Link href={`/trips/${trip.id}`}
      className="trip-card group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-100">

      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image src={cover} alt={trip.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${status.bg} ${status.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </div>
          {onDelete && (
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 rounded-xl bg-black/30 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-sm">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
            <Calendar className="w-3 h-3" />
            {duration} days
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
          {trip.name}
        </h3>
        {trip.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{trip.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          {formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
            {totalActivities} activities
          </span>
          {trip.budget && (
            <>
              <div className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(trip.budget, trip.currency)}
              </span>
            </>
          )}
          <div className="ml-auto flex gap-1">
            {trip.days.slice(0, 5).map((d, i) => (
              <div key={i}
                className="w-1.5 h-4 rounded-full"
                style={{
                  backgroundColor: d.activities.length > 0 ? '#6366f1' : '#e2e8f0',
                  opacity: d.activities.length > 0 ? 0.6 + (d.activities.length / 10) : 1,
                }} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
