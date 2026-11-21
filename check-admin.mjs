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
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, email, full_name, is_admin, password FROM users WHERE email = 'admin@tapp.admin'"
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Admin user found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.full_name);
      console.log('   Is Admin:', user.is_admin);
      console.log('   Password hash exists:', user.password ? 'Yes' : 'No');
      console.log('   Password hash:', user.password.substring(0, 20) + '...');
    } else {
      console.log('❌ Admin user not found');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkAdmin();
