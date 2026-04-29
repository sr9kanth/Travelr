'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Compass, Plus, Home, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/',          icon: Home,     label: 'Dashboard' },
  { href: '/trips',     icon: Compass,  label: 'My Trips' },
  { href: '/trips/new', icon: Plus,     label: 'New Trip', highlight: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-lg">✈️</span>
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">Travelr</p>
            <p className="text-slate-400 text-xs">AI Trip Planner</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, highlight }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : highlight
                  ? 'bg-slate-800 text-brand-400 hover:bg-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {highlight && !active && (
                <span className="ml-auto text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">New</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Badge */}
      <div className="px-4 py-3 mx-3 mb-4 bg-gradient-to-r from-brand-900/50 to-violet-900/50 rounded-xl border border-brand-800/50">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <p className="text-sm font-medium text-brand-300">AI Powered</p>
        </div>
        <p className="text-xs text-slate-400">Smart suggestions, route optimization, and itinerary generation.</p>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">A</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Alex Wanderer</p>
            <p className="text-xs text-slate-500 truncate">demo@travelr.app</p>
          </div>
          <button className="ml-auto p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
