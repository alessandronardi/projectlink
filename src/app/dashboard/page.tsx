'use client';

import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';
import type { ProjectWithTicketCount } from '@/types/database';

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithTicketCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/list');
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
    fetchProjects();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchProjects(); // Refresh the list after closing modal
  };

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
        <Button onClick={() => setIsModalOpen(true)} aria-label="Crea nuovo progetto">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Crea Nuovo Progetto
        </Button>
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
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Lista progetti"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
}
