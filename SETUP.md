# 🚀 TAPP System - Complete Setup Guide

## ✅ System Status

The TAPP system has been completely integrated with **React dashboards connected to the real PostgreSQL database**. All hardcoded/fake data has been removed.

---

## 📋 Architecture Overview

### **Frontend:**
- **React** (TypeScript + Vite) - Main application framework
- **Wouter** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### **Backend:**
- **Express** - Node.js server
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Type-safe database queries
- **Express Session** - Authentication
- **bcryptjs** - Password hashing

### **Dashboard System:**
✅ All dashboards now use **React components** connected to real database
- `/dashboard/user` → React User Dashboard
- `/dashboard/establishment` → React Business Dashboard
- `/dashboard/admin` → React Admin Dashboard

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root with:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secret_key_here
NODE_ENV=development
PORT=3001
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Seed Test Data
```bash
npm run db:seed
```

This creates test accounts:

**Admin:**
- Email: `admin@tapp.do`
- Password: `admin123`

**Users:** (password: `user123`)
- `maria@example.com`
- `juan@example.com`
- `ana@example.com`

**Businesses:** (password: `business123`)
- `laparrillada@example.com` - La Parrillada Premium (Restaurant)
- `cafebohemio@example.com` - Café Bohemio (Coffee Shop)
- `nacionalplus@example.com` - Supermercado Nacional Plus
- `farmaciasj@example.com` - Farmacia San José
- `barberiaclasico@example.com` - Barbería El Clásico

### 5. Start Development Server
```bash
npm run dev
```

Server runs on: `http://localhost:3001`

---

## 🗂️ Project Structure

```
tradearray-fukushima/
├── client/
│   ├── src/                          # React application
│   │   ├── App.tsx                   # Main app with routing
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── UserDashboard.tsx     # ✅ User dashboard (connected to DB)
│   │   │   ├── EstablishmentDashboard.tsx # ✅ Business dashboard (connected to DB)
│   │   │   └── AdminDashboard.tsx    # ✅ Admin dashboard (connected to DB)
│   │   └── components/               # Reusable components
│   │       └── dashboard/            # Dashboard sections
│   │
│   └── public/                       # Static files (DEPRECATED HTML dashboards)
│       ├── company/*.html            # ⚠️ OLD - Now redirects to React
│       └── dashboard/*.html          # ⚠️ OLD - Now redirects to React
│
├── server/
│   ├── index.ts                      # Express server
│   ├── routes.ts                     # Authentication & basic routes
│   ├── tapp-routes.ts                # User dashboard API endpoints
│   ├── merchant-routes.ts            # Business dashboard API endpoints
│   ├── auth.ts                       # Auth middleware
│   ├── storage.ts                    # Database connection
│   └── seed-data.ts                  # Database seeding script
│
└── shared/
    └── schema.ts                     # Database schema & types
```

---

## 🔐 API Endpoints

### **Authentication**
- `POST /api/auth/register/user` - Register new user
- `POST /api/auth/register/establishment` - Submit establishment application
- `POST /api/auth/login` - Login (user/establishment/admin)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current session

### **User Dashboard** (`/api`)
- `GET /api/perks` - Get all active perks
- `POST /api/perks/:perkId/redeem` - Redeem a perk
- `GET /api/events` - Get upcoming events
- `POST /api/events/:eventId/purchase` - Buy event ticket
- `GET /api/drops` - Get active drops
- `POST /api/drops/:dropId/claim` - Claim a drop
- `GET /api/explore/establishments` - Search establishments
- `GET /api/explore/establishments/:id` - Get establishment details
- `POST /api/explore/establishments/:id/favorite` - Toggle favorite
- `POST /api/tap/process` - Process NFC tap transaction

### **Business Dashboard** (`/api/merchant`)
- `GET /api/merchant/dashboard` - Get dashboard overview with stats
- `GET /api/merchant/perks` - Get all merchant perks
- `POST /api/merchant/perks` - Create new perk
- `PUT /api/merchant/perks/:id` - Update perk
- `DELETE /api/merchant/perks/:id` - Delete perk
- `GET /api/merchant/events` - Get merchant events
- `POST /api/merchant/events` - Create new event
- `PUT /api/merchant/events/:id` - Update event
- `GET /api/merchant/drops` - Get merchant drops
- `POST /api/merchant/drops` - Create new drop
- `GET /api/merchant/customers` - Get customer list
- `GET /api/merchant/analytics` - Get analytics data
- `GET /api/merchant/reviews` - Get reviews
- `PUT /api/merchant/profile` - Update profile

