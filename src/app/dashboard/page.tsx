'use client';

import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Loader2, Archive } from 'lucide-react';
import type { ProjectWithTicketCount } from '@/types/database';

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithTicketCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (includeArchived: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/list?includeArchived=${includeArchived}`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei progetti');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(showArchived);
  }, [showArchived]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchProjects(showArchived);
  };

  const handleArchiveToggle = (projectId: string, archived: boolean) => {
    if (!showArchived && archived) {
      // Remove from list if we're not showing archived and project was just archived
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } else {
      // Update the project in the list
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, archived } : p
      ));
    }
  };

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Caricamento in corso">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
        <span className="sr-only">Caricamento progetti...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">I Miei Progetti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci i tuoi progetti e le richieste dei clienti
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
            aria-label={showArchived ? 'Nascondi progetti archiviati' : 'Mostra progetti archiviati'}
          >
            <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
            {showArchived ? 'Nascondi Archiviati' : 'Mostra Archiviati'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)} aria-label="Crea nuovo progetto">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Crea Nuovo Progetto
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200" role="status">
          <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun progetto
          </h3>
          <p className="text-gray-600 mb-4">
            Crea il tuo primo progetto per iniziare a gestire le richieste dei clienti.
          </p>
          <Button onClick={() => setIsModalOpen(true)} aria-label="Crea il tuo primo progetto">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Crea Nuovo Progetto
          </Button>
        </div>
      ) : (
        <>
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Lista progetti attivi"
            >
              {activeProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onArchiveToggle={handleArchiveToggle}
                />
              ))}
            </div>
          )}

          {/* Archived Projects */}
          {showArchived && archivedProjects.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4 flex items-center gap-2">
                <Archive className="h-5 w-5" aria-hidden="true" />
                Progetti Archiviati
              </h2>
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Lista progetti archiviati"
              >
                {archivedProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onArchiveToggle={handleArchiveToggle}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* New Project Modal */}
      <NewProjectModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
}
