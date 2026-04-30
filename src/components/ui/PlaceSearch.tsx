'use client';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  address: { country?: string; city?: string; town?: string; state?: string };
  type: string;
}

interface PlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function getShortName(r: NominatimResult): string {
  const a = r.address;
  if (r.name && (a.country || a.state)) {
    const region = a.city ?? a.town ?? a.state ?? a.country ?? '';
    return region && region !== r.name ? `${r.name}, ${a.country ?? ''}` : r.name;
  }
  // Fall back to first two parts of display_name
  return r.display_name.split(',').slice(0, 2).join(',').trim();
}

export default function PlaceSearch({ value, onChange, placeholder, className }: PlaceSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value → local query when value changes from outside
  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&featuretype=country,city,state`,
          { headers: { 'Accept-Language': 'en' } },
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (r: NominatimResult) => {
    const name = getShortName(r);
    setQuery(name);
    onChange(name);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); search(e.target.value); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Search city or country…'}
          className="w-full pl-8 pr-8 py-0 h-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {loading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />}
        {!loading && query && (
          <button type="button" onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-[9999] overflow-hidden">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-brand-50 text-left transition-colors border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{getShortName(r)}</p>
                <p className="text-[11px] text-slate-400 truncate">{r.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
