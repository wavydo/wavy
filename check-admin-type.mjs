import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_nN5F7HqPmaku',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
  try {
    // Verificar en tabla admins
    const adminResult = await pool.query(
      "SELECT * FROM admins WHERE email LIKE 'admin%'"
    );
    
    console.log('\n📋 Admins encontrados:', adminResult.rows.length);
    adminResult.rows.forEach(admin => {
      console.log('  -', {
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name
      });
    });
    
    // Verificar en tabla users
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email LIKE 'admin%'"
    );
    
    console.log('\n📋 Users con email de admin:', userResult.rows.length);
    userResult.rows.forEach(user => {
      console.log('  -', {
        email: user.email,
        full_name: user.full_name
      });
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();
