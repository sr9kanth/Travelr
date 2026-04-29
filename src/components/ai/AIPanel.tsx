'use client';
import { useState } from 'react';
import { Sparkles, X, Loader2, RefreshCw, MapPin } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import Button from '@/components/ui/Button';
import type { Activity, AISuggestion } from '@/types';

interface AIPanelProps {
  activity?: Activity;
  dayId?: string;
  tripId?: string;
  onClose?: () => void;
  onAddActivity?: (suggestion: AISuggestion) => void;
}

export default function AIPanel({ activity, dayId, tripId, onClose, onAddActivity }: AIPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [radius, setRadius] = useState(2);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: activity?.lat || 48.8566,
          lng: activity?.lng || 2.3522,
          location: activity?.location || activity?.address || 'Current location',
          timeOfDay: activity?.timeOfDay || 'afternoon',
          availableMinutes: 120,
          existingActivities: activity ? [activity.name] : [],
          radius,
        }),
      });
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (suggestion: AISuggestion) => {
    if (!dayId || !tripId) { onAddActivity?.(suggestion); return; }

    await fetch(`/api/trips/${tripId}/days/${dayId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: suggestion.name,
        type: suggestion.type,
        description: suggestion.description,
        location: suggestion.location,
        address: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng,
        duration: suggestion.duration,
        cost: suggestion.cost,
        rating: suggestion.rating,
        tags: suggestion.tags,
        timeOfDay: 'afternoon',
        notes: `Added via AI Explore Nearby • ${suggestion.reason}`,
      }),
    });

    onAddActivity?.(suggestion);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-violet-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Explore Nearby</h3>
            <p className="text-xs text-slate-500">AI-powered suggestions</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Context */}
      {activity && (
        <div className="px-4 py-3 bg-brand-50 border-b border-brand-100 shrink-0">
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Near:</span>
            <span className="truncate">{activity.name}</span>
          </div>
          {activity.address && <p className="text-xs text-brand-500 mt-0.5 truncate pl-5">{activity.address}</p>}
        </div>
      )}

      {/* Radius selector */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium shrink-0">Radius:</span>
          {[0.5, 1, 2, 5].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                radius === r ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r < 1 ? `${r * 1000}m` : `${r}km`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!fetched && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-brand-400" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Find nearby activities</h4>
            <p className="text-sm text-slate-500 mb-6 max-w-[240px]">
              AI will suggest hidden gems, cafés, and attractions close to {activity?.name || 'your location'}.
            </p>
            <Button onClick={fetchSuggestions} size="md">
              <Sparkles className="w-4 h-4" />
              Get Suggestions
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Finding nearby gems…</p>
          </div>
        )}

        {fetched && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">{suggestions.length} suggestions found</p>
              <button onClick={fetchSuggestions} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onAdd={handleAdd} />
            ))}
            {suggestions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <p>No suggestions available.</p>
                <button onClick={fetchSuggestions} className="mt-2 text-brand-500 hover:underline text-xs">Try again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
