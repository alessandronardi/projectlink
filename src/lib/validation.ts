/**
 * Validation utilities for ProjectLink
 * Provides validators for ticket titles, priorities, author names, and slug generation
 */

import { TicketPriority } from '@/types/database';

// Valid priority values
const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];

/**
 * Validates a ticket title
 * @param title - The title to validate
 * @returns true if valid (non-empty and not just whitespace), false otherwise
 */
export function validateTitle(title: string): boolean {
  if (typeof title !== 'string') return false;
  return title.trim().length > 0;
}

/**
 * Validates a ticket priority
 * @param priority - The priority to validate
 * @returns true if valid ('low', 'medium', or 'high'), false otherwise
 */
export function validatePriority(priority: string): priority is TicketPriority {
  return VALID_PRIORITIES.includes(priority as TicketPriority);
}

/**
 * Validates an author name for client comments
 * @param authorName - The author name to validate
 * @returns true if valid (non-empty and not just whitespace), false otherwise
 */
export function validateAuthorName(authorName: string): boolean {
  if (typeof authorName !== 'string') return false;
  return authorName.trim().length > 0;
}

/**
 * Generates a secure random slug for project URLs
 * @param length - The length of the slug (default: 12)
 * @returns A random alphanumeric string
 */
export function generateSlug(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    slug += chars[randomValues[i] % chars.length];
  }
  return slug;
}

/**
 * Generates a unique slug by checking against existing slugs
 * @param existingSlugs - Set of existing slugs to check against
 * @param length - The length of the slug (default: 12)
 * @param maxAttempts - Maximum attempts to generate unique slug (default: 100)
 * @returns A unique slug not in the existing set
 * @throws Error if unable to generate unique slug after maxAttempts
 */
export function generateUniqueSlug(
  existingSlugs: Set<string>,
  length: number = 12,
  maxAttempts: number = 100
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const slug = generateSlug(length);
    if (!existingSlugs.has(slug)) {
      return slug;
    }
  }
  throw new Error(`Unable to generate unique slug after ${maxAttempts} attempts`);
}
