import { db } from '../storage.js';
import { sql } from 'drizzle-orm';

export async function createEmailsTable() {
  try {
    console.log('Creating emails table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "from" TEXT NOT NULL,
        "to" TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'received',
        resend_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        error TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        read_at TIMESTAMP
      )
    `);
    
    console.log('✅ Emails table created successfully');
  } catch (error) {
    console.error('Error creating emails table:', error);
    throw error;
  }
}
