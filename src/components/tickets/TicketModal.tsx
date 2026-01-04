'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { CommentList } from '@/components/comments/CommentList';
import { CommentForm } from '@/components/comments/CommentForm';
import { useRealtimeComments } from '@/hooks';
import type { Ticket, Comment, TicketPriority, TicketStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

const PRIORITY_STYLES: Record<TicketPriority, { label: string; className: string }> = {
  low: {
    label: 'Bassa',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  medium: {
    label: 'Media',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  high: {
    label: 'Alta',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

const STATUS_STYLES: Record<TicketStatus, { label: string; className: string }> = {
  todo: {
    label: 'Da Fare',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  in_progress: {
    label: 'In Lavorazione',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  done: {
    label: 'Completato',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TicketModal({ ticket, isOpen, onClose, isAdmin }: TicketModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!ticket) return;
    
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/comments/${ticket.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [ticket]);

  useEffect(() => {
    if (isOpen && ticket) {
      fetchComments();
    }
  }, [isOpen, ticket, fetchComments]);

  // Realtime comment subscription handlers
  const handleCommentInsert = useCallback((comment: Comment) => {
    setComments((prev) => {
      // Avoid duplicates (in case we just added it ourselves)
      if (prev.some((c) => c.id === comment.id)) {
        return prev;
      }
      // Insert in chronological order
      return [...prev, comment].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, []);

  const handleCommentUpdate = useCallback((comment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? comment : c))
    );
  }, []);

  const handleCommentDelete = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  // Subscribe to realtime comment changes
  useRealtimeComments({
    ticketId: isOpen && ticket ? ticket.id : null,
    onCommentInsert: handleCommentInsert,
    onCommentUpdate: handleCommentUpdate,
    onCommentDelete: handleCommentDelete,
  });

  const handleCommentAdded = () => {
    fetchComments();
  };

  if (!ticket) return null;

  const priorityStyle = PRIORITY_STYLES[ticket.priority];
  const statusStyle = STATUS_STYLES[ticket.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogTitle className="flex-1 text-xl">{ticket.title}</DialogTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={cn('text-xs', statusStyle.className)}>
              {statusStyle.label}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', priorityStyle.className)}>
              Priorità: {priorityStyle.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Ticket Details */}
          <div className="space-y-4">
            {ticket.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descrizione</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>Creato: {formatDate(ticket.created_at)} alle {formatTime(ticket.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>Aggiornato: {formatDate(ticket.updated_at)} alle {formatTime(ticket.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Comments Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Commenti ({comments.length})
            </h3>
            
            <CommentList 
              comments={comments} 
              ticketId={ticket.id} 
              isAdmin={isAdmin}
              isLoading={isLoadingComments}
            />

            <div className="mt-4">
              <CommentForm
                ticketId={ticket.id}
                isAdmin={isAdmin}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
