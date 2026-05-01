'use client';
import { useState } from 'react';
import { GripVertical, MapPin, Clock, DollarSign, Star, ExternalLink, Trash2, Edit2, ChevronDown, Sparkles } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ACTIVITY_COLORS, ACTIVITY_ICONS, formatDuration, formatCurrency, parseTags } from '@/lib/utils';
import type { Activity } from '@/types';

const ACTIVITY_HUES: Record<string, number> = {
  food: 55, sightseeing: 35, culture: 310, nature: 150,
  shopping: 0, experience: 280, transport: 80, accommodation: 38,
  nightlife: 280, sport: 150, wellness: 120, hidden_gem: 0,
};

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
  const hue = ACTIVITY_HUES[activity.type] ?? 40;

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
      style={{
        ...style,
        background: 'var(--card-bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        overflow: 'hidden',
        opacity: isDragging ? 0.5 : deleting ? 0.5 : 1,
        transform: style.transform,
        transition: style.transition,
        ['--act-h' as string]: hue,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px' }}>
        {draggable && (
          <button {...attributes} {...listeners}
            style={{ padding: '2px', color: 'var(--mute-2)', cursor: 'grab', flexShrink: 0, marginTop: 2, background: 'none', border: 'none' }}>
            <GripVertical size={14} />
          </button>
        )}

        <div className="activity-icon" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 14, flexShrink: 0 }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activity.name}
              </h4>
              {activity.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 12, color: 'var(--mute)' }}>
                  <MapPin size={10} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.location}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              {activity.bookingUrl && (
                <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer"
                  style={{ padding: 4, color: 'var(--mute)', display: 'flex' }}>
                  <ExternalLink size={12} />
                </a>
              )}
              {onEdit && (
                <button onClick={() => onEdit(activity)}
                  style={{ padding: 4, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button onClick={handleDelete} disabled={deleting}
                  style={{ padding: 4, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <Trash2 size={12} />
                </button>
              )}
              <button onClick={() => setExpanded(!expanded)}
                style={{ padding: 4, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {(activity.startTime || activity.duration) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--mute)', fontFamily: 'Geist Mono, monospace' }}>
                <Clock size={10} />
                {activity.startTime && <span>{activity.startTime}</span>}
                {activity.duration && <span>· {formatDuration(activity.duration)}</span>}
              </span>
            )}
            {activity.cost !== null && activity.cost !== undefined && (
              <span style={{ fontSize: 11, color: 'var(--mute)', fontFamily: 'Geist Mono, monospace' }}>
                {activity.cost === 0 ? 'Free' : formatCurrency(activity.cost, activity.currency)}
              </span>
            )}
            {activity.rating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#f59e0b' }}>
                <Star size={10} style={{ fill: '#f59e0b' }} />
                {activity.rating.toFixed(1)}
              </span>
            )}
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 11,
              background: `${color}15`, color,
            }}>
              {activity.type}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activity.description && (
            <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{activity.description}</p>
          )}
          {activity.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--mute)' }}>
              <MapPin size={11} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{activity.address}</span>
            </div>
          )}
          {activity.notes && (
            <div style={{ background: 'oklch(0.97 0.03 70)', border: '1px solid oklch(0.92 0.04 70)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'oklch(0.35 0.08 60)' }}>
              {activity.notes}
            </div>
          )}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <span key={tag} style={{ padding: '2px 8px', background: 'var(--surface-2)', color: 'var(--ink-2)', borderRadius: 999, fontSize: 11 }}>{tag}</span>
              ))}
            </div>
          )}
          {onExploreNearby && activity.lat && activity.lng && (
            <button onClick={() => onExploreNearby(activity)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              <Sparkles size={12} />
              Explore nearby activities
            </button>
          )}
        </div>
      )}
    </div>
  );
}
