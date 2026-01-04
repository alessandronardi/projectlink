/**
 * Property-based tests for round-trip serialization
 * Tests that entities can be serialized to JSON and deserialized back to equivalent objects
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Ticket, Project, Comment, TicketStatus, TicketPriority } from '@/types/database';

// Arbitraries for generating valid test data
const ticketStatusArb = fc.constantFrom<TicketStatus>('todo', 'in_progress', 'done');
const ticketPriorityArb = fc.constantFrom<TicketPriority>('low', 'medium', 'high');

// Generate valid ISO date strings within a reasonable range
// Using integer timestamps to avoid invalid date issues
const isoDateArb = fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2030-12-31').getTime() 
}).map(ts => new Date(ts).toISOString());

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.uuid(),
  project_id: fc.uuid(),
  title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  description: fc.option(fc.string(), { nil: null }),
  status: ticketStatusArb,
  priority: ticketPriorityArb,
  created_at: isoDateArb,
  updated_at: isoDateArb,
});

const projectArb: fc.Arbitrary<Project> = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  slug: fc.stringMatching(/^[a-z0-9]{8,16}$/),
  created_at: isoDateArb,
});

const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: fc.uuid(),
  ticket_id: fc.uuid(),
  author_name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  content: fc.string(),
  is_admin: fc.boolean(),
  created_at: isoDateArb,
});

describe('Round-Trip Serialization Properties', () => {
  /**
   * **Feature: project-link, Property 16: Ticket Round-Trip Serialization**
   * **Validates: Requirements 9.3**
   * 
   * For any valid ticket object, serializing to JSON and deserializing
   * SHALL produce an equivalent ticket object.
   */
  it('Property 16: Ticket round-trip serialization preserves all fields', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const serialized = JSON.stringify(ticket);
        const deserialized: Ticket = JSON.parse(serialized);
        
        expect(deserialized.id).toBe(ticket.id);
        expect(deserialized.project_id).toBe(ticket.project_id);
        expect(deserialized.title).toBe(ticket.title);
        expect(deserialized.description).toBe(ticket.description);
        expect(deserialized.status).toBe(ticket.status);
        expect(deserialized.priority).toBe(ticket.priority);
        expect(deserialized.created_at).toBe(ticket.created_at);
        expect(deserialized.updated_at).toBe(ticket.updated_at);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 17: Project Round-Trip Serialization**
   * **Validates: Requirements 9.4**
   * 
   * For any valid project object, serializing to JSON and deserializing
   * SHALL produce an equivalent project object.
   */
  it('Property 17: Project round-trip serialization preserves all fields', () => {
    fc.assert(
      fc.property(projectArb, (project) => {
        const serialized = JSON.stringify(project);
        const deserialized: Project = JSON.parse(serialized);
        
        expect(deserialized.id).toBe(project.id);
        expect(deserialized.user_id).toBe(project.user_id);
        expect(deserialized.name).toBe(project.name);
        expect(deserialized.slug).toBe(project.slug);
        expect(deserialized.created_at).toBe(project.created_at);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: project-link, Property 18: Comment Round-Trip Serialization**
   * **Validates: Requirements 9.5**
   * 
   * For any valid comment object, serializing to JSON and deserializing
   * SHALL produce an equivalent comment object.
   */
  it('Property 18: Comment round-trip serialization preserves all fields', () => {
    fc.assert(
      fc.property(commentArb, (comment) => {
        const serialized = JSON.stringify(comment);
        const deserialized: Comment = JSON.parse(serialized);
        
        expect(deserialized.id).toBe(comment.id);
        expect(deserialized.ticket_id).toBe(comment.ticket_id);
        expect(deserialized.author_name).toBe(comment.author_name);
        expect(deserialized.content).toBe(comment.content);
        expect(deserialized.is_admin).toBe(comment.is_admin);
        expect(deserialized.created_at).toBe(comment.created_at);
      }),
      { numRuns: 100 }
    );
  });
});
