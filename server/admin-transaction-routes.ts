import { Router, Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { requireAdmin } from './auth.js';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /api/admin/transactions - Ver todas las transacciones (con agrupación P2P)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.user_id,
        u.full_name as user_name,
        u.account_number as user_account,
        t.amount,
        t.final_amount,
        t.type,
        t.category,
        t.status,
        t.created_at,
        t.recipient_account,
        t.sender_account,
        t.note
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        u.full_name ILIKE $${paramIndex} OR 
        u.account_number ILIKE $${paramIndex} OR
        t.id::text ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC LIMIT 200';

    const result = await pool.query(query, params);

    console.log(`📊 Admin: Fetched ${result.rows.length} transactions`);
    
    // Log primeras 3 transacciones para depuración
    result.rows.slice(0, 3).forEach((tx, i) => {
      console.log(`  [${i}] ${tx.type} | user_account: ${tx.user_account} | sender: ${tx.sender_account} | recipient: ${tx.recipient_account}`);
    });

    // Mapear transacciones para frontend (agregar metadata para P2P)
    const transactions = result.rows.map(tx => {
      if (tx.type === 'p2p_transfer') {
        return {
          ...tx,
          sender_id: tx.user_id,
          recipient_id: null, // No tenemos recipient_id directo en una sola transacción
          sender_name: tx.user_name,
          recipient_name: null, // Necesitaríamos un JOIN adicional
          is_grouped: false, // Ya NO necesita agrupación
        };
      }
      return {
        ...tx,
        is_grouped: false
      };
    });

    res.json({ transactions });
  } catch (error) {
    console.error('❌ Error fetching admin transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/admin/transactions/:id/reverse - Reversar transacción
router.post('/:id/reverse', requireAdmin, async (req: Request, res: Response) => {
  console.log('📍 Reverse endpoint reached!');
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId; // Usar session en lugar de user

    console.log('🔄 Admin reversing transaction:', id, 'Reason:', reason, 'Admin:', adminId);

    await client.query('BEGIN');

    // 1. Obtener la transacción original
    const txResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
      [id]
    );

    const transaction = txResult.rows[0];

    if (!transaction) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only completed transactions can be reversed' });
    }

    // 2. Actualizar estado de la transacción original
    await client.query(
      'UPDATE transactions SET status = $1 WHERE id = $2',
      ['reversed', id]
    );

    // 3. Reversar el balance del usuario
    const amount = parseFloat(transaction.final_amount);
    const isDebit = transaction.type === 'debit';

    // Si era débito (salida), devolver el dinero
    // Si era crédito (entrada), quitar el dinero
    const balanceChange = isDebit ? amount : -amount;

    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [balanceChange, transaction.user_id]
    );

    // 4. Crear registro de auditoría
    await client.query(
      `INSERT INTO admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        reason,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'transaction_reverse',
        'transaction',
        id,
        reason || 'No reason provided',
        JSON.stringify({ original_transaction: transaction })
      ]
    );

    await client.query('COMMIT');

    console.log('✅ Transaction reversed successfully');

    res.json({
      success: true,
      message: 'Transaction reversed successfully',
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error reversing transaction:', error);
    res.status(500).json({ error: 'Failed to reverse transaction' });
  } finally {
    client.release();
  }
});

// POST /api/admin/transactions/:id/suspend - Suspender transacción
router.post('/:id/suspend', requireAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId;

    console.log('⏸️  Admin suspending transaction:', id);

    await client.query('BEGIN');

    // Actualizar estado
    await client.query(
      'UPDATE transactions SET status = $1 WHERE id = $2',
      ['suspended', id]
    );

    // Auditoría
    await client.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, target_type, target_id, reason
      ) VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'transaction_suspend', 'transaction', id, reason || 'No reason provided']
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Transaction suspended' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error suspending transaction:', error);
    res.status(500).json({ error: 'Failed to suspend transaction' });
  } finally {
    client.release();
  }
});

// POST /api/admin/transactions/:id/report - Reportar transacción
router.post('/:id/report', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId;

    await pool.query(
      'UPDATE transactions SET status = $1 WHERE id = $2',
      ['reported', id]
    );

    await pool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, target_type, target_id, reason
      ) VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'transaction_report', 'transaction', id, reason || 'Reported for review']
    );

    res.json({ success: true, message: 'Transaction reported' });

  } catch (error) {
    console.error('❌ Error reporting transaction:', error);
    res.status(500).json({ error: 'Failed to report transaction' });
  }
});

// POST /api/admin/transactions/:id/duplicate - Duplicar transacción
router.post('/:id/duplicate', requireAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId;

    await client.query('BEGIN');

    // Obtener transacción original
    const txResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    const original = txResult.rows[0];

    if (!original) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Crear duplicado
    await client.query(
      `INSERT INTO transactions (
        user_id, establishment_id, card_id, amount, discount_applied,
        final_amount, points_earned, type, category, status,
        recipient_account, sender_account, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        original.user_id, original.establishment_id, original.card_id,
        original.amount, original.discount_applied, original.final_amount,
        original.points_earned, original.type, original.category, 'completed',
        original.recipient_account, original.sender_account,
        `DUPLICATED: ${original.note || ''}`
      ]
    );

    // Actualizar balance si es necesario
    const amount = parseFloat(original.final_amount);
    const balanceChange = original.type === 'credit' ? amount : -amount;

    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [balanceChange, original.user_id]
    );

    // Auditoría
    await client.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, target_type, target_id, reason
      ) VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'transaction_duplicate', 'transaction', id, reason || 'Transaction duplicated']
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Transaction duplicated' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error duplicating transaction:', error);
    res.status(500).json({ error: 'Failed to duplicate transaction' });
  } finally {
    client.release();
  }
});

