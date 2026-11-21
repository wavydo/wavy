// ============================================
// NFC ADVANCED FEATURES - BANKING LEVEL
// Límites, alertas, controles geográficos, velocity checks
// ============================================

import { Request, Response } from 'express';
import { db } from './storage.js';
import { 
  nfcCards, 
  nfcTransactions,
  activityLogs,
  users
} from '../shared/schema.js';
import { eq, and, desc, sql, gte, between } from 'drizzle-orm';

// ============================================
// CONFIGURACIÓN DE LÍMITES
// ============================================

interface CardLimits {
  dailyTransactionLimit: number;
  dailyAmountLimit: number;
  singleTransactionLimit: number;
  monthlyAmountLimit: number;
}

const DEFAULT_LIMITS: CardLimits = {
  dailyTransactionLimit: 50,          // 50 transacciones por día
  dailyAmountLimit: 10000,            // $10,000 por día
  singleTransactionLimit: 2000,       // $2,000 por transacción
  monthlyAmountLimit: 50000           // $50,000 por mes
};

// ============================================
// 1. VELOCITY CHECKS (Detección de fraude en tiempo real)
// ============================================

interface VelocityCheck {
  isValid: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  blocked: boolean;
}

export async function performVelocityCheck(
  cardId: number,
  amount: number,
  establishmentId: number
): Promise<VelocityCheck> {
  try {
    const now = new Date();
    
    // Últimas transacciones de la tarjeta (últimos 5 minutos)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const recentTransactions = await db.select()
      .from(nfcTransactions)
      .where(
        and(
          eq(nfcTransactions.cardId, cardId),
          gte(nfcTransactions.timestamp, fiveMinutesAgo)
        )
      );

    // CHECK 1: Múltiples transacciones en corto tiempo
    if (recentTransactions.length >= 5) {
      await logSuspiciousActivity(cardId, 'velocity_exceeded', {
        count: recentTransactions.length,
        timeWindow: '5 minutes'
      });

      return {
        isValid: false,
        reason: 'Too many transactions in short time period',
        riskLevel: 'high',
        blocked: true
      };
    }

    // CHECK 2: Transacciones en diferentes establecimientos muy rápido
    const uniqueEstablishments = new Set(recentTransactions.map(t => t.establishmentId));
    if (uniqueEstablishments.size >= 3 && recentTransactions.length >= 3) {
      await logSuspiciousActivity(cardId, 'multiple_locations', {
        establishments: Array.from(uniqueEstablishments),
        timeWindow: '5 minutes'
      });

      return {
        isValid: false,
        reason: 'Transactions at multiple locations too quickly',
        riskLevel: 'high',
        blocked: true
      };
    }

    // CHECK 3: Montos inusuales
    const avgAmount = recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / (recentTransactions.length || 1);
    if (amount > avgAmount * 5 && amount > 500) {
      await logSuspiciousActivity(cardId, 'unusual_amount', {
        amount,
        averageAmount: avgAmount,
        deviation: amount / avgAmount
      });

      return {
        isValid: true, // No bloqueamos, solo alertamos
        reason: 'Unusual transaction amount',
        riskLevel: 'medium',
        blocked: false
      };
    }

    // CHECK 4: Transacción idéntica en menos de 1 minuto (posible duplicado)
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const duplicates = recentTransactions.filter(t => 
      parseFloat(t.amount) === amount &&
      t.establishmentId === establishmentId &&
      new Date(t.timestamp) > oneMinuteAgo
    );

    if (duplicates.length > 0) {
      await logSuspiciousActivity(cardId, 'duplicate_transaction', {
        amount,
        establishmentId,
        previousTransaction: duplicates[0]
      });

      return {
        isValid: false,
        reason: 'Duplicate transaction detected',
        riskLevel: 'high',
        blocked: true
      };
    }

    // Todo OK
    return {
      isValid: true,
      riskLevel: 'low',
      blocked: false
    };

  } catch (error) {
    console.error('Error in velocity check:', error);
    // En caso de error, permitimos pero con riesgo medio
    return {
      isValid: true,
      riskLevel: 'medium',
      blocked: false
    };
  }
}

