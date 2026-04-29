'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Loader2, Globe } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TripCard from '@/components/trips/TripCard';
import Button from '@/components/ui/Button';
import type { Trip } from '@/types';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'planning' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetch('/api/trips')
      .then((r) => r.json())
      .then((data) => { setTrips(Array.isArray(data) ? data : []); })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = trips.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-[260px] flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
            <p className="text-slate-500 mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
          </div>
          <Link href="/trips/new">
            <Button size="md">
              <Plus className="w-4 h-4" />
              New Trip
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trips…"
              className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {(['all', 'planning', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
              <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {search ? 'No trips match your search' : 'No trips yet'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              {search ? 'Try a different search term.' : 'Create your first trip and let AI plan it for you.'}
            </p>
            {!search && (
              <Link href="/trips/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Create Your First Trip
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={(id) => setTrips((prev) => prev.filter((t) => t.id !== id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
