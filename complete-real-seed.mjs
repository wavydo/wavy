import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, text, timestamp, uuid, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Tables
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  accountNumber: text('account_number'),
  points: integer('points').notNull().default(0),
  level: text('level').notNull().default('bronze'),
});

const nfcCards = pgTable('nfc_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  cardNumber: text('card_number').notNull().unique(),
  cardholderName: text('cardholder_name').notNull(),
  expiryDate: text('expiry_date').notNull(),
  cardType: text('card_type').notNull().default('member'),
});

console.log('🌱 Creating complete real data...');

try {
  // 1. Update Miguel user with real balance
  await db.execute("UPDATE users SET balance = '40256.00', account_number = '22-394932', points = 2840, level = 'gold' WHERE email = 'miguelnla@outlook.com'");
  console.log('✅ Updated Miguel with real data');

  // 2. Clean existing cards
  await db.execute("DELETE FROM nfc_cards WHERE user_id IN (SELECT id FROM users WHERE email = 'miguelnla@outlook.com')");

  // 3. Add real card data
  await db.execute(`
    INSERT INTO nfc_cards (user_id, card_number, cardholder_name, expiry_date, card_type, token, qr_code, status, activated_at)
    SELECT 
      u.id,
      '4521 1234 5678 9012',
      'MIGUEL DE LOS ANGELES',
      '12/27',
      'member',
      'tapp_token_123',
      'https://tapp.network/card/1',
      'active',
      NOW()
    FROM users u WHERE u.email = 'miguelnla@outlook.com'
  `);

  await db.execute(`
    INSERT INTO nfc_cards (user_id, card_number, cardholder_name, expiry_date, card_type, token, qr_code, status, activated_at)
    SELECT 
      u.id,
      '4521 9876 5432 1098',
      'MIGUEL DE LOS ANGELES',
      '08/28',
      'member',
      'tapp_token_456',
      'https://tapp.network/card/2',
      'active',
      NOW()
    FROM users u WHERE u.email = 'miguelnla@outlook.com'
  `);

  await db.execute(`
    INSERT INTO nfc_cards (user_id, card_number, cardholder_name, expiry_date, card_type, token, qr_code, status, activated_at)
    SELECT 
      u.id,
      '4521 5555 6666 7777',
      'MIGUEL DE LOS ANGELES',
      '12/29',
      'premium',
      'tapp_token_789',
      'https://tapp.network/card/3',
      'active',
      NOW()
    FROM users u WHERE u.email = 'miguelnla@outlook.com'
  `);

  console.log('✅ Created 3 real cards');

  // 4. Update monthly stats
  await db.execute("DELETE FROM user_monthly_stats WHERE user_id IN (SELECT id FROM users WHERE email = 'miguelnla@outlook.com')");
  await db.execute(`
    INSERT INTO user_monthly_stats (user_id, month, places_tapped, rewards_earned)
    SELECT u.id, '2026-08', 12, 2840
    FROM users u WHERE u.email = 'miguelnla@outlook.com'
  `);
  console.log('✅ Created monthly stats');

  console.log('\n✨ REAL DATA SEED COMPLETE!');
  console.log('📧 Email: miguelnla@outlook.com');
  console.log('💰 Balance: RD$40,256.00');
  console.log('🏆 Points: 2,840');
  console.log('💳 Cards: 3 with real cardholder name and expiry dates');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await pool.end();
}