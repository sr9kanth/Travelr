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
    <div className="flex h-full">
      {/* Main Planner */}
      <div className={`flex-1 overflow-auto p-6 transition-all ${aiDayId ? 'pr-3' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Day-by-Day Planner</h2>
            <p className="text-sm text-slate-500 mt-0.5">Drag activities to reorder or move between days</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allDayIds = trip.days.map((d) => d.id);
                if (collapsedDays.size === allDayIds.length) setCollapsedDays(new Set());
                else setCollapsedDays(new Set(allDayIds));
              }}
            >
              {collapsedDays.size > 0 ? 'Expand All' : 'Collapse All'}
            </Button>
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
                <div key={day.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  {/* Day header */}
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleDay(day.id)}
                  >
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-xs font-medium leading-none">Day</span>
                      <span className="text-lg font-bold leading-none">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{formatDate(day.date, 'EEEE, MMMM d')}</p>
                      <p className="text-xs text-slate-400">{day.activities.length} activities</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!collapsed && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setAiDayId(aiDayId === day.id ? null : day.id); }}
                            title="Explore nearby"
                          >
                            <Sparkles className={`w-4 h-4 ${aiDayId === day.id ? 'text-brand-500' : 'text-slate-400'}`} />
                          </Button>
                          {day.activities.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async (e) => { e.stopPropagation(); await handleOptimize(day.id, day.activities); }}
                              disabled={optimizing === day.id}
                              title="AI Optimize order"
                            >
                              {optimizing === day.id
                                ? <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                                : <Zap className="w-4 h-4 text-slate-400" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setAddModal({ open: true, dayId: day.id }); }}
                            title="Add activity"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                          </Button>
                        </>
                      )}
                      {collapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {!collapsed && (
                    <div className="px-4 pb-4">
                      {day.activities.length === 0 ? (
                        <div
                          className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all"
                          onClick={() => setAddModal({ open: true, dayId: day.id })}
                        >
                          <Plus className="w-6 h-6 text-slate-300 mb-2" />
                          <p className="text-sm text-slate-400">Add first activity</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {grouped.map(([timeOfDay, activities]) => (
                            <div key={timeOfDay}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                  {TIME_OF_DAY_LABELS[timeOfDay as TimeOfDay] || timeOfDay}
                                </span>
                                <div className="flex-1 h-px bg-slate-100" />
                              </div>
                              <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2 pl-2">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-slate-400 hover:text-brand-500 border border-dashed border-slate-200 hover:border-brand-300"
                            onClick={() => setAddModal({ open: true, dayId: day.id })}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add activity
                          </Button>
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
        <div className="w-80 shrink-0 border-l border-slate-100 bg-white overflow-hidden flex flex-col">
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
