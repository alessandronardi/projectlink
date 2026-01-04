'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { TicketPriority } from '@/types/database';

interface NewTicketFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export function NewTicketForm({ projectId, onSuccess, onCancel }: NewTicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; priority?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { title?: string; priority?: string } = {};

    // Validate title (non-empty, not just whitespace)
    if (!title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }

    // Validate priority
    const validPriorities: TicketPriority[] = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      newErrors.priority = 'Seleziona una priorità valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore nella creazione del ticket');
      }

      onSuccess();
    } catch (err) {
      console.error('Error creating ticket:', err);
      setErrors({ title: err instanceof Error ? err.message : 'Errore nella creazione' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Modulo nuova richiesta">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="ticket-title">
          Titolo <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(obbligatorio)</span>
        </Label>
        <Input
          id="ticket-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Descrivi brevemente la tua richiesta"
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={!!errors.title}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="ticket-description">Descrizione</Label>
        <Textarea
          id="ticket-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Aggiungi dettagli sulla tua richiesta (opzionale)"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {/* Priority Field */}
      <div className="space-y-2">
        <Label htmlFor="ticket-priority" id="priority-label">
          Priorità <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(obbligatorio)</span>
        </Label>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="priority-label" aria-required="true">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              disabled={isSubmitting}
              className={`
                flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors
                ${priority === p.value
                  ? p.value === 'low'
                    ? 'bg-gray-100 border-gray-400 text-gray-700'
                    : p.value === 'medium'
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              role="radio"
              aria-checked={priority === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>
        {errors.priority && (
          <p className="text-sm text-red-600">{errors.priority}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Annulla creazione richiesta"
        >
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-label="Invia richiesta">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              Invio in corso...
            </>
          ) : (
            'Invia Richiesta'
          )}
        </Button>
      </div>
    </form>
  );
}
