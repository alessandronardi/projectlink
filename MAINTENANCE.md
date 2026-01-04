# ProjectLink Maintenance Documentation

This document provides technical details for maintaining and extending the ProjectLink application.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
3. [API Routes](#api-routes)
4. [Component Architecture](#component-architecture)
5. [Troubleshooting](#troubleshooting)

---

## Database Schema

The application uses three main tables in PostgreSQL via Supabase.

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to auth.users (admin owner) |
| `name` | TEXT | Project display name |
| `slug` | TEXT | Unique URL-safe identifier for public access |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Tickets Table

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated |
| `project_id` | UUID | FOREIGN KEY | References projects.id |
| `title` | TEXT | NOT NULL | Ticket title |
| `description` | TEXT | nullable | Optional description |
| `status` | TEXT | CHECK constraint | One of: `todo`, `in_progress`, `done` |
| `priority` | TEXT | CHECK constraint | One of: `low`, `medium`, `high` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `ticket_id` | UUID | Foreign key to tickets |
| `author_name` | TEXT | Display name of comment author |
| `content` | TEXT | Comment content |
| `is_admin` | BOOLEAN | True if comment is from admin |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Indexes

```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

### Triggers

The `update_updated_at_column()` trigger automatically updates `updated_at` on ticket modifications:

```sql
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) Policies

RLS is enabled on all tables to enforce access control at the database level.

### Projects Policies

| Policy | Role | Operation | Rule |
|--------|------|-----------|------|
| Admin can read own projects | authenticated | SELECT | `auth.uid() = user_id` |
| Admin can insert own projects | authenticated | INSERT | `auth.uid() = user_id` |
| Admin can update own projects | authenticated | UPDATE | `auth.uid() = user_id` |
| Admin can delete own projects | authenticated | DELETE | `auth.uid() = user_id` |
| Public can read projects by slug | anon | SELECT | `true` (all projects) |

### Tickets Policies

| Policy | Role | Operation | Rule |
|--------|------|-----------|------|
| Admin can read tickets in own projects | authenticated | SELECT | Project ownership check |
| Admin can insert tickets in own projects | authenticated | INSERT | Project ownership check |
| Admin can update tickets in own projects | authenticated | UPDATE | Project ownership check |
| Admin can delete tickets in own projects | authenticated | DELETE | Project ownership check |
| Public can read tickets | anon | SELECT | `true` (all tickets) |
| Public can insert tickets | anon | INSERT | `true` (new requests) |

**Note**: No UPDATE policy for `anon` role means unauthenticated users cannot change ticket status.

### Comments Policies

| Policy | Role | Operation | Rule |
|--------|------|-----------|------|
| Admin can read comments in own project tickets | authenticated | SELECT | Project ownership via ticket |
| Admin can insert comments | authenticated | INSERT | Project ownership via ticket |
| Admin can update own comments | authenticated | UPDATE | `is_admin = true` + ownership |
| Admin can delete comments in own project tickets | authenticated | DELETE | Project ownership via ticket |
| Public can read comments | anon | SELECT | `true` |
| Public can insert comments | anon | INSERT | `is_admin = false AND author_name IS NOT NULL` |

---

## API Routes

### Projects API

#### `POST /api/projects`
Create a new project.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Project Name"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Project Name",
  "slug": "abc123xyz",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/projects/list`
Get all projects for the authenticated user.

**Authentication**: Required

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "slug": "abc123xyz",
    "ticket_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `GET /api/projects/slug/[slug]`
Get a project by its public slug.

**Authentication**: Not required

**Response**: `200 OK` - Project object

#### `GET /api/projects/[projectId]`
Get a project by ID.

**Authentication**: Required

**Response**: `200 OK` - Project object

### Tickets API

#### `POST /api/tickets/create`
Create a new ticket.

**Authentication**: Not required (public portal)

**Request Body**:
```json
{
  "project_id": "uuid",
  "title": "Ticket Title",
  "description": "Optional description",
  "priority": "low" | "medium" | "high"
}
```

**Response**: `201 Created` - Ticket object with `status: "todo"`

#### `PATCH /api/tickets`
Update ticket status.

**Authentication**: Required

**Request Body**:
```json
{
  "ticketId": "uuid",
  "status": "todo" | "in_progress" | "done"
}
```

**Response**: `200 OK` - Updated ticket object

#### `GET /api/tickets/[projectId]`
Get all tickets for a project.

**Authentication**: Not required

**Response**: `200 OK` - Array of tickets

### Comments API

#### `POST /api/comments`
Create a new comment.

**Authentication**: Not required (but affects `is_admin` flag)

**Request Body**:
```json
{
  "ticket_id": "uuid",
  "author_name": "Author Name",
  "content": "Comment content",
  "is_admin": false
}
```

**Response**: `201 Created` - Comment object

#### `GET /api/comments/[ticketId]`
Get all comments for a ticket.

**Authentication**: Not required

**Response**: `200 OK` - Array of comments (chronological order)

### Notifications API

#### `POST /api/notify`
Send email notification for new ticket.

**Request Body**:
```json
{
  "title": "Ticket Title",
  "description": "Ticket description",
  "priority": "high",
  "projectName": "Project Name",
  "dashboardUrl": "https://..."
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "id": "email-id"
}
```

---

## Component Architecture

### Directory Structure

```
src/components/
├── comments/
│   ├── CommentForm.tsx      # Form for adding comments
│   ├── CommentList.tsx      # Display comments chronologically
│   └── index.ts             # Barrel export
├── kanban/
│   ├── KanbanBoard.tsx      # Main board with 3 columns
│   ├── KanbanColumn.tsx     # Single status column
│   ├── TicketCard.tsx       # Individual ticket card
│   └── index.ts
├── projects/
│   ├── NewProjectModal.tsx  # Modal for creating projects
│   └── ProjectCard.tsx      # Project card for dashboard
├── tickets/
│   ├── NewTicketForm.tsx    # Form for creating tickets
│   ├── NewTicketModal.tsx   # Modal wrapper for ticket form
│   ├── TicketModal.tsx      # Ticket detail modal with comments
│   └── index.ts
└── ui/                      # Shadcn/UI components
```

### Key Components

#### KanbanBoard
- Renders three columns: "Da Fare", "In Lavorazione", "Completato"
- Handles drag-and-drop for admin users
- Subscribes to real-time ticket updates

#### TicketCard
- Displays ticket title, priority badge, creation date
- Draggable when `isAdmin=true`
- Clickable to open TicketModal

#### TicketModal
- Shows full ticket details
- Includes CommentList and CommentForm
- Subscribes to real-time comment updates

#### CommentList
- Displays comments in chronological order
- Visually distinguishes admin vs client comments
- Admin comments have blue styling

### Custom Hooks

#### `useRealtimeTickets(projectId)`
Subscribes to ticket changes for a project.

```typescript
const { tickets, loading, error } = useRealtimeTickets(projectId);
```

#### `useRealtimeComments(ticketId)`
Subscribes to comment changes for a ticket.

```typescript
const { comments, loading, error } = useRealtimeComments(ticketId);
```

### Data Flow

1. **Server Components** fetch initial data via lib functions
2. **Client Components** receive data as props
3. **Real-time hooks** subscribe to Supabase channels
4. **API routes** handle mutations
5. **Supabase triggers** broadcast changes to subscribers

---

## Troubleshooting

### Common Issues

#### "Non autorizzato" (401) on Dashboard

**Cause**: User session expired or not authenticated.

**Solution**:
1. Check if cookies are enabled
2. Clear browser storage and re-login
3. Verify Supabase Auth configuration

#### Tickets Not Updating in Real-time

**Cause**: Realtime subscription not active.

**Solution**:
1. Verify `supabase_realtime` publication includes tickets table
2. Check browser console for WebSocket errors
3. Ensure Supabase project has Realtime enabled

#### Email Notifications Not Sending

**Cause**: Resend configuration issue.

**Solution**:
1. Verify `RESEND_API_KEY` is set correctly
2. Check `ADMIN_EMAIL` is a valid email
3. Review Resend dashboard for delivery status
4. Check server logs for error messages

#### RLS Policy Violations

**Cause**: User attempting unauthorized operation.

**Solution**:
1. Verify user is authenticated for protected operations
2. Check that user owns the project for admin operations
3. Review RLS policies in Supabase dashboard

#### Slug Collision on Project Creation

**Cause**: Extremely rare - generated slug already exists.

**Solution**: The `generateUniqueSlug` function automatically retries with a new slug. If persistent, check for database issues.

### Debug Mode

Enable verbose logging by adding to `.env.local`:

```bash
DEBUG=true
```

### Database Queries

Useful queries for debugging:

```sql
-- Check all projects for a user
SELECT * FROM projects WHERE user_id = 'user-uuid';

-- Check tickets with their project
SELECT t.*, p.name as project_name 
FROM tickets t 
JOIN projects p ON t.project_id = p.id;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('projects', 'tickets', 'comments');

-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Health Checks

1. **Database**: Query `SELECT 1` via Supabase dashboard
2. **Auth**: Check `/api/auth/signout` returns 200
3. **Realtime**: Monitor WebSocket connection in browser DevTools
4. **Email**: Send test via Resend dashboard

### Performance Optimization

1. **Indexes**: Ensure all indexes from schema.sql are created
2. **Queries**: Use `.select()` with specific columns when possible
3. **Realtime**: Unsubscribe from channels when components unmount
4. **Caching**: Consider adding SWR or React Query for client-side caching

---

## Extending the Application

### Adding a New Entity

1. Add table to `supabase/schema.sql`
2. Create RLS policies
3. Add TypeScript types to `src/types/database.ts`
4. Create service functions in `src/lib/`
5. Add API routes in `src/app/api/`
6. Create components in `src/components/`

### Adding New Ticket Status

1. Update CHECK constraint in database
2. Update `TicketStatus` type in `src/types/database.ts`
3. Add column to KanbanBoard component
4. Update status colors in UI components

### Internationalization

Currently hardcoded to Italian. To add i18n:

1. Install `next-intl` or similar
2. Extract strings to translation files
3. Update components to use translation functions
4. Add language switcher component
