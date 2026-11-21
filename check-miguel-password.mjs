import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

console.log('🔍 Checking Miguel\'s password...');

try {
  const [miguel] = await db.select().from(users).where(eq(users.email, 'miguelnla@outlook.com'));
  
  if (miguel) {
    console.log('✅ Miguel found');
    console.log('📧 Email:', miguel.email);
    console.log('🔑 Password hash:', miguel.password);
    
    // Test common passwords
    const testPasswords = ['password123', 'password', '123456', 'admin123'];
    
    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, miguel.password);
      if (isMatch) {
        console.log(`✅ Password match found: "${pwd}"`);
      }
    }
    
    // Set a new password if needed
    console.log('\n💡 Setting new password to: password123');
    const newHash = await bcrypt.hash('password123', 10);
    
    await db.update(users)
      .set({ password: newHash })
      .where(eq(users.email, 'miguelnla@outlook.com'));
    
    console.log('✅ Password updated successfully!');
    console.log('🔐 You can now login with:');
    console.log('   Email: miguelnla@outlook.com');
    console.log('   Password: password123');
    
  } else {
    console.log('❌ Miguel not found');
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await pool.end();
}