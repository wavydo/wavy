import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_nN5F7HqPmaku@ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: DATABASE_URL });

async function checkData() {
  const client = await pool.connect();
  try {
    console.log('\n📊 VERIFICANDO BASE DE DATOS:\n');
    
    // Check establishments
    const establishments = await client.query(`
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
    
    // Check by status
    const byStatus = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM establishments 
      GROUP BY status
    `);
    
    console.log('📈 Por Status:');
    byStatus.rows.forEach(s => {
      console.log(`   ${s.status}: ${s.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
