import express, { Request, Response, NextFunction } from 'express';
import { db } from './storage.js';
import { supportChats, chatMessages, users, admins, establishments } from '../shared/schema.js';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { requireAuth, requireUser, requireAdmin, requireUserOrEstablishment } from './auth.js';
import { FAQ_OPTIONS, detectHumanRequest, WELCOME_MESSAGE, HANDOFF_MESSAGE, ESCALATION_MESSAGE, BOT_UUID } from './chatbot.js';

const router = express.Router();

// Exportar función para inyectar io después
export let io: any = null;
export function setSocketIO(socketIO: any) {
  io = socketIO;
}

// ============================================
// USER ROUTES - Chat de Soporte
// ============================================

// Crear o obtener chat activo del usuario
router.post('/user/support/chat', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const userType = req.user?.type || req.session.userType;
    
    // Obtener info del usuario o negocio según el tipo
    let userEmail = '';
    let userName = '';
    let userPhone = '';
    
    if (userType === 'establishment') {
      // Es un negocio
      const [establishment] = await db.select().from(establishments).where(eq(establishments.id, userId));
      if (!establishment) {
        return res.status(404).json({ error: 'Establishment not found' });
      }
      userEmail = establishment.email;
      userName = establishment.businessName;
      userPhone = establishment.phone || '';
    } else {
      // Es un usuario regular
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      userEmail = user.email;
      userName = user.fullName;
      userPhone = user.phone || '';
    }
    
    // Buscar chat abierto existente
    const existingChats = await db.select()
      .from(supportChats)
      .where(and(
        eq(supportChats.userId, userId),
        or(
          eq(supportChats.status, 'open'),
          eq(supportChats.status, 'escalated')
        )
      ))
      .orderBy(desc(supportChats.createdAt))
      .limit(1);
    
    if (existingChats.length > 0) {
      // Retornar chat existente
      return res.json({ chat: existingChats[0] });
    }
    
    // Crear nuevo chat
    const { subject, category, deviceInfo } = req.body;
    
    const [newChat] = await db.insert(supportChats).values({
      userId,
      userEmail,
      userName,
      userPhone,
      subject: subject || 'Support Request',
      category: category || 'general',
      deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
    }).returning();
    
    console.log(`📞 New support chat created for ${userType}: ${userEmail}`);
    
    // Enviar mensaje de bienvenida del bot automáticamente
    const [welcomeMsg] = await db.insert(chatMessages).values({
      chatId: newChat.id,
      senderType: 'admin',
      senderId: BOT_UUID,
      senderName: 'Asistente TAPP',
      messageType: 'text',
      content: WELCOME_MESSAGE,
      isRead: false,
    }).returning();
    
    // Notificar a admins sobre nuevo chat y enviar mensaje de bienvenida
    if (io) {
      io.notifyNewChat(newChat);
      io.sendNewMessage(newChat.id, welcomeMsg);
    }
    
    res.json({ chat: newChat });
  } catch (error: any) {
    console.error('❌ Error creating support chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mensajes del chat
router.get('/user/support/chat/:chatId/messages', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    // Verificar que el chat pertenece al usuario
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Obtener mensajes
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(chatMessages.createdAt);
    
    // Marcar mensajes del admin como leídos
    const unreadAdminMessages = messages.filter(m => m.senderType === 'admin' && !m.isRead);
    const messageIdsToMark = unreadAdminMessages.map(m => m.id);
    
    if (messageIdsToMark.length > 0) {
      await db.update(chatMessages)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(chatMessages.chatId, chatId),
          eq(chatMessages.senderType, 'admin'),
          eq(chatMessages.isRead, false)
        ));
      
      // Notificar al admin via WebSocket que sus mensajes fueron leídos
      if (io) {
        io.notifyMessagesRead(chatId, messageIdsToMark, 'user');
      }
    }
    
    res.json({ messages });
  } catch (error: any) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensaje
