import express from 'express';
import { pool } from './storage.js';

const router = express.Router();

// Get user's unread warnings
router.get('/warnings', async (req, res) => {
  try {
    // If not authenticated, return no warning
    if (!req.session || !req.session.userId) {
      return res.json({ warning: null });
    }

    const result = await pool.query(`
      SELECT 
        w.id,
        w.title,
        w.message,
        w.severity,
        w.read,
        w.created_at,
        COALESCE(u.full_name, 'Admin') as admin_name
      FROM user_warnings w
      LEFT JOIN users u ON w.admin_id = u.id
      WHERE w.user_id = $1 AND w.read = false
      ORDER BY w.created_at DESC
      LIMIT 1
    `, [req.session.userId]);

    if (result.rows.length > 0) {
      res.json({ warning: result.rows[0] });
    } else {
      res.json({ warning: null });
    }
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ error: 'Failed to fetch warnings' });
  }
});

// Mark warning as read
router.post('/warnings/:id/read', async (req, res) => {
  try {
    // Accept userId from query param OR session (mobile vs web)
    const userId = req.query.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    // Verify warning belongs to user
    const warningResult = await pool.query(
      'SELECT user_id FROM user_warnings WHERE id = $1',
      [id]
    );

    if (warningResult.rows.length === 0) {
      return res.status(404).json({ error: 'Warning not found' });
    }

    if (warningResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    await pool.query(
      'UPDATE user_warnings SET read = true WHERE id = $1',
      [id]
    );

    console.log(`✅ Warning ${id} marked as read by user ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking warning as read:', error);
    res.status(500).json({ error: 'Failed to mark warning as read' });
  }
});

export default router;
