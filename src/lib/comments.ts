/**
 * Comment service for ProjectLink
 * Provides data access functions for comment CRUD operations
 */

import { createClient } from '@/utils/supabase/server';
import { validateAuthorName } from '@/lib/validation';
import type { Comment, CreateCommentInput } from '@/types/database';

/**
 * Get all comments for a specific ticket in chronological order
 * @param ticketId - The ticket ID to filter comments by
 * @returns Array of comments ordered by creation date (ascending)
 */
export async function getCommentsByTicket(ticketId: string): Promise<Comment[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new comment
 * @param input - The comment creation input
 * @returns The created comment
 * @throws Error if validation fails (client comments require author_name)
 */
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  // Validate author_name for client comments
  if (!input.is_admin && !validateAuthorName(input.author_name)) {
    throw new Error('Client comments require a non-empty author name');
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      ticket_id: input.ticket_id,
      author_name: input.author_name.trim(),
      content: input.content,
      is_admin: input.is_admin,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return data;
}
