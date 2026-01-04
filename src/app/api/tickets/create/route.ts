import { NextRequest, NextResponse } from 'next/server';
import { createTicket } from '@/lib/tickets';
import { getProjectById } from '@/lib/projects';
import { validateTitle, validatePriority } from '@/lib/validation';
import type { TicketPriority } from '@/types/database';

/**
 * Send email notification for new ticket (non-blocking)
 * Requirements: 6.1, 6.3
 */
async function sendNotification(
  ticketId: string,
  title: string,
  description: string | undefined,
  priority: TicketPriority,
  projectName?: string
): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    await fetch(`${appUrl}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        title,
        description,
        priority,
        project_name: projectName,
      }),
    });
  } catch (error) {
    // Log error but don't block ticket creation (Requirement 6.3)
    console.error('Failed to send notification email:', error);
  }
}

/**
 * POST /api/tickets/create - Create a new ticket (public access)
 * Allows unauthenticated users to create tickets
 * Requirements: 6.1 - Sends email notification after ticket creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, title, description, priority } = body;

    // Validate required fields
    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id è obbligatorio' },
        { status: 400 }
      );
    }

    if (!validateTitle(title)) {
      return NextResponse.json(
        { error: 'Il titolo è obbligatorio e non può essere vuoto' },
        { status: 400 }
      );
    }

    if (!validatePriority(priority)) {
      return NextResponse.json(
        { error: 'Priorità non valida. Deve essere "low", "medium" o "high"' },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      project_id,
      title,
      description,
      priority: priority as TicketPriority,
    });

    // Get project name for email notification (non-blocking)
    let projectName: string | undefined;
    try {
      const project = await getProjectById(project_id);
      projectName = project?.name;
    } catch {
      // Ignore error, project name is optional for notification
    }

    // Send email notification (non-blocking, fire and forget)
    // Requirement 6.1, 6.3: Send notification but don't block on errors
    sendNotification(ticket.id, title, description, priority, projectName);

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del ticket' },
      { status: 500 }
    );
  }
}
