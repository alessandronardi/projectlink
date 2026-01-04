'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
  ticketId: string;
  isAdmin: boolean;
  onCommentAdded: () => void;
}

export function CommentForm({ ticketId, isAdmin, onCommentAdded }: CommentFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate content
    if (!content.trim()) {
      setError('Il commento non può essere vuoto');
      return;
    }

    // Validate author_name for client comments
    if (!isAdmin && !authorName.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          author_name: isAdmin ? 'Admin' : authorName.trim(),
          content: content.trim(),
          is_admin: isAdmin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante l\'invio del commento');
      }

      // Clear form on success
      setAuthorName('');
      setContent('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Modulo nuovo commento">
      {/* Author name field - only for clients */}
      {!isAdmin && (
        <div className="space-y-2">
          <Label htmlFor="author-name">
            Il tuo nome <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(obbligatorio)</span>
          </Label>
          <Input
            id="author-name"
            placeholder="Inserisci il tuo nome"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={isLoading}
            aria-describedby={error && !authorName.trim() ? 'author-error' : undefined}
            aria-invalid={!!error && !authorName.trim()}
            aria-required="true"
          />
        </div>
      )}

      {/* Comment content */}
      <div className="space-y-2">
        <Label htmlFor="comment-content">
          {isAdmin ? 'Rispondi al cliente' : 'Il tuo messaggio'}
        </Label>
        <Textarea
          id="comment-content"
          placeholder={isAdmin ? 'Scrivi una risposta...' : 'Scrivi un commento...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          rows={3}
          aria-describedby={error ? 'comment-error' : undefined}
          aria-invalid={!!error}
        />
      </div>

      {/* Error message */}
      {error && (
        <p id="comment-error" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="sm" aria-label="Invia commento">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Invio...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              Invia Commento
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
