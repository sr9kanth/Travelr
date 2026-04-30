'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, Map, BedDouble, Train, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripNavProps { tripId: string; tripName: string; }

export default function TripNav({ tripId, tripName }: TripNavProps) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = [
    { href: base,                icon: LayoutGrid, label: 'Overview' },
    { href: `${base}/planner`,   icon: Calendar,   label: 'Planner' },
    { href: `${base}/map`,       icon: Map,        label: 'Map' },
    { href: `${base}/stays`,     icon: BedDouble,  label: 'Stays' },
    { href: `${base}/transport`, icon: Train,      label: 'Transport' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 px-6 h-14">
        <Link href="/trips"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors shrink-0 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Trips
        </Link>
        <span className="text-slate-200 text-lg">/</span>
        <span className="font-bold text-slate-900 truncate max-w-[220px] text-sm">{tripName}</span>

        <nav className="ml-auto flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  active
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
