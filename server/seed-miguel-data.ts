import 'dotenv/config';
import { db } from './storage.js';
import { users, nfcCards, establishments, transactions, perks, events, userMonthlyStats } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Seed script para crear datos reales para Miguel
 * Email: miguelnla@outlook.com
 * 
 * Este script crea:
 * - Usuario Miguel con balance y estadísticas reales
 * - 3 tarjetas NFC
 * - Establecimientos de ejemplo
 * - Transacciones históricas
 * - Perks activos
 * - Eventos próximos
 */

async function seedMiguelData() {
  console.log('🌱 Starting seed for Miguel...');

  try {
    // 1. Crear/Actualizar Usuario Miguel
    const hashedPassword = await bcrypt.hash('miguel123', 10);
    
    const existingUser = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com')).limit(1);
    
    let miguelUser;
    if (existingUser.length > 0) {
      // Actualizar usuario existente
      [miguelUser] = await db.update(users)
        .set({
          fullName: 'Miguel De Los Angeles',
          password: hashedPassword,
          phone: '+1 809-555-1234',
          address: 'Calle Principal #123',
          city: 'Santo Domingo',
          points: 2840,
          level: 'gold',
          totalSpent: '45256.00',
          monthlySpent: '12450.00',
          balance: '40256.00',
          accountNumber: '22-394932',
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id))
        .returning();
      
      console.log('✅ Updated existing user Miguel');
    } else {
      // Crear nuevo usuario
      [miguelUser] = await db.insert(users).values({
        fullName: 'Miguel De Los Angeles',
        email: 'miguelnla@outlook.com',
        password: hashedPassword,
        phone: '+1 809-555-1234',
        address: 'Calle Principal #123',
        city: 'Santo Domingo',
        points: 2840,
        level: 'gold',
        totalSpent: '45256.00',
        monthlySpent: '12450.00',
        balance: '40256.00',
        accountNumber: '22-394932',
      }).returning();
      
      console.log('✅ Created new user Miguel');
    }

    // 2. Crear tarjetas NFC para Miguel
    const existingCards = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguelUser.id));
    
    if (existingCards.length === 0) {
      await db.insert(nfcCards).values([
        {
          userId: miguelUser.id,
          cardNumber: 'TAPP-0001-2345',
          token: 'tapp_token_' + Math.random().toString(36).substr(2, 9),
          qrCode: 'https://tapp.network/card/tapp-0001-2345',
          status: 'active',
          activatedAt: new Date('2024-06-15'),
          lastUsedAt: new Date(),
        },
        {
          userId: miguelUser.id,
          cardNumber: 'TAPP-0002-6789',
          token: 'tapp_token_' + Math.random().toString(36).substr(2, 9),
          qrCode: 'https://tapp.network/card/tapp-0002-6789',
          status: 'active',
          activatedAt: new Date('2024-08-20'),
          lastUsedAt: new Date('2026-08-29'),
        },
        {
          userId: miguelUser.id,
          cardNumber: 'TAPP-0003-4321',
          token: 'tapp_token_' + Math.random().toString(36).substr(2, 9),
          qrCode: 'https://tapp.network/card/tapp-0003-4321',
          status: 'active',
          activatedAt: new Date('2024-12-10'),
        },
      ]);
      console.log('✅ Created 3 NFC cards for Miguel');
    }

    // 3. Crear establecimientos de ejemplo (si no existen)
    const casa23Password = await bcrypt.hash('casa23pass', 10);
    const laEsquinaPassword = await bcrypt.hash('laesquinapass', 10);
    const eventSplitPassword = await bcrypt.hash('eventsplitpass', 10);
    const uberEatsPassword = await bcrypt.hash('ubereatspass', 10);

    const establishmentsData = [
      {
        businessName: 'Casa 23',
        ownerName: 'Juan Pérez',
        email: 'casa23@example.com',
        password: casa23Password,
        phone: '+1 809-555-2301',
        address: 'Av. 27 de Febrero #23',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Restaurante de comida dominicana moderna',
        discountPercentage: 15,
        approved: true,
        approvedAt: new Date('2024-01-15'),
      },
      {
        businessName: 'La Esquina',
        ownerName: 'María García',
        email: 'laesquina@example.com',
        password: laEsquinaPassword,
        phone: '+1 809-555-3401',
        address: 'Calle El Conde #45',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Bar y restaurante con ambiente acogedor',
        discountPercentage: 10,
        approved: true,
        approvedAt: new Date('2024-02-20'),
      },
      {
        businessName: 'Event Split',
        ownerName: 'Carlos Rodríguez',
        email: 'eventsplit@example.com',
        password: eventSplitPassword,
        phone: '+1 809-555-4501',
        address: 'Plaza Central #12',
        city: 'Santo Domingo',
        category: 'otro',
        description: 'Plataforma de eventos y pagos compartidos',
        discountPercentage: 5,
        approved: true,
        approvedAt: new Date('2024-03-10'),
      },
      {
        businessName: 'Uber Eats RD',
        ownerName: 'Uber Technologies',
        email: 'ubereats.rd@example.com',
        password: uberEatsPassword,
        phone: '+1 809-555-8000',
        address: 'Torre Corporativa, Piantini',
        city: 'Santo Domingo',
        category: 'otro',
        description: 'Delivery de comida a domicilio',
        discountPercentage: 8,
        approved: true,
        approvedAt: new Date('2024-01-01'),
      },
    ];

    const createdEstablishments = [];
    for (const est of establishmentsData) {
      const existing = await db.select().from(establishments).where(eq(establishments.email, est.email)).limit(1);
      if (existing.length > 0) {
        createdEstablishments.push(existing[0]);
      } else {
        const [created] = await db.insert(establishments).values(est).returning();
        createdEstablishments.push(created);
      }
    }
    console.log(`✅ Ensured ${createdEstablishments.length} establishments exist`);

    // 4. Crear transacciones históricas
    const cards = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguelUser.id));
    const mainCard = cards[0];

    const transactionsData = [
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[1].id, // La Esquina
        cardId: mainCard.id,
        amount: '2450.00',
        discountApplied: '245.00',
        finalAmount: '2205.00',
        pointsEarned: 245,
        createdAt: new Date('2026-08-30T19:30:00'),
      },
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[2].id, // Event Split
        cardId: mainCard.id,
        amount: '0.00', // Received payment
        discountApplied: '0.00',
        finalAmount: '0.00',
        pointsEarned: 0,
        createdAt: new Date('2026-08-30T18:15:00'),
      },
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[0].id, // Casa 23
        cardId: mainCard.id,
        amount: '1200.00',
        discountApplied: '120.00',
        finalAmount: '1080.00',
        pointsEarned: 120,
        createdAt: new Date('2026-08-30T14:20:00'),
      },
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[3].id, // Uber Eats
        cardId: mainCard.id,
        amount: '850.00',
        discountApplied: '68.00',
        finalAmount: '782.00',
        pointsEarned: 85,
        createdAt: new Date('2026-08-30T12:45:00'),
      },
    ];

    const existingTransactions = await db.select().from(transactions).where(eq(transactions.userId, miguelUser.id));
    if (existingTransactions.length === 0) {
      await db.insert(transactions).values(transactionsData);
      console.log(`✅ Created ${transactionsData.length} transactions for Miguel`);
    }

    // 5. Crear estadísticas mensuales
    const existingStats = await db.select().from(userMonthlyStats)
      .where(eq(userMonthlyStats.userId, miguelUser.id));
    
    if (existingStats.length === 0) {
      await db.insert(userMonthlyStats).values({
        userId: miguelUser.id,
        month: '2026-08',
        placesTapped: 12,
        rewardsEarned: 2840,
      });
      console.log('✅ Created monthly stats for Miguel');
    }

    // 6. Crear perks activos
    const perksData = [
      {
        establishmentId: createdEstablishments[0].id, // Casa 23
        title: '2x rewards at Casa 23 tonight',
        description: 'Double points on all taps between 8PM-11PM. Three friends are already planning to go.',
        type: 'points',
        value: '2',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        maxRedemptions: 100,
        active: true,
      },
      {
        establishmentId: createdEstablishments[1].id, // La Esquina
        title: 'Unlock exclusive perks',
        description: 'Join 3 upcoming events and earn premium status. Get early access to drops, 2x rewards, and exclusive merchant benefits.',
        type: 'freebie',
        value: '1',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        active: true,
      },
    ];

    const existingPerks = await db.select().from(perks);
    if (existingPerks.length === 0) {
      await db.insert(perks).values(perksData);
      console.log(`✅ Created ${perksData.length} perks`);
    }

    // 7. Crear eventos próximos
    const eventsData = [
      {
        establishmentId: createdEstablishments[0].id,
        title: 'Mambo Night at Casa 23',
        description: 'Live music and dancing. Special TAPP member pricing.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        location: 'Casa 23, Av. 27 de Febrero',
        capacity: 150,
        currentAttendees: 42,
        ticketPrice: '500.00',
        active: true,
      },
      {
        establishmentId: createdEstablishments[1].id,
        title: 'Wine Tasting Experience',
        description: 'Premium wines from around the world. TAPP members get 20% off.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        location: 'La Esquina, Calle El Conde',
        capacity: 50,
        currentAttendees: 18,
        ticketPrice: '1200.00',
        active: true,
      },
    ];

    const existingEvents = await db.select().from(events);
    if (existingEvents.length === 0) {
      await db.insert(events).values(eventsData);
      console.log(`✅ Created ${eventsData.length} events`);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Email: miguelnla@outlook.com');
    console.log('Password: miguel123');
    console.log(`\n💳 Balance: RD$${miguelUser.balance}`);
    console.log(`🏆 Points: ${miguelUser.points}`);
    console.log(`📊 Level: ${miguelUser.level}`);

  } catch (error) {
    console.error('❌ Error seeding Miguel data:', error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMiguelData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedMiguelData };
