import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAccounts() {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        full_name, 
        email, 
        account_number, 
        balance 
      FROM users 
      WHERE account_number IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10`
    );

    console.log('\n📋 Cuentas disponibles para transferencias:\n');
    console.log('ID | Nombre | Email | Account Number | Balance');
    console.log('─'.repeat(80));
    
    result.rows.forEach(user => {
      console.log(
        `${user.id.slice(0, 8)}... | ${user.full_name.padEnd(20)} | ${user.email.padEnd(25)} | ${user.account_number} | RD$ ${parseFloat(user.balance).toFixed(2)}`
      );
    });

    console.log('\n✅ Total de cuentas:', result.rows.length);
    console.log('\n💡 Usa cualquier account_number (excepto el tuyo) para probar transferencias\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAccounts();
