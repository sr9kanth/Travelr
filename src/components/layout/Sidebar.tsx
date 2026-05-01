'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Plus, Home, Settings } from 'lucide-react';
import AIProviderPicker from '@/components/ai/AIProviderPicker';

const navItems = [
  { href: '/',          icon: Home,    label: 'Home' },
  { href: '/trips',     icon: Compass, label: 'Trips' },
  { href: '/trips/new', icon: Plus,    label: 'New trip' },
];

const pinned = [
  { key: 'lisbon', label: 'Lisbon, Slowly', flag: '🇵🇹' },
  { key: 'kyoto',  label: 'Kyoto in Bloom', flag: '🇯🇵' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" style={{ width: 'var(--sidebar-width)' }}>
      {/* Brand */}
      <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-mark">t</div>
        <div className="brand-name">travelr</div>
      </Link>

      {/* Main nav */}
      <div className="nav-section">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="nav-item" data-active={active}>
              <Icon size={16} strokeWidth={1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Pinned trips */}
      <div className="nav-section">
        <div className="nav-label">Pinned</div>
        {pinned.map((p) => (
          <Link key={p.key} href="/trips" className="nav-item">
            <span style={{ fontSize: 14 }}>{p.flag}</span>
            <span style={{ fontSize: 13 }}>{p.label}</span>
          </Link>
        ))}
      </div>

      {/* AI provider (pushed toward footer) */}
      <div className="nav-section" style={{ marginTop: 'auto' }}>
        <div className="nav-label">AI Model</div>
        <AIProviderPicker />
      </div>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">SK</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">Srikanth</div>
            <div className="user-mail">on the road</div>
          </div>
          <Settings size={14} strokeWidth={1.6} style={{ color: 'var(--mute)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
