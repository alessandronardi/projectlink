import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByTicket } from '@/lib/comments';

/**
 * GET /api/comments/[ticketId]
 * Get all comments for a specific ticket
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId è obbligatorio' },
        { status: 400 }
      );
    }

    const comments = await getCommentsByTicket(ticketId);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore durante il recupero dei commenti' },
      { status: 500 }
    );
  }
}
