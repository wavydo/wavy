# Wavy

Proximity-based rewards platform that connects users with nearby businesses through smart location technology.

## Features

- **Location-based Discovery**: Get notified when you're near businesses with active offers
- **Automatic Rewards**: Collect points and unlock perks without scanning QR codes
- **User Dashboard**: Track rewards, browse nearby offers, and manage your account
- **Business Dashboard**: Manage offers, track analytics, and engage with customers
- **Admin Panel**: Complete administrative control over users, businesses, and transactions

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Authentication**: Passport.js, JWT, bcrypt
- **Real-time**: Socket.io
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/wavy.git
cd wavy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other configuration.

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── lib/         # Utilities and API clients
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── db/              # Database schema and client
│   └── middleware/      # Authentication and validation
└── dist/                # Production build output
```

## Deployment

This project is configured for automatic deployment on Render using `render.yaml`.

### Deploy to Render

1. Push to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml` and deploy
4. Add environment variables in Render dashboard

### Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random string for session encryption
- `NODE_ENV`: Set to `production`

## License

MIT

## Contact

hello@wavy.do
