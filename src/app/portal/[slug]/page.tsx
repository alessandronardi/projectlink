'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban';
import { TicketModal } from '@/components/tickets';
import { NewTicketModal } from '@/components/tickets/NewTicketModal';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useRealtimeTickets } from '@/hooks';
import type { Project, Ticket } from '@/types/database';

export default function PublicPortalPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Progetto non trovato');
        }
        throw new Error('Errore nel caricamento del progetto');
      }
      const data = await response.json();
      setProject(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      return null;
    }
  }, [slug]);

  const fetchTickets = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/tickets/${projectId}`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei ticket');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const projectData = await fetchProject();
      if (projectData) {
        await fetchTickets(projectData.id);
      }
      setIsLoading(false);
    };
    loadData();
  }, [fetchProject, fetchTickets]);

  // Realtime ticket subscription handlers
  const handleTicketInsert = useCallback((ticket: Ticket) => {
    setTickets((prev) => [...prev, ticket]);
  }, []);

  const handleTicketUpdate = useCallback((ticket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? ticket : t))
    );
    // Update selected ticket if it's the one being updated
    setSelectedTicket((prev) =>
      prev && prev.id === ticket.id ? ticket : prev
    );
  }, []);

  const handleTicketDelete = useCallback((ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    // Close modal if the deleted ticket was selected
    setSelectedTicket((prev) => {
      if (prev && prev.id === ticketId) {
        setIsTicketModalOpen(false);
        return null;
      }
      return prev;
    });
  }, []);

  // Subscribe to realtime ticket changes (only when project is loaded)
  useRealtimeTickets({
    projectId: project?.id || '',
    onTicketInsert: handleTicketInsert,
    onTicketUpdate: handleTicketUpdate,
    onTicketDelete: handleTicketDelete,
  });

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleNewTicketSuccess = () => {
    setIsNewTicketModalOpen(false);
    if (project) {
      fetchTickets(project.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-label="Caricamento in corso">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
        <span className="sr-only">Caricamento progetto...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Progetto non trovato
          </h1>
          <p className="text-gray-600">
            Il link potrebbe essere errato o il progetto non esiste più.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Portale richieste
              </p>
            </div>
            <Button
              onClick={() => setIsNewTicketModalOpen(true)}
              aria-label="Crea nuova richiesta"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Nuova Richiesta
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Bacheca richieste">
        <KanbanBoard
          projectId={project.id}
          tickets={tickets}
          isAdmin={false}
          onTicketSelect={handleTicketSelect}
        />
      </main>

      {/* Ticket Detail Modal */}
      <TicketModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        isAdmin={false}
      />

      {/* New Ticket Modal */}
      <NewTicketModal
        projectId={project.id}
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSuccess={handleNewTicketSuccess}
      />
    </div>
  );
}
