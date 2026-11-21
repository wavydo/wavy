import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import { createServer as createHTTPServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import routes from './routes.js';
import tappRoutes from './tapp-routes.js';
import merchantRoutes from './merchant-routes.js';
import nfcRoutes from './nfc-routes.js';
import adminRoutes from './admin-routes.js';
import cardRequestRoutes from './card-request-routes.js';
import adminCardRoutes from './admin-card-routes.js';
import supportChatRoutes from './support-chat-routes.js';
import { initializeWebSocket } from './websocket.js';

// ============================================
// SECURITY IMPORTS - MILITARY LEVEL
// ============================================
import securityMiddleware from './security-middleware.js';
import advancedSecurity from './advanced-security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createHTTPServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize WebSocket
export const io = initializeWebSocket(httpServer);

// ============================================
// SECURITY MIDDLEWARE - RE-ENABLED
// ============================================

// LAYER 1: Advanced Security Headers
app.use(advancedSecurity.securityHeadersAdvanced);

// LAYER 2: Request ID tracking
app.use(securityMiddleware.requestIdMiddleware);

// LAYER 3: HTTPS redirect (production) - DISABLED FOR MOBILE APP DEVELOPMENT
// if (process.env.NODE_ENV === 'production') {
//   app.use(securityMiddleware.httpsRedirect);
// }

// LAYER 4-7: Skip strict validations in development
// app.use(advancedSecurity.httpMethodValidation);
// app.use(advancedSecurity.userAgentValidation);
// app.use(advancedSecurity.contentTypeValidation);
// app.use(advancedSecurity.requestSizeLimits);

// LAYER 8: Helmet (security headers)
app.use(securityMiddleware.helmetConfig);

// LAYER 9: CORS (strict origin control)
app.use(securityMiddleware.corsConfig);

// LAYER 10: General rate limiting (DDoS protection)
// DISABLED FOR DEVELOPMENT - RE-ENABLE IN PRODUCTION
// app.use(securityMiddleware.generalLimiter);

// LAYER 11-14: Skip in development
// app.use(securityMiddleware.ipBlacklist);
// app.use(advancedSecurity.ipReputationCheck);
// app.use(securityMiddleware.fraudDetection);
// app.use(advancedSecurity.slowRequestProtection);

// LAYER 15: Body parser
app.use(express.json());

// LAYER 16-17: Skip in development
// app.use(advancedSecurity.jsonBombProtection);
// app.use(securityMiddleware.sanitizeInput);

// LAYER 18: SQL injection check (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next(); // Skip all security checks for admin routes
  }
  return securityMiddleware.sqlInjectionCheck(req, res, next);
});

// LAYER 19: XSS protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return securityMiddleware.xssProtection(req, res, next);
});

// LAYER 20: Command Injection Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next(); // Skip command injection check for admin routes
  }
  return advancedSecurity.commandInjectionProtection(req, res, next);
});

// LAYER 21: Path Traversal Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.pathTraversalProtection(req, res, next);
});

// LAYER 22: Null Byte Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.nullByteProtection(req, res, next);
});

// LAYER 23: LDAP Injection Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.ldapInjectionProtection(req, res, next);
});

// LAYER 24: Email Injection Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.emailInjectionProtection(req, res, next);
});

// LAYER 25: CRLF Injection Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.crlfInjectionProtection(req, res, next);
});

// LAYER 26: Regex DoS Protection (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.regexDosProtection(req, res, next);
});

// LAYER 27: Encoding Validation (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.encodingValidation(req, res, next);
});

// LAYER 28: Referrer Validation (skip for admin routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return advancedSecurity.referrerValidation(req, res, next);
});

// LAYER 29: CSRF Protection (para formularios web)
// app.use(securityMiddleware.csrfProtection); // Activar cuando implementes CSRF tokens

// LAYER 30: Clickjacking Protection Avanzado
app.use(securityMiddleware.clickjackingProtection);

// LAYER 31: Subdomain Protection
app.use(securityMiddleware.subdomainProtection);

// LAYER 32: Open Redirect Protection
app.use(securityMiddleware.openRedirectProtection);

// LAYER 33: HTTP Parameter Pollution Protection
app.use(securityMiddleware.hppProtection);

// LAYER 34: SSRF Protection
app.use(securityMiddleware.ssrfProtection);

// LAYER 35: XXE Protection
app.use(securityMiddleware.xxeProtection);

// LAYER 36: Insecure Deserialization Protection
app.use(securityMiddleware.deserializationProtection);

// LAYER 37: Timing Attack Protection
app.use(securityMiddleware.timingAttackProtection);

// LAYER 38: Session Fixation Protection
app.use(securityMiddleware.sessionFixationProtection);

// LAYER 39: Credential Stuffing Protection
app.use(securityMiddleware.credentialStuffingProtection);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userType: 'user' | 'establishment' | 'admin';
  }
}

