-- ProjectLink Database Schema
-- This file contains the complete database schema for the ProjectLink application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Admin can read their own projects
-- Validates: Requirements 1.2, 7.1
CREATE POLICY "Admin can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can insert their own projects
CREATE POLICY "Admin can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin can update their own projects
CREATE POLICY "Admin can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can delete their own projects
CREATE POLICY "Admin can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can read projects by slug (for portal access)
-- Validates: Requirements 3.1
CREATE POLICY "Public can read projects by slug"
  ON projects
  FOR SELECT
  TO anon
  USING (true);


-- ============================================
-- TICKETS POLICIES
-- ============================================

-- Admin can read all tickets in their projects
CREATE POLICY "Admin can read tickets in own projects"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tickets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can insert tickets in their projects
CREATE POLICY "Admin can insert tickets in own projects"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tickets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can update tickets in their projects
-- Validates: Requirements 2.2, 7.3
CREATE POLICY "Admin can update tickets in own projects"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tickets.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tickets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can delete tickets in their projects
CREATE POLICY "Admin can delete tickets in own projects"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tickets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Public can read all tickets (for portal view)
-- Validates: Requirements 3.1, 7.2
CREATE POLICY "Public can read tickets"
  ON tickets
  FOR SELECT
  TO anon
  USING (true);

-- Public can insert tickets (for new requests)
-- Validates: Requirements 3.2, 3.3, 7.4
CREATE POLICY "Public can insert tickets"
  ON tickets
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public CANNOT update tickets (status changes require auth)
-- Validates: Requirements 7.3
-- Note: No UPDATE policy for anon role means updates are rejected


-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Admin can read all comments in their project tickets
CREATE POLICY "Admin can read comments in own project tickets"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      JOIN projects ON projects.id = tickets.project_id
      WHERE tickets.id = comments.ticket_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can insert comments (with is_admin = true)
-- Validates: Requirements 2.4, 5.3
CREATE POLICY "Admin can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      JOIN projects ON projects.id = tickets.project_id
      WHERE tickets.id = comments.ticket_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can update their own comments
CREATE POLICY "Admin can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    is_admin = true AND
    EXISTS (
      SELECT 1 FROM tickets
      JOIN projects ON projects.id = tickets.project_id
      WHERE tickets.id = comments.ticket_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admin can delete comments in their project tickets
CREATE POLICY "Admin can delete comments in own project tickets"
  ON comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      JOIN projects ON projects.id = tickets.project_id
      WHERE tickets.id = comments.ticket_id
      AND projects.user_id = auth.uid()
    )
  );

-- Public can read all comments
CREATE POLICY "Public can read comments"
  ON comments
  FOR SELECT
  TO anon
  USING (true);

-- Public can insert comments (with is_admin = false)
-- Validates: Requirements 3.4, 5.2, 7.5
CREATE POLICY "Public can insert comments"
  ON comments
  FOR INSERT
  TO anon
  WITH CHECK (is_admin = false AND author_name IS NOT NULL AND author_name != '');


-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
-- Validates: Requirements 4.5
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on ticket changes
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for tickets and comments
-- Validates: Requirements 2.5, 3.5
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
