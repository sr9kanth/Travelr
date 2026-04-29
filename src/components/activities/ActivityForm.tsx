'use client';
import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ACTIVITY_TYPE_LABELS, ACTIVITY_ICONS } from '@/lib/utils';
import type { ActivityType, TimeOfDay } from '@/types';

interface ActivityFormProps {
  dayId: string;
  tripId: string;
  onSuccess?: (activity: unknown) => void;
  onCancel?: () => void;
  initial?: Partial<{
    name: string; type: ActivityType; description: string; location: string;
    address: string; lat: number; lng: number; startTime: string; endTime: string;
    duration: number; cost: number; currency: string; rating: number;
    bookingUrl: string; notes: string; timeOfDay: TimeOfDay; tags: string[];
    imageUrl: string;
  }>;
}

export default function ActivityForm({ dayId, tripId, onSuccess, onCancel, initial }: ActivityFormProps) {
  const [form, setForm] = useState({
    name:        initial?.name || '',
    type:        (initial?.type || 'sightseeing') as ActivityType,
    description: initial?.description || '',
    location:    initial?.location || '',
    address:     initial?.address || '',
    lat:         initial?.lat?.toString() || '',
    lng:         initial?.lng?.toString() || '',
    startTime:   initial?.startTime || '',
    endTime:     initial?.endTime || '',
    duration:    initial?.duration?.toString() || '',
    cost:        initial?.cost?.toString() || '',
    currency:    initial?.currency || 'USD',
    rating:      initial?.rating?.toString() || '',
    bookingUrl:  initial?.bookingUrl || '',
    notes:       initial?.notes || '',
    timeOfDay:   (initial?.timeOfDay || 'morning') as TimeOfDay,
    tags:        initial?.tags?.join(', ') || '',
    imageUrl:    initial?.imageUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/trips/${tripId}/days/${dayId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
          duration: form.duration ? Number(form.duration) : null,
          cost: form.cost ? Number(form.cost) : null,
          rating: form.rating ? Number(form.rating) : null,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const activity = await res.json();
      onSuccess?.(activity);
    } catch {
      setError('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Activity Name *" value={form.name} onChange={set('name')} placeholder="e.g. Eiffel Tower Visit" />
        </div>
        <Select label="Type" value={form.type} onChange={set('type')}>
          {Object.entries(ACTIVITY_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{ACTIVITY_ICONS[v as ActivityType]} {l}</option>
          ))}
        </Select>
        <Select label="Time of Day" value={form.timeOfDay} onChange={set('timeOfDay')}>
          <option value="morning">🌅 Morning</option>
          <option value="afternoon">☀️ Afternoon</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </Select>
      </div>

      <Textarea label="Description" value={form.description} onChange={set('description')} rows={2} placeholder="Brief description…" />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Location / Area" value={form.location} onChange={set('location')} placeholder="e.g. Champ de Mars" />
        <Input label="Full Address" value={form.address} onChange={set('address')} placeholder="e.g. Paris, France" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Latitude" value={form.lat} onChange={set('lat')} placeholder="48.8584" type="number" step="any" />
        <Input label="Longitude" value={form.lng} onChange={set('lng')} placeholder="2.2945" type="number" step="any" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Input label="Start Time" value={form.startTime} onChange={set('startTime')} type="time" />
        <Input label="End Time" value={form.endTime} onChange={set('endTime')} type="time" />
        <Input label="Duration (min)" value={form.duration} onChange={set('duration')} placeholder="90" type="number" />
        <Input label="Cost" value={form.cost} onChange={set('cost')} placeholder="25" type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Rating (1-5)" value={form.rating} onChange={set('rating')} placeholder="4.5" type="number" step="0.1" min="0" max="5" />
        <Input label="Booking URL" value={form.bookingUrl} onChange={set('bookingUrl')} placeholder="https://…" type="url" />
      </div>

      <Input label="Tags (comma separated)" value={form.tags} onChange={set('tags')} placeholder="museum, iconic, free" />
      <Input label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://images.unsplash.com/…" />
      <Textarea label="Notes" value={form.notes} onChange={set('notes')} rows={2} placeholder="Additional notes…" />

      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>}
        <Button type="submit" loading={loading} className="flex-1">Save Activity</Button>
      </div>
    </form>
  );
}
