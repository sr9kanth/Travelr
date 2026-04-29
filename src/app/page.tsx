import Link from 'next/link';
import { MapPin, Sparkles, Calendar, Navigation, ArrowRight, Globe, Zap, Users } from 'lucide-react';
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
    { icon: Sparkles, title: 'AI Itinerary Generator', desc: 'Describe your dream trip and let Claude AI craft a complete day-by-day itinerary with real places.' },
    { icon: MapPin, title: 'Interactive Maps', desc: 'Visualize every activity, stay, and transport leg on a beautiful interactive map with smart clustering.' },
    { icon: Navigation, title: 'Smart Route Optimizer', desc: 'AI clusters nearby activities to minimize travel time and maximize your exploration time.' },
    { icon: Calendar, title: 'Day-by-Day Planner', desc: 'Drag-and-drop activities across days. Organize by Morning, Afternoon, Evening, and Night.' },
    { icon: Zap, title: 'Real-Time Suggestions', desc: 'Explore Nearby: AI surfaces hidden gems, cafés, and attractions within your chosen radius.' },
    { icon: Globe, title: 'Stays & Transport', desc: 'Track hotels, flights, trains, and every transport leg in one organized timeline.' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-[260px] flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative px-12 py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span>Powered by Claude AI</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight max-w-2xl">
              Plan extraordinary trips with{' '}
              <span className="gradient-text">AI intelligence</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl leading-relaxed">
              Google Maps meets Notion meets your personal AI travel agent.
              Structured planning, spatial intelligence, and smart suggestions — all in one.
            </p>
            <div className="flex gap-4">
              <Link href="/trips/new" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25">
                Start Planning
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/trips" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all">
                View Trips
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: tripCount.toString(), label: 'Trips planned' },
                { value: activityCount.toString(), label: 'Activities tracked' },
                { value: '6', label: 'Activity categories' },
                { value: 'AI', label: 'Powered suggestions' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-12 py-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/trips/new" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
                <Sparkles className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">New Trip with AI</p>
                <p className="text-sm text-slate-500">Generate a full itinerary</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-400 ml-auto transition-colors" />
            </Link>

            <Link href="/trips" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-violet-50 group-hover:bg-violet-100 rounded-xl flex items-center justify-center transition-colors">
                <Globe className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">My Trips</p>
                <p className="text-sm text-slate-500">View all {tripCount} trips</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 ml-auto transition-colors" />
            </Link>

            <div className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Collaborate</p>
                <p className="text-sm text-slate-500">Share & plan together</p>
              </div>
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Soon</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-12 pb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Everything you need to travel better</h2>
          <div className="grid grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 bg-white rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
