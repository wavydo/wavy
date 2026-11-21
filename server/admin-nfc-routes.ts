// ============================================
// ADMIN NFC CONTROL - BANKING LEVEL
// Panel de control completo para administradores
// ============================================

import { Request, Response } from 'express';
import { db } from './storage.js';
import { 
  nfcCards, 
  users, 
  establishments,
  nfcTransactions,
  activityLogs,
  establishmentUserStats
} from '../shared/schema.js';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';

// ============================================
// 1. SUSPENDER TARJETA POR ID
// ============================================

export async function suspendCard(req: Request, res: Response) {
  try {
    const { cardId, reason, suspendedUntil } = req.body;
    const adminId = req.user?.id;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'Card ID is required'
      });
    }

    // Verificar que la tarjeta existe
    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, cardId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Actualizar estado a SUSPENDED
    await db.update(nfcCards)
      .set({
        status: 'suspended',
        lastUsed: new Date()
      })
      .where(eq(nfcCards.id, cardId));

    // Registrar en activity logs
    await db.insert(activityLogs).values({
      userId: card.userId,
      establishmentId: null,
      action: 'card_suspended',
      details: JSON.stringify({
        cardId,
        reason: reason || 'Administrative action',
        suspendedBy: adminId,
        suspendedUntil: suspendedUntil || null,
        previousStatus: card.status
      }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    });

    console.log(`🚫 Card ${cardId} suspended by admin ${adminId}`);

    return res.json({
      success: true,
      message: 'Card suspended successfully',
      data: {
        cardId,
        previousStatus: card.status,
        newStatus: 'suspended',
        user: card.user,
        suspendedAt: new Date(),
        reason: reason || 'Administrative action'
      }
    });

  } catch (error) {
    console.error('Error suspending card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to suspend card'
    });
  }
}

// ============================================
// 2. ACTIVAR TARJETA
// ============================================

export async function activateCard(req: Request, res: Response) {
  try {
    const { cardId } = req.body;
    const adminId = req.user?.id;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'Card ID is required'
      });
    }

    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, cardId)
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Activar tarjeta
    await db.update(nfcCards)
      .set({
        status: 'active',
        lastUsed: new Date()
      })
      .where(eq(nfcCards.id, cardId));

    // Registrar activación
    await db.insert(activityLogs).values({
      userId: card.userId,
      establishmentId: null,
      action: 'card_activated',
      details: JSON.stringify({
        cardId,
        activatedBy: adminId,
        previousStatus: card.status
      }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    });

    console.log(`✅ Card ${cardId} activated by admin ${adminId}`);

    return res.json({
      success: true,
      message: 'Card activated successfully',
      data: {
        cardId,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error activating card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to activate card'
    });
  }
}

// ============================================
// 3. MARCAR TARJETA COMO ROBADA
// ============================================

export async function markCardStolen(req: Request, res: Response) {
  try {
    const { cardId, reportDetails } = req.body;
    const adminId = req.user?.id;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: 'Card ID is required'
      });
    }

    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, cardId)
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Marcar como robada (BLOQUEO PERMANENTE)
    await db.update(nfcCards)
      .set({
        status: 'stolen',
        lastUsed: new Date()
      })
      .where(eq(nfcCards.id, cardId));

    // Registrar reporte
    await db.insert(activityLogs).values({
      userId: card.userId,
      establishmentId: null,
      action: 'card_stolen',
      details: JSON.stringify({
        cardId,
        reportedBy: adminId,
        reportDetails: reportDetails || 'No details provided',
        timestamp: new Date()
      }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    });

    console.log(`🚨 Card ${cardId} marked as STOLEN by admin ${adminId}`);

    return res.json({
      success: true,
      message: 'Card marked as stolen and permanently blocked',
      data: {
        cardId,
        status: 'stolen',
        blockedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error marking card as stolen:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark card as stolen'
    });
  }
}

// ============================================
// 4. OBTENER TODAS LAS TARJETAS
// ============================================

export async function getAllCards(req: Request, res: Response) {
  try {
    const { status, userId, page = 1, limit = 50 } = req.query;

    let query = db.select({
      id: nfcCards.id,
      cardNumber: nfcCards.cardNumber,
      status: nfcCards.status,
      issuedAt: nfcCards.issuedAt,
      lastUsed: nfcCards.lastUsed,
      userId: nfcCards.userId,
      userName: users.name,
      userEmail: users.email
    })
    .from(nfcCards)
    .leftJoin(users, eq(nfcCards.userId, users.id))
    .orderBy(desc(nfcCards.issuedAt));

    // Filtros
    if (status) {
      query = query.where(eq(nfcCards.status, status as string)) as any;
    }
    if (userId) {
      query = query.where(eq(nfcCards.userId, parseInt(userId as string))) as any;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const cards = await query.limit(parseInt(limit as string)).offset(offset);

    // Contar total
    const totalResult = await db.select({ count: sql`count(*)` })
      .from(nfcCards);
    const total = Number(totalResult[0].count);

    return res.json({
      success: true,
      data: {
        cards,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });

  } catch (error) {
    console.error('Error getting cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get cards'
    });
  }
}

// ============================================
// 5. OBTENER DETALLES DE TARJETA
// ============================================

export async function getCardDetails(req: Request, res: Response) {
  try {
    const { cardId } = req.params;

    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, parseInt(cardId)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Obtener transacciones recientes
    const transactions = await db.select()
      .from(nfcTransactions)
      .where(eq(nfcTransactions.cardId, parseInt(cardId)))
      .orderBy(desc(nfcTransactions.timestamp))
      .limit(20);

    // Obtener actividad reciente
    const activities = await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, card.userId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(10);

    return res.json({
      success: true,
      data: {
        card: {
          id: card.id,
          cardNumber: card.cardNumber,
          status: card.status,
          issuedAt: card.issuedAt,
          lastUsed: card.lastUsed,
          user: card.user
        },
        recentTransactions: transactions,
        recentActivity: activities,
        stats: {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          lastTransaction: transactions[0]?.timestamp || null
        }
      }
    });

  } catch (error) {
    console.error('Error getting card details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get card details'
    });
  }
}

