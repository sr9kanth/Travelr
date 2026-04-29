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
    { href: base,                 icon: LayoutGrid, label: 'Overview' },
    { href: `${base}/planner`,    icon: Calendar,   label: 'Planner' },
    { href: `${base}/map`,        icon: Map,        label: 'Map' },
    { href: `${base}/stays`,      icon: BedDouble,  label: 'Stays' },
    { href: `${base}/transport`,  icon: Train,      label: 'Transport' },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center gap-4 px-6 h-14">
        <Link href="/trips" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Trips
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900 truncate max-w-[200px]">{tripName}</span>
        <nav className="ml-auto flex items-center gap-1">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
