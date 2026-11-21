import express, { Request, Response } from 'express';
import { db } from './storage.js';
import { 
  perks, events, drops, campaigns, merchantAnalytics,
  establishments, transactions, users, reviews,
  insertPerkSchema, insertEventSchema, insertDropSchema
} from '../shared/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { requireEstablishment } from './auth.js';

const router = express.Router();

// ============================================
// MERCHANT DASHBOARD
// ============================================

// Get merchant dashboard overview
router.get('/merchant/dashboard', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    // Get establishment details
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, establishmentId));
    
    // Get transactions for this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.establishmentId, establishmentId),
          gte(transactions.createdAt, startOfMonth)
        )
      );
    
    // Calculate stats
    const totalRevenue = monthTransactions.reduce(
      (sum, t) => sum + parseFloat(t.finalAmount),
      0
    );
    
    const uniqueCustomers = new Set(monthTransactions.map(t => t.userId)).size;
    
    // Get active perks count
    const now = new Date();
    const activePerks = await db
      .select()
      .from(perks)
      .where(
        and(
          eq(perks.establishmentId, establishmentId),
          eq(perks.active, true),
          lte(perks.validFrom, now),
          gte(perks.validUntil, now)
        )
      );
    
    // Get upcoming events count
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.establishmentId, establishmentId),
          gte(events.date, now),
          eq(events.status, 'upcoming')
        )
      );
    
    // Get recent transactions with customer info
    const recentTransactions = await db
      .select({
        transaction: transactions,
        user: users,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.establishmentId, establishmentId))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
    
    res.json({
      establishment: { ...establishment, password: undefined },
      stats: {
        monthlyRevenue: totalRevenue.toFixed(2),
        monthlyTransactions: monthTransactions.length,
        monthlyCustomers: uniqueCustomers,
        totalCustomers: establishment.totalCustomers,
        totalRevenue: establishment.totalRevenue,
        activePerks: activePerks.length,
        upcomingEvents: upcomingEvents.length,
      },
      recentTransactions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT PERKS MANAGEMENT
// ============================================

// Get all merchant perks
router.get('/merchant/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    const merchantPerks = await db
      .select()
      .from(perks)
      .where(eq(perks.establishmentId, establishmentId))
      .orderBy(desc(perks.createdAt));
    
    res.json({ perks: merchantPerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new perk
router.post('/merchant/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const perkData = {
      ...req.body,
      establishmentId,
    };
    
    const validatedData = insertPerkSchema.parse(perkData);
    
    const [newPerk] = await db
      .insert(perks)
      .values(validatedData)
      .returning();
    
    res.json({ perk: newPerk, message: 'Perk created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update perk
router.put('/merchant/perks/:perkId', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { perkId } = req.params;
    const establishmentId = req.session.userId!;
    const { title, description, type, value, validFrom, validUntil, maxRedemptions, active } = req.body;
    
    // Verify ownership
    const [perk] = await db
      .select()
      .from(perks)
      .where(eq(perks.id, perkId));
    
    if (!perk || perk.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [updated] = await db
      .update(perks)
      .set({
        title,
        description,
        type,
        value,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        maxRedemptions,
        active,
        updatedAt: new Date(),
      })
      .where(eq(perks.id, perkId))
      .returning();
    
    res.json({ perk: updated, message: 'Perk updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete perk
router.delete('/merchant/perks/:perkId', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { perkId } = req.params;
    const establishmentId = req.session.userId!;
    
    // Verify ownership
    const [perk] = await db
      .select()
      .from(perks)
      .where(eq(perks.id, perkId));
    
    if (!perk || perk.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.delete(perks).where(eq(perks.id, perkId));
    
    res.json({ message: 'Perk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT EVENTS MANAGEMENT
// ============================================

// Get all merchant events
router.get('/merchant/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    const merchantEvents = await db
      .select()
      .from(events)
      .where(eq(events.establishmentId, establishmentId))
      .orderBy(desc(events.date));
    
    res.json({ events: merchantEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/merchant/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const eventData = {
      ...req.body,
      establishmentId,
    };
    
    const validatedData = insertEventSchema.parse(eventData);
    
    const [newEvent] = await db
      .insert(events)
      .values(validatedData)
      .returning();
    
    res.json({ event: newEvent, message: 'Event created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.put('/merchant/events/:eventId', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const establishmentId = req.session.userId!;
    
    // Verify ownership
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!event || event.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [updated] = await db
      .update(events)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();
    
    res.json({ event: updated, message: 'Event updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT DROPS MANAGEMENT
// ============================================

// Get all merchant drops
router.get('/merchant/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    const merchantDrops = await db
      .select()
      .from(drops)
      .where(eq(drops.establishmentId, establishmentId))
      .orderBy(desc(drops.createdAt));
    
    res.json({ drops: merchantDrops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new drop
router.post('/merchant/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const dropData = {
      ...req.body,
      establishmentId,
    };
    
    const validatedData = insertDropSchema.parse(dropData);
    
    const [newDrop] = await db
      .insert(drops)
      .values(validatedData)
      .returning();
    
    res.json({ drop: newDrop, message: 'Drop created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update drop
router.put('/merchant/drops/:dropId', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { dropId } = req.params;
    const establishmentId = req.session.userId!;
    
    // Verify ownership
    const [drop] = await db
      .select()
      .from(drops)
      .where(eq(drops.id, dropId));
    
    if (!drop || drop.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [updated] = await db
      .update(drops)
      .set(req.body)
      .where(eq(drops.id, dropId))
      .returning();
    
    res.json({ drop: updated, message: 'Drop updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT ANALYTICS
// ============================================

// Get detailed analytics
router.get('/merchant/analytics', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const { period = '30' } = req.query; // days
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));
    
    // Get transactions in period
    const periodTransactions = await db
      .select({
        transaction: transactions,
        user: users,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(
        and(
          eq(transactions.establishmentId, establishmentId),
          gte(transactions.createdAt, daysAgo)
        )
      )
      .orderBy(desc(transactions.createdAt));
    
    // Calculate metrics
    const totalRevenue = periodTransactions.reduce(
      (sum, t) => sum + parseFloat(t.transaction.finalAmount),
      0
    );
    
    const totalDiscounts = periodTransactions.reduce(
      (sum, t) => sum + parseFloat(t.transaction.discountApplied),
      0
    );
    
    const avgTransactionValue = totalRevenue / (periodTransactions.length || 1);
    
    // Customer frequency
    const customerVisits = periodTransactions.reduce((acc, t) => {
      const userId = t.transaction.userId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const returningCustomers = Object.values(customerVisits).filter(count => count > 1).length;
    const newCustomers = Object.values(customerVisits).filter(count => count === 1).length;
    
    // Top customers
    const topCustomers = Object.entries(customerVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, visits]) => ({
        userId,
        visits,
        customer: periodTransactions.find(t => t.transaction.userId === userId)?.user,
      }));
    
    res.json({
      period: `${period} days`,
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalDiscounts: totalDiscounts.toFixed(2),
        totalTransactions: periodTransactions.length,
        avgTransactionValue: avgTransactionValue.toFixed(2),
        newCustomers,
        returningCustomers,
        retentionRate: ((returningCustomers / (returningCustomers + newCustomers || 1)) * 100).toFixed(1),
      },
      topCustomers,
      recentTransactions: periodTransactions.slice(0, 20),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer list
router.get('/merchant/customers', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    // Get all unique customers who have transacted
    const customerTransactions = await db
      .select({
        user: users,
        transaction: transactions,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.establishmentId, establishmentId))
      .orderBy(desc(transactions.createdAt));
    
    // Group by customer
    const customersMap = new Map();
    
    customerTransactions.forEach(({ user, transaction }) => {
      if (!user) return;
      
      if (!customersMap.has(user.id)) {
        customersMap.set(user.id, {
          customer: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            level: user.level,
          },
          visits: 0,
          totalSpent: 0,
          lastVisit: transaction.createdAt,
          firstVisit: transaction.createdAt,
        });
      }
      
      const customerData = customersMap.get(user.id);
      customerData.visits += 1;
      customerData.totalSpent += parseFloat(transaction.finalAmount);
      
      if (transaction.createdAt < customerData.firstVisit) {
        customerData.firstVisit = transaction.createdAt;
      }
      if (transaction.createdAt > customerData.lastVisit) {
        customerData.lastVisit = transaction.createdAt;
      }
    });
    
    const customers = Array.from(customersMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
    
    res.json({ customers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT REVIEWS
// ============================================

// Get merchant reviews
router.get('/merchant/reviews', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    const merchantReviews = await db
      .select({
        review: reviews,
        user: {
          id: users.id,
          fullName: users.fullName,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.establishmentId, establishmentId))
      .orderBy(desc(reviews.createdAt));
    
    // Calculate average rating
    const avgRating = merchantReviews.length > 0
      ? merchantReviews.reduce((sum, r) => sum + r.review.rating, 0) / merchantReviews.length
      : 0;
    
    res.json({
      reviews: merchantReviews,
      stats: {
        totalReviews: merchantReviews.length,
        avgRating: avgRating.toFixed(1),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to review
router.post('/merchant/reviews/:reviewId/respond', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const establishmentId = req.session.userId!;
    const { response } = req.body;
    
    // Verify ownership
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId));
    
    if (!review || review.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [updated] = await db
      .update(reviews)
      .set({
        response,
        responseAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();
    
    res.json({ review: updated, message: 'Response added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MERCHANT PROFILE
// ============================================

// Update merchant profile
router.put('/merchant/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const {
      businessName,
      description,
      phone,
      address,
      city,
      category,
      logo,
      discountPercentage,
    } = req.body;
    
    const [updated] = await db
      .update(establishments)
      .set({
        businessName,
        description,
        phone,
        address,
        city,
        category,
        logo,
        discountPercentage,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, establishmentId))
      .returning();
    
    res.json({
      establishment: { ...updated, password: undefined },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
