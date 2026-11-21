# 🏆 Sistema TAPP - Documentación Completa

## 📋 Resumen

Sistema completo de autenticación y dashboards para la plataforma TAPP (Tarjetas NFC para negocios locales).

---

## 🎯 Tres Tipos de Usuarios

### 1. **USUARIOS** (Clientes con tarjetas)
- Registrarse libremente
- Ver sus tarjetas NFC
- Ver transacciones y ahorros
- Sistema de puntos y niveles
- Dashboard: `/dashboard/user`

### 2. **ESTABLECIMIENTOS** (Negocios locales)
- Solicitar acceso (debe ser aprobado por admin)
- Ver estadísticas de ventas
- Ver transacciones con clientes
- Gestionar perfil del negocio
- Dashboard: `/dashboard/establishment`

### 3. **ADMINS** (Equipo TAPP)
- Control total del sistema
- Aprobar/rechazar solicitudes de establecimientos
- Crear y gestionar tarjetas NFC tokenizadas
- Ver todos los usuarios y establecimientos
- Ver estadísticas globales
- Dashboard: `/dashboard/admin`

---

## 🗄️ Base de Datos (PostgreSQL con Drizzle ORM)

### Tablas Principales:

#### `users` - Clientes
```typescript
{
  id: uuid
  fullName: string
  email: string (unique)
  password: string (hasheado)
  phone?: string
  address?: string
  city?: string
  points: number (default 0)
  level: string (bronze, silver, gold, platinum)
  totalSpent: decimal
  monthlySpent: decimal
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `establishments` - Negocios
```typescript
{
  id: uuid
  businessName: string
  ownerName: string
  email: string (unique)
  password: string (hasheado)
  phone: string
  address: string
  city: string
  category: string (colmado, restaurante, farmacia, etc.)
  description?: string
  logo?: string
  discountPercentage: number (default 10)
  subscriptionPlan: string (starter, business, enterprise)
  subscriptionStatus: string (active, inactive, pending)
  totalCustomers: number
  totalRevenue: decimal
  approved: boolean (default false)
  approvedAt?: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `admins` - Equipo TAPP
```typescript
{
  id: uuid
  fullName: string
  email: string (unique)
  password: string (hasheado)
  role: string (admin, super_admin)
  createdAt: timestamp
}
```

#### `nfc_cards` - Tarjetas Tokenizadas
```typescript
{
  id: uuid
  userId: uuid (FK → users)
  cardNumber: string (unique) // TAPP-XXXXX
  token: string (unique) // Token hex de 64 caracteres
  qrCode: string (unique) // https://tapp.do/c/{token}
  status: string (active, inactive, lost, stolen)
  activatedAt?: timestamp
  lastUsedAt?: timestamp
  createdAt: timestamp
}
```

#### `transactions` - Historial
```typescript
{
  id: uuid
  userId: uuid (FK → users)
  establishmentId: uuid (FK → establishments)
  cardId: uuid (FK → nfc_cards)
  amount: decimal
  discountApplied: decimal
  finalAmount: decimal
  pointsEarned: number
  createdAt: timestamp
}
```

#### `establishment_requests` - Solicitudes
```typescript
{
  id: uuid
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  category: string
  description?: string
  status: string (pending, approved, rejected)
  rejectionReason?: string
  reviewedBy?: uuid (FK → admins)
  reviewedAt?: timestamp
  createdAt: timestamp
}
```

---

## 🔐 API Endpoints

### Autenticación

#### `POST /api/auth/register/user`
Registrar nuevo usuario (cliente)
```json
{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "8091234567",
  "address": "Calle Principal 123",
  "city": "Santo Domingo"
}
```

#### `POST /api/auth/register/establishment`
Solicitar acceso como establecimiento
```json
{
  "businessName": "Colmado Don Juan",
  "ownerName": "Juan García",
  "email": "donjuan@example.com",
  "phone": "8099876543",
  "address": "Av. Independencia 456",
  "city": "Santiago",
  "category": "colmado",
  "description": "Colmado familiar"
}
```

#### `POST /api/auth/login`
Login universal (usuarios, establecimientos, admins)
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "user" | "establishment" | "admin"
}
```

#### `POST /api/auth/logout`
Cerrar sesión

#### `GET /api/auth/me`
Obtener datos del usuario actual (requiere autenticación)

---

### Rutas de Usuario

#### `GET /api/user/profile`
Perfil del usuario con sus tarjetas

#### `GET /api/user/transactions`
Historial de transacciones del usuario

#### `GET /api/user/establishments/nearby`
Lista de establecimientos aprobados

---

### Rutas de Establecimiento

#### `GET /api/establishment/dashboard`
Dashboard con estadísticas del establecimiento

#### `PUT /api/establishment/profile`
Actualizar perfil del establecimiento

#### `GET /api/establishment/transactions`
Transacciones del establecimiento con detalles de clientes

---

### Rutas de Admin

#### `GET /api/admin/dashboard`
Dashboard con estadísticas globales

#### `GET /api/admin/requests`
Lista de solicitudes de establecimientos

#### `POST /api/admin/requests/:id/approve`
Aprobar solicitud y crear cuenta de establecimiento
```json
{
  "password": "temporal123"
}
```

#### `POST /api/admin/requests/:id/reject`
Rechazar solicitud
```json
{
  "reason": "Información incompleta"
}
```

#### `POST /api/admin/cards/create`
Crear tarjeta NFC para un usuario
```json
{
  "userId": "uuid-del-usuario"
}
```
Genera automáticamente:
- `cardNumber`: TAPP-XXXXXXXX
- `token`: hash hex de 64 caracteres
- `qrCode`: https://tapp.do/c/{token}

#### `GET /api/admin/users`
Lista de todos los usuarios

#### `GET /api/admin/establishments`
Lista de todos los establecimientos

#### `GET /api/admin/cards`
Lista de todas las tarjetas con info de usuario

---

### Procesamiento de Transacciones

#### `POST /api/transaction/process`
Procesar pago con tarjeta NFC
```json
{
  "token": "hex-token-de-64-caracteres",
  "establishmentId": "uuid-del-establecimiento",
  "amount": "1000.00"
}
```

Calcula automáticamente:
- Descuento basado en `discountPercentage` del establecimiento
- Monto final después del descuento
- Puntos ganados (10 puntos por cada RD$100)
- Actualiza estadísticas de usuario y establecimiento

---

## 🎨 Páginas Frontend

### Públicas
- `/` - Home (landing page)
- `/about` - Información sobre TAPP
- `/login` - Login universal
- `/register` - Registro de usuarios
- `/register/establishment` - Solicitud de establecimientos

### Privadas (requieren autenticación)
- `/dashboard/user` - Dashboard de usuario
- `/dashboard/establishment` - Dashboard de establecimiento
- `/dashboard/admin` - Dashboard de administración

---

## 🔒 Middleware de Autenticación

```typescript
// Verificar si está autenticado
requireAuth(req, res, next)

