import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, text, timestamp, uuid, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Establishments table
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
  discountRate: decimal('discount_rate', { precision: 5, scale: 2 }).notNull().default('10.00'),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }).default('0.00'),
  subscriptionPlan: text('subscription_plan').notNull().default('starter'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull().default('1.50'),
  monthlyFee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull().default('499.00'),
  dailyTransactionLimit: integer('daily_transaction_limit'),
  acceptsTappPay: boolean('accepts_tapp_pay').notNull().default(false),
  locationLat: decimal('location_lat', { precision: 10, scale: 8 }),
  locationLng: decimal('location_lng', { precision: 11, scale: 8 }),
  businessHours: text('business_hours'),
  features: text('features'),
  totalCustomers: integer('total_customers').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalDiscountsGiven: decimal('total_discounts_given', { precision: 12, scale: 2 }).notNull().default('0'),
  totalTransactions: integer('total_transactions').notNull().default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').notNull().default(0),
  approved: boolean('approved').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  lastTransactionAt: timestamp('last_transaction_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Establecimientos para la app móvil - datos reales
const mobileEstablishments = [
  {
    businessName: 'La Parrillada',
    ownerName: 'Carlos Rodríguez',
    email: 'laparrillada@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0101',
    address: 'Calle Mayor 123, Santo Domingo',
    city: 'Santo Domingo',
    category: 'restaurant',
    description: '20% off on paellas - Authentic Spanish cuisine',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=75',
    discountRate: '20.00',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: true,
    locationLat: '18.4861',
    locationLng: '-69.9312',
    totalCustomers: 247,
    totalRevenue: '450000.00',
    averageRating: '4.8',
    reviewCount: 156,
  },
  {
    businessName: 'Café Central',
    ownerName: 'María Santos',
    email: 'cafecentral@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0102',
    address: 'Plaza España 45, Santo Domingo',
    city: 'Santo Domingo',
    category: 'cafe',
    description: 'Second coffee free - Cozy café with excellent pastries',
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&q=75',
    discountRate: '15.00',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: true,
    locationLat: '18.4871',
    locationLng: '-69.9322',
    totalCustomers: 189,
    totalRevenue: '280000.00',
    averageRating: '4.6',
    reviewCount: 98,
  },
  {
    businessName: 'Sushi Master',
    ownerName: 'Kenji Tanaka',
    email: 'sushimaster@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0103',
    address: 'Zona Colonial, Santo Domingo',
    city: 'Santo Domingo',
    category: 'restaurant',
    description: 'Buy 2 rolls, get 1 free - Premium sushi experience',
    logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&q=75',
    discountRate: '25.00',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: true,
    locationLat: '18.4781',
    locationLng: '-69.8852',
    totalCustomers: 312,
    totalRevenue: '680000.00',
    averageRating: '4.9',
    reviewCount: 203,
  },
  {
    businessName: 'Book Haven',
    ownerName: 'Ana García',
    email: 'bookhaven@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0104',
    address: 'Calle Cultura 90, Santo Domingo',
    city: 'Santo Domingo',
    category: 'bookstore',
    description: '25% off bestsellers - Your literary paradise',
    logo: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=75',
    discountRate: '25.00',
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: false,
    locationLat: '18.4901',
    locationLng: '-69.9402',
    totalCustomers: 145,
    totalRevenue: '180000.00',
    averageRating: '4.7',
    reviewCount: 87,
  },
  {
    businessName: 'Bakery Delight',
    ownerName: 'Pedro Martínez',
    email: 'bakerydelight@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0105',
    address: 'Av. Dulce 10, Santo Domingo',
    city: 'Santo Domingo',
    category: 'bakery',
    description: 'NEW: 40% off pastries - Fresh baked daily',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=75',
    discountRate: '40.00',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: true,
    locationLat: '18.4821',
    locationLng: '-69.9272',
    totalCustomers: 98,
    totalRevenue: '125000.00',
    averageRating: '4.5',
    reviewCount: 64,
  },
  {
    businessName: 'Fashion Hub',
    ownerName: 'Isabella Reyes',
    email: 'fashionhub@tapp.com',
    password: 'business123',
    phone: '+1 (809) 555-0106',
    address: 'Shopping Center, Santo Domingo',
    city: 'Santo Domingo',
    category: 'clothing',
    description: 'NEW: Summer collection 50% off - Latest trends',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=75',
    discountRate: '50.00',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    acceptsTappPay: true,
    approved: true,
    approvedAt: new Date(),
    isActive: true,
    isFeatured: true,
    locationLat: '18.4951',
    locationLng: '-69.9452',
    totalCustomers: 276,
    totalRevenue: '520000.00',
    averageRating: '4.8',
    reviewCount: 142,
  },
];

async function seedMobileEstablishments() {
  try {
    console.log('🌱 Seeding mobile establishments...');

    for (const estData of mobileEstablishments) {
      // Hash password
      const hashedPassword = await bcrypt.hash(estData.password, 10);

      // Check if establishment already exists
      const existing = await db.select()
        .from(establishments)
        .where(eq(establishments.email, estData.email))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  ${estData.businessName} already exists, skipping...`);
        continue;
      }

      // Insert establishment
      await db.insert(establishments).values({
        ...estData,
        password: hashedPassword,
      });

      console.log(`✅ Created: ${estData.businessName}`);
    }

    console.log('\n🎉 Mobile establishments seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding establishments:', error);
    process.exit(1);
  }
}

seedMobileEstablishments();
