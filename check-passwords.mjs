import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon('postgresql://neondb_owner:npg_nN5F7HqPmaku@ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function checkPasswords() {
  try {
    console.log('🔍 Revisando usuarios y contraseñas...\n');
    
    // Revisar usuarios
    const users = await sql`SELECT id, email, full_name, password FROM users LIMIT 10`;
    console.log('👥 USUARIOS:');
    for (const user of users) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.full_name}`);
      console.log(`🔐 Password Hash: ${user.password.substring(0, 30)}...`);
      
      // Probar contraseñas comunes
      const commonPasswords = ['123456', 'password', 'miguel123', 'admin123', user.full_name?.toLowerCase()];
      
      for (const pwd of commonPasswords) {
        const isMatch = await bcrypt.compare(pwd, user.password);
        if (isMatch) {
          console.log(`✅ PASSWORD ENCONTRADO: "${pwd}"`);
          break;
        }
      }
      console.log('---\n');
    }
    
    // Revisar establecimientos
    const establishments = await sql`SELECT id, email, business_name, password FROM establishments LIMIT 5`;
    console.log('🏪 ESTABLECIMIENTOS:');
    for (const est of establishments) {
      console.log(`📧 Email: ${est.email}`);
      console.log(`🏢 Negocio: ${est.business_name}`);
      console.log(`🔐 Password Hash: ${est.password?.substring(0, 30)}...`);
      
      // Probar contraseñas comunes
      const commonPasswords = ['123456', 'password', 'admin123', 'business123'];
      
      for (const pwd of commonPasswords) {
        if (est.password) {
          const isMatch = await bcrypt.compare(pwd, est.password);
          if (isMatch) {
            console.log(`✅ PASSWORD ENCONTRADO: "${pwd}"`);
            break;
          }
        }
      }
      console.log('---\n');
    }
    
    // Revisar admins
    const admins = await sql`SELECT id, email, name, password FROM admins LIMIT 5`;
    console.log('👨‍💼 ADMINS:');
    for (const admin of admins) {
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Nombre: ${admin.name}`);
      console.log(`🔐 Password Hash: ${admin.password?.substring(0, 30)}...`);
      
      // Probar contraseñas comunes
      const commonPasswords = ['admin123', '123456', 'password', 'admin'];
      
      for (const pwd of commonPasswords) {
        if (admin.password) {
          const isMatch = await bcrypt.compare(pwd, admin.password);
          if (isMatch) {
            console.log(`✅ PASSWORD ENCONTRADO: "${pwd}"`);
            break;
          }
        }
      }
      console.log('---\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPasswords();