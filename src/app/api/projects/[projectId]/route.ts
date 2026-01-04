import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getProjectById } from '@/lib/projects';

/**
 * GET /api/projects/[projectId] - Get a single project by ID
 * Requires authentication (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
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

    const { projectId } = await params;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId è obbligatorio' },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento del progetto' },
      { status: 500 }
    );
  }
}
