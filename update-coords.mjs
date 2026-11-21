import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Coordenadas de establecimientos en Santo Domingo
const coordinates = [
  // Zona Colonial
  { lat: 18.4766, lng: -69.8933 },
  { lat: 18.4783, lng: -69.8965 },
  { lat: 18.4741, lng: -69.8912 },
  
  // Piantini
  { lat: 18.4745, lng: -69.9389 },
  { lat: 18.4758, lng: -69.9415 },
  { lat: 18.4732, lng: -69.9368 },
  { lat: 18.4761, lng: -69.9387 },
  { lat: 18.4741, lng: -69.9405 },
  
  // Naco
  { lat: 18.4712, lng: -69.9406 },
  { lat: 18.4695, lng: -69.9392 },
  { lat: 18.4728, lng: -69.9425 },
  { lat: 18.4704, lng: -69.9418 },
  
  // Bella Vista / Sarasota
  { lat: 18.4665, lng: -69.9245 },
  { lat: 18.4678, lng: -69.9265 },
  { lat: 18.4651, lng: -69.9231 },
  
  // Gazcue
  { lat: 18.4698, lng: -69.9145 },
  { lat: 18.4711, lng: -69.9168 },
  { lat: 18.4685, lng: -69.9125 },
  
  // Evaristo Morales
  { lat: 18.4625, lng: -69.9468 },
  { lat: 18.4638, lng: -69.9485 },
  { lat: 18.4612, lng: -69.9451 },
  
  // Arroyo Hondo
  { lat: 18.4835, lng: -69.9512 },
  { lat: 18.4851, lng: -69.9535 },
  { lat: 18.4822, lng: -69.9495 },
  
  // Ensanche Julieta
  { lat: 18.4598, lng: -69.9315 },
  { lat: 18.4612, lng: -69.9332 },
  { lat: 18.4585, lng: -69.9298 },
  
  // La Esperilla
  { lat: 18.4652, lng: -69.9385 },
  { lat: 18.4668, lng: -69.9405 },
  { lat: 18.4639, lng: -69.9368 },
  { lat: 18.4655, lng: -69.9392 },
];

async function updateCoordinates() {
  const client = await pool.connect();
  
  try {
    console.log('🗺️  Updating establishments with coordinates...\n');
    
    // Obtener todos los establecimientos
    const result = await client.query('SELECT id, business_name FROM establishments ORDER BY created_at');
    const establishments = result.rows;
    
    console.log(`📍 Found ${establishments.length} establishments\n`);
    
    let updated = 0;
    
    for (let i = 0; i < establishments.length; i++) {
      const est = establishments[i];
      
      // Asignar coordenadas de forma circular
      const coords = coordinates[i % coordinates.length];
      
      // Agregar una pequeña variación aleatoria para que no estén exactamente en el mismo lugar
      const latVariation = (Math.random() - 0.5) * 0.002; // ±0.001 grados (~110 metros)
      const lngVariation = (Math.random() - 0.5) * 0.002;
      
      const finalLat = (coords.lat + latVariation).toFixed(8);
      const finalLng = (coords.lng + lngVariation).toFixed(8);
      
      await client.query(
        'UPDATE establishments SET location_lat = $1, location_lng = $2 WHERE id = $3',
        [finalLat, finalLng, est.id]
      );
      
      updated++;
      console.log(`  ✅ ${est.business_name}: ${finalLat}, ${finalLng}`);
    }
    
    console.log(`\n🎉 Successfully updated ${updated} establishments with coordinates!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCoordinates();