router.post('/user/support/chat/:chatId/messages', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    const userType = req.user?.type || req.session.userType;
    const { content, messageType, attachmentUrl, attachmentType, attachmentName } = req.body;
    
    // SEGURIDAD CRÍTICA: Verificar que el chat pertenece al usuario autenticado
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      console.warn(`🚫 Security: User ${userId} tried to send message to unauthorized chat ${chatId}`);
      return res.status(403).json({ error: 'Unauthorized: This chat does not belong to you' });
    }
    
    // Obtener nombre del usuario o negocio según el tipo
    let senderName = '';
    
    if (userType === 'establishment') {
      const [establishment] = await db.select().from(establishments).where(eq(establishments.id, userId));
      if (!establishment) {
        console.warn(`🚫 Establishment ${userId} not found in database`);
        return res.status(403).json({ error: 'Establishment not found' });
      }
      senderName = establishment.businessName;
    } else {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        console.warn(`🚫 User ${userId} not found in database`);
        return res.status(403).json({ error: 'User not found' });
      }
      senderName = user.fullName;
    }
    
    // Validar contenido no vacío
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    
    // Crear mensaje
    const [newMessage] = await db.insert(chatMessages).values({
      chatId,
      senderType: 'user',
      senderId: userId,
      senderName,
      content: content.trim(), // Sanitizar espacios
      messageType: messageType || 'text',
      attachmentUrl,
      attachmentType,
      attachmentName,
    }).returning();
    
    // Actualizar timestamp del chat
    await db.update(supportChats)
      .set({ lastMessageAt: new Date() })
      .where(eq(supportChats.id, chatId));
    
    console.log(`💬 New message in chat ${chatId} from ${userType}: ${senderName}`);
    
    // Emitir evento WebSocket
    if (io) {
      io.sendNewMessage(chatId, newMessage);
    }
    
    // Si el bot está activo, responder automáticamente
    if (chat.botActive) {
      // Detectar si el usuario quiere hablar con un humano
      const wantsHuman = detectHumanRequest(content);
      
      if (wantsHuman) {
        // Escalar inmediatamente a humano
        await db.update(supportChats)
          .set({ 
            botActive: false,
            status: 'escalated',
            priority: 'high'
          })
          .where(eq(supportChats.id, chatId));
        
        const [handoffMsg] = await db.insert(chatMessages).values({
          chatId,
          senderType: 'admin',
          senderId: BOT_UUID,
          senderName: 'Asistente TAPP',
          messageType: 'text',
          content: HANDOFF_MESSAGE,
          isRead: false,
        }).returning();
        
        if (io) {
          io.sendNewMessage(chatId, handoffMsg);
        }
      } else {
        // Responder con sugerencias de FAQ relevantes
        const lowerContent = content.toLowerCase();
        let suggestedFAQs: any[] = [];
        
        // Buscar FAQs relevantes basados en palabras clave
        if (lowerContent.includes('pago') || lowerContent.includes('rechaz') || lowerContent.includes('tarjeta')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'payments').slice(0, 3);
        } else if (lowerContent.includes('nfc') || lowerContent.includes('tarjeta') || lowerContent.includes('vincul')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'nfc').slice(0, 3);
        } else if (lowerContent.includes('establecimiento') || lowerContent.includes('descuento') || lowerContent.includes('donde')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'establishments').slice(0, 3);
        } else if (lowerContent.includes('cuenta') || lowerContent.includes('perfil') || lowerContent.includes('contraseña')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'account').slice(0, 3);
        } else if (lowerContent.includes('segur') || lowerContent.includes('fraude') || lowerContent.includes('actividad')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'security').slice(0, 3);
        } else if (lowerContent.includes('app') || lowerContent.includes('cierra') || lowerContent.includes('actualiz')) {
          suggestedFAQs = FAQ_OPTIONS.filter(f => f.category === 'technical').slice(0, 3);
        } else {
          // Si no coincide, mostrar las 3 primeras generales
          suggestedFAQs = FAQ_OPTIONS.slice(0, 3);
        }
        
        // Enviar respuesta del bot con sugerencias
        let botResponse = 'He recibido tu mensaje. ';
        if (suggestedFAQs.length > 0) {
          botResponse += 'Aquí hay algunas preguntas que podrían ayudarte. Selecciona una de las opciones debajo o escribe tu pregunta con más detalle.';
        } else {
          botResponse += '¿En qué más puedo ayudarte?';
        }
        
        const [botMsg] = await db.insert(chatMessages).values({
          chatId,
          senderType: 'admin',
          senderId: BOT_UUID,
          senderName: 'Asistente TAPP',
          messageType: 'text',
          content: botResponse,
          isRead: false,
        }).returning();
        
        if (io) {
          io.sendNewMessage(chatId, botMsg);
        }
      }
    }
    
    res.json({ message: newMessage });
  } catch (error: any) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener info del chat
