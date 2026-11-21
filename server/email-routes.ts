import { Router } from 'express';
import { db } from './storage.js';
import { emails } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import { Resend } from 'resend';

const router = Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Opciones de correos disponibles para enviar
const emailOptions = [
  { value: 'legal@wavy.do', label: 'Legal - legal@wavy.do' },
  { value: 'support@wavy.do', label: 'Support - support@wavy.do' },
  { value: 'hello@emails.wavy.do', label: 'Hello - hello@emails.wavy.do' },
];

// ============================================
// GET - Obtener todas las opciones de correos
// ============================================
router.get('/admin/emails/options', async (req, res) => {
  try {
    res.json({
      success: true,
      options: emailOptions,
    });
  } catch (error) {
    console.error('Error fetching email options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email options',
    });
  }
});

// ============================================
// GET - Obtener todos los correos (enviados y recibidos)
// ============================================
router.get('/admin/emails', async (req, res) => {
  try {
    const allEmails = await db
      .select()
      .from(emails)
      .orderBy(desc(emails.createdAt));

    res.json({
      success: true,
      emails: allEmails,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emails',
    });
  }
});

// ============================================
// POST - Enviar un correo
// ============================================
router.post('/admin/emails/send', async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    // Validar campos requeridos
    if (!from || !to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: from, to, subject, body',
      });
    }

    // Enviar email con Resend
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: body,
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Guardar email fallido en la base de datos
      await db.insert(emails).values({
        from,
        to,
        subject,
        body,
        type: 'sent',
        status: 'failed',
        error: error.message || 'Unknown error',
      });

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send email',
      });
    }

    // Guardar email enviado en la base de datos
    const [savedEmail] = await db.insert(emails).values({
      from,
      to,
      subject,
      body,
      type: 'sent',
      resendId: data?.id,
      status: 'sent',
    }).returning();

    res.json({
      success: true,
      message: 'Email sent successfully',
      email: savedEmail,
      resendId: data?.id,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
    });
  }
});

// ============================================
// POST - Recibir un correo (webhook de Resend)
// ============================================
router.post('/webhooks/resend', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Solo procesar emails recibidos
    if (type === 'email.received') {
      await db.insert(emails).values({
        from: data.from,
        to: data.to,
        subject: data.subject,
        body: data.html || data.text || '',
        type: 'received',
        resendId: data.id,
        status: 'delivered',
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
});

// ============================================
// DELETE - Eliminar un correo
// ============================================
router.delete('/admin/emails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(emails).where(eq(emails.id, id));

    res.json({
      success: true,
      message: 'Email deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete email',
    });
  }
});

// ============================================
// PATCH - Marcar correo como leído
// ============================================
router.patch('/admin/emails/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedEmail] = await db
      .update(emails)
      .set({ readAt: new Date() })
      .where(eq(emails.id, id))
      .returning();

    res.json({
      success: true,
      email: updatedEmail,
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark email as read',
    });
  }
});

export default router;
