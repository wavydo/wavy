import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkData() {
  try {
    console.log('\n📊 VERIFICANDO BASE DE DATOS:\n');
    
    // Check establishments
    const establishments = await pool.query(`
      SELECT id, business_name, category, status 
      FROM establishments 
      ORDER BY business_name
      LIMIT 20
    `);
    
    console.log(`✅ Establishments: ${establishments.rows.length} encontrados\n`);
    
    if (establishments.rows.length > 0) {
      establishments.rows.forEach((est, index) => {
        console.log(`${index + 1}. ${est.business_name}`);
        console.log(`   - Category: ${est.category}`);
        console.log(`   - Status: ${est.status}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay establishments en la base de datos\n');
    }
    
    // Check events
    const events = await pool.query('SELECT COUNT(*) as count FROM events');
    console.log(`📅 Events: ${events.rows[0].count}`);
    
    // Check perks
    const perks = await pool.query('SELECT COUNT(*) as count FROM perks');
    console.log(`🎁 Perks: ${perks.rows[0].count}`);
    
    // Check users
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`�� Users: ${users.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
