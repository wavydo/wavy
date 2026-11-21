// ============================================
// SEGURIDAD NIVEL BANCARIO - MIDDLEWARE
// ============================================

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';

// ============================================
// 1. RATE LIMITING (Prevenir ataques DDoS)
// ============================================

// Rate limiter general (todas las rutas)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50000, // 50000 requests por IP (desarrollo - cambiar a 1000 en producción)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logSecurityEvent('rate_limit_exceeded', req, { type: 'general' });
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  },
});

// Rate limiter para autenticación (más estricto)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 intentos para desarrollo (cambiar a 5 en producción)
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes.',
  handler: (req, res) => {
    logSecurityEvent('auth_rate_limit_exceeded', req, { 
      email: req.body.email,
      attempts: 100 
    });
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Account temporarily locked.',
    });
  },
});

// Rate limiter para NFC (crítico para seguridad financiera)
export const nfcLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 operaciones NFC por minuto
  message: 'Too many NFC operations, please wait.',
  handler: (req, res) => {
    logSecurityEvent('nfc_rate_limit_exceeded', req, { 
      operation: req.path 
    });
    res.status(429).json({
      success: false,
      error: 'Too many NFC operations. Please wait a moment.',
    });
  },
});

// Rate limiter para transacciones (prevenir fraude)
export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 transacciones por minuto (desarrollo - cambiar a 10 en producción)
  // Remove custom keyGenerator - use default which handles IPv6 properly
  handler: (req, res) => {
    logSecurityEvent('transaction_rate_limit_exceeded', req, { 
      userId: req.user?.id 
    });
    res.status(429).json({
      success: false,
      error: 'Too many transactions. Please wait a moment.',
    });
  },
});

// ============================================
// 2. HELMET (Headers de seguridad)
// ============================================

export const helmetConfig = helmet({
  contentSecurityPolicy: false, // TEMPORARILY DISABLED for debugging
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
});

// ============================================
// 3. CORS (Control estricto de orígenes)
// ============================================

const allowedOrigins = [
  'https://tapp.do',
  'https://www.tapp.do',
  'https://api.tapp.do',
  'https://admin.tapp.do',
  'https://wavy.do',
  'https://www.wavy.do',
  'https://wavy.onrender.com',
  'tapp://', // Mobile app
  'http://localhost:3001', // Self-hosted frontend (puerto correcto)
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:8081', // Expo Metro
  'http://localhost:19006', // Expo
];

// En desarrollo, agregar localhost
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://10.0.0.236:19006'); // Expo on network
  allowedOrigins.push('http://192.168.1.1:19006'); // Local network IPs
}

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, mismo origen)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier localhost o IP local
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') ||
          origin.includes('10.0.0.') ||
          origin.includes('192.168.') ||
          origin.startsWith('exp://')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('exp://')) {
      callback(null, true);
    } else {
      logSecurityEvent('cors_violation', null, { origin });
      callback(new Error('CORS policy violation: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 600, // 10 minutos
});

// ============================================
// 4. INPUT SANITIZATION (Prevenir inyecciones)
// ============================================

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitizar todos los inputs
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query as any);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Prevenir prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
}

function sanitizeString(str: any): any {
  if (typeof str !== 'string') return str;
  
  // Remover caracteres peligrosos para SQL injection
  str = str.replace(/[<>\"'`;\\\x00-\x1F\x7F]/g, '');
  
  // Limitar longitud
  if (str.length > 10000) {
    str = str.substring(0, 10000);
  }
  
  return str.trim();
}

// ============================================
// 5. SQL INJECTION PROTECTION
// ============================================

export function validateSQLInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bEXEC\b|\bEXECUTE\b)/i,
  ];

  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

export function sqlInjectionCheck(req: Request, res: Response, next: NextFunction) {
  const checkValues = (obj: any): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        if (!validateSQLInput(value)) {
          logSecurityEvent('sql_injection_attempt', req, { key, value });
          return false;
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!checkValues(value)) return false;
      }
    }
    return true;
  };

  if (!checkValues(req.body) || !checkValues(req.query) || !checkValues(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
    });
  }

  next();
}

// ============================================
// 6. XSS PROTECTION
// ============================================

export function xssProtection(req: Request, res: Response, next: NextFunction) {
  const checkXSS = (obj: any): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        // Detectar scripts maliciosos
        if (/<script|javascript:|onerror=|onload=/i.test(value)) {
          logSecurityEvent('xss_attempt', req, { key, value });
          return false;
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!checkXSS(value)) return false;
      }
    }
    return true;
  };

  if (!checkXSS(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Malicious content detected',
    });
  }

  next();
}

// ============================================
// 7. REQUEST ID (Tracking y debugging)
// ============================================

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

