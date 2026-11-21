import { pgTable, text, timestamp, uuid, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// USERS (Clientes con tarjetas TAPP)
// ============================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  dateOfBirth: timestamp('date_of_birth'),
  avatarUrl: text('avatar_url'),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  totalSaved: decimal('total_saved', { precision: 10, scale: 2 }).notNull().default('0'),
  transactionCount: integer('transaction_count').notNull().default(0),
  monthlySpent: decimal('monthly_spent', { precision: 10, scale: 2 }).notNull().default('0'),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'), // TAPP wallet balance
  accountNumber: text('account_number').unique(), // TAPP account number
  points: integer('points').notNull().default(0), // TAPP rewards points
  level: text('level').notNull().default('member'), // member, silver, gold, platinum
  isVerified: boolean('is_verified').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  fullName: z.string().min(3).max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  points: true,
  level: true,
  totalSpent: true,
  monthlySpent: true,
});

// ============================================
// ESTABLISHMENTS (Negocios locales)
// ============================================
export const establishments = pgTable('establishments', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  category: text('category').notNull(), // colmado, restaurante, farmacia, etc.
  description: text('description'),
  logo: text('logo'),
  
  // Configuración de descuentos (simplificado)
  discountRate: decimal('discount_rate', { precision: 5, scale: 2 }).notNull().default('10.00'),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }).default('0.00'),
  
  // Plan y comisiones
  subscriptionPlan: text('subscription_plan').notNull().default('starter'), // starter, business, enterprise
  subscriptionStatus: text('subscription_status').notNull().default('active'), // active, inactive, pending
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull().default('1.50'),
  monthlyFee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull().default('499.00'),
  
  // Límites
  dailyTransactionLimit: integer('daily_transaction_limit'),
  acceptsTappPay: boolean('accepts_tapp_pay').notNull().default(false),
  
  // Ubicación
  locationLat: decimal('location_lat', { precision: 10, scale: 8 }),
  locationLng: decimal('location_lng', { precision: 11, scale: 8 }),
  
  // Horarios y features (JSON)
  businessHours: text('business_hours'), // JSON string
  features: text('features'), // JSON string
  
  // Estadísticas
  totalCustomers: integer('total_customers').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalDiscountsGiven: decimal('total_discounts_given', { precision: 12, scale: 2 }).notNull().default('0'),
  totalTransactions: integer('total_transactions').notNull().default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').notNull().default(0),
  
  // Estado
  approved: boolean('approved').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  
  lastTransactionAt: timestamp('last_transaction_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertEstablishmentSchema = createInsertSchema(establishments, {
  businessName: z.string().min(3).max(100),
  ownerName: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  address: z.string().min(10),
  city: z.string().min(3),
  category: z.enum(['colmado', 'restaurante', 'farmacia', 'barberia', 'gym', 'cafeteria', 'supermercado', 'otro']),
  description: z.string().optional(),
  discountPercentage: z.number().min(5).max(30).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalCustomers: true,
  totalRevenue: true,
  subscriptionPlan: true,
  subscriptionStatus: true,
  approved: true,
  approvedAt: true,
  logo: true,
});

// ============================================
// ADMINS (Equipo TAPP - control total)
// ============================================
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'), // admin, super_admin
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertAdminSchema = createInsertSchema(admins, {
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'super_admin']).optional(),
}).omit({
  id: true,
  createdAt: true,
});

// ============================================
// NFC CARDS (Tarjetas tokenizadas)
// ============================================
// NFC CARDS (Tarjetas tokenizadas con seguridad)
// ============================================
// ============================================
// EMAILS (Sistema de correos con Resend)
// ============================================
export const emails = pgTable('emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  from: text('from').notNull(), // Remitente
  to: text('to').notNull(), // Destinatario
  subject: text('subject').notNull(), // Asunto
  body: text('body').notNull(), // Cuerpo del email (HTML o texto)
  type: text('type').notNull().default('received'), // 'sent' o 'received'
  resendId: text('resend_id'), // ID de Resend para emails enviados
  status: text('status').notNull().default('pending'), // pending, sent, delivered, failed
  error: text('error'), // Error si falló el envío
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at'), // Cuando se marcó como leído
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
});

