'use client';
import { MapPin, Clock, Star, Plus, Navigation } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-brand-200 hover:shadow-md transition-all group">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${color}18` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm leading-tight">{suggestion.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{suggestion.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
          {suggestion.distanceText && (
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {suggestion.distanceText}
            </span>
          )}
          {suggestion.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(suggestion.duration)}
            </span>
          )}
          {suggestion.rating && (
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
              {suggestion.rating.toFixed(1)}
            </span>
          )}
          {suggestion.cost !== undefined && suggestion.cost !== null && (
            <span className="font-medium" style={{ color }}>
              {suggestion.cost === 0 ? 'Free' : formatCurrency(suggestion.cost)}
            </span>
          )}
        </div>

        {/* Reason */}
        <div className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-brand-700 leading-relaxed">✨ {suggestion.reason}</p>
        </div>

        {/* Tags */}
        {suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {suggestion.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">{tag}</span>
            ))}
          </div>
        )}

        {onAdd && (
          <button
            onClick={() => onAdd(suggestion)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Itinerary
          </button>
        )}
      </div>
    </div>
  );
}
