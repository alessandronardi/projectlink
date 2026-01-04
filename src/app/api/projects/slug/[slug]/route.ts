import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/projects';

/**
 * GET /api/projects/slug/[slug] - Get a project by its slug (public access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'slug è obbligatorio' },
        { status: 400 }
      );
    }

    const project = await getProjectBySlug(slug);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return NextResponse.json(
      { error: 'Errore durante il caricamento del progetto' },
      { status: 500 }
    );
  }
}
