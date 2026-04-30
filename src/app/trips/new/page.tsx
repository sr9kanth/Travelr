'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, PenLine, ArrowRight, Plus, X, CheckCircle, Globe, Calendar, Minus, AlertCircle, MessageSquare, List, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PlaceSearch from '@/components/ui/PlaceSearch';
import { useAIStore } from '@/store/aiStore';

type Mode = 'choose' | 'manual' | 'ai';

interface CountryDays { country: string; days: number; }

const INTERESTS = ['Food & Dining', 'History & Culture', 'Nature & Hiking', 'Art & Museums', 'Shopping', 'Nightlife', 'Adventure Sports', 'Wellness & Spa', 'Photography', 'Architecture', 'Local Markets', 'Hidden Gems'];
const STYLES = ['Relaxed', 'Moderate', 'Fast-paced', 'Luxury', 'Budget', 'Family-friendly', 'Solo Adventure', 'Romantic'];

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NewTripPage() {
  const router = useRouter();
  const { getActiveProvider } = useAIStore();
  const [mode, setMode] = useState<Mode>('choose');

  // Manual form
  const [manual, setManual] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', currency: 'USD', coverImage: '' });
  const [manualLoading, setManualLoading] = useState(false);

  // AI form
  const [inputMode, setInputMode] = useState<'prompt' | 'structured'>('prompt');
  const [freePrompt, setFreePrompt] = useState('');
  const [countryDays, setCountryDays] = useState<CountryDays[]>([{ country: '', days: 3 }]);
  const [startDate, setStartDate] = useState('');
  const [budget, setBudget] = useState('moderate');
  const [style, setStyle] = useState('Moderate');
  const [interests, setInterests] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; description: string; tripId?: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const totalDays = useMemo(() => countryDays.reduce((s, c) => s + c.days, 0), [countryDays]);
  const endDate = useMemo(() => {
    if (!startDate || totalDays === 0) return '';
    return addDaysToDate(startDate, totalDays - 1);
  }, [startDate, totalDays]);

  const setManualField = (k: keyof typeof manual) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setManual((f) => ({ ...f, [k]: e.target.value }));

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await fetch('/api/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manual) });
      const trip = await res.json();
      router.push(`/trips/${trip.id}/planner`);
    } finally { setManualLoading(false); }
  };

  const toggleInterest = (interest: string) =>
    setInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);

  const addCountry = () => setCountryDays((prev) => [...prev, { country: '', days: 3 }]);
  const removeCountry = (idx: number) => setCountryDays((prev) => prev.filter((_, i) => i !== idx));
  const updateCountry = (idx: number, field: keyof CountryDays, value: string | number) =>
    setCountryDays((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  const adjustDays = (idx: number, delta: number) =>
    setCountryDays((prev) => prev.map((c, i) => i === idx ? { ...c, days: Math.max(1, c.days + delta) } : c));

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);

    if (inputMode === 'prompt' && !freePrompt.trim()) {
      setAiError('Please describe your trip idea.');
      return;
    }
    if (inputMode === 'structured') {
      if (!startDate) { setAiError('Please pick a start date.'); return; }
      if (countryDays.filter((c) => c.country.trim()).length === 0) { setAiError('Please add at least one destination.'); return; }
    }

    const validCountries = inputMode === 'structured' ? countryDays.filter((c) => c.country.trim()) : [];

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: validCountries.map((c) => c.country),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          budget,
          style,
          interests,
          countryDays: validCountries.length > 0 ? validCountries : undefined,
          freePrompt: freePrompt.trim() || undefined,
          saveToTrip: true,
          provider: getActiveProvider(),
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setAiError(`Rate limited by ${data.provider ?? 'AI'}. Switch provider in the sidebar.`);
        return;
      }

      const data = await res.json();
      if (data.error) { setAiError(data.error); return; }
      setAiResult(data);
      if (data.tripId) setTimeout(() => router.push(`/trips/${data.tripId}/planner`), 1500);
    } catch {
      setAiError('Something went wrong. Please try again.');
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
              <button onClick={() => setMode('ai')}
                className="group p-8 bg-gradient-to-br from-brand-500 to-violet-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-left">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold mb-2">Generate with AI</h2>
                <p className="text-brand-100 text-sm leading-relaxed mb-4">
                  Describe your dream trip in plain English. AI builds a complete day-by-day itinerary.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Start with AI <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button onClick={() => setMode('manual')}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-brand-200 hover:shadow-lg hover:scale-[1.02] transition-all text-left">
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

          {/* ── MANUAL MODE ─────────────────────────────────────────────── */}
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
                <Button type="submit" loading={manualLoading} size="lg" className="w-full">Create Trip</Button>
              </form>
            </>
          )}

          {/* ── AI MODE ─────────────────────────────────────────────────── */}
          {mode === 'ai' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">AI Itinerary Generator</h1>
                  <p className="text-slate-500 text-sm">Describe your trip or enter details structured</p>
                </div>
              </div>

              {aiResult ? (
                <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{aiResult.title}</h2>
                  <p className="text-slate-500 mb-4">{aiResult.description}</p>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin inline-block" />
                    Redirecting to planner…
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAIGenerate} className="space-y-4">

                  {/* ── Input mode toggle ───────────────────────────────── */}
                  <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setInputMode('prompt')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'prompt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Describe in words
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('structured')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'structured' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Country by country
                    </button>
                  </div>

                  {/* ── FREE TEXT PROMPT ────────────────────────────────── */}
                  {inputMode === 'prompt' && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        Describe your trip *
                      </label>
                      <textarea
                        value={freePrompt}
                        onChange={(e) => setFreePrompt(e.target.value)}
                        rows={5}
                        placeholder="e.g. I want a 25-day trip through Spain, Portugal, and Morocco starting December 6th. Focus on food, history and hidden gems. Travelling with family including 2 kids. Moderate budget. Avoid big tourist traps — I want authentic local experiences."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none leading-relaxed"
                        required={inputMode === 'prompt'}
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Include: destinations, trip length, dates, budget, travel style, any must-dos.
                      </p>
                    </div>
                  )}

                  {/* ── STRUCTURED: Country + Days ──────────────────────── */}
                  {inputMode === 'structured' && (
                    <>
                      <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="w-4 h-4 text-brand-500" />
                          <h2 className="font-semibold text-slate-900 text-sm">Destinations & Duration</h2>
                        </div>

                        <div className="space-y-3">
                          {countryDays.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-3 h-11 px-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex-1 min-w-0">
                                <PlaceSearch
                                  value={entry.country}
                                  onChange={(v) => updateCountry(idx, 'country', v)}
                                  placeholder={`Destination ${idx + 1} — e.g. Barcelona`}
                                />
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button type="button" onClick={() => adjustDays(idx, -1)}
                                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                  <Minus className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                                <div className="text-center w-10">
                                  <span className="text-sm font-bold text-slate-900">{entry.days}</span>
                                  <span className="text-[10px] text-slate-400 block leading-none">days</span>
                                </div>
                                <button type="button" onClick={() => adjustDays(idx, 1)}
                                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                  <Plus className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              </div>
                              {countryDays.length > 1 && (
                                <button type="button" onClick={() => removeCountry(idx)}
                                  className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition-colors shrink-0">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={addCountry}
                          className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium mt-3">
                          <Plus className="w-3.5 h-3.5" /> Add another destination
                        </button>

                        {totalDays > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100">
                              <Calendar className="w-3.5 h-3.5 text-brand-500" />
                              <span className="text-sm font-bold text-brand-700">{totalDays} total days</span>
                            </div>
                            {countryDays.filter((c) => c.country).map((c, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                {c.country}: {c.days}d
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Start date */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-4 h-4 text-brand-500" />
                          <h2 className="font-semibold text-slate-900 text-sm">Travel Dates</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Start Date *" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                          <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">End Date</label>
                            <div className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center">
                              <span className="text-sm text-slate-500">
                                {endDate ? formatDateDisplay(endDate) : 'Auto-calculated'}
                              </span>
                            </div>
                            {totalDays > 0 && startDate && (
                              <p className="text-[11px] text-slate-400 mt-1">From {totalDays} days total</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Optional extra instructions in structured mode */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Additional instructions <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={freePrompt}
                          onChange={(e) => setFreePrompt(e.target.value)}
                          rows={2}
                          placeholder="e.g. Focus on off-the-beaten-path spots. Include a cooking class per country. Travelling with 2 kids…"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none leading-relaxed"
                        />
                      </div>
                    </>
                  )}

                  {/* ── Advanced preferences (collapsed by default) ──────── */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((v) => !v)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-700">Budget, style & interests</span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {showAdvanced && (
                      <div className="px-6 pb-6 space-y-5 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <Select label="Budget Level" value={budget} onChange={(e) => setBudget(e.target.value)}>
                            <option value="budget">💰 Budget</option>
                            <option value="moderate">💳 Moderate</option>
                            <option value="luxury">💎 Luxury</option>
                            <option value="ultra-luxury">✨ Ultra Luxury</option>
                          </Select>
                          <Select label="Travel Style" value={style} onChange={(e) => setStyle(e.target.value)}>
                            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-2">Interests</label>
                          <div className="flex flex-wrap gap-2">
                            {INTERESTS.map((interest) => {
                              const selected = interests.includes(interest);
                              return (
                                <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selected ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                  {interest}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {aiError && (
                    <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 bg-red-50 border border-red-100 text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-sm">{aiError}</p>
                    </div>
                  )}

                  <Button type="submit" loading={aiLoading} size="lg" className="w-full">
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'Generating itinerary…' : 'Generate Itinerary with AI'}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    AI will create a complete day-by-day plan with real places and map coordinates.
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
