'use client';
import { useState } from 'react';
import { GripVertical, MapPin, Clock, DollarSign, Star, ExternalLink, Trash2, Edit2, ChevronDown, Sparkles } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, ACTIVITY_COLORS, ACTIVITY_ICONS, formatDuration, formatCurrency, parseTags } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
  onEdit?: (activity: Activity) => void;
  onExploreNearby?: (activity: Activity) => void;
  draggable?: boolean;
}

export default function ActivityCard({ activity, onDelete, onEdit, onExploreNearby, draggable = true }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    disabled: !draggable,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const color = ACTIVITY_COLORS[activity.type] || '#6366f1';
  const icon = ACTIVITY_ICONS[activity.type] || '📍';
  const tags = parseTags(activity.tags);

  const handleDelete = async () => {
    if (!confirm('Remove this activity?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' });
      onDelete?.(activity.id);
    } finally { setDeleting(false); }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'activity-card bg-white rounded-xl border border-slate-100 overflow-hidden group',
        'hover:shadow-md hover:border-slate-200',
        isDragging && 'opacity-50 shadow-2xl scale-[1.02] z-50 rotate-1',
        deleting && 'opacity-40 pointer-events-none'
      )}
    >
      {/* Color accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

      <div className="flex items-start gap-2.5 p-3">
        {/* Drag handle */}
        {draggable && (
          <button {...attributes} {...listeners}
            className="mt-1 p-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors">
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Type icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}20` }}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm leading-tight truncate">{activity.name}</h4>
              {activity.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" style={{ color }} />
                  <span className="text-[11px] text-slate-400 truncate">{activity.location}</span>
                </div>
              )}
            </div>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {activity.bookingUrl && (
                <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-600">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {onEdit && (
                <button onClick={() => onEdit(activity)}
                  className="p-1.5 hover:bg-brand-50 rounded-lg transition-colors text-slate-300 hover:text-brand-500">
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              {onDelete && (
                <button onClick={handleDelete} disabled={deleting}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-300 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => setExpanded(!expanded)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300">
                <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
              </button>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(activity.startTime || activity.duration) && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" />
                {activity.startTime && activity.startTime}
                {activity.duration && <span className="text-slate-400">· {formatDuration(activity.duration)}</span>}
              </span>
            )}
            {activity.cost !== null && activity.cost !== undefined && (
              <span className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: `${color}12`, color }}>
                {activity.cost === 0 ? 'Free' : formatCurrency(activity.cost, activity.currency)}
              </span>
            )}
            {activity.rating && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {activity.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-50 space-y-2.5 animate-slide-up">
          {activity.description && (
            <p className="text-xs text-slate-600 leading-relaxed">{activity.description}</p>
          )}
          {activity.address && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3 h-3 shrink-0 mt-0.5" style={{ color }} />
              <span>{activity.address}</span>
            </div>
          )}
          {activity.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 leading-relaxed">
              {activity.notes}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: `${color}12`, color }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {onExploreNearby && activity.lat && activity.lng && (
            <button onClick={() => onExploreNearby(activity)}
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg w-full justify-center"
              style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, color, border: `1px solid ${color}20` }}>
              <Sparkles className="w-3 h-3" />
              Explore nearby
            </button>
          )}
        </div>
      )}
    </div>
  );
}
