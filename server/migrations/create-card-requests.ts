import { db } from '../storage.js';
import { sql } from 'drizzle-orm';

export async function createCardRequestsTables() {
  try {
    // Create card_requests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS card_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        full_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        id_number TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        postal_code TEXT,
        occupation TEXT,
        monthly_income TEXT,
        request_reason TEXT,
        
        status TEXT NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_by UUID REFERENCES admins(id),
        reviewed_at TIMESTAMP,
        review_notes TEXT,
        
        card_id UUID REFERENCES nfc_cards(id),
        approved_at TIMESTAMP,
        
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create card_issue_reports table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS card_issue_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        card_id UUID NOT NULL REFERENCES nfc_cards(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        issue_type TEXT NOT NULL,
        description TEXT NOT NULL,
        
        device_model TEXT,
        device_os TEXT,
        app_version TEXT,
        
        status TEXT NOT NULL DEFAULT 'open',
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES admins(id),
        resolution_notes TEXT,
        
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON card_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status);
      CREATE INDEX IF NOT EXISTS idx_card_issue_reports_card_id ON card_issue_reports(card_id);
      CREATE INDEX IF NOT EXISTS idx_card_issue_reports_status ON card_issue_reports(status);
    `);

    console.log('✅ Card requests and issue reports tables created successfully');
  } catch (error) {
    console.error('❌ Error creating card requests tables:', error);
    throw error;
  }
}
