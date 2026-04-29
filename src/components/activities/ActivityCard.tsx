'use client';
import { useState } from 'react';
import { GripVertical, MapPin, Clock, DollarSign, Star, ExternalLink, Trash2, Edit2, ChevronDown, Sparkles } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, ACTIVITY_COLORS, ACTIVITY_ICONS, formatDuration, formatCurrency, parseTags } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
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
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'activity-card bg-white rounded-xl border border-slate-100 overflow-hidden',
        isDragging && 'opacity-50 shadow-xl scale-105 z-50',
        deleting && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Drag handle */}
        {draggable && (
          <button {...attributes} {...listeners} className="mt-0.5 p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Type indicator */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5" style={{ backgroundColor: `${color}18` }}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-slate-900 text-sm leading-tight truncate">{activity.name}</h4>
              {activity.location && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activity.location}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {activity.bookingUrl && (
                <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer"
                   className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {onEdit && (
                <button onClick={() => onEdit(activity)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-500">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button onClick={handleDelete} disabled={deleting} className="p-1 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {(activity.startTime || activity.duration) && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {activity.startTime && <span>{activity.startTime}</span>}
                {activity.duration && <span>· {formatDuration(activity.duration)}</span>}
              </span>
            )}
            {activity.cost !== null && activity.cost !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <DollarSign className="w-3 h-3" />
                {activity.cost === 0 ? 'Free' : formatCurrency(activity.cost, activity.currency)}
              </span>
            )}
            {activity.rating && (
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="w-3 h-3 fill-amber-400" />
                {activity.rating.toFixed(1)}
              </span>
            )}
            <Badge color={color} className="text-xs">
              {icon} {activity.type}
            </Badge>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
          {activity.description && <p className="text-xs text-slate-600 leading-relaxed">{activity.description}</p>}
          {activity.address && (
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{activity.address}</span>
            </div>
          )}
          {activity.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-800">{activity.notes}</div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}
          {onExploreNearby && activity.lat && activity.lng && (
            <button
              onClick={() => onExploreNearby(activity)}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explore nearby activities
            </button>
          )}
        </div>
      )}
    </div>
  );
}
