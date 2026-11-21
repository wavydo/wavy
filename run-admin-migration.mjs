import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  host: 'ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_nN5F7HqPmaku',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración de admin features...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations/add-admin-features.sql'),
      'utf-8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Migración completada exitosamente!');
    console.log('\n📋 Cambios aplicados:');
    console.log('  - Campo status agregado a transactions');
    console.log('  - Campos de admin agregados a users');
    console.log('  - Tabla admin_actions creada');
    console.log('  - Tabla user_warnings creada');
    console.log('  - Índices optimizados');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
