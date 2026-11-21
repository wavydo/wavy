import 'dotenv/config';
import { db } from './storage.js';
import { sql } from 'drizzle-orm';

async function fixReviewedBy() {
  try {
    console.log('🔧 Dropping reviewed_by column from card_requests...');
    
    await db.execute(sql`ALTER TABLE card_requests DROP COLUMN IF EXISTS reviewed_by;`);
    
    console.log('✅ Column dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixReviewedBy();