// ============================================
// 6. BUSCAR TARJETAS
// ============================================

export async function searchCards(req: Request, res: Response) {
  try {
    const { query } = req.query;

    if (!query || (query as string).length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 3 characters'
      });
    }

    const searchTerm = `%${query}%`;

    const results = await db.select({
      id: nfcCards.id,
      cardNumber: nfcCards.cardNumber,
      status: nfcCards.status,
      userId: nfcCards.userId,
      userName: users.name,
      userEmail: users.email
    })
    .from(nfcCards)
    .leftJoin(users, eq(nfcCards.userId, users.id))
    .where(
      sql`${nfcCards.cardNumber} LIKE ${searchTerm} 
          OR ${users.name} LIKE ${searchTerm}
          OR ${users.email} LIKE ${searchTerm}`
    )
    .limit(20);

    return res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error searching cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search cards'
    });
  }
}

// ============================================
// 7. ESTADÍSTICAS DASHBOARD
// ============================================

export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Total de tarjetas por estado
    const cardsByStatus = await db.select({
      status: nfcCards.status,
      count: sql`count(*)`
    })
    .from(nfcCards)
    .groupBy(nfcCards.status);

    // Total de transacciones hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await db.select({
      count: sql`count(*)`,
      amount: sql`sum(cast(${nfcTransactions.amount} as decimal))`
    })
    .from(nfcTransactions)
    .where(gte(nfcTransactions.timestamp, today));

    // Tarjetas emitidas últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCards = await db.select({
      count: sql`count(*)`
    })
    .from(nfcCards)
    .where(gte(nfcCards.issuedAt, thirtyDaysAgo));

    // Top establecimientos por transacciones
    const topEstablishments = await db.select({
      establishmentId: nfcTransactions.establishmentId,
      establishmentName: establishments.name,
      transactionCount: sql`count(*)`,
      totalAmount: sql`sum(cast(${nfcTransactions.amount} as decimal))`
    })
    .from(nfcTransactions)
    .leftJoin(establishments, eq(nfcTransactions.establishmentId, establishments.id))
    .groupBy(nfcTransactions.establishmentId, establishments.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

    // Actividad sospechosa reciente
    const suspiciousActivity = await db.select()
      .from(activityLogs)
      .where(sql`${activityLogs.action} LIKE '%fraud%' OR ${activityLogs.action} LIKE '%suspicious%'`)
      .orderBy(desc(activityLogs.timestamp))
      .limit(10);

    return res.json({
      success: true,
      data: {
        cards: {
          byStatus: cardsByStatus.reduce((acc, item) => {
            acc[item.status] = Number(item.count);
            return acc;
          }, {} as Record<string, number>),
          recentlyIssued: Number(recentCards[0].count)
        },
        transactions: {
          today: {
            count: Number(todayTransactions[0].count),
            amount: Number(todayTransactions[0].amount || 0)
          }
        },
        topEstablishments,
        suspiciousActivity: suspiciousActivity.length,
        alerts: suspiciousActivity.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get dashboard stats'
    });
  }
}

// ============================================
// 8. BULK OPERATIONS (Operaciones masivas)
// ============================================

export async function bulkSuspendCards(req: Request, res: Response) {
  try {
    const { cardIds, reason } = req.body;
    const adminId = req.user?.id;

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Card IDs array is required'
      });
    }

    // Limitar operaciones masivas
    if (cardIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 cards can be suspended at once'
      });
    }

    // Suspender todas las tarjetas
    await db.update(nfcCards)
      .set({
        status: 'suspended',
        lastUsed: new Date()
      })
      .where(inArray(nfcCards.id, cardIds));

    // Registrar acción masiva
    await db.insert(activityLogs).values({
      userId: adminId || 0,
      establishmentId: null,
      action: 'bulk_card_suspension',
      details: JSON.stringify({
        cardIds,
        count: cardIds.length,
        reason: reason || 'Bulk administrative action',
        suspendedBy: adminId
      }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    });

    console.log(`🚫 ${cardIds.length} cards suspended in bulk by admin ${adminId}`);

    return res.json({
      success: true,
      message: `${cardIds.length} cards suspended successfully`,
      data: {
        suspendedCount: cardIds.length,
        cardIds
      }
    });

  } catch (error) {
    console.error('Error bulk suspending cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to bulk suspend cards'
    });
  }
}

// ============================================
// EXPORT ROUTES
// ============================================

export default {
  suspendCard,
  activateCard,
  markCardStolen,
  getAllCards,
  getCardDetails,
  searchCards,
  getDashboardStats,
  bulkSuspendCards
};
