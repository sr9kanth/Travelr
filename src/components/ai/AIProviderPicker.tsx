'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type AIProvider = 'anthropic' | 'gemini' | 'groq' | 'moonshot' | 'mock';

const PROVIDERS: Array<{
  id: AIProvider;
  name: string;
  emoji: string;
  desc: string;
}> = [
  { id: 'anthropic', name: 'Claude',   emoji: '🤖', desc: 'Anthropic' },
  { id: 'gemini',    name: 'Gemini',   emoji: '✨', desc: 'Google' },
  { id: 'groq',      name: 'Groq',     emoji: '⚡', desc: 'Llama 3.3' },
  { id: 'moonshot',  name: 'Kimi',     emoji: '🌙', desc: 'Moonshot AI' },
  { id: 'mock',      name: 'Demo',     emoji: '🎭', desc: 'Sample data' },
];

const STORAGE_KEY = 'travelr-ai-provider';

export function getActiveProvider(): AIProvider {
  if (typeof window === 'undefined') return 'mock';
  return (localStorage.getItem(STORAGE_KEY) as AIProvider) ?? 'mock';
}

export default function AIProviderPicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AIProvider>('mock');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as AIProvider | null;
    if (stored) setSelected(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.top - 4, left: rect.left, width: Math.max(rect.width, 240) });
    setOpen((v) => !v);
  };

  const handleSelect = (id: AIProvider) => {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
  };

  const current = PROVIDERS.find((p) => p.id === selected) ?? PROVIDERS[4];

  const dropdown = open && pos && mounted ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        transform: 'translateY(-100%)',
        zIndex: 9999,
        background: 'var(--card-bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        padding: 4,
      }}
    >
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          onMouseDown={() => handleSelect(p.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: selected === p.id ? 'var(--surface-2)' : 'none',
            textAlign: 'left', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 16 }}>{p.emoji}</span>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)', fontWeight: selected === p.id ? 500 : 400 }}>{p.name}</span>
          <span style={{ fontSize: 11, color: 'var(--mute)' }}>{p.desc}</span>
        </button>
      ))}
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="nav-item"
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        <span style={{ fontSize: 15 }}>{current.emoji}</span>
        <span style={{ flex: 1, fontSize: 13 }}>{current.name}</span>
        <span style={{ fontSize: 10, color: 'var(--mute-2)' }}>▾</span>
      </button>
      {dropdown}
    </>
  );
}
