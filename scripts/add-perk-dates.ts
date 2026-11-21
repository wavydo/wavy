import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    console.log('📅 Agregando fechas de validez a perks...');
    
    // Obtener todos los perks
    const perks = await pool.query('SELECT id, title FROM perks');
    console.log(`✅ Encontrados ${perks.rows.length} perks`);
    
    for (const perk of perks.rows) {
      // Fecha de inicio: hoy
      const validFrom = new Date();
      
      // Fecha de vencimiento: entre 7 y 60 días desde hoy
      const daysValid = Math.floor(Math.random() * 53) + 7; // 7-60 días
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + daysValid);
      
      await pool.query(
        'UPDATE perks SET valid_from = $1, valid_until = $2 WHERE id = $3',
        [validFrom, validUntil, perk.id]
      );
      
      console.log(`  ✓ ${perk.title}: Vence en ${daysValid} días (${validUntil.toLocaleDateString()})`);
    }
    
    console.log('\n✅ ¡Fechas agregadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

main();
