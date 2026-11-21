import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedLilNayBalances() {
  console.log('💰 Seeding Lil Nay establishment balances...\n');
  
  try {
    // 1. Find Lil Nay's user
    const userResult = await pool.query(`
      SELECT id, full_name, email 
      FROM users 
      WHERE email ILIKE '%lilnay%' OR full_name ILIKE '%lil%na%'
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.error('❌ Lil Nay user not found!');
      console.log('ℹ️  Looking for users with "nay" in name...');
      
      const searchResult = await pool.query(`
        SELECT id, full_name, email 
        FROM users 
        WHERE full_name ILIKE '%nay%' OR email ILIKE '%nay%'
      `);
      
      console.log('Found users:', searchResult.rows);
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.full_name} (${user.email})`);
    console.log(`   User ID: ${user.id}\n`);
    
    // 2. Get all establishments
    const establishmentsResult = await pool.query(`
      SELECT id, business_name, category
      FROM establishments
      WHERE approved = true
      ORDER BY business_name
    `);
    
    console.log(`📍 Found ${establishmentsResult.rows.length} establishments\n`);
    
    if (establishmentsResult.rows.length === 0) {
      console.error('❌ No establishments found!');
      return;
    }
    
    // 3. Insert RD$150 for each establishment
    const amount = 150.00;
    let successCount = 0;
    let skipCount = 0;
    
    for (const establishment of establishmentsResult.rows) {
      try {
        // Check if balance already exists
        const existingBalance = await pool.query(`
          SELECT balance FROM establishment_balances
          WHERE user_id = $1 AND establishment_id = $2
        `, [user.id, establishment.id]);
        
        if (existingBalance.rows.length > 0) {
          console.log(`⏭️  ${establishment.business_name} - Already has balance: RD$${existingBalance.rows[0].balance}`);
          skipCount++;
          continue;
        }
        
        // Insert new balance
        await pool.query(`
          INSERT INTO establishment_balances (
            user_id,
            establishment_id,
            balance,
            total_earned,
            last_transaction_at
          ) VALUES ($1, $2, $3, $3, NOW())
        `, [user.id, establishment.id, amount]);
        
        console.log(`✅ ${establishment.business_name} (${establishment.category}) - Added RD$${amount.toFixed(2)}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error adding balance for ${establishment.business_name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${successCount} establishments`);
    console.log(`   ⏭️  Skipped (existing): ${skipCount} establishments`);
    console.log(`   💰 Total added: RD$${(successCount * amount).toFixed(2)}`);
    
    // 4. Verify total balance
    const totalResult = await pool.query(`
      SELECT 
        COUNT(*) as establishments_count,
        SUM(balance) as total_balance
      FROM establishment_balances
      WHERE user_id = $1
    `, [user.id]);
    
    console.log(`\n✅ Final verification:`);
    console.log(`   Establishments with balance: ${totalResult.rows[0].establishments_count}`);
    console.log(`   Total balance: RD$${parseFloat(totalResult.rows[0].total_balance).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedLilNayBalances();
