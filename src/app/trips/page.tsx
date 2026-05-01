'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TripCard from '@/components/trips/TripCard';
import type { Trip } from '@/types';

const FILTERS = [
  { key: 'all',       label: 'All trips' },
  { key: 'active',    label: 'On now' },
  { key: 'planning',  label: 'Planning' },
  { key: 'completed', label: 'Past' },
] as const;

type Filter = 'all' | 'planning' | 'active' | 'completed';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/trips')
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts: Record<string, number> = {
    all: trips.length,
    active: trips.filter((t) => t.status === 'active').length,
    planning: trips.filter((t) => t.status === 'planning').length,
    completed: trips.filter((t) => t.status === 'completed').length,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: 'var(--pad)', overflow: 'hidden' }}>

        {/* Topbar */}
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Your trips</h1>
            {trips.length > 0 && (
              <div className="topbar-sub">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</div>
            )}
          </div>
          <div className="topbar-right">
            <div className="search">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trips, places…"
              />
            </div>
            <Link href="/trips/new" className="btn btn-primary">
              + New trip
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        <div className="filter-row">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className="filter-pill"
              data-active={filter === key}
              onClick={() => setFilter(key as Filter)}
            >
              {label}
              {counts[key] > 0 && (
                <span className="mono muted" style={{ marginLeft: 6, fontSize: 11 }}>{counts[key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-mark">🗺️</div>
            <div className="empty-title">{search ? 'No matches' : 'No trips yet'}</div>
            <div className="empty-sub">
              {search
                ? 'Try a different search term.'
                : 'Describe somewhere you\'re curious about. We\'ll sketch a week of it.'}
            </div>
            {!search && (
              <Link href="/trips/new" className="btn btn-primary" style={{ marginTop: 8 }}>
                ✨ Plan one with AI
              </Link>
            )}
          </div>
        ) : (
          <div className="trips-grid">
            {filtered.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={(id) => setTrips((prev) => prev.filter((t) => t.id !== id))}
              />
            ))}
            <Link href="/trips/new" className="new-trip-card">
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--accent-soft)', color: 'var(--accent-ink)',
                display: 'grid', placeItems: 'center', marginBottom: 8, fontSize: 18,
              }}>+</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
                Plan something new
              </div>
              <div className="muted" style={{ fontSize: 13, maxWidth: 240 }}>
                Describe a trip, or pick a country and we'll build the rest.
              </div>
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
