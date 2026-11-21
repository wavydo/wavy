import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const users = await sql`
      SELECT email, role, name 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log('\n📋 USUARIOS ENCONTRADOS:');
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.name}`);
      console.log(`🎭 Rol: ${user.role}`);
      console.log('---');
    });
    
    console.log('\n💡 CREDENCIALES PARA LOGIN:');
    console.log('📧 Email: Usa cualquiera de los emails de arriba');
    console.log('🔐 Password: En desarrollo, cualquier contraseña funciona');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();