import { Router } from 'express';
import { db } from './storage.js';
import { 
  users, establishments, admins, nfcCards, transactions, events, perks, drops,
  perkRedemptions, eventTickets, dropClaims, reviews, userFavorites,
  userMonthlyStats, merchantAnalytics, campaigns, establishmentRequests
} from '../shared/schema.js';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';

// ============================================
// IMPORT ADVANCED NFC ADMIN CONTROLS
// ============================================
import adminNFCRoutes from './admin-nfc-routes.js';
import securityMiddleware from './security-middleware.js';

const router = Router();

// Middleware simple para auth (TEMPORAL - mejorar en producción)
const adminAuth = (req: any, res: any, next: any) => {
  // Por ahora permitir todas las peticiones admin
  // En producción, implementar autenticación real con JWT
  next();
};

// ============================================
// NFC ADMIN CONTROL ROUTES (BANKING LEVEL)
// ============================================

// Suspender tarjeta por ID
router.post('/nfc/cards/suspend', 
  securityMiddleware.auditLog('suspend_card'),
  adminNFCRoutes.suspendCard
);

// Activar tarjeta
router.post('/nfc/cards/activate',
  securityMiddleware.auditLog('activate_card'),
  adminNFCRoutes.activateCard
);

// Marcar como robada
router.post('/nfc/cards/stolen',
  securityMiddleware.auditLog('mark_card_stolen'),
  adminNFCRoutes.markCardStolen
);

// Obtener todas las tarjetas
router.get('/nfc/cards',
  adminAuth,
  adminNFCRoutes.getAllCards
);

// Obtener detalles de tarjeta
router.get('/nfc/cards/:cardId',
  adminAuth,
  adminNFCRoutes.getCardDetails
);

// Buscar tarjetas
router.get('/nfc/cards/search',
  adminAuth,
  adminNFCRoutes.searchCards
);

// Dashboard stats
router.get('/nfc/dashboard-stats',
  adminAuth,
  adminNFCRoutes.getDashboardStats
);

// Bulk operations
router.post('/nfc/cards/bulk-suspend',
  securityMiddleware.auditLog('bulk_suspend_cards'),
  adminNFCRoutes.bulkSuspendCards
);

// Security logs
router.get('/security/logs',
  adminAuth,
  (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = securityMiddleware.getSecurityLogs(limit);
    res.json({
      success: true,
      logs
    });
  }
);

