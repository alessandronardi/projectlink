import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { FolderKanban, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
              aria-label="Vai alla dashboard principale"
            >
              <FolderKanban className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <span className="font-semibold text-lg hidden sm:inline">ProjectLink</span>
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline" aria-label="Email utente">
                {user.email}
              </span>
              <form action="/api/auth/signout" method="post">
                <Button 
                  variant="ghost" 
                  size="sm"
                  type="submit"
                  aria-label="Esci dall'account"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline ml-1">Esci</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
