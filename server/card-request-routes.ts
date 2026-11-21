import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { cardRequests, cardIssueReports, users, nfcCards } from '../shared/schema.js';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Middleware to get authenticated user ID
const authMiddleware = (req: any, res: Response, next: Function) => {
  // Check session
  if (req.session?.userId) {
    req.authenticatedUserId = req.session.userId;
    return next();
  }
  
  // Check query parameter (for mobile) - ensure it's a string
  if (req.query.userId) {
    console.log('🔍 Query userId:', req.query.userId, 'Type:', typeof req.query.userId);
    const userId = Array.isArray(req.query.userId) 
      ? req.query.userId[0] 
      : req.query.userId;
    req.authenticatedUserId = String(userId);
    console.log('✅ Authenticated userId:', req.authenticatedUserId);
    return next();
  }
  
  console.log('❌ No userId found in session or query');
  return res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
};

router.use(authMiddleware);

// ============================================
// POST /api/cards/request - Submit card request
// ============================================
router.post('/request', async (req: any, res: Response) => {
  try {
    const userId = req.authenticatedUserId;
    
    const {
      fullName,
      dateOfBirth,
      idNumber,
      phoneNumber,
      address,
      city,
      postalCode,
      occupation,
      monthlyIncome,
      requestReason,
    } = req.body;

    console.log('📝 Card Request Received:');
    console.log('  User ID:', userId);
    console.log('  Full Name:', fullName);
    console.log('  Date of Birth:', dateOfBirth);
    console.log('  ID Number:', idNumber);
    console.log('  Phone:', phoneNumber);
    console.log('  Address:', address);
    console.log('  City:', city);
    console.log('  Postal Code:', postalCode);
    console.log('  Occupation:', occupation);
    console.log('  Monthly Income:', monthlyIncome);
    console.log('  Request Reason:', requestReason);

    // Validate required fields
    if (!fullName || !dateOfBirth || !idNumber || !phoneNumber || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already has a pending or approved request
    const [existingRequest] = await db
      .select()
      .from(cardRequests)
      .where(
        and(
          eq(cardRequests.userId, userId),
          eq(cardRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending card request'
      });
    }

    // Check if user already has a card
    const [existingCard] = await db
      .select()
      .from(nfcCards)
      .where(eq(nfcCards.userId, userId))
      .limit(1);

    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: 'You already have a card'
      });
    }

    // Create card request
    const [newRequest] = await db
      .insert(cardRequests)
      .values({
        userId,
        fullName,
        dateOfBirth,
        idNumber,
        phoneNumber,
        address,
        city,
        postalCode: postalCode || null,
        occupation: occupation || null,
        monthlyIncome: monthlyIncome || null,
        requestReason: requestReason || null,
        status: 'pending',
      })
      .returning();

    console.log('✅ Card request created in DB:');
    console.log('  ID:', newRequest.id);
    console.log('  Full Name:', newRequest.fullName);
    console.log('  Date of Birth:', newRequest.dateOfBirth);
    console.log('  ID Number:', newRequest.idNumber);
    console.log('  Phone:', newRequest.phoneNumber);
    console.log('  City:', newRequest.city);
    console.log('  Postal Code:', newRequest.postalCode);
    console.log('  Occupation:', newRequest.occupation);
    console.log('  Monthly Income:', newRequest.monthlyIncome);
    console.log('  Request Reason:', newRequest.requestReason);

    return res.json({
      success: true,
      request: newRequest
    });
  } catch (error: any) {
    console.error('Error creating card request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create card request'
    });
  }
});

// ============================================
// GET /api/cards/request-status - Get user's card request status
// ============================================
router.get('/request-status', async (req: any, res: Response) => {
  try {
    const userId = req.authenticatedUserId;

    console.log('🔍 Checking request status for user:', userId);

    const [request] = await db
      .select()
      .from(cardRequests)
      .where(eq(cardRequests.userId, userId))
      .orderBy(desc(cardRequests.createdAt))
      .limit(1);

    if (!request) {
      console.log('❌ No request found for user');
      return res.json({
        success: true,
        hasRequest: false,
        request: null
      });
    }

    console.log('✅ Request found:');
    console.log('   Status:', request.status);
    console.log('   Rejection Reason:', request.rejectionReason || (request as any).rejection_reason);

    return res.json({
      success: true,
      hasRequest: true,
      request: {
        id: request.id,
        status: request.status,
        rejectionReason: request.rejectionReason || (request as any).rejection_reason,
        createdAt: request.createdAt || (request as any).created_at,
        reviewedAt: request.reviewedAt || (request as any).reviewed_at,
      }
    });
  } catch (error: any) {
    console.error('Error fetching request status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch request status'
    });
  }
});

// ============================================
// POST /api/cards/report-issue - Report card issue
// ============================================
router.post('/report-issue', async (req: any, res: Response) => {
  try {
    const userId = req.authenticatedUserId;
    
    const {
      cardId,
      issueType,
      description,
      deviceModel,
      deviceOS,
      appVersion,
    } = req.body;

    // Validate required fields
    if (!cardId || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify card belongs to user
    const [card] = await db
      .select()
      .from(nfcCards)
      .where(
        and(
          eq(nfcCards.id, cardId),
          eq(nfcCards.userId, userId)
        )
      )
      .limit(1);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Create issue report
    const [newReport] = await db
      .insert(cardIssueReports)
      .values({
        cardId,
        userId,
        issueType,
        description,
        deviceModel: deviceModel || null,
        deviceOS: deviceOS || null,
        appVersion: appVersion || null,
        status: 'open',
      })
      .returning();

    return res.json({
      success: true,
      report: newReport
    });
  } catch (error: any) {
    console.error('Error creating issue report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create issue report'
    });
  }
});

export default router;
