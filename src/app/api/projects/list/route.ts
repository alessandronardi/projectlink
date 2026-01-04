import { createClient } from '@/utils/supabase/server';
import { getProjects } from '@/lib/projects';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const projects = await getProjects(user.id, includeArchived);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento dei progetti' },
      { status: 500 }
    );
  }
}
