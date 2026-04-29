import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@travelr.app' },
    update: {},
    create: { email: 'demo@travelr.app', name: 'Alex Wanderer', avatar: null },
  });

  // ── Paris & Amsterdam Trip ────────────────────────────────────────────────
  const start = new Date('2025-06-10');
  const trip = await prisma.trip.create({
    data: {
      name: 'Paris & Amsterdam Adventure',
      description: 'A magical 7-day journey through iconic European capitals — art, food, canals, and culture.',
      startDate: start,
      endDate: addDays(start, 6),
      coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200',
      status: 'planning',
      budget: 3500,
      currency: 'EUR',
      userId: user.id,
    },
  });

  // Days
  const days = await Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      prisma.day.create({
        data: { date: addDays(start, i), tripId: trip.id, notes: i === 0 ? 'Arrival day – take it easy' : undefined },
      })
    )
  );

  // Day 1 – Paris Arrival
  await prisma.activity.createMany({
    data: [
      { name: 'Check in – Hôtel Le Marais', type: 'accommodation', location: 'Le Marais', address: '12 Rue de Bretagne, 75003 Paris', lat: 48.8611, lng: 2.3598, startTime: '15:00', endTime: '16:00', duration: 60, cost: 0, timeOfDay: 'afternoon', order: 0, dayId: days[0].id, description: 'Boutique hotel in the heart of Le Marais', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
      { name: 'Stroll along the Seine', type: 'sightseeing', location: 'Seine Riverbank', address: 'Quai de la Mégisserie, Paris', lat: 48.8584, lng: 2.3470, startTime: '17:00', endTime: '19:00', duration: 120, cost: 0, timeOfDay: 'afternoon', order: 1, dayId: days[0].id, description: 'A leisurely evening walk by the river' },
      { name: 'Dinner at Bistro Paul Bert', type: 'food', location: 'Faubourg Saint-Antoine', address: '18 Rue Paul Bert, 75011 Paris', lat: 48.8531, lng: 2.3800, startTime: '20:00', endTime: '22:00', duration: 120, cost: 65, timeOfDay: 'evening', order: 2, dayId: days[0].id, description: 'Classic French bistro, legendary steak frites', rating: 4.8, tags: '["french","bistro","classic"]' },
    ],
  });

  // Day 2 – Paris Highlights
  await prisma.activity.createMany({
    data: [
      { name: 'Eiffel Tower', type: 'sightseeing', location: 'Champ de Mars', address: 'Champ de Mars, 75007 Paris', lat: 48.8584, lng: 2.2945, startTime: '09:00', endTime: '11:30', duration: 150, cost: 28, timeOfDay: 'morning', order: 0, dayId: days[1].id, description: 'Iconic iron lattice tower, ascend for panoramic views', rating: 4.7, bookingUrl: 'https://www.toureiffel.paris', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', tags: '["iconic","landmark","views"]' },
      { name: 'Café de Flore', type: 'food', location: 'Saint-Germain-des-Prés', address: '172 Bd Saint-Germain, 75006 Paris', lat: 48.8539, lng: 2.3328, startTime: '12:00', endTime: '13:00', duration: 60, cost: 25, timeOfDay: 'afternoon', order: 1, dayId: days[1].id, description: 'Historic literary café, perfect for lunch', rating: 4.5, tags: '["cafe","iconic","literary"]' },
      { name: 'Musée du Louvre', type: 'culture', location: '1st Arrondissement', address: 'Rue de Rivoli, 75001 Paris', lat: 48.8606, lng: 2.3376, startTime: '14:00', endTime: '17:00', duration: 180, cost: 22, timeOfDay: 'afternoon', order: 2, dayId: days[1].id, description: "World's largest art museum, home to the Mona Lisa", rating: 4.6, bookingUrl: 'https://www.louvre.fr', imageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600', tags: '["museum","art","mona lisa"]' },
      { name: 'Montmartre & Sacré-Cœur', type: 'sightseeing', location: 'Montmartre', address: '35 Rue du Chevalier de la Barre, 75018 Paris', lat: 48.8867, lng: 2.3431, startTime: '18:00', endTime: '20:00', duration: 120, cost: 0, timeOfDay: 'evening', order: 3, dayId: days[1].id, description: 'Hilltop district with stunning views and artistic heritage', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600', tags: '["hill","views","art"]' },
    ],
  });

  // Day 3 – Versailles Day Trip
  await prisma.activity.createMany({
    data: [
      { name: 'Palace of Versailles', type: 'culture', location: 'Versailles', address: 'Place d\'Armes, 78000 Versailles', lat: 48.8049, lng: 2.1204, startTime: '09:30', endTime: '14:00', duration: 270, cost: 20, timeOfDay: 'morning', order: 0, dayId: days[2].id, description: 'Opulent royal château and gardens, a UNESCO World Heritage site', rating: 4.7, bookingUrl: 'https://en.chateauversailles.fr', imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600', tags: '["palace","UNESCO","gardens"]' },
      { name: 'Gardens of Versailles Picnic', type: 'nature', location: 'Versailles Gardens', address: 'Jardins de Versailles, 78000', lat: 48.8044, lng: 2.1110, startTime: '14:00', endTime: '15:30', duration: 90, cost: 15, timeOfDay: 'afternoon', order: 1, dayId: days[2].id, description: 'Picnic among the grand fountains and manicured hedges', tags: '["outdoor","relaxing","picnic"]' },
      { name: 'Le Grand Véfour', type: 'food', location: 'Palais Royal', address: '17 Rue de Beaujolais, 75001 Paris', lat: 48.8640, lng: 2.3368, startTime: '20:00', endTime: '22:30', duration: 150, cost: 120, timeOfDay: 'evening', order: 2, dayId: days[2].id, description: 'One of Paris\'s most beautiful restaurants', rating: 4.9, tags: '["fine dining","historic","french"]' },
    ],
  });

  // Day 4 – Travel Paris → Amsterdam
  await prisma.activity.createMany({
    data: [
      { name: 'Thalys Train to Amsterdam', type: 'transport', location: 'Gare du Nord → Amsterdam Centraal', address: 'Gare du Nord, 75010 Paris', lat: 48.8809, lng: 2.3553, startTime: '10:16', endTime: '13:40', duration: 204, cost: 89, timeOfDay: 'morning', order: 0, dayId: days[3].id, description: 'High-speed train through the French and Dutch countryside', tags: '["train","high-speed","travel"]' },
      { name: 'Check in – Canal House Hotel', type: 'accommodation', location: 'Keizersgracht, Amsterdam', address: 'Keizersgracht 148, 1015 CX Amsterdam', lat: 52.3732, lng: 4.8831, startTime: '15:00', endTime: '16:00', duration: 60, cost: 0, timeOfDay: 'afternoon', order: 1, dayId: days[3].id, description: 'Charming 17th-century canal house hotel', imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600' },
      { name: 'Vondelpark Evening Walk', type: 'nature', location: 'Vondelpark', address: 'Vondelpark 1, 1071 AA Amsterdam', lat: 52.3580, lng: 4.8686, startTime: '17:30', endTime: '19:00', duration: 90, cost: 0, timeOfDay: 'afternoon', order: 2, dayId: days[3].id, description: 'Amsterdam\'s beloved central park', tags: '["park","walk","relaxing"]' },
      { name: 'Rijksmuseum Quarter Dinner', type: 'food', location: 'Museum Quarter', address: 'Jan Luijkenstraat, Amsterdam', lat: 52.3597, lng: 4.8844, startTime: '19:30', endTime: '21:30', duration: 120, cost: 55, timeOfDay: 'evening', order: 3, dayId: days[3].id, description: 'Dinner in Amsterdam\'s chic museum quarter', tags: '["dutch","dinner","cozy"]' },
    ],
  });

  // Day 5 – Amsterdam Highlights
  await prisma.activity.createMany({
    data: [
      { name: 'Anne Frank House', type: 'culture', location: 'Prinsengracht', address: 'Westermarkt 20, 1016 GV Amsterdam', lat: 52.3752, lng: 4.8840, startTime: '09:00', endTime: '11:00', duration: 120, cost: 16, timeOfDay: 'morning', order: 0, dayId: days[4].id, description: 'Poignant museum in the hiding place of Anne Frank', rating: 4.8, bookingUrl: 'https://www.annefrank.org', imageUrl: 'https://images.unsplash.com/photo-1584811644165-33078f50eb15?w=600', tags: '["history","WWII","museum"]' },
      { name: 'Rijksmuseum', type: 'culture', location: 'Museum Square', address: 'Museumstraat 1, 1071 XX Amsterdam', lat: 52.3600, lng: 4.8852, startTime: '11:30', endTime: '14:00', duration: 150, cost: 22.5, timeOfDay: 'morning', order: 1, dayId: days[4].id, description: 'Dutch national museum, home to Rembrandt and Vermeer masterworks', rating: 4.7, bookingUrl: 'https://www.rijksmuseum.nl', imageUrl: 'https://images.unsplash.com/photo-1576467560921-c3ed7a7e82d4?w=600', tags: '["art","dutch masters","rembrandt"]' },
      { name: 'Stroopwafel at Albert Cuyp Market', type: 'food', location: 'De Pijp', address: 'Albert Cuypstraat, 1072 Amsterdam', lat: 52.3543, lng: 4.8963, startTime: '14:30', endTime: '15:30', duration: 60, cost: 10, timeOfDay: 'afternoon', order: 2, dayId: days[4].id, description: 'Amsterdam\'s largest outdoor market, famous for fresh stroopwafels', rating: 4.6, tags: '["market","food","local"]' },
      { name: 'Canal Boat Tour', type: 'experience', location: 'Amsterdam Canals', address: 'Damrak 26, 1012 LJ Amsterdam', lat: 52.3767, lng: 4.8985, startTime: '16:00', endTime: '17:30', duration: 90, cost: 18, timeOfDay: 'afternoon', order: 3, dayId: days[4].id, description: 'Guided tour of the UNESCO-listed canal ring', rating: 4.7, tags: '["canal","boat","UNESCO"]' },
      { name: "Brouwerij 't IJ Craft Beer", type: 'food', location: 'Funenkade', address: 'Funenkade 7, 1018 AL Amsterdam', lat: 52.3646, lng: 4.9257, startTime: '18:00', endTime: '20:00', duration: 120, cost: 20, timeOfDay: 'evening', order: 4, dayId: days[4].id, description: 'Craft brewery inside a working windmill', rating: 4.6, tags: '["beer","windmill","local","craft"]' },
    ],
  });

  // Day 6 – Hidden Gems Amsterdam
  await prisma.activity.createMany({
    data: [
      { name: 'Begijnhof Courtyard', type: 'sightseeing', location: 'Amsterdam Center', address: 'Begijnhof 30, 1012 WT Amsterdam', lat: 52.3686, lng: 4.8891, startTime: '09:00', endTime: '10:00', duration: 60, cost: 0, timeOfDay: 'morning', order: 0, dayId: days[5].id, description: 'Hidden medieval courtyard, a peaceful oasis in the city', rating: 4.5, tags: '["hidden gem","medieval","peaceful"]' },
      { name: 'Pancake Breakfast at The Pancake Bakery', type: 'food', location: 'Prinsengracht', address: 'Prinsengracht 191, 1015 DS Amsterdam', lat: 52.3788, lng: 4.8827, startTime: '10:30', endTime: '12:00', duration: 90, cost: 18, timeOfDay: 'morning', order: 1, dayId: days[5].id, description: 'Dutch pancakes with unlimited topping combinations', rating: 4.5, tags: '["dutch","pancakes","brunch"]' },
      { name: 'Jordaan District Walk', type: 'sightseeing', location: 'Jordaan', address: 'Jordaan, Amsterdam', lat: 52.3754, lng: 4.8796, startTime: '12:30', endTime: '15:00', duration: 150, cost: 0, timeOfDay: 'afternoon', order: 2, dayId: days[5].id, description: 'Explore charming narrow streets, indie shops, and galleries', tags: '["walk","neighborhood","charming"]' },
      { name: 'Van Gogh Museum', type: 'culture', location: 'Museum Square', address: 'Museumplein 6, 1071 DJ Amsterdam', lat: 52.3584, lng: 4.8811, startTime: '15:30', endTime: '17:30', duration: 120, cost: 22, timeOfDay: 'afternoon', order: 3, dayId: days[5].id, description: 'World\'s largest Van Gogh collection – 200+ paintings', rating: 4.7, bookingUrl: 'https://www.vangoghmuseum.nl', imageUrl: 'https://images.unsplash.com/photo-1584553421349-3557471bed79?w=600', tags: '["art","van gogh","impressionism"]' },
      { name: 'Farewell Dinner – De Kas', type: 'food', location: 'Frankendael Park', address: 'Kamerlingh Onneslaan 3, 1097 DE Amsterdam', lat: 52.3573, lng: 4.9356, startTime: '19:30', endTime: '22:00', duration: 150, cost: 85, timeOfDay: 'evening', order: 4, dayId: days[5].id, description: 'Farm-to-table restaurant in a stunning 1926 greenhouse', rating: 4.9, tags: '["farm-to-table","greenhouse","fine dining"]' },
    ],
  });

  // Day 7 – Departure
  await prisma.activity.createMany({
    data: [
      { name: 'Morning Coffee – Lot Sixty One', type: 'food', location: 'Kinkerstraat', address: 'Kinkerstraat 112, 1053 ED Amsterdam', lat: 52.3680, lng: 4.8726, startTime: '08:30', endTime: '09:30', duration: 60, cost: 8, timeOfDay: 'morning', order: 0, dayId: days[6].id, description: 'Amsterdam\'s best specialty coffee shop', rating: 4.7, tags: '["coffee","specialty","morning"]' },
      { name: 'Last Souvenir Shopping – Nine Streets', type: 'shopping', location: 'De 9 Straatjes', address: 'De 9 Straatjes, Amsterdam', lat: 52.3712, lng: 4.8820, startTime: '10:00', endTime: '12:00', duration: 120, cost: 50, timeOfDay: 'morning', order: 1, dayId: days[6].id, description: 'Nine charming cross streets packed with boutiques and vintage shops', tags: '["shopping","boutique","vintage"]' },
      { name: 'Airport Transfer', type: 'transport', location: 'Amsterdam Schiphol', address: 'Schiphol, 1118 CP Amsterdam', lat: 52.3105, lng: 4.7683, startTime: '14:00', endTime: '15:30', duration: 90, cost: 20, timeOfDay: 'afternoon', order: 2, dayId: days[6].id, description: 'Train to Schiphol Airport from Amsterdam Centraal', tags: '["transport","airport","train"]' },
    ],
  });

  // Stays
  await prisma.stay.createMany({
    data: [
      { name: 'Hôtel Le Marais', type: 'hotel', address: '12 Rue de Bretagne, 75003 Paris', lat: 48.8611, lng: 2.3598, checkIn: addDays(start, 0), checkOut: addDays(start, 3), cost: 480, currency: 'EUR', notes: 'Reservation #PM-38291. Breakfast included.', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', tripId: trip.id },
      { name: 'Canal House Hotel', type: 'hotel', address: 'Keizersgracht 148, 1015 CX Amsterdam', lat: 52.3732, lng: 4.8831, checkIn: addDays(start, 3), checkOut: addDays(start, 7), cost: 640, currency: 'EUR', notes: 'Reservation #CHH-19203. Canal view room.', imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600', tripId: trip.id },
    ],
  });

  // Transport
  await prisma.transport.createMany({
    data: [
      { type: 'flight', fromLocation: 'New York JFK', toLocation: 'Paris CDG', fromLat: 40.6413, fromLng: -73.7781, toLat: 49.0097, toLng: 2.5478, departureTime: addDays(start, 0), arrivalTime: new Date(addDays(start, 0).getTime() + 7.5 * 3600000), carrier: 'Air France AF007', bookingRef: 'XKPL92', cost: 680, currency: 'EUR', tripId: trip.id },
      { type: 'train', fromLocation: 'Paris Gare du Nord', toLocation: 'Amsterdam Centraal', fromLat: 48.8809, fromLng: 2.3553, toLat: 52.3791, toLng: 4.9003, departureTime: new Date(addDays(start, 3).setHours(10, 16)), arrivalTime: new Date(addDays(start, 3).setHours(13, 40)), carrier: 'Thalys THA9321', bookingRef: 'THL4821', cost: 89, currency: 'EUR', tripId: trip.id },
      { type: 'flight', fromLocation: 'Amsterdam Schiphol', toLocation: 'New York JFK', fromLat: 52.3105, fromLng: 4.7683, toLat: 40.6413, toLng: -73.7781, departureTime: new Date(addDays(start, 6).setHours(17, 30)), arrivalTime: new Date(addDays(start, 6).setHours(20, 0)), carrier: 'Delta DL407', bookingRef: 'DLT7731', cost: 620, currency: 'EUR', tripId: trip.id },
    ],
  });

  // ── Tokyo Trip ───────────────────────────────────────────────────────────
  const tokyoStart = new Date('2025-09-15');
  const tokyoTrip = await prisma.trip.create({
    data: {
      name: 'Tokyo & Kyoto Explorer',
      description: 'Two weeks immersed in ancient temples, neon-lit streets, and the world\'s finest cuisine.',
      startDate: tokyoStart,
      endDate: addDays(tokyoStart, 13),
      coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
      status: 'planning',
      budget: 5000,
      currency: 'JPY',
      userId: user.id,
    },
  });

  const tokyoDays = await Promise.all(
    Array.from({ length: 14 }, (_, i) =>
      prisma.day.create({ data: { date: addDays(tokyoStart, i), tripId: tokyoTrip.id } })
    )
  );

  await prisma.activity.createMany({
    data: [
      { name: 'Shibuya Crossing', type: 'sightseeing', location: 'Shibuya', address: 'Shibuya Scramble Crossing, Tokyo', lat: 35.6595, lng: 139.7004, startTime: '10:00', endTime: '11:00', duration: 60, cost: 0, timeOfDay: 'morning', order: 0, dayId: tokyoDays[0].id, description: 'World\'s busiest pedestrian crossing', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600' },
      { name: 'Ramen at Ichiran', type: 'food', location: 'Shinjuku', address: '3-34-11 Shinjuku, Tokyo', lat: 35.6896, lng: 139.7006, startTime: '12:00', endTime: '13:00', duration: 60, cost: 1500, currency: 'JPY', timeOfDay: 'afternoon', order: 1, dayId: tokyoDays[0].id, description: 'Solo dining ramen booths – Tokyo institution', rating: 4.5 },
      { name: 'Senso-ji Temple', type: 'culture', location: 'Asakusa', address: '2-3-1 Asakusa, Taito City, Tokyo', lat: 35.7148, lng: 139.7967, startTime: '14:00', endTime: '16:00', duration: 120, cost: 0, timeOfDay: 'afternoon', order: 2, dayId: tokyoDays[0].id, description: "Tokyo's oldest and most significant Buddhist temple", rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600' },
    ],
  });

  console.log('✅ Seed complete. Demo user and 2 trips created.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
