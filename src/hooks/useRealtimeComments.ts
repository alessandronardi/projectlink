'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Comment } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeCommentsOptions {
  ticketId: string | null;
  onCommentInsert?: (comment: Comment) => void;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
}

/**
 * Hook for subscribing to realtime comment changes for a specific ticket.
 * Handles INSERT, UPDATE, and DELETE events on the comments table.
 */
export function useRealtimeComments({
  ticketId,
  onCommentInsert,
  onCommentUpdate,
  onCommentDelete,
}: UseRealtimeCommentsOptions) {
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Comment>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          if (newRecord && newRecord.ticket_id === ticketId) {
            onCommentInsert?.(newRecord as Comment);
          }
          break;
        case 'UPDATE':
          if (newRecord && newRecord.ticket_id === ticketId) {
            onCommentUpdate?.(newRecord as Comment);
          }
          break;
        case 'DELETE':
          if (oldRecord && (oldRecord as { id?: string }).id) {
            onCommentDelete?.((oldRecord as { id: string }).id);
          }
          break;
      }
    },
    [ticketId, onCommentInsert, onCommentUpdate, onCommentDelete]
  );

  useEffect(() => {
    if (!ticketId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`comments:ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, handleChange]);
}
