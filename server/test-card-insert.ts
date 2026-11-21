import 'dotenv/config';
import { db } from './storage.js';
import { cardRequests, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function testCardInsert() {
  try {
    console.log('🧪 Testing card request insert...\n');
    
    // Get first user
    const [user] = await db.select().from(users).limit(1);
    
    if (!user) {
      console.log('❌ No users found');
      process.exit(1);
    }

    console.log('✅ Found user:', user.email, '(', user.id, ')');

    // Insert test request with ALL fields
    const testData = {
      userId: user.id,
      fullName: 'Test User Full Name',
      dateOfBirth: '1990-05-15',
      idNumber: '12345678901',
      phoneNumber: '+1-809-555-1234',
      address: '123 Test Street, Apt 4B',
      city: 'Santo Domingo',
      postalCode: '10001',
      occupation: 'Software Engineer',
      monthlyIncome: '50000',
      requestReason: 'Online shopping',
      status: 'pending' as const,
    };

    console.log('\n📝 Inserting with data:');
    console.log(JSON.stringify(testData, null, 2));

    const [newRequest] = await db
      .insert(cardRequests)
      .values(testData)
      .returning();

    console.log('\n✅ Insert successful! Returned data:');
    console.log('  ID:', newRequest.id);
    console.log('  Full Name:', newRequest.fullName);
    console.log('  Date of Birth:', newRequest.dateOfBirth);
    console.log('  ID Number:', newRequest.idNumber);
    console.log('  Phone:', newRequest.phoneNumber);
    console.log('  Address:', newRequest.address);
    console.log('  City:', newRequest.city);
    console.log('  Postal Code:', newRequest.postalCode);
    console.log('  Occupation:', newRequest.occupation);
    console.log('  Monthly Income:', newRequest.monthlyIncome);
    console.log('  Request Reason:', newRequest.requestReason);

    // Now query it back
    console.log('\n🔍 Querying back from DB...');
    const [queried] = await db
      .select()
      .from(cardRequests)
      .where(eq(cardRequests.id, newRequest.id))
      .limit(1);

    console.log('\n📊 Queried data:');
    console.log('  ID:', queried.id);
    console.log('  Full Name:', queried.fullName);
    console.log('  Date of Birth:', queried.dateOfBirth);
    console.log('  ID Number:', queried.idNumber);
    console.log('  Phone:', queried.phoneNumber);
    console.log('  Address:', queried.address);
    console.log('  City:', queried.city);
    console.log('  Postal Code:', queried.postalCode);
    console.log('  Occupation:', queried.occupation);
    console.log('  Monthly Income:', queried.monthlyIncome);
    console.log('  Request Reason:', queried.requestReason);

    console.log('\n✅ All fields preserved correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCardInsert();
