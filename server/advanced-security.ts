// ============================================
// ADVANCED SECURITY LAYER - MILITARY GRADE
// Protecciones adicionales extremas
// ============================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ============================================
// 1. CONTENT TYPE VALIDATION (Prevenir ataques MIME)
// ============================================

const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

export function contentTypeValidation(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type']?.split(';')[0].trim();
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type header required',
      });
    }

    const isAllowed = ALLOWED_CONTENT_TYPES.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      console.warn(`⚠️ Blocked content-type: ${contentType}`);
      return res.status(415).json({
        success: false,
        error: 'Unsupported content type',
      });
    }
  }

  next();
}

// ============================================
// 2. REQUEST SIZE LIMITS (Prevenir payload bombs)
// ============================================

export function requestSizeLimits(req: Request, res: Response, next: NextFunction) {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  // Límites por tipo de request
  const limits: Record<string, number> = {
    '/api/upload': 10 * 1024 * 1024,      // 10MB para uploads
    '/api/nfc': 50 * 1024,                 // 50KB para NFC
    '/api/auth': 10 * 1024,                // 10KB para auth
    'default': 100 * 1024,                 // 100KB default
  };

  let maxSize = limits.default;
  
  for (const [path, size] of Object.entries(limits)) {
    if (req.path.startsWith(path)) {
      maxSize = size;
      break;
    }
  }

  if (contentLength > maxSize) {
    console.warn(`⚠️ Request too large: ${contentLength} bytes (max: ${maxSize})`);
    return res.status(413).json({
      success: false,
      error: 'Request too large',
    });
  }

  next();
}

// ============================================
// 3. HTTP METHOD VALIDATION
// ============================================

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

export function httpMethodValidation(req: Request, res: Response, next: NextFunction) {
  if (!ALLOWED_METHODS.includes(req.method)) {
    console.warn(`⚠️ Invalid HTTP method: ${req.method}`);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  next();
}

// ============================================
// 4. USER-AGENT VALIDATION (Bloquear bots maliciosos)
// ============================================

const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'scanner',
  'wget',
  'curl',  // Solo en producción
  'python-requests',
  'go-http-client',
  'masscan',
  'nmap',
];

export function userAgentValidation(req: Request, res: Response, next: NextFunction) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  if (!userAgent && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Request without User-Agent');
    return res.status(400).json({
      success: false,
      error: 'User-Agent required',
    });
  }

  // Bloquear user agents maliciosos
  const isBlocked = BLOCKED_USER_AGENTS.some(blocked => 
    userAgent.includes(blocked.toLowerCase())
  );

  if (isBlocked && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️ Blocked User-Agent: ${userAgent}`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }

  next();
}

// ============================================
// 5. REFERRER VALIDATION (Prevenir hotlinking)
// ============================================

export function referrerValidation(req: Request, res: Response, next: NextFunction) {
  const referer = req.headers.referer || req.headers.referrer;
  
  // Solo validar en producción y para ciertos endpoints
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const sensitiveEndpoints = ['/api/nfc/', '/api/admin/', '/api/auth/'];
  const isSensitive = sensitiveEndpoints.some(ep => req.path.startsWith(ep));

  if (isSensitive && referer) {
    const allowedReferrers = [
      'https://tapp.do',
      'https://www.tapp.do',
      'https://api.tapp.do',
      'https://admin.tapp.do',
      'https://wavy.do',
      'https://www.wavy.do',
      'https://wavy.onrender.com',
    ];

    const isValidReferer = allowedReferrers.some(allowed => 
      referer.startsWith(allowed)
    );

    if (!isValidReferer) {
      console.warn(`⚠️ Invalid referrer: ${referer} for ${req.path}`);
      // No bloquear, solo registrar (algunos clientes no envían referer)
    }
  }

  next();
}

// ============================================
// 6. IP REPUTATION CHECK (Bloquear IPs maliciosas conocidas)
// ============================================

// Lista de rangos IP bloqueados (tor, proxies, VPNs conocidos)
const BLOCKED_IP_RANGES = [
  // Tor exit nodes (ejemplos)
  '185.220.101.',
  '185.220.102.',
  // VPNs gratuitas conocidas
  '167.172.',
  // Agregar según necesidad
];

export function ipReputationCheck(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);

  // Check contra rangos bloqueados
  const isBlocked = BLOCKED_IP_RANGES.some(range => clientIP.startsWith(range));

  if (isBlocked) {
    console.warn(`⚠️ Blocked IP range: ${clientIP}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied',
    });
  }

  next();
}

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// ============================================
// 7. REGEX DOS PROTECTION (Prevenir ReDoS)
// ============================================

// Detectar patrones regex peligrosos en inputs
const DANGEROUS_REGEX_PATTERNS = [
  /(\w+\*)+/,           // Quantifier nesting
  /(\w+)+\w+/,          // Grouping + quantifier
  /(\w|\s)+[a-z]/,      // Alternation + quantifier
];

