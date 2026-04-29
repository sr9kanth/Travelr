'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, PenLine, ArrowRight, Loader2, Plus, X, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Mode = 'choose' | 'manual' | 'ai';

const INTERESTS = ['Food & Dining', 'History & Culture', 'Nature & Hiking', 'Art & Museums', 'Shopping', 'Nightlife', 'Adventure Sports', 'Wellness & Spa', 'Photography', 'Architecture', 'Local Markets', 'Hidden Gems'];
const STYLES = ['Relaxed', 'Moderate', 'Fast-paced', 'Luxury', 'Budget', 'Family-friendly', 'Solo Adventure', 'Romantic'];

export default function NewTripPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('choose');

  // Manual form
  const [manual, setManual] = useState({
    name: '', description: '', startDate: '', endDate: '', budget: '', currency: 'USD', coverImage: '',
  });
  const [manualLoading, setManualLoading] = useState(false);

  // AI form
  const [ai, setAi] = useState({
    destinations: [''],
    startDate: '', endDate: '', budget: 'moderate',
    style: 'Moderate', interests: [] as string[],
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; description: string; tripId?: string } | null>(null);

  const setManualField = (k: keyof typeof manual) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setManual((f) => ({ ...f, [k]: e.target.value }));

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manual),
      });
      const trip = await res.json();
      router.push(`/trips/${trip.id}/planner`);
    } finally {
      setManualLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setAi((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: ai.destinations.filter(Boolean),
          startDate: ai.startDate,
          endDate: ai.endDate,
          budget: ai.budget,
          style: ai.style,
          interests: ai.interests,
          saveToTrip: true,
        }),
      });
      const data = await res.json();
      setAiResult(data);
      if (data.tripId) {
        setTimeout(() => router.push(`/trips/${data.tripId}/planner`), 1500);
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="ml-[260px] flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a new trip</h1>
              <p className="text-slate-500">How would you like to start?</p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={() => setMode('ai')}
                className="group p-8 bg-gradient-to-br from-brand-500 to-violet-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold mb-2">Generate with AI</h2>
                <p className="text-brand-100 text-sm leading-relaxed mb-4">
                  Tell Claude your destination, dates, and travel style. Get a full itinerary in seconds.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Start with AI <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setMode('manual')}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-brand-200 hover:shadow-lg hover:scale-[1.02] transition-all text-left"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-5">
                  <PenLine className="w-6 h-6 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Build Manually</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Create your trip from scratch. Add activities, stays, and transport at your own pace.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Start blank <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-[260px] flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setMode('choose')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
            ← Back
          </button>

          {mode === 'manual' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Create trip manually</h1>
              <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl border border-slate-100 p-8 space-y-5">
                <Input label="Trip Name *" value={manual.name} onChange={setManualField('name')} placeholder="e.g. Paris & Amsterdam Adventure" required />
                <Textarea label="Description" value={manual.description} onChange={setManualField('description') as (e: React.ChangeEvent<HTMLTextAreaElement>) => void} placeholder="What's this trip about?" rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date *" type="date" value={manual.startDate} onChange={setManualField('startDate')} required />
                  <Input label="End Date *" type="date" value={manual.endDate} onChange={setManualField('endDate')} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Budget" type="number" value={manual.budget} onChange={setManualField('budget')} placeholder="3000" />
                  <Select label="Currency" value={manual.currency} onChange={setManualField('currency')}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <Input label="Cover Image URL" value={manual.coverImage} onChange={setManualField('coverImage')} placeholder="https://images.unsplash.com/…" />
                <Button type="submit" loading={manualLoading} size="lg" className="w-full">
                  Create Trip
                </Button>
              </form>
            </>
          )}

          {mode === 'ai' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">AI Itinerary Generator</h1>
                  <p className="text-slate-500 text-sm">Powered by Claude</p>
                </div>
              </div>

              {aiResult ? (
                <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{aiResult.title}</h2>
                  <p className="text-slate-500 mb-4">{aiResult.description}</p>
                  {aiLoading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to planner…
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-600">✓ Trip created! Redirecting…</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAIGenerate} className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
                  {/* Destinations */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Destinations *</label>
                    {ai.destinations.map((dest, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          value={dest}
                          onChange={(e) => {
                            const ds = [...ai.destinations];
                            ds[i] = e.target.value;
                            setAi((f) => ({ ...f, destinations: ds }));
                          }}
                          placeholder={i === 0 ? 'e.g. Paris, France' : 'Add another city…'}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                          required={i === 0}
                        />
                        {ai.destinations.length > 1 && (
                          <button type="button" onClick={() => setAi((f) => ({ ...f, destinations: f.destinations.filter((_, j) => j !== i) }))}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setAi((f) => ({ ...f, destinations: [...f.destinations, ''] }))}
                      className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium mt-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add destination
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Date *" type="date" value={ai.startDate} onChange={(e) => setAi((f) => ({ ...f, startDate: e.target.value }))} required />
                    <Input label="End Date *" type="date" value={ai.endDate} onChange={(e) => setAi((f) => ({ ...f, endDate: e.target.value }))} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Budget Level" value={ai.budget} onChange={(e) => setAi((f) => ({ ...f, budget: e.target.value }))}>
                      <option value="budget">💰 Budget</option>
                      <option value="moderate">💳 Moderate</option>
                      <option value="luxury">💎 Luxury</option>
                      <option value="ultra-luxury">✨ Ultra Luxury</option>
                    </Select>
                    <Select label="Travel Style" value={ai.style} onChange={(e) => setAi((f) => ({ ...f, style: e.target.value }))}>
                      {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => {
                        const selected = ai.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              selected
                                ? 'bg-brand-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" loading={aiLoading} size="lg" className="w-full">
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'Generating your itinerary…' : 'Generate Itinerary with AI'}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    AI will create a complete day-by-day itinerary with real places and coordinates.
                    {!process.env.ANTHROPIC_API_KEY && ' (Demo mode: using sample data)'}
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