// ==================== STATS ====================
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalEstablishments,
      totalCards,
      totalTransactions,
      totalRevenue,
      activeEvents,
      activePerks,
      activeDrops
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(establishments),
      db.select({ count: sql<number>`count(*)` }).from(nfcCards).where(eq(nfcCards.status, 'active')),
      db.select({ count: sql<number>`count(*)` }).from(transactions),
      db.select({ sum: sql<string>`COALESCE(sum(final_amount), 0)` }).from(transactions),
      db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.active, true)),
      db.select({ count: sql<number>`count(*)` }).from(perks).where(eq(perks.active, true)),
      db.select({ count: sql<number>`count(*)` }).from(drops).where(eq(drops.active, true)),
    ]);

    res.json({
      totalUsers: totalUsers[0]?.count || 0,
      totalEstablishments: totalEstablishments[0]?.count || 0,
      totalCards: totalCards[0]?.count || 0,
      totalTransactions: totalTransactions[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.sum || '0',
      activeEvents: activeEvents[0]?.count || 0,
      activePerks: activePerks[0]?.count || 0,
      activeDrops: activeDrops[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== USERS ====================
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let query = db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    
    // Si hay búsqueda, filtrar
    if (search) {
      query = db.select().from(users)
        .where(
          sql`${users.email} ILIKE ${`%${search}%`} OR ${users.fullName} ILIKE ${`%${search}%`}`
        )
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const usersList = await query;
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(users);

    res.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total: total?.count || 0,
        pages: Math.ceil((total?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// COMENTADO: Esta ruta está duplicada en admin-user-routes.ts
// que devuelve más información (transactions, warnings, etc.)
// router.get('/users/:id', adminAuth, async (req, res) => {
//   try {
//     const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch user' });
//   }
// });

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const [updated] = await db.update(users)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== ESTABLISHMENTS ====================
router.get('/establishments', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const establishmentsList = await db.select()
      .from(establishments)
      .orderBy(desc(establishments.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql<number>`count(*)` }).from(establishments);

    res.json({
      establishments: establishmentsList,
      pagination: {
        page,
        limit,
        total: total?.count || 0,
        pages: Math.ceil((total?.count || 0) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch establishments' });
  }
});

router.get('/establishments/:id', adminAuth, async (req, res) => {
  try {
    const [establishment] = await db.select().from(establishments).where(eq(establishments.id, req.params.id));
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    res.json(establishment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch establishment' });
  }
});

router.put('/establishments/:id', adminAuth, async (req, res) => {
  try {
    const [updated] = await db.update(establishments)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(establishments.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update establishment' });
  }
});

router.delete('/establishments/:id', adminAuth, async (req, res) => {
  try {
    await db.delete(establishments).where(eq(establishments.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete establishment' });
  }
});

// ==================== NFC CARDS ====================
router.get('/cards', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const cardsList = await db.select({
      id: nfcCards.id,
      userId: nfcCards.userId,
      userEmail: nfcCards.userEmail,
      cardNumber: nfcCards.cardNumber,
      cardholderName: nfcCards.cardholderName,
      cardType: nfcCards.cardType,
      status: nfcCards.status,
      registeredAt: nfcCards.registeredAt,
      lastUsedAt: nfcCards.lastUsedAt,
    })
      .from(nfcCards)
      .orderBy(desc(nfcCards.registeredAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql<number>`count(*)` }).from(nfcCards);

    res.json({
      cards: cardsList,
      pagination: {
        page,
        limit,
        total: total?.count || 0,
        pages: Math.ceil((total?.count || 0) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

router.put('/cards/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(nfcCards)
      .set({ 
        status,
        deactivatedAt: status !== 'active' ? new Date() : null
      })
      .where(eq(nfcCards.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card status' });
  }
});

// ==================== EVENTS ====================
router.get('/events', adminAuth, async (req, res) => {
  try {
    const eventsList = await db.select().from(events).orderBy(desc(events.createdAt));
    res.json(eventsList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/events', adminAuth, async (req, res) => {
  try {
    const [newEvent] = await db.insert(events).values(req.body).returning();
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/events/:id', adminAuth, async (req, res) => {
  try {
    const [updated] = await db.update(events)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(events.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    await db.delete(events).where(eq(events.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ==================== PERKS ====================
router.get('/perks', adminAuth, async (req, res) => {
  try {
    const perksList = await db.select().from(perks).orderBy(desc(perks.createdAt));
    res.json(perksList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch perks' });
  }
});

router.post('/perks', adminAuth, async (req, res) => {
  try {
    const [newPerk] = await db.insert(perks).values(req.body).returning();
    res.json(newPerk);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create perk' });
  }
});

router.put('/perks/:id', adminAuth, async (req, res) => {
  try {
    const [updated] = await db.update(perks)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(perks.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update perk' });
  }
});

router.delete('/perks/:id', adminAuth, async (req, res) => {
  try {
    await db.delete(perks).where(eq(perks.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete perk' });
  }
});

// ==================== DROPS ====================
router.get('/drops', adminAuth, async (req, res) => {
  try {
    const dropsList = await db.select().from(drops).orderBy(desc(drops.createdAt));
    res.json(dropsList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

router.post('/drops', adminAuth, async (req, res) => {
  try {
    const [newDrop] = await db.insert(drops).values(req.body).returning();
    res.json(newDrop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create drop' });
  }
});

router.put('/drops/:id', adminAuth, async (req, res) => {
  try {
    const [updated] = await db.update(drops)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(drops.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drop' });
  }
});

router.delete('/drops/:id', adminAuth, async (req, res) => {
  try {
    await db.delete(drops).where(eq(drops.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drop' });
  }
});

// ==================== DATABASE BROWSER ====================
router.get('/database/tables', adminAuth, async (req, res) => {
  try {
    const tables = [
      'users', 'establishments', 'admins', 'nfc_cards', 'transactions',
      'establishment_requests', 'perks', 'events', 'drops',
      'perk_redemptions', 'event_tickets', 'drop_claims',
      'reviews', 'user_favorites', 'user_monthly_stats',
      'merchant_analytics', 'campaigns'
    ];
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

router.get('/database/tables/:tableName', adminAuth, async (req, res) => {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    // Map table names to their schemas
    const tableMap: Record<string, any> = {
      users,
      establishments,
      admins,
      nfc_cards: nfcCards,
      nfcCards,
      transactions,
      events,
      perks,
      drops,
      perk_redemptions: perkRedemptions,
      perkRedemptions,
      event_tickets: eventTickets,
      eventTickets,
      drop_claims: dropClaims,
      dropClaims,
      reviews,
      user_favorites: userFavorites,
      userFavorites,
      user_monthly_stats: userMonthlyStats,
      userMonthlyStats,
      merchant_analytics: merchantAnalytics,
      merchantAnalytics,
      campaigns,
      establishment_requests: establishmentRequests,
      establishmentRequests
    };

    const table = tableMap[tableName];
    
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const rows = await db.select().from(table).limit(limit).offset(offset);
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(table);

    res.json({
      rows,
      pagination: {
        page,
        limit,
        total: total?.count || 0,
        pages: Math.ceil((total?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// ==================== UPDATE ROW (EDICIÓN INLINE) ====================
router.put('/database/tables/:tableName/row/:id', adminAuth, async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const updates = req.body;
    
    // Construir query con valores escapados directamente
    const setClause = Object.entries(updates)
      .map(([key, value]) => {
        if (value === null) {
          return `${key} = NULL`;
        } else if (typeof value === 'string') {
          // Escapar comillas simples
          const escaped = String(value).replace(/'/g, "''");
          return `${key} = '${escaped}'`;
        } else if (typeof value === 'boolean') {
          return `${key} = ${value}`;
        } else if (typeof value === 'number') {
          return `${key} = ${value}`;
        } else {
          // Para objetos/arrays, convertir a JSON
          const escaped = JSON.stringify(value).replace(/'/g, "''");
          return `${key} = '${escaped}'`;
        }
      })
      .join(', ');
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = '${id}' RETURNING *`;
    
    console.log('🔄 Executing update:', query);
    
    const result = await db.execute(sql.raw(query));
    
    res.json({
      success: true,
      row: result.rows?.[0]
    });
  } catch (error: any) {
    console.error('Error updating row:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DELETE ROW ====================
router.delete('/database/tables/:tableName/row/:id', adminAuth, async (req, res) => {
  try {
    const { tableName, id } = req.params;
    
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    await db.execute(sql.raw(query, [id]));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADD ROW ====================
router.post('/database/tables/:tableName/row', adminAuth, async (req, res) => {
  try {
    const { tableName } = req.params;
    const data = req.body;
    
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, idx) => `$${idx + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await db.execute(sql.raw(query, values));
    
    res.json({
      success: true,
      row: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error adding row:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/database/execute', adminAuth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Ejecutar query SQL directa
    const result = await db.execute(sql.raw(query));
    
    res.json({
      success: true,
      result: result,
      rows: result.rows || [],
      rowCount: result.rowCount || 0
    });
  } catch (error: any) {
    console.error('Error executing SQL:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to execute query'
    });
  }
});

// ==================== GET TABLE SCHEMA ====================
router.get('/database/schema/:tableName', adminAuth, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Query para obtener la estructura de la tabla
    const result = await db.execute(sql.raw(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position;
    `));
    
    res.json({
      tableName,
      columns: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