router.get('/user/support/chat/:chatId', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar que el usuario está escribiendo
router.post('/user/support/chat/:chatId/typing', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    // Verificar que el chat pertenece al usuario
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Guardar timestamp de escritura (expira en 3 segundos)
    const typingKey = `typing:${chatId}:user`;
    // En producción usarías Redis, por ahora usamos una variable global temporal
    global.typingIndicators = global.typingIndicators || {};
    global.typingIndicators[typingKey] = Date.now();
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estado de "escribiendo"
router.get('/user/support/chat/:chatId/typing', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    // Verificar que el chat pertenece al usuario
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Verificar si el admin está escribiendo (expira después de 3 segundos)
    const typingKey = `typing:${chatId}:admin`;
    global.typingIndicators = global.typingIndicators || {};
    const lastTyping = global.typingIndicators[typingKey];
    const isTyping = lastTyping && (Date.now() - lastTyping < 3000);
    
    res.json({ isTyping });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN/BUSINESS ROUTES - Gestión de Chats
// ============================================

// Middleware para admin o establishment
const requireAdminOrBusiness = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, (err?: any) => {
    if (err) return next(err);
    
    const userType = req.user?.type || req.session.userType;
    if (userType === 'admin' || userType === 'establishment') {
      return next();
    }
    
    return res.status(403).json({ error: 'Forbidden - Admin or Business access only' });
  });
};

// Obtener todos los chats
router.get('/admin/support/chats', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching support chats - User:', req.session.userId, 'Type:', req.session.userType);
    console.log('📋 Headers:', req.headers.authorization ? 'Bearer token present' : 'No token');
    console.log('📋 User object:', req.user);
    
    const { status } = req.query;
    
    let query = db.select().from(supportChats);
    
    if (status) {
      query = query.where(eq(supportChats.status, status as string));
      console.log('🔍 Filtering by status:', status);
    }
    
    const chats = await query.orderBy(desc(supportChats.lastMessageAt));
    
    console.log(`✅ Found ${chats.length} support chats`);
    
    // Obtener conteo de mensajes no leídos por chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await db.select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(and(
            eq(chatMessages.chatId, chat.id),
            eq(chatMessages.senderType, 'user'),
            eq(chatMessages.isRead, false)
          ));
        
        return {
          ...chat,
          unreadCount: Number(unreadCount[0]?.count || 0),
        };
      })
    );
    
    console.log('📊 Chats with unread counts prepared');
    
    res.json({ chats: chatsWithUnread });
  } catch (error: any) {
    console.error('❌ Error fetching support chats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mensajes de un chat (admin)
router.get('/admin/support/chat/:chatId/messages', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(chatMessages.createdAt);
    
    // Marcar mensajes del usuario como leídos
    const unreadUserMessages = messages.filter(m => m.senderType === 'user' && !m.isRead);
    const messageIdsToMark = unreadUserMessages.map(m => m.id);
    
    if (messageIdsToMark.length > 0) {
      await db.update(chatMessages)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(chatMessages.chatId, chatId),
          eq(chatMessages.senderType, 'user'),
          eq(chatMessages.isRead, false)
        ));
      
      // Notificar al usuario via WebSocket que sus mensajes fueron leídos
      if (io) {
        io.notifyMessagesRead(chatId, messageIdsToMark, 'admin');
      }
    }
    
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensaje (admin)
router.post('/admin/support/chat/:chatId/messages', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const adminId = req.session.userId!;
    const { content, messageType, attachmentUrl, attachmentType, attachmentName, bannerColor } = req.body;
    
    // SEGURIDAD: Verificar que el chat existe antes de permitir envío
    const [chat] = await db.select().from(supportChats).where(eq(supportChats.id, chatId));
    if (!chat) {
      console.warn(`🚫 Admin ${adminId} tried to send message to non-existent chat ${chatId}`);
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Obtener nombre del admin
    const [admin] = await db.select().from(admins).where(eq(admins.id, adminId));
    if (!admin) {
      console.warn(`🚫 Admin ${adminId} not found in database`);
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Crear mensaje
    const [newMessage] = await db.insert(chatMessages).values({
      chatId,
      senderType: 'admin',
      senderId: adminId,
      senderName: admin.fullName,
      content,
      messageType: messageType || 'text',
      attachmentUrl,
      attachmentType,
      attachmentName,
      bannerColor,
    }).returning();
    
    // Actualizar timestamp del chat
    await db.update(supportChats)
      .set({ lastMessageAt: new Date() })
      .where(eq(supportChats.id, chatId));
    
    // Si no hay admin asignado, asignar este admin
    if (!chat.assignedAdminId) {
      await db.update(supportChats)
        .set({ assignedAdminId: adminId })
        .where(eq(supportChats.id, chatId));
    }
    
    console.log(`💬 New message in chat ${chatId} from admin ${admin.email}`);
    
    // Emitir evento WebSocket
    if (io) {
      io.sendNewMessage(chatId, newMessage);
    }
    
    res.json({ message: newMessage });
  } catch (error: any) {
    console.error('❌ Error sending admin message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado del chat
router.patch('/admin/support/chat/:chatId', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { status, priority, internalNotes, assignedAdminId } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    
    if (status) {
      updateData.status = status;
      if (status === 'closed') {
        updateData.closedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (assignedAdminId !== undefined) updateData.assignedAdminId = assignedAdminId;
    
    const [updatedChat] = await db.update(supportChats)
      .set(updateData)
      .where(eq(supportChats.id, chatId))
      .returning();
    
    console.log(`✏️ Chat ${chatId} updated:`, Object.keys(updateData));
    
    // Emitir actualización por WebSocket
    if (io) {
      io.sendChatUpdate(chatId, updatedChat);
    }
    
    res.json({ chat: updatedChat });
  } catch (error: any) {
    console.error('❌ Error updating chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar chat
router.delete('/admin/support/chat/:chatId', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const adminId = req.session.userId;
    
    console.log(`🗑️ DELETE request received for chat ${chatId} by admin ${adminId}`);
    
    // Primero eliminar todos los mensajes del chat
    const deletedMessages = await db.delete(chatMessages).where(eq(chatMessages.chatId, chatId)).returning();
    console.log(`🗑️ Deleted ${deletedMessages.length} messages`);
    
    // Luego eliminar el chat
    const deletedChats = await db.delete(supportChats).where(eq(supportChats.id, chatId)).returning();
    console.log(`🗑️ Deleted ${deletedChats.length} chats`);
    
    if (deletedChats.length === 0) {
      console.warn(`⚠️ Chat ${chatId} not found`);
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    console.log(`✅ Chat ${chatId} deleted successfully`);
    
    // Notificar a través de WebSocket
    if (io) {
      io.to(`chat:${chatId}`).emit('chat-deleted', { chatId });
      io.to('admin-room').emit('chat-list-updated');
    }
    
    res.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error('❌ Error deleting chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener info de un chat específico
router.get('/admin/support/chat/:chatId', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const [chat] = await db.select().from(supportChats)
      .where(eq(supportChats.id, chatId));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar que el admin está escribiendo
router.post('/admin/support/chat/:chatId/typing', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    // Guardar timestamp de escritura (expira en 3 segundos)
    const typingKey = `typing:${chatId}:admin`;
    global.typingIndicators = global.typingIndicators || {};
    global.typingIndicators[typingKey] = Date.now();
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estado de "escribiendo" del usuario
router.get('/admin/support/chat/:chatId/typing', requireAdminOrBusiness, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    // Verificar si el usuario está escribiendo (expira después de 3 segundos)
    const typingKey = `typing:${chatId}:user`;
    global.typingIndicators = global.typingIndicators || {};
    const lastTyping = global.typingIndicators[typingKey];
    const isTyping = lastTyping && (Date.now() - lastTyping < 3000);
    
    res.json({ isTyping });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// ============================================
// CHATBOT ROUTES - Sistema automático de FAQ
// ============================================

// Obtener opciones de FAQ
router.get('/user/support/faq-options', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    res.json({ options: FAQ_OPTIONS });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Responder con FAQ automática
router.post('/user/support/chat/:chatId/bot-response', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { faqId } = req.body;
    const userId = req.session.userId!;
    
    // Verificar chat
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Verificar que el bot esté activo
    if (!chat.botActive) {
      return res.status(400).json({ error: 'Bot is not active for this chat' });
    }
    
    // Buscar FAQ
    const faqOption = FAQ_OPTIONS.find(opt => opt.id === faqId);
    if (!faqOption) {
      return res.status(404).json({ error: 'FAQ option not found' });
    }
    
    // Enviar respuesta del bot
    const [botMessage] = await db.insert(chatMessages).values({
      chatId,
      senderType: 'admin',
      senderId: BOT_UUID,
      senderName: 'Asistente TAPP',
      messageType: 'text',
      content: faqOption.answer,
      isRead: false,
    }).returning();
    
    // Actualizar preguntas hechas
    const askedQuestions = chat.botAskedQuestions ? JSON.parse(chat.botAskedQuestions) : [];
    askedQuestions.push(faqId);
    
    await db.update(supportChats)
      .set({ 
        botAskedQuestions: JSON.stringify(askedQuestions),
        lastMessageAt: new Date()
      })
      .where(eq(supportChats.id, chatId));
    
    // Notificar via WebSocket
    if (io) {
      io.sendNewMessage(chatId, botMessage);
    }
    
    res.json({ message: botMessage });
  } catch (error: any) {
    console.error('❌ Error sending bot response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feedback del usuario sobre respuesta del bot
router.post('/user/support/chat/:chatId/bot-feedback', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { resolved } = req.body; // true o false
    const userId = req.session.userId!;
    
    // Verificar chat
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (!resolved) {
      // Incrementar contador negativo
      const newCount = (chat.botNegativeCount || 0) + 1;
      
      await db.update(supportChats)
        .set({ botNegativeCount: newCount })
        .where(eq(supportChats.id, chatId));
      
      // Si llega a 3, escalar a humano
      if (newCount >= 3) {
        await db.update(supportChats)
          .set({ 
            botActive: false,
            status: 'escalated',
            priority: 'high'
          })
          .where(eq(supportChats.id, chatId));
        
        // Enviar mensaje de escalación
        const [escalationMsg] = await db.insert(chatMessages).values({
          chatId,
          senderType: 'admin',
          senderId: BOT_UUID,
          senderName: 'Asistente TAPP',
          messageType: 'text',
          content: ESCALATION_MESSAGE,
          isRead: false,
        }).returning();
        
        // Notificar
        if (io) {
          io.sendNewMessage(chatId, escalationMsg);
        }
        
        return res.json({ escalated: true, message: escalationMsg });
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error processing bot feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Solicitar humano explícitamente
router.post('/user/support/chat/:chatId/request-human', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    // Verificar chat
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Desactivar bot y escalar
    await db.update(supportChats)
      .set({ 
        botActive: false,
        status: 'escalated',
        priority: 'normal'
      })
      .where(eq(supportChats.id, chatId));
    
    // Enviar mensaje de transferencia
    const [handoffMsg] = await db.insert(chatMessages).values({
      chatId,
      senderType: 'admin',
      senderId: BOT_UUID,
      senderName: 'Asistente TAPP',
      messageType: 'text',
      content: HANDOFF_MESSAGE,
      isRead: false,
    }).returning();
    
    // Notificar
    if (io) {
      io.sendNewMessage(chatId, handoffMsg);
    }
    
    res.json({ message: handoffMsg });
  } catch (error: any) {
    console.error('❌ Error requesting human:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cerrar chat (usuario)
router.post('/user/support/chat/:chatId/close', requireUserOrEstablishment, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId!;
    
    // Verificar que el chat pertenece al usuario
    const [chat] = await db.select().from(supportChats)
      .where(and(
        eq(supportChats.id, chatId),
        eq(supportChats.userId, userId)
      ));
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Cerrar el chat
    await db.update(supportChats)
      .set({ 
        status: 'closed',
        closedAt: new Date()
      })
      .where(eq(supportChats.id, chatId));
    
    console.log(`🔒 Chat ${chatId} closed by user ${userId}`);
    
    res.json({ success: true, message: 'Chat closed successfully' });
  } catch (error: any) {
    console.error('❌ Error closing chat:', error);
    res.status(500).json({ error: error.message });
  }
});
