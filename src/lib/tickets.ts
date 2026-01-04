/**
 * Ticket service for ProjectLink
 * Provides data access functions for ticket CRUD operations
 */

import { createClient } from '@/utils/supabase/server';
import { validateTitle, validatePriority } from '@/lib/validation';
import type { Ticket, CreateTicketInput, TicketStatus } from '@/types/database';

/**
 * Get all tickets for a specific project
 * @param projectId - The project ID to filter tickets by
 * @returns Array of tickets ordered by creation date
 */
export async function getTicketsByProject(projectId: string): Promise<Ticket[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a ticket by its ID
 * @param ticketId - The ticket ID
 * @returns The ticket or null if not found
 */
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch ticket: ${error.message}`);
  }

  return data;
}


/**
 * Create a new ticket with default status "todo"
 * @param input - The ticket creation input
 * @returns The created ticket
 * @throws Error if validation fails
 */
export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  // Validate title
  if (!validateTitle(input.title)) {
    throw new Error('Ticket title cannot be empty or whitespace only');
  }

  // Validate priority
  if (!validatePriority(input.priority)) {
    throw new Error('Invalid priority. Must be "low", "medium", or "high"');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      project_id: input.project_id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      status: 'todo', // Always default to "todo"
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return data;
}

/**
 * Update a ticket's status and updated_at timestamp
 * @param ticketId - The ticket ID to update
 * @param status - The new status
 * @returns The updated ticket
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<Ticket> {
  const validStatuses: TicketStatus[] = ['todo', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Must be "todo", "in_progress", or "done"');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tickets')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket status: ${error.message}`);
  }

  return data;
}
