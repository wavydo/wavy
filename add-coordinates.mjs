import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { establishments } from './dist/shared/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Coordenadas de establecimientos en Santo Domingo
// Zona Colonial, Piantini, Naco, Bella Vista, etc.
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

async function addCoordinates() {
  try {
    console.log('🗺️  Adding coordinates to establishments...');
    
    // Obtener todos los establecimientos
    const allEstablishments = await db.select().from(establishments);
    
    console.log(`📍 Found ${allEstablishments.length} establishments`);
    
    let updated = 0;
    
    for (let i = 0; i < allEstablishments.length; i++) {
      const est = allEstablishments[i];
      
      // Asignar coordenadas de forma circular
      const coords = coordinates[i % coordinates.length];
      
      // Agregar una pequeña variación aleatoria para que no estén exactamente en el mismo lugar
      const latVariation = (Math.random() - 0.5) * 0.002; // ±0.001 grados (~110 metros)
      const lngVariation = (Math.random() - 0.5) * 0.002;
      
      const finalLat = (coords.lat + latVariation).toFixed(8);
      const finalLng = (coords.lng + lngVariation).toFixed(8);
      
      await db.update(establishments)
        .set({
          locationLat: finalLat,
          locationLng: finalLng,
        })
        .where(eq(establishments.id, est.id));
      
      updated++;
      console.log(`  ✅ ${est.businessName}: ${finalLat}, ${finalLng}`);
    }
    
    console.log(`\n🎉 Successfully updated ${updated} establishments with coordinates!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

addCoordinates();
