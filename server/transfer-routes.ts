import { Router, Request, Response } from 'express';
import { requireAuth } from './auth';
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Run migration on startup
async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add-transfer-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    await pool.query(migrationSQL);
    console.log('✅ Transfer fields migration executed successfully');
  } catch (error: any) {
    console.log('⚠️  Migration may have already been run:', error.message);
  }
}

// Execute migration immediately
runMigration();

// Get recipient information by account number
router.get('/recipient/:accountNumber', requireAuth, async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.params;
    const userId = (req as any).user.id;

    console.log('🔍 Transfer: Looking for recipient with account:', accountNumber);
    console.log('🔍 Transfer: Sender user ID:', userId);

    // Verificar que el número de cuenta no sea el mismo usuario
    const senderResult = await pool.query(
      'SELECT account_number FROM users WHERE id = $1',
      [userId]
    );
    const senderAccount = senderResult.rows[0]?.account_number;
    console.log('🔍 Transfer: Sender account:', senderAccount);

    if (senderAccount === accountNumber) {
      console.log('❌ Transfer: Cannot transfer to own account');
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    // Buscar el destinatario
    const recipientResult = await pool.query(
      'SELECT id, full_name, account_number FROM users WHERE account_number = $1',
      [accountNumber]
    );

    console.log('🔍 Transfer: Recipient query result:', recipientResult.rows);

    const recipient = recipientResult.rows[0];

    if (!recipient) {
      console.log('❌ Transfer: Account not found:', accountNumber);
      return res.status(404).json({ error: 'Account not found' });
    }

    console.log('✅ Transfer: Recipient found:', recipient.full_name);

    // Obtener información del sender también
    const senderInfoResult = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [userId]
    );
    const senderInfo = senderInfoResult.rows[0];

    res.json({
      fullName: recipient.full_name,
      accountNumber: recipient.account_number,
      senderName: senderInfo.full_name,
      senderAccountNumber: senderAccount,
    });
  } catch (error) {
    console.error('❌ Transfer: Error fetching recipient:', error);
    res.status(500).json({ error: 'Failed to fetch recipient information' });
  }
});

