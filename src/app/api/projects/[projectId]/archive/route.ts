import { createClient } from '@/utils/supabase/server';
import { archiveProject } from '@/lib/projects';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await request.json();
    const { archived } = body;

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'Il campo archived è obbligatorio' },
        { status: 400 }
      );
    }

    const project = await archiveProject(projectId, archived);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error archiving project:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'archiviazione del progetto' },
      { status: 500 }
    );
  }
}
