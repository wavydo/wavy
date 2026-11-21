import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_nN5F7HqPmaku@ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function addChatbotFields() {
  const client = await pool.connect();
  
  try {
    console.log('🤖 Adding chatbot fields to support_chats...');
    
    await client.query(`
      ALTER TABLE support_chats 
      ADD COLUMN IF NOT EXISTS bot_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS bot_negative_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bot_asked_questions TEXT;
    `);
    
    console.log('✅ Chatbot fields added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding chatbot fields:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addChatbotFields().catch(console.error);
