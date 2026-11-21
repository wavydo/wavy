#!/usr/bin/env node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { 
  users, 
  nfcCards
} from './shared/schema.ts';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🔄 Restoring Miguel\'s data...');

try {
  // Read the backup file
  const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('miguel-backup-'));
  if (backupFiles.length === 0) {
    console.error('❌ No backup file found!');
    process.exit(1);
  }
  
  const backupFile = backupFiles[backupFiles.length - 1]; // Get the latest
  console.log('📂 Reading backup:', backupFile);
  
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  const { user, cards } = backup;
  
  console.log(`👤 Restoring user: ${user.fullName} (${user.email})`);
  
  // Hash the password (assuming it needs to be re-hashed)
  const hashedPassword = await bcrypt.hash('12345678', 10); // Default password
  
  // Insert user with same ID to maintain relationships
  const [restoredUser] = await db.insert(users).values({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    password: hashedPassword, // Reset password for security
    phone: user.phone,
    address: user.address,
    city: user.city,
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
    avatarUrl: user.avatarUrl,
    totalSpent: user.totalSpent,
    totalSaved: user.totalSaved,
    transactionCount: user.transactionCount,
    monthlySpent: user.monthlySpent,
    balance: user.balance,
    accountNumber: user.accountNumber,
    points: user.points,
    level: user.level,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
  }).returning();
  
  console.log('✅ User restored successfully');
  console.log(`📱 Restoring ${cards.length} NFC cards...`);
  
  // Insert cards with new columns and default values
  for (const card of cards) {
    await db.insert(nfcCards).values({
      id: card.id,
      userId: card.userId,
      userEmail: card.userEmail,
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expiryDate: card.expiryDate,
      cardType: card.cardType,
      cardUIDHash: card.cardUIDHash,
      cardUIDEncrypted: card.cardUIDEncrypted,
      encryptionIV: card.encryptionIV,
      cardToken: card.cardToken,
      token: card.token,
      qrCode: card.qrCode,
      status: card.status,
      deviceInfo: card.deviceInfo,
      usageCount: card.usageCount,
      
      // NEW COLUMNS with default values
      cardLocked: false,
      cardPin: null, // No PIN initially
      contactlessEnabled: true,
      onlineTransactionsEnabled: true,
      internationalUsageEnabled: false,
      dailyLimit: '500.00',
      monthlyLimit: '5000.00',
      currentDailySpend: '0.00',
      currentMonthlySpend: '0.00',
      
      registeredAt: card.registeredAt ? new Date(card.registeredAt) : new Date(),
      activatedAt: card.activatedAt ? new Date(card.activatedAt) : null,
      lastUsedAt: card.lastUsedAt ? new Date(card.lastUsedAt) : null,
      deactivatedAt: card.deactivatedAt ? new Date(card.deactivatedAt) : null
    });
  }
  
  console.log('✅ All cards restored successfully');
  console.log('🔧 Cards now have the new management features:');
  console.log('   - Lock/Unlock functionality');
  console.log('   - Daily/Monthly limits');
  console.log('   - Security settings (contactless, online, international)');
  console.log('   - PIN support');
  
  console.log('');
  console.log('🔑 IMPORTANT: Your password has been reset to: 12345678');
  console.log('   Please log in and change it immediately.');
  
} catch (error) {
  console.error('❌ Error restoring Miguel\'s data:', error);
} finally {
  await pool.end();
  process.exit(0);
}