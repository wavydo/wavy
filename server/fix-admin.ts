import 'dotenv/config';
import { db } from './storage.js';
import { admins } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function fixAdmin() {
  try {
    console.log('🔍 Checking for admin@tapp.admin...');
    
    // Check if admin@tapp.admin exists
    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, 'admin@tapp.admin'))
      .limit(1);

    if (existingAdmin) {
      console.log('✅ Admin exists:');
      console.log('   ID:', existingAdmin.id);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
    } else {
      console.log('❌ Admin NOT found, creating admin@tapp.admin...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const [newAdmin] = await db
        .insert(admins)
        .values({
          fullName: 'TAPP Admin',
          email: 'admin@tapp.admin',
          password: adminPassword,
          role: 'admin',
        })
        .returning();
      
      console.log('✅ Admin created with ID:', newAdmin.id);
      console.log('   Email: admin@tapp.admin');
      console.log('   Password: admin123');
    }

    // List all admins
    console.log('\n📋 All admins in database:');
    const allAdmins = await db.select().from(admins);
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (ID: ${admin.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdmin();