// Verificar si es usuario regular
requireUser(req, res, next)

// Verificar si es establecimiento
requireEstablishment(req, res, next)

// Verificar si es admin
requireAdmin(req, res, next)
```

---

## 🚀 Flujo de Uso

### Para Usuarios:
1. Registrarse en `/register`
2. Login en `/login` (userType: "user")
3. Contactar a TAPP para obtener tarjeta física
4. Admin crea tarjeta NFC y la asigna
5. Usuario tap-ea tarjeta en establecimientos
6. Ve ahorros y puntos en dashboard

### Para Establecimientos:
1. Solicitar acceso en `/register/establishment`
2. Esperar aprobación de admin
3. Recibir email con credenciales
4. Login en `/login` (userType: "establishment")
5. Ver transacciones y clientes en dashboard
6. Gestionar descuentos y perfil

### Para Admins:
1. Cuenta creada manualmente en BD
2. Login en `/login` (userType: "admin")
3. Revisar solicitudes de establecimientos
4. Aprobar/rechazar con contraseñas temporales
5. Crear tarjetas NFC para usuarios
6. Monitorear estadísticas globales

---

## 🛠️ Configuración Inicial

### 1. Configurar Base de Datos
```bash
# Crear archivo .env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-super-secret-key-here
```

### 2. Aplicar Schema
```bash
npm run db:push
```

### 3. Crear Admin Inicial (manualmente en BD)
```sql
INSERT INTO admins (full_name, email, password, role)
VALUES (
  'Admin TAPP',
  'admin@tapp.do',
  '$2a$10$hashed_password_here',
  'super_admin'
);
```

### 4. Iniciar Servidor
```bash
npm run dev
```

---

## 📝 Notas Importantes

1. **Seguridad:**
   - Todas las contraseñas se hashean con bcrypt
   - Sesiones HTTP-only cookies
   - Middleware de autenticación en todas las rutas privadas

2. **Tokens NFC:**
   - Únicos y no predecibles
   - 64 caracteres hexadecimales
   - Ligados a un usuario específico
   - Solo admins pueden crearlos

3. **Aprobación de Establecimientos:**
   - Manual por admins
   - Admin define contraseña inicial
   - Establecimiento puede cambiarla después

4. **Sistema de Puntos:**
   - 10 puntos por cada RD$100 gastados
   - Niveles: Bronze (0-499), Silver (500-1999), Gold (2000-4999), Platinum (5000+)

5. **Descuentos:**
   - Cada establecimiento define su porcentaje (5-30%)
   - Se aplica automáticamente en cada transacción
   - Se registra el ahorro en la transacción

---

## 🎯 Próximos Pasos

- [ ] Implementar reset de contraseña por email
- [ ] Dashboard para ver analytics con gráficas
- [ ] Sistema de notificaciones push
- [ ] Programa de referidos
- [ ] Integración con WhatsApp para alertas
- [ ] App móvil nativa para escanear NFC
- [ ] Sistema de eventos y retos comunitarios
- [ ] Marketplace B2B entre establecimientos

---

**Creado:** Enero 2025
**Stack:** Node.js, Express, PostgreSQL, Drizzle ORM, React, TypeScript
**Autor:** Equipo TAPP
