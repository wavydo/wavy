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

async function verifyAdmin() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT email, is_admin, is_admin::text as is_admin_text FROM users WHERE email = 'admin@tapp.admin'"
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('User data:');
      console.log('  email:', user.email);
      console.log('  is_admin:', user.is_admin);
      console.log('  is_admin type:', typeof user.is_admin);
      console.log('  is_admin as text:', user.is_admin_text);
      
      if (user.is_admin !== true) {
        console.log('\n⚠️  is_admin is NOT true, fixing...');
        await client.query("UPDATE users SET is_admin = true WHERE email = 'admin@tapp.admin'");
        console.log('✅ Fixed! is_admin set to true');
      } else {
        console.log('\n✅ is_admin is already true');
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAdmin();