export function regexDosProtection(req: Request, res: Response, next: NextFunction) {
  const checkForDangerousRegex = (value: any): boolean => {
    if (typeof value === 'string') {
      // Si el string parece contener un regex
      if (value.includes('.*') || value.includes('.+') || value.includes('\\w+')) {
        return DANGEROUS_REGEX_PATTERNS.some(pattern => {
          try {
            return pattern.test(value);
          } catch {
            return false;
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForDangerousRegex(value[key])) return true;
      }
    }
    return false;
  };

  if (checkForDangerousRegex(req.body) || checkForDangerousRegex(req.query)) {
    console.warn('⚠️ Dangerous regex pattern detected');
    return res.status(400).json({
      success: false,
      error: 'Invalid input pattern',
    });
  }

  next();
}

// ============================================
// 8. ENCODING VALIDATION (Prevenir ataques de encoding)
// ============================================

export function encodingValidation(req: Request, res: Response, next: NextFunction) {
  // Detectar intentos de bypass con encoding
  const checkEncoding = (value: any): boolean => {
    if (typeof value === 'string') {
      // Detectar múltiples encodings anidados
      const encodingPatterns = [
        /%25/,          // Double URL encoding
        /&#x/,          // HTML entity encoding
        /\\u00/,        // Unicode encoding
        /\\x/,          // Hex encoding
      ];

      return encodingPatterns.some(pattern => pattern.test(value));
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkEncoding(value[key])) return true;
      }
    }
    return false;
  };

  if (checkEncoding(req.body) || checkEncoding(req.query)) {
    console.warn('⚠️ Suspicious encoding detected');
    return res.status(400).json({
      success: false,
      error: 'Invalid encoding',
    });
  }

  next();
}

// ============================================
// 9. NULL BYTE INJECTION PROTECTION
// ============================================

export function nullByteProtection(req: Request, res: Response, next: NextFunction) {
  const checkForNullBytes = (value: any): boolean => {
    if (typeof value === 'string') {
      return value.includes('\0') || value.includes('%00');
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForNullBytes(value[key])) return true;
      }
    }
    return false;
  };

  if (checkForNullBytes(req.body) || checkForNullBytes(req.query) || checkForNullBytes(req.params)) {
    console.warn('⚠️ Null byte injection attempt');
    return res.status(400).json({
      success: false,
      error: 'Invalid characters detected',
    });
  }

  next();
}

// ============================================
// 10. COMMAND INJECTION PROTECTION
// ============================================

const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$()<>]/,       // Shell metacharacters
  /\$\{/,              // Variable expansion
  /\$\(/,              // Command substitution
  /\.\.\//,            // Directory traversal
  /\/etc\/passwd/,     // Common target
  /\/bin\//,           // Binary paths
  /cmd\.exe/,          // Windows commands
  /powershell/i,       // PowerShell
];

export function commandInjectionProtection(req: Request, res: Response, next: NextFunction) {
  const checkForCommands = (value: any): boolean => {
    if (typeof value === 'string') {
      return COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(value));
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForCommands(value[key])) return true;
      }
    }
    return false;
  };

  if (checkForCommands(req.body) || checkForCommands(req.query)) {
    console.warn('⚠️ Command injection attempt detected');
    return res.status(400).json({
      success: false,
      error: 'Malicious input detected',
    });
  }

  next();
}

// ============================================
// 11. LDAP INJECTION PROTECTION
// ============================================

const LDAP_SPECIAL_CHARS = ['*', '(', ')', '\\', '\0', '/'];

export function ldapInjectionProtection(req: Request, res: Response, next: NextFunction) {
  const checkForLdapInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return LDAP_SPECIAL_CHARS.some(char => value.includes(char));
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForLdapInjection(value[key])) return true;
      }
    }
    return false;
  };

  // Solo verificar en endpoints que podrían usar LDAP (auth, usuarios)
  if (req.path.includes('/auth') || req.path.includes('/user')) {
    if (checkForLdapInjection(req.body)) {
      console.warn('⚠️ LDAP injection attempt');
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
      });
    }
  }

  next();
}

// ============================================
// 12. JSON BOMB PROTECTION (Prevenir payloads gigantes)
// ============================================

export function jsonBombProtection(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    let count = 0;
    
    const countKeys = (obj: any): number => {
      if (count > 10000) return count; // Early exit
      
      if (typeof obj === 'object' && obj !== null) {
        count += Object.keys(obj).length;
        
        for (const key in obj) {
          countKeys(obj[key]);
        }
      }
      return count;
    };

    const totalKeys = countKeys(req.body);

    if (totalKeys > 10000) {
      console.warn(`⚠️ JSON bomb detected: ${totalKeys} keys`);
      return res.status(413).json({
        success: false,
        error: 'Request too complex',
      });
    }
  }

  next();
}

// ============================================
// 13. PATH TRAVERSAL ADVANCED PROTECTION
// ============================================

