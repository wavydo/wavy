import express, { Request, Response } from 'express';
import { db } from './storage.js';
import { 
  perks, perkRedemptions, events, eventTickets, drops, dropClaims,
  users, establishments, transactions, reviews, userFavorites,
  merchantAnalytics, campaigns, nfcCards, insertPerkSchema,
  insertEventSchema, insertDropSchema
} from '../shared/schema.js';
import { eq, desc, and, gte, lte, sql, or } from 'drizzle-orm';
import { requireAuth, requireUser, requireEstablishment } from './auth.js';
import crypto from 'crypto';

const router = express.Router();

// ============================================
// PERKS API
// ============================================

// Get all active perks (for user discovery)
router.get('/perks', requireUser, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const activePerks = await db
      .select({
        perk: perks,
        establishment: establishments,
      })
      .from(perks)
      .leftJoin(establishments, eq(perks.establishmentId, establishments.id))
      .where(
        and(
          eq(perks.active, true),
          lte(perks.validFrom, now),
          gte(perks.validUntil, now)
        )
      )
      .orderBy(desc(perks.createdAt))
      .limit(50);

    res.json({ perks: activePerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get perks for specific establishment
router.get('/perks/establishment/:establishmentId', requireUser, async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    const now = new Date();
    
    const establishmentPerks = await db
      .select()
      .from(perks)
      .where(
        and(
          eq(perks.establishmentId, establishmentId),
          eq(perks.active, true),
          lte(perks.validFrom, now),
          gte(perks.validUntil, now)
        )
      )
      .orderBy(desc(perks.createdAt));

    res.json({ perks: establishmentPerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem a perk
router.post('/perks/:perkId/redeem', requireUser, async (req: Request, res: Response) => {
  try {
    const { perkId } = req.params;
    const userId = req.session.userId!;
    
    // Get perk details
    const [perk] = await db.select().from(perks).where(eq(perks.id, perkId));
    
    if (!perk) {
      return res.status(404).json({ error: 'Perk not found' });
    }
    
    // Check if perk is active and valid
    const now = new Date();
    if (!perk.active || perk.validFrom > now || perk.validUntil < now) {
      return res.status(400).json({ error: 'Perk is not currently available' });
    }
    
    // Check redemption limit
    if (perk.maxRedemptions && perk.currentRedemptions >= perk.maxRedemptions) {
      return res.status(400).json({ error: 'Perk has reached maximum redemptions' });
    }
    
    // Check if user already redeemed this perk
    const [existing] = await db
      .select()
      .from(perkRedemptions)
      .where(
        and(
          eq(perkRedemptions.perkId, perkId),
          eq(perkRedemptions.userId, userId),
          eq(perkRedemptions.status, 'active')
        )
      );
    
    if (existing) {
      return res.status(400).json({ error: 'You have already redeemed this perk' });
    }
    
    // Create redemption
    const [redemption] = await db
      .insert(perkRedemptions)
      .values({
        perkId,
        userId,
        establishmentId: perk.establishmentId,
      })
      .returning();
    
    // Update perk redemption count
    await db
      .update(perks)
      .set({ currentRedemptions: sql`${perks.currentRedemptions} + 1` })
      .where(eq(perks.id, perkId));
    
    res.json({ redemption, message: 'Perk redeemed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's redeemed perks
router.get('/perks/my-redemptions', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    
    const redemptions = await db
      .select({
        redemption: perkRedemptions,
        perk: perks,
        establishment: establishments,
      })
      .from(perkRedemptions)
      .leftJoin(perks, eq(perkRedemptions.perkId, perks.id))
      .leftJoin(establishments, eq(perkRedemptions.establishmentId, establishments.id))
      .where(eq(perkRedemptions.userId, userId))
      .orderBy(desc(perkRedemptions.redeemedAt))
      .limit(50);
    
    res.json({ redemptions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EVENTS API
// ============================================

// Get all upcoming events
router.get('/events', requireUser, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const upcomingEvents = await db
      .select({
        event: events,
        establishment: establishments,
      })
      .from(events)
      .leftJoin(establishments, eq(events.establishmentId, establishments.id))
      .where(
        and(
          gte(events.date, now),
          eq(events.status, 'upcoming')
        )
      )
      .orderBy(events.date)
      .limit(50);
    
    res.json({ events: upcomingEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get event details
router.get('/events/:eventId', requireUser, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    const [eventDetails] = await db
      .select({
        event: events,
        establishment: establishments,
      })
      .from(events)
      .leftJoin(establishments, eq(events.establishmentId, establishments.id))
      .where(eq(events.id, eventId));
    
    if (!eventDetails) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: eventDetails });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase event ticket
router.post('/events/:eventId/purchase', requireUser, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.session.userId!;
    
    // Get event details
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check capacity
    if (event.capacity && event.currentAttendees >= event.capacity) {
      return res.status(400).json({ error: 'Event is sold out' });
    }
    
    // Check if user already has a ticket
    const [existingTicket] = await db
      .select()
      .from(eventTickets)
      .where(
        and(
          eq(eventTickets.eventId, eventId),
          eq(eventTickets.userId, userId),
          eq(eventTickets.status, 'active')
        )
      );
    
    if (existingTicket) {
      return res.status(400).json({ error: 'You already have a ticket for this event' });
    }
    
    // Generate ticket
    const ticketNumber = `TAPP-E-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrToken = crypto.randomBytes(32).toString('hex');
    const qrCode = `https://tapp.do/e/${qrToken}`;
    
    const [ticket] = await db
      .insert(eventTickets)
      .values({
        eventId,
        userId,
        ticketNumber,
        qrCode,
        price: event.price,
      })
      .returning();
    
    // Update event attendees
    await db
      .update(events)
      .set({ currentAttendees: sql`${events.currentAttendees} + 1` })
      .where(eq(events.id, eventId));
    
    res.json({ ticket, message: 'Ticket purchased successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's event tickets
router.get('/events/my-tickets', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    
    const tickets = await db
      .select({
        ticket: eventTickets,
        event: events,
        establishment: establishments,
      })
      .from(eventTickets)
      .leftJoin(events, eq(eventTickets.eventId, events.id))
      .leftJoin(establishments, eq(events.establishmentId, establishments.id))
      .where(eq(eventTickets.userId, userId))
      .orderBy(desc(eventTickets.purchasedAt));
    
    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DROPS API
// ============================================

// Get active drops (location-based would need lat/long)
router.get('/drops', requireUser, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const activeDrops = await db
      .select({
        drop: drops,
        establishment: establishments,
      })
      .from(drops)
      .leftJoin(establishments, eq(drops.establishmentId, establishments.id))
      .where(
        and(
          eq(drops.active, true),
          lte(drops.validFrom, now),
          gte(drops.validUntil, now),
          sql`${drops.claimedSlots} < ${drops.totalSlots}`
        )
      )
      .orderBy(desc(drops.createdAt))
      .limit(20);
    
    res.json({ drops: activeDrops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Claim a drop
router.post('/drops/:dropId/claim', requireUser, async (req: Request, res: Response) => {
  try {
    const { dropId } = req.params;
    const userId = req.session.userId!;
    
    // Get drop details
    const [drop] = await db.select().from(drops).where(eq(drops.id, dropId));
    
    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }
    
    // Check if drop is active and has slots
    const now = new Date();
    if (!drop.active || drop.validFrom > now || drop.validUntil < now) {
      return res.status(400).json({ error: 'Drop is not currently available' });
    }
    
    if (drop.claimedSlots >= drop.totalSlots) {
      return res.status(400).json({ error: 'Drop is fully claimed' });
    }
    
    // Check if user already claimed
    const [existing] = await db
      .select()
      .from(dropClaims)
      .where(
        and(
          eq(dropClaims.dropId, dropId),
          eq(dropClaims.userId, userId)
        )
      );
    
    if (existing) {
      return res.status(400).json({ error: 'You have already claimed this drop' });
    }
    
    // Create claim
    const [claim] = await db
      .insert(dropClaims)
      .values({
        dropId,
        userId,
      })
      .returning();
    
    // Update drop claimed slots
    await db
      .update(drops)
      .set({ claimedSlots: sql`${drops.claimedSlots} + 1` })
      .where(eq(drops.id, dropId));
    
    res.json({ claim, message: 'Drop claimed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EXPLORE API
// ============================================

// Get nearby establishments (public endpoint)
router.get('/explore/establishments', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    let query = db
      .select()
      .from(establishments)
      .where(eq(establishments.approved, true));
    
    // Filter by category if provided
    if (category && typeof category === 'string') {
      query = query.where(eq(establishments.category, category));
    }
    
    // Search by name if provided
    if (search && typeof search === 'string') {
      query = query.where(
        or(
          sql`${establishments.businessName} ILIKE ${'%' + search + '%'}`,
          sql`${establishments.description} ILIKE ${'%' + search + '%'}`
        )
      );
    }
    
    const results = await query
      .orderBy(establishments.businessName)
      .limit(50);
    
    res.json({ establishments: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get establishment details (public endpoint)
router.get('/explore/establishments/:establishmentId', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, establishmentId));
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Get active perks
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
    
    // Get upcoming events
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.establishmentId, establishmentId),
          gte(events.eventDate, now),
          eq(events.status, 'upcoming')
        )
      )
      .orderBy(events.eventDate)
      .limit(5);
    
    res.json({
      establishment,
      perks: activePerks,
      events: upcomingEvents,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite establishment
router.post('/explore/establishments/:establishmentId/favorite', requireUser, async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    const userId = req.session.userId!;
    
    // Check if already favorited
    const [existing] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.establishmentId, establishmentId)
        )
      );
    
    if (existing) {
      // Remove favorite
      await db
        .delete(userFavorites)
        .where(eq(userFavorites.id, existing.id));
      
      return res.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      // Add favorite
      await db
        .insert(userFavorites)
        .values({
          userId,
          establishmentId,
        });
      
      return res.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user favorites
router.get('/explore/my-favorites', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    
    const favorites = await db
      .select({
        favorite: userFavorites,
        establishment: establishments,
      })
      .from(userFavorites)
      .leftJoin(establishments, eq(userFavorites.establishmentId, establishments.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
    
    res.json({ favorites });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NFC TAP PROCESSING
// ============================================

// Process NFC tap
router.post('/tap/process', async (req: Request, res: Response) => {
  try {
    const { token, establishmentId, amount } = req.body;
    
    // Validate card token
    const [card] = await db
      .select()
      .from(nfcCards)
      .where(eq(nfcCards.token, token));
    
    if (!card || card.status !== 'active') {
      return res.status(404).json({ error: 'Invalid or inactive card' });
    }
    
    // Get establishment
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, establishmentId));
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Calculate benefits
    const discountApplied = (parseFloat(amount) * establishment.discountPercentage) / 100;
    const finalAmount = parseFloat(amount) - discountApplied;
    const pointsEarned = Math.floor(parseFloat(amount) / 100) * 10; // 10 points per RD$100
    
    // Create transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: card.userId,
        establishmentId,
        cardId: card.id,
        amount: amount.toString(),
        discountApplied: discountApplied.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        pointsEarned,
      })
      .returning();
    
    // Update user stats
    await db
      .update(users)
      .set({
        points: sql`${users.points} + ${pointsEarned}`,
        totalSpent: sql`${users.totalSpent} + ${finalAmount.toFixed(2)}`,
        monthlySpent: sql`${users.monthlySpent} + ${finalAmount.toFixed(2)}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, card.userId));
    
    // Update card last used
    await db
      .update(nfcCards)
      .set({ lastUsedAt: new Date() })
      .where(eq(nfcCards.id, card.id));
    
    // Update establishment stats
    await db
      .update(establishments)
      .set({
        totalRevenue: sql`${establishments.totalRevenue} + ${finalAmount.toFixed(2)}`,
        totalCustomers: sql`${establishments.totalCustomers} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, establishmentId));
    
    res.json({
      success: true,
      transaction,
      savedAmount: discountApplied.toFixed(2),
      pointsEarned,
      message: 'Tap successful!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REVIEWS API
// ============================================

// Submit review
router.post('/reviews', requireUser, async (req: Request, res: Response) => {
  try {
    const { establishmentId, transactionId, rating, comment } = req.body;
    const userId = req.session.userId!;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        userId,
        establishmentId,
        transactionId: transactionId || null,
        rating,
        comment: comment || null,
      })
      .returning();
    
    res.json({ review, message: 'Review submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get establishment reviews
router.get('/reviews/establishment/:establishmentId', requireUser, async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    
    const establishmentReviews = await db
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
      .orderBy(desc(reviews.createdAt))
      .limit(50);
    
    res.json({ reviews: establishmentReviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
