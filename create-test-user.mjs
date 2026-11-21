import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestUser() {
  try {
    // Primero verificar si ya existe
    const check = await pool.query(
      `SELECT account_number FROM users WHERE account_number = $1`,
      ['22-584721']
    );

    if (check.rows.length > 0) {
      console.log('\n⚠️  El usuario de prueba ya existe');
      console.log('Account Number: 22-584721');
      console.log('Nombre: Ana Rodriguez\n');
      await pool.end();
      return;
    }
    
    // Password hasheado para 'test123' (bcrypt)
    const hashedPassword = '$2b$10$rOJ7KmYqT5qBgxELEKJqCujGkP8fOgYd.Q7iN5fz5zQZK8qVJ9.Wy';
    
    const result = await pool.query(
      `INSERT INTO users (
        full_name,
        email,
        password,
        account_number,
        balance
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, account_number, balance`,
      [
        'Ana Rodriguez',
        'ana.rodriguez@test.com',
        hashedPassword,
        '22-584721',
        15000.00
      ]
    );

    const user = result.rows[0];
    
    console.log('\n✅ Usuario de prueba creado:\n');
    console.log('Nombre:', user.full_name);
    console.log('Email:', user.email);
    console.log('Password: test123');
    console.log('Account Number:', user.account_number);
    console.log('Balance: RD$', parseFloat(user.balance).toFixed(2));
    console.log('\n🔑 Para transferir a este usuario, usa el account number:', user.account_number);
    console.log('\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTestUser();
