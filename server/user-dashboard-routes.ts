import { Router } from 'express';
import { db } from './storage.js';
import { users, transactions, establishments, nfcCards, userMonthlyStats, perks, events } from '../shared/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/dashboard/user-data
 * Obtiene todos los datos del dashboard del usuario autenticado
 */
router.get('/dashboard/user-data', async (req, res) => {
  try {
    // TEMPORARY FIX: React Native doesn't support session cookies
    // Check if request comes from React Native and has userId in query
    const userId = req.session?.userId || req.query.userId as string;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    // 1. Obtener datos del usuario
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('👤 User data loaded:', {
      id: user.id,
      email: user.email,
      balance: user.balance,
      balanceParsed: parseFloat(user.balance || '0'),
      points: user.points,
      level: user.level
    });

    // Check if account is suspended
    if (user.accountSuspended) {
      return res.status(403).json({
        suspended: true,
        suspensionReason: user.suspensionReason,
        suspensionDate: user.suspensionDate,
        message: 'Account suspended'
      });
    }

    // 2. Obtener estadísticas mensuales
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [monthlyStats] = await db.select()
      .from(userMonthlyStats)
      .where(and(
        eq(userMonthlyStats.userId, user.id),
        eq(userMonthlyStats.month, currentMonth)
      ));

    // 3. Obtener transacciones recientes (últimas 10) - USANDO pool.query para acceder a todos los campos
    const { pool } = await import('./storage.js');
    const transactionsResult = await pool.query(`
      SELECT 
        t.id,
        t.amount,
        t.final_amount as "finalAmount",
        t.discount_applied as "discountApplied",
        t.points_earned as "pointsEarned",
        t.created_at as "createdAt",
        t.type,
        t.category,
        t.status,
        t.sender_account as "senderAccount",
        t.recipient_account as "recipientAccount",
        t.note,
        t.user_id as "transactionUserId",
        e.business_name as "establishmentName",
        e.category as "establishmentCategory",
        u.account_number as "userAccountNumber"
      FROM transactions t
      LEFT JOIN establishments e ON t.establishment_id = e.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.user_id = $1 
         OR (t.type = 'p2p_transfer' AND (t.sender_account = $2 OR t.recipient_account = $2))
      ORDER BY t.created_at DESC
      LIMIT 10
    `, [user.id, user.accountNumber]);
    
    // Procesar transacciones para mostrar correctamente los amounts
    const recentTransactions = transactionsResult.rows.map((tx: any) => {
      let displayAmount = parseFloat(tx.amount);
      let establishment = tx.establishmentName || 'Unknown';
      
      // Para transferencias P2P, determinar si el usuario es sender o recipient
      if (tx.type === 'p2p_transfer') {
        const isSender = tx.senderAccount === user.accountNumber || tx.transactionUserId === user.id;
        
        if (isSender) {
          // El usuario ENVIÓ dinero - mostrar como negativo
          displayAmount = -Math.abs(displayAmount);
          establishment = `Transfer to ${tx.recipientAccount || 'Unknown'}`;
        } else {
          // El usuario RECIBIÓ dinero - mostrar como positivo
          displayAmount = Math.abs(displayAmount);
          establishment = `Transfer from ${tx.senderAccount || 'Unknown'}`;
        }
        
        // IMPORTANTE: Si la transacción está REVERSADA, invertir el signo
        if (tx.status === 'reversed') {
          displayAmount = -displayAmount; // Invertir: sender ahora recibe (+), recipient ahora pierde (-)
        }
      } else if (tx.category === 'transfer_out') {
        // Legacy: El usuario ENVIÓ dinero - mostrar como negativo
        displayAmount = -Math.abs(displayAmount);
        establishment = `Transfer to ${tx.recipientAccount || 'Unknown'}`;
      } else if (tx.category === 'transfer_in') {
        // Legacy: El usuario RECIBIÓ dinero - mostrar como positivo
        displayAmount = Math.abs(displayAmount);
        establishment = `Transfer from ${tx.senderAccount || 'Unknown'}`;
      }
      
      return {
        id: tx.id,
        amount: displayAmount.toString(),
        finalAmount: tx.finalAmount,
        discount: tx.discountApplied || '0.00',
        points: tx.pointsEarned || 0,
        date: tx.createdAt,
        establishment,
        category: tx.category || 'other',
        status: tx.status || 'completed', // Incluir status
        type: tx.type,
        senderAccount: tx.senderAccount,
        recipientAccount: tx.recipientAccount,
        note: tx.note,
      };
    });

    // 4. Obtener tarjetas NFC del usuario
    const cards = await db.select({
      id: nfcCards.id,
      cardNumber: nfcCards.cardNumber,
      cardholderName: nfcCards.cardholderName,
      expiryDate: nfcCards.expiryDate,
      cardType: nfcCards.cardType,
      status: nfcCards.status,
      lastUsed: nfcCards.lastUsedAt,
    })
    .from(nfcCards)
    .where(eq(nfcCards.userId, user.id))
    .orderBy(desc(nfcCards.activatedAt))
    .limit(3);

    // 5. Obtener perks activos
    const activePerks = await db.select({
      id: perks.id,
      title: perks.title,
      description: perks.description,
      type: perks.type,
      value: perks.value,
      validUntil: perks.validUntil,
      establishmentName: establishments.businessName,
    })
    .from(perks)
    .leftJoin(establishments, eq(perks.establishmentId, establishments.id))
    .where(and(
      eq(perks.active, true),
      gte(perks.validUntil, new Date())
    ))
    .orderBy(desc(perks.createdAt))
    .limit(5);

    // 6. Obtener eventos próximos
    const upcomingEvents = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      location: events.location,
      capacity: events.capacity,
      currentAttendees: events.currentAttendees,
      ticketPrice: events.ticketPrice,
      establishmentName: establishments.businessName,
    })
    .from(events)
    .leftJoin(establishments, eq(events.establishmentId, establishments.id))
    .where(and(
      eq(events.active, true),
      gte(events.eventDate, new Date())
    ))
    .orderBy(events.eventDate)
    .limit(5);

    // 7. Obtener todos los establishments activos (para Explore)
    const allEstablishments = await db.select({
      id: establishments.id,
      businessName: establishments.businessName,
      category: establishments.category,
      address: establishments.address,
      contactEmail: establishments.email,
      contactPhone: establishments.phone,
      subscriptionStatus: establishments.subscriptionStatus,
      approved: establishments.approved,
    })
    .from(establishments)
    .where(and(
      eq(establishments.approved, true),
      eq(establishments.subscriptionStatus, 'active')
    ))
    .orderBy(establishments.businessName);

    console.log('📊 Establishments query result:', allEstablishments.length);

    // Preparar respuesta
    const dashboardData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        balance: parseFloat(user.balance || '0'), // Convert string to number
        accountNumber: user.accountNumber,
        points: parseInt(user.points || '0', 10), // Convert to number
        level: user.level || 'member',
        totalSpent: parseFloat(user.totalSpent || '0'),
        monthlySpent: parseFloat(user.monthlySpent || '0'),
      },
      monthlyStats: monthlyStats || {
        placesTapped: 0,
        rewardsEarned: 0,
      },
      transactions: recentTransactions.map(t => ({
        id: t.id,
        amount: t.amount, // Ya viene procesado con signo correcto
        finalAmount: t.finalAmount,
        discount: t.discount,
        points: t.points,
        date: t.date,
        establishment: t.establishment, // Ya incluye "Transfer from/to" para P2P
        category: t.category,
        status: t.status, // Estado: completed, suspended, reversed, resolved
        type: t.type, // Tipo: p2p_transfer, debit, credit, etc.
        senderAccount: t.senderAccount,
        recipientAccount: t.recipientAccount,
        note: t.note,
      })),
      cards: cards.map(c => ({
        id: c.id,
        cardNumber: c.cardNumber,
        cardholderName: c.cardholderName,
        expiryDate: c.expiryDate,
        cardType: c.cardType,
        status: c.status,
        lastUsed: c.lastUsed,
      })),
      perks: activePerks.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.type,
        value: p.value,
        validUntil: p.validUntil,
        establishment: p.establishmentName || 'TAPP Network',
      })),
      events: upcomingEvents.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.eventDate,
        location: e.location,
        capacity: e.capacity,
        attendees: e.currentAttendees,
        price: e.ticketPrice,
        establishment: e.establishmentName || 'TAPP Network',
      })),
      establishments: allEstablishments.map(est => ({
        id: est.id,
        name: est.businessName,
        category: est.category,
        address: est.address,
        email: est.contactEmail,
        phone: est.contactPhone,
        status: est.approved && est.subscriptionStatus === 'active' ? 'active' : 'inactive',
      })),
    };

    // ============================================
    // NEW: Balances segmentados por establecimiento
    // ============================================
    const establishmentBalancesResult = await pool.query(`
      SELECT 
        eb.id,
        eb.establishment_id as "establishmentId",
        eb.balance,
        eb.total_earned as "totalEarned",
        eb.total_spent as "totalSpent",
        eb.total_transferred_out as "totalTransferredOut",
        eb.total_transferred_in as "totalTransferredIn",
        eb.last_transaction_at as "lastTransactionAt",
        e.business_name as "establishmentName",
        e.category as "establishmentCategory",
        e.logo as "establishmentLogo"
      FROM establishment_balances eb
      JOIN establishments e ON eb.establishment_id = e.id
      WHERE eb.user_id = $1 AND eb.balance > 0
      ORDER BY eb.balance DESC
    `, [user.id]);

    // Agregar balances segmentados al response
    dashboardData.establishmentBalances = establishmentBalancesResult.rows.map((eb: any) => ({
      id: eb.id,
      establishmentId: eb.establishmentId,
      establishmentName: eb.establishmentName,
      establishmentCategory: eb.establishmentCategory,
      establishmentLogo: eb.establishmentLogo,
      balance: parseFloat(eb.balance).toFixed(2),
      totalEarned: parseFloat(eb.totalEarned).toFixed(2),
      totalSpent: parseFloat(eb.totalSpent).toFixed(2),
      totalTransferredOut: parseFloat(eb.totalTransferredOut).toFixed(2),
      totalTransferredIn: parseFloat(eb.totalTransferredIn).toFixed(2),
      lastTransactionAt: eb.lastTransactionAt,
    }));

    // Calcular balance total de establecimientos (suma de todos los establecimientos)
    const establishmentTotalBalance = establishmentBalancesResult.rows.reduce((sum: number, eb: any) => {
      return sum + parseFloat(eb.balance);
    }, 0);

    // NO sobrescribir el balance - mantener el balance original de la tabla users
    // dashboardData.user.balance ya está seteado arriba con parseFloat(user.balance || '0')
    dashboardData.user.balanceCount = establishmentBalancesResult.rows.length; // Cuántos establecimientos tienen balance
    dashboardData.user.establishmentBalance = establishmentTotalBalance; // Balance en establecimientos

    console.log(`💰 User balance: RD$${dashboardData.user.balance.toFixed(2)} (from users table), Establishment balances: ${establishmentBalancesResult.rows.length} establishments with total RD$${establishmentTotalBalance.toFixed(2)}`);

    // 8. Obtener warnings no leídos del usuario
    const warningsResult = await pool.query(`
      SELECT id, title, message, severity, created_at
      FROM user_warnings
      WHERE user_id = $1 AND read = false
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id]);
    
    // Agregar warning al dashboard data si existe
    if (warningsResult.rows.length > 0) {
      dashboardData.warning = warningsResult.rows[0];
    }

    console.log('✅ Sending response with establishments:', dashboardData.establishments.length);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
});

export default router;
