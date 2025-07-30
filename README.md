# A-List Narcos Hub

Premium tools and services for narcos operations - secure, reliable, and efficient.

## Features

- Discord OAuth Authentication
- User Management & Whitelist System
- Admin Dashboard with Analytics
- Trial System (7-day, 30-day)
- Real-time Page Tracking
- Secure Row Level Security (RLS)
- Mobile Responsive Design

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Discord OAuth via Supabase Auth
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_IDS=comma_separated_discord_ids
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

3. Set up Supabase database with the provided SQL schema

4. Run the development server:
```bash
npm run dev
```

## Database Setup

Run the SQL commands in `/docs/database-schema.sql` in your Supabase SQL editor to set up the required tables and RLS policies.

## Deployment

This project is optimized for deployment on Vercel with Supabase as the backend.

## License

Private - A-List Team