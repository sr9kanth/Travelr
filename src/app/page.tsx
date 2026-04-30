import Link from 'next/link';
import { MapPin, Sparkles, Calendar, Navigation, ArrowRight, Globe, Zap, Users, Star, TrendingUp, Shield } from 'lucide-react';
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
  const { tripCount, activityCount } = await getStats();

  const features = [
    { icon: Sparkles, title: 'AI Itinerary Generator', desc: 'Describe your dream trip and Claude AI crafts a complete day-by-day plan with real places and coordinates.', color: 'from-violet-500 to-brand-500', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { icon: MapPin, title: 'Interactive Maps', desc: 'Every activity, stay, and transport leg plotted on a beautiful live map with smart category filtering.', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
    { icon: Navigation, title: 'Smart Route Optimizer', desc: 'AI clusters nearby activities to minimize travel time. One click reorders your day geographically.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: Calendar, title: 'Day-by-Day Planner', desc: 'Drag and drop activities across days and time slots. Morning, Afternoon, Evening, Night — perfectly organized.', color: 'from-brand-500 to-violet-500', bg: 'bg-brand-50', iconColor: 'text-brand-600' },
    { icon: Zap, title: 'Explore Nearby', desc: 'AI surfaces hidden gems, cafés, and attractions within your chosen radius — updated in real time.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: Globe, title: 'Stays & Transport', desc: 'Track every hotel, flight, and train in one timeline. Booking refs, costs, and check-in details always at hand.', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', iconColor: 'text-pink-600' },
  ];

  const testimonials = [
    { name: 'Sarah K.', trip: 'Tokyo → Kyoto', text: 'The AI planned our 10-day Japan trip in under a minute. Every suggestion was spot on.', avatar: 'S' },
    { name: 'Marcus T.', trip: 'Paris → Amsterdam', text: 'The map view alone is worth it. I could finally see how our days were actually clustered.', avatar: 'M' },
    { name: 'Priya R.', trip: 'Barcelona loop', text: 'Explore Nearby found a rooftop bar we never would have found ourselves. Absolute game changer.', avatar: 'P' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="ml-[260px] flex-1 overflow-x-hidden">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden animated-gradient noise min-h-[580px] flex items-center">
          {/* Glow orbs */}
          <div className="absolute top-[-80px] left-[10%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-60px] right-[5%] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />

          <div className="relative z-10 px-12 py-16 w-full">
            <div className="flex items-start justify-between gap-8">
              {/* Left content */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-7 glass-dark text-slate-200 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 dot-pulse" />
                  Powered by Claude AI
                </div>

                <h1 className="text-[52px] font-black leading-[1.1] mb-5 text-white tracking-tight">
                  Travel planning,<br />
                  <span className="gradient-text">reimagined.</span>
                </h1>

                <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed font-light">
                  The intelligence of an AI travel agent. The structure of Notion.
                  The spatial awareness of Google Maps — all in one.
                </p>

                <div className="flex gap-3">
                  <Link
                    href="/trips/new"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-slate-900 font-bold rounded-2xl transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    <Sparkles className="w-4 h-4 text-brand-500 group-hover:rotate-12 transition-transform" />
                    Start Planning Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/trips"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all"
                  >
                    View Demo Trips
                  </Link>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
                  {[
                    { value: tripCount || '∞', label: 'Trips planned', icon: '✈️' },
                    { value: activityCount || '∞', label: 'Activities tracked', icon: '📍' },
                    { value: '12', label: 'Activity types', icon: '🎯' },
                    { value: 'AI', label: 'Powered', icon: '✨' },
                  ].map(({ value, label, icon }) => (
                    <div key={label}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-base">{icon}</span>
                        <p className="text-2xl font-black text-white stat-number">{value}</p>
                      </div>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — floating UI mockup */}
              <div className="hidden xl:block shrink-0 w-[320px] animate-float">
                <div className="glass rounded-2xl p-4 shadow-2xl shadow-brand-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-slate-500 font-medium">Day 2 — Paris</span>
                  </div>
                  {[
                    { icon: '🏛️', name: 'Eiffel Tower', time: '09:00', cost: '€28', color: '#6366f1' },
                    { icon: '☕', name: 'Café de Flore', time: '12:00', cost: '€25', color: '#f59e0b' },
                    { icon: '🎭', name: 'Musée du Louvre', time: '14:00', cost: '€22', color: '#8b5cf6' },
                    { icon: '🌆', name: 'Montmartre', time: '18:00', cost: 'Free', color: '#10b981' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl mb-2 last:mb-0 bg-white/60 hover:bg-white/90 transition-colors cursor-default"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${item.color}18` }}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.time}</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.cost}</span>
                    </div>
                  ))}
                  <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-brand-500/10 to-violet-500/10 border border-brand-200/50 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <p className="text-[10px] text-brand-700 font-medium">AI suggests: Hidden bistro 200m away ✨</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick actions ──────────────────────────────────────── */}
        <section className="px-12 py-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                href: '/trips/new',
                gradient: 'from-brand-500 to-violet-600',
                icon: Sparkles,
                title: 'New AI Trip',
                desc: 'Generate a full itinerary in seconds',
                badge: null,
              },
              {
                href: '/trips',
                gradient: 'from-cyan-500 to-blue-600',
                icon: Globe,
                title: 'My Trips',
                desc: `${tripCount} trip${tripCount !== 1 ? 's' : ''} planned`,
                badge: null,
              },
              {
                href: '#',
                gradient: 'from-slate-400 to-slate-500',
                icon: Users,
                title: 'Collaborate',
                desc: 'Plan trips together',
                badge: 'Soon',
              },
            ].map(({ href, gradient, icon: Icon, title, desc, badge }) => (
              <Link
                key={title}
                href={href}
                className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  {badge
                    ? <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">{badge}</span>
                    : <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                  }
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────── */}
        <section className="px-12 pb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">Everything included</p>
              <h2 className="text-2xl font-bold text-slate-900">Built for serious travellers</h2>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-300" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, bg, iconColor }, i) => (
              <div
                key={title}
                className="group card p-5 cursor-default"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────── */}
        <section className="px-12 pb-12">
          <div className="grid grid-cols-3 gap-4">
            {testimonials.map(({ name, trip, text, avatar }) => (
              <div key={name} className="card p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4 italic">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-400">{trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ─────────────────────────────────────────── */}
        <section className="px-12 pb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-violet-600 to-brand-700 p-10 text-white text-center noise">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="relative z-10">
              <Shield className="w-8 h-8 mx-auto mb-4 text-brand-200" />
              <h2 className="text-3xl font-black mb-2">Your next adventure awaits</h2>
              <p className="text-brand-200 mb-6 max-w-md mx-auto">Let AI do the heavy lifting. You focus on the experience.</p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-600 font-bold rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Plan your trip now
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
