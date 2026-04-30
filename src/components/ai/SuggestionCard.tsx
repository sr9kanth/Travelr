'use client';
import { MapPin, Clock, Star, Plus, Navigation, Sparkles } from 'lucide-react';
import { ACTIVITY_COLORS, ACTIVITY_ICONS, formatDuration, formatCurrency } from '@/lib/utils';
import type { AISuggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onAdd?: (suggestion: AISuggestion) => void;
}

export default function SuggestionCard({ suggestion, onAdd }: SuggestionCardProps) {
  const color = ACTIVITY_COLORS[suggestion.type] || '#6366f1';
  const icon = ACTIVITY_ICONS[suggestion.type] || '📍';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all group">
      {/* Top color bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}20` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{suggestion.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{suggestion.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {suggestion.distanceText && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
              <Navigation className="w-3 h-3" />
              {suggestion.distanceText}
            </span>
          )}
          {suggestion.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              {formatDuration(suggestion.duration)}
            </span>
          )}
          {suggestion.rating && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-amber-400" />
              {suggestion.rating.toFixed(1)}
            </span>
          )}
          {suggestion.cost !== undefined && suggestion.cost !== null && (
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}12`, color }}>
              {suggestion.cost === 0 ? 'Free' : formatCurrency(suggestion.cost)}
            </span>
          )}
        </div>

        {/* AI reason */}
        <div className="flex items-start gap-2 rounded-xl px-3 py-2 mb-3"
          style={{ background: `linear-gradient(135deg, ${color}10, ${color}05)`, border: `1px solid ${color}15` }}>
          <Sparkles className="w-3 h-3 shrink-0 mt-0.5" style={{ color }} />
          <p className="text-xs leading-relaxed font-medium" style={{ color }}>{suggestion.reason}</p>
        </div>

        {/* Tags */}
        {suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {suggestion.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-medium border border-slate-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        {onAdd && (
          <button onClick={() => onAdd(suggestion)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            <Plus className="w-3.5 h-3.5" />
            Add to Itinerary
          </button>
        )}
      </div>
    </div>
  );
}
