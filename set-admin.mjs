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

async function setAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting admin@tapp.admin as admin...');
    
    // Check if user exists
    const checkResult = await client.query(
      "SELECT id, email, full_name FROM users WHERE email = 'admin@tapp.admin'"
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ User admin@tapp.admin not found in database');
      console.log('ℹ️  Available users:');
      const allUsers = await client.query('SELECT email, full_name FROM users LIMIT 10');
      allUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.full_name})`);
      });
      return;
    }

    const user = checkResult.rows[0];
    console.log(`✓ Found user: ${user.full_name} (${user.email})`);

    // Set as admin
    await client.query(
      "UPDATE users SET is_admin = true WHERE email = 'admin@tapp.admin'"
    );

    console.log('✅ Successfully set admin@tapp.admin as administrator!');
    console.log('\n📋 Admin credentials:');
    console.log(`   Email: admin@tapp.admin`);
    console.log(`   Access: http://localhost:3001/admin`);
    console.log('   or: http://localhost:3001/dashboard/admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

setAdminUser();
