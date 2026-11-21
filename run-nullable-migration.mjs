import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'make-transactions-fields-nullable.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('🔄 Running migration to make establishment_id and card_id nullable...\n');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration executed successfully!');
    console.log('✅ establishment_id and card_id are now nullable for transfers\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
