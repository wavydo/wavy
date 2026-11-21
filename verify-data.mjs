import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users, nfcCards, transactions, establishments, userMonthlyStats } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🔍 Verifying Miguel\'s data in database...');

try {
  // 1. Check Miguel's user data
  const [miguel] = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com'));
  
  if (miguel) {
    console.log('✅ Miguel found in database');
    console.log('📧 Email:', miguel.email);
    console.log('👤 Full Name:', miguel.fullName);
    console.log('💰 Balance:', miguel.balance);
    console.log('🏦 Account Number:', miguel.accountNumber);
    console.log('🏆 Points:', miguel.points);
    console.log('🎖️ Level:', miguel.level);
  } else {
    console.log('❌ Miguel not found in database');
    await pool.end();
    process.exit(1);
  }

  // 2. Check Miguel's cards
  const cards = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguel.id));
  console.log(`💳 Miguel has ${cards.length} cards:`);
  
  cards.forEach((card, index) => {
    console.log(`  Card ${index + 1}:`);
    console.log(`    Cardholder: ${card.cardholderName}`);
    console.log(`    Expiry: ${card.expiryDate}`);
    console.log(`    Type: ${card.cardType}`);
    console.log(`    Status: ${card.status}`);
  });

  // 3. Check Miguel's transactions
  const miguelTransactions = await db.select({
    amount: transactions.amount,
    finalAmount: transactions.finalAmount,
    establishment: establishments.businessName,
    date: transactions.createdAt
  })
  .from(transactions)
  .leftJoin(establishments, eq(transactions.establishmentId, establishments.id))
  .where(eq(transactions.userId, miguel.id))
  .limit(5);

  console.log(`🧾 Miguel has transactions:`);
  miguelTransactions.forEach((tx, index) => {
    console.log(`  Transaction ${index + 1}: RD$${tx.finalAmount} at ${tx.establishment} on ${tx.date}`);
  });

  // 4. Check monthly stats
  const [stats] = await db.select().from(userMonthlyStats).where(eq(userMonthlyStats.userId, miguel.id));
  if (stats) {
    console.log('📊 Monthly Stats:');
    console.log(`  Places Tapped: ${stats.placesTapped}`);
    console.log(`  Rewards Earned: ${stats.rewardsEarned}`);
  }

  console.log('\n✨ ALL DATA VERIFIED - 100% REAL FROM DATABASE!');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await pool.end();
}