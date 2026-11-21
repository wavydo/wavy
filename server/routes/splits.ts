import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ReceiptParser } from '../services/receiptParser';
import { db } from '../db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed!'));
    }
  }
});

/**
 * POST /api/splits/scan
 * Escanea una imagen de factura y extrae la información
 */
router.post('/scan', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No receipt image provided'
      });
    }

    console.log('📸 Processing receipt:', req.file.filename);

    // Parsear la factura con OCR
    const parsed = await ReceiptParser.parseReceipt(req.file.path);
    
    // Validar y limpiar resultados
    const cleaned = ReceiptParser.validateAndClean(parsed);

    console.log('✅ Receipt parsed successfully');
    console.log(`   Items: ${cleaned.items.length}`);
    console.log(`   Total: ${cleaned.currency}${cleaned.total}`);

    // Opcional: Eliminar el archivo después de procesarlo
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      receipt: {
        items: cleaned.items,
        subtotal: cleaned.subtotal,
        tax: cleaned.tax,
        tip: cleaned.tip,
        total: cleaned.total,
        currency: cleaned.currency,
        merchantName: cleaned.merchantName,
        date: cleaned.date
      }
    });
  } catch (error: any) {
    console.error('❌ Error processing receipt:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process receipt'
    });
  }
});

/**
 * POST /api/splits
 * Crea un nuevo split bill
 */
router.post('/', async (req, res) => {
  try {
    const { 
      items, 
      participants, 
      assignments,
      amounts,
      splitMode,
      total,
      currency,
      merchantName,
      creatorEmail, 
      creatorName,
      tax,
      tip,
      subtotal
    } = req.body;

    // Validación básica
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items are required'
      });
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one participant is required'
      });
    }

    // Generar ID único para el split
    const splitId = `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const split = {
      id: splitId,
      items,
      participants,
      assignments: assignments || {},
      amounts: amounts || {},
      splitMode: splitMode || 'items',
      total,
      currency: currency || 'RD$',
      merchantName,
      creatorEmail,
      creatorName,
      tax: tax || 0,
      tip: tip || 0,
      subtotal: subtotal || 0,
      status: 'pending',
      paymentStatuses: {},
      createdAt: new Date().toISOString()
    };

    // Inicializar estados de pago
    participants.forEach((p: any) => {
      split.paymentStatuses[p.id] = 'pending';
    });

    // TODO: Guardar en base de datos cuando tengamos la tabla
    console.log('✅ Split created:', splitId);

    res.json({
      success: true,
      split
    });
  } catch (error: any) {
    console.error('❌ Error creating split:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create split'
    });
  }
});

/**
 * POST /api/splits/invite
 * Envía invitación a un participante externo
 */
router.post('/invite', async (req, res) => {
  try {
    const {
      splitId,
      participantId,
      name,
      email,
      phone,
      amount,
      currency,
      merchantName,
      paymentLink
    } = req.body;

    console.log(`📧 Sending invitation to ${name} (${email || phone})`);
    console.log(`   Amount: ${currency}${amount}`);
    console.log(`   Link: ${paymentLink}`);

    // TODO: Implementar envío real de email/SMS
    // Por ahora solo logueamos
    
    // Aquí integrarías con:
    // - SendGrid / Mailgun para emails
    // - Twilio / AWS SNS para SMS
    
    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    console.error('❌ Error sending invitation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitation'
    });
  }
});

/**
 * POST /api/splits/remind
 * Envía recordatorio a un participante
 */
router.post('/remind', async (req, res) => {
  try {
    const {
      splitId,
      participantId,
      email,
      phone
    } = req.body;

    console.log(`🔔 Sending reminder for split ${splitId} to participant ${participantId}`);

    // TODO: Enviar recordatorio por email/SMS
    
    res.json({
      success: true,
      message: 'Reminder sent successfully'
    });
  } catch (error: any) {
    console.error('❌ Error sending reminder:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send reminder'
    });
  }
});

/**
 * GET /api/splits/:id
 * Obtiene información de un split
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Obtener de base de datos cuando tengamos la tabla
    // Por ahora retornamos un mock para testing
    console.log(`📊 Fetching split: ${id}`);
    
    res.json({
      success: true,
      split: {
        id,
        items: [],
        participants: [],
        assignments: {},
        amounts: {},
        splitMode: 'items',
        status: 'pending',
        paymentStatuses: {},
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching split:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch split'
    });
  }
});

/**
 * POST /api/splits/:id/assign
 * Asigna items a participantes
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignments } = req.body;

    console.log(`✏️ Updating assignments for split ${id}`);

    // TODO: Actualizar en base de datos
    // Por ahora solo retornamos success

    res.json({
      success: true,
      message: 'Items assigned successfully',
      assignments
    });
  } catch (error: any) {
    console.error('❌ Error assigning items:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign items'
    });
  }
});

/**
 * POST /api/splits/:id/pay
 * Procesa el pago de un participante
 */
router.post('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { participantId, amount, paymentMethod } = req.body;

    console.log(`💳 Processing payment for split ${id}`);
    console.log(`   Participant: ${participantId}`);
    console.log(`   Amount: ${amount}`);
    console.log(`   Method: ${paymentMethod || 'tapp_balance'}`);

    // Validación
    if (!participantId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Participant ID and amount are required'
      });
    }

    // TODO: Procesar pago real
    // - Si es usuario Tapp: descontar de su saldo
    // - Si es externo: procesar con Stripe/PayPal
    // - Actualizar paymentStatuses en DB
    // - Verificar si todos pagaron para marcar split como 'completed'

    // Simulación de pago exitoso
    const payment = {
      id: `payment-${Date.now()}`,
      splitId: id,
      participantId,
      amount,
      paymentMethod: paymentMethod || 'tapp_balance',
      status: 'success',
      processedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });
  } catch (error: any) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment'
    });
  }
});

/**
 * GET /api/splits/:id/status
 * Obtiene el estado de pagos de un split
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📈 Fetching payment status for split ${id}`);

    // TODO: Obtener de base de datos

    res.json({
      success: true,
      status: {
        splitId: id,
        overallStatus: 'pending',
        paymentStatuses: {},
        totalPaid: 0,
        totalPending: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch status'
    });
  }
});

/**
 * PUT /api/splits/:id
 * Actualiza un split (para ediciones post-creación)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`🔄 Updating split ${id}`);

    // TODO: Actualizar en base de datos

    res.json({
      success: true,
      message: 'Split updated successfully',
      split: {
        id,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating split:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update split'
    });
  }
});

/**
 * DELETE /api/splits/:id
 * Cancela/elimina un split (solo si no hay pagos procesados)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting split ${id}`);

    // TODO: Verificar que no hay pagos procesados
    // TODO: Eliminar de base de datos

    res.json({
      success: true,
      message: 'Split deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting split:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete split'
    });
  }
});

export default router;
