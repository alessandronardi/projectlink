import { createClient } from '@/utils/supabase/server';
import { createProject } from '@/lib/projects';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Il nome del progetto è obbligatorio' },
        { status: 400 }
      );
    }

    const project = await createProject(user.id, { name: name.trim() });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del progetto' },
      { status: 500 }
    );
  }
}
