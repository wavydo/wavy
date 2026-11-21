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

async function testData() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking transactions...');
    const txResult = await client.query('SELECT COUNT(*) FROM transactions');
    console.log(`   Total transactions: ${txResult.rows[0].count}`);
    
    console.log('\n🔍 Checking users...');
    const userResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`   Total users: ${userResult.rows[0].count}`);
    
    console.log('\n📋 Sample transactions:');
    const sampleTx = await client.query('SELECT id, amount, type, category, created_at FROM transactions LIMIT 3');
    sampleTx.rows.forEach(tx => {
      console.log(`   - ${tx.id.substring(0,8)}... | ${tx.type} | ${tx.category} | ${tx.amount}`);
    });
    
    console.log('\n👥 Sample users:');
    const sampleUsers = await client.query('SELECT id, email, full_name FROM users LIMIT 3');
    sampleUsers.rows.forEach(user => {
      console.log(`   - ${user.email} | ${user.full_name}`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

testData();
