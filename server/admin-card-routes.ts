import { Router, Request, Response } from 'express';
import { db } from './storage.js';
import { cardRequests, nfcCards, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// ============================================
// POST /api/admin/card-requests/:id/approve
// ============================================
router.post('/card-requests/:id/approve', async (req: any, res: Response) => {
  try {
    const requestId = req.params.id;
    const adminId = req.session?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const {
      pin,
      dailyLimit,
      monthlyLimit,
    } = req.body;

    // Validate required fields
    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required'
      });
    }

    // Get card request with user email (JOIN con users)
    const [requestData] = await db
      .select({
        request: cardRequests,
        userEmail: users.email,
      })
      .from(cardRequests)
      .leftJoin(users, eq(cardRequests.userId, users.id))
      .where(eq(cardRequests.id, requestId))
      .limit(1);

    if (!requestData || !requestData.request) {
      return res.status(404).json({
        success: false,
        message: 'Card request not found'
      });
    }

    const request = requestData.request;
    const userEmail = requestData.userEmail;

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Card request has already been processed'
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Generate card details automatically
    const cardNumber = '4' + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
    const cvv = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
    const expiryYear = new Date().getFullYear() + 3;
    const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expiryDate = `${expiryMonth}/${String(expiryYear).slice(-2)}`;
    
    // Generate NFC security fields
    const nfcToken = crypto.randomBytes(16).toString('hex');
    const cardUID = crypto.randomBytes(8).toString('hex'); // Simulated NFC UID
    const cardUIDHash = crypto.createHash('sha256').update(cardUID).digest('hex');
    const encryptionIV = crypto.randomBytes(16).toString('hex');
    const cardUIDEncrypted = crypto.randomBytes(32).toString('hex'); // Simulated encrypted UID
    const cardToken = crypto.randomBytes(16).toString('hex');

    // Create NFC card
    const cardId = crypto.randomUUID();
    const [newCard] = await db
      .insert(nfcCards)
      .values({
        id: cardId,
        userId: request.userId,
        userEmail: userEmail,
        cardNumber,
        cardholderName: request.fullName,
        expiryDate,
        cvv,
        cardPin: pin,
        // NFC Security fields
        cardUIDHash,
        cardUIDEncrypted,
        encryptionIV,
        cardToken,
        token: nfcToken,
        // Limits
        dailyLimit: dailyLimit || '1000',
        monthlyLimit: monthlyLimit || '5000',
        isActive: true,
      })
      .returning();

    // Update card request status
    await db
      .update(cardRequests)
      .set({
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        cardId: cardId,
        reviewNotes: `Approved and issued by admin (${adminId})`
      })
      .where(eq(cardRequests.id, requestId));

    return res.json({
      success: true,
      card: newCard
    });
  } catch (error: any) {
    console.error('Error approving card request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve card request'
    });
  }
});

// ============================================
// POST /api/admin/card-requests/:id/reject
// ============================================
router.post('/card-requests/:id/reject', async (req: any, res: Response) => {
  try {
    const requestId = req.params.id;
    const adminId = req.session?.userId;

    console.log('🔍 Reject request - Admin ID from session:', adminId);
    console.log('🔍 Session data:', req.session);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get card request
    const [request] = await db
      .select()
      .from(cardRequests)
      .where(eq(cardRequests.id, requestId))
      .limit(1);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Card request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Card request has already been processed'
      });
    }

    // Update card request status
    await db
      .update(cardRequests)
      .set({
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        rejectionReason,
        reviewNotes: `Rejected by admin (${adminId}): ${rejectionReason}`
      })
      .where(eq(cardRequests.id, requestId));

    return res.json({
      success: true,
      message: 'Card request rejected'
    });
  } catch (error: any) {
    console.error('Error rejecting card request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject card request'
    });
  }
});

export default router;
