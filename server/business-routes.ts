import express, { Request, Response } from 'express';
import { db } from './storage.js';
import { 
  perks, insertPerkSchema,
  events, insertEventSchema,
  drops, insertDropSchema,
  perkRedemptions,
  eventTickets,
  dropClaims,
  establishments,
  users,
  transactions
} from '../shared/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { requireEstablishment } from './auth.js';

const router = express.Router();

// ============================================
// PERKS ENDPOINTS
// ============================================

// Get all perks for establishment
router.get('/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentPerks = await db
      .select()
      .from(perks)
      .where(eq(perks.establishmentId, req.session.userId!))
      .orderBy(desc(perks.createdAt));
    
    res.json({ perks: establishmentPerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new perk
router.post('/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const data = insertPerkSchema.parse({
      ...req.body,
      establishmentId: req.session.userId!
    });
    
    // Transform date strings to Date objects if needed
    // Also ensure numeric fields are properly typed
    const perkData: any = {
      establishmentId: data.establishmentId,
      type: data.type,
      title: data.title,
      description: data.description,
      value: String(data.value), // Convert to string for decimal type
      image: data.image,
      validFrom: typeof data.validFrom === 'string' ? new Date(data.validFrom) : data.validFrom,
      validUntil: typeof data.validUntil === 'string' ? new Date(data.validUntil) : data.validUntil,
      maxRedemptions: data.maxRedemptions
    };
    
    const [newPerk] = await db.insert(perks).values(perkData).returning();
    
    res.json({ perk: newPerk });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update perk
router.put('/perks/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, value, validFrom, validUntil, maxRedemptions, active } = req.body;
    
    const [updated] = await db
      .update(perks)
      .set({
        title,
        description,
        value,
        validFrom,
        validUntil,
        maxRedemptions,
        active,
        updatedAt: new Date()
      })
      .where(and(
        eq(perks.id, id),
        eq(perks.establishmentId, req.session.userId!)
      ))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Perk not found' });
    }
    
    res.json({ perk: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete perk
router.delete('/perks/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db
      .delete(perks)
      .where(and(
        eq(perks.id, id),
        eq(perks.establishmentId, req.session.userId!)
      ));
    
    res.json({ message: 'Perk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get perk stats
router.get('/perks/:id/stats', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const redemptions = await db
      .select()
      .from(perkRedemptions)
      .where(eq(perkRedemptions.perkId, id));
    
    const used = redemptions.filter(r => r.status === 'used').length;
    const active = redemptions.filter(r => r.status === 'active').length;
    
    res.json({
      totalRedemptions: redemptions.length,
      used,
      active,
      conversionRate: redemptions.length > 0 ? (used / redemptions.length * 100).toFixed(1) : 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EVENTS ENDPOINTS
// ============================================

// Get all events for establishment
router.get('/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentEvents = await db
      .select()
      .from(events)
      .where(eq(events.establishmentId, req.session.userId!))
      .orderBy(desc(events.eventDate));
    
    res.json({ events: establishmentEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    console.log('Received event data:', req.body);
    
    const data = insertEventSchema.parse({
      ...req.body,
      establishmentId: req.session.userId!
    });
    
    console.log('Parsed event data:', data);
    
    // Transform date string to Date object if needed
    // Also ensure numeric fields are properly typed
    const eventData: any = {
      establishmentId: data.establishmentId,
      title: data.title,
      description: data.description,
      eventDate: typeof data.eventDate === 'string' ? new Date(data.eventDate) : data.eventDate,
      location: data.location,
      capacity: data.capacity,
      image: data.image
    };
    
    // Only add ticketPrice if it exists and convert to string for decimal type
    if (data.ticketPrice !== undefined && data.ticketPrice !== null) {
      eventData.ticketPrice = String(data.ticketPrice);
    }
    
    console.log('Event data to insert:', eventData);
    
    const [newEvent] = await db.insert(events).values(eventData).returning();
    
    res.json({ event: newEvent });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.put('/events/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updated] = await db
      .update(events)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(events.id, id),
        eq(events.establishmentId, req.session.userId!)
      ))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/events/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db
      .delete(events)
      .where(and(
        eq(events.id, id),
        eq(events.establishmentId, req.session.userId!)
      ));
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get event attendees
router.get('/events/:id/attendees', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const tickets = await db
      .select({
        ticket: eventTickets,
        user: users
      })
      .from(eventTickets)
      .leftJoin(users, eq(eventTickets.userId, users.id))
      .where(eq(eventTickets.eventId, id));
    
    res.json({ attendees: tickets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DROPS ENDPOINTS
// ============================================

// Get all drops for establishment
router.get('/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentDrops = await db
      .select()
      .from(drops)
      .where(eq(drops.establishmentId, req.session.userId!))
      .orderBy(desc(drops.createdAt));
    
    res.json({ drops: establishmentDrops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new drop
router.post('/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    console.log('Received drop data:', req.body);
    
    const data = insertDropSchema.parse({
      ...req.body,
      establishmentId: req.session.userId!
    });
    
    console.log('Parsed drop data:', data);
    
    // Transform date string to Date object if needed
    const dropData: any = {
      establishmentId: data.establishmentId,
      title: data.title,
      description: data.description,
      reward: data.reward,
      triggerType: data.triggerType,
      triggerValue: data.triggerValue,
      maxClaims: data.maxClaims
    };
    
    // Only add expiresAt if it exists and convert to Date object
    if (data.expiresAt) {
      dropData.expiresAt = typeof data.expiresAt === 'string' ? new Date(data.expiresAt) : data.expiresAt;
    }
    
    console.log('Drop data to insert:', dropData);
    
    const [newDrop] = await db.insert(drops).values(dropData).returning();
    
    res.json({ drop: newDrop });
  } catch (error: any) {
    console.error('Error creating drop:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update drop
router.put('/drops/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updated] = await db
      .update(drops)
      .set(updateData)
      .where(and(
        eq(drops.id, id),
        eq(drops.establishmentId, req.session.userId!)
      ))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Drop not found' });
    }
    
    res.json({ drop: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete drop
router.delete('/drops/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db
      .delete(drops)
      .where(and(
        eq(drops.id, id),
        eq(drops.establishmentId, req.session.userId!)
      ));
    
    res.json({ message: 'Drop deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get drop claims/stats
router.get('/drops/:id/claims', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const claims = await db
      .select({
        claim: dropClaims,
        user: users
      })
      .from(dropClaims)
      .leftJoin(users, eq(dropClaims.userId, users.id))
      .where(eq(dropClaims.dropId, id));
    
    res.json({ claims });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROFILE ENDPOINT
// ============================================

// Get business profile
router.get('/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, req.session.userId!));
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Remove sensitive data
    const { password, ...profileData } = establishment;
    
    res.json({ profile: profileData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update business profile
router.put('/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      description,
      category,
      phone,
      address,
      logo,
      website,
      hours
    } = req.body;
    
    const [updated] = await db
      .update(establishments)
      .set({
        businessName,
        description,
        category,
        phone,
        address,
        logo,
        website,
        hours,
        updatedAt: new Date()
      })
      .where(eq(establishments.id, req.session.userId!))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Remove sensitive data
    const { password, ...profileData } = updated;
    
    res.json({ profile: profileData });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// SETTINGS ENDPOINT
// ============================================

// Get business settings
router.get('/settings', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, req.session.userId!));
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Remove sensitive data
    const { password, ...settingsData } = establishment;
    
    res.json({ establishment: settingsData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update business settings
router.put('/settings', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      ownerName,
      category,
      phone,
      email,
      address,
      city,
      logo,
      discountPercentage
    } = req.body;
    
    const [updated] = await db
      .update(establishments)
      .set({
        businessName,
        ownerName,
        category,
        phone,
        email,
        address,
        city,
        logo,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        updatedAt: new Date()
      })
      .where(eq(establishments.id, req.session.userId!))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Remove sensitive data
    const { password, ...settingsData } = updated;
    
    res.json({ establishment: settingsData });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// ANALYTICS ENDPOINT
// ============================================

// Get business analytics
router.get('/analytics', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    const now = new Date();
    
    // Get last 6 months of revenue data
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTxns = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.establishmentId, establishmentId),
          gte(transactions.createdAt, monthStart),
          lte(transactions.createdAt, monthEnd)
        ));
      
      const monthRevenue = monthTxns.reduce(
        (sum, t) => sum + parseFloat(t.finalAmount.toString()), 0
      );
      
      revenueData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        revenue: Math.round(monthRevenue)
      });
    }
    
    // Get top 5 perks by redemptions
    const allRedemptions = await db
      .select({
        perkId: perkRedemptions.perkId,
        perk: perks
      })
      .from(perkRedemptions)
      .leftJoin(perks, eq(perkRedemptions.perkId, perks.id))
      .where(eq(perks.establishmentId, establishmentId));
    
    const perkRedemptionCount = new Map();
    for (const { perkId, perk } of allRedemptions) {
      if (!perk) continue;
      if (!perkRedemptionCount.has(perkId)) {
        perkRedemptionCount.set(perkId, { perk, count: 0 });
      }
      perkRedemptionCount.get(perkId).count++;
    }
    
    const topPerks = Array.from(perkRedemptionCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ perk, count }) => ({
        id: perk.id,
        title: perk.title,
        redemptions: count
      }));
    
    // Get customer acquisition over last 6 months
    const acquisitionData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTxns = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.establishmentId, establishmentId),
          gte(transactions.createdAt, monthStart),
          lte(transactions.createdAt, monthEnd)
        ));
      
      const uniqueCustomers = new Set(monthTxns.map(t => t.userId)).size;
      
      acquisitionData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        customers: uniqueCustomers
      });
    }
    
    res.json({
      revenueData,
      topPerks,
      acquisitionData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STATS ENDPOINT
// ============================================

// Get business overview stats
router.get('/stats', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Monthly transactions
    const monthlyTxns = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.establishmentId, establishmentId),
        gte(transactions.createdAt, startOfMonth),
        lte(transactions.createdAt, endOfMonth)
      ));
    
    const monthlyRevenue = monthlyTxns.reduce(
      (sum, t) => sum + parseFloat(t.finalAmount.toString()), 0
    );
    
    const monthlyTransactions = monthlyTxns.length;
    
    // Unique customers this month
    const uniqueCustomerIds = new Set(monthlyTxns.map(t => t.userId));
    const monthlyCustomers = uniqueCustomerIds.size;
    
    // Total unique customers all time
    const allTxns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.establishmentId, establishmentId));
    
    const allUniqueCustomerIds = new Set(allTxns.map(t => t.userId));
    const totalCustomers = allUniqueCustomerIds.size;
    
    // Active perks count
    const activePerksCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(perks)
      .where(and(
        eq(perks.establishmentId, establishmentId),
        eq(perks.active, true)
      ));
    
    // Upcoming events count
    const upcomingEventsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(
        eq(events.establishmentId, establishmentId),
        gte(events.eventDate, now)
      ));
    
    res.json({
      monthlyRevenue: monthlyRevenue.toFixed(2),
      monthlyTransactions,
      monthlyCustomers,
      totalCustomers,
      activePerks: Number(activePerksCount[0]?.count || 0),
      upcomingEvents: Number(upcomingEventsCount[0]?.count || 0)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CUSTOMERS ENDPOINT
// ============================================

// Get top customers and event attendees
router.get('/customers', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentId = req.session.userId!;
    
    // Get top 10 customers by total spent
    const customerTransactions = await db
      .select({
        userId: transactions.userId,
        userName: users.fullName,
        userEmail: users.email,
        userPhone: users.phone,
        transactionCount: sql<number>`count(*)`,
        totalSpent: sql<number>`sum(${transactions.finalAmount})`,
        lastVisit: sql<Date>`max(${transactions.createdAt})`
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.establishmentId, establishmentId))
      .groupBy(transactions.userId, users.fullName, users.email, users.phone)
      .orderBy(desc(sql`sum(${transactions.finalAmount})`))
      .limit(50);
    
    // Format customers data
    const customers = customerTransactions.map(c => ({
      id: c.userId,
      fullName: c.userName || 'Cliente Anónimo',
      email: c.userEmail || 'N/A',
      phone: c.userPhone || 'N/A',
      visits: Number(c.transactionCount),
      totalSpent: Number(c.totalSpent),
      lastVisit: c.lastVisit || new Date()
    }));
    
    // Get event attendees
    const eventAttendees = await db
      .select({
        eventId: eventTickets.eventId,
        eventTitle: events.title,
        eventDate: events.eventDate,
        attendeeCount: sql<number>`count(*)`
      })
      .from(eventTickets)
      .leftJoin(events, eq(eventTickets.eventId, events.id))
      .where(eq(events.establishmentId, establishmentId))
      .groupBy(eventTickets.eventId, events.title, events.eventDate)
      .orderBy(desc(events.eventDate));
    
    res.json({
      customers,
      eventAttendees
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer details (old endpoint - keeping for backwards compatibility)
router.get('/customers/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customerTransactions = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, id),
        eq(transactions.establishmentId, req.session.userId!)
      ))
      .orderBy(desc(transactions.createdAt));
    
    const totalSpent = customerTransactions.reduce(
      (sum, t) => sum + parseFloat(t.finalAmount.toString()), 0
    );
    
    res.json({
      customer: { ...user, password: undefined },
      transactions: customerTransactions,
      stats: {
        visits: customerTransactions.length,
        totalSpent: totalSpent.toFixed(2),
        avgSpent: (totalSpent / customerTransactions.length).toFixed(2)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
