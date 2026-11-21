import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de tabla splits...\n');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../create-splits-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('✅ Tabla splits creada');
    console.log('✅ Tabla split_payments creada');
    console.log('✅ Índices y triggers configurados');
    console.log('\n📊 Sistema Split Bill completamente funcional\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default runMigration;
