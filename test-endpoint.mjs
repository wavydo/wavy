import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_nN5F7HqPmaku@ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: DATABASE_URL });

async function testQuery() {
  const client = await pool.connect();
  try {
    console.log('\n🧪 TESTING ESTABLISHMENTS QUERY:\n');
    
    // Query exactamente como en el endpoint
    const result = await client.query(`
      SELECT 
        id, 
        business_name, 
        category, 
        address, 
        email, 
        phone, 
        subscription_status,
        approved
      FROM establishments 
      WHERE approved = true AND subscription_status = 'active'
      ORDER BY business_name
    `);
    
    console.log(`✅ Found ${result.rows.length} establishments\n`);
    
    if (result.rows.length > 0) {
      console.log('First 5 establishments:');
      result.rows.slice(0, 5).forEach((est, i) => {
        console.log(`${i + 1}. ${est.business_name} (${est.category})`);
        console.log(`   Approved: ${est.approved}, Status: ${est.subscription_status}`);
      });
    }
    
    // Simular el mapping del endpoint
    const mapped = result.rows.map(est => ({
      id: est.id,
      name: est.business_name,
      category: est.category,
      address: est.address,
      email: est.email,
      phone: est.phone,
      status: est.approved && est.subscription_status === 'active' ? 'active' : 'inactive',
    }));
    
    console.log(`\n📦 After mapping: ${mapped.length} items`);
    console.log('\nSample mapped object:');
    console.log(JSON.stringify(mapped[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuery();
