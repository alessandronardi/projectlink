'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Ticket } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeTicketsOptions {
  projectId: string;
  onTicketInsert?: (ticket: Ticket) => void;
  onTicketUpdate?: (ticket: Ticket) => void;
  onTicketDelete?: (ticketId: string) => void;
}

/**
 * Hook for subscribing to realtime ticket changes for a specific project.
 * Handles INSERT, UPDATE, and DELETE events on the tickets table.
 */
export function useRealtimeTickets({
  projectId,
  onTicketInsert,
  onTicketUpdate,
  onTicketDelete,
}: UseRealtimeTicketsOptions) {
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Ticket>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          if (newRecord && newRecord.project_id === projectId) {
            onTicketInsert?.(newRecord as Ticket);
          }
          break;
        case 'UPDATE':
          if (newRecord && newRecord.project_id === projectId) {
            onTicketUpdate?.(newRecord as Ticket);
          }
          break;
        case 'DELETE':
          if (oldRecord && (oldRecord as { id?: string }).id) {
            onTicketDelete?.((oldRecord as { id: string }).id);
          }
          break;
      }
    },
    [projectId, onTicketInsert, onTicketUpdate, onTicketDelete]
  );

  useEffect(() => {
    if (!projectId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`tickets:project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `project_id=eq.${projectId}`,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, handleChange]);
}