export const nfcCards = pgTable('nfc_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(), // Email del usuario para referencia rápida
  cardNumber: text('card_number').unique(), // Número visible en la tarjeta (opcional)
  cardholderName: text('cardholder_name'), // Nombre en la tarjeta (opcional)
  expiryDate: text('expiry_date'), // MM/YY (opcional)
  cardType: text('card_type').notNull().default('member'), // member, premium, etc.
  
  // Seguridad NFC
  cardUIDHash: text('card_uid_hash').notNull().unique(), // Hash SHA-256 del UID (para búsqueda)
  cardUIDEncrypted: text('card_uid_encrypted').notNull(), // UID encriptado (AES-256)
  encryptionIV: text('encryption_iv').notNull(), // Vector de inicialización para descifrado
  cardToken: text('card_token').notNull().unique(), // Token único para transacciones
  token: text('token').notNull().unique(), // Legacy token column (same as cardToken)
  
  qrCode: text('qr_code').unique(), // URL única para QR (opcional)
  status: text('status').notNull().default('active'), // active, inactive, lost, stolen
  deviceInfo: text('device_info'), // Info del dispositivo que registró la tarjeta (JSON)
  usageCount: integer('usage_count').notNull().default(0),
  
  // ============================================
  // CARD MANAGEMENT FEATURES (Added for Cards functionality)
  // ============================================
  cardLocked: boolean('card_locked').notNull().default(false), // Bloqueo/desbloqueo
  cardPin: text('card_pin'), // PIN hasheado con bcrypt
  
  // Settings (Configuraciones de seguridad)
  contactlessEnabled: boolean('contactless_enabled').notNull().default(true),
  onlineTransactionsEnabled: boolean('online_transactions_enabled').notNull().default(true),
  internationalUsageEnabled: boolean('international_usage_enabled').notNull().default(false),
  
  // Limits (Límites de gasto)
  dailyLimit: decimal('daily_limit', { precision: 10, scale: 2 }).notNull().default('500.00'),
  monthlyLimit: decimal('monthly_limit', { precision: 10, scale: 2 }).notNull().default('5000.00'),
  currentDailySpend: decimal('current_daily_spend', { precision: 10, scale: 2 }).notNull().default('0.00'),
  currentMonthlySpend: decimal('current_monthly_spend', { precision: 10, scale: 2 }).notNull().default('0.00'),
  
  // Timestamps
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  activatedAt: timestamp('activated_at'),
  lastUsedAt: timestamp('last_used_at'),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertNFCCardSchema = createInsertSchema(nfcCards, {
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  cardUIDHash: z.string(),
  cardUIDEncrypted: z.string(),
  encryptionIV: z.string(),
  cardToken: z.string(),
  deviceInfo: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  registeredAt: true,
  status: true,
  activatedAt: true,
  lastUsedAt: true,
  deactivatedAt: true,
});

// ============================================
// TRANSACTIONS (Historial de compras)
// ============================================
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  cardId: uuid('card_id').notNull().references(() => nfcCards.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  discountApplied: decimal('discount_applied', { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  pointsEarned: integer('points_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// ESTABLISHMENT REQUESTS (Solicitudes nuevas)
// ============================================
export const establishmentRequests = pgTable('establishment_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by').references(() => admins.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// LOGIN SCHEMAS
// ============================================
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(['user', 'establishment', 'admin']),
});

// ============================================
// PERKS (Ofertas y beneficios)
// ============================================
export const perks = pgTable('perks', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // discount, cashback, points, freebie
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  maxRedemptions: integer('max_redemptions'),
  currentRedemptions: integer('current_redemptions').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertPerkSchema = createInsertSchema(perks, {
  establishmentId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['discount', 'cashback', 'points', 'freebie']),
  value: z.string().or(z.number()),
  image: z.string().url().optional(),
  validFrom: z.date().or(z.string()),
  validUntil: z.date().or(z.string()),
  maxRedemptions: z.number().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentRedemptions: true,
});

// ============================================
// EVENTS (Eventos especiales)
// ============================================
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  capacity: integer('capacity'),
  currentAttendees: integer('current_attendees').notNull().default(0),
  ticketPrice: decimal('ticket_price', { precision: 10, scale: 2 }),
  image: text('image'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events, {
  establishmentId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  eventDate: z.date().or(z.string()),
  location: z.string().optional(),
  capacity: z.number().optional(),
  ticketPrice: z.string().or(z.number()).optional(),
  image: z.string().url().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAttendees: true,
});

// ============================================
// DROPS (TAPP Drops - recompensas)
// ============================================
export const drops = pgTable('drops', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  reward: text('reward').notNull(), // "RD$500", "Free meal", etc.
  triggerType: text('trigger_type').notNull(), // location, time, qr_scan, random
  triggerValue: text('trigger_value'), // coordinates, timestamp, etc.
  maxClaims: integer('max_claims'),
  currentClaims: integer('current_claims').notNull().default(0),
  expiresAt: timestamp('expires_at'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertDropSchema = createInsertSchema(drops, {
  establishmentId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  reward: z.string().min(3),
  triggerType: z.enum(['location', 'time', 'qr_scan', 'random']),
  triggerValue: z.string().optional(),
  maxClaims: z.number().optional(),
  expiresAt: z.date().or(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentClaims: true,
});

// ============================================
// PERK REDEMPTIONS
// ============================================
export const perkRedemptions = pgTable('perk_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  perkId: uuid('perk_id').notNull().references(() => perks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
});

// ============================================
// EVENT TICKETS
// ============================================
export const eventTickets = pgTable('event_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  purchasedAt: timestamp('purchased_at').notNull().defaultNow(),
});

// ============================================
// DROP CLAIMS
// ============================================
export const dropClaims = pgTable('drop_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  dropId: uuid('drop_id').notNull().references(() => drops.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  claimedAt: timestamp('claimed_at').notNull().defaultNow(),
});

// ============================================
// REVIEWS
// ============================================
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// USER FAVORITES
// ============================================
export const userFavorites = pgTable('user_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// USER MONTHLY STATS
// ============================================
export const userMonthlyStats = pgTable('user_monthly_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // Format: YYYY-MM
  placesTapped: integer('places_tapped').notNull().default(0),
  rewardsEarned: integer('rewards_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// MERCHANT ANALYTICS
// ============================================
export const merchantAnalytics = pgTable('merchant_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  totalTransactions: integer('total_transactions').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  uniqueCustomers: integer('unique_customers').notNull().default(0),
  averageTransaction: decimal('average_transaction', { precision: 10, scale: 2 }).notNull().default('0'),
});

// ============================================
// CAMPAIGNS
// ============================================
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // email, push, sms
  targetAudience: text('target_audience'), // all, gold, new_customers, etc.
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  status: text('status').notNull().default('draft'), // draft, scheduled, sent
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// TYPE EXPORTS
// ============================================
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Establishment = typeof establishments.$inferSelect;
export type InsertEstablishment = z.infer<typeof insertEstablishmentSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type NFCCard = typeof nfcCards.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type EstablishmentRequest = typeof establishmentRequests.$inferSelect;

export type Perk = typeof perks.$inferSelect;
export type InsertPerk = z.infer<typeof insertPerkSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Drop = typeof drops.$inferSelect;
export type InsertDrop = z.infer<typeof insertDropSchema>;


// ============================================
// TRANSACTIONS COMPLETA (Sistema NFC)
// ============================================
export const nfcTransactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: text('transaction_id').notNull().unique(),
  
  // Participantes
  userId: uuid('user_id').notNull().references(() => users.id),
  cardToken: text('card_token').references(() => nfcCards.cardToken),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id),
  
  // Montos
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountRate: decimal('discount_rate', { precision: 5, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  
  // Información adicional
  paymentMethod: text('payment_method'),
  tipAmount: decimal('tip_amount', { precision: 10, scale: 2 }).default('0.00'),
  items: text('items'), // JSON string
  notes: text('notes'),
  receiptUrl: text('receipt_url'),
  
  // Comisiones
  tappCommissionRate: decimal('tapp_commission_rate', { precision: 5, scale: 2 }),
  tappCommissionAmount: decimal('tapp_commission_amount', { precision: 10, scale: 2 }),
  merchantNetAmount: decimal('merchant_net_amount', { precision: 10, scale: 2 }),
  
  // Estado
  status: text('status').notNull().default('completed'),
  completedAt: timestamp('completed_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// ESTABLISHMENT USER STATS
// ============================================
export const establishmentUserStats = pgTable('establishment_user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  
  // Estadísticas
  visitCount: integer('visit_count').notNull().default(0),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalSaved: decimal('total_saved', { precision: 10, scale: 2 }).notNull().default('0.00'),
  averageTicket: decimal('average_ticket', { precision: 10, scale: 2 }).notNull().default('0.00'),
  
  firstVisitAt: timestamp('first_visit_at'),
  lastVisitAt: timestamp('last_visit_at'),
  
  // Preferencias detectadas (JSON)
  preferences: text('preferences'),
  customerTier: text('customer_tier'), // 'NEW' | 'REGULAR' | 'VIP' | 'INACTIVE'
  isFavorite: boolean('is_favorite').notNull().default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// DISCOUNT CAMPAIGNS
// ============================================
export const discountCampaigns = pgTable('discount_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: text('campaign_id').notNull().unique(),
  
  establishmentId: uuid('establishment_id').notNull().references(() => establishments.id, { onDelete: 'cascade' }),
  
  name: text('name').notNull(),
  description: text('description'),
  
  // Descuento
  discountType: text('discount_type').notNull(), // 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  
  // Condiciones
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  appliesTo: text('applies_to').notNull().default('all'), // 'all' | 'new_customers' | 'returning_customers'
  targetUserIds: text('target_user_ids'), // JSON string array
  
  // Programación
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  
  // Límites
  maxUses: integer('max_uses'),
  maxUsesPerUser: integer('max_uses_per_user'),
  currentUses: integer('current_uses').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// ACTIVITY LOGS
// ============================================
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  eventType: text('event_type').notNull(), // 'nfc_scan', 'transaction', 'login', 'card_registered', etc.
  
  userId: uuid('user_id').references(() => users.id),
  establishmentId: uuid('establishment_id').references(() => establishments.id),
  
  eventData: text('event_data'), // JSON string
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// INSERT SCHEMAS para nuevas tablas
// ============================================
export const insertNFCTransactionSchema = createInsertSchema(nfcTransactions, {
  transactionId: z.string(),
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  subtotal: z.number().or(z.string()),
  discountRate: z.number().or(z.string()),
  discountAmount: z.number().or(z.string()),
  total: z.number().or(z.string()),
}).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertEstablishmentUserStatsSchema = createInsertSchema(establishmentUserStats, {
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCampaignSchema = createInsertSchema(discountCampaigns, {
  campaignId: z.string(),
  establishmentId: z.string().uuid(),
  name: z.string().min(3),
  discountType: z.enum(['percentage', 'fixed_amount', 'buy_x_get_y']),
  discountValue: z.number().or(z.string()),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
}).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs, {
  eventType: z.string(),
}).omit({
  id: true,
  createdAt: true,
});

// ============================================
// CARD REQUESTS (Solicitudes de tarjetas)
// ============================================
export const cardRequests = pgTable('card_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Form data from user
  fullName: text('full_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  idNumber: text('id_number').notNull(), // Cédula
  phoneNumber: text('phone_number').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code'),
  occupation: text('occupation'),
  monthlyIncome: text('monthly_income'),
  requestReason: text('request_reason'), // Why they want the card
  
  // Status tracking
  status: text('status').notNull().default('pending'), // 'pending', 'under_review', 'approved', 'rejected'
  rejectionReason: text('rejection_reason'),
  reviewedAt: timestamp('reviewed_at', { mode: 'string' }),
  reviewNotes: text('review_notes'), // Admin notes (includes reviewer info)
  
  // Card creation tracking
  cardId: uuid('card_id').references(() => nfcCards.id), // Set when card is created
  approvedAt: timestamp('approved_at', { mode: 'string' }),
  
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================
// CARD ISSUE REPORTS (Reportes de problemas con tarjetas desde mobile app)
// ============================================
export const cardIssueReports = pgTable('card_issue_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  cardId: uuid('card_id').notNull().references(() => nfcCards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  issueType: text('issue_type').notNull(), // 'tap_not_working', 'card_damaged', 'wrong_charge', 'fraud', 'other'
  description: text('description').notNull(),
  
  // Device info
  deviceModel: text('device_model'),
  deviceOS: text('device_os'),
  appVersion: text('app_version'),
  
  // Status
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by').references(() => admins.id),
  resolutionNotes: text('resolution_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CARD REPORTS (Reportes de problemas con tarjetas)
// ============================================
export const cardReports = pgTable('card_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  cardId: uuid('card_id').notNull().references(() => nfcCards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportType: text('report_type').notNull(), // 'lost', 'stolen', 'damaged', 'fraud', 'other'
  description: text('description'),
  status: text('status').notNull().default('pending'), // 'pending', 'in_progress', 'resolved', 'closed'
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CARD CONFIG HISTORY (Historial de cambios de configuración)
// ============================================
export const cardConfigHistory = pgTable('card_config_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  cardId: uuid('card_id').notNull().references(() => nfcCards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'lock_card', 'unlock_card', 'change_pin', 'update_limits', etc.
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// INSERT SCHEMAS para gestión de tarjetas
// ============================================
export const insertCardReportSchema = createInsertSchema(cardReports, {
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  reportType: z.enum(['lost', 'stolen', 'damaged', 'fraud', 'other']),
  description: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardConfigHistorySchema = createInsertSchema(cardConfigHistory, {
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
}).omit({
  id: true,
  createdAt: true,
});


// ============================================
// INSERT SCHEMAS para Card Requests e Issue Reports
// ============================================
export const insertCardRequestSchema = createInsertSchema(cardRequests, {
  userId: z.string().uuid(),
  fullName: z.string().min(3),
  dateOfBirth: z.string(),
  idNumber: z.string().min(11).max(11), // Cédula dominicana
  phoneNumber: z.string(),
  address: z.string().min(10),
  city: z.string(),
  occupation: z.string().optional(),
  monthlyIncome: z.string().optional(),
  requestReason: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  cardId: true,
  approvedAt: true,
});

export const insertCardIssueReportSchema = createInsertSchema(cardIssueReports, {
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  issueType: z.enum(['tap_not_working', 'card_damaged', 'wrong_charge', 'fraud', 'other']),
  description: z.string().min(10),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

// ============================================
// SUPPORT CHATS (Sistema de soporte)
// ============================================
export const supportChats = pgTable('support_chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // Puede ser user o establishment ID
  status: text('status').notNull().default('open'), // open, closed, escalated
  priority: text('priority').notNull().default('normal'), // low, normal, high, urgent
  subject: text('subject'),
  category: text('category'), // general, card_issue, technical, billing, other
  
  // Información del usuario para referencia rápida
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  userPhone: text('user_phone'),
  
  // Metadatos del dispositivo
  deviceInfo: text('device_info'), // JSON: {device, os, version, location}
  
  // Admin asignado
  assignedAdminId: uuid('assigned_admin_id').references(() => admins.id),
  
  // Notas internas (solo admin)
  internalNotes: text('internal_notes'),
  
  // Chatbot state
  botActive: boolean('bot_active').notNull().default(true), // Si el bot está activo o pasó a humano
  botNegativeCount: integer('bot_negative_count').notNull().default(0), // Contador de respuestas "No resolvió"
  botAskedQuestions: text('bot_asked_questions'), // JSON array de IDs de preguntas ya hechas
  
  // Timestamps
  lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertSupportChatSchema = createInsertSchema(supportChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

// ============================================
// CHAT MESSAGES (Mensajes del chat de soporte)
// ============================================
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').notNull().references(() => supportChats.id, { onDelete: 'cascade' }),
  
  // Quién envía el mensaje
  senderType: text('sender_type').notNull(), // user, admin
  senderId: uuid('sender_id').notNull(), // ID del usuario o admin
  senderName: text('sender_name').notNull(),
  
  // Contenido del mensaje
  messageType: text('message_type').notNull().default('text'), // text, image, file, banner
  content: text('content').notNull(),
  
  // Para archivos/imágenes
  attachmentUrl: text('attachment_url'),
  attachmentType: text('attachment_type'), // image/jpeg, application/pdf, etc.
  attachmentName: text('attachment_name'),
  
  // Para mensajes tipo "cinta" (banner)
  bannerColor: text('banner_color'), // Para mensajes cinta especiales del admin
  
  // Metadatos
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
