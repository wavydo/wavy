import { Router, Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import { requireAuth } from './auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Run migration on startup
async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add-user-profile-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    await pool.query(migrationSQL);
    console.log('✅ Profile fields migration executed successfully');
  } catch (error: any) {
    console.log('⚠️  Migration may have already been run:', error.message);
  }
}

// Execute migration immediately
runMigration();

// GET /api/profile - Get user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const result = await pool.query(
      `SELECT 
        id,
        full_name,
        email,
        phone,
        address,
        city,
        country,
        zip_code,
        date_of_birth,
        profile_image,
        notifications_enabled,
        notifications_transactions,
        notifications_offers,
        biometric_enabled,
        biometric_type,
        created_at
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    
    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      zipCode: user.zip_code || '',
      dateOfBirth: user.date_of_birth || '',
      profileImage: user.profile_image || null,
      notifications: {
        general: user.notifications_enabled !== false,
        transactions: user.notifications_transactions !== false,
        offers: user.notifications_offers || false
      },
      biometric: {
        enabled: user.biometric_enabled || false,
        type: user.biometric_type || null
      },
      createdAt: user.created_at
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// PUT /api/profile - Update user profile
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const {
      fullName,
      phone,
      address,
      city,
      country,
      zipCode,
      dateOfBirth
    } = req.body;

    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           country = COALESCE($5, country),
           zip_code = COALESCE($6, zip_code),
           date_of_birth = COALESCE($7, date_of_birth),
           updated_at = NOW()
       WHERE id = $8`,
      [fullName, phone, address, city, country, zipCode, dateOfBirth, userId]
    );

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// PUT /api/profile/image - Update profile image
router.put('/profile/image', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL de imagen requerida' });
    }

    await pool.query(
      `UPDATE users 
       SET profile_image = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [imageUrl, userId]
    );

    res.json({ message: 'Imagen de perfil actualizada', imageUrl });
  } catch (error: any) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ error: 'Error al actualizar imagen de perfil' });
  }
});

// PUT /api/profile/notifications - Update notification settings
router.put('/profile/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { general, transactions, offers } = req.body;

    await pool.query(
      `UPDATE users 
       SET notifications_enabled = COALESCE($1, notifications_enabled),
           notifications_transactions = COALESCE($2, notifications_transactions),
           notifications_offers = COALESCE($3, notifications_offers),
           updated_at = NOW()
       WHERE id = $4`,
      [general, transactions, offers, userId]
    );

    res.json({ message: 'Configuración de notificaciones actualizada' });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

// PUT /api/profile/biometric - Update biometric settings
router.put('/profile/biometric', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { enabled, type } = req.body;

    await pool.query(
      `UPDATE users 
       SET biometric_enabled = $1,
           biometric_type = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [enabled, type || null, userId]
    );

    res.json({ message: 'Configuración biométrica actualizada' });
  } catch (error: any) {
    console.error('Error updating biometric settings:', error);
    res.status(500).json({ error: 'Error al actualizar configuración biométrica' });
  }
});

export default router;
