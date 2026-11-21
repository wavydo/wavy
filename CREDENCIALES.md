# 🔐 Credenciales de Prueba - TAPP System

## ✅ Base de Datos Poblada

La base de datos ya tiene datos de prueba. Usa estas credenciales para probar el sistema:

---

## 👨‍💼 ADMIN
```
Email: admin@tapp.do
Password: admin123
URL: http://localhost:3001/auth
Tipo: admin
```

---

## 👤 USUARIOS (Clientes con Tarjeta TAPP)

### Usuario 1 - María Castillo (Gold)
```
Email: maria@example.com
Password: user123
Puntos: 5,000
Nivel: Gold
Tarjeta NFC: TAPP-659IOX5R
Total Gastado: RD$45,000
```

### Usuario 2 - Juan Sánchez (Silver)
```
Email: juan@example.com
Password: user123
Puntos: 2,500
Nivel: Silver
Tarjeta NFC: TAPP-XK1W3BF9
Total Gastado: RD$25,000
```

### Usuario 3 - Ana Rodríguez (Bronze)
```
Email: ana@example.com
Password: user123
Puntos: 1,000
Nivel: Bronze
Tarjeta NFC: TAPP-3PPM834J
Total Gastado: RD$8,000
```

**Dashboard URL:** http://localhost:3001/dashboard/user

---

## 🏢 ESTABLECIMIENTOS (Negocios)

### 1. La Parrillada Premium
```
Email: laparrillada@example.com
Password: business123
Categoría: Restaurante
Descuento: 20%
Clientes: 247
Revenue: RD$450,000
Ciudad: Santo Domingo
```
**Perks Activos:**
- Cashback Base: 5%
- Happy Hour: 25% OFF (5PM-7PM)

**Eventos:**
- Noche de Jazz en Vivo (Próximo sábado, 8:00 PM)

**Drops:**
- Flash Sale con 50% OFF (30 cupos disponibles)

---

### 2. Café Bohemio
```
Email: cafebohemio@example.com
Password: business123
Categoría: Cafetería
Descuento: 15%
Clientes: 189
Revenue: RD$280,000
Ciudad: Santo Domingo
```
**Perks Activos:**
- Cashback Base: 5%
- Happy Hour: 25% OFF (5PM-7PM)

**Drops:**
- Flash Sale con 50% OFF (30 cupos disponibles)

---

### 3. Supermercado Nacional Plus
```
Email: nacionalplus@example.com
Password: business123
Categoría: Supermercado
Descuento: 10%
Clientes: 892
Revenue: RD$1,250,000
Ciudad: Santo Domingo
```
**Perks Activos:**
- Cashback Base: 5%

---

### 4. Farmacia San José
```
Email: farmaciasj@example.com
Password: business123
Categoría: Farmacia
Descuento: 12%
Clientes: 456
Revenue: RD$680,000
Ciudad: Santo Domingo
```
**Perks Activos:**
- Cashback Base: 5%

---

### 5. Barbería El Clásico
```
Email: barberiaclasico@example.com
Password: business123
Categoría: Barbería
Descuento: 25%
Clientes: 134
Revenue: RD$95,000
Ciudad: Santo Domingo
```
**Perks Activos:**
- Cashback Base: 5%

**Dashboard URL:** http://localhost:3001/dashboard/establishment

---

## 🚀 Cómo Probar

### 1. Iniciar el servidor
```bash
cd /Users/mignnez/Desktop/terra/tradearray-fukushima
npm run dev
```

### 2. Abrir navegador
```
http://localhost:3001
```

### 3. Login como Usuario
1. Ir a http://localhost:3001/auth
2. Click en "Soy Usuario"
3. Email: `maria@example.com`
4. Password: `user123`
5. ✅ Acceso a User Dashboard

### 4. Login como Negocio
1. Ir a http://localhost:3001/auth
2. Click en "Tengo un Negocio"
3. Email: `laparrillada@example.com`
4. Password: `business123`
5. ✅ Acceso a Business Dashboard

### 5. Login como Admin
1. Ir a http://localhost:3001/auth
2. Click en "Tengo un Negocio"
3. Email: `admin@tapp.do`
4. Password: `admin123`
5. Cambiar tipo a "admin" en consola (o usar endpoint directo)

---

## 📊 Datos en la Base de Datos

- ✅ 1 Admin
- ✅ 3 Usuarios con tarjetas NFC
- ✅ 5 Establecimientos aprobados
- ✅ 10+ Perks activos
- ✅ 1 Evento (Noche de Jazz)
- ✅ 2 Drops activos
- ✅ 10 Transacciones de ejemplo

---

## 🔄 Re-poblar la Base de Datos

Si necesitas resetear los datos:

```bash
# 1. Empujar schema (esto limpia las tablas)
npm run db:push

# 2. Volver a crear los datos
npm run db:seed
```

---

## ⚠️ Notas Importantes

1. **Autenticación Requerida**: No puedes acceder a los dashboards sin login
2. **Tipo de Usuario**: Cada dashboard valida que el usuario sea del tipo correcto
3. **Datos Reales**: TODO muestra datos de PostgreSQL, no mockups
4. **Cashback/Descuentos**: Los perks se crean al registrar establecimientos
5. **Eventos**: Solo La Parrillada tiene evento creado por ahora

---

## 🎯 Siguiente Paso

**PRUEBA EL SISTEMA:**
1. Login como negocio → Crea un perk nuevo
2. Login como usuario → Ve ese perk en tu dashboard
3. Redime el perk → Verifica que desaparezca/cambie estado

**TODO ESTÁ CONECTADO A LA BASE DE DATOS REAL** ✅
