import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log('🚀 Starting establishment_balances migration...\n');
  
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'create-establishment-balances.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Reading migration file...');
    console.log('📊 Executing migration SQL as single transaction...\n');
    
    // Execute entire SQL file as one statement
    await pool.query(migrationSQL);
    
    console.log(`✅ Migration executed successfully!`);
    
    // Verify the table was created
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'establishment_balances'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n📋 Table structure (${tableCheck.rows.length} columns):`);
    tableCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check how many records were migrated
    const recordCount = await pool.query('SELECT COUNT(*) FROM establishment_balances');
    console.log(`\n💾 Records in establishment_balances: ${recordCount.rows[0].count}`);
    
    // Show sample data
    const sample = await pool.query(`
      SELECT 
        u.full_name,
        e.business_name as establishment,
        eb.balance,
        eb.total_earned
      FROM establishment_balances eb
      JOIN users u ON eb.user_id = u.id
      JOIN establishments e ON eb.establishment_id = e.id
      ORDER BY eb.balance DESC
      LIMIT 5
    `);
    
    if (sample.rows.length > 0) {
      console.log(`\n📊 Sample data (top 5 balances):`);
      sample.rows.forEach(row => {
        console.log(`   ${row.full_name} @ ${row.establishment}: RD$${row.balance} (earned: RD$${row.total_earned})`);
      });
    } else {
      console.log(`\nℹ️  No existing data to migrate (empty establishment_balances table)`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table may already exist, checking...');
      try {
        const count = await pool.query('SELECT COUNT(*) FROM establishment_balances');
        console.log(`✅ Table exists with ${count.rows[0].count} records`);
      } catch (e) {
        console.error('❌ Table does not exist');
      }
    }
  } finally {
    await pool.end();
  }
}

runMigration();
