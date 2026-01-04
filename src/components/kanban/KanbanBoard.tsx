'use client';

import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { Ticket, TicketStatus } from '@/types/database';

interface KanbanBoardProps {
  projectId: string;
  tickets: Ticket[];
  isAdmin: boolean;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onTicketSelect?: (ticket: Ticket) => void;
}

// projectId is passed for future use (e.g., realtime subscriptions)

const COLUMNS: { status: TicketStatus; title: string }[] = [
  { status: 'todo', title: 'Da Fare' },
  { status: 'in_progress', title: 'In Lavorazione' },
  { status: 'done', title: 'Completato' },
];

export function KanbanBoard({
  projectId: _projectId, // Reserved for realtime subscriptions (task 11)
  tickets,
  isAdmin,
  onStatusChange,
  onTicketSelect,
}: KanbanBoardProps) {
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);

  const handleDragStart = (ticket: Ticket) => {
    if (!isAdmin) return;
    setDraggedTicket(ticket);
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
  };

  const handleDrop = (targetStatus: TicketStatus) => {
    if (!isAdmin || !draggedTicket) return;
    
    if (draggedTicket.status !== targetStatus && onStatusChange) {
      onStatusChange(draggedTicket.id, targetStatus);
    }
    setDraggedTicket(null);
  };

  const getTicketsByStatus = (status: TicketStatus): Ticket[] => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      role="region"
      aria-label="Bacheca Kanban con tre colonne: Da Fare, In Lavorazione, Completato"
    >
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          title={column.title}
          tickets={getTicketsByStatus(column.status)}
          isAdmin={isAdmin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          isDragOver={draggedTicket !== null && draggedTicket.status !== column.status}
          onTicketSelect={onTicketSelect}
        />
      ))}
    </div>
  );
}
