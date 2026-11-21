import { Pool } from '@neondatabase/serverless';

/**
 * Helper functions for managing establishment-segmented balances
 */

/**
 * Add cashback to user's balance at a specific establishment
 */
export async function addEstablishmentCashback(
  pool: Pool,
  userId: string,
  establishmentId: string,
  amount: number,
  client?: any // Optional: use existing transaction client
): Promise<void> {
  const dbClient = client || pool;
  
  await dbClient.query(
    `INSERT INTO establishment_balances (
      user_id, establishment_id, balance, total_earned, last_transaction_at
    ) VALUES ($1, $2, $3, $3, NOW())
    ON CONFLICT (user_id, establishment_id) 
    DO UPDATE SET 
      balance = establishment_balances.balance + $3,
      total_earned = establishment_balances.total_earned + $3,
      last_transaction_at = NOW(),
      updated_at = NOW()`,
    [userId, establishmentId, amount]
  );
  
  console.log(`💰 Added RD$${amount} cashback for user ${userId} at establishment ${establishmentId}`);
}

/**
 * Deduct amount from user's balance at a specific establishment (for purchases)
 */
export async function deductEstablishmentBalance(
  pool: Pool,
  userId: string,
  establishmentId: string,
  amount: number,
  client?: any
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const dbClient = client || pool;
  
  // Check current balance
  const balanceResult = await dbClient.query(
    `SELECT balance FROM establishment_balances 
     WHERE user_id = $1 AND establishment_id = $2
     FOR UPDATE`,
    [userId, establishmentId]
  );
  
  if (balanceResult.rows.length === 0) {
    return {
      success: false,
      newBalance: 0,
      error: 'No balance at this establishment'
    };
  }
  
  const currentBalance = parseFloat(balanceResult.rows[0].balance);
  
  if (currentBalance < amount) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Insufficient balance. Available: RD$${currentBalance.toFixed(2)}`
    };
  }
  
  const newBalance = currentBalance - amount;
  
  await dbClient.query(
    `UPDATE establishment_balances 
     SET balance = $1,
         total_spent = total_spent + $2,
         last_transaction_at = NOW(),
         updated_at = NOW()
     WHERE user_id = $3 AND establishment_id = $4`,
    [newBalance.toFixed(2), amount, userId, establishmentId]
  );
  
  console.log(`💸 Deducted RD$${amount} from user ${userId} at establishment ${establishmentId}. New balance: RD$${newBalance}`);
  
  return {
    success: true,
    newBalance
  };
}

/**
 * Get user's balance at a specific establishment
 */
export async function getEstablishmentBalance(
  pool: Pool,
  userId: string,
  establishmentId: string
): Promise<number> {
  const result = await pool.query(
    `SELECT balance FROM establishment_balances 
     WHERE user_id = $1 AND establishment_id = $2`,
    [userId, establishmentId]
  );
  
  if (result.rows.length === 0) {
    return 0;
  }
  
  return parseFloat(result.rows[0].balance);
}

/**
 * Get all establishment balances for a user
 */
export async function getUserEstablishmentBalances(
  pool: Pool,
  userId: string
): Promise<Array<{
  establishmentId: string;
  establishmentName: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}>> {
  const result = await pool.query(
    `SELECT 
      eb.establishment_id as "establishmentId",
      e.business_name as "establishmentName",
      eb.balance,
      eb.total_earned as "totalEarned",
      eb.total_spent as "totalSpent"
    FROM establishment_balances eb
    JOIN establishments e ON eb.establishment_id = e.id
    WHERE eb.user_id = $1 AND eb.balance > 0
    ORDER BY eb.balance DESC`,
    [userId]
  );
  
  return result.rows.map(row => ({
    establishmentId: row.establishmentId,
    establishmentName: row.establishmentName,
    balance: parseFloat(row.balance),
    totalEarned: parseFloat(row.totalEarned),
    totalSpent: parseFloat(row.totalSpent),
  }));
}

/**
 * Calculate total balance across all establishments for a user
 */
export async function getUserTotalBalance(
  pool: Pool,
  userId: string
): Promise<number> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(balance), 0) as total
     FROM establishment_balances
     WHERE user_id = $1`,
    [userId]
  );
  
  return parseFloat(result.rows[0].total);
}

/**
 * Transfer balance from one user to another within the same establishment
 */
export async function transferEstablishmentBalance(
  pool: Pool,
  senderId: string,
  recipientId: string,
  establishmentId: string,
  amount: number,
  client?: any
): Promise<{ success: boolean; error?: string }> {
  const dbClient = client || pool;
  
  // Deduct from sender
  const deductResult = await deductEstablishmentBalance(
    pool,
    senderId,
    establishmentId,
    amount,
    dbClient
  );
  
  if (!deductResult.success) {
    return {
      success: false,
      error: deductResult.error
    };
  }
  
  // Add to recipient
  await dbClient.query(
    `INSERT INTO establishment_balances (
      user_id, establishment_id, balance, total_transferred_in, last_transaction_at
    ) VALUES ($1, $2, $3, $3, NOW())
    ON CONFLICT (user_id, establishment_id) 
    DO UPDATE SET 
      balance = establishment_balances.balance + $3,
      total_transferred_in = establishment_balances.total_transferred_in + $3,
      last_transaction_at = NOW(),
      updated_at = NOW()`,
    [recipientId, establishmentId, amount]
  );
  
  // Update sender's transferred_out
  await dbClient.query(
    `UPDATE establishment_balances 
     SET total_transferred_out = total_transferred_out + $1,
         updated_at = NOW()
     WHERE user_id = $2 AND establishment_id = $3`,
    [amount, senderId, establishmentId]
  );
  
  return { success: true };
}
