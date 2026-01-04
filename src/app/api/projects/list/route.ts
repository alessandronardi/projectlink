import { createClient } from '@/utils/supabase/server';
import { getProjects } from '@/lib/projects';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const projects = await getProjects(user.id);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento dei progetti' },
      { status: 500 }
    );
  }
}
