import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { prisma } from '@/lib/db';

async function getStats() {
  try {
    const [tripCount, activityCount] = await Promise.all([
      prisma.trip.count(),
      prisma.activity.count(),
    ]);
    return { tripCount, activityCount };
  } catch {
    return { tripCount: 0, activityCount: 0 };
  }
}

export default async function HomePage() {
  const { tripCount } = await getStats();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, overflow: 'hidden' }}>

        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">
            <span className="dot" />
            <span>Built for slow travelers</span>
          </div>

          <h1 className="hero-title">
            Plan the trip you&apos;ll <em>actually take.</em>
          </h1>

          <div className="hero-sub">
            Tell travelr where you&apos;re headed. It returns a thoughtful itinerary —
            places, times, costs, and the spaces in between.
          </div>

          <div className="hero-input-wrap">
            <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <input placeholder="A long weekend in Lisbon, food-forward, mid-range…" readOnly />
            <Link href="/trips/new" className="btn btn-primary btn-sm">
              Plan it <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Recently planned */}
        <div style={{ padding: '32px var(--pad) 80px' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--mute)', marginBottom: 18, fontFamily: 'Geist Mono, monospace',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Your trips</span>
            <Link href="/trips" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all {tripCount > 0 ? `(${tripCount})` : ''} <ArrowRight size={11} />
            </Link>
          </div>

          {/* Quick action cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--gap)', marginBottom: 'var(--gap-lg)' }}>
            {[
              { href: '/trips/new', emoji: '✨', title: 'New AI trip', desc: 'Generate a full itinerary in seconds' },
              { href: '/trips', emoji: '🗺️', title: 'My trips', desc: `${tripCount} trip${tripCount !== 1 ? 's' : ''} planned` },
              { href: '/trips/new', emoji: '🧭', title: 'Explore ideas', desc: 'Describe a feeling, we do the rest' },
            ].map(({ href, emoji, title, desc }) => (
              <Link key={title} href={href} className="card" style={{ padding: 'var(--pad-card)', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{emoji}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--mute)' }}>{desc}</div>
              </Link>
            ))}
          </div>

          {/* Feature blurbs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap)' }}>
            {[
              { icon: '🗓️', title: 'Day-by-day planner', desc: 'Drag activities across days. Morning, afternoon, evening — always organized.' },
              { icon: '🗺️', title: 'Interactive maps', desc: 'Every stop plotted. Smart clustering to minimize travel time.' },
              { icon: '⚡', title: 'AI route optimizer', desc: 'One click to reorder activities geographically. Save hours on the road.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, padding: 'var(--pad-card)', background: 'var(--card-bg)', border: 'var(--card-border)', borderRadius: 'var(--card-radius)' }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
