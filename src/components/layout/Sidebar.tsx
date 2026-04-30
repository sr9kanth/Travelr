'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Compass, Plus, Home, Settings, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/',          icon: Home,    label: 'Dashboard' },
  { href: '/trips',     icon: Compass, label: 'My Trips' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0c0f1d 0%, #0f172a 100%)' }}>

      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="relative px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            <span className="text-lg">✈️</span>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }} />
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none tracking-tight">Travelr</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: '#6366f1' }}>AI Trip Planner</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 sidebar-scroll overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-3">Navigation</p>

        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(167,139,250,0.1))',
                border: '1px solid rgba(99,102,241,0.3)',
              } : {}}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                active ? 'bg-brand-500 shadow-lg shadow-brand-500/30' : 'bg-white/5 group-hover:bg-white/10'
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {label}
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-brand-400" />}
            </Link>
          );
        })}

        {/* New Trip CTA */}
        <Link href="/trips/new"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mt-2 text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5" />
          </div>
          New Trip
          <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">AI</span>
        </Link>

        {/* Divider */}
        <div className="border-t border-white/5 my-4" />

        {/* AI Features badge */}
        <div className="mx-1 rounded-2xl p-4 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(167,139,250,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <p className="text-sm font-bold text-white">AI Features</p>
          </div>
          <div className="space-y-1.5">
            {['Itinerary generation', 'Route optimizer', 'Explore nearby'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-400" />
                <p className="text-[11px] text-slate-400">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>A</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-none mb-0.5">Alex Wanderer</p>
            <p className="text-[11px] text-slate-500 truncate">demo@travelr.app</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  );
}
