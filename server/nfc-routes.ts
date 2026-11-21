import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { nfcCards, nfcTransactions, establishmentUserStats, users } from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================
// IMPORT ADVANCED NFC FEATURES
// ============================================
import nfcAdvanced from './nfc-advanced-features.js';
import securityMiddleware from './security-middleware.js';

const router = Router();

// Apply NFC-specific rate limiting to ALL routes
router.use(securityMiddleware.nfcLimiter);
router.use(securityMiddleware.transactionLimiter);

// Encryption/Decryption configuration
const ENCRYPTION_KEY = process.env.NFC_ENCRYPTION_KEY 
  ? Buffer.from(process.env.NFC_ENCRYPTION_KEY, 'hex') 
  : crypto.randomBytes(32); // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt sensitive data (card UID)
 */
function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypt sensitive data
 */
function decrypt(encrypted: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encrypted, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Generate a secure token for the NFC card
 */
function generateCardToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash the card UID for database storage (one-way hash for lookup)
 */
function hashCardUID(uid: string): string {
  return crypto.createHash('sha256').update(uid).digest('hex');
}

/**
 * Register a new NFC card
 * POST /api/nfc/register-card
 */
router.post('/register-card', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated (using session, not Passport)
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { cardUID, deviceInfo } = req.body;

    if (!cardUID) {
      return res.status(400).json({
        success: false,
        message: 'Card UID is required',
      });
    }

    // Validate card UID format (basic validation)
    if (typeof cardUID !== 'string' || cardUID.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card UID format',
      });
    }

    const userId = req.session.userId;
    
    // Get user email from database
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    const userEmail = user.email;

    // Hash the UID for database lookup (prevents rainbow table attacks)
    const hashedUID = hashCardUID(cardUID);

    // Check if this card is already registered
    const existingCard = await db
      .select()
      .from(nfcCards)
      .where(eq(nfcCards.cardUIDHash, hashedUID))
      .limit(1);

    if (existingCard.length > 0) {
      const card = existingCard[0];
      
      // Check if it's registered to the same user
      if (card.userId === userId) {
        return res.status(200).json({
          success: true,
          message: 'Card already registered to your account',
          card: {
            id: card.id,
            cardToken: card.cardToken,
            status: card.status,
            registeredAt: card.registeredAt,
          },
        });
      } else {
        // Card is registered to a different user
        return res.status(409).json({
          success: false,
          message: 'This card is already registered to another account',
        });
      }
    }

    // Encrypt the actual UID for secure storage
    const { encrypted: encryptedUID, iv } = encrypt(cardUID);

    // Generate a unique token for this card
    const cardToken = generateCardToken();

    // Insert new card into database
    const newCard = await db.insert(nfcCards).values({
      userId,
      userEmail,
      cardUIDHash: hashedUID,
      cardUIDEncrypted: encryptedUID,
      encryptionIV: iv,
      cardToken,
      token: cardToken, // Legacy column name in production DB
      status: 'active',
      deviceInfo: JSON.stringify(deviceInfo || {}),
      registeredAt: new Date(),
      lastUsedAt: null,
    }).returning();

    console.log(`✅ NFC Card registered successfully for user ${userEmail}`);
    console.log(`   Card Token: ${cardToken.substring(0, 8)}...`);

    return res.status(201).json({
      success: true,
      message: 'Card registered successfully',
      card: {
        id: newCard[0].id,
        cardToken: newCard[0].cardToken,
        status: newCard[0].status,
        registeredAt: newCard[0].registeredAt,
      },
    });
  } catch (error) {
    console.error('❌ Error registering NFC card:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering card',
    });
  }
});

/**
 * Get all NFC cards for the authenticated user
 * GET /api/nfc/user-cards
 */