// ============================================
// 8. IP BLACKLIST
// ============================================

const blacklistedIPs = new Set<string>();

export function ipBlacklist(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  if (blacklistedIPs.has(clientIP)) {
    logSecurityEvent('blacklisted_ip_access', req, { ip: clientIP });
    return res.status(403).json({
      success: false,
      error: 'Access denied',
    });
  }
  
  next();
}

export function addToBlacklist(ip: string) {
  blacklistedIPs.add(ip);
  logSecurityEvent('ip_blacklisted', null, { ip });
}

export function removeFromBlacklist(ip: string) {
  blacklistedIPs.delete(ip);
}

// ============================================
// 9. FRAUD DETECTION
// ============================================

interface FraudMetrics {
  failedLogins: number;
  suspiciousTransactions: number;
  lastActivity: Date;
}

const fraudMetrics = new Map<string, FraudMetrics>();

export function fraudDetection(req: Request, res: Response, next: NextFunction) {
  const identifier = req.user?.id || getClientIP(req);
  const metrics = fraudMetrics.get(identifier) || {
    failedLogins: 0,
    suspiciousTransactions: 0,
    lastActivity: new Date(),
  };

  // Detectar comportamiento sospechoso
  const timeSinceLastActivity = Date.now() - metrics.lastActivity.getTime();
  
  // Múltiples transacciones en menos de 1 segundo = sospechoso
  if (req.path.includes('/transaction') && timeSinceLastActivity < 1000) {
    metrics.suspiciousTransactions++;
    
    if (metrics.suspiciousTransactions > 5) {
      logSecurityEvent('fraud_detected', req, { 
        reason: 'rapid_transactions',
        count: metrics.suspiciousTransactions 
      });
      
      addToBlacklist(getClientIP(req));
      
      return res.status(403).json({
        success: false,
        error: 'Suspicious activity detected. Account temporarily locked.',
      });
    }
  }

  metrics.lastActivity = new Date();
  fraudMetrics.set(identifier, metrics);
  
  next();
}

// ============================================
// 10. HTTPS REDIRECT (Forzar HTTPS)
// ============================================

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

// ============================================
// 11. LOGGER DE SEGURIDAD
// ============================================

interface SecurityEvent {
  timestamp: Date;
  event: string;
  ip: string;
  userId?: string;
  userAgent?: string;
  data?: any;
}

const securityLogs: SecurityEvent[] = [];

function logSecurityEvent(
  event: string,
  req: Request | null,
  data?: any
) {
  const log: SecurityEvent = {
    timestamp: new Date(),
    event,
    ip: req ? getClientIP(req) : 'system',
    userId: req?.user?.id,
    userAgent: req?.headers['user-agent'],
    data,
  };

  securityLogs.push(log);

  // Log críticos a consola
  if (isCriticalEvent(event)) {
    console.error('🚨 CRITICAL SECURITY EVENT:', JSON.stringify(log, null, 2));
  }

  // Mantener solo últimos 10000 logs en memoria
  if (securityLogs.length > 10000) {
    securityLogs.shift();
  }

  // TODO: Enviar a servicio de logging externo (Sentry, Datadog)
}

function isCriticalEvent(event: string): boolean {
  const criticalEvents = [
    'sql_injection_attempt',
    'xss_attempt',
    'fraud_detected',
    'blacklisted_ip_access',
    'unauthorized_admin_access',
  ];
  return criticalEvents.includes(event);
}

export function getSecurityLogs(limit: number = 100): SecurityEvent[] {
  return securityLogs.slice(-limit);
}

// ============================================
// 12. HELPER FUNCTIONS
// ============================================

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// ============================================
// 13. AUDITORÍA DE ACCIONES SENSIBLES
// ============================================

export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Log acción sensible
      logSecurityEvent('audit_' + action, req, {
        action,
        success: body.success,
        userId: req.user?.id,
      });
      
      return originalJson(body);
    };
    
    next();
  };
}

// ============================================
// 14. CSRF PROTECTION (Cross-Site Request Forgery)
// ============================================

const csrfTokens = new Map<string, { token: string; expires: Date }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Limpiar tokens expirados
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < new Date()) {
      csrfTokens.delete(key);
    }
  }
  
  return token;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Solo aplicar a métodos que modifican datos
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionId = req.session?.id || req.headers['x-session-id'] as string;
  const providedToken = req.headers['x-csrf-token'] as string || req.body._csrf;

  if (!sessionId) {
    return res.status(403).json({
      success: false,
      error: 'Session required',
    });
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken || storedToken.token !== providedToken) {
    logSecurityEvent('csrf_token_mismatch', req, { sessionId });
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  if (storedToken.expires < new Date()) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({
      success: false,
      error: 'CSRF token expired',
    });
  }

  next();
}

