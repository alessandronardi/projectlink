import { NextRequest, NextResponse } from 'next/server';
import { createComment } from '@/lib/comments';
import { validateAuthorName } from '@/lib/validation';
import type { CreateCommentInput } from '@/types/database';

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket_id, author_name, content, is_admin } = body;

    // Validate required fields
    if (!ticket_id) {
      return NextResponse.json(
        { error: 'ticket_id è obbligatorio' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Il contenuto del commento è obbligatorio' },
        { status: 400 }
      );
    }

    // Validate author_name for client comments
    if (!is_admin && !validateAuthorName(author_name)) {
      return NextResponse.json(
        { error: 'Il nome autore è obbligatorio per i commenti dei clienti' },
        { status: 400 }
      );
    }

    const input: CreateCommentInput = {
      ticket_id,
      author_name: author_name?.trim() || 'Admin',
      content: content.trim(),
      is_admin: Boolean(is_admin),
    };

    const comment = await createComment(input);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore durante la creazione del commento' },
      { status: 500 }
    );
  }
}