// ============================================
// 2. LÍMITES DIARIOS/MENSUALES
// ============================================

export async function checkTransactionLimits(
  cardId: number,
  amount: number,
  customLimits?: Partial<CardLimits>
): Promise<{ allowed: boolean; reason?: string; limits: CardLimits }> {
  
  const limits = { ...DEFAULT_LIMITS, ...customLimits };
  
  // CHECK 1: Límite por transacción individual
  if (amount > limits.singleTransactionLimit) {
    return {
      allowed: false,
      reason: `Transaction exceeds single transaction limit of $${limits.singleTransactionLimit}`,
      limits
    };
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // CHECK 2: Límite de transacciones diarias
  const todayTransactions = await db.select({ count: sql`count(*)` })
    .from(nfcTransactions)
    .where(
      and(
        eq(nfcTransactions.cardId, cardId),
        gte(nfcTransactions.timestamp, startOfDay)
      )
    );

  const todayCount = Number(todayTransactions[0].count);
  if (todayCount >= limits.dailyTransactionLimit) {
    return {
      allowed: false,
      reason: `Daily transaction limit reached (${limits.dailyTransactionLimit})`,
      limits
    };
  }

  // CHECK 3: Límite de monto diario
  const todayAmount = await db.select({ 
    total: sql`sum(cast(${nfcTransactions.amount} as decimal))` 
  })
    .from(nfcTransactions)
    .where(
      and(
        eq(nfcTransactions.cardId, cardId),
        gte(nfcTransactions.timestamp, startOfDay)
      )
    );

  const todayTotal = Number(todayAmount[0].total || 0);
  if (todayTotal + amount > limits.dailyAmountLimit) {
    return {
      allowed: false,
      reason: `Daily amount limit would be exceeded. Current: $${todayTotal}, Limit: $${limits.dailyAmountLimit}`,
      limits
    };
  }

  // CHECK 4: Límite mensual
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyAmount = await db.select({ 
    total: sql`sum(cast(${nfcTransactions.amount} as decimal))` 
  })
    .from(nfcTransactions)
    .where(
      and(
        eq(nfcTransactions.cardId, cardId),
        gte(nfcTransactions.timestamp, startOfMonth)
      )
    );

  const monthlyTotal = Number(monthlyAmount[0].total || 0);
  if (monthlyTotal + amount > limits.monthlyAmountLimit) {
    return {
      allowed: false,
      reason: `Monthly amount limit would be exceeded. Current: $${monthlyTotal}, Limit: $${limits.monthlyAmountLimit}`,
      limits
    };
  }

  // Todo OK
  return {
    allowed: true,
    limits
  };
}

// ============================================
// 3. RESTRICCIONES GEOGRÁFICAS
// ============================================

interface GeoRestriction {
  allowedCountries?: string[];
  blockedCountries?: string[];
  allowedCities?: string[];
  maxDistanceKm?: number; // Distancia máxima desde última transacción
}

export async function checkGeoRestrictions(
  cardId: number,
  location: { country?: string; city?: string; lat?: number; lon?: number },
  restrictions?: GeoRestriction
): Promise<{ allowed: boolean; reason?: string }> {
  
  if (!restrictions) return { allowed: true };

  // CHECK 1: País bloqueado
  if (restrictions.blockedCountries && location.country) {
    if (restrictions.blockedCountries.includes(location.country)) {
      await logSuspiciousActivity(cardId, 'blocked_country', {
        country: location.country
      });

      return {
        allowed: false,
        reason: `Transactions not allowed in ${location.country}`
      };
    }
  }

  // CHECK 2: País permitido (whitelist)
  if (restrictions.allowedCountries && location.country) {
    if (!restrictions.allowedCountries.includes(location.country)) {
      await logSuspiciousActivity(cardId, 'unauthorized_country', {
        country: location.country,
        allowedCountries: restrictions.allowedCountries
      });

      return {
        allowed: false,
        reason: `Card only works in: ${restrictions.allowedCountries.join(', ')}`
      };
    }
  }

  // CHECK 3: Distancia desde última transacción (detección de fraude geográfico)
  if (restrictions.maxDistanceKm && location.lat && location.lon) {
    const lastTransaction = await db.select()
      .from(nfcTransactions)
      .where(eq(nfcTransactions.cardId, cardId))
      .orderBy(desc(nfcTransactions.timestamp))
      .limit(1);

    if (lastTransaction.length > 0) {
      const lastLocation = lastTransaction[0].metadata as any;
      if (lastLocation?.lat && lastLocation?.lon) {
        const distance = calculateDistance(
          location.lat,
          location.lon,
          lastLocation.lat,
          lastLocation.lon
        );

        // Calcular tiempo transcurrido
        const timeDiff = Date.now() - new Date(lastTransaction[0].timestamp).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Si la distancia es > restricción Y fue en menos de 1 hora = sospechoso
        if (distance > restrictions.maxDistanceKm && hoursDiff < 1) {
          await logSuspiciousActivity(cardId, 'impossible_travel', {
            distance,
            timeDiff: hoursDiff,
            lastLocation: lastLocation,
            currentLocation: location
          });

          return {
            allowed: false,
            reason: `Impossible travel detected: ${distance.toFixed(0)}km in ${hoursDiff.toFixed(1)} hours`
          };
        }
      }
    }
  }

  return { allowed: true };
}

// Haversine formula para calcular distancia entre coordenadas
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================
// 4. RESTRICCIONES DE HORARIO
// ============================================

interface TimeRestriction {
  allowedHours?: { start: number; end: number }; // 0-23
  blockedDays?: number[]; // 0=Sunday, 6=Saturday
  timezone?: string;
}

export function checkTimeRestrictions(
  restrictions?: TimeRestriction
): { allowed: boolean; reason?: string } {
  
  if (!restrictions) return { allowed: true };

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // CHECK 1: Horario permitido
  if (restrictions.allowedHours) {
    const { start, end } = restrictions.allowedHours;
    if (hour < start || hour >= end) {
      return {
        allowed: false,
        reason: `Card only works between ${start}:00 and ${end}:00`
      };
    }
  }

  // CHECK 2: Días bloqueados
  if (restrictions.blockedDays && restrictions.blockedDays.includes(day)) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      allowed: false,
      reason: `Card blocked on ${dayNames[day]}`
    };
  }

  return { allowed: true };
}

