import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { nfcCards, cardReports, cardConfigHistory } from '../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requireAuth } from './auth.js';

const router = Router();

// Todos los endpoints requieren autenticación
router.use(requireAuth);

/**
 * Lock/Unlock Card
 * PUT /api/cards/:cardId/lock
 */
router.put('/:cardId/lock', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { locked } = req.body;
    const userId = req.session.userId!;

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Actualizar estado
    await db.update(nfcCards)
      .set({ cardLocked: locked })
      .where(eq(nfcCards.id, cardId));

    // Registrar en historial
    await db.insert(cardConfigHistory).values({
      cardId,
      userId,
      action: locked ? 'lock_card' : 'unlock_card',
      oldValue: String(!locked),
      newValue: String(locked),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    console.log(`✅ Card ${locked ? 'locked' : 'unlocked'}: ${cardId} by user ${userId}`);

    return res.json({
      success: true,
      message: `Card ${locked ? 'locked' : 'unlocked'} successfully`,
      cardLocked: locked
    });
  } catch (error) {
    console.error('Error locking/unlocking card:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update card lock status'
    });
  }
});

/**
 * Change Card PIN
 * PUT /api/cards/:cardId/pin
 */
router.put('/:cardId/pin', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { oldPin, newPin } = req.body;
    const userId = req.session.userId!;

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4 digits'
      });
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Verificar PIN actual si existe
    if (card.cardPin && oldPin) {
      const isValid = await bcrypt.compare(oldPin, card.cardPin);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid current PIN'
        });
      }
    }

    // Hashear nuevo PIN
    const hashedPin = await bcrypt.hash(newPin, 10);

    // Actualizar PIN
    await db.update(nfcCards)
      .set({ cardPin: hashedPin })
      .where(eq(nfcCards.id, cardId));

    // Registrar en historial (sin guardar el PIN real)
    await db.insert(cardConfigHistory).values({
      cardId,
      userId,
      action: 'change_pin',
      oldValue: 'hidden',
      newValue: 'hidden',
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    console.log(`✅ PIN changed for card: ${cardId} by user ${userId}`);

    return res.json({
      success: true,
      message: 'PIN changed successfully'
    });
  } catch (error) {
    console.error('Error changing PIN:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change PIN'
    });
  }
});

/**
 * Toggle Card Settings (contactless, online, etc)
 * PUT /api/cards/:cardId/settings
 */
router.put('/:cardId/settings', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { 
      contactlessEnabled,
      onlineTransactionsEnabled,
      internationalUsageEnabled
    } = req.body;
    const userId = req.session.userId!;

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const updates: any = {};
    const changes: string[] = [];

    if (contactlessEnabled !== undefined) {
      updates.contactlessEnabled = contactlessEnabled;
      changes.push(`contactless: ${contactlessEnabled}`);
    }

    if (onlineTransactionsEnabled !== undefined) {
      updates.onlineTransactionsEnabled = onlineTransactionsEnabled;
      changes.push(`online: ${onlineTransactionsEnabled}`);
    }

    if (internationalUsageEnabled !== undefined) {
      updates.internationalUsageEnabled = internationalUsageEnabled;
      changes.push(`international: ${internationalUsageEnabled}`);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings to update'
      });
    }

    // Actualizar configuraciones
    await db.update(nfcCards)
      .set(updates)
      .where(eq(nfcCards.id, cardId));

    // Registrar en historial
    await db.insert(cardConfigHistory).values({
      cardId,
      userId,
      action: 'update_settings',
      oldValue: JSON.stringify({
        contactlessEnabled: card.contactlessEnabled,
        onlineTransactionsEnabled: card.onlineTransactionsEnabled,
        internationalUsageEnabled: card.internationalUsageEnabled
      }),
      newValue: JSON.stringify(updates),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    console.log(`✅ Settings updated for card: ${cardId} - ${changes.join(', ')}`);

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updates
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

/**
 * Update Card Limits
 * PUT /api/cards/:cardId/limits
 */
router.put('/:cardId/limits', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { dailyLimit, monthlyLimit } = req.body;
    const userId = req.session.userId!;

    // Validaciones
    if (dailyLimit !== undefined && (dailyLimit < 0 || dailyLimit > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit must be between 0 and 10,000'
      });
    }

    if (monthlyLimit !== undefined && (monthlyLimit < 0 || monthlyLimit > 50000)) {
      return res.status(400).json({
        success: false,
        message: 'Monthly limit must be between 0 and 50,000'
      });
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const updates: any = {};
    if (dailyLimit !== undefined) updates.dailyLimit = dailyLimit;
    if (monthlyLimit !== undefined) updates.monthlyLimit = monthlyLimit;

    // Actualizar límites
    await db.update(nfcCards)
      .set(updates)
      .where(eq(nfcCards.id, cardId));

    // Registrar en historial
    await db.insert(cardConfigHistory).values({
      cardId,
      userId,
      action: 'update_limits',
      oldValue: JSON.stringify({
        dailyLimit: card.dailyLimit,
        monthlyLimit: card.monthlyLimit
      }),
      newValue: JSON.stringify(updates),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    console.log(`✅ Limits updated for card: ${cardId}`);

    return res.json({
      success: true,
      message: 'Limits updated successfully',
      limits: updates
    });
  } catch (error) {
    console.error('Error updating limits:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update limits'
    });
  }
});

/**
 * Report Card Issue
 * POST /api/cards/:cardId/report
 */
router.post('/:cardId/report', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { reportType, description } = req.body;
    const userId = req.session.userId!;

    const validTypes = ['lost', 'stolen', 'damaged', 'fraud', 'other'];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: `Report type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Crear reporte
    const [report] = await db.insert(cardReports).values({
      cardId,
      userId,
      reportType,
      description: description || '',
      status: 'pending'
    }).returning();

    // Si es robo, bloquear la tarjeta automáticamente
    if (reportType === 'stolen' || reportType === 'lost') {
      await db.update(nfcCards)
        .set({ cardLocked: true, status: 'suspended' })
        .where(eq(nfcCards.id, cardId));

      // Registrar en historial
      await db.insert(cardConfigHistory).values({
        cardId,
        userId,
        action: 'auto_lock_due_to_report',
        oldValue: card.status,
        newValue: 'suspended',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    }

    console.log(`🚨 Card report created: ${reportType} for card ${cardId}`);

    return res.json({
      success: true,
      message: 'Report created successfully',
      report: {
        id: report.id,
        reportType: report.reportType,
        status: report.status,
        createdAt: report.createdAt
      },
      cardLocked: reportType === 'stolen' || reportType === 'lost'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

/**
 * Get Card Reports
 * GET /api/cards/:cardId/reports
 */
router.get('/:cardId/reports', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.session.userId!;

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Obtener reportes
    const reports = await db.query.cardReports.findMany({
      where: eq(cardReports.cardId, cardId),
      orderBy: [desc(cardReports.createdAt)]
    });

    return res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

/**
 * Get Card Config History
 * GET /api/cards/:cardId/history
 */
router.get('/:cardId/history', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verificar que la tarjeta pertenece al usuario
    const card = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      )
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Obtener historial
    const history = await db.query.cardConfigHistory.findMany({
      where: eq(cardConfigHistory.cardId, cardId),
      orderBy: [desc(cardConfigHistory.createdAt)],
      limit
    });

    return res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
});

/**
 * Get Card Details with All Settings
 * GET /api/cards/:cardId
 */
router.get('/:cardId', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const userId = req.session.userId;

    const [card] = await db
      .select()
      .from(nfcCards)
      .where(and(
        eq(nfcCards.id, cardId),
        eq(nfcCards.userId, userId)
      ))
      .limit(1);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    return res.json({
      success: true,
      card: {
        id: card.id,
        cardNumber: card.cardNumber || '****', // Default si no existe
        status: card.status,
        cardLocked: card.cardLocked || false,
        contactlessEnabled: card.contactlessEnabled !== false, // Default true
        onlineTransactionsEnabled: card.onlineTransactionsEnabled !== false,
        internationalUsageEnabled: card.internationalUsageEnabled || false,
        dailyLimit: card.dailyLimit || 500,
        monthlyLimit: card.monthlyLimit || 5000,
        currentDailySpend: card.currentDailySpend || 0,
        currentMonthlySpend: card.currentMonthlySpend || 0,
        hasPinSet: !!card.cardPin,
        registeredAt: card.registeredAt,
        lastUsedAt: card.lastUsedAt
      }
    });
  } catch (error) {
    console.error('Error fetching card details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch card details'
    });
  }
});

export default router;
