import express from 'express';
import { db, pool } from './storage.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to require admin (simplified - dev mode)
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // In development, just check if logged in as admin type
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Simply check userType from session
    if (req.session.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Execute SQL query (admin only, read-only for safety)
router.post('/query', requireAdmin, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Security: only allow SELECT queries
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(403).json({ 
        error: 'Only SELECT queries are allowed for safety. For modifications, use specific admin endpoints.' 
      });
    }

    // Execute query using pool directly
    const result = await pool.query(query);

    res.json({
      results: result.rows || [],
      rowCount: result.rowCount || 0
    });
  } catch (error: any) {
    console.error('Query execution error:', error);
    res.status(500).json({ 
      error: error.message || 'Query execution failed',
      detail: error.detail
    });
  }
});

export default router;
