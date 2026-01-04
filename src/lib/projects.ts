/**
 * Project service for ProjectLink
 * Provides data access functions for project CRUD operations
 */

import { createClient } from '@/utils/supabase/server';
import { generateUniqueSlug } from '@/lib/validation';
import type { Project, ProjectWithTicketCount, CreateProjectInput } from '@/types/database';

/**
 * Get all projects for a specific user with ticket counts
 * @param userId - The user ID to filter projects by
 * @param includeArchived - Whether to include archived projects
 * @returns Array of projects with ticket counts
 */
export async function getProjects(userId: string, includeArchived: boolean = false): Promise<ProjectWithTicketCount[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('projects')
    .select(`
      *,
      tickets(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (projects || []).map(project => ({
    id: project.id,
    user_id: project.user_id,
    name: project.name,
    slug: project.slug,
    archived: project.archived ?? false,
    created_at: project.created_at,
    ticket_count: project.tickets?.[0]?.count ?? 0,
  }));
}

/**
 * Get a project by its ID
 * @param projectId - The project ID
 * @returns The project or null if not found
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

/**
 * Get a project by its slug (for public portal access)
 * @param slug - The project slug
 * @returns The project or null if not found
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch project by slug: ${error.message}`);
  }

  return data;
}


/**
 * Create a new project with an auto-generated unique slug
 * @param userId - The user ID who owns the project
 * @param input - The project creation input
 * @returns The created project
 */
export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const supabase = await createClient();
  
  // Get existing slugs to ensure uniqueness
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('slug');
  
  const existingSlugs = new Set((existingProjects || []).map(p => p.slug));
  const slug = generateUniqueSlug(existingSlugs);

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: input.name,
      slug,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}


/**
 * Archive or unarchive a project
 * @param projectId - The project ID to archive/unarchive
 * @param archived - Whether to archive (true) or unarchive (false)
 * @returns The updated project
 */
export async function archiveProject(
  projectId: string,
  archived: boolean
): Promise<Project> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update({ archived })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to ${archived ? 'archive' : 'unarchive'} project: ${error.message}`);
  }

  return data;
}