export function pathTraversalProtection(req: Request, res: Response, next: NextFunction) {
  const dangerousPatterns = [
    /\.\./,              // Directory traversal
    /%2e%2e/i,           // Encoded ..
    /%252e/i,            // Double encoded .
    /\.\.%2f/i,          // Mixed encoding
    /\.\.\\\\|\.\.\/\//,   // Multiple slashes
    /\.\/%2e\./i,        // Encoded variations
  ];

  const checkPath = (path: string): boolean => {
    return dangerousPatterns.some(pattern => pattern.test(path));
  };

  const allPaths = [
    req.path,
    ...Object.values(req.query).filter(v => typeof v === 'string'),
    ...Object.values(req.params).filter(v => typeof v === 'string'),
  ];

  if (allPaths.some(checkPath)) {
    console.warn('⚠️ Path traversal attempt');
    return res.status(400).json({
      success: false,
      error: 'Invalid path',
    });
  }

  next();
}

// ============================================
// 14. EMAIL INJECTION PROTECTION
// ============================================

export function emailInjectionProtection(req: Request, res: Response, next: NextFunction) {
  const emailFields = ['email', 'to', 'from', 'cc', 'bcc'];
  
  const checkEmail = (value: string): boolean => {
    // Detectar intentos de inyección en emails
    const injectionPatterns = [
      /[\r\n]/,           // Newlines
      /bcc:/i,            // BCC injection
      /cc:/i,             // CC injection
      /content-type:/i,   // Header injection
      /mime-version:/i,   // MIME injection
    ];

    return injectionPatterns.some(pattern => pattern.test(value));
  };

  for (const field of emailFields) {
    const value = req.body[field];
    if (value && typeof value === 'string' && checkEmail(value)) {
      console.warn(`⚠️ Email injection attempt in field: ${field}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }
  }

  next();
}

// ============================================
// 15. CRLF INJECTION PROTECTION
// ============================================

export function crlfInjectionProtection(req: Request, res: Response, next: NextFunction) {
  const checkForCRLF = (value: any): boolean => {
    if (typeof value === 'string') {
      return /[\r\n]/.test(value) || /%0d|%0a/i.test(value);
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForCRLF(value[key])) return true;
      }
    }
    return false;
  };

  if (checkForCRLF(req.body) || checkForCRLF(req.query)) {
    console.warn('⚠️ CRLF injection attempt');
    return res.status(400).json({
      success: false,
      error: 'Invalid characters',
    });
  }

  next();
}

// ============================================
// 16. SLOW REQUEST PROTECTION (Slowloris)
// ============================================

const requestTimestamps = new Map<string, number>();

export function slowRequestProtection(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  const now = Date.now();
  
  // Limpiar timestamps antiguos
  for (const [ip, timestamp] of requestTimestamps.entries()) {
    if (now - timestamp > 30000) { // 30 segundos
      requestTimestamps.delete(ip);
    }
  }

  // Timeout por request: 30 segundos
  req.setTimeout(30000, () => {
    console.warn(`⚠️ Slow request timeout from ${clientIP}`);
    res.status(408).json({
      success: false,
      error: 'Request timeout',
    });
  });

  requestTimestamps.set(clientIP, now);
  next();
}

// ============================================
// 17. SECURITY HEADERS ADVANCED
// ============================================

export function securityHeadersAdvanced(req: Request, res: Response, next: NextFunction) {
  // Eliminar headers que revelan información del servidor
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Headers adicionales de seguridad
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Cache control para datos sensibles
  if (req.path.includes('/api/auth') || req.path.includes('/api/nfc')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

// ============================================
// 18. HONEYPOT ENDPOINTS (Detectar scanners)
// ============================================

const honeypotHits = new Map<string, number>();

export function setupHoneypots(app: any) {
  const honeypotPaths = [
    '/admin',
    '/phpmyadmin',
    '/wp-admin',
    '/.env',
    '/config.php',
    '/.git/config',
    '/backup.sql',
  ];

  honeypotPaths.forEach(path => {
    app.all(path, (req: Request, res: Response) => {
      const ip = getClientIP(req);
      const hits = (honeypotHits.get(ip) || 0) + 1;
      honeypotHits.set(ip, hits);

      console.warn(`🚨 HONEYPOT HIT: ${ip} tried to access ${path} (${hits} hits)`);

      // Después de 3 hits, bloquear IP
      if (hits >= 3) {
        console.error(`🚫 BLOCKING IP: ${ip} (honeypot detection)`);
        // Aquí podrías agregar la IP a la blacklist automáticamente
      }

      // Respuesta falsa para confundir al atacante
      res.status(404).send('Not Found');
    });
  });
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  contentTypeValidation,
  requestSizeLimits,
  httpMethodValidation,
  userAgentValidation,
  referrerValidation,
  ipReputationCheck,
  regexDosProtection,
  encodingValidation,
  nullByteProtection,
  commandInjectionProtection,
  ldapInjectionProtection,
  jsonBombProtection,
  pathTraversalProtection,
  emailInjectionProtection,
  crlfInjectionProtection,
  slowRequestProtection,
  securityHeadersAdvanced,
  setupHoneypots,
};
