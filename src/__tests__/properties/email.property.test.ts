import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateEmailHtml, generateEmailText } from '@/lib/email';

/**
 * **Feature: project-link, Property 13: Email Notification Content**
 * **Validates: Requirements 6.2**
 * 
 * *For any* ticket, the notification email payload SHALL contain the ticket title,
 * description, priority, and dashboard link.
 */
describe('Property 13: Email Notification Content', () => {
  // Arbitrary for valid priority
  const priorityArb = fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<'low' | 'medium' | 'high'>;

  // Arbitrary for non-empty title
  const titleArb = fc.string({ minLength: 1, maxLength: 200 })
    .filter(s => s.trim().length > 0);

  // Arbitrary for optional description
  const descriptionArb = fc.option(
    fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
    { nil: null }
  );

  // Arbitrary for optional project name
  const projectNameArb = fc.option(
    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  );

  // Arbitrary for ticket notification data
  const notifyDataArb = fc.record({
    ticket_id: fc.uuid(),
    title: titleArb,
    description: descriptionArb,
    priority: priorityArb,
    project_name: projectNameArb,
  });

  const testAppUrl = 'http://localhost:3000';

  it('HTML email SHALL contain ticket title', () => {
    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const html = generateEmailHtml(data, testAppUrl);
        expect(html).toContain(data.title);
      }),
      { numRuns: 100 }
    );
  });

  it('HTML email SHALL contain ticket description when provided', () => {
    const dataWithDescriptionArb = fc.record({
      ticket_id: fc.uuid(),
      title: titleArb,
      description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
      priority: priorityArb,
      project_name: projectNameArb,
    });

    fc.assert(
      fc.property(dataWithDescriptionArb, (data) => {
        const html = generateEmailHtml(data, testAppUrl);
        expect(html).toContain(data.description);
      }),
      { numRuns: 100 }
    );
  });

  it('HTML email SHALL contain priority label in Italian', () => {
    const priorityLabels: Record<string, string> = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
    };

    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const html = generateEmailHtml(data, testAppUrl);
        expect(html).toContain(priorityLabels[data.priority]);
      }),
      { numRuns: 100 }
    );
  });

  it('HTML email SHALL contain dashboard link', () => {
    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const html = generateEmailHtml(data, testAppUrl);
        expect(html).toContain('/dashboard');
      }),
      { numRuns: 100 }
    );
  });

  it('Text email SHALL contain ticket title', () => {
    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const text = generateEmailText(data, testAppUrl);
        expect(text).toContain(data.title);
      }),
      { numRuns: 100 }
    );
  });

  it('Text email SHALL contain ticket description when provided', () => {
    const dataWithDescriptionArb = fc.record({
      ticket_id: fc.uuid(),
      title: titleArb,
      description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
      priority: priorityArb,
      project_name: projectNameArb,
    });

    fc.assert(
      fc.property(dataWithDescriptionArb, (data) => {
        const text = generateEmailText(data, testAppUrl);
        expect(text).toContain(data.description);
      }),
      { numRuns: 100 }
    );
  });

  it('Text email SHALL contain priority label in Italian', () => {
    const priorityLabels: Record<string, string> = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
    };

    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const text = generateEmailText(data, testAppUrl);
        expect(text).toContain(priorityLabels[data.priority]);
      }),
      { numRuns: 100 }
    );
  });

  it('Text email SHALL contain dashboard link', () => {
    fc.assert(
      fc.property(notifyDataArb, (data) => {
        const text = generateEmailText(data, testAppUrl);
        expect(text).toContain('/dashboard');
      }),
      { numRuns: 100 }
    );
  });

  it('HTML email SHALL contain project name when provided', () => {
    const dataWithProjectArb = fc.record({
      ticket_id: fc.uuid(),
      title: titleArb,
      description: descriptionArb,
      priority: priorityArb,
      project_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    });

    fc.assert(
      fc.property(dataWithProjectArb, (data) => {
        const html = generateEmailHtml(data, testAppUrl);
        expect(html).toContain(data.project_name);
      }),
      { numRuns: 100 }
    );
  });

  it('Text email SHALL contain project name when provided', () => {
    const dataWithProjectArb = fc.record({
      ticket_id: fc.uuid(),
      title: titleArb,
      description: descriptionArb,
      priority: priorityArb,
      project_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    });

    fc.assert(
      fc.property(dataWithProjectArb, (data) => {
        const text = generateEmailText(data, testAppUrl);
        expect(text).toContain(data.project_name);
      }),
      { numRuns: 100 }
    );
  });
});
