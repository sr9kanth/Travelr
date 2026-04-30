'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, ChevronDown, Check, Lock, AlertTriangle, Zap } from 'lucide-react';
import { useAIStore } from '@/store/aiStore';
import type { AIProvider, ProviderStatus } from '@/lib/ai';

const PROVIDER_ICONS: Record<AIProvider, string> = {
  anthropic: '🤖',
  gemini: '✨',
  groq: '⚡',
  moonshot: '🌙',
  mock: '🎭',
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  anthropic: '#d97706',
  gemini: '#4285f4',
  groq: '#10b981',
  moonshot: '#6366f1',
  mock: '#8b5cf6',
};

function StatusBadge({ provider }: { provider: ProviderStatus }) {
  if (!provider.hasKey && provider.id !== 'mock') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
        <Lock className="w-2.5 h-2.5" />
        No key
      </span>
    );
  }
  if (provider.rateLimited) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="w-2.5 h-2.5" />
        Rate limited
      </span>
    );
  }
  if (provider.free) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
        <Zap className="w-2.5 h-2.5" />
        Free
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
      Pro
    </span>
  );
}

interface DropdownPos { top: number; left: number; width: number; }

export default function AIProviderPicker() {
  const { providers, defaultProvider, selectedProvider, loaded, setProvider, setProviders, getActiveProvider } = useAIStore();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/ai/providers')
      .then((r) => r.json())
      .then(({ providers: p, defaultProvider: d }) => setProviders(p, d))
      .catch(() => {});
  }, [setProviders]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Open above the button
    setPos({ top: rect.top - 8, left: rect.left, width: rect.width });
    setOpen((v) => !v);
  };

  const active = getActiveProvider();
  const activeColor = PROVIDER_COLORS[active];
  const activeIcon = PROVIDER_ICONS[active];
  const activeProvider = providers.find((p) => p.id === active);

  const dropdown = open && pos && mounted ? createPortal(
    <div
      className="fixed z-[9999] bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/40 overflow-hidden animate-scale-in"
      style={{
        top: pos.top,
        left: pos.left,
        width: Math.max(pos.width, 260),
        transform: 'translateY(-100%)',
      }}
    >
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-brand-400" />
          Choose AI Model
        </p>
      </div>
      <div className="p-1.5 space-y-0.5">
        {(loaded ? providers : []).map((provider) => {
          const disabled = !provider.available;
          const isSelected = (selectedProvider ?? defaultProvider) === provider.id;
          const color = PROVIDER_COLORS[provider.id];

          return (
            <button
              key={provider.id}
              disabled={disabled}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { setProvider(provider.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
              }`}
              style={isSelected ? { backgroundColor: `${color}12`, outline: `1px solid ${color}30` } : {}}
            >
              <span className="text-lg leading-none">{PROVIDER_ICONS[provider.id]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-slate-800">{provider.name}</span>
                  <StatusBadge provider={provider} />
                </div>
                <p className="text-[10px] text-slate-400 truncate">{provider.description}</p>
                <p className="text-[10px] text-slate-300 truncate font-mono">
                  {provider.model !== 'mock' ? provider.model : 'sample data'}
                </p>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:shadow-sm text-left"
        style={{ borderColor: `${activeColor}30`, backgroundColor: `${activeColor}08` }}
      >
        <span className="text-base leading-none">{activeIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: activeColor }}>
            {activeProvider?.name ?? 'AI Model'}
          </p>
          {activeProvider && (
            <p className="text-[10px] text-slate-400 truncate">{activeProvider.model}</p>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: activeColor }}
        />
      </button>
      {dropdown}
    </>
  );
}
