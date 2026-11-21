import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { nfcCards, cardReports, cardConfigHistory, users } from '../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requireAuth } from './auth.js';

const router = Router();

// Middleware personalizado que soporta session Y query userId
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const userId = req.session?.userId || req.query.userId as string;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  // Guardar en req para uso posterior
  (req as any).authenticatedUserId = userId;
  next();
};

// Aplicar middleware a todas las rutas
router.use(authMiddleware);

/**
 * Create NFC Card
 * POST /api/cards
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).authenticatedUserId;
    
    const { cardType = 'physical', dailyLimit = 5000, monthlyLimit = 50000 } = req.body;

    // Verificar que el usuario existe
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generar número de tarjeta único (16 dígitos)
    const generateCardNumber = () => {
      const timestamp = Date.now().toString().slice(-10);
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return timestamp + random;
    };

    // Generar token único (para NFC/QR)
    const generateToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    };

    // Generar UID simulado para tarjeta virtual
    const generateUID = () => {
      const hex = '0123456789ABCDEF';
      let uid = '';
      for (let i = 0; i < 14; i++) { // 7 bytes = 14 hex chars
        uid += hex.charAt(Math.floor(Math.random() * 16));
      }
      return uid;
    };

    // Generar hash del UID
    const cardUID = generateUID();
    const cardUIDHash = await bcrypt.hash(cardUID, 10);

    // Generar IV para encriptación (16 bytes hex)
    const generateIV = () => {
      const hex = '0123456789abcdef';
      let iv = '';
      for (let i = 0; i < 32; i++) { // 16 bytes = 32 hex chars
        iv += hex.charAt(Math.floor(Math.random() * 16));
      }
      return iv;
    };

    const encryptionIV = generateIV();
    const cardToken = generateToken();

    // Por ahora, "encriptar" el UID simplemente hasheándolo (en producción usar AES-256)
    const cardUIDEncrypted = await bcrypt.hash(cardUID + encryptionIV, 10);

    // Generar CVV (3 dígitos)
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    // Generar fecha de expiración (5 años desde ahora)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const expiryMonth = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
    const expiryYear = expiryDate.getFullYear().toString().slice(-2);
    const expiryString = `${expiryMonth}/${expiryYear}`;

    // Crear la tarjeta
    const [newCard] = await db.insert(nfcCards).values({
      userId: user.id,
      cardNumber: generateCardNumber(),
      cardholderName: user.fullName,
      expiryDate: expiryString,
      cvv: await bcrypt.hash(cvv, 10), // Encriptar CVV
      token: cardToken, // Token único para NFC (legacy)
      cardToken: cardToken, // Token único para transacciones
      cardUIDHash: cardUIDHash, // Hash del UID
      cardUIDEncrypted: cardUIDEncrypted, // UID encriptado
      encryptionIV: encryptionIV, // IV para descifrado
      userEmail: user.email, // Email del usuario
      cardType,
      status: 'active',
      dailyLimit: dailyLimit.toString(),
      monthlyLimit: monthlyLimit.toString(),
      activatedAt: new Date(),
    }).returning();

    console.log('✅ Card created successfully:', newCard.id);

    res.json({
      success: true,
      message: 'Card created successfully',
      card: {
        id: newCard.id,
        cardNumber: newCard.cardNumber,
        cardholderName: newCard.cardholderName,
        expiryDate: newCard.expiryDate,
        cardType: newCard.cardType,
        status: newCard.status,
      }
    });

  } catch (error) {
    console.error('❌ Error creating card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create card'
    });
  }
});

/**
 * Lock/Unlock Card
 * PUT /api/cards/:cardId/lock
 */
router.put('/:cardId/lock', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { locked } = req.body;
    const userId = (req as any).authenticatedUserId;

    // Verificar que la tarjeta pertenece al usuario
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
    const userId = (req as any).authenticatedUserId;

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4 digits'
      });
    }

    // Verificar que la tarjeta pertenece al usuario
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
    const userId = (req as any).authenticatedUserId;

    // Verificar que la tarjeta pertenece al usuario
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
    const userId = (req as any).authenticatedUserId;

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

    const updates: any = {};
    if (dailyLimit !== undefined) updates.dailyLimit = dailyLimit.toString();
    if (monthlyLimit !== undefined) updates.monthlyLimit = monthlyLimit.toString();

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
 * Get Card Details with All Settings
 * GET /api/cards/:cardId
 */
router.get('/:cardId', async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = (req as any).authenticatedUserId;

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
        dailyLimit: parseInt(card.dailyLimit || '500'),
        monthlyLimit: parseInt(card.monthlyLimit || '5000'),
        currentDailySpend: parseFloat(card.currentDailySpend || '0'),
        currentMonthlySpend: parseFloat(card.currentMonthlySpend || '0'),
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