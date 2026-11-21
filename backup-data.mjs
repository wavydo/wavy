#!/usr/bin/env node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import { 
  users, 
  nfcCards
} from './shared/schema.ts';
import { eq } from 'drizzle-orm';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🔄 Backing up Miguel\'s user data...');

try {
  // Get Miguel's user data
  const miguelUser = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com')).limit(1);
  
  if (miguelUser.length === 0) {
    console.log('❌ User miguelnla@outlook.com not found!');
    process.exit(1);
  }
  
  const user = miguelUser[0];
  console.log('✅ Found user:', user.fullName, user.email);
  
  // Get Miguel's cards
  const miguelCards = await db.select().from(nfcCards).where(eq(nfcCards.userId, user.id));
  
  const backup = {
    timestamp: new Date().toISOString(),
    user: user,
    cards: miguelCards
  };

  // Save backup
  const backupFile = `miguel-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Miguel's data backed up to: ${backupFile}`);
  console.log(`📊 Backed up:`);
  console.log(`   - User: ${user.fullName} (${user.email})`);
  console.log(`   - Cards: ${miguelCards.length}`);
  console.log(`   - Points: ${user.points}`);
  console.log(`   - Total Spent: $${user.totalSpent}`);
  
} catch (error) {
  console.error('❌ Error backing up Miguel\'s data:', error);
} finally {
  await pool.end();
  process.exit(0);
}