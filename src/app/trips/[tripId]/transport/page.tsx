'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Loader2, Train, ArrowRight, Clock, DollarSign, ExternalLink, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatDate, formatCurrency, TRANSPORT_ICONS } from '@/lib/utils';
import type { Transport } from '@/types';

function TransportForm({ tripId, onSuccess, onCancel }: { tripId: string; onSuccess: (t: Transport) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    type: 'flight', fromLocation: '', toLocation: '',
    fromLat: '', fromLng: '', toLat: '', toLng: '',
    departureTime: '', arrivalTime: '', carrier: '',
    bookingRef: '', bookingUrl: '', cost: '', currency: 'USD', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/transport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fromLat: form.fromLat || null, fromLng: form.fromLng || null, toLat: form.toLat || null, toLng: form.toLng || null, cost: form.cost || null }),
      });
      const t = await res.json();
      onSuccess(t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Select label="Transport Type" value={form.type} onChange={set('type')}>
        {Object.entries(TRANSPORT_ICONS).map(([v, i]) => (
          <option key={v} value={v}>{i} {v.charAt(0).toUpperCase() + v.slice(1)}</option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="From *" value={form.fromLocation} onChange={set('fromLocation')} placeholder="Paris CDG" required />
        <Input label="To *" value={form.toLocation} onChange={set('toLocation')} placeholder="Amsterdam AMS" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Departure *" type="datetime-local" value={form.departureTime} onChange={set('departureTime')} required />
        <Input label="Arrival *" type="datetime-local" value={form.arrivalTime} onChange={set('arrivalTime')} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Carrier / Service" value={form.carrier} onChange={set('carrier')} placeholder="Air France AF007" />
        <Input label="Booking Ref" value={form.bookingRef} onChange={set('bookingRef')} placeholder="ABC123" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Cost" type="number" value={form.cost} onChange={set('cost')} placeholder="200" />
        <Input label="Booking URL" value={form.bookingUrl} onChange={set('bookingUrl')} placeholder="https://…" />
      </div>
      <Textarea label="Notes" value={form.notes} onChange={set('notes') as (e: React.ChangeEvent<HTMLTextAreaElement>) => void} rows={2} />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Transport</Button>
      </div>
    </form>
  );
}

export default function TransportPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchTransport = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}/transport`);
    const data = await res.json();
    setTransports(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchTransport(); }, [fetchTransport]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this transport?')) return;
    await fetch(`/api/transport/${id}`, { method: 'DELETE' });
    setTransports((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transport</h2>
          <p className="text-sm text-slate-500">{transports.length} transport leg{transports.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Transport
        </Button>
      </div>

      {transports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Train className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">No transport legs yet</h3>
          <p className="text-slate-500 text-sm mb-5">Track flights, trains, and transfers</p>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add First Transport</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {transports.map((t) => {
            const icon = TRANSPORT_ICONS[t.type] || '🚗';
            const duration = Math.round((new Date(t.arrivalTime).getTime() - new Date(t.departureTime).getTime()) / 60000);
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-slate-900">{t.fromLocation}</p>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="font-semibold text-slate-900">{t.toLocation}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(t.departureTime, 'MMM d, HH:mm')} → {formatDate(t.arrivalTime, 'HH:mm')}
                      </span>
                      <span className="text-slate-400">({hours}h {mins}m)</span>
                      {t.carrier && <span className="font-medium text-slate-700">{t.carrier}</span>}
                      {t.cost && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{formatCurrency(t.cost, t.currency)}</span>}
                    </div>
                    {t.bookingRef && (
                      <div className="mt-2 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg inline-block">
                        Ref: <span className="font-mono font-medium text-slate-600">{t.bookingRef}</span>
                      </div>
                    )}
                    {t.notes && <p className="text-xs text-slate-500 mt-2">{t.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {t.bookingUrl && (
                      <a href={t.bookingUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Transport" size="lg">
        <TransportForm
          tripId={tripId}
          onSuccess={(t) => { setTransports((prev) => [...prev, t]); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
