'use client';

import { useState } from 'react';
import { TicketCard } from './TicketCard';
import type { Ticket, TicketStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  isAdmin: boolean;
  onDragStart?: (ticket: Ticket) => void;
  onDragEnd?: () => void;
  onDrop?: (status: TicketStatus) => void;
  isDragOver?: boolean;
  onTicketSelect?: (ticket: Ticket) => void;
}

const STATUS_STYLES: Record<TicketStatus, { bg: string; border: string; header: string }> = {
  todo: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    header: 'bg-slate-100 text-slate-700',
  },
  in_progress: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100 text-blue-700',
  },
  done: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    header: 'bg-green-100 text-green-700',
  },
};

export function KanbanColumn({
  status,
  title,
  tickets,
  isAdmin,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragOver,
  onTicketSelect,
}: KanbanColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const styles = STATUS_STYLES[status];

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    if (onDrop) {
      onDrop(status);
    }
  };

  return (
    <section
      className={cn(
        'flex flex-col rounded-lg border min-h-[400px] transition-all',
        styles.bg,
        styles.border,
        isDropTarget && isDragOver && 'ring-2 ring-indigo-400 ring-offset-2'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`Colonna ${title} - ${tickets.length} ${tickets.length === 1 ? 'ticket' : 'ticket'}`}
      role="region"
    >
      {/* Column Header */}
      <div className={cn('px-4 py-3 rounded-t-lg font-medium', styles.header)}>
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm opacity-75">
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Tickets Container */}
      <div 
        className="flex-1 p-3 space-y-3 overflow-y-auto"
        role="list"
        aria-label={`Lista ticket ${title}`}
      >
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm" role="status">
            Nessun ticket
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isAdmin={isAdmin}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onSelect={onTicketSelect}
            />
          ))
        )}
      </div>
    </section>
  );
}
