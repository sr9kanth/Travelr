'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Loader2, Sparkles, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCenter, DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityForm from '@/components/activities/ActivityForm';
import AIPanel from '@/components/ai/AIPanel';
import { formatDate, TIME_OF_DAY_LABELS, TIME_OF_DAY_ORDER } from '@/lib/utils';
import type { Trip, Day, Activity, TimeOfDay } from '@/types';

export default function PlannerPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState<{ open: boolean; dayId: string } | null>(null);
  const [aiDayId, setAiDayId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}`);
    const data = await res.json();
    setTrip(data);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !trip) return;

    // Find which day each activity belongs to
    let activeDay: Day | null = null;
    let overDay: Day | null = null;

    for (const day of trip.days) {
      if (day.activities.some((a) => a.id === active.id)) activeDay = day;
      if (day.activities.some((a) => a.id === over.id)) overDay = day;
    }

    if (!activeDay || !overDay) return;

    if (activeDay.id === overDay.id) {
      // Reorder within same day
      const oldIndex = activeDay.activities.findIndex((a) => a.id === active.id);
      const newIndex = activeDay.activities.findIndex((a) => a.id === over.id);
      const reordered = arrayMove(activeDay.activities, oldIndex, newIndex);

      setTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.id === activeDay!.id ? { ...d, activities: reordered } : d
          ),
        };
      });

      await Promise.all(
        reordered.map((a, i) => fetch(`/api/activities/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        }))
      );
    } else {
      // Move to different day
      const activity = activeDay.activities.find((a) => a.id === active.id)!;
      setTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((d) => {
            if (d.id === activeDay!.id) return { ...d, activities: d.activities.filter((a) => a.id !== active.id) };
            if (d.id === overDay!.id) return { ...d, activities: [...d.activities, activity] };
            return d;
          }),
        };
      });

      await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId: overDay.id }),
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !trip) return;

    // Allow dropping on day containers
    const overDayId = over.data.current?.dayId;
    if (overDayId) {
      const overDay = trip.days.find((d) => d.id === overDayId);
      const activeDay = trip.days.find((d) => d.activities.some((a) => a.id === active.id));
      if (overDay && activeDay && overDay.id !== activeDay.id) {
        // Optimistic move to target day
      }
    }
  };

  const handleActivityAdded = (dayId: string, activity: Activity) => {
    setTrip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, activities: [...d.activities, activity] } : d
        ),
      };
    });
    setAddModal(null);
  };

  const handleActivityDeleted = (dayId: string, activityId: string) => {
    setTrip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d
        ),
      };
    });
  };

  const handleOptimize = async (dayId: string, activities: Activity[]) => {
    setOptimizing(dayId);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: activities.map((a) => ({ id: a.id, name: a.name, lat: a.lat, lng: a.lng, duration: a.duration, timeOfDay: a.timeOfDay, type: a.type })),
          pace: 'moderate',
          apply: true,
          dayId,
        }),
      });
      const data = await res.json();
      if (data.optimizedOrder) {
        setTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((d) => {
              if (d.id !== dayId) return d;
              const sorted = [...d.activities].sort(
                (a, b) => data.optimizedOrder.indexOf(a.id) - data.optimizedOrder.indexOf(b.id)
              );
              return { ...d, activities: sorted };
            }),
          };
        });
      }
    } finally {
      setOptimizing(null);
    }
  };

  const toggleDay = (dayId: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!trip) return <div className="p-8 text-slate-500">Trip not found.</div>;

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Main Planner */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--pad)', transition: 'padding 200ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 350, fontSize: 32, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>
              Day-by-Day Planner
            </h2>
            <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 4 }}>Drag activities to reorder or move between days</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => {
                const allDayIds = trip.days.map((d) => d.id);
                if (collapsedDays.size === allDayIds.length) setCollapsedDays(new Set());
                else setCollapsedDays(new Set(allDayIds));
              }}
            >
              {collapsedDays.size > 0 ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
          <div className="space-y-4">
            {trip.days.map((day, i) => {
              const collapsed = collapsedDays.has(day.id);
              const byTimeOfDay = (TIME_OF_DAY_ORDER as Record<string, number>);
              const grouped = Object.entries(
                day.activities.reduce((acc, a) => {
                  (acc[a.timeOfDay] = acc[a.timeOfDay] || []).push(a);
                  return acc;
                }, {} as Record<string, Activity[]>)
              ).sort(([a], [b]) => (byTimeOfDay[a] || 0) - (byTimeOfDay[b] || 0));

              return (
                <div key={day.id} style={{ background: 'var(--card-bg)', border: 'var(--card-border)', borderRadius: 'var(--card-radius)', overflow: 'hidden', marginBottom: 'var(--gap)' }}>
                  {/* Day header */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', borderBottom: collapsed ? 'none' : '1px solid var(--hairline)' }}
                    onClick={() => toggleDay(day.id)}
                  >
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)', flexShrink: 0, minWidth: 52 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.02em' }}>{formatDate(day.date, 'EEE, MMM d')}</div>
                      <div style={{ fontSize: 13, color: 'var(--mute)', marginTop: 2 }}>{day.activities.length} activit{day.activities.length !== 1 ? 'ies' : 'y'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {!collapsed && (
                        <>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={(e) => { e.stopPropagation(); setAiDayId(aiDayId === day.id ? null : day.id); }}
                            title="Explore nearby"
                          >
                            <Sparkles size={13} style={{ color: aiDayId === day.id ? 'var(--accent)' : 'var(--mute)' }} />
                          </button>
                          {day.activities.length > 1 && (
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={async (e) => { e.stopPropagation(); await handleOptimize(day.id, day.activities); }}
                              disabled={optimizing === day.id}
                              title="AI Optimize order"
                            >
                              {optimizing === day.id
                                ? <Loader2 size={13} className="animate-spin" style={{ color: 'var(--mute)' }} />
                                : <Zap size={13} style={{ color: 'var(--mute)' }} />}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={(e) => { e.stopPropagation(); setAddModal({ open: true, dayId: day.id }); }}
                            title="Add activity"
                          >
                            <Plus size={13} style={{ color: 'var(--mute)' }} />
                          </button>
                        </>
                      )}
                      {collapsed
                        ? <ChevronRight size={14} style={{ color: 'var(--mute)' }} />
                        : <ChevronDown size={14} style={{ color: 'var(--mute)' }} />}
                    </div>
                  </div>

                  {!collapsed && (
                    <div style={{ padding: '16px 20px 20px' }}>
                      {day.activities.length === 0 ? (
                        <div
                          className="new-trip-card"
                          style={{ minHeight: 100, borderRadius: 14, cursor: 'pointer' }}
                          onClick={() => setAddModal({ open: true, dayId: day.id })}
                        >
                          <Plus size={18} style={{ color: 'var(--mute)' }} />
                          <span style={{ fontSize: 13, color: 'var(--mute)' }}>Add first activity</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {grouped.map(([timeOfDay, activities]) => (
                            <div key={timeOfDay}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  {TIME_OF_DAY_LABELS[timeOfDay as TimeOfDay] || timeOfDay}
                                </span>
                                <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                              </div>
                              <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {activities.map((activity) => (
                                    <ActivityCard
                                      key={activity.id}
                                      activity={activity}
                                      onDelete={(id) => handleActivityDeleted(day.id, id)}
                                      onExploreNearby={() => setAiDayId(day.id)}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </div>
                          ))}
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ width: '100%', border: '1px dashed var(--hairline)', borderRadius: 10, color: 'var(--mute)' }}
                            onClick={() => setAddModal({ open: true, dayId: day.id })}
                          >
                            <Plus size={12} />
                            Add activity
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* AI Panel */}
      {aiDayId && (
        <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--hairline)', background: 'var(--card-bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <AIPanel
            activity={trip.days.find((d) => d.id === aiDayId)?.activities[0]}
            dayId={aiDayId}
            tripId={tripId}
            onClose={() => setAiDayId(null)}
            onAddActivity={() => fetchTrip()}
          />
        </div>
      )}

      {/* Add Activity Modal */}
      <Modal
        open={!!addModal?.open}
        onClose={() => setAddModal(null)}
        title="Add Activity"
        size="lg"
      >
        {addModal && (
          <ActivityForm
            dayId={addModal.dayId}
            tripId={tripId}
            onSuccess={(a) => handleActivityAdded(addModal.dayId, a as Activity)}
            onCancel={() => setAddModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
