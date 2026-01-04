'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Il nome del progetto è obbligatorio');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante la creazione del progetto');
      }

      setName('');
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuovo Progetto</DialogTitle>
          <DialogDescription>
            Inserisci il nome del progetto. Un link univoco verrà generato automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} aria-label="Modulo creazione progetto">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Nome Progetto <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(obbligatorio)</span>
              </Label>
              <Input
                id="project-name"
                placeholder="Es. Sito Web Aziendale"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                aria-describedby={error ? 'project-name-error' : undefined}
                aria-invalid={!!error}
                aria-required="true"
              />
              {error && (
                <p id="project-name-error" className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Annulla creazione progetto"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading} aria-label="Crea progetto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Crea Progetto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