export default router;


// POST /api/admin/transactions/:id/resolve - Resolver disputa de transacción suspendida
router.post('/:id/resolve', requireAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { resolution, reason } = req.body; // 'sender' o 'recipient'
    const adminId = req.session.userId;

    console.log('⚖️  Admin resolving dispute:', id, 'Resolution:', resolution);

    await client.query('BEGIN');

    // 1. Obtener la transacción principal
    const txResult = await client.query(
      'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (txResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = txResult.rows[0];

    if (transaction.status !== 'suspended') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only suspended transactions can be resolved' });
    }

    // 2. Si es P2P, identificar sender y recipient desde los campos
    let senderUserId = transaction.user_id;
    let recipientUserId = null;

    if (transaction.type === 'p2p_transfer') {
      // Para P2P: sender es user_id, recipient hay que buscarlo por recipient_account
      const recipientResult = await client.query(
        'SELECT id FROM users WHERE account_number = $1',
        [transaction.recipient_account]
      );
      
      if (recipientResult.rows.length > 0) {
        recipientUserId = recipientResult.rows[0].id;
      }
      
      console.log(`🔗 P2P transaction: Sender ${senderUserId}, Recipient ${recipientUserId}`);
    }

    const amount = Math.abs(parseFloat(transaction.amount));

    // 3. Realizar el movimiento de fondos SEGÚN LA RESOLUCIÓN
    if (resolution === 'sender') {
      // A FAVOR DEL REMITENTE - REVERSAR TRANSACCIÓN
      console.log(`⚖️  Resolution: SENDER WINS - Reversing transaction`);
      
      // Marcar como REVERSADA
      await client.query(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        ['reversed', id]
      );
      
      // DEVOLVER fondos al remitente
      await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [amount, senderUserId]
      );
      console.log(`💰 Refunded ${amount} to sender ${senderUserId}`);
      
      // RESTAR fondos del destinatario
      if (recipientUserId) {
        await client.query(
          'UPDATE users SET balance = balance - $1 WHERE id = $2',
          [amount, recipientUserId]
        );
        console.log(`💸 Deducted ${amount} from recipient ${recipientUserId}`);
      }
      
    } else if (resolution === 'recipient') {
      // A FAVOR DEL DESTINATARIO - CONFIRMAR TRANSACCIÓN
      console.log(`⚖️  Resolution: RECIPIENT WINS - Confirming transaction`);
      
      // Marcar como RESUELTA (confirmar que el dinero queda en el destinatario)
      await client.query(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        ['resolved', id]
      );
      
      // NO HACER NADA con los fondos - ya están donde deben estar
      console.log(`✅ Transaction confirmed - funds stay with recipient`);
      
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid resolution type' });
    }

    // 4. Registrar acción de admin
    await client.query(
      `INSERT INTO admin_actions 
       (admin_id, action_type, target_type, target_id, reason) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        adminId,
        'transaction_resolve',
        'transaction',
        id,
        JSON.stringify({ resolution, reason, sender_id: senderUserId, recipient_id: recipientUserId })
      ]
    );

    await client.query('COMMIT');

    console.log('✅ Transaction dispute resolved successfully');

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error resolving dispute:', error);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  } finally {
    client.release();
  }
});