// ============================================
// 5. ALERTAS EN TIEMPO REAL
// ============================================

interface Alert {
  id: string;
  type: 'velocity' | 'limit' | 'geo' | 'fraud' | 'unusual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  cardId: number;
  timestamp: Date;
  data?: any;
}

const activeAlerts: Alert[] = [];

export function createAlert(
  type: Alert['type'],
  severity: Alert['severity'],
  message: string,
  cardId: number,
  data?: any
): Alert {
  const alert: Alert = {
    id: crypto.randomUUID(),
    type,
    severity,
    message,
    cardId,
    timestamp: new Date(),
    data
  };

  activeAlerts.push(alert);

  // Log críticos
  if (severity === 'critical' || severity === 'high') {
    console.error('🚨 CRITICAL ALERT:', alert);
    // TODO: Enviar notificación push, email, SMS
  }

  // Mantener solo últimas 1000 alertas
  if (activeAlerts.length > 1000) {
    activeAlerts.shift();
  }

  return alert;
}

export function getActiveAlerts(cardId?: number): Alert[] {
  if (cardId) {
    return activeAlerts.filter(a => a.cardId === cardId);
  }
  return activeAlerts.slice(-100); // Últimas 100
}

// ============================================
// 6. LOGGING DE ACTIVIDAD SOSPECHOSA
// ============================================

