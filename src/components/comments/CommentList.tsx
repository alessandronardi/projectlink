'use client';

import { User, Shield, Loader2 } from 'lucide-react';
import type { Comment } from '@/types/database';
import { cn } from '@/lib/utils';

interface CommentListProps {
  comments: Comment[];
  ticketId: string;
  isAdmin: boolean;
  isLoading?: boolean;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CommentList({ comments, ticketId: _ticketId, isAdmin: _isAdmin, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" role="status" aria-label="Caricamento commenti">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
        <span className="sr-only">Caricamento commenti...</span>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm" role="status">
        Nessun commento ancora. Sii il primo a commentare!
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label={`Lista commenti - ${comments.length} ${comments.length === 1 ? 'commento' : 'commenti'}`}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  const isAdminComment = comment.is_admin;

  return (
    <article
      className={cn(
        'rounded-lg p-4 border',
        isAdminComment
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-gray-50 border-gray-200'
      )}
      role="listitem"
      aria-label={`Commento di ${comment.author_name}${isAdminComment ? ' (Admin)' : ''}`}
    >
      {/* Comment Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full',
            isAdminComment ? 'bg-indigo-100' : 'bg-gray-200'
          )}
          aria-hidden="true"
        >
          {isAdminComment ? (
            <Shield className="h-4 w-4 text-indigo-600" />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-sm truncate',
                isAdminComment ? 'text-indigo-700' : 'text-gray-700'
              )}
            >
              {comment.author_name}
            </span>
            {isAdminComment && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                Admin
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {formatDateTime(comment.created_at)}
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap pl-9">
        {comment.content}
      </p>
    </article>
  );
}
