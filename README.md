# ProjectLink

A SaaS application for freelancers to manage client requests via shared Kanban boards. Clients can access projects through public links without authentication, view tickets, and submit new requests. Only the authenticated freelancer (admin) can modify ticket statuses and manage projects.

## Features

- **Project Management**: Create and manage multiple projects with unique public URLs
- **Kanban Board**: Visual ticket management with drag-and-drop status updates
- **Public Portal**: Share project links with clients for ticket viewing and submission
- **Real-time Updates**: Live synchronization using Supabase Realtime
- **Email Notifications**: Automatic notifications for new ticket submissions via Resend
- **Italian Interface**: Full Italian language support throughout the application
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Email**: Resend API
- **Testing**: Vitest + fast-check (property-based testing)

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for email notifications)

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Getting Resend API Key

1. Create an account at [resend.com](https://resend.com)
2. Go to API Keys and create a new key
3. Copy the key → `RESEND_API_KEY`

## Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# The schema file is located at:
supabase/schema.sql
```

This creates:
- `projects` table with RLS policies
- `tickets` table with status constraints
- `comments` table with admin flag support
- Indexes for performance
- Realtime subscriptions

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── comments/      # Comment CRUD
│   │   ├── notify/        # Email notifications
│   │   ├── projects/      # Project CRUD
│   │   └── tickets/       # Ticket CRUD
│   ├── dashboard/         # Admin dashboard (protected)
│   ├── login/             # Authentication page
│   └── portal/            # Public client portal
├── components/            # React components
│   ├── comments/          # Comment components
│   ├── kanban/            # Kanban board components
│   ├── projects/          # Project components
│   ├── tickets/           # Ticket components
│   └── ui/                # Shadcn/UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Business logic and utilities
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
    └── supabase/          # Supabase client utilities
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in Project Settings > Environment Variables
3. Deploy

### 3. Update Environment Variables

After deployment, update `NEXT_PUBLIC_APP_URL` to your Vercel domain:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Configure Supabase

Add your Vercel domain to Supabase:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to Site URL and Redirect URLs

## Usage

### Admin Workflow

1. Log in at `/login`
2. Create a new project from the dashboard
3. Share the portal link (`/portal/[slug]`) with clients
4. Manage tickets via drag-and-drop on the Kanban board
5. Respond to clients via comments

### Client Workflow

1. Access the shared portal link
2. View existing tickets and their status
3. Submit new requests via "Nuova Richiesta"
4. Add comments to communicate with the freelancer

## License

MIT
