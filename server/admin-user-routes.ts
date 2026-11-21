import express from 'express';
import { pool } from './storage.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to require admin (simplified)
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.session.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// GET /api/admin/users - Obtener todos los usuarios
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, type, suspended } = req.query;
    
    let query = `
      SELECT 
        id, email, full_name, phone, address, city, date_of_birth,
        avatar_url, account_number, balance, points, level,
        is_verified, account_suspended, created_at, updated_at,
        last_login_at
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        email ILIKE $${paramIndex} OR 
        full_name ILIKE $${paramIndex} OR
        account_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (suspended === 'true') {
      query += ` AND account_suspended = true`;
    } else if (suspended === 'false') {
      query += ` AND account_suspended = false`;
    }

    query += ' ORDER BY created_at DESC LIMIT 200';

    const result = await pool.query(query, params);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:id - Obtener detalles completos de un usuario
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Usuario básico
    const userResult = await pool.query(
      `SELECT 
        id, email, full_name, phone, address, city, date_of_birth,
        avatar_url, account_number, balance, points, level,
        is_verified, account_suspended, created_at, updated_at,
        last_login_at, total_spent, total_saved, transaction_count,
        monthly_spent
      FROM users 
      WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Transacciones del usuario (incluyendo P2P donde es sender O recipient)
    const transactionsResult = await pool.query(
      `SELECT 
        id, amount, final_amount, type, category, status, 
        created_at, note, recipient_account, sender_account, user_id
      FROM transactions 
      WHERE user_id = $1 
         OR (type = 'p2p_transfer' AND (sender_account = $2 OR recipient_account = $2))
      ORDER BY created_at DESC 
      LIMIT 50`,
      [id, user.account_number]
    );

    // Advertencias del usuario
    const warningsResult = await pool.query(
      `SELECT 
        id, title, message, severity, read, created_at
      FROM user_warnings 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20`,
      [id]
    );

    // Acciones de admin sobre este usuario
    const actionsResult = await pool.query(
      `SELECT 
        id, action_type, reason, created_at, metadata
      FROM admin_actions 
      WHERE target_type = 'user' AND target_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20`,
      [id]
    );

    res.json({
      user,
      transactions: transactionsResult.rows,
      warnings: warningsResult.rows,
      adminActions: actionsResult.rows
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// POST /api/admin/users/:id/suspend - Suspender cuenta
router.post('/:id/suspend', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { reason, duration } = req.body;
    const adminId = req.session.userId;

    await client.query('BEGIN');

    // Suspender la cuenta
    await client.query(
      'UPDATE users SET account_suspended = true WHERE id = $1',
      [id]
    );

    // Crear advertencia de suspensión
    await client.query(
      `INSERT INTO user_warnings (
        user_id, title, message, severity, admin_id
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        'Account Suspended',
        reason || 'Your account has been suspended by an administrator.',
        'critical',
        adminId
      ]
    );

    // Registrar acción de admin - Try/catch para evitar error si admin no está en users
    try {
      await client.query(
        `INSERT INTO admin_actions (
          admin_id, action_type, target_type, target_id, reason, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adminId,
          'user_suspend',
          'user',
          id,
          reason || 'Account suspended',
          JSON.stringify({ duration })
        ]
      );
    } catch (auditError) {
      console.warn('⚠️ Could not log admin action:', auditError instanceof Error ? auditError.message : auditError);
    }

    await client.query('COMMIT');

    console.log(`✅ User ${id} suspended by admin ${adminId}`);

    res.json({ 
      success: true, 
      message: 'User suspended successfully' 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  } finally {
    client.release();
  }
});

// POST /api/admin/users/:id/unsuspend - Reactivar cuenta
router.post('/:id/unsuspend', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.session.userId;

    await client.query('BEGIN');

    await client.query(
      'UPDATE users SET account_suspended = false WHERE id = $1',
      [id]
    );

    try {
      await client.query(
        `INSERT INTO admin_actions (
          admin_id, action_type, target_type, target_id, reason
        ) VALUES ($1, $2, $3, $4, $5)`,
        [adminId, 'user_unsuspend', 'user', id, reason || 'Account reactivated']
      );
    } catch (auditError) {
      console.warn('⚠️ Could not log admin action:', auditError instanceof Error ? auditError.message : auditError);
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'User unsuspended successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error unsuspending user:', error);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  } finally {
    client.release();
  }
});

