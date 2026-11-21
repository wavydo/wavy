#!/usr/bin/env node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { 
  users, 
  nfcCards, 
  establishments,
  transactions
} from './shared/schema.ts';
import { eq } from 'drizzle-orm';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🔄 Creating sample transactions for Miguel...');

try {
  // Get Miguel's user data
  const [miguelUser] = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com')).limit(1);
  
  if (!miguelUser) {
    console.log('❌ User not found!');
    process.exit(1);
  }
  
  // Get Miguel's first card
  const [miguelCard] = await db.select().from(nfcCards).where(eq(nfcCards.userId, miguelUser.id)).limit(1);
  
  if (!miguelCard) {
    console.log('❌ No cards found!');
    process.exit(1);
  }
  
  // Get some establishments for transactions
  const establishmentsList = await db.select().from(establishments).limit(5);
  
  if (establishmentsList.length === 0) {
    console.log('❌ No establishments found!');
    process.exit(1);
  }
  
  console.log('✅ Found:', miguelUser.fullName, 'with card:', miguelCard.cardToken);
  console.log('✅ Found', establishmentsList.length, 'establishments');
  
  // Create sample transactions (last 7 days)
  const transactionData = [
    {
      establishment: establishmentsList[0],
      amount: '25.50',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      establishment: establishmentsList[1],
      amount: '89.99',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      establishment: establishmentsList[2],
      amount: '15.75',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      establishment: establishmentsList[0],
      amount: '12.00',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      establishment: establishmentsList[3],
      amount: '156.30',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      establishment: establishmentsList[1],
      amount: '45.20',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    }
  ];
  
  let transactionCount = 0;
  
  for (const txn of transactionData) {
    const amount = parseFloat(txn.amount);
    const discountRate = parseFloat(txn.establishment.discountRate || '10');
    const discountAmount = (amount * discountRate) / 100;
    const finalAmount = amount - discountAmount;
    const pointsEarned = Math.floor(finalAmount / 10); // 1 point per $10
    
    await db.insert(transactions).values({
      userId: miguelUser.id,
      establishmentId: txn.establishment.id,
      cardId: miguelCard.id,
      amount: txn.amount,
      discountApplied: discountAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      pointsEarned: pointsEarned,
      createdAt: txn.date
    });
    
    transactionCount++;
    console.log(`✅ Transaction ${transactionCount}: $${txn.amount} at ${txn.establishment.businessName} (saved $${discountAmount.toFixed(2)}, earned ${pointsEarned} points)`);
  }
  
  console.log('');
  console.log(`✅ Successfully created ${transactionCount} sample transactions`);
  console.log('💰 Total spent:', transactionData.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2));
  console.log('💵 Total saved:', transactionData.reduce((sum, t) => {
    const amount = parseFloat(t.amount);
    const discountRate = parseFloat(t.establishment.discountRate || '10');
    return sum + (amount * discountRate) / 100;
  }, 0).toFixed(2));
  
} catch (error) {
  console.error('❌ Error creating transactions:', error);
} finally {
  await pool.end();
  process.exit(0);
}