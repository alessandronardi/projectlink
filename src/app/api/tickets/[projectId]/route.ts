import { NextRequest, NextResponse } from 'next/server';
import { getTicketsByProject } from '@/lib/tickets';

/**
 * GET /api/tickets/[projectId] - Get all tickets for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId è obbligatorio' },
        { status: 400 }
      );
    }

    const tickets = await getTicketsByProject(projectId);
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento dei ticket' },
      { status: 500 }
    );
  }
}
