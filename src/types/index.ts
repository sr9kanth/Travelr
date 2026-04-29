export type ActivityType =
  | 'food'
  | 'sightseeing'
  | 'culture'
  | 'nature'
  | 'shopping'
  | 'experience'
  | 'transport'
  | 'accommodation'
  | 'nightlife'
  | 'sport'
  | 'wellness'
  | 'hidden_gem';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'taxi' | 'metro';
export type StayType = 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'villa' | 'guesthouse';
export type TripStatus = 'planning' | 'active' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  description?: string | null;
  location?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  cost?: number | null;
  currency: string;
  rating?: number | null;
  bookingUrl?: string | null;
  notes?: string | null;
  tags?: string | null;
  imageUrl?: string | null;
  order: number;
  timeOfDay: TimeOfDay;
  dayId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Day {
  id: string;
  date: string;
  tripId: string;
  activities: Activity[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stay {
  id: string;
  name: string;
  type: StayType;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  checkIn: string;
  checkOut: string;
  bookingRef?: string | null;
  bookingUrl?: string | null;
  cost?: number | null;
  currency: string;
  notes?: string | null;
  imageUrl?: string | null;
  tripId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transport {
  id: string;
  type: TransportType;
  fromLocation: string;
  toLocation: string;
  fromLat?: number | null;
  fromLng?: number | null;
  toLat?: number | null;
  toLng?: number | null;
  departureTime: string;
  arrivalTime: string;
  carrier?: string | null;
  bookingRef?: string | null;
  bookingUrl?: string | null;
  cost?: number | null;
  currency: string;
  notes?: string | null;
  tripId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  coverImage?: string | null;
  status: TripStatus;
  budget?: number | null;
  currency: string;
  userId: string;
  user?: User;
  days: Day[];
  stays: Stay[];
  transports: Transport[];
  createdAt: string;
  updatedAt: string;
}

export interface AISuggestion {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  duration: number;
  cost?: number;
  rating?: number;
  distance?: number;
  distanceText?: string;
  timeText?: string;
  reason: string;
  tags: string[];
  imageUrl?: string;
}

export interface MapMarkerData {
  id: string;
  name: string;
  type: 'activity' | 'stay' | 'transport';
  activityType?: ActivityType;
  lat: number;
  lng: number;
  day?: number;
  color?: string;
}
