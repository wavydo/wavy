import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Imágenes únicas para cada establecimiento - 35 imágenes diferentes
const uniqueImages = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', // 1. Café moderno
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', // 2. Restaurante elegante
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', // 3. Restaurante comida
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', // 4. Bar/Restaurante
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', // 5. Restaurante casual
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', // 6. Café acogedor
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800', // 7. Comida gourmet
  'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800', // 8. Parrillada
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800', // 9. Comida fresca
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800', // 10. Bebidas/Bar
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', // 11. Bowl comida saludable
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', // 12. Plato gourmet
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // 13. Pizza
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', // 14. Burger
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', // 15. Pancakes/Desayuno
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', // 16. Brunch
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', // 17. Ensalada fresca
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', // 18. Sushi
  'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=800', // 19. Sushi rolls
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', // 20. Ramen
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', // 21. Pasta
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', // 22. Tacos
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800', // 23. Bowl asiático
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', // 24. Cocktails
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', // 25. Bar/Pub
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', // 26. Café espresso
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', // 27. Coffee art
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800', // 28. Bakery/Panadería
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', // 29. Pasteles
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', // 30. Donuts
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', // 31. Ice cream
  'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800', // 32. Smoothie bowl
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // 33. BBQ/Grill
  'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800', // 34. Steak
  'https://images.unsplash.com/photo-1562059390-a761a084768e?w=800', // 35. Rooftop dining
];

async function main() {
  try {
    console.log('📊 Obteniendo establecimientos...');
    
    // Obtener todos los establecimientos directamente con SQL
    const establishments = await pool.query('SELECT id, business_name FROM establishments ORDER BY id');
    console.log(`✅ Encontrados ${establishments.rows.length} establecimientos`);
    
    // Actualizar imágenes únicas para cada establecimiento
    console.log('\n🖼️  Actualizando imágenes únicas...');
    for (let i = 0; i < establishments.rows.length; i++) {
      const est = establishments.rows[i];
      const newImage = uniqueImages[i % uniqueImages.length];
      
      await pool.query(
        'UPDATE establishments SET logo = $1 WHERE id = $2',
        [newImage, est.id]
      );
      
      console.log(`  ✓ ${est.business_name}: ${newImage}`);
    }
    
    // Crear perks para cada establecimiento
    console.log('\n🎁 Creando perks...');
    const perksData = [
      { type: 'discount', title: '20% de descuento', description: 'En toda la carta de bebidas', value: 20 },
      { type: 'discount', title: '15% de descuento', description: 'En tu segunda visita del mes', value: 15 },
      { type: 'discount', title: '10% de descuento', description: 'Todos los lunes y martes', value: 10 },
    ];
    
    for (const est of establishments.rows) {
      // Crear 2-3 perks por establecimiento
      const numPerks = Math.floor(Math.random() * 2) + 2; // 2 o 3 perks
      
      for (let i = 0; i < numPerks; i++) {
        const perkTemplate = perksData[i % perksData.length];
        
        await pool.query(`
          INSERT INTO perks (establishment_id, type, title, description, value, max_redemptions, current_redemptions, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          est.id,
          perkTemplate.type,
          perkTemplate.title,
          perkTemplate.description,
          perkTemplate.value,
          Math.floor(Math.random() * 20) + 10,
          0,
          true
        ]);
      }
      
      console.log(`  ✓ ${est.business_name}: ${numPerks} perks creados`);
    }
    
    // Crear eventos para establecimientos seleccionados
    console.log('\n📅 Creando eventos...');
    const eventsData = [
      { 
        name: 'Happy Hour Especial', 
        description: '2x1 en cervezas artesanales de 5pm a 7pm',
        location: 'Barra principal'
      },
      { 
        name: 'Noche de Jazz en Vivo', 
        description: 'Música en vivo con artistas locales',
        location: 'Salón principal'
      },
      { 
        name: 'Degustación de Vinos', 
        description: 'Prueba 5 vinos premium seleccionados',
        location: 'Área VIP'
      },
    ];
    
    for (let i = 0; i < Math.min(10, establishments.rows.length); i++) {
      const est = establishments.rows[i];
      const eventTemplate = eventsData[i % eventsData.length];
      
      // Crear evento en el futuro (próximos 7-30 días)
      const daysAhead = Math.floor(Math.random() * 23) + 7;
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + daysAhead);
      eventDate.setHours(19, 0, 0, 0); // 7pm
      
      await pool.query(`
        INSERT INTO events (establishment_id, title, description, event_date, location, capacity)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        est.id,
        eventTemplate.name,
        eventTemplate.description,
        eventDate,
        eventTemplate.location,
        Math.floor(Math.random() * 30) + 20
      ]);
      
      console.log(`  ✓ ${est.business_name}: "${eventTemplate.name}" - ${eventDate.toLocaleDateString()}`);
    }
    
    // Verificar resultados
    console.log('\n📈 Resumen:');
    for (const est of establishments.rows) {
      const perks = await pool.query('SELECT id FROM perks WHERE establishment_id = $1', [est.id]);
      const events = await pool.query('SELECT id FROM events WHERE establishment_id = $1', [est.id]);
      
      console.log(`  ${est.business_name}: ${perks.rows.length} perks, ${events.rows.length} eventos`);
    }
    
    console.log('\n✅ ¡Seed completado exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

main();
