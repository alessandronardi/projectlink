/**
 * Database types for ProjectLink
 * Defines TypeScript interfaces matching the Supabase PostgreSQL schema
 */

// Union types for constrained fields
export type TicketStatus = 'todo' | 'in_progress' | 'done';
export type TicketPriority = 'low' | 'medium' | 'high';

// Core entity interfaces
export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  archived: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  ticket_id: string;
  author_name: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

// Input types for create operations
export interface CreateProjectInput {
  name: string;
}

export interface CreateTicketInput {
  project_id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
}

export interface CreateCommentInput {
  ticket_id: string;
  author_name: string;
  content: string;
  is_admin: boolean;
}

// Project with ticket count for dashboard display
export interface ProjectWithTicketCount extends Project {
  ticket_count: number;
}
