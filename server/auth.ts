import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend session to include user info
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userType: 'user' | 'establishment' | 'admin';
  }
}

// Extend Request to include user info from JWT
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: 'user' | 'establishment' | 'admin';
      };
    }
  }
}

// Middleware to check if user is authenticated (supports both session and JWT)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check JWT token first (for mobile app with tokens)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        type: decoded.type || 'user'
      };
      // Also set session for compatibility
      req.session.userId = decoded.userId;
      req.session.userType = decoded.type || 'user';
      
      console.log('✅ JWT auth successful:', {
        userId: decoded.userId,
        type: decoded.type,
        email: decoded.email
      });
      
      return next();
    } catch (error) {
      console.error('❌ JWT verification failed:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Check userId in query param (fallback for React Native without cookies)
  // Note: This should not override JWT if present
  if (req.query.userId && !req.user) {
    req.session.userId = req.query.userId as string;
    // Don't assume type, let session handle it
    return next();
  }
  
  // Fallback to session (for web)
  if (req.session.userId) {
    req.user = {
      id: req.session.userId,
      email: '', // Email not available in session
      type: req.session.userType || 'user'
    };
    return next();
  }
  
  return res.status(401).json({ error: 'No autenticado' });
}

// Middleware to check account suspension
export async function checkSuspension(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId && !req.user) {
    return next();
  }

  try {
    const { pool } = await import('./db.js');
    const userId = req.session.userId || req.user?.id;
    
    const result = await pool.query(
      'SELECT account_suspended, suspension_reason, suspension_date FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length > 0 && result.rows[0].account_suspended) {
      return res.status(403).json({ 
        error: 'Account suspended',
        suspended: true,
        suspensionReason: result.rows[0].suspension_reason,
        suspensionDate: result.rows[0].suspension_date
      });
    }

    next();
  } catch (error) {
    console.error('Suspension check error:', error);
    next();
  }
}

// Middleware to check if user is an establishment
export function requireEstablishment(req: Request, res: Response, next: NextFunction) {
  // First, ensure authentication
  requireAuth(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }
    
    // Now check if it's an establishment
    const userType = req.user?.type || req.session.userType;
    
    console.log('🔒 requireEstablishment check:', {
      userId: req.session?.userId || req.user?.id,
      userType,
      hasSession: !!req.session,
      hasUser: !!req.user,
      path: req.path,
    });
    
    if (userType === 'establishment' || userType === 'admin') {
      console.log('✅ Establishment access granted');
      return next();
    }
    
    console.log('❌ Establishment access denied');
    return res.status(403).json({ error: 'Forbidden - Establishment access only' });
  });
}

// Middleware to check if user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First, ensure authentication
  requireAuth(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }
    
    // Now check if it's an admin
    const userType = req.user?.type || req.session.userType;
    
    console.log('🔒 requireAdmin check:', {
      userId: req.session?.userId || req.user?.id,
      userType,
      hasSession: !!req.session,
      hasUser: !!req.user,
      path: req.path,
    });
    
    if (userType === 'admin') {
      console.log('✅ Admin access granted');
      return next();
    }
    
    console.log('❌ Admin access denied');
    return res.status(403).json({ error: 'Forbidden - Admin access only' });
  });
}

// Middleware to check if user is a regular user
export function requireUser(req: Request, res: Response, next: NextFunction) {
  // First, ensure authentication
  requireAuth(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }
    
    // Now check if it's a regular user
    const userType = req.user?.type || req.session.userType;
    
    if (userType === 'user') {
      return next();
    }
    
    // Authenticated but wrong type
    return res.status(403).json({ error: 'Forbidden - User access only' });
  });
}

// Middleware to check if user is a regular user OR establishment (for support chat)
export function requireUserOrEstablishment(req: Request, res: Response, next: NextFunction) {
  // First, ensure authentication
  requireAuth(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }
    
    // Now check if it's a regular user or establishment
    const userType = req.user?.type || req.session.userType;
    
    console.log('🔒 requireUserOrEstablishment check:', {
      userId: req.session?.userId || req.user?.id,
      userType,
      path: req.path,
    });
    
    if (userType === 'user' || userType === 'establishment') {
      console.log('✅ User/Establishment access granted');
      return next();
    }
    
    // Authenticated but wrong type
    console.log('❌ User/Establishment access denied');
    return res.status(403).json({ error: 'Forbidden - User or Business access only' });
  });
}
