import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, text, timestamp, uuid, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Define tables inline
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  points: integer('points').notNull().default(0),
  level: text('level').notNull().default('bronze'),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  monthlySpent: decimal('monthly_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  accountNumber: text('account_number'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const establishments = pgTable('establishments', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  logo: text('logo'),
  discountPercentage: integer('discount_percentage').notNull().default(10),
  subscriptionPlan: text('subscription_plan').notNull().default('starter'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  totalCustomers: integer('total_customers').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  approved: boolean('approved').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const nfcCards = pgTable('nfc_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  cardNumber: text('card_number').notNull().unique(),
  token: text('token').notNull().unique(),
  qrCode: text('qr_code').notNull().unique(),
  status: text('status').notNull().default('active'),
  activatedAt: timestamp('activated_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  establishmentId: uuid('establishment_id').notNull(),
  cardId: uuid('card_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  discountApplied: decimal('discount_applied', { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

const userMonthlyStats = pgTable('user_monthly_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  month: text('month').notNull(),
  placesTapped: integer('places_tapped').notNull().default(0),
  rewardsEarned: integer('rewards_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const perks = pgTable('perks', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  maxRedemptions: integer('max_redemptions'),
  currentRedemptions: integer('current_redemptions').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  capacity: integer('capacity'),
  currentAttendees: integer('current_attendees').notNull().default(0),
  ticketPrice: decimal('ticket_price', { precision: 10, scale: 2 }),
  image: text('image'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

console.log('🌱 Starting seed for Miguel...');

try {
  // 1. Create Miguel user
  const hashedPassword = await bcrypt.hash('miguel123', 10);
  
  const existingUser = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com')).limit(1);
  
  let miguelUser;
  if (existingUser.length > 0) {
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

  // 2. Create establishments
  const establishmentsData = [
    {
      businessName: 'Casa 23',
      ownerName: 'Juan Pérez',
      email: 'casa23@example.com',
      password: await bcrypt.hash('casa23pass', 10),
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
      password: await bcrypt.hash('laesquinapass', 10),
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
      password: await bcrypt.hash('eventsplitpass', 10),
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
      password: await bcrypt.hash('ubereatspass', 10),
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
  console.log(`✅ Created/found ${createdEstablishments.length} establishments`);

  // 3. Create NFC cards
  const existingCards = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguelUser.id));
  
  if (existingCards.length === 0) {
    const cardsToCreate = [
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
    ];
    await db.insert(nfcCards).values(cardsToCreate);
    console.log('✅ Created 3 NFC cards');
  }

  const cards = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguelUser.id));
  const mainCard = cards[0];

  // 4. Create transactions
  const existingTransactions = await db.select().from(transactions).where(eq(transactions.userId, miguelUser.id));
  if (existingTransactions.length === 0) {
    const transactionsData = [
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[1].id,
        cardId: mainCard.id,
        amount: '2450.00',
        discountApplied: '245.00',
        finalAmount: '2205.00',
        pointsEarned: 245,
        createdAt: new Date('2026-08-30T19:30:00'),
      },
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[0].id,
        cardId: mainCard.id,
        amount: '1200.00',
        discountApplied: '120.00',
        finalAmount: '1080.00',
        pointsEarned: 120,
        createdAt: new Date('2026-08-30T14:20:00'),
      },
      {
        userId: miguelUser.id,
        establishmentId: createdEstablishments[3].id,
        cardId: mainCard.id,
        amount: '850.00',
        discountApplied: '68.00',
        finalAmount: '782.00',
        pointsEarned: 85,
        createdAt: new Date('2026-08-30T12:45:00'),
      },
    ];
    await db.insert(transactions).values(transactionsData);
    console.log(`✅ Created ${transactionsData.length} transactions`);
  }

  // 5. Create monthly stats
  const existingStats = await db.select().from(userMonthlyStats).where(eq(userMonthlyStats.userId, miguelUser.id));
  if (existingStats.length === 0) {
    await db.insert(userMonthlyStats).values({
      userId: miguelUser.id,
      month: '2026-08',
      placesTapped: 12,
      rewardsEarned: 2840,
    });
    console.log('✅ Created monthly stats');
  }

  // 6. Create perks
  const existingPerks = await db.select().from(perks).limit(1);
  if (existingPerks.length === 0) {
    await db.insert(perks).values([
      {
        establishmentId: createdEstablishments[0].id,
        title: '2x rewards at Casa 23 tonight',
        description: 'Double points on all taps between 8PM-11PM. Three friends are already planning to go.',
        type: 'points',
        value: '2',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxRedemptions: 100,
        active: true,
      },
      {
        establishmentId: createdEstablishments[1].id,
        title: 'Unlock exclusive perks',
        description: 'Join 3 upcoming events and earn premium status.',
        type: 'freebie',
        value: '1',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        active: true,
      },
    ]);
    console.log('✅ Created perks');
  }

  // 7. Create events
  const existingEvents = await db.select().from(events).limit(1);
  if (existingEvents.length === 0) {
    await db.insert(events).values([
      {
        establishmentId: createdEstablishments[0].id,
        title: 'Mambo Night at Casa 23',
        description: 'Live music and dancing.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        location: 'Casa 23, Av. 27 de Febrero',
        capacity: 150,
        currentAttendees: 42,
        ticketPrice: '500.00',
        active: true,
      },
    ]);
    console.log('✅ Created events');
  }

  console.log('\n✨ Seed completed!');
  console.log('\n📧 Email: miguelnla@outlook.com');
  console.log('🔑 Password: miguel123');
  console.log(`💰 Balance: RD$${miguelUser.balance}`);
  console.log(`🏆 Points: ${miguelUser.points}`);

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await pool.end();
}
