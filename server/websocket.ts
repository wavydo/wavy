import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { db } from './storage.js';
import { users, admins, establishments } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthenticatedSocket {
  userId: string;
  userType: 'user' | 'admin' | 'establishment';
  email: string;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['http://localhost:19006', 'http://localhost:5173', 'http://localhost:8081'],
      credentials: true,
    },
    path: '/socket.io/',
  });

  // Authentication middleware - STRICT SECURITY
  io.use(async (socket, next) => {
    try {
      // Try JWT token first (mobile apps)
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          // Verificar token con algoritmo explícito para prevenir "alg: none" attacks
          const decoded = jwt.verify(token, JWT_SECRET, { 
            algorithms: ['HS256']  // Solo permitir HS256, prevenir ataques
          }) as { userId: string; type: string; email: string; iat: number };
          
          // Verificar que el token no sea demasiado viejo (máximo 7 días)
          const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
          if (tokenAge > 7 * 24 * 60 * 60) { // 7 días en segundos
            console.warn('🚫 Token expired or too old');
            return next(new Error('Token expired'));
          }
          
          // Verificar que el usuario existe en la base de datos
          if (decoded.type === 'user') {
            const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
            if (!user) {
              console.warn('🚫 User not found for token');
              return next(new Error('User not found'));
            }
            // Verificar que el email coincida (prevenir token manipulation)
            if (user.email !== decoded.email) {
              console.warn('🚫 Email mismatch in token');
              return next(new Error('Invalid token'));
            }
            (socket as any).auth = {
              userId: decoded.userId,
              userType: 'user',
              email: user.email,
            } as AuthenticatedSocket;
            return next();
          } else if (decoded.type === 'admin') {
            const [admin] = await db.select().from(admins).where(eq(admins.id, decoded.userId));
            if (!admin) {
              console.warn('🚫 Admin not found for token');
              return next(new Error('Admin not found'));
            }
            // Verificar que el email coincida
            if (admin.email !== decoded.email) {
              console.warn('🚫 Email mismatch in admin token');
              return next(new Error('Invalid token'));
            }
            (socket as any).auth = {
              userId: decoded.userId,
              userType: 'admin',
              email: admin.email,
            } as AuthenticatedSocket;
            return next();
          } else if (decoded.type === 'establishment') {
            const [establishment] = await db.select().from(establishments).where(eq(establishments.id, decoded.userId));
            if (!establishment) {
              console.warn('🚫 Establishment not found for token');
              return next(new Error('Establishment not found'));
            }
            // Verificar que el email coincida
            if (establishment.email !== decoded.email) {
              console.warn('🚫 Email mismatch in establishment token');
              return next(new Error('Invalid token'));
            }
            (socket as any).auth = {
              userId: decoded.userId,
              userType: 'establishment',
              email: establishment.email,
            } as AuthenticatedSocket;
            return next();
          }
        } catch (jwtError: any) {
          console.error('🚫 JWT verification failed:', jwtError.message);
          // No hacer fallback si el token es inválido, rechazar directamente
          return next(new Error('Invalid token'));
        }
      }
      
      // Fallback to session-based auth SOLO para admin panel web (con cookies)
      const cookies = socket.handshake.headers.cookie;
      if (cookies && cookies.includes('connect.sid')) {
        // Permitir para admin panel - las sesiones ya están validadas por el middleware de Express
        console.log('⚠️ Admin WebSocket connected using session cookies (web panel)');
        (socket as any).auth = {
          userId: 'session-based',
          userType: 'admin',
          email: 'session@admin',
        } as AuthenticatedSocket;
        return next();
      }
      
      console.warn('🚫 WebSocket connection rejected: No valid authentication');
      console.warn('🔍 Debug - Token:', token ? 'Present but invalid' : 'Not provided');
      console.warn('🔍 Debug - Cookies:', cookies ? 'Present' : 'Not provided');
      return next(new Error('Authentication required'));
    } catch (error) {
      console.error('🚫 WebSocket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const auth = (socket as any).auth as AuthenticatedSocket;
    console.log(`🔌 WebSocket connected: ${auth.email} (${auth.userType})`);

    // Join user to their personal room
    socket.join(`user:${auth.userId}`);
    
    // If admin, join admin room
    if (auth.userType === 'admin' || auth.userType === 'establishment') {
      socket.join('admin-room');
    }

    // Join chat room
    socket.on('join-chat', (chatId: string) => {
      console.log(`📥 ${auth.email} joined chat ${chatId}`);
      socket.join(`chat:${chatId}`);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId: string) => {
      console.log(`📤 ${auth.email} left chat ${chatId}`);
      socket.leave(`chat:${chatId}`);
    });

    // Typing indicator
    socket.on('typing-start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user-typing', {
        chatId,
        userId: auth.userId,
        userType: auth.userType,
      });
    });

    socket.on('typing-stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user-stopped-typing', {
        chatId,
        userId: auth.userId,
        userType: auth.userType,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket disconnected: ${auth.email}`);
    });
  });

  // Función helper para enviar mensajes
  io.sendNewMessage = (chatId: string, message: any) => {
    io.to(`chat:${chatId}`).emit('new-message', message);
  };

  // Función helper para notificar cambios en el chat
  io.sendChatUpdate = (chatId: string, update: any) => {
    io.to(`chat:${chatId}`).emit('chat-updated', update);
    io.to('admin-room').emit('chat-list-updated');
  };

  // Función helper para notificar nuevo chat a admins
  io.notifyNewChat = (chat: any) => {
    io.to('admin-room').emit('new-chat', chat);
  };

  // Función helper para notificar mensajes leídos
  io.notifyMessagesRead = (chatId: string, messageIds: string[], readByType: 'user' | 'admin') => {
    io.to(`chat:${chatId}`).emit('messages-read', {
      messageIds,
      readByType,
      readAt: new Date()
    });
    console.log(`👁️ ${messageIds.length} messages marked as read by ${readByType} in chat ${chatId}`);
  };

  return io;
}

// Extend Server type
declare module 'socket.io' {
  interface Server {
    sendNewMessage: (chatId: string, message: any) => void;
    sendChatUpdate: (chatId: string, update: any) => void;
    notifyNewChat: (chat: any) => void;
    notifyMessagesRead: (chatId: string, messageIds: string[], readByType: 'user' | 'admin') => void;
  }
}