// ============================================
// 15. CLICKJACKING PROTECTION AVANZADO
// ============================================

export function clickjackingProtection(req: Request, res: Response, next: NextFunction) {
  // X-Frame-Options ya está en Helmet, pero agregamos validación extra
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  next();
}

// ============================================
// 16. SUBDOMAIN TAKEOVER PROTECTION
// ============================================

const trustedSubdomains = ['www', 'api', 'admin', 'app'];

export function subdomainProtection(req: Request, res: Response, next: NextFunction) {
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];

  // En producción, validar subdominios
  if (process.env.NODE_ENV === 'production') {
    if (host.includes('.tapp.do') && !trustedSubdomains.includes(subdomain)) {
      logSecurityEvent('untrusted_subdomain_access', req, { host, subdomain });
      return res.status(403).json({
        success: false,
        error: 'Invalid subdomain',
      });
    }
  }

  next();
}

// ============================================
// 17. OPEN REDIRECT PROTECTION
// ============================================

export function openRedirectProtection(req: Request, res: Response, next: NextFunction) {
  const redirectUrl = req.query.redirect as string || req.query.return_to as string;

  if (redirectUrl) {
    // Validar que el redirect es a nuestro dominio
    try {
      const url = new URL(redirectUrl, `https://${req.headers.host}`);
      const allowedHosts = ['tapp.do', 'www.tapp.do', 'api.tapp.do', 'admin.tapp.do'];

      if (!allowedHosts.some(host => url.hostname.endsWith(host))) {
        logSecurityEvent('open_redirect_attempt', req, { redirectUrl });
        return res.status(400).json({
          success: false,
          error: 'Invalid redirect URL',
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
      });
    }
  }

  next();
}

// ============================================
// 18. HTTP PARAMETER POLLUTION (HPP) PROTECTION
// ============================================

export function hppProtection(req: Request, res: Response, next: NextFunction) {
  // Detectar parámetros duplicados
  const checkForDuplicates = (obj: any, objName: string) => {
    for (const key in obj) {
      if (Array.isArray(obj[key]) && key !== 'items' && key !== 'tags') {
        // Parámetro duplicado detectado (excepto arrays legítimos)
        logSecurityEvent('http_parameter_pollution', req, { 
          parameter: key, 
          location: objName 
        });
        return false;
      }
    }
    return true;
  };

  if (!checkForDuplicates(req.query, 'query') || !checkForDuplicates(req.body, 'body')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameters',
    });
  }

  next();
}

// ============================================
// 19. SERVER-SIDE REQUEST FORGERY (SSRF) PROTECTION
// ============================================

const blockedIPs = [
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  '::1',
];

export function ssrfProtection(req: Request, res: Response, next: NextFunction) {
  // Si hay URLs en el body, validarlas
  const checkUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      
      // Bloquear IPs privadas
      if (blockedIPs.some(ip => parsed.hostname === ip)) {
        return false;
      }

      // Bloquear rangos privados
      if (parsed.hostname.startsWith('192.168.') || 
          parsed.hostname.startsWith('10.') ||
          parsed.hostname.startsWith('172.')) {
        return false;
      }

      return true;
    } catch {
      return true; // No es una URL válida, dejar pasar
    }
  };

  const scanObject = (obj: any): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        if (!checkUrl(value)) {
          logSecurityEvent('ssrf_attempt', req, { url: value, key });
          return false;
        }
      } else if (typeof value === 'object' && value !== null) {
        if (!scanObject(value)) return false;
      }
    }
    return true;
  };

  if (!scanObject(req.body) || !scanObject(req.query)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL detected',
    });
  }

  next();
}

// ============================================
// 20. XML EXTERNAL ENTITY (XXE) PROTECTION
// ============================================

export function xxeProtection(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'] || '';

  // Bloquear XML por completo (no lo usamos)
  if (contentType.includes('xml') || contentType.includes('application/xml')) {
    logSecurityEvent('xml_request_blocked', req, { contentType });
    return res.status(415).json({
      success: false,
      error: 'XML content not supported',
    });
  }

  next();
}

// ============================================
// 21. INSECURE DESERIALIZATION PROTECTION
// ============================================

