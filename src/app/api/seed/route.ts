import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';

// One-time seed endpoint — visit /api/seed?token=travelr-seed once after deploy
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== 'travelr-seed') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.trip.count();
  if (existing > 0) {
    return NextResponse.json({ message: `Already seeded (${existing} trips exist)` });
  }

  const user = await prisma.user.upsert({
    where: { email: 'demo@travelr.app' },
    update: {},
    create: { email: 'demo@travelr.app', name: 'Alex Wanderer' },
  });

  const start = new Date('2025-06-10');
  const trip = await prisma.trip.create({
    data: {
      name: 'Paris & Amsterdam Adventure',
      description: "A magical 7-day journey through iconic European capitals — art, food, canals, and culture.",
      startDate: start,
      endDate: addDays(start, 6),
      coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200',
      status: 'planning',
      budget: 3500,
      currency: 'EUR',
      userId: user.id,
    },
  });

  const days = await Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      prisma.day.create({ data: { date: addDays(start, i), tripId: trip.id } })
    )
  );

  await prisma.activity.createMany({
    data: [
      { name: 'Check in – Hôtel Le Marais', type: 'accommodation', location: 'Le Marais', address: '12 Rue de Bretagne, 75003 Paris', lat: 48.8611, lng: 2.3598, startTime: '15:00', duration: 60, cost: 0, timeOfDay: 'afternoon', order: 0, dayId: days[0].id },
      { name: 'Stroll along the Seine', type: 'sightseeing', address: 'Quai de la Mégisserie, Paris', lat: 48.8584, lng: 2.3470, startTime: '17:00', duration: 120, cost: 0, timeOfDay: 'afternoon', order: 1, dayId: days[0].id },
      { name: 'Dinner at Bistro Paul Bert', type: 'food', address: '18 Rue Paul Bert, 75011 Paris', lat: 48.8531, lng: 2.3800, startTime: '20:00', duration: 120, cost: 65, timeOfDay: 'evening', order: 2, dayId: days[0].id, rating: 4.8 },
      { name: 'Eiffel Tower', type: 'sightseeing', address: 'Champ de Mars, 75007 Paris', lat: 48.8584, lng: 2.2945, startTime: '09:00', duration: 150, cost: 28, timeOfDay: 'morning', order: 0, dayId: days[1].id, rating: 4.7, bookingUrl: 'https://www.toureiffel.paris', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600' },
      { name: 'Café de Flore', type: 'food', address: '172 Bd Saint-Germain, 75006 Paris', lat: 48.8539, lng: 2.3328, startTime: '12:00', duration: 60, cost: 25, timeOfDay: 'afternoon', order: 1, dayId: days[1].id, rating: 4.5 },
      { name: 'Musée du Louvre', type: 'culture', address: 'Rue de Rivoli, 75001 Paris', lat: 48.8606, lng: 2.3376, startTime: '14:00', duration: 180, cost: 22, timeOfDay: 'afternoon', order: 2, dayId: days[1].id, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600' },
      { name: 'Montmartre & Sacré-Cœur', type: 'sightseeing', address: '35 Rue du Chevalier de la Barre, 75018 Paris', lat: 48.8867, lng: 2.3431, startTime: '18:00', duration: 120, cost: 0, timeOfDay: 'evening', order: 3, dayId: days[1].id, rating: 4.8 },
      { name: 'Palace of Versailles', type: 'culture', address: "Place d'Armes, 78000 Versailles", lat: 48.8049, lng: 2.1204, startTime: '09:30', duration: 270, cost: 20, timeOfDay: 'morning', order: 0, dayId: days[2].id, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600' },
      { name: 'Thalys Train to Amsterdam', type: 'transport', address: 'Gare du Nord, 75010 Paris', lat: 48.8809, lng: 2.3553, startTime: '10:16', duration: 204, cost: 89, timeOfDay: 'morning', order: 0, dayId: days[3].id },
      { name: 'Check in – Canal House Hotel', type: 'accommodation', address: 'Keizersgracht 148, 1015 CX Amsterdam', lat: 52.3732, lng: 4.8831, startTime: '15:00', duration: 60, cost: 0, timeOfDay: 'afternoon', order: 1, dayId: days[3].id },
      { name: 'Anne Frank House', type: 'culture', address: 'Westermarkt 20, 1016 GV Amsterdam', lat: 52.3752, lng: 4.8840, startTime: '09:00', duration: 120, cost: 16, timeOfDay: 'morning', order: 0, dayId: days[4].id, rating: 4.8 },
      { name: 'Rijksmuseum', type: 'culture', address: 'Museumstraat 1, 1071 XX Amsterdam', lat: 52.3600, lng: 4.8852, startTime: '11:30', duration: 150, cost: 22.5, timeOfDay: 'morning', order: 1, dayId: days[4].id, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1576467560921-c3ed7a7e82d4?w=600' },
      { name: 'Canal Boat Tour', type: 'experience', address: 'Damrak 26, 1012 LJ Amsterdam', lat: 52.3767, lng: 4.8985, startTime: '16:00', duration: 90, cost: 18, timeOfDay: 'afternoon', order: 2, dayId: days[4].id, rating: 4.7 },
      { name: 'Van Gogh Museum', type: 'culture', address: 'Museumplein 6, 1071 DJ Amsterdam', lat: 52.3584, lng: 4.8811, startTime: '15:30', duration: 120, cost: 22, timeOfDay: 'afternoon', order: 0, dayId: days[5].id, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1584553421349-3557471bed79?w=600' },
      { name: 'Farewell Dinner – De Kas', type: 'food', address: 'Kamerlingh Onneslaan 3, 1097 DE Amsterdam', lat: 52.3573, lng: 4.9356, startTime: '19:30', duration: 150, cost: 85, timeOfDay: 'evening', order: 1, dayId: days[5].id, rating: 4.9 },
      { name: 'Morning Coffee – Lot Sixty One', type: 'food', address: 'Kinkerstraat 112, 1053 ED Amsterdam', lat: 52.3680, lng: 4.8726, startTime: '08:30', duration: 60, cost: 8, timeOfDay: 'morning', order: 0, dayId: days[6].id, rating: 4.7 },
      { name: 'Airport Transfer', type: 'transport', address: 'Schiphol, 1118 CP Amsterdam', lat: 52.3105, lng: 4.7683, startTime: '14:00', duration: 90, cost: 20, timeOfDay: 'afternoon', order: 1, dayId: days[6].id },
    ],
  });

  await prisma.stay.createMany({
    data: [
      { name: 'Hôtel Le Marais', type: 'hotel', address: '12 Rue de Bretagne, 75003 Paris', lat: 48.8611, lng: 2.3598, checkIn: addDays(start, 0), checkOut: addDays(start, 3), cost: 480, currency: 'EUR', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', tripId: trip.id },
      { name: 'Canal House Hotel', type: 'hotel', address: 'Keizersgracht 148, 1015 CX Amsterdam', lat: 52.3732, lng: 4.8831, checkIn: addDays(start, 3), checkOut: addDays(start, 7), cost: 640, currency: 'EUR', imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600', tripId: trip.id },
    ],
  });

  await prisma.transport.createMany({
    data: [
      { type: 'flight', fromLocation: 'New York JFK', toLocation: 'Paris CDG', fromLat: 40.6413, fromLng: -73.7781, toLat: 49.0097, toLng: 2.5478, departureTime: addDays(start, 0), arrivalTime: new Date(addDays(start, 0).getTime() + 7.5 * 3600000), carrier: 'Air France AF007', bookingRef: 'XKPL92', cost: 680, currency: 'EUR', tripId: trip.id },
      { type: 'train', fromLocation: 'Paris Gare du Nord', toLocation: 'Amsterdam Centraal', fromLat: 48.8809, fromLng: 2.3553, toLat: 52.3791, toLng: 4.9003, departureTime: new Date(addDays(start, 3).setHours(10, 16)), arrivalTime: new Date(addDays(start, 3).setHours(13, 40)), carrier: 'Thalys THA9321', bookingRef: 'THL4821', cost: 89, currency: 'EUR', tripId: trip.id },
      { type: 'flight', fromLocation: 'Amsterdam Schiphol', toLocation: 'New York JFK', fromLat: 52.3105, fromLng: 4.7683, toLat: 40.6413, toLng: -73.7781, departureTime: new Date(addDays(start, 6).setHours(17, 30)), arrivalTime: new Date(addDays(start, 6).setHours(20, 0)), carrier: 'Delta DL407', bookingRef: 'DLT7731', cost: 620, currency: 'EUR', tripId: trip.id },
    ],
  });

  return NextResponse.json({ success: true, message: 'Demo data seeded! Paris & Amsterdam trip created with 17 activities, 2 stays, 3 transport legs.' });
}
