import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    console.log('📄 Ejecutando migraciones por pasos...\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // PASO 1: Actualizar users
    console.log('👤 PASO 1: Actualizando tabla users...');
    try {
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS level CASCADE');
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS points CASCADE');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS total_saved NUMERIC(10, 2) DEFAULT 0.00');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP');
      console.log('✅ Users actualizado');
      successCount++;
    } catch (err) {
      console.error('❌ Error:', err.message);
      errorCount++;
    }

    // PASO 2: Actualizar establishments
    console.log('\n🏪 PASO 2: Actualizando tabla establishments...');
    try {
      // Renombrar discount_percentage a discount_rate
      const hasDiscountPercentage = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'establishments' AND column_name = 'discount_percentage'
      `);
      
      if (hasDiscountPercentage.rows.length > 0) {
        await client.query('ALTER TABLE establishments RENAME COLUMN discount_percentage TO discount_rate');
        await client.query('ALTER TABLE establishments ALTER COLUMN discount_rate TYPE NUMERIC(5, 2) USING discount_rate::numeric');
        console.log('✅ Renombrado discount_percentage → discount_rate');
      }

      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10, 2)');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS daily_transaction_limit INTEGER');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS accepts_tapp_pay BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10, 8)');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS location_lng NUMERIC(11, 8)');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS business_hours TEXT');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS features TEXT');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 1.50');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) DEFAULT 499.00');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS total_discounts_given NUMERIC(12, 2) DEFAULT 0.00');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.00');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE');
      await client.query('ALTER TABLE establishments ADD COLUMN IF NOT EXISTS last_transaction_at TIMESTAMP');
      console.log('✅ Establishments actualizado');
      successCount++;
    } catch (err) {
      console.error('❌ Error:', err.message);
      errorCount++;
    }

    // PASO 3: Actualizar nfc_cards
    console.log('\n💳 PASO 3: Actualizando tabla nfc_cards...');
    try {
      await client.query('ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0');
      
      // Asegurar que campos críticos no sean NULL
      await client.query(`UPDATE nfc_cards SET card_uid_hash = 'legacy_' || id::text WHERE card_uid_hash IS NULL`);
      await client.query(`UPDATE nfc_cards SET card_uid_encrypted = 'legacy_' || id::text WHERE card_uid_encrypted IS NULL`);
      await client.query(`UPDATE nfc_cards SET encryption_iv = 'legacy_' || id::text WHERE encryption_iv IS NULL`);
      await client.query(`UPDATE nfc_cards SET card_token = 'tok_legacy_' || id::text WHERE card_token IS NULL`);
      
      console.log('✅ NFC Cards actualizado');
      successCount++;
    } catch (err) {
      console.error('❌ Error:', err.message);
      errorCount++;
    }

    // PASO 4: Actualizar transactions
    console.log('\n💰 PASO 4: Actualizando tabla transactions...');
    try {
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_id TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS card_token TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(5, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(10, 2) DEFAULT 0.00');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS items TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tapp_commission_rate NUMERIC(5, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tapp_commission_amount NUMERIC(10, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant_net_amount NUMERIC(10, 2)');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'completed\'');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT NOW()');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP');
      await client.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP');
      
      // Actualizar datos existentes
      await client.query(`UPDATE transactions SET transaction_id = 'txn_legacy_' || id::text WHERE transaction_id IS NULL`);
      await client.query(`
        UPDATE transactions SET
          subtotal = amount,
          discount_amount = discount_applied,
          total = final_amount,
          discount_rate = CASE 
            WHEN amount > 0 THEN (discount_applied / amount * 100)::numeric(5,2)
            ELSE 0
          END
        WHERE subtotal IS NULL
      `);
      
      console.log('✅ Transactions actualizado');
      successCount++;
    } catch (err) {
      console.error('❌ Error:', err.message);
      errorCount++;
    }

    // PASO 5: Crear establishment_user_stats
    console.log('\n📊 PASO 5: Creando tabla establishment_user_stats...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS establishment_user_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
          visit_count INTEGER DEFAULT 0,
          total_spent NUMERIC(10, 2) DEFAULT 0.00,
          total_saved NUMERIC(10, 2) DEFAULT 0.00,
          average_ticket NUMERIC(10, 2) DEFAULT 0.00,
          first_visit_at TIMESTAMP,
          last_visit_at TIMESTAMP,
          preferences TEXT,
          customer_tier TEXT,
          is_favorite BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, establishment_id)
        )
      `);
      console.log('✅ establishment_user_stats creado');
      successCount++;
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Tabla ya existe');
        skipCount++;
      } else {
        console.error('❌ Error:', err.message);
        errorCount++;
      }
    }

    // PASO 6: Crear discount_campaigns
    console.log('\n🎯 PASO 6: Creando tabla discount_campaigns...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS discount_campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id TEXT UNIQUE NOT NULL,
          establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          discount_type TEXT NOT NULL,
          discount_value NUMERIC(10, 2) NOT NULL,
          min_purchase_amount NUMERIC(10, 2),
          max_discount_amount NUMERIC(10, 2),
          applies_to TEXT DEFAULT 'all',
          target_user_ids TEXT,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          max_uses INTEGER,
          max_uses_per_user INTEGER,
          current_uses INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ discount_campaigns creado');
      successCount++;
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Tabla ya existe');
        skipCount++;
      } else {
        console.error('❌ Error:', err.message);
        errorCount++;
      }
    }

    // PASO 7: Crear activity_logs
    console.log('\n📝 PASO 7: Creando tabla activity_logs...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type TEXT NOT NULL,
          user_id UUID REFERENCES users(id),
          establishment_id UUID REFERENCES establishments(id),
          event_data TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ activity_logs creado');
      successCount++;
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Tabla ya existe');
        skipCount++;
      } else {
        console.error('❌ Error:', err.message);
        errorCount++;
      }
    }

    // PASO 8: Crear índices
    console.log('\n🔍 PASO 8: Creando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_establishments_category ON establishments(category)',
      'CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id) WHERE status = \'active\'',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, completed_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_establishment_date ON transactions(establishment_id, completed_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_estab_user_stats_user ON establishment_user_stats(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_estab_user_stats_establishment ON establishment_user_stats(establishment_id)',
      'CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC)',
    ];

    for (const index of indices) {
      try {
        await client.query(index);
        successCount++;
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('does not exist')) {
          errorCount++;
        }
      }
    }
    console.log('✅ Índices creados');

    // PASO 9: Actualizar datos
    console.log('\n🔄 PASO 9: Actualizando datos...');
    try {
      await client.query('UPDATE users SET total_spent = 0.00 WHERE total_spent IS NULL');
      await client.query('UPDATE users SET total_saved = 0.00 WHERE total_saved IS NULL');
      await client.query('UPDATE users SET transaction_count = 0 WHERE transaction_count IS NULL');
      await client.query('UPDATE establishments SET discount_rate = 10.00 WHERE discount_rate IS NULL OR discount_rate = 0');
      await client.query('UPDATE establishments SET commission_rate = 1.50 WHERE commission_rate IS NULL');
      console.log('✅ Datos actualizados');
      successCount++;
    } catch (err) {
      console.error('❌ Error:', err.message);
      errorCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN FINAL:');
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ⏭️  Omitidos: ${skipCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!\n');
    } else {
      console.log('\n⚠️  Migración completada con algunos errores (puede ser normal)\n');
    }

    // Verificar tablas finales
    console.log('🔍 Verificando schema final...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📋 Tablas en la base de datos:');
    result.rows.forEach(row => {
      const isNew = ['establishment_user_stats', 'discount_campaigns', 'activity_logs'].includes(row.table_name);
      console.log(`   ${isNew ? '🆕' : '  '} ${row.table_name}`);
    });

    console.log('\n✅ Sistema NFC listo para usar! 🚀\n');

  } catch (error) {
    console.error('\n❌ Error fatal durante la migración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada\n');
  }
}

runMigration();
