import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';
import type { ActivityType, TimeOfDay } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function tripDuration(startDate: string, endDate: string) {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function parseTags(tags?: string | null): string[] {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return []; }
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  food:          '#f59e0b',
  sightseeing:   '#6366f1',
  culture:       '#8b5cf6',
  nature:        '#10b981',
  shopping:      '#ec4899',
  experience:    '#06b6d4',
  transport:     '#64748b',
  accommodation: '#f97316',
  nightlife:     '#a855f7',
  sport:         '#14b8a6',
  wellness:      '#84cc16',
  hidden_gem:    '#f43f5e',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  food:          '🍽️',
  sightseeing:   '🏛️',
  culture:       '🎭',
  nature:        '🌿',
  shopping:      '🛍️',
  experience:    '✨',
  transport:     '🚆',
  accommodation: '🏨',
  nightlife:     '🌙',
  sport:         '⚽',
  wellness:      '🧘',
  hidden_gem:    '💎',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  food:          'Food & Dining',
  sightseeing:   'Sightseeing',
  culture:       'Culture & Arts',
  nature:        'Nature',
  shopping:      'Shopping',
  experience:    'Experience',
  transport:     'Transport',
  accommodation: 'Accommodation',
  nightlife:     'Nightlife',
  sport:         'Sport',
  wellness:      'Wellness',
  hidden_gem:    'Hidden Gem',
};

export const TIME_OF_DAY_ORDER: Record<TimeOfDay, number> = {
  morning: 0, afternoon: 1, evening: 2, night: 3,
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', night: '🌙 Night',
};

export const TRANSPORT_ICONS: Record<string, string> = {
  flight: '✈️', train: '🚄', bus: '🚌', car: '🚗', ferry: '⛴️', taxi: '🚕', metro: '🚇',
};

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getTripCoverImage(trip: { coverImage?: string | null; name: string }) {
  if (trip.coverImage) return trip.coverImage;
  const defaults = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200',
  ];
  return defaults[trip.name.length % defaults.length];
}
