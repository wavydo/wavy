import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { establishments, events, perks } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🌱 Creating real events and perks...');

try {
  // 1. Obtener establecimientos existentes
  const allEstablishments = await db.select().from(establishments).limit(10);
  
  if (allEstablishments.length === 0) {
    console.log('❌ No establishments found. Please create establishments first.');
    await pool.end();
    process.exit(1);
  }

  console.log(`✅ Found ${allEstablishments.length} establishments`);

  // 2. Crear eventos reales
  const eventsData = [
    {
      title: 'Noche de Salsa en Casa 23',
      description: 'Disfruta de una noche llena de ritmo y sabor. DJ en vivo, clases gratis de salsa a las 8PM.',
      date: new Date('2026-09-15 20:00:00'),
      location: 'Casa 23 - Zona Colonial',
      capacity: 150,
      currentAttendees: 67,
      price: '500.00',
      establishment: 'Casa 23'
    },
    {
      title: 'Festival de Comida Dominicana',
      description: 'Prueba los mejores platos típicos dominicanos. Mofongo, sancocho, tostones y más.',
      date: new Date('2026-09-20 12:00:00'),
      location: 'Mofongo House - Gazcue',
      capacity: 200,
      currentAttendees: 134,
      price: '800.00',
      establishment: 'Mofongo House'
    },
    {
      title: 'Happy Hour Viernes',
      description: '2x1 en todas las bebidas de 6PM a 9PM. Ambiente perfecto para compartir con amigos.',
      date: new Date('2026-09-05 18:00:00'),
      location: 'La Esquina Bar',
      capacity: 100,
      currentAttendees: 89,
      price: '0.00',
      establishment: 'La Esquina'
    },
    {
      title: 'Cine al Aire Libre',
      description: 'Proyección especial de clásicos latinos bajo las estrellas. Entrada incluye snacks.',
      date: new Date('2026-09-10 19:30:00'),
      location: 'Cinema Santo Domingo',
      capacity: 80,
      currentAttendees: 45,
      price: '350.00',
      establishment: 'Cinema'
    },
    {
      title: 'Torneo de Dominó',
      description: 'Competencia amistosa con premios. Regístrate con tu pareja y demuestra tu habilidad.',
      date: new Date('2026-09-12 15:00:00'),
      location: 'Casa 23 - Zona Colonial',
      capacity: 60,
      currentAttendees: 32,
      price: '200.00',
      establishment: 'Casa 23'
    }
  ];

  for (const eventData of eventsData) {
    const [establishment] = await db.select()
      .from(establishments)
      .where(eq(establishments.businessName, eventData.establishment))
      .limit(1);

    if (establishment) {
      await db.insert(events).values({
        establishmentId: establishment.id,
        title: eventData.title,
        description: eventData.description,
        eventDate: eventData.date,
        location: eventData.location,
        capacity: eventData.capacity,
        currentAttendees: eventData.currentAttendees,
        ticketPrice: eventData.price,
        active: true
      }).onConflictDoNothing();
      console.log(`✅ Event created: ${eventData.title}`);
    }
  }

  // 3. Crear perks reales
  const perksData = [
    {
      title: '15% descuento en tu próxima visita',
      description: 'Válido de lunes a jueves, no acumulable con otras ofertas',
      type: 'discount',
      value: '15.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-09-30'),
      maxRedemptions: 100,
      establishment: 'Casa 23'
    },
    {
      title: 'Postre gratis con plato principal',
      description: 'Elige entre flan, tres leches o helado artesanal',
      type: 'freebie',
      value: '0.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-09-30'),
      maxRedemptions: 50,
      establishment: 'Mofongo House'
    },
    {
      title: 'Cashback de RD$200',
      description: 'En compras mayores a RD$1,500',
      type: 'cashback',
      value: '200.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-10-31'),
      maxRedemptions: 200,
      establishment: 'Supermercado Nacional'
    },
    {
      title: '2x1 en bebidas premium',
      description: 'Happy hour extendido solo para miembros TAPP',
      type: 'discount',
      value: '50.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-09-15'),
      maxRedemptions: 75,
      establishment: 'La Esquina'
    },
    {
      title: '20% descuento en medicamentos',
      description: 'Aplica para medicamentos genéricos y de marca',
      type: 'discount',
      value: '20.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-12-31'),
      maxRedemptions: 150,
      establishment: 'Farmacia Carol'
    },
    {
      title: 'Café gratis con cualquier compra',
      description: 'Tamaño regular, válido todo el mes',
      type: 'freebie',
      value: '0.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-09-30'),
      maxRedemptions: 300,
      establishment: 'Starbucks'
    },
    {
      title: 'Triple puntos TAPP',
      description: 'Acumula 3x puntos en todas tus compras este mes',
      type: 'points',
      value: '300.00',
      validFrom: new Date('2026-09-01'),
      validUntil: new Date('2026-09-30'),
      maxRedemptions: 500,
      establishment: 'Casa 23'
    }
  ];

  for (const perkData of perksData) {
    const [establishment] = await db.select()
      .from(establishments)
      .where(eq(establishments.businessName, perkData.establishment))
      .limit(1);

    if (establishment) {
      await db.insert(perks).values({
        establishmentId: establishment.id,
        title: perkData.title,
        description: perkData.description,
        type: perkData.type,
        value: perkData.value,
        validFrom: perkData.validFrom,
        validUntil: perkData.validUntil,
        maxRedemptions: perkData.maxRedemptions,
        currentRedemptions: 0,
        active: true
      }).onConflictDoNothing();
      console.log(`✅ Perk created: ${perkData.title}`);
    }
  }

  console.log('\n✨ EVENTS AND PERKS CREATED SUCCESSFULLY!');
  console.log(`📅 ${eventsData.length} events created`);
  console.log(`🎁 ${perksData.length} perks created`);

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await pool.end();
}