import { db } from './server/storage.js';
import { establishments, perks } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function seedPerks() {
  try {
    console.log('🌱 Seeding perks for La Parrillada...');
    
    // Get La Parrillada establishment
    const [laParrillada] = await db.select()
      .from(establishments)
      .where(eq(establishments.email, 'laparrillada@example.com'));
    
    if (!laParrillada) {
      console.error('❌ La Parrillada establishment not found');
      process.exit(1);
    }
    
    console.log(`✓ Found La Parrillada: ${laParrillada.businessName} (${laParrillada.id})`);
    
    // Delete existing perks for clean slate
    await db.delete(perks).where(eq(perks.establishmentId, laParrillada.id));
    console.log('✓ Cleaned existing perks');
    
    // Create 5 real perks
    const perksToCreate = [
      {
        establishmentId: laParrillada.id,
        title: '20% Off Weekend Special',
        description: 'Enjoy 20% off your entire bill every Saturday and Sunday. Valid for dine-in only.',
        type: 'discount',
        value: '20',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        maxRedemptions: 100,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Free Appetizer',
        description: 'Get a free appetizer of your choice with any main course order. One per table.',
        type: 'freebie',
        value: '0',
        image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        maxRedemptions: 50,
      },
      {
        establishmentId: laParrillada.id,
        title: '15% Cashback on Orders',
        description: 'Earn 15% cashback on all orders over RD$1,000. Cashback applied as TAPP points.',
        type: 'cashback',
        value: '15',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        maxRedemptions: null,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Double Points Monday',
        description: 'Earn 2X TAPP points on all purchases every Monday. Stack with other offers!',
        type: 'points',
        value: '200',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        maxRedemptions: null,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Birthday Special 30% Off',
        description: 'Celebrate your birthday with us! Show your ID and get 30% off your meal. Valid birth month only.',
        type: 'discount',
        value: '30',
        image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        maxRedemptions: null,
      },
    ];
    
    for (const perkData of perksToCreate) {
      const [newPerk] = await db.insert(perks).values(perkData).returning();
      console.log(`✓ Created: ${newPerk.title}`);
    }
    
    console.log('');
    console.log('✅ Successfully seeded 5 perks for La Parrillada!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding perks:', error);
    process.exit(1);
  }
}

seedPerks();
