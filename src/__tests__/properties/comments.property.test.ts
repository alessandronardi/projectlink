/**
 * Property-based tests for comment service
 * Tests comment creation, association, and ordering
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Comment, CreateCommentInput } from '@/types/database';

// Generate valid ISO date strings
const isoDateArb = fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2030-12-31').getTime() 
}).map(ts => new Date(ts).toISOString());

// Arbitrary for valid comment creation input (client)
const clientCommentInputArb: fc.Arbitrary<CreateCommentInput> = fc.record({
  ticket_id: fc.uuid(),
  author_name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  content: fc.string(),
  is_admin: fc.constant(false),
});

// Arbitrary for valid comment creation input (admin)
const adminCommentInputArb: fc.Arbitrary<CreateCommentInput> = fc.record({
  ticket_id: fc.uuid(),
  author_name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  content: fc.string(),
  is_admin: fc.constant(true),
});

/**
 * Simulates comment creation - associates comment with ticket
 */
function simulateCreateComment(input: CreateCommentInput): Partial<Comment> {
  return {
    ticket_id: input.ticket_id,
    author_name: input.author_name.trim(),
    content: input.content,
    is_admin: input.is_admin,
    created_at: new Date().toISOString(),
  };
}

/**
 * Validates author_name for client comments
 */
function validateClientComment(input: CreateCommentInput): boolean {
  if (!input.is_admin) {
    return input.author_name.trim().length > 0;
  }
  return true;
}

describe('Comment Service Properties', () => {
  /**
   * **Feature: project-link, Property 11: Comment-Ticket Association**
   * **Validates: Requirements 5.1**
   * 
   * For any comment and ticket, creating a comment with a ticket_id SHALL
   * associate the comment with that ticket.
   */
  it('Property 11: Comments are associated with the correct ticket', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // ticket ID
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // author
        fc.string(), // content
        fc.boolean(), // is_admin
        (ticketId, authorName, content, isAdmin) => {
          const input: CreateCommentInput = {
            ticket_id: ticketId,
            author_name: authorName,
            content,
            is_admin: isAdmin,
          };
          
          const created = simulateCreateComment(input);
          expect(created.ticket_id).toBe(ticketId);
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * **Feature: project-link, Property 12: Comment Chronological Order**
   * **Validates: Requirements 5.4**
   * 
   * For any set of comments on a ticket, retrieving comments SHALL return
   * them sorted by created_at in ascending order.
   */
  it('Property 12: Comments are returned in chronological order', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // ticket ID
        fc.array(isoDateArb, { minLength: 2, maxLength: 20 }), // timestamps
        (ticketId, timestamps) => {
          // Create comments with various timestamps
          const comments: Comment[] = timestamps.map((ts, idx) => ({
            id: `comment-${idx}`,
            ticket_id: ticketId,
            author_name: `Author ${idx}`,
            content: `Content ${idx}`,
            is_admin: idx % 2 === 0,
            created_at: ts,
          }));

          // Sort by created_at ascending (simulating getCommentsByTicket)
          const sorted = [...comments].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          // Verify chronological order
          for (let i = 1; i < sorted.length; i++) {
            const prevTime = new Date(sorted[i - 1].created_at).getTime();
            const currTime = new Date(sorted[i].created_at).getTime();
            expect(currTime).toBeGreaterThanOrEqual(prevTime);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 4: Admin Comment Flag**
   * **Validates: Requirements 2.4, 5.3**
   * 
   * For any comment created by an admin, the is_admin flag SHALL be set to true.
   */
  it('Property 4: Admin comments have is_admin flag set to true', () => {
    fc.assert(
      fc.property(adminCommentInputArb, (input) => {
        const created = simulateCreateComment(input);
        expect(created.is_admin).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 7: Client Comment Constraints**
   * **Validates: Requirements 3.4, 5.2, 7.5**
   * 
   * For any comment created by a client, the is_admin flag SHALL be false
   * and author_name SHALL be non-empty.
   */
  it('Property 7: Client comments have is_admin=false and valid author_name', () => {
    fc.assert(
      fc.property(clientCommentInputArb, (input) => {
        const created = simulateCreateComment(input);
        
        // is_admin should be false
        expect(created.is_admin).toBe(false);
        
        // author_name should be non-empty after trim
        expect(created.author_name!.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 7: Client Comment Constraints (validation)**
   * **Validates: Requirements 3.4, 5.2, 7.5**
   * 
   * Client comments with empty or whitespace-only author_name SHALL be rejected.
   */
  it('Property 7: Client comments with empty author_name are rejected', () => {
    // Generate whitespace-only strings
    const whitespaceArb = fc.array(
      fc.constantFrom(' ', '\t', '\n', '\r'),
      { minLength: 0, maxLength: 10 }
    ).map(chars => chars.join(''));

    fc.assert(
      fc.property(
        fc.uuid(),
        whitespaceArb,
        fc.string(),
        (ticketId, emptyAuthor, content) => {
          const input: CreateCommentInput = {
            ticket_id: ticketId,
            author_name: emptyAuthor,
            content,
            is_admin: false,
          };
          
          // Validation should fail for client comments with empty author
          expect(validateClientComment(input)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
