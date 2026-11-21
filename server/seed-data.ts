// Script to seed the database with initial test data
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './storage.js';
import {
  users,
  establishments,
  admins,
  nfcCards,
  perks,
  events,
  drops,
  transactions,
} from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create Admin Account
    console.log('Creating admin account...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin@tapp.admin
    const [admin1] = await db
      .insert(admins)
      .values({
        fullName: 'TAPP Admin',
        email: 'admin@tapp.admin',
        password: adminPassword,
        role: 'admin',
      })
      .onConflictDoNothing()
      .returning();

    if (admin1) {
      console.log('✅ Admin created: admin@tapp.admin / admin123');
    }
    
    // Also create admin@tapp.do (legacy)
    const [admin2] = await db
      .insert(admins)
      .values({
        fullName: 'TAPP Admin',
        email: 'admin@tapp.do',
        password: adminPassword,
        role: 'admin',
      })
      .onConflictDoNothing()
      .returning();

    if (admin2) {
      console.log('✅ Admin created: admin@tapp.do / admin123');
    }

    // Create Test Users
    console.log('Creating test users...');
    const userPassword = await bcrypt.hash('user123', 10);
    const testUsers = [
      {
        fullName: 'María Castillo',
        email: 'maria@example.com',
        password: userPassword,
        phone: '8091234567',
        address: 'Av. Winston Churchill 1234',
        city: 'Santo Domingo',
        points: 5000,
        level: 'gold',
        totalSpent: '45000',
        monthlySpent: '12000',
      },
      {
        fullName: 'Juan Sánchez',
        email: 'juan@example.com',
        password: userPassword,
        phone: '8099876543',
        address: 'Calle El Conde 567',
        city: 'Santo Domingo',
        points: 2500,
        level: 'silver',
        totalSpent: '25000',
        monthlySpent: '8000',
      },
      {
        fullName: 'Ana Rodríguez',
        email: 'ana@example.com',
        password: userPassword,
        phone: '8095551234',
        address: 'Av. Abraham Lincoln 890',
        city: 'Santo Domingo',
        points: 1000,
        level: 'bronze',
        totalSpent: '8000',
        monthlySpent: '2500',
      },
    ];

    const createdUsers = [];
    for (const user of testUsers) {
      const [created] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
      if (created) {
        createdUsers.push(created);
        console.log(`✅ User created: ${created.email} / user123`);
      }
    }

    // Create NFC Cards for users
    console.log('Creating NFC cards...');
    for (const user of createdUsers) {
      const cardNumber = `TAPP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const token = crypto.randomBytes(32).toString('hex');
      const qrCode = `https://tapp.do/c/${token}`;

      await db
        .insert(nfcCards)
        .values({
          userId: user.id,
          cardNumber,
          token,
          qrCode,
          status: 'active',
          activatedAt: new Date(),
        })
        .onConflictDoNothing();

      console.log(`✅ NFC Card created for ${user.fullName}: ${cardNumber}`);
    }

    // Create Test Establishments
    console.log('Creating test establishments...');
    const establishmentPassword = await bcrypt.hash('business123', 10);
    const testEstablishments = [
      {
        businessName: 'La Parrillada Premium',
        ownerName: 'Carlos Martínez',
        email: 'laparrillada@example.com',
        password: establishmentPassword,
        phone: '8091112222',
        address: 'Av. Sarasota #45',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Restaurante de comida dominicana e internacional con ambiente familiar.',
        discountPercentage: 20,
        approved: true,
        approvedAt: new Date(),
        totalCustomers: 247,
        totalRevenue: '450000',
      },
      {
        businessName: 'Café Bohemio',
        ownerName: 'Laura García',
        email: 'cafebohemio@example.com',
        password: establishmentPassword,
        phone: '8093334444',
        address: 'Calle Arzobispo Meriño #67',
        city: 'Santo Domingo',
        category: 'cafeteria',
        description: 'Cafetería artesanal con los mejores granos dominicanos.',
        discountPercentage: 15,
        approved: true,
        approvedAt: new Date(),
        totalCustomers: 189,
        totalRevenue: '280000',
      },
      {
        businessName: 'Supermercado Nacional Plus',
        ownerName: 'Roberto Pérez',
        email: 'nacionalplus@example.com',
        password: establishmentPassword,
        phone: '8095556666',
        address: 'Av. Independencia #123',
        city: 'Santo Domingo',
        category: 'supermercado',
        description: 'Supermercado con productos frescos y variedad de marcas.',
        discountPercentage: 10,
        approved: true,
        approvedAt: new Date(),
        totalCustomers: 892,
        totalRevenue: '1250000',
      },
      {
        businessName: 'Farmacia San José',
        ownerName: 'Patricia Jiménez',
        email: 'farmaciasj@example.com',
        password: establishmentPassword,
        phone: '8097778888',
        address: 'Calle Duarte #234',
        city: 'Santo Domingo',
        category: 'farmacia',
        description: 'Farmacia con servicio 24/7 y entrega a domicilio.',
        discountPercentage: 12,
        approved: true,
        approvedAt: new Date(),
        totalCustomers: 456,
        totalRevenue: '680000',
      },
      {
        businessName: 'Barbería El Clásico',
        ownerName: 'Miguel Torres',
        email: 'barberiaclasico@example.com',
        password: establishmentPassword,
        phone: '8099990000',
        address: 'Av. México #89',
        city: 'Santo Domingo',
        category: 'barberia',
        description: 'Barbería tradicional con servicios modernos.',
        discountPercentage: 25,
        approved: true,
        approvedAt: new Date(),
        totalCustomers: 134,
        totalRevenue: '95000',
      },
    ];

    const createdEstablishments = [];
    for (const est of testEstablishments) {
      const [created] = await db
        .insert(establishments)
        .values(est)
        .onConflictDoNothing()
        .returning();
      if (created) {
        createdEstablishments.push(created);
        console.log(`✅ Establishment created: ${created.email} / business123`);
      }
    }

    // Create Perks
    console.log('Creating perks...');
    for (const est of createdEstablishments) {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Base cashback perk
      await db
        .insert(perks)
        .values({
          establishmentId: est.id,
          title: 'Cashback Base',
          description: `Gana 5% de cashback en todas tus compras en ${est.businessName}`,
          type: 'cashback',
          value: '5',
          validFrom: now,
          validUntil: nextMonth,
          active: true,
        })
        .onConflictDoNothing();

      // Special discount perk
      if (est.category === 'restaurante' || est.category === 'cafeteria') {
        await db
          .insert(perks)
          .values({
            establishmentId: est.id,
            title: 'Happy Hour',
            description: '25% de descuento de 5PM a 7PM',
            type: 'discount',
            value: '25',
            validFrom: now,
            validUntil: nextMonth,
            maxRedemptions: 100,
            currentRedemptions: 23,
            active: true,
          })
          .onConflictDoNothing();
      }

      console.log(`✅ Perks created for ${est.businessName}`);
    }

    // Create Events
    console.log('Creating events...');
    const restaurantEst = createdEstablishments.find(e => e.category === 'restaurante');
    if (restaurantEst) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7);

      await db
        .insert(events)
        .values({
          establishmentId: restaurantEst.id,
          title: 'Noche de Jazz en Vivo',
          description: 'Disfruta de música jazz en vivo mientras disfrutas de nuestra carta especial.',
          venue: restaurantEst.businessName,
          address: restaurantEst.address,
          city: restaurantEst.city,
          category: 'jazz',
          date: eventDate,
          startTime: '8:00 PM',
          endTime: '11:00 PM',
          price: '1500',
          capacity: 50,
          currentAttendees: 23,
          isPerkIncluded: true,
          perkDetails: 'Bebida de cortesía incluida',
          status: 'upcoming',
        })
        .onConflictDoNothing();

      console.log(`✅ Event created for ${restaurantEst.businessName}`);
    }

    // Create Drops
    console.log('Creating drops...');
    for (const est of createdEstablishments.slice(0, 2)) {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await db
        .insert(drops)
        .values({
          establishmentId: est.id,
          title: `Flash Sale - ${est.businessName}`,
          description: '30 cupos disponibles con 50% de descuento',
          totalSlots: 30,
          claimedSlots: 12,
          offerType: 'discount',
          offerValue: '50% OFF',
          validFrom: now,
          validUntil: tomorrow,
          radiusKm: 5,
          active: true,
        })
        .onConflictDoNothing();

      console.log(`✅ Drop created for ${est.businessName}`);
    }

    // Create sample transactions
    console.log('Creating sample transactions...');
    if (createdUsers.length > 0 && createdEstablishments.length > 0) {
      for (let i = 0; i < 10; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomEst = createdEstablishments[Math.floor(Math.random() * createdEstablishments.length)];
        const [userCard] = await db
          .select()
          .from(nfcCards)
          .where(eq(nfcCards.userId, randomUser.id));

        if (userCard) {
          const amount = Math.floor(Math.random() * 5000) + 500;
          const discount = (amount * randomEst.discountPercentage) / 100;
          const final = amount - discount;

          await db
            .insert(transactions)
            .values({
              userId: randomUser.id,
              establishmentId: randomEst.id,
              cardId: userCard.id,
              amount: amount.toString(),
              discountApplied: discount.toFixed(2),
              finalAmount: final.toFixed(2),
              pointsEarned: Math.floor(amount / 100) * 10,
            })
            .onConflictDoNothing();
        }
      }
      console.log(`✅ Created 10 sample transactions`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@tapp.do');
    console.log('  Password: admin123');
    console.log('\nUsers (all use password: user123):');
    console.log('  - maria@example.com');
    console.log('  - juan@example.com');
    console.log('  - ana@example.com');
    console.log('\nEstablishments (all use password: business123):');
    console.log('  - laparrillada@example.com');
    console.log('  - cafebohemio@example.com');
    console.log('  - nacionalplus@example.com');
    console.log('  - farmaciasj@example.com');
    console.log('  - barberiaclasico@example.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
