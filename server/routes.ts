import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './storage.js';
import { 
  users, insertUserSchema,
  establishments, insertEstablishmentSchema,
  admins, insertAdminSchema,
  nfcCards, transactions, establishmentRequests,
  perks, insertPerkSchema,
  loginSchema
} from '../shared/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { requireAuth, requireEstablishment, requireAdmin, requireUser } from './auth.js';
import crypto from 'crypto';

// ============================================
// IMPORT SECURITY MIDDLEWARE
// ============================================
import securityMiddleware from './security-middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
router.post('/auth/register/user', async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generar número de cuenta único (formato: XX-XXXXXX)
    const generateAccountNumber = async (): Promise<string> => {
      const prefix = Math.floor(Math.random() * 90 + 10); // 10-99
      const suffix = Math.floor(Math.random() * 900000 + 100000); // 100000-999999
      const accountNumber = `${prefix}-${suffix}`;
      
      // Verificar que no existe
      const existing = await db.select().from(users).where(eq(users.accountNumber, accountNumber));
      if (existing.length > 0) {
        return generateAccountNumber(); // Recursión si ya existe
      }
      return accountNumber;
    };
    
    const accountNumber = await generateAccountNumber();
    
    const [newUser] = await db.insert(users).values({
      ...validatedData,
      password: hashedPassword,
      accountNumber: accountNumber,
    }).returning();

    req.session.userId = newUser.id;
    req.session.userType = 'user';

    console.log(`✅ New user registered: ${newUser.email} | Account: ${accountNumber}`);

    res.json({ user: { ...newUser, password: undefined } });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Alias for mobile app compatibility
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Generar número de cuenta único (formato: XX-XXXXXX)
    const generateAccountNumber = async (): Promise<string> => {
      const prefix = Math.floor(Math.random() * 90 + 10); // 10-99
      const suffix = Math.floor(Math.random() * 900000 + 100000); // 100000-999999
      const accountNumber = `${prefix}-${suffix}`;
      
      // Verificar que no existe
      const existing = await db.select().from(users).where(eq(users.accountNumber, accountNumber));
      if (existing.length > 0) {
        return generateAccountNumber(); // Recursión si ya existe
      }
      return accountNumber;
    };
    
    const accountNumber = await generateAccountNumber();
    
    const [newUser] = await db.insert(users).values({
      ...validatedData,
      password: hashedPassword,
      accountNumber: accountNumber,
    }).returning();

    req.session.userId = newUser.id;
    req.session.userType = 'user';

    console.log(`✅ New user registered: ${newUser.email} | Account: ${accountNumber}`);

    res.json({ user: { ...newUser, password: undefined } });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Register new establishment (creates request)
router.post('/auth/register/establishment', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    const [request] = await db.insert(establishmentRequests).values({
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      category: data.category,
      description: data.description,
    }).returning();

    res.json({ 
      message: 'Application submitted successfully. You will receive an email once approved.',
      requestId: request.id
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login (universal for all user types)
router.post('/auth/login', 
  // securityMiddleware.authLimiter, // Rate limiting disabled for dev
  // securityMiddleware.bruteForceProtection('email'), // Brute force protection disabled for dev
  async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user: any = null;
    let userType: 'user' | 'establishment' | 'admin' = 'user';
    
    // Usar SQL raw para evitar problemas con el compilador
    try {
      // 1. Buscar en users
      const normalUsers = await db.execute(
        sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
      );
      if (normalUsers.rows && normalUsers.rows.length > 0) {
        user = normalUsers.rows[0];
        userType = 'user';
      }
      
      // 2. Si no existe, buscar en establishments
      if (!user) {
        const estUsers = await db.execute(
          sql`SELECT * FROM establishments WHERE email = ${email} LIMIT 1`
        );
        if (estUsers.rows && estUsers.rows.length > 0) {
          const estUser = estUsers.rows[0];
          if (!estUser.approved) {
            return res.status(403).json({ error: 'Your establishment is pending approval' });
          }
          user = estUser;
          userType = 'establishment';
        }
      }
      
      // 3. Si no existe, buscar en admins
      if (!user) {
        const adminUsers = await db.execute(
          sql`SELECT * FROM admins WHERE email = ${email} LIMIT 1`
        );
        if (adminUsers.rows && adminUsers.rows.length > 0) {
          user = adminUsers.rows[0];
          userType = 'admin';
        }
      }
    } catch (e) {
      console.error('Error searching for user:', e);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Validar credenciales
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn(`❌ Failed login attempt for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Login exitoso - regenerar session ID (prevenir session fixation)
    const oldSessionId = req.session?.id;
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
    });
    
    req.session.userId = user.id;
    req.session.userType = userType;
    
    // Update last_login_at usando SQL raw (solo para users, establishments no tiene esa columna)
    if (userType === 'user') {
      try {
        await db.execute(
          sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`
        );
      } catch (e) {
        console.warn('Could not update last_login_at:', e);
      }
    }
    
    console.log(`✅ Successful login: ${email} (${userType})`);
    
    // Generate secure JWT token for mobile app WebSocket
    // Token expira en 7 días para seguridad, no 30 días
    const token = jwt.sign(
      { 
        userId: user.id, 
        type: userType,
        email: user.email,
        iat: Math.floor(Date.now() / 1000) // Issued at timestamp
      },
      JWT_SECRET,
      { 
        expiresIn: '7d', // 7 días máximo
        algorithm: 'HS256' // Algoritmo explícito
      }
    );
    
    res.json({ 
      user: { 
        ...user, 
        password: undefined,
        role: userType // Agregar role explícitamente para el frontend
      }, 
      userType,
      token  // Token JWT para WebSocket en app móvil
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Logout
router.post('/auth/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current session
router.get('/auth/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.session;
    let user: any;
    
    if (userType === 'user') {
      [user] = await db.select().from(users).where(eq(users.id, userId!));
    } else if (userType === 'establishment') {
      [user] = await db.select().from(establishments).where(eq(establishments.id, userId!));
    } else if (userType === 'admin') {
      [user] = await db.select().from(admins).where(eq(admins.id, userId!));
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: { ...user, password: undefined }, userType });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user data (simplified endpoint)
router.get('/user', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.session;
    let user: any;
    
    if (userType === 'user') {
      [user] = await db.select().from(users).where(eq(users.id, userId!));
    } else if (userType === 'establishment') {
      [user] = await db.select().from(establishments).where(eq(establishments.id, userId!));
    } else if (userType === 'admin') {
      [user] = await db.select().from(admins).where(eq(admins.id, userId!));
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { ...user, password: undefined }, 
      userType,
      establishment: userType === 'establishment' ? { ...user, password: undefined } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER DASHBOARD ROUTES
// ============================================

// Get user profile with cards
router.get('/user/profile', requireUser, async (req: Request, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId!));
    const cards = await db.select().from(nfcCards).where(eq(nfcCards.userId, req.session.userId!));
    
    res.json({ user: { ...user, password: undefined }, cards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
router.get('/user/transactions', requireUser, async (req: Request, res: Response) => {
  try {
    const userTransactions = await db.select({
      transaction: transactions,
      establishment: establishments,
    })
    .from(transactions)
    .leftJoin(establishments, eq(transactions.establishmentId, establishments.id))
    .where(eq(transactions.userId, req.session.userId!))
    .orderBy(desc(transactions.createdAt))
    .limit(50);
    
    res.json({ transactions: userTransactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby establishments
router.get('/user/establishments/nearby', requireUser, async (req: Request, res: Response) => {
  try {
    const allEstablishments = await db.select().from(establishments)
      .where(eq(establishments.approved, true))
      .orderBy(establishments.businessName);
    
    res.json({ establishments: allEstablishments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ESTABLISHMENT DASHBOARD ROUTES
// ============================================

// Get establishment dashboard stats
router.get('/establishment/dashboard', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const [establishment] = await db.select().from(establishments)
      .where(eq(establishments.id, req.session.userId!));
    
    // Get transactions for this establishment
    const establishmentTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.establishmentId, req.session.userId!))
      .orderBy(desc(transactions.createdAt))
      .limit(100);
    
    // Calculate stats
    const totalRevenue = establishmentTransactions.reduce((sum, t) => 
      sum + parseFloat(t.finalAmount.toString()), 0
    );
    const totalTransactions = establishmentTransactions.length;
    
    // Get unique customers
    const uniqueCustomers = new Set(establishmentTransactions.map(t => t.userId)).size;
    
    res.json({
      establishment: { ...establishment, password: undefined },
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions,
        totalCustomers: uniqueCustomers,
        recentTransactions: establishmentTransactions.slice(0, 10),
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get business customers data
router.get('/business/customers', requireEstablishment, async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching customers data for establishment:', req.session.userId);
    const { transactions, users, events: eventsTable } = await import('../shared/schema.js');
    
    // Get customers who made transactions
    const customerTransactions = await db.select({
      userId: transactions.userId,
      userName: users.fullName,
      userEmail: users.email,
      totalSpent: sql<number>`SUM(${transactions.amount})`,
      transactionCount: sql<number>`COUNT(${transactions.id})`,
      lastTransaction: sql<string>`MAX(${transactions.createdAt})`,
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.userId, users.id))
    .where(eq(transactions.establishmentId, req.session.userId!))
    .groupBy(transactions.userId, users.fullName, users.email)
    .orderBy(desc(sql`SUM(${transactions.amount})`))
    .limit(50);
    
    console.log('✅ Found', customerTransactions.length, 'customers');
    
    // Get event attendees
    const eventAttendees = await db.select({
      eventId: eventsTable.id,
      eventTitle: eventsTable.title,
      eventDate: eventsTable.eventDate,
      attendeeCount: sql<number>`COUNT(DISTINCT ${transactions.userId})`,
    })
    .from(eventsTable)
    .leftJoin(transactions, eq(eventsTable.id, transactions.eventId))
    .where(eq(eventsTable.establishmentId, req.session.userId!))
    .groupBy(eventsTable.id, eventsTable.title, eventsTable.eventDate)
    .orderBy(desc(eventsTable.eventDate))
    .limit(10);
    
    console.log('✅ Found', eventAttendees.length, 'event attendees');
    
    res.json({
      customers: customerTransactions,
      eventAttendees: eventAttendees,
      totalCustomers: customerTransactions.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business analytics data
router.get('/business/analytics', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { transactions, perks: perksTable } = await import('../shared/schema.js');
    
    // Revenue by month (last 6 months)
    const revenueByMonth = await db.select({
      month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
      revenue: sql<number>`SUM(${transactions.amount})`,
      transactionCount: sql<number>`COUNT(${transactions.id})`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.establishmentId, req.session.userId!),
      sql`${transactions.createdAt} >= NOW() - INTERVAL '6 months'`
    ))
    .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);
    
    // Top performing perks
    const topPerks = await db.select({
      perkId: perksTable.id,
      perkTitle: perksTable.title,
      perkType: perksTable.type,
      redemptionCount: sql<number>`COUNT(${transactions.id})`,
      totalRevenue: sql<number>`SUM(${transactions.amount})`,
    })
    .from(perksTable)
    .leftJoin(transactions, eq(perksTable.id, transactions.perkId))
    .where(eq(perksTable.establishmentId, req.session.userId!))
    .groupBy(perksTable.id, perksTable.title, perksTable.type)
    .orderBy(desc(sql`COUNT(${transactions.id})`))
    .limit(10);
    
    // Customer acquisition trend
    const customerAcquisition = await db.select({
      month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
      newCustomers: sql<number>`COUNT(DISTINCT ${transactions.userId})`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.establishmentId, req.session.userId!),
      sql`${transactions.createdAt} >= NOW() - INTERVAL '6 months'`
    ))
    .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);
    
    res.json({
      revenueByMonth,
      topPerks,
      customerAcquisition
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get business profile
router.get('/business/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const [business] = await db.select()
      .from(establishments)
      .where(eq(establishments.id, req.session.userId!));
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json({
      id: business.id,
      businessName: business.businessName,
      description: business.description,
      category: business.category,
      phone: business.phone,
      address: business.address,
      logo: business.logo,
      website: business.website,
      businessHours: business.businessHours
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update business profile
router.put('/business/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const updates: any = {};
    
    // Only update fields that are provided
    if (req.body.businessName !== undefined) updates.businessName = req.body.businessName;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.logo !== undefined) updates.logo = req.body.logo;
    if (req.body.website !== undefined) updates.website = req.body.website;
    if (req.body.hours !== undefined) updates.businessHours = req.body.hours;
    
    const [updatedBusiness] = await db.update(establishments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(establishments.id, req.session.userId!))
      .returning();
    
    if (!updatedBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json({
      success: true,
      business: {
        id: updatedBusiness.id,
        businessName: updatedBusiness.businessName,
        description: updatedBusiness.description,
        category: updatedBusiness.category,
        phone: updatedBusiness.phone,
        address: updatedBusiness.address,
        logo: updatedBusiness.logo,
        website: updatedBusiness.website,
        businessHours: updatedBusiness.businessHours
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get business dashboard stats (for new React dashboard)
router.get('/business/stats', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    
    const [establishment] = await db.select().from(establishments)
      .where(eq(establishments.id, req.session.userId!));
    
    // Get all transactions for this establishment
    const allTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.establishmentId, req.session.userId!))
      .orderBy(desc(transactions.createdAt));
    
    // Calculate monthly stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyTransactions = allTransactions.filter(t => 
      new Date(t.createdAt) >= thirtyDaysAgo
    );
    
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => 
      sum + parseFloat(t.finalAmount.toString()), 0
    );
    
    const monthlyCustomers = new Set(monthlyTransactions.map(t => t.userId)).size;
    const totalCustomers = new Set(allTransactions.map(t => t.userId)).size;
    
    // Count active perks
    const activePerksCount = await db.select({ count: sql<number>`count(*)` })
      .from(perks)
      .where(and(
        eq(perks.establishmentId, req.session.userId!),
        eq(perks.active, true)
      ));
    
    // Count upcoming events
    const upcomingEventsCount = await db.select({ count: sql<number>`count(*)` })
      .from(eventsTable)
      .where(and(
        eq(eventsTable.establishmentId, req.session.userId!),
        eq(eventsTable.active, true),
        sql`${eventsTable.eventDate} >= NOW()`
      ));
    
    res.json({
      monthlyRevenue: monthlyRevenue.toFixed(2),
      monthlyTransactions: monthlyTransactions.length,
      monthlyCustomers,
      totalCustomers,
      activePerks: Number(activePerksCount[0]?.count || 0),
      upcomingEvents: Number(upcomingEventsCount[0]?.count || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUSINESS PERKS MANAGEMENT
// ============================================

// Get all perks for business
router.get('/business/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const businessPerks = await db.select().from(perks)
      .where(eq(perks.establishmentId, req.session.userId!))
      .orderBy(desc(perks.createdAt));
    
    res.json({ perks: businessPerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new perk
router.post('/business/perks', requireEstablishment, async (req: Request, res: Response) => {
  try {
    // Clean up data - convert empty strings to null for optional fields
    const cleanData = { ...req.body };
    if (cleanData.validFrom === '') cleanData.validFrom = null;
    if (cleanData.validUntil === '') cleanData.validUntil = null;
    if (cleanData.maxRedemptions === '') cleanData.maxRedemptions = null;
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.image === '') cleanData.image = null;
    
    // Convert date strings to Date objects if needed
    if (cleanData.validFrom && typeof cleanData.validFrom === 'string') {
      cleanData.validFrom = new Date(cleanData.validFrom);
    }
    if (cleanData.validUntil && typeof cleanData.validUntil === 'string') {
      cleanData.validUntil = new Date(cleanData.validUntil);
    }
    
    const perkData = {
      establishmentId: req.session.userId!,
      ...cleanData,
      active: true,
    };
    
    const [newPerk] = await db.insert(perks).values(perkData).returning();
    res.json({ perk: newPerk, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update perk
router.put('/business/perks/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Clean up data - convert empty strings to null for optional fields
    const cleanData = { ...req.body };
    if (cleanData.validFrom === '') cleanData.validFrom = null;
    if (cleanData.validUntil === '') cleanData.validUntil = null;
    if (cleanData.maxRedemptions === '') cleanData.maxRedemptions = null;
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.image === '') cleanData.image = null;
    
    // Convert date strings to Date objects if needed
    if (cleanData.validFrom && typeof cleanData.validFrom === 'string') {
      cleanData.validFrom = new Date(cleanData.validFrom);
    }
    if (cleanData.validUntil && typeof cleanData.validUntil === 'string') {
      cleanData.validUntil = new Date(cleanData.validUntil);
    }
    
    const [updatedPerk] = await db.update(perks)
      .set({ ...cleanData, updatedAt: new Date() })
      .where(and(eq(perks.id, id), eq(perks.establishmentId, req.session.userId!)))
      .returning();
    
    if (!updatedPerk) {
      return res.status(404).json({ error: 'Perk not found' });
    }
    
    res.json({ perk: updatedPerk, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete perk
router.delete('/business/perks/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [deletedPerk] = await db.delete(perks)
      .where(and(eq(perks.id, id), eq(perks.establishmentId, req.session.userId!)))
      .returning();
    
    if (!deletedPerk) {
      return res.status(404).json({ error: 'Perk not found' });
    }
    
    res.json({ success: true, message: 'Perk deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUSINESS EVENTS ROUTES
// ============================================

// Get all events for business
router.get('/business/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    
    const businessEvents = await db.select().from(eventsTable)
      .where(eq(eventsTable.establishmentId, req.session.userId!))
      .orderBy(desc(eventsTable.eventDate));
    
    res.json({ events: businessEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/business/events', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    
    // Clean up data - convert empty strings to null
    const cleanData = { ...req.body };
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.location === '') cleanData.location = null;
    if (cleanData.capacity === '') cleanData.capacity = null;
    if (cleanData.ticketPrice === '') cleanData.ticketPrice = null;
    if (cleanData.image === '') cleanData.image = null;
    
    // Map 'date' to 'eventDate' if needed (frontend compatibility)
    if (cleanData.date && !cleanData.eventDate) {
      cleanData.eventDate = cleanData.date;
      delete cleanData.date;
    }
    
    // Convert eventDate string to Date object if needed
    if (cleanData.eventDate && typeof cleanData.eventDate === 'string') {
      cleanData.eventDate = new Date(cleanData.eventDate);
    }
    
    const eventData = {
      ...cleanData,
      establishmentId: req.session.userId!,
      currentAttendees: 0,
      active: true,
    };
    
    const [newEvent] = await db.insert(eventsTable).values(eventData).returning();
    res.json({ event: newEvent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
router.put('/business/events/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    const { id } = req.params;
    
    // Clean up data
    const cleanData = { ...req.body };
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.location === '') cleanData.location = null;
    if (cleanData.capacity === '') cleanData.capacity = null;
    if (cleanData.ticketPrice === '') cleanData.ticketPrice = null;
    if (cleanData.image === '') cleanData.image = null;
    
    // Map 'date' to 'eventDate' if needed (frontend compatibility)
    if (cleanData.date && !cleanData.eventDate) {
      cleanData.eventDate = cleanData.date;
      delete cleanData.date;
    }
    
    // Convert eventDate string to Date object if needed
    if (cleanData.eventDate && typeof cleanData.eventDate === 'string') {
      cleanData.eventDate = new Date(cleanData.eventDate);
    }
    
    const [updatedEvent] = await db.update(eventsTable)
      .set({ ...cleanData, updatedAt: new Date() })
      .where(and(eq(eventsTable.id, id), eq(eventsTable.establishmentId, req.session.userId!)))
      .returning();
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/business/events/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    const { id } = req.params;
    
    const [deletedEvent] = await db.delete(eventsTable)
      .where(and(eq(eventsTable.id, id), eq(eventsTable.establishmentId, req.session.userId!)))
      .returning();
    
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUSINESS DROPS ROUTES
// ============================================

// Get all drops for business
router.get('/business/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { drops: dropsTable } = await import('../shared/schema.js');
    
    const businessDrops = await db.select().from(dropsTable)
      .where(eq(dropsTable.establishmentId, req.session.userId!))
      .orderBy(desc(dropsTable.createdAt));
    
    res.json({ drops: businessDrops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new drop
router.post('/business/drops', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { drops: dropsTable } = await import('../shared/schema.js');
    
    // Clean up data - convert empty strings to null
    const cleanData = { ...req.body };
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.triggerValue === '') cleanData.triggerValue = null;
    if (cleanData.maxClaims === '') cleanData.maxClaims = null;
    if (cleanData.expiresAt === '') cleanData.expiresAt = null;
    
    // Convert expiresAt string to Date object if needed
    if (cleanData.expiresAt && typeof cleanData.expiresAt === 'string') {
      cleanData.expiresAt = new Date(cleanData.expiresAt);
    }
    
    // Map frontend fields to backend schema
    if (cleanData.discount && !cleanData.reward) {
      cleanData.reward = `${cleanData.discount}% off`;
      delete cleanData.discount;
    }
    if (cleanData.quantity && !cleanData.maxClaims) {
      cleanData.maxClaims = parseInt(cleanData.quantity);
      delete cleanData.quantity;
    }
    
    // Set default triggerType if not provided
    if (!cleanData.triggerType) {
      cleanData.triggerType = 'time';
    }
    
    const dropData = {
      ...cleanData,
      establishmentId: req.session.userId!,
      currentClaims: 0,
      active: true,
    };
    
    const [newDrop] = await db.insert(dropsTable).values(dropData).returning();
    res.json({ drop: newDrop });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update drop
router.put('/business/drops/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { drops: dropsTable } = await import('../shared/schema.js');
    const { id } = req.params;
    
    // Clean up data
    const cleanData = { ...req.body };
    if (cleanData.description === '') cleanData.description = null;
    if (cleanData.triggerValue === '') cleanData.triggerValue = null;
    if (cleanData.maxClaims === '') cleanData.maxClaims = null;
    if (cleanData.expiresAt === '') cleanData.expiresAt = null;
    
    // Convert expiresAt string to Date object if needed
    if (cleanData.expiresAt && typeof cleanData.expiresAt === 'string') {
      cleanData.expiresAt = new Date(cleanData.expiresAt);
    }
    
    // Map frontend fields to backend schema
    if (cleanData.discount && !cleanData.reward) {
      cleanData.reward = `${cleanData.discount}% off`;
      delete cleanData.discount;
    }
    if (cleanData.quantity && !cleanData.maxClaims) {
      cleanData.maxClaims = parseInt(cleanData.quantity);
      delete cleanData.quantity;
    }
    
    const [updatedDrop] = await db.update(dropsTable)
      .set({ ...cleanData, updatedAt: new Date() })
      .where(and(eq(dropsTable.id, id), eq(dropsTable.establishmentId, req.session.userId!)))
      .returning();
    
    if (!updatedDrop) {
      return res.status(404).json({ error: 'Drop not found' });
    }
    
    res.json({ drop: updatedDrop });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete drop
router.delete('/business/drops/:id', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { drops: dropsTable } = await import('../shared/schema.js');
    const { id } = req.params;
    
    const [deletedDrop] = await db.delete(dropsTable)
      .where(and(eq(dropsTable.id, id), eq(dropsTable.establishmentId, req.session.userId!)))
      .returning();
    
    if (!deletedDrop) {
      return res.status(404).json({ error: 'Drop not found' });
    }
    
    res.json({ success: true, message: 'Drop deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update establishment profile
router.put('/establishment/profile', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const { businessName, description, phone, address, discountPercentage } = req.body;
    
    const [updated] = await db.update(establishments)
      .set({
        businessName,
        description,
        phone,
        address,
        discountPercentage,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, req.session.userId!))
      .returning();
    
    res.json({ establishment: { ...updated, password: undefined } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get establishment transactions with customer details
router.get('/establishment/transactions', requireEstablishment, async (req: Request, res: Response) => {
  try {
    const establishmentTransactions = await db.select({
      transaction: transactions,
      user: users,
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.userId, users.id))
    .where(eq(transactions.establishmentId, req.session.userId!))
    .orderBy(desc(transactions.createdAt))
    .limit(100);
    
    res.json({ transactions: establishmentTransactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN DASHBOARD ROUTES
// ============================================

// Get admin dashboard overview
router.get('/admin/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    const allEstablishments = await db.select().from(establishments);
    const allTransactions = await db.select().from(transactions);
    const pendingRequests = await db.select().from(establishmentRequests)
      .where(eq(establishmentRequests.status, 'pending'));
    
    const totalRevenue = allTransactions.reduce((sum, t) => 
      sum + parseFloat(t.finalAmount.toString()), 0
    );
    
    res.json({
      stats: {
        totalUsers: allUsers.length,
        totalEstablishments: allEstablishments.length,
        approvedEstablishments: allEstablishments.filter(e => e.approved).length,
        pendingRequests: pendingRequests.length,
        totalTransactions: allTransactions.length,
        totalRevenue: totalRevenue.toFixed(2),
      },
      recentUsers: allUsers.slice(-10).reverse(),
      recentEstablishments: allEstablishments.slice(-10).reverse(),
      recentTransactions: allTransactions.slice(-20).reverse(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all establishment requests
router.get('/admin/requests', requireAdmin, async (req: Request, res: Response) => {
  try {
    const requests = await db.select().from(establishmentRequests)
      .orderBy(desc(establishmentRequests.createdAt));
    
    res.json({ requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve establishment request
router.post('/admin/requests/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body; // Admin sets initial password
    
    const [request] = await db.select().from(establishmentRequests)
      .where(eq(establishmentRequests.id, id));
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Create establishment account
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newEstablishment] = await db.insert(establishments).values({
      businessName: request.businessName,
      ownerName: request.ownerName,
      email: request.email,
      phone: request.phone,
      address: request.address,
      city: request.city,
      category: request.category,
      description: request.description,
      password: hashedPassword,
      approved: true,
      approvedAt: new Date(),
    }).returning();
    
    // Update request status
    await db.update(establishmentRequests)
      .set({
        status: 'approved',
        reviewedBy: req.session.userId,
        reviewedAt: new Date(),
      })
      .where(eq(establishmentRequests.id, id));
    
    res.json({ 
      message: 'Establishment approved successfully',
      establishment: { ...newEstablishment, password: undefined }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject establishment request
router.post('/admin/requests/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await db.update(establishmentRequests)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: req.session.userId,
        reviewedAt: new Date(),
      })
      .where(eq(establishmentRequests.id, id));
    
    res.json({ message: 'Request rejected' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create NFC card for user
router.post('/admin/cards/create', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    // Generate unique identifiers
    const cardNumber = `TAPP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const token = crypto.randomBytes(32).toString('hex');
    const qrCode = `https://tapp.do/c/${token}`;
    
    const [newCard] = await db.insert(nfcCards).values({
      userId,
      cardNumber,
      token,
      qrCode,
      activatedAt: new Date(),
    }).returning();
    
    res.json({ card: newCard });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json({ users: allUsers.map(u => ({ ...u, password: undefined })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all establishments
router.get('/admin/establishments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allEstablishments = await db.select().from(establishments)
      .orderBy(desc(establishments.createdAt));
    res.json({ establishments: allEstablishments.map(e => ({ ...e, password: undefined })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all cards
router.get('/admin/cards', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allCards = await db.select({
      card: nfcCards,
      user: users,
    })
    .from(nfcCards)
    .leftJoin(users, eq(nfcCards.userId, users.id))
    .orderBy(desc(nfcCards.createdAt));
    
    res.json({ cards: allCards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process transaction (when user taps card)
router.post('/transaction/process', async (req: Request, res: Response) => {
  try {
    const { token, establishmentId, amount } = req.body;
    
    // Find card by token
    const [card] = await db.select().from(nfcCards).where(eq(nfcCards.token, token));
    if (!card || card.status !== 'active') {
      return res.status(404).json({ error: 'Invalid or inactive card' });
    }
    
    // Get establishment
    const [establishment] = await db.select().from(establishments)
      .where(eq(establishments.id, establishmentId));
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Calculate discount
    const discountApplied = (parseFloat(amount) * establishment.discountPercentage) / 100;
    const finalAmount = parseFloat(amount) - discountApplied;
    const pointsEarned = Math.floor(parseFloat(amount) / 100) * 10; // 10 points per RD$100
    
    // Create transaction
    const [newTransaction] = await db.insert(transactions).values({
      userId: card.userId,
      establishmentId,
      cardId: card.id,
      amount: amount.toString(),
      discountApplied: discountApplied.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      pointsEarned,
    }).returning();
    
    // Update user points and spending
    await db.update(users)
      .set({
        points: users.points + pointsEarned,
        totalSpent: users.totalSpent + finalAmount.toFixed(2),
        monthlySpent: users.monthlySpent + finalAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(users.id, card.userId));
    
    // Update card last used
    await db.update(nfcCards)
      .set({ lastUsedAt: new Date() })
      .where(eq(nfcCards.id, card.id));
    
    // Update establishment stats
    await db.update(establishments)
      .set({
        totalRevenue: establishments.totalRevenue + finalAmount.toFixed(2),
        totalCustomers: establishments.totalCustomers + 1,
        updatedAt: new Date(),
      })
      .where(eq(establishments.id, establishmentId));
    
    res.json({ 
      transaction: newTransaction,
      savedAmount: discountApplied.toFixed(2),
      pointsEarned,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PUBLIC DATA ROUTES
// ============================================

// Get all establishments (public endpoint for mobile app)
router.get('/establishments', async (req: Request, res: Response) => {
  try {
    const allEstablishments = await db.select().from(establishments)
      .where(and(
        eq(establishments.approved, true),
        eq(establishments.isActive, true)
      ))
      .orderBy(desc(establishments.isFeatured), establishments.businessName);
    
    // Transform to match mobile app format
    const transformedEstablishments = allEstablishments.map(est => ({
      id: est.id,
      name: est.businessName,
      category: est.category,
      address: est.address,
      distance: '0.5 km', // TODO: Calculate based on user location
      discount: parseFloat(est.discountRate?.toString() || '0'),
      specialOffer: est.description || '',
      image: est.logo,
      rating: parseFloat(est.averageRating?.toString() || '0'),
      reviewCount: est.reviewCount || 0,
      latitude: est.locationLat ? parseFloat(est.locationLat.toString()) : null,
      longitude: est.locationLng ? parseFloat(est.locationLng.toString()) : null,
    }));
    
    console.log('✅ Sending response with establishments:', transformedEstablishments.length);
    res.json(transformedEstablishments);
  } catch (error: any) {
    console.error('❌ Error fetching establishments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all events (public endpoint for users to see events from all establishments)
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    
    const allEvents = await db.select({
      event: eventsTable,
      establishment: establishments,
    })
    .from(eventsTable)
    .leftJoin(establishments, eq(eventsTable.establishmentId, establishments.id))
    .where(eq(eventsTable.active, true))
    .orderBy(eventsTable.eventDate);
    
    // Transform data to match old frontend format
    const transformedEvents = allEvents.map(item => ({
      event: {
        id: item.event.id,
        title: item.event.title,
        description: item.event.description || '',
        // Add legacy field names for compatibility
        date: item.event.eventDate,
        price: item.event.ticketPrice ? parseFloat(item.event.ticketPrice.toString()) : 0,
        venue: item.event.location || '',
        address: item.event.location || '',
        startTime: item.event.eventDate ? new Date(item.event.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
        endTime: '',
        coverImage: item.event.image || '',
        image: item.event.image || '',
        capacity: item.event.capacity || 0,
        currentAttendees: item.event.currentAttendees || 0,
      },
      establishment: item.establishment
    }));
    
    res.json({ events: transformedEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get event details
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    const { id } = req.params;
    
    const [eventData] = await db.select({
      event: eventsTable,
      establishment: establishments,
    })
    .from(eventsTable)
    .leftJoin(establishments, eq(eventsTable.establishmentId, establishments.id))
    .where(eq(eventsTable.id, id));
    
    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(eventData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all perks (public endpoint)
router.get('/perks', async (req: Request, res: Response) => {
  try {
    const { perks: perksTable } = await import('../shared/schema.js');
    
    const allPerks = await db.select({
      perk: perksTable,
      establishment: establishments,
    })
    .from(perksTable)
    .leftJoin(establishments, eq(perksTable.establishmentId, establishments.id))
    .where(eq(perksTable.active, true))
    .orderBy(desc(perksTable.createdAt));
    
    res.json({ perks: allPerks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all establishments (public endpoint for explore page)
router.get('/explore/establishments', async (req: Request, res: Response) => {
  try {
    const { perks: perksTable } = await import('../shared/schema.js');
    
    const allEstablishments = await db.select()
      .from(establishments)
      .where(eq(establishments.approved, true))
      .orderBy(establishments.businessName);
    
    // Get perks for each establishment and filter only those with active perks
    const establishmentsWithPerks = await Promise.all(
      allEstablishments.map(async (est) => {
        const activePerks = await db.select()
          .from(perksTable)
          .where(and(
            eq(perksTable.establishmentId, est.id),
            eq(perksTable.active, true),
            // Only perks that haven't expired
            sql`(${perksTable.validUntil} IS NULL OR ${perksTable.validUntil} > NOW())`
          ))
          .orderBy(desc(perksTable.value)); // Sort by value descending
        
        return {
          ...est,
          password: undefined,
          image_url: est.logo, // Map logo to image_url for frontend
          perks: activePerks,
          perksCount: activePerks.length
        };
      })
    );
    
    // Filter only establishments with active perks
    const filtered = establishmentsWithPerks.filter(est => est.perksCount > 0);
    
    res.json({ establishments: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get establishment details (public endpoint)
router.get('/explore/establishments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { perks: perksTable, reviews: reviewsTable } = await import('../shared/schema.js');
    
    // Get establishment
    const [establishment] = await db.select()
      .from(establishments)
      .where(and(
        eq(establishments.id, id),
        eq(establishments.approved, true)
      ));
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    
    // Get perks
    const establishmentPerks = await db.select()
      .from(perksTable)
      .where(and(
        eq(perksTable.establishmentId, id),
        eq(perksTable.active, true)
      ))
      .orderBy(desc(perksTable.createdAt));
    
    // Map perks to expected format
    const mappedPerks = establishmentPerks.map(perk => ({
      ...perk,
      discount: perk.value, // Map value to discount for frontend compatibility
    }));
    
    // Get reviews
    const establishmentReviews = await db.select({
      review: reviewsTable,
      user: users
    })
    .from(reviewsTable)
    .leftJoin(users, eq(reviewsTable.userId, users.id))
    .where(eq(reviewsTable.establishmentId, id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(10);
    
    res.json({
      establishment: { 
        ...establishment, 
        password: undefined,
        image_url: establishment.logo // Map logo to image_url
      },
      perks: mappedPerks,
      reviews: establishmentReviews
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active events (public endpoint for explore page)
router.get('/explore/events', async (req: Request, res: Response) => {
  try {
    const { events: eventsTable } = await import('../shared/schema.js');
    
    // Get all active upcoming events with establishment info
    const upcomingEvents = await db.select({
      event: eventsTable,
      establishment: establishments
    })
      .from(eventsTable)
      .innerJoin(establishments, eq(eventsTable.establishmentId, establishments.id))
      .where(and(
        eq(establishments.approved, true),
        gte(eventsTable.eventDate, new Date())
      ))
      .orderBy(eventsTable.eventDate)
      .limit(20);
    
    // Map to frontend format
    const mappedEvents = upcomingEvents.map(({ event, establishment }) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      location: event.location,
      capacity: event.capacity,
      establishment: {
        id: establishment.id,
        name: establishment.businessName,
        image: establishment.logo,
        category: establishment.category,
      }
    }));
    
    res.json({ events: mappedEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER DASHBOARD ROUTES
// ============================================

// Get user dashboard data
router.get('/user/dashboard', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // Calculate total points earned
    const totalPoints = recentTransactions.reduce(
      (sum, tx) => sum + (tx.pointsEarned || 0),
      0
    );

    // Get user's NFC card
    const [nfcCard] = await db
      .select()
      .from(nfcCards)
      .where(eq(nfcCards.userId, userId));

    res.json({
      user: {
        ...user,
        password: undefined, // Don't send password
      },
      stats: {
        totalPoints,
        totalTransactions: recentTransactions.length,
        totalSaved: recentTransactions.reduce(
          (sum, tx) => sum + parseFloat(tx.amount),
          0
        ),
      },
      recentActivity: recentTransactions.slice(0, 5),
      nfcCard: nfcCard || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/user/profile', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/user/profile', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { fullName, email, phone } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({
        fullName,
        email,
        phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      user: {
        ...updatedUser,
        password: undefined,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions history
router.get('/user/transactions', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ transactions: userTransactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY: Seed establishments and perks
router.post('/admin/seed-all-temp', async (req: Request, res: Response) => {
  try {
    const { perks: perksTable } = await import('../shared/schema.js');
    const bcrypt = await import('bcryptjs');
    
    // Create establishments
    const establishmentsData = [
      {
        businessName: 'La Parrillada',
        ownerName: 'Carlos Rodriguez',
        email: 'laparrillada@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0101',
        address: 'Av. Winston Churchill 1234',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Dominican Grill - Premium meats and traditional flavors',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 20,
      },
      {
        businessName: 'Sakura Sushi',
        ownerName: 'Kenji Tanaka',
        email: 'sakurasushi@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0102',
        address: 'Av. Máximo Gómez 567',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Japanese Cuisine - Fresh sushi and authentic dishes',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 15,
      },
      {
        businessName: 'Mofongo House',
        ownerName: 'Maria Santos',
        email: 'mofongohouse@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0103',
        address: 'Calle El Conde 890',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Caribbean Food - The best mofongo in town',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 10,
      },
      {
        businessName: 'Rooftop Lounge',
        ownerName: 'David Martinez',
        email: 'rooftoplounge@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0104',
        address: 'Torre Corporativa, Piso 20',
        city: 'Santo Domingo',
        category: 'cafeteria',
        description: 'Cocktail Bar - Sky-high views and premium drinks',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 20,
      },
      {
        businessName: 'Café Colonial',
        ownerName: 'Isabella Fernandez',
        email: 'cafecolonial@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0105',
        address: 'Zona Colonial, Calle Las Damas',
        city: 'Santo Domingo',
        category: 'cafeteria',
        description: 'Coffee Shop - Artisan coffee and fresh pastries',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 10,
      },
      {
        businessName: 'Pizza Napoli',
        ownerName: 'Giovanni Rossi',
        email: 'pizzanapoli@example.com',
        password: await bcrypt.default.hash('starter123', 10),
        phone: '809-555-0106',
        address: 'Av. Abraham Lincoln 345',
        city: 'Santo Domingo',
        category: 'restaurante',
        description: 'Italian Pizzeria - Wood-fired authentic pizza',
        approved: true,
        approvedAt: new Date(),
        discountPercentage: 10,
      },
    ];
    
    const createdEstablishments = [];
    for (const estData of establishmentsData) {
      // Check if exists
      const [existing] = await db.select()
        .from(establishments)
        .where(eq(establishments.email, estData.email));
      
      if (!existing) {
        const [newEst] = await db.insert(establishments).values(estData).returning();
        createdEstablishments.push(newEst);
      } else {
        createdEstablishments.push(existing);
      }
    }
    
    // Create perks for each establishment
    const perksData = [
      // La Parrillada
      { est: 0, title: '20% off dinner', description: '20% discount on all dinner orders', type: 'discount', value: '20', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
      { est: 0, title: 'Free appetizer', description: 'Complimentary appetizer with any main course', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop' },
      
      // Sakura Sushi
      { est: 1, title: '15% off sushi', description: '15% discount on all sushi rolls', type: 'discount', value: '15', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
      { est: 1, title: 'Free green tea', description: 'Complimentary green tea with your meal', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop' },
      
      // Mofongo House
      { est: 2, title: 'Buy 1 get 1', description: 'Buy one mofongo, get one free', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
      { est: 2, title: 'Happy hour', description: '2-for-1 drinks during happy hour (4-7pm)', type: 'discount', value: '50', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop' },
      
      // Rooftop Lounge
      { est: 3, title: '2-for-1 cocktails', description: 'Two cocktails for the price of one', type: 'discount', value: '50', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop' },
      { est: 3, title: 'VIP access', description: 'Skip the line with VIP entrance', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
      
      // Café Colonial
      { est: 4, title: 'Free pastry', description: 'Free pastry with any coffee order', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
      { est: 4, title: 'Loyalty points', description: 'Earn double points on every purchase', type: 'points', value: '200', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop' },
      
      // Pizza Napoli
      { est: 5, title: '10% off', description: '10% discount on all pizzas', type: 'discount', value: '10', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop' },
      { est: 5, title: 'Free delivery', description: 'Free delivery on orders over RD$500', type: 'freebie', value: '0', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop' },
    ];
    
    const createdPerks = [];
    for (const perkData of perksData) {
      const establishment = createdEstablishments[perkData.est];
      const [newPerk] = await db.insert(perksTable).values({
        establishmentId: establishment.id,
        title: perkData.title,
        description: perkData.description,
        type: perkData.type,
        value: perkData.value,
        image: perkData.image,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxRedemptions: perkData.type === 'freebie' ? 100 : null,
      }).returning();
      createdPerks.push(`${establishment.businessName}: ${newPerk.title}`);
    }
    
    res.json({ 
      success: true, 
      message: `Created ${createdEstablishments.length} establishments and ${createdPerks.length} perks`,
      establishments: createdEstablishments.map(e => e.businessName),
      perks: createdPerks
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY: Seed perks for La Parrillada
router.post('/admin/seed-perks-temp', async (req: Request, res: Response) => {
  try {
    const { perks: perksTable } = await import('../shared/schema.js');
    
    // Get La Parrillada establishment
    const [laParrillada] = await db.select()
      .from(establishments)
      .where(eq(establishments.email, 'laparrillada@example.com'));
    
    if (!laParrillada) {
      return res.status(404).json({ error: 'La Parrillada establishment not found' });
    }
    
    // Delete existing perks for clean slate
    await db.delete(perksTable).where(eq(perksTable.establishmentId, laParrillada.id));
    
    // Create 5 real perks
    const perksToCreate = [
      {
        establishmentId: laParrillada.id,
        title: '20% Off Weekend Special',
        description: 'Enjoy 20% off your entire bill every Saturday and Sunday. Valid for dine-in only.',
        type: 'discount',
        value: '20',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        maxRedemptions: 100,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Free Appetizer',
        description: 'Get a free appetizer of your choice with any main course order. One per table.',
        type: 'freebie',
        value: '0',
        image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        maxRedemptions: 50,
      },
      {
        establishmentId: laParrillada.id,
        title: '15% Cashback on Orders',
        description: 'Earn 15% cashback on all orders over RD$1,000. Cashback applied as TAPP points.',
        type: 'cashback',
        value: '15',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        maxRedemptions: null,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Double Points Monday',
        description: 'Earn 2X TAPP points on all purchases every Monday. Stack with other offers!',
        type: 'points',
        value: '200',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxRedemptions: null,
      },
      {
        establishmentId: laParrillada.id,
        title: 'Birthday Special 30% Off',
        description: 'Celebrate your birthday with us! Show your ID and get 30% off your meal. Valid birth month only.',
        type: 'discount',
        value: '30',
        image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxRedemptions: null,
      },
    ];
    
    const createdPerks = [];
    for (const perkData of perksToCreate) {
      const [newPerk] = await db.insert(perksTable).values(perkData).returning();
      createdPerks.push(newPerk.title);
    }
    
    res.json({ 
      success: true, 
      message: `Created ${createdPerks.length} perks for ${laParrillada.businessName}`,
      perks: createdPerks
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


// TEMPORARY: Update database schema (remove after running once)
router.post('/admin/update-schema-temp', async (req: Request, res: Response) => {
  try {
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const updateSQL = `
DROP TABLE IF EXISTS event_tickets CASCADE;
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"location" text,
	"capacity" integer,
	"current_attendees" integer DEFAULT 0 NOT NULL,
	"ticket_price" numeric(10, 2),
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_establishment_id_establishments_id_fk" 
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action
);

DROP TABLE IF EXISTS perk_redemptions CASCADE;
DROP TABLE IF EXISTS perks CASCADE;
CREATE TABLE "perks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"image" text,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perks_establishment_id_establishments_id_fk" 
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action
);

DROP TABLE IF EXISTS drop_claims CASCADE;
DROP TABLE IF EXISTS drops CASCADE;
CREATE TABLE "drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reward" text NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_value" text,
	"max_claims" integer,
	"current_claims" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drops_establishment_id_establishments_id_fk" 
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "event_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_tickets_event_id_events_id_fk" 
	FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "event_tickets_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "perk_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perk_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"establishment_id" uuid NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perk_redemptions_perk_id_perks_id_fk" 
	FOREIGN KEY ("perk_id") REFERENCES "public"."perks"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "perk_redemptions_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "perk_redemptions_establishment_id_establishments_id_fk" 
	FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "drop_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drop_claims_drop_id_drops_id_fk" 
	FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "drop_claims_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
`;

    await pool.query(updateSQL);
    await pool.end();
    
    res.json({ success: true, message: 'Database schema updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