// POST /api/admin/users/:id/balance - Cambiar balance
router.post('/:id/balance', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.session.userId;

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    await client.query('BEGIN');

    // Obtener balance actual
    const userResult = await client.query(
      'SELECT balance, account_number FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const oldBalance = parseFloat(userResult.rows[0].balance);
    const newBalance = amount;

    // Actualizar balance
    await client.query(
      'UPDATE users SET balance = $1 WHERE id = $2',
      [newBalance, id]
    );

    // COMMIT PRIMERO para asegurar que el balance se guarde
    await client.query('COMMIT');

    console.log(`✅ Balance changed for user ${id}: ${oldBalance} → ${newBalance}`);

    // Registrar acción DESPUÉS del commit - no debe bloquear la operación
    try {
      await client.query(
        `INSERT INTO admin_actions (
          admin_id, action_type, target_type, target_id, reason, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adminId,
          'user_balance_change',
          'user',
          id,
          reason || 'Balance modified by admin',
          JSON.stringify({ old_balance: oldBalance, new_balance: newBalance })
        ]
      );
    } catch (auditError) {
      // Si falla el audit log, solo advertir pero no revertir el cambio
      console.warn('⚠️ Could not log admin action:', auditError instanceof Error ? auditError.message : auditError);
    }

    res.json({ 
      success: true, 
      message: 'Balance updated successfully',
      oldBalance,
      newBalance
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error changing balance:', error);
    res.status(500).json({ error: 'Failed to change balance' });
  } finally {
    client.release();
  }
});

// POST /api/admin/users/:id/warning - Enviar advertencia
router.post('/:id/warning', requireAdmin, async (req, res) => {
  console.log('📢 Warning endpoint called');
  console.log('📢 User ID:', req.params.id);
  console.log('📢 Body:', req.body);
  console.log('📢 Admin ID:', req.session.userId);
  
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { title, message, severity } = req.body;
    const adminId = req.session.userId;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    await client.query('BEGIN');

    // Crear advertencia
    const warningResult = await client.query(
      `INSERT INTO user_warnings (
        user_id, title, message, severity, admin_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [id, title, message, severity || 'warning', adminId]
    );

    // Registrar acción
    await client.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, target_type, target_id, reason, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'user_warning_sent',
        'user',
        id,
        'Warning sent to user',
        JSON.stringify({ warning_id: warningResult.rows[0].id, title, severity })
      ]
    );

    await client.query('COMMIT');

    console.log(`✅ Warning sent to user ${id}`);

    res.json({ 
      success: true, 
      message: 'Warning sent successfully',
      warningId: warningResult.rows[0].id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error sending warning:', error);
    res.status(500).json({ error: 'Failed to send warning' });
  } finally {
    client.release();
  }
});

// PUT /api/admin/users/:id - Actualizar datos del usuario
router.put('/:id', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { 
      email, full_name, phone, address, city, 
      account_number, points, level 
    } = req.body;
    const adminId = req.session.userId;

    await client.query('BEGIN');

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      params.push(address);
    }
    if (city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      params.push(city);
    }
    if (account_number !== undefined) {
      updates.push(`account_number = $${paramIndex++}`);
      params.push(account_number);
    }
    if (points !== undefined) {
      updates.push(`points = $${paramIndex++}`);
      params.push(points);
    }
    if (level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      params.push(level);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

    await client.query(query, params);

    // Registrar acción
    await client.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, target_type, target_id, reason, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        'user_data_update',
        'user',
        id,
        'User data updated by admin',
        JSON.stringify(req.body)
      ]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'User updated successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    client.release();
  }
});

export default router;
