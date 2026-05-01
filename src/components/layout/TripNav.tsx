'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, Map, BedDouble, Train, ArrowLeft } from 'lucide-react';

interface TripNavProps { tripId: string; tripName: string; }

export default function TripNav({ tripId, tripName }: TripNavProps) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = [
    { href: base,               icon: LayoutGrid, label: 'Overview' },
    { href: `${base}/planner`,  icon: Calendar,   label: 'Planner' },
    { href: `${base}/map`,      icon: Map,        label: 'Map' },
    { href: `${base}/stays`,    icon: BedDouble,  label: 'Stays' },
    { href: `${base}/transport`,icon: Train,      label: 'Transport' },
  ];

  return (
    <header style={{
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--hairline)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', height: 52 }}>
        <Link href="/trips" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--mute)', textDecoration: 'none', flexShrink: 0,
        }}>
          <ArrowLeft size={14} /> Trips
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
          {tripName}
        </span>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8,
                fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? 'var(--ink)' : 'var(--mute)',
                background: active ? 'var(--surface-2)' : 'none',
                textDecoration: 'none', transition: 'all 120ms',
              }}>
                <Icon size={13} strokeWidth={1.6} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
