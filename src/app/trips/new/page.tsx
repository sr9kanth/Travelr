'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Minus, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getActiveProvider } from '@/components/ai/AIProviderPicker';

const SUGGESTION_CHIPS = [
  '9 days in Kyoto during cherry blossom',
  'Patagonia road trip, end of October',
  "First-timer's Tokyo, food-forward",
  'Slow week in Lisbon, no early mornings',
  'Reykjavík with the kids, 6 days',
  'Amalfi Coast, honeymoon vibes',
];

const BUDGET_OPTIONS = ['Tight', 'Mid', 'High', 'Splurge'];
const PACE_OPTIONS   = ['Slow', 'Balanced', 'Packed'];
const INTEREST_OPTIONS = ['Food', 'Culture', 'Nature', 'Nightlife', 'Shopping', 'Adventure', 'Wellness', 'Art'];

const GEN_STEPS = [
  'Reading your idea',
  'Scouting destinations',
  'Finding the best places',
  'Optimising the schedule',
  'Finishing up',
];

type Tab = 'describe' | 'structured';

interface CountryRow { country: string; days: number; }

export default function NewTripPage() {
  const router = useRouter();
  const [tab, setTab]               = useState<Tab>('describe');
  const [prompt, setPrompt]         = useState('');
  const [rows, setRows]             = useState<CountryRow[]>([{ country: '', days: 3 }]);
  const [budget, setBudget]         = useState('Mid');
  const [pace, setPace]             = useState('Balanced');
  const [interests, setInterests]   = useState<string[]>(['Food', 'Culture']);
  const [generating, setGenerating] = useState(false);
  const [step, setStep]             = useState(0);
  const [error, setError]           = useState('');
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(stepTimerRef.current), []);

  const advanceStep = (current: number) => {
    if (current < GEN_STEPS.length - 1) {
      stepTimerRef.current = setTimeout(() => {
        setStep(current + 1);
        advanceStep(current + 1);
      }, 1100);
    }
  };

  const handleGenerate = async () => {
    if (tab === 'describe' && !prompt.trim()) return;
    if (tab === 'structured' && rows.every((r) => !r.country.trim())) return;
    setError('');
    setGenerating(true);
    setStep(0);
    advanceStep(0);

    try {
      const body =
        tab === 'describe'
          ? { freePrompt: prompt, budget, style: pace, interests, provider: getActiveProvider() }
          : {
              countryDays: rows.filter((r) => r.country.trim()).map((r) => ({ country: r.country, days: r.days })),
              budget, style: pace, interests, provider: getActiveProvider(),
              saveToTrip: true,
            };

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, saveToTrip: true }),
      });

      if (res.status === 429) { setError('Rate limit reached. Try a different AI provider.'); return; }
      if (!res.ok) { setError('Failed to generate itinerary. Please try again.'); return; }

      const data = await res.json();
      if (data.tripId) router.push(`/trips/${data.tripId}/planner`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      if (!error) setGenerating(false);
    }
  };

  const updateRow = (i: number, field: keyof CountryRow, val: string | number) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [field]: val } : r)));

  const toggleInterest = (i: string) =>
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: 'var(--pad)', overflow: 'hidden' }}>
        <div className="new-trip">

          {/* Topbar */}
          <div className="topbar">
            <div>
              <h1 className="topbar-title">
                Where to, <em style={{ fontStyle: 'italic' }}>this time?</em>
              </h1>
              <div className="topbar-sub">Describe a feeling, a country, or a list of places. We&apos;ll handle the days.</div>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="new-trip-tabs">
            <button className="new-trip-tab" data-active={tab === 'describe'} onClick={() => setTab('describe')}>Describe</button>
            <button className="new-trip-tab" data-active={tab === 'structured'} onClick={() => setTab('structured')}>Country by country</button>
          </div>

          {tab === 'describe' ? (
            <>
              <textarea
                className="new-trip-prompt"
                placeholder="A slow week in Lisbon — fado, custard tarts, no early mornings. Mid-range. Late May."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
              <div className="prompt-suggestions">
                {SUGGESTION_CHIPS.map((s) => (
                  <button key={s} className="prompt-chip" onClick={() => setPrompt(s)}>{s}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="new-trip-options" style={{ gridTemplateColumns: '1fr' }}>
              {rows.map((row, i) => (
                <div key={i} className="option-tile">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div className="option-tile-label">Leg {i + 1}</div>
                      <input
                        value={row.country}
                        onChange={(e) => updateRow(i, 'country', e.target.value)}
                        placeholder="e.g. Portugal, Japan…"
                        style={{
                          border: 'none', outline: 'none', background: 'none',
                          fontSize: 16, fontWeight: 500, color: 'var(--ink)',
                          fontFamily: 'inherit', width: '100%',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn btn-sm btn-ghost"
                        onClick={() => updateRow(i, 'days', Math.max(1, row.days - 1))}>
                        <Minus size={12} />
                      </button>
                      <span className="mono" style={{ fontSize: 15, fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                        {row.days}d
                      </span>
                      <button className="btn btn-sm btn-ghost"
                        onClick={() => updateRow(i, 'days', row.days + 1)}>
                        <Plus size={12} />
                      </button>
                      {rows.length > 1 && (
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--mute)' }}
                          onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}>×</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn" onClick={() => setRows((prev) => [...prev, { country: '', days: 3 }])}>
                <Plus size={13} /> Add another country
              </button>
            </div>
          )}

          {/* Options grid */}
          <div className="new-trip-options">
            <div className="option-tile">
              <div className="option-tile-label">Budget</div>
              <div className="option-tile-value">{budget}</div>
              <div className="option-tile-options">
                {BUDGET_OPTIONS.map((b) => (
                  <button key={b} className="option-pill" data-active={budget === b} onClick={() => setBudget(b)}>{b}</button>
                ))}
              </div>
            </div>
            <div className="option-tile">
              <div className="option-tile-label">Pace</div>
              <div className="option-tile-value">{pace}</div>
              <div className="option-tile-options">
                {PACE_OPTIONS.map((p) => (
                  <button key={p} className="option-pill" data-active={pace === p} onClick={() => setPace(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="option-tile">
              <div className="option-tile-label">Interests</div>
              <div className="option-tile-value">{interests.slice(0, 2).join(', ')}</div>
              <div className="option-tile-options">
                {INTEREST_OPTIONS.map((i) => (
                  <button key={i} className="option-pill" data-active={interests.includes(i)} onClick={() => toggleInterest(i)}>{i}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12, alignItems: 'center' }}>
            {error && <span style={{ fontSize: 13, color: 'oklch(0.55 0.15 25)' }}>{error}</span>}
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating
                ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                : <><Sparkles size={13} /> Plan the trip</>}
            </button>
          </div>

          {/* Generation progress */}
          {generating && (
            <div className="generation">
              <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.015em', marginBottom: 4, color: 'var(--ink)' }}>
                Building your itinerary
              </div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>This usually takes 20 – 40 seconds.</div>
              {GEN_STEPS.map((s, i) => (
                <div key={i} className="generation-step" data-state={i < step ? 'done' : i === step ? 'active' : 'pending'}>
                  <div className="gen-dot" />
                  <span>{s}</span>
                  {i < step && <span className="mono muted" style={{ marginLeft: 'auto', fontSize: 11 }}>done</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
