import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'establishments'
      ORDER BY ordinal_position
    `);
    console.log('Establishments columns:');
    result.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    // Sample data
    const sample = await pool.query(`SELECT * FROM establishments LIMIT 3`);
    console.log(`\nSample establishments (${sample.rows.length}):`);
    sample.rows.forEach(row => console.log(row));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
