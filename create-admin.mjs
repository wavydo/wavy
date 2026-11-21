import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  host: 'ep-raspy-breeze-aynamddw-pooler.c-5.us-east-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_nN5F7HqPmaku',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating admin user...');
    
    // Check if admin already exists
    const checkResult = await client.query(
      "SELECT id FROM users WHERE email = 'admin@tapp.admin'"
    );

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  Admin user already exists, just setting admin flag...');
      await client.query(
        "UPDATE users SET is_admin = true WHERE email = 'admin@tapp.admin'"
      );
      console.log('✅ Successfully set admin@tapp.admin as administrator!');
      return;
    }

    // Create password hash
    const password = 'admin123'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate account number (format: XX-XXXXXX)
    const accountNumber = `99-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create admin user
    const result = await client.query(`
      INSERT INTO users (
        email,
        password,
        full_name,
        account_number,
        balance,
        is_admin,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, email, full_name, account_number
    `, [
      'admin@tapp.admin',
      hashedPassword,
      'TAPP Administrator',
      accountNumber,
      0, // Initial balance
      true
    ]);

    const user = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin credentials:');
    console.log(`   Email: admin@tapp.admin`);
    console.log(`   Password: admin123`);
    console.log(`   Account: ${user.account_number}`);
    console.log(`   Name: ${user.full_name}`);
    console.log('\n🔗 Access panel at:');
    console.log('   http://localhost:3001/admin');
    console.log('   or: http://localhost:3001/dashboard/admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();
