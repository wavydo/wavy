import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('Testing seed...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Test query
try {
  const result = await db.execute('SELECT NOW()');
  console.log('Connection successful!', result);
} catch (error) {
  console.error('Connection failed:', error);
}

await pool.end();
