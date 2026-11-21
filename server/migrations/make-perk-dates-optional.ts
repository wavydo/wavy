import { db } from '../storage.js';
import { sql } from 'drizzle-orm';

export async function makePerkDatesOptional() {
  try {
    // Make validFrom and validUntil optional in perks table
    await db.execute(sql`ALTER TABLE perks ALTER COLUMN valid_from DROP NOT NULL`);
    await db.execute(sql`ALTER TABLE perks ALTER COLUMN valid_until DROP NOT NULL`);
    
    console.log('✅ Perk dates made optional successfully');
  } catch (error: any) {
    // If already applied, just log and continue
    if (error.message?.includes('does not exist') || error.message?.includes('NOT NULL')) {
      console.log('ℹ️ Perk dates migration already applied or not needed');
    } else {
      console.error('❌ Error making perk dates optional:', error.message);
    }
  }
}
