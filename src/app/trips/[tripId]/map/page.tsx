'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, MapPin, Eye, EyeOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ACTIVITY_COLORS, ACTIVITY_ICONS, ACTIVITY_TYPE_LABELS } from '@/lib/utils';
import type { Trip, MapMarkerData, ActivityType } from '@/types';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

const LAYER_TYPES = [
  { key: 'activities', label: 'Activities', color: '#6366f1' },
  { key: 'stays', label: 'Stays', color: '#f97316' },
  { key: 'transport', label: 'Transport', color: '#64748b' },
] as const;

export default function MapPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [layers, setLayers] = useState({ activities: true, stays: true, transport: false });
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}`);
    const data = await res.json();
    setTrip(data);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  if (loading) {
    return <div className="flex items-center justify-center h-full py-24"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  if (!trip) return null;

  // Build all markers
  const allActivityMarkers: MapMarkerData[] = trip.days.flatMap((day, di) =>
    day.activities
      .filter((a) => a.lat && a.lng)
      .filter(() => selectedDay === 'all' || selectedDay === di + 1)
      .filter((a) => selectedType === 'all' || a.type === selectedType)
      .map((a) => ({
        id: a.id,
        name: a.name,
        type: 'activity' as const,
        activityType: a.type as ActivityType,
        lat: a.lat!,
        lng: a.lng!,
        day: di + 1,
      }))
  );

  const stayMarkers: MapMarkerData[] = trip.stays
    .filter((s) => s.lat && s.lng)
    .map((s) => ({ id: s.id, name: s.name, type: 'stay' as const, lat: s.lat!, lng: s.lng! }));

  const transportMarkers: MapMarkerData[] = trip.transports
    .filter((t) => t.fromLat && t.fromLng)
    .map((t) => ({ id: t.id, name: `${t.fromLocation} → ${t.toLocation}`, type: 'transport' as const, lat: t.fromLat!, lng: t.fromLng! }));

  const visibleMarkers = [
    ...(layers.activities ? allActivityMarkers : []),
    ...(layers.stays ? stayMarkers : []),
    ...(layers.transport ? transportMarkers : []),
  ];

  // Activity type counts
  const typeCounts = trip.days.flatMap((d) => d.activities).reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Controls sidebar */}
      <div className="w-72 shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-1">Map View</h2>
          <p className="text-xs text-slate-500">{visibleMarkers.length} markers visible</p>
        </div>

        {/* Layers */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Layers</p>
          {LAYER_TYPES.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
              className="flex items-center gap-3 w-full py-2 px-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                {layers[key] ? <Eye className="w-4 h-4" style={{ color }} /> : <EyeOff className="w-4 h-4 text-slate-300" />}
              </div>
              <span className={`text-sm font-medium ${layers[key] ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
              <span className="ml-auto text-xs text-slate-400">
                {key === 'activities' ? allActivityMarkers.length : key === 'stays' ? stayMarkers.length : transportMarkers.length}
              </span>
            </button>
          ))}
        </div>

        {/* Day filter */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Filter by Day</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedDay === 'all' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >All</button>
            {trip.days.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i + 1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedDay === i + 1 ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >D{i + 1}</button>
            ))}
          </div>
        </div>

        {/* Activity type filter */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Filter by Type</p>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedType === 'all' ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <MapPin className="w-3.5 h-3.5" /> All types
            </button>
            {Object.entries(typeCounts).map(([type, count]) => {
              const color = ACTIVITY_COLORS[type as ActivityType] || '#6366f1';
              const icon = ACTIVITY_ICONS[type as ActivityType] || '📍';
              const label = ACTIVITY_TYPE_LABELS[type as ActivityType] || type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as ActivityType)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedType === type ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <span>{icon}</span>
                  <span className="flex-1 text-left">{label}</span>
                  <span className="text-slate-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected marker info */}
        {selectedMarker && (
          <div className="p-4 bg-brand-50 border-b border-brand-100">
            <p className="text-xs font-semibold text-brand-600 mb-1">Selected</p>
            <p className="font-medium text-slate-900 text-sm">{selectedMarker.name}</p>
            {selectedMarker.day && <p className="text-xs text-brand-500">Day {selectedMarker.day}</p>}
            {selectedMarker.activityType && (
              <p className="text-xs text-slate-500 capitalize mt-0.5">{selectedMarker.activityType}</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="p-4 mt-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Legend</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(ACTIVITY_COLORS).slice(0, 8).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: color }}>
                  {ACTIVITY_ICONS[type as ActivityType]}
                </div>
                <span className="text-xs text-slate-500 capitalize truncate">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {visibleMarkers.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No markers to show</p>
              <p className="text-sm text-slate-400 mt-1">Add activities with coordinates in the Planner</p>
            </div>
          </div>
        ) : (
          <MapView
            markers={visibleMarkers}
            className="h-full w-full"
            onMarkerClick={setSelectedMarker}
          />
        )}
      </div>
    </div>
  );
}
