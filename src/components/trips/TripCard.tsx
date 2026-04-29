'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, DollarSign, Loader2, Trash2 } from 'lucide-react';
import { formatDate, tripDuration, formatCurrency, getTripCoverImage } from '@/lib/utils';
import type { Trip } from '@/types';
import { useState } from 'react';

const STATUS_STYLES = {
  planning:  { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400',  label: 'Planning' },
  active:    { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-400',  label: 'Active' },
  completed: { bg: 'bg-slate-50',  text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'Completed' },
};

interface TripCardProps { trip: Trip; onDelete?: (id: string) => void; }

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [deleting, setDeleting] = useState(false);
  const status = STATUS_STYLES[trip.status] ?? STATUS_STYLES.planning;
  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
  const cover = getTripCoverImage(trip);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${trip.name}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' });
      onDelete?.(trip.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/trips/${trip.id}`} className="trip-card group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-brand-100 transition-all">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <Image src={cover} alt={trip.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Status */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>
        {/* Delete */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-base mb-1 leading-tight group-hover:text-brand-600 transition-colors">{trip.name}</h3>
        {trip.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{trip.description}</p>}

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span>{tripDuration(trip.startDate, trip.endDate)} days</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="text-xs text-slate-500">{totalActivities} activities</div>
          {trip.budget && (
            <>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-0.5 text-xs text-slate-500">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(trip.budget, trip.currency)}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