// Execute transfer
router.post('/execute', requireAuth, async (req: Request, res: Response) => {
  // Usamos el pool para comenzar una transacción
  const client = await pool.connect();
  
  try {
    const { recipientAccountNumber, amount, note, sourceEstablishmentId } = req.body;
    const senderId = (req as any).user.id;

    // Validaciones básicas
    if (!recipientAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer data' });
    }

    // NUEVO: Validar que se especificó el establecimiento origen
    if (!sourceEstablishmentId) {
      return res.status(400).json({ error: 'Source establishment is required for transfers' });
    }

    console.log('💸 Starting P2P transfer:', { 
      recipientAccountNumber, 
      amount, 
      senderId, 
      sourceEstablishmentId 
    });

    // ============================================
    // INICIAR TRANSACCIÓN ATÓMICA
    // ============================================
    await client.query('BEGIN');
    console.log('🔒 Transaction STARTED');

    try {
      // 1. Verificar balance del sender en el establecimiento específico CON LOCK
      const senderBalanceResult = await client.query(
        `SELECT eb.balance, u.account_number, u.full_name, e.business_name as establishment_name
         FROM establishment_balances eb
         JOIN users u ON eb.user_id = u.id
         JOIN establishments e ON eb.establishment_id = e.id
         WHERE eb.user_id = $1 AND eb.establishment_id = $2
         FOR UPDATE`,
        [senderId, sourceEstablishmentId]
      );

      if (senderBalanceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log('❌ No balance in this establishment - ROLLBACK');
        return res.status(400).json({ 
          error: 'You don\'t have balance in this establishment' 
        });
      }

      const senderBalance = parseFloat(senderBalanceResult.rows[0].balance);
      const senderAccount = senderBalanceResult.rows[0].account_number;
      const senderName = senderBalanceResult.rows[0].full_name;
      const establishmentName = senderBalanceResult.rows[0].establishment_name;

      console.log(`💰 Sender balance at ${establishmentName}: RD$${senderBalance}`);
      
      if (senderBalance < amount) {
        await client.query('ROLLBACK');
        console.log('❌ Insufficient funds in this establishment - ROLLBACK');
        return res.status(400).json({ 
          error: `Insufficient funds at ${establishmentName}. Available: RD$${senderBalance.toFixed(2)}` 
        });
      }

      // 2. Verificar que el destinatario existe
      const recipientResult = await client.query(
        'SELECT id, balance, full_name, account_number FROM users WHERE account_number = $1',
        [recipientAccountNumber]
      );
      const recipient = recipientResult.rows[0];

      if (!recipient) {
        await client.query('ROLLBACK');
        console.log('❌ Recipient not found - ROLLBACK');
        return res.status(404).json({ error: 'Recipient not found' });
      }

      if (senderAccount === recipientAccountNumber) {
        await client.query('ROLLBACK');
        console.log('❌ Cannot transfer to own account - ROLLBACK');
        return res.status(400).json({ error: 'Cannot transfer to your own account' });
      }

      console.log('✅ Recipient found:', recipient.full_name);

      // 3. Actualizar balance del sender en establishment_balances (restar)
      const newSenderBalance = senderBalance - amount;
      await client.query(
        `UPDATE establishment_balances 
         SET balance = $1, 
             total_transferred_out = total_transferred_out + $2,
             last_transaction_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $3 AND establishment_id = $4`,
        [newSenderBalance.toFixed(2), amount, senderId, sourceEstablishmentId]
      );
      console.log(`✅ Sender establishment balance updated: RD$${newSenderBalance.toFixed(2)}`);

      // 4. Crear o actualizar balance del recipient en el mismo establecimiento (sumar)
      await client.query(
        `INSERT INTO establishment_balances (
          user_id, establishment_id, balance, total_transferred_in, last_transaction_at
         ) VALUES ($1, $2, $3, $3, NOW())
         ON CONFLICT (user_id, establishment_id) 
         DO UPDATE SET 
           balance = establishment_balances.balance + $3,
           total_transferred_in = establishment_balances.total_transferred_in + $3,
           last_transaction_at = NOW(),
           updated_at = NOW()`,
        [recipient.id, sourceEstablishmentId, amount]
      );
      console.log(`✅ Recipient establishment balance updated (added RD$${amount})`);

      // 5. Crear transacción P2P con source_establishment_id
      const transactionDate = new Date();
      const transactionResult = await client.query(
        `INSERT INTO transactions (
          user_id, 
          establishment_id,
          source_establishment_id,
          card_id,
          amount, 
          discount_applied,
          final_amount,
          points_earned,
          created_at,
          type, 
          category,
          recipient_account,
          sender_account,
          note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          senderId,  // El sender es el user principal
          null,      // establishment_id null para P2P (no es compra en establecimiento)
          sourceEstablishmentId, // NUEVO: De dónde vino el dinero
          null,
          amount,
          0,
          amount,
          0,
          transactionDate,
          'p2p_transfer',
          'p2p_transfer',
          recipientAccountNumber,
          senderAccount,
          note || null
        ]
      );
      const transactionId = transactionResult.rows[0].id;
      console.log('✅ P2P transaction created:', transactionId);

      // ============================================
      // COMMIT - Todo salió bien
      // ============================================
      await client.query('COMMIT');
      console.log('✅ Transaction COMMITTED successfully');

      res.json({
        success: true,
        message: 'Transfer completed successfully',
        newBalance: newSenderBalance.toFixed(2),
        transactionId: transactionId,
        recipientName: recipient.full_name,
        sourceEstablishment: establishmentName,
      });

    } catch (innerError) {
      // Si algo falla dentro de la transacción, hacer ROLLBACK
      await client.query('ROLLBACK');
      console.error('❌ Transaction ROLLED BACK due to error:', innerError);
      throw innerError;
    }

  } catch (error) {
    console.error('❌ Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed. Please try again.' });
  } finally {
    // SIEMPRE liberar el cliente
    client.release();
    console.log('🔓 Database client released');
  }
});

// Get transfer history
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await pool.query(
      `SELECT 
        id, 
        establishment, 
        amount, 
        date, 
        category,
        type,
        recipient_account,
        sender_account,
        note
      FROM transactions 
      WHERE user_id = $1 AND (category = 'transfer_out' OR category = 'transfer_in')
      ORDER BY date DESC
      LIMIT $2`,
      [userId, limit]
    );

    res.json({ transfers: result.rows });
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    res.status(500).json({ error: 'Failed to fetch transfer history' });
  }
});

// Get recent transfer contacts
router.get('/recent-contacts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 5;

    console.log('🔍 Fetching recent contacts for user:', userId);

    // Obtener el account_number del usuario actual
    const userResult = await pool.query(
      'SELECT account_number FROM users WHERE id = $1',
      [userId]
    );
    const currentUserAccount = userResult.rows[0]?.account_number;

    // Buscar transferencias P2P donde el usuario fue el sender
    // Agrupar por recipient_account para evitar duplicados y ordenar por más reciente
    const result = await pool.query(
      `SELECT DISTINCT ON (t.recipient_account)
        t.recipient_account as account_number,
        u.full_name as name,
        u.id as user_id,
        MAX(t.created_at) as last_transfer_date
      FROM transactions t
      LEFT JOIN users u ON u.account_number = t.recipient_account
      WHERE t.user_id = $1 
        AND t.type = 'p2p_transfer'
        AND t.recipient_account IS NOT NULL
        AND t.recipient_account != $2
      GROUP BY t.recipient_account, u.full_name, u.id
      ORDER BY t.recipient_account, MAX(t.created_at) DESC
      LIMIT $3`,
      [userId, currentUserAccount, limit]
    );

    console.log('✅ Found', result.rows.length, 'recent contacts');

    // Formatear respuesta con iniciales y color
    const contacts = result.rows.map((row, index) => {
      const nameParts = row.name?.split(' ') || ['Unknown'];
      const initials = nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0] + (nameParts[0][1] || '');
      
      // Colores predefinidos para avatares
      const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
      const color = colors[index % colors.length];

      return {
        id: row.user_id || row.account_number,
        name: row.name || 'Unknown User',
        accountNumber: row.account_number,
        initials: initials.toUpperCase(),
        color: color,
        lastTransferDate: row.last_transfer_date
      };
    });

    res.json({ contacts });
  } catch (error) {
    console.error('❌ Error fetching recent contacts:', error);
    res.status(500).json({ error: 'Failed to fetch recent contacts', contacts: [] });
  }
});

// Get user establishment balances (for admin)
router.get('/user-balances/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Admin: Fetching establishment balances for user:', userId);

    const result = await pool.query(
      `SELECT 
        eb.id,
        eb.establishment_id as "establishmentId",
        eb.balance,
        eb.total_earned as "totalEarned",
        eb.total_spent as "totalSpent",
        eb.total_transferred_out as "totalTransferredOut",
        eb.total_transferred_in as "totalTransferredIn",
        eb.last_transaction_at as "lastTransactionAt",
        e.business_name as "establishmentName",
        e.category as "establishmentCategory"
      FROM establishment_balances eb
      JOIN establishments e ON eb.establishment_id = e.id
      WHERE eb.user_id = $1
      ORDER BY eb.balance DESC`,
      [userId]
    );

    console.log('✅ Found', result.rows.length, 'establishment balances');

    const balances = result.rows.map((row: any) => ({
      id: row.id,
      establishmentId: row.establishmentId,
      establishmentName: row.establishmentName,
      establishmentCategory: row.establishmentCategory,
      balance: parseFloat(row.balance).toFixed(2),
      totalEarned: parseFloat(row.totalEarned).toFixed(2),
      totalSpent: parseFloat(row.totalSpent).toFixed(2),
      totalTransferredOut: parseFloat(row.totalTransferredOut).toFixed(2),
      totalTransferredIn: parseFloat(row.totalTransferredIn).toFixed(2),
      lastTransactionAt: row.lastTransactionAt,
    }));

    // Calculate total
    const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.balance), 0);

    res.json({ 
      balances,
      totalBalance: totalBalance.toFixed(2),
      count: balances.length
    });
  } catch (error) {
    console.error('❌ Error fetching user establishment balances:', error);
    res.status(500).json({ error: 'Failed to fetch establishment balances' });
  }
});

export default router;