async function logSuspiciousActivity(
  cardId: number,
  activityType: string,
  details: any
) {
  try {
    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, cardId)
    });

    if (!card) return;

    await db.insert(activityLogs).values({
      userId: card.userId,
      establishmentId: null,
      action: `suspicious_${activityType}`,
      details: JSON.stringify(details),
      ipAddress: 'system',
      userAgent: 'fraud_detection_system',
      timestamp: new Date()
    });

    // Crear alerta
    createAlert(
      'fraud',
      'high',
      `Suspicious activity detected: ${activityType}`,
      cardId,
      details
    );

    console.warn(`⚠️ Suspicious activity on card ${cardId}: ${activityType}`);

  } catch (error) {
    console.error('Error logging suspicious activity:', error);
  }
}

// ============================================
// 7. AUTO-BLOCK EN PATRONES SOSPECHOSOS
// ============================================

export async function evaluateAutoBlock(cardId: number): Promise<boolean> {
  try {
    // Obtener actividad sospechosa reciente (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const suspiciousLogs = await db.select()
      .from(activityLogs)
      .where(
        and(
          sql`${activityLogs.action} LIKE 'suspicious_%'`,
          gte(activityLogs.timestamp, oneDayAgo)
        )
      );

    const cardLogs = suspiciousLogs.filter(log => {
      const details = JSON.parse(log.details);
      return details.cardId === cardId;
    });

    // Si hay más de 3 actividades sospechosas en 24h = AUTO-BLOCK
    if (cardLogs.length >= 3) {
      await db.update(nfcCards)
        .set({ status: 'suspended' })
        .where(eq(nfcCards.id, cardId));

      await db.insert(activityLogs).values({
        userId: cardLogs[0].userId,
        establishmentId: null,
        action: 'card_auto_blocked',
        details: JSON.stringify({
          reason: 'Multiple suspicious activities detected',
          count: cardLogs.length,
          activities: cardLogs.map(l => JSON.parse(l.details))
        }),
        ipAddress: 'system',
        userAgent: 'auto_block_system',
        timestamp: new Date()
      });

      createAlert(
        'fraud',
        'critical',
        `Card ${cardId} automatically blocked due to suspicious activity`,
        cardId,
        { suspiciousCount: cardLogs.length }
      );

      console.error(`🚨 Card ${cardId} AUTO-BLOCKED due to ${cardLogs.length} suspicious activities`);

      return true;
    }

    return false;

  } catch (error) {
    console.error('Error in auto-block evaluation:', error);
    return false;
  }
}

// ============================================
// 8. ENDPOINT: Configurar límites de tarjeta
// ============================================

export async function setCardLimits(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const limits: Partial<CardLimits> = req.body;

    // Validar límites
    if (limits.dailyTransactionLimit && limits.dailyTransactionLimit > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Daily transaction limit cannot exceed 1000'
      });
    }

    if (limits.singleTransactionLimit && limits.singleTransactionLimit > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Single transaction limit cannot exceed $50,000'
      });
    }

    // Guardar límites en metadata de la tarjeta
    const card = await db.query.nfcCards.findFirst({
      where: eq(nfcCards.id, parseInt(cardId))
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    const currentMetadata = (card.metadata as any) || {};
    const updatedMetadata = {
      ...currentMetadata,
      limits: { ...DEFAULT_LIMITS, ...limits }
    };

    await db.update(nfcCards)
      .set({ metadata: updatedMetadata })
      .where(eq(nfcCards.id, parseInt(cardId)));

    return res.json({
      success: true,
      message: 'Card limits updated successfully',
      data: { cardId, limits: updatedMetadata.limits }
    });

  } catch (error) {
    console.error('Error setting card limits:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to set card limits'
    });
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  performVelocityCheck,
  checkTransactionLimits,
  checkGeoRestrictions,
  checkTimeRestrictions,
  createAlert,
  getActiveAlerts,
  evaluateAutoBlock,
  setCardLimits,
  DEFAULT_LIMITS
};