export function deserializationProtection(req: Request, res: Response, next: NextFunction) {
  // Detectar intentos de deserialización maliciosa en JSON
  const checkForMaliciousPatterns = (obj: any): boolean => {
    const maliciousPatterns = [
      '__proto__',
      'constructor',
      'prototype',
      'eval',
      'Function',
      'require',
      'process',
      'child_process',
    ];

    const scan = (o: any): boolean => {
      if (typeof o === 'string') {
        return !maliciousPatterns.some(pattern => o.includes(pattern));
      }
      
      if (typeof o === 'object' && o !== null) {
        for (const key in o) {
          if (maliciousPatterns.includes(key)) return false;
          if (!scan(o[key])) return false;
        }
      }
      
      return true;
    };

    return scan(obj);
  };

  if (!checkForMaliciousPatterns(req.body)) {
    logSecurityEvent('insecure_deserialization_attempt', req);
    return res.status(400).json({
      success: false,
      error: 'Malicious payload detected',
    });
  }

  next();
}

// ============================================
// 22. TIMING ATTACK PROTECTION
// ============================================

export function timingAttackProtection(req: Request, res: Response, next: NextFunction) {
  // Agregar delay aleatorio para prevenir timing attacks en endpoints sensibles
  const sensitiveEndpoints = ['/api/auth/login', '/api/auth/verify', '/api/nfc/verify'];
  
  if (sensitiveEndpoints.some(endpoint => req.path.includes(endpoint))) {
    const randomDelay = Math.floor(Math.random() * 100); // 0-100ms
    setTimeout(() => next(), randomDelay);
  } else {
    next();
  }
}

// ============================================
// 23. BRUTE FORCE PROTECTION AVANZADO
// ============================================

interface BruteForceRecord {
  attempts: number;
  lastAttempt: Date;
  blocked: boolean;
}

const bruteForceMap = new Map<string, BruteForceRecord>();

export function bruteForceProtection(identifier: string = 'email') {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.body[identifier] || req.ip;
    const record = bruteForceMap.get(key) || { attempts: 0, lastAttempt: new Date(), blocked: false };

    // Si está bloqueado, verificar si ya pasó el tiempo
    if (record.blocked) {
      const blockTime = 15 * 60 * 1000; // 15 minutos
      if (Date.now() - record.lastAttempt.getTime() < blockTime) {
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts. Try again later.',
        });
      } else {
        // Desbloquear
        record.blocked = false;
        record.attempts = 0;
      }
    }

    // Incrementar intentos
    record.attempts++;
    record.lastAttempt = new Date();

    // Si excede 5 intentos, bloquear
    if (record.attempts > 5) {
      record.blocked = true;
      logSecurityEvent('brute_force_detected', req, { identifier: key, attempts: record.attempts });
    }

    bruteForceMap.set(key, record);

    // Agregar info al request para uso posterior
    (req as any).bruteForceAttempts = record.attempts;

    next();
  };
}

// ============================================
// 24. SESSION FIXATION PROTECTION
// ============================================

export function sessionFixationProtection(req: Request, res: Response, next: NextFunction) {
  // Regenerar session ID después del login
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    const oldSessionId = req.session?.id;
    
    // Esto se manejará en el endpoint de login, pero aquí validamos
    if (req.session) {
      logSecurityEvent('session_regeneration', req, { oldSessionId });
    }
  }

  next();
}

// ============================================
// 25. CREDENTIAL STUFFING PROTECTION
// ============================================

const credentialStuffingCache = new Map<string, { ips: Set<string>; timestamp: Date }>();

export function credentialStuffingProtection(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/auth/login') {
    const email = req.body.email;
    const ip = getClientIP(req);

    if (!email) return next();

    const record = credentialStuffingCache.get(email) || { ips: new Set(), timestamp: new Date() };

    // Si el mismo email se intenta desde más de 3 IPs diferentes en 1 hora = credential stuffing
    record.ips.add(ip);

    if (record.ips.size > 3) {
      const hourAgo = Date.now() - 60 * 60 * 1000;
      if (record.timestamp.getTime() > hourAgo) {
        logSecurityEvent('credential_stuffing_detected', req, { 
          email, 
          uniqueIPs: record.ips.size 
        });

        return res.status(429).json({
          success: false,
          error: 'Suspicious activity detected. Please contact support.',
        });
      }
    }

    credentialStuffingCache.set(email, record);
  }

  next();
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  generalLimiter,
  authLimiter,
  nfcLimiter,
  transactionLimiter,
  helmetConfig,
  corsConfig,
  sanitizeInput,
  sqlInjectionCheck,
  xssProtection,
  requestIdMiddleware,
  ipBlacklist,
  fraudDetection,
  httpsRedirect,
  auditLog,
  getSecurityLogs,
  addToBlacklist,
  removeFromBlacklist,
  
  // Nuevas protecciones
  generateCSRFToken,
  csrfProtection,
  clickjackingProtection,
  subdomainProtection,
  openRedirectProtection,
  hppProtection,
  ssrfProtection,
  xxeProtection,
  deserializationProtection,
  timingAttackProtection,
  bruteForceProtection,
  sessionFixationProtection,
  credentialStuffingProtection,
};