router.get('/user-cards', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const userId = req.session.userId;

    const userCards = await db
      .select({
        id: nfcCards.id,
        cardToken: nfcCards.cardToken,
        status: nfcCards.status,
        registeredAt: nfcCards.registeredAt,
        lastUsedAt: nfcCards.lastUsedAt,
      })
      .from(nfcCards)
      .where(and(
        eq(nfcCards.userId, userId),
        eq(nfcCards.status, 'active')
      ));

    return res.status(200).json({
      success: true,
      cards: userCards,
    });
  } catch (error) {
    console.error('❌ Error fetching user cards:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cards',
    });
  }
});

/**
 * Deactivate an NFC card
 * POST /api/nfc/deactivate-card
 */
router.post('/deactivate-card', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { cardUID } = req.body;

    if (!cardUID) {
      return res.status(400).json({
        success: false,
        message: 'Card UID is required',
      });
    }

    const userId = req.user.id;
    const hashedUID = hashCardUID(cardUID);

    // Update card status
    const result = await db
      .update(nfcCards)
      .set({
        status: 'inactive',
        deactivatedAt: new Date(),
      })
      .where(and(
        eq(nfcCards.cardUIDHash, hashedUID),
        eq(nfcCards.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found or not owned by user',
      });
    }

    console.log(`✅ NFC Card deactivated for user ${req.user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Card deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Error deactivating card:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deactivating card',
    });
  }
});

/**
 * Verify NFC card at establishment (with discount calculation)
 * POST /api/nfc/verify-card
 */
router.post('/verify-card', async (req: Request, res: Response) => {
  try {
    const { cardUID, establishmentId } = req.body;

    if (!cardUID) {
      return res.status(400).json({
        success: false,
        message: 'Card UID is required',
      });
    }

    if (!establishmentId) {
      return res.status(400).json({
        success: false,
        message: 'Establishment ID is required',
      });
    }

    const hashedUID = hashCardUID(cardUID);

    // Find active card with user info
    const result = await db.query.nfcCards.findFirst({
      where: and(
        eq(nfcCards.cardUIDHash, hashedUID),
        eq(nfcCards.status, 'active')
      ),
      with: {
        user: true, // Include user data
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Card not found or not active',
      });
    }

    const card = result;
    const user = result.user;

    // Get establishment info for discount
    const establishment = await db.query.establishments.findFirst({
      where: eq(establishments.id, establishmentId),
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Establishment not found',
      });
    }

    // Calculate applicable discount (simple: just establishment's rate)
    const finalDiscountRate = establishment.discountRate || 0;

    // Get user stats for this establishment
    const stats = await db.query.establishmentUserStats.findFirst({
      where: and(
        eq(establishmentUserStats.userId, user.id),
        eq(establishmentUserStats.establishmentId, establishment.id)
      ),
    });

    // Update last used timestamp
    await db
      .update(nfcCards)
      .set({ 
        lastUsedAt: new Date(),
        usageCount: (card.usageCount || 0) + 1
      })
      .where(eq(nfcCards.id, card.id));

    return res.status(200).json({
      success: true,
      message: 'Card verified successfully',
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        totalSpent: user.totalSpent,
        totalSaved: user.totalSaved || 0,
      },
      cardToken: card.cardToken,
      applicableDiscount: {
        rate: finalDiscountRate,
        maxAmount: establishment.maxDiscountAmount,
        minPurchase: establishment.minPurchaseAmount || 0,
      },
      establishmentStats: stats ? {
        visitCount: stats.visitCount,
        totalSpent: stats.totalSpent,
        totalSaved: stats.totalSaved,
        lastVisit: stats.lastVisitAt,
        customerTier: stats.customerTier,
      } : {
        visitCount: 0,
        totalSpent: 0,
        totalSaved: 0,
        lastVisit: null,
        customerTier: 'NEW',
      },
    });
  } catch (error) {
    console.error('❌ Error verifying card:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying card',
    });
  }
});

/**
 * Verify if NFC card belongs to specific user
 * POST /api/nfc/verify-user-card
 */
router.post('/verify-user-card', async (req: Request, res: Response) => {
  try {
    const { cardUID, userEmail } = req.body;

    if (!cardUID || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Card UID and user email are required',
      });
    }

    const hashedUID = hashCardUID(cardUID);

    // Find card for this specific user
    const cards = await db
      .select()
      .from(nfcCards)
      .where(and(
        eq(nfcCards.cardUIDHash, hashedUID),
        eq(nfcCards.userEmail, userEmail),
        eq(nfcCards.status, 'active')
      ))
      .limit(1);

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found or not registered to this user',
      });
    }

    const card = cards[0];

    // Update last used timestamp
    await db
      .update(nfcCards)
      .set({ lastUsedAt: new Date() })
      .where(eq(nfcCards.id, card.id));

    return res.status(200).json({
      success: true,
      message: 'Card found and belongs to user',
      card: {
        id: card.id,
        cardholderName: card.cardholderName,
        expiryDate: card.expiryDate,
        cardToken: card.cardToken,
        cardType: card.cardType,
        lastUsedAt: card.lastUsedAt,
        registeredAt: card.registeredAt,
      },
    });
  } catch (error) {
    console.error('❌ Error verifying user card:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying card',
    });
  }
});

export default router;


/**
 * Create a transaction (when customer pays at establishment)
 * POST /api/nfc/create-transaction
 * WITH BANKING-LEVEL SECURITY & FRAUD DETECTION
 */
router.post('/create-transaction', async (req: Request, res: Response) => {
  try {
    const {
      cardToken,
      establishmentId,
      subtotal,
      discountRate,
      paymentMethod,
      items,
      tipAmount = 0,
      notes,
      location // { country, city, lat, lon }
    } = req.body;

    // Validations
    if (!cardToken || !establishmentId || !subtotal || discountRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Get card and user
    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.cardToken, cardToken),
      with: {
        user: true,
      },
    });

    if (!card || card.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Card not found or not active',
      });
    }

    // ============================================
    // ADVANCED SECURITY CHECKS
    // ============================================

    // 1. CHECK CARD STATUS (puede estar suspendida, robada, etc)
    if (card.status === 'suspended') {
      nfcAdvanced.createAlert('fraud', 'high', 'Attempted use of suspended card', card.id, { cardToken });
      return res.status(403).json({
        success: false,
        message: 'Card is suspended. Please contact support.',
      });
    }

    if (card.status === 'stolen') {
      nfcAdvanced.createAlert('fraud', 'critical', 'Attempted use of stolen card', card.id, { 
        cardToken, 
        establishmentId,
        location 
      });
      return res.status(403).json({
        success: false,
        message: 'Card is blocked for security reasons. Please contact support immediately.',
      });
    }

    // 2. VELOCITY CHECKS (detección de fraude en tiempo real)
    const velocityCheck = await nfcAdvanced.performVelocityCheck(
      card.id,
      subtotal,
      establishmentId
    );

    if (velocityCheck.blocked) {
      return res.status(429).json({
        success: false,
        message: velocityCheck.reason || 'Transaction blocked due to suspicious activity',
        riskLevel: velocityCheck.riskLevel
      });
    }

    // Si hay alerta de riesgo medio, log pero permitir
    if (velocityCheck.riskLevel === 'medium' || velocityCheck.riskLevel === 'high') {
      nfcAdvanced.createAlert(
        'velocity',
        velocityCheck.riskLevel,
        velocityCheck.reason || 'Velocity check raised alert',
        card.id,
        { subtotal, establishmentId }
      );
    }

    // 3. TRANSACTION LIMITS (diarios/mensuales)
    const cardMetadata = (card.metadata as any) || {};
    const customLimits = cardMetadata.limits;

    const limitsCheck = await nfcAdvanced.checkTransactionLimits(
      card.id,
      subtotal,
      customLimits
    );

    if (!limitsCheck.allowed) {
      nfcAdvanced.createAlert('limit', 'medium', limitsCheck.reason!, card.id, { subtotal });
      return res.status(403).json({
        success: false,
        message: limitsCheck.reason,
        limits: limitsCheck.limits
      });
    }

    // 4. GEO RESTRICTIONS (si están configuradas)
    if (location && cardMetadata.geoRestrictions) {
      const geoCheck = await nfcAdvanced.checkGeoRestrictions(
        card.id,
        location,
        cardMetadata.geoRestrictions
      );

      if (!geoCheck.allowed) {
        nfcAdvanced.createAlert('geo', 'high', geoCheck.reason!, card.id, { location });
        return res.status(403).json({
          success: false,
          message: geoCheck.reason
        });
      }
    }

    // 5. TIME RESTRICTIONS (horario permitido)
    if (cardMetadata.timeRestrictions) {
      const timeCheck = nfcAdvanced.checkTimeRestrictions(cardMetadata.timeRestrictions);

      if (!timeCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: timeCheck.reason
        });
      }
    }

    const user = card.user;

    // Get establishment
    const establishment = await db.query.establishments.findFirst({
      where: eq(establishments.id, establishmentId),
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Establishment not found',
      });
    }

    // Calculate amounts
    let discountAmount = subtotal * (discountRate / 100);
    
    // Apply max discount limit if set
    if (establishment.maxDiscountAmount && discountAmount > establishment.maxDiscountAmount) {
      discountAmount = establishment.maxDiscountAmount;
    }
    
    const total = subtotal - discountAmount + (tipAmount || 0);
    
    // Calculate TAPP commission
    const commissionRate = establishment.commissionRate || 1.5;
    const tappCommissionAmount = total * (commissionRate / 100);
    const merchantNetAmount = total - tappCommissionAmount;

    // Generate transaction ID
    const transactionId = `txn_${crypto.randomBytes(16).toString('hex')}`;

    // Insert transaction into nfc_transactions table
    await db.insert(nfcTransactions).values({
      cardId: card.id,
      userId: user.id,
      establishmentId: establishment.id,
      amount: total.toString(),
      discountAmount: discountAmount.toString(),
      status: 'completed',
      paymentMethod: paymentMethod || 'nfc',
      metadata: {
        transactionId,
        subtotal,
        discountRate,
        tipAmount,
        items,
        notes,
        commissionRate,
        tappCommissionAmount,
        merchantNetAmount,
        location: location || null,
        velocityCheckResult: velocityCheck
      },
      timestamp: new Date()
    });

    // Update user stats
    await db.execute(sql`
      UPDATE users SET
        total_spent = total_spent + ${total},
        total_saved = total_saved + ${discountAmount},
        transaction_count = transaction_count + 1,
        updated_at = NOW()
      WHERE id = ${user.id}
    `);

    // Update establishment stats (if column exists)
    await db.execute(sql`
      UPDATE establishments SET
        updated_at = NOW()
      WHERE id = ${establishment.id}
    `);

    // Update or create establishment-user stats
    await db.execute(sql`
      INSERT INTO establishment_user_stats (
        user_id, establishment_id, visit_count, total_spent, total_saved,
        first_visit_at, last_visit_at, created_at, updated_at
      ) VALUES (
        ${user.id}, ${establishment.id}, 1, ${total}, ${discountAmount}, NOW(), NOW(), NOW(), NOW()
      )
      ON CONFLICT (user_id, establishment_id) DO UPDATE SET
        visit_count = establishment_user_stats.visit_count + 1,
        total_spent = establishment_user_stats.total_spent + ${total},
        total_saved = establishment_user_stats.total_saved + ${discountAmount},
        average_ticket = (establishment_user_stats.total_spent + ${total}) / (establishment_user_stats.visit_count + 1),
        last_visit_at = NOW(),
        updated_at = NOW()
    `);

    // Log activity
    await db.execute(sql`
      INSERT INTO activity_logs (
        user_id, establishment_id, action, details, ip_address, user_agent, timestamp
      ) VALUES (
        ${user.id},
        ${establishment.id},
        'nfc_transaction',
        ${JSON.stringify({
          transactionId,
          amount: total,
          discount: discountAmount,
          paymentMethod,
          riskLevel: velocityCheck.riskLevel
        })},
        ${req.ip || 'unknown'},
        ${req.headers['user-agent'] || 'unknown'},
        NOW()
      )
    `);

    // 6. AUTO-BLOCK CHECK (evaluar si bloquear automáticamente)
    await nfcAdvanced.evaluateAutoBlock(card.id);

    console.log(`✅ Transaction created: ${transactionId}`);
    console.log(`   User: ${user.fullName || user.name}`);
    console.log(`   Establishment: ${establishment.businessName || establishment.name}`);
    console.log(`   Amount: RD$ ${total.toFixed(2)} (saved RD$ ${discountAmount.toFixed(2)})`);
    console.log(`   Risk Level: ${velocityCheck.riskLevel}`);

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: {
        id: transactionId,
        subtotal,
        discountRate,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        tipAmount,
        merchantNetAmount: parseFloat(merchantNetAmount.toFixed(2)),
        riskLevel: velocityCheck.riskLevel,
        saved: parseFloat(discountAmount.toFixed(2))
      },
    });
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating transaction',
    });
  }
});


// ============================================
// ADVANCED NFC FEATURES ENDPOINTS
// ============================================

/**
 * Set card limits (admin or user)
 * PUT /api/nfc/cards/:cardId/limits
 */
router.put('/cards/:cardId/limits', nfcAdvanced.setCardLimits);

/**
 * Get active alerts for a card
 * GET /api/nfc/cards/:cardId/alerts
 */
router.get('/cards/:cardId/alerts', (req: Request, res: Response) => {
  const cardId = parseInt(req.params.cardId);
  const alerts = nfcAdvanced.getActiveAlerts(cardId);

  return res.json({
    success: true,
    alerts
  });
});

/**
 * Get all active alerts (admin only)
 * GET /api/nfc/alerts
 */
router.get('/alerts', (req: Request, res: Response) => {
  const alerts = nfcAdvanced.getActiveAlerts();

  return res.json({
    success: true,
    count: alerts.length,
    alerts
  });
});

/**
 * Get transaction history for a card
 * GET /api/nfc/cards/:cardId/transactions
 */
router.get('/cards/:cardId/transactions', async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await db.select()
      .from(nfcTransactions)
      .where(eq(nfcTransactions.cardId, cardId))
      .orderBy(desc(nfcTransactions.timestamp))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: sql`count(*)` })
      .from(nfcTransactions)
      .where(eq(nfcTransactions.cardId, cardId));

    return res.json({
      success: true,
      transactions,
      pagination: {
        limit,
        offset,
        total: Number(total[0].count)
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * Get card statistics
 * GET /api/nfc/cards/:cardId/stats
 */
router.get('/cards/:cardId/stats', async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.cardId);

    // Get card info
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
        message: 'Card not found'
      });
    }

    // Get transaction stats
    const stats = await db.select({
      totalTransactions: sql`count(*)`,
      totalAmount: sql`sum(cast(${nfcTransactions.amount} as decimal))`,
      totalDiscount: sql`sum(cast(${nfcTransactions.discountAmount} as decimal))`,
      avgTransaction: sql`avg(cast(${nfcTransactions.amount} as decimal))`
    })
      .from(nfcTransactions)
      .where(eq(nfcTransactions.cardId, cardId));

    // Get last 30 days activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await db.select({
      count: sql`count(*)`,
      amount: sql`sum(cast(${nfcTransactions.amount} as decimal))`
    })
      .from(nfcTransactions)
      .where(
        and(
          eq(nfcTransactions.cardId, cardId),
          gte(nfcTransactions.timestamp, thirtyDaysAgo)
        )
      );

    return res.json({
      success: true,
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        status: card.status,
        issuedAt: card.issuedAt,
        lastUsed: card.lastUsed,
        user: card.user
      },
      stats: {
        allTime: {
          transactions: Number(stats[0].totalTransactions),
          totalAmount: Number(stats[0].totalAmount || 0),
          totalSaved: Number(stats[0].totalDiscount || 0),
          avgTransaction: Number(stats[0].avgTransaction || 0)
        },
        last30Days: {
          transactions: Number(recentStats[0].count),
          amount: Number(recentStats[0].amount || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching card stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch card stats'
    });
  }
});
