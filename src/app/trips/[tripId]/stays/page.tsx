'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Loader2, BedDouble, MapPin, Calendar, DollarSign, ExternalLink, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Stay } from '@/types';

const STAY_TYPE_ICONS: Record<string, string> = {
  hotel: '🏨', hostel: '🛏️', airbnb: '🏠', resort: '🌴', villa: '🏡', guesthouse: '🏘️',
};

function StayForm({ tripId, onSuccess, onCancel }: { tripId: string; onSuccess: (s: Stay) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: '', type: 'hotel', address: '', lat: '', lng: '',
    checkIn: '', checkOut: '', bookingRef: '', bookingUrl: '', cost: '', currency: 'USD', notes: '', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat: form.lat || null, lng: form.lng || null, cost: form.cost || null }),
      });
      const stay = await res.json();
      onSuccess(stay);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Property Name *" value={form.name} onChange={set('name')} placeholder="Hotel de Paris" required />
        <Select label="Type" value={form.type} onChange={set('type')}>
          {Object.entries(STAY_TYPE_ICONS).map(([v, i]) => (
            <option key={v} value={v}>{i} {v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </Select>
      </div>
      <Input label="Address" value={form.address} onChange={set('address')} placeholder="123 Main St, Paris" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Latitude" value={form.lat} onChange={set('lat')} placeholder="48.8566" type="number" step="any" />
        <Input label="Longitude" value={form.lng} onChange={set('lng')} placeholder="2.3522" type="number" step="any" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Check-in *" type="datetime-local" value={form.checkIn} onChange={set('checkIn')} required />
        <Input label="Check-out *" type="datetime-local" value={form.checkOut} onChange={set('checkOut')} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Booking Ref" value={form.bookingRef} onChange={set('bookingRef')} placeholder="ABC123" />
        <Input label="Total Cost" type="number" value={form.cost} onChange={set('cost')} placeholder="350" />
      </div>
      <Input label="Booking URL" value={form.bookingUrl} onChange={set('bookingUrl')} placeholder="https://…" type="url" />
      <Input label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://images.unsplash.com/…" />
      <Textarea label="Notes" value={form.notes} onChange={set('notes') as (e: React.ChangeEvent<HTMLTextAreaElement>) => void} rows={2} placeholder="Breakfast included, free cancellation…" />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Stay</Button>
      </div>
    </form>
  );
}

export default function StaysPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStays = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}/stays`);
    const data = await res.json();
    setStays(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchStays(); }, [fetchStays]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this stay?')) return;
    await fetch(`/api/stays/${id}`, { method: 'DELETE' });
    setStays((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stays</h2>
          <p className="text-sm text-slate-500">{stays.length} accommodation{stays.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Stay
        </Button>
      </div>

      {stays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
            <BedDouble className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">No stays added yet</h3>
          <p className="text-slate-500 text-sm mb-5">Add your hotel, Airbnb, or hostel bookings</p>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add First Stay</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stays.map((stay) => {
            const icon = STAY_TYPE_ICONS[stay.type] || '🏨';
            const nights = Math.ceil((new Date(stay.checkOut).getTime() - new Date(stay.checkIn).getTime()) / 86400000);
            return (
              <div key={stay.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all">
                {stay.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={stay.imageUrl} alt={stay.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{stay.name}</h3>
                        <p className="text-xs text-slate-500 capitalize">{stay.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {stay.bookingUrl && (
                        <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(stay.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {stay.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{stay.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDate(stay.checkIn, 'MMM d')} – {formatDate(stay.checkOut, 'MMM d, yyyy')}</span>
                      <span className="text-xs text-slate-400">({nights} night{nights !== 1 ? 's' : ''})</span>
                    </div>
                    {stay.cost && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatCurrency(stay.cost, stay.currency)}</span>
                        <span className="text-xs text-slate-400">total</span>
                      </div>
                    )}
                    {stay.bookingRef && (
                      <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        Ref: <span className="font-mono font-medium text-slate-600">{stay.bookingRef}</span>
                      </div>
                    )}
                    {stay.notes && <p className="text-xs text-slate-500 bg-amber-50 px-2 py-1 rounded-lg">{stay.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Accommodation" size="lg">
        <StayForm tripId={tripId} onSuccess={(s) => { setStays((prev) => [...prev, s]); setShowModal(false); }} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