async function startServer() {
  try {
    const { startBot } = await import('./bot.js');
    startBot();
  } catch (error) {
    console.warn('Discord bot could not be started:', error);
  }
  
  // ============================================
  // SETUP HONEYPOTS (Detectar scanners automáticamente)
  // ============================================
  // advancedSecurity.setupHoneypots(app); // Disabled for admin panel development
  console.log('🍯 Honeypots deployed');
  
  // Mount all API routes
  // IMPORTANTE: Admin routes primero para evitar conflictos
  app.use('/api/admin', adminRoutes);
  app.use('/api', routes);
  app.use('/api', tappRoutes);
  app.use('/api/nfc', nfcRoutes);
  app.use('/api', merchantRoutes);
  
  // Import and mount card request routes FIRST (more specific routes)
  app.use('/api/cards', cardRequestRoutes);
  
  // Import and mount card management routes (general routes with :cardId)
  const cardManagementRoutes = (await import('./card-management-routes.js')).default;
  app.use('/api/cards', cardManagementRoutes);
  
  // Import and mount business routes
  const businessRoutes = (await import('./business-routes.js')).default;
  app.use('/api/business', businessRoutes);
  
  // Import and mount user dashboard routes
  const userDashboardRoutes = (await import('./user-dashboard-routes.js')).default;
  app.use('/api', userDashboardRoutes);
  
  // Import and mount profile routes
  const profileRoutes = (await import('./profile-routes.js')).default;
  app.use('/api', profileRoutes);
  
  // Import and mount transfer routes
  const transferRoutes = (await import('./transfer-routes.js')).default;
  app.use('/api/transfers', transferRoutes);
  
  // Import and mount split bill routes
  const splitRoutes = (await import('./routes/splits.js')).default;
  app.use('/api/splits', splitRoutes);
  
  // Import and mount admin transaction routes
  const adminTransactionRoutes = (await import('./admin-transaction-routes.js')).default;
  app.use('/api/admin/transactions', adminTransactionRoutes);
  
  // Import and mount admin user routes
  const adminUserRoutes = (await import('./admin-user-routes.js')).default;
  app.use('/api/admin/users', adminUserRoutes);
  
  // Import and mount admin query routes
  const adminQueryRoutes = (await import('./admin-query-routes.js')).default;
  app.use('/api/admin', adminQueryRoutes);
  
  // Import and mount admin card routes
  app.use('/api/admin', adminCardRoutes);
  
  // Import and mount user warnings routes
  const userWarningsRoutes = (await import('./user-warnings-routes.js')).default;
  app.use('/api', userWarningsRoutes);

  // Import and mount support chat routes
  const { setSocketIO } = await import('./support-chat-routes.js');
  setSocketIO(io);
  app.use('/api', supportChatRoutes);

  if (process.env.NODE_ENV === 'development') {
    // ===== CRITICAL: Redirect ALL business dashboard URLs to React =====
    // These must come BEFORE static file serving
    app.get('/company', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/index.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/perks', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/perks.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/events', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/events.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/drops', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/drops.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/customers', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/customers.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/analytics', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/analytics.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/campaigns', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/campaigns.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/settings', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/settings.html', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/rewards', (req, res) => res.redirect('/dashboard/establishment'));
    app.get('/company/rewards.html', (req, res) => res.redirect('/dashboard/establishment'));
    
    // Redirect main dashboard URL to React
    app.get('/dashboard', (req, res) => res.redirect('/dashboard/user'));
    app.get('/dashboard/', (req, res) => res.redirect('/dashboard/user'));
    
    // Redirect /dashboard/benefits to React app root (will be handled by React Router)
    app.get('/dashboard/benefits', (req, res, next) => {
      // Don't serve static file, pass to Vite
      next();
    });
    
    // Serve dashboard HTML files and assets
    app.use('/dashboard', express.static(path.join(__dirname, '../client/public/dashboard'), {
      extensions: ['html'],
    }));
    app.use('/dashboard-standalone.html', express.static(path.join(__dirname, '../client/public/dashboard-standalone.html')));
    
    // Serve ONLY specific asset directories (not HTML files)
    app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));
    app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
    app.use('/js', express.static(path.join(__dirname, '../client/public/js')));
    app.use('/css', express.static(path.join(__dirname, '../client/public/css')));
    
    // Serve PNG images from public root (for logos, etc.)
    app.get('/*.png', (req, res, next) => {
      const filePath = path.join(__dirname, '../client/public', req.path);
      res.sendFile(filePath, (err) => {
        if (err) next();
      });
    });
    
    // Serve ad images for mobile app (with cache busting support)
    app.use('/api/ads', express.static(path.join(__dirname, 'public/ads'), {
      maxAge: 0, // No cache
      etag: false,
      lastModified: false
    }));
    
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'spa'
    });
    
    app.use(vite.middlewares);
  } else {
    // In production, serve the built frontend from client/dist
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`✨ TAPP Network API Ready`);
    console.log(`🔌 WebSocket Server Ready`);
    
    // Run card requests migration
    try {
      const { createCardRequestsTables } = await import('./migrations/create-card-requests.js');
      await createCardRequestsTables();
    } catch (error) {
      console.error('Migration error:', error);
    }
    
    // Run perk dates migration
    try {
      const { makePerkDatesOptional } = await import('./migrations/make-perk-dates-optional.js');
      await makePerkDatesOptional();
    } catch (error) {
      console.error('Migration error:', error);
    }
  });
}

startServer().catch(console.error);

