'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, GripVertical } from 'lucide-react';
import type { Ticket, TicketPriority } from '@/types/database';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  isAdmin: boolean;
  onDragStart?: (ticket: Ticket) => void;
  onDragEnd?: () => void;
  onSelect?: (ticket: Ticket) => void;
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  });
}

export function TicketCard({
  ticket,
  isAdmin,
  onDragStart,
  onDragEnd,
  onSelect,
}: TicketCardProps) {
  const priorityStyle = PRIORITY_STYLES[ticket.priority];

  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(ticket);
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(ticket);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow bg-white',
        isAdmin && 'cursor-grab active:cursor-grabbing'
      )}
      draggable={isAdmin}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Ticket: ${ticket.title}, Priorità: ${priorityStyle.label}, Creato il ${formatDate(ticket.created_at)}`}
    >
      <CardContent className="p-4">
        {/* Header with drag handle and priority */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {isAdmin && (
            <GripVertical 
              className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" 
              aria-hidden="true"
            />
          )}
          <h3 className="flex-1 font-medium text-sm text-gray-900 line-clamp-2">
            {ticket.title}
          </h3>
          <Badge 
            variant="outline" 
            className={cn('text-xs flex-shrink-0', priorityStyle.className)}
          >
            {priorityStyle.label}
          </Badge>
        </div>

        {/* Description preview if exists */}
        {ticket.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {ticket.description}
          </p>
        )}

        {/* Footer with date */}
        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
          <span>{formatDate(ticket.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
