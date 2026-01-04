'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban';
import { TicketModal } from '@/components/tickets';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRealtimeTickets } from '@/hooks';
import type { Project, Ticket, TicketStatus } from '@/types/database';

export default function ProjectKanbanPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Progetto non trovato');
        }
        throw new Error('Errore nel caricamento del progetto');
      }
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  }, [projectId]);

  const fetchTickets = useCallback(async () => {
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
  }, [projectId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProject(), fetchTickets()]);
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

  // Subscribe to realtime ticket changes
  useRealtimeTickets({
    projectId,
    onTicketInsert: handleTicketInsert,
    onTicketUpdate: handleTicketUpdate,
    onTicketDelete: handleTicketDelete,
  });

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus, updated_at: new Date().toISOString() }
          : ticket
      )
    );

    try {
      const response = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello status');
      }

      // Refresh tickets to get server state
      await fetchTickets();
    } catch (err) {
      console.error('Error updating ticket status:', err);
      // Revert optimistic update on error
      await fetchTickets();
    }
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCopyLink = async () => {
    if (!project) return;
    const fullUrl = `${window.location.origin}/portal/${project.slug}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Caricamento in corso">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
        <span className="sr-only">Caricamento progetto...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12" role="alert">
        <p className="text-red-600 mb-4">{error || 'Progetto non trovato'}</p>
        <Button onClick={() => router.push('/dashboard')} aria-label="Torna alla dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Torna alla Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-sm font-mono">/portal/{project.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            aria-label={copied ? 'Link copiato negli appunti' : 'Copia link portale'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" aria-hidden="true" />
                Copiato!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                Copia Link
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/portal/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Apri portale pubblico per ${project.name}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
              Apri Portale
            </Link>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        projectId={projectId}
        tickets={tickets}
        isAdmin={true}
        onStatusChange={handleStatusChange}
        onTicketSelect={handleTicketSelect}
      />

      {/* Ticket Detail Modal */}
      <TicketModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        isAdmin={true}
      />
    </div>
  );
}
