import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

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
    console.log('🔄 Ejecutando migración para support_chats...');
    
    // Eliminar la foreign key constraint correcta
    await client.query(`
      ALTER TABLE support_chats 
      DROP CONSTRAINT IF EXISTS support_chats_user_id_fkey;
    `);
    
    console.log('✅ Foreign key constraint eliminada');
    
    // Eliminar también la otra por si acaso
    await client.query(`
      ALTER TABLE support_chats 
      DROP CONSTRAINT IF EXISTS support_chats_user_id_users_id_fk;
    `);
    
    console.log('✅ Verificadas todas las constraints');
    
    // Opcional: Agregar índice en user_id para rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_support_chats_user_id 
      ON support_chats(user_id);
    `);
    
    console.log('✅ Índice creado en user_id');
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📋 Cambios aplicados:');
    console.log('  - Eliminada foreign key constraint support_chats_user_id_fkey');
    console.log('  - Ahora support_chats puede aceptar IDs de users O establishments');
    console.log('  - Agregado índice para optimización de búsquedas');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