### **Admin Dashboard** (`/api/admin`)
- `GET /api/admin/dashboard` - Get admin overview
- `GET /api/admin/requests` - Get establishment requests
- `POST /api/admin/requests/:id/approve` - Approve establishment
- `POST /api/admin/requests/:id/reject` - Reject establishment
- `GET /api/admin/users` - Get all users
- `GET /api/admin/establishments` - Get all establishments
- `POST /api/admin/cards/create` - Create NFC card

---

## 🎨 Design System

### **Colors (TAPP Black & White)**
```css
--ink: #0e1116        /* Primary black */
--surface: #ffffff    /* White */
--muted: #5b6472      /* Dark gray text */
--text-grey: #a1a3af  /* Light gray text */
--border: rgba(15, 23, 42, 0.08) /* Subtle borders */
```

### **Key Features**
- ✅ Minimalist flat design
- ✅ Desktop zoom: 85%
- ✅ Max-width: 1600px on main content
- ✅ Mobile responsive with collapsible sidebar
- ✅ Currency: RD$ (Dominican pesos)
- ✅ Consistent sidebar across all pages

---

## 🚨 Critical Changes Made

### **1. Server Routing** (`server/index.ts`)
- All `/company/*` URLs now redirect to `/dashboard/establishment` (React)
- All `/dashboard/*` HTML URLs redirect to `/dashboard/user` (React)
- Removed static HTML serving for dashboards
- Only serves assets from `/assets` and `/images`

### **2. Database Integration**
- All React dashboards fetch real data from PostgreSQL
- No more hardcoded/mockup data
- Real-time stats and transactions
- Complete CRUD operations for perks, events, drops

### **3. React Dashboard Components**
- `EstablishmentDashboard.tsx` - Fully functional business dashboard
- `UserDashboard.tsx` - Complete user experience dashboard
- Both connected to TanStack Query for data fetching
- Proper error handling and loading states

---

## 📱 Mobile App Future

The system is built with React to facilitate future mobile app conversion:
- All business logic in React components
- API-first architecture
- Reusable components
- Ready for React Native migration

---

## 🐛 Troubleshooting

### **"Error loading dashboard data"**
- Check if database is properly connected
- Run `npm run db:seed` to populate test data
- Verify `.env` has correct `DATABASE_URL`

### **Login not working**
- Make sure you've run `npm run db:seed`
- Use correct test credentials (see above)
- Check browser console for errors

### **Redirecting to HTML pages**
- Clear browser cache
- Restart development server
- Check `server/index.ts` has redirect rules

### **Missing data in dashboards**
- Run seed script: `npm run db:seed`
- Check API endpoints return data (use browser DevTools Network tab)
- Verify session authentication is working

---

## 🚀 Production Deployment

### 1. Build application:
```bash
npm run build
```

### 2. Set production environment variables:
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
SESSION_SECRET=strong_random_secret
```

### 3. Start production server:
```bash
npm start
```

---

## 📝 Next Steps

1. ✅ Database schema complete
2. ✅ All API endpoints working
3. ✅ React dashboards connected to database
4. ✅ Authentication system working
5. ✅ Seed data script ready
6. ⏳ Deploy to production
7. ⏳ Set up NFC card scanning
8. ⏳ Build mobile app (React Native)
9. ⏳ Add analytics dashboard
10. ⏳ Implement campaign system

---

## 📞 Support

For issues or questions, check:
- Browser console for frontend errors
- Server logs for backend errors
- Database connections in PostgreSQL client
- API responses in Network tab

---

## 🎉 You're Ready!

Everything is now connected to the real database. The HTML dashboards have been deprecated and all routes redirect to the proper React components that fetch real data from PostgreSQL.

**Start the server and test with the seed accounts!**
