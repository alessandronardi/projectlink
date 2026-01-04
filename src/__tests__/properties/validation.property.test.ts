/**
 * Property-based tests for validation utilities
 * Tests slug uniqueness, title validation, and priority validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  generateSlug, 
  generateUniqueSlug, 
  validateTitle, 
  validatePriority 
} from '@/lib/validation';

describe('Validation Properties', () => {
  /**
   * **Feature: project-link, Property 1: Slug Uniqueness**
   * **Validates: Requirements 1.1, 1.3**
   * 
   * For any set of generated slugs, each slug SHALL be unique and non-empty.
   */
  it('Property 1: Generated slugs are unique and non-empty', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          const slugs = new Set<string>();
          for (let i = 0; i < count; i++) {
            const slug = generateSlug();
            expect(slug.length).toBeGreaterThan(0);
            slugs.add(slug);
          }
          // All slugs should be unique
          expect(slugs.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 1: Slug Uniqueness (with existing slugs)**
   * **Validates: Requirements 1.1, 1.3**
   * 
   * For any set of existing slugs, generateUniqueSlug SHALL return a slug
   * not in the existing set.
   */
  it('Property 1: generateUniqueSlug returns slug not in existing set', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z0-9]{12}$/), { minLength: 0, maxLength: 50 }),
        (existingSlugsArray) => {
          const existingSlugs = new Set(existingSlugsArray);
          const newSlug = generateUniqueSlug(existingSlugs);
          
          expect(newSlug.length).toBeGreaterThan(0);
          expect(existingSlugs.has(newSlug)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 8: Ticket Title Validation**
   * **Validates: Requirements 4.1**
   * 
   * For any string composed entirely of whitespace or empty,
   * creating a ticket with that title SHALL be rejected.
   */
  it('Property 8: Whitespace-only titles are rejected', () => {
    // Generate strings of only whitespace characters
    const whitespaceArb = fc.array(
      fc.constantFrom(' ', '\t', '\n', '\r'),
      { minLength: 0, maxLength: 20 }
    ).map(chars => chars.join(''));

    fc.assert(
      fc.property(
        whitespaceArb,
        (whitespaceTitle) => {
          expect(validateTitle(whitespaceTitle)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 8: Ticket Title Validation (valid titles)**
   * **Validates: Requirements 4.1**
   * 
   * For any non-empty string with at least one non-whitespace character,
   * the title SHALL be accepted.
   */
  it('Property 8: Non-empty titles with content are accepted', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (validTitle) => {
          expect(validateTitle(validTitle)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 9: Priority Validation**
   * **Validates: Requirements 4.3**
   * 
   * For any ticket creation attempt, the priority SHALL be one of
   * "low", "medium", or "high".
   */
  it('Property 9: Only valid priorities are accepted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('low', 'medium', 'high'),
        (validPriority) => {
          expect(validatePriority(validPriority)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 9: Priority Validation (invalid)**
   * **Validates: Requirements 4.3**
   * 
   * For any string that is not "low", "medium", or "high",
   * the priority SHALL be rejected.
   */
  it('Property 9: Invalid priorities are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !['low', 'medium', 'high'].includes(s)),
        (invalidPriority) => {
          expect(validatePriority(invalidPriority)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
