import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_nN5F7HqPmaku@ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: DATABASE_URL });

async function checkData() {
  const client = await pool.connect();
  try {
    console.log('\n📊 VERIFICANDO BASE DE DATOS:\n');
    
    // Total establishments
    const total = await client.query('SELECT COUNT(*) as count FROM establishments');
    console.log(`Total establishments: ${total.rows[0].count}`);
    
    // Por approved
    const approved = await client.query('SELECT approved, COUNT(*) as count FROM establishments GROUP BY approved');
    console.log('\n✅ Por Approved:');
    approved.rows.forEach(r => console.log(`   ${r.approved ? 'Approved' : 'Not Approved'}: ${r.count}`));
    
    // Por subscription_status
    const sub = await client.query('SELECT subscription_status, COUNT(*) as count FROM establishments GROUP BY subscription_status');
    console.log('\n💳 Por Subscription Status:');
    sub.rows.forEach(r => console.log(`   ${r.subscription_status}: ${r.count}`));
    
    // Establishments activos (approved = true AND subscription_status = 'active')
    const active = await client.query(`
      SELECT business_name, category, subscription_status, approved 
      FROM establishments 
      WHERE approved = true AND subscription_status = 'active'
      ORDER BY business_name
      LIMIT 20
    `);
    
    console.log(`\n🏪 Establishments Activos (approved + active): ${active.rows.length}\n`);
    active.rows.forEach((est, index) => {
      console.log(`${index + 1}. ${est.business_name} (${est.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
