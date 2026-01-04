import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateTicketStatus } from '@/lib/tickets';
import type { TicketStatus } from '@/types/database';

/**
 * PATCH /api/tickets - Update ticket status
 * Requires authentication (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'ticketId e status sono obbligatori' },
        { status: 400 }
      );
    }

    const validStatuses: TicketStatus[] = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status non valido' },
        { status: 400 }
      );
    }

    const ticket = await updateTicketStatus(ticketId, status);
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento del ticket' },
      { status: 500 }
    );
  }
}
