'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NewTicketForm } from './NewTicketForm';
import { toast } from 'sonner';

interface NewTicketModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewTicketModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: NewTicketModalProps) {
  const handleSuccess = () => {
    toast.success('Richiesta inviata con successo!');
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova Richiesta</DialogTitle>
          <DialogDescription>
            Compila il modulo per inviare una nuova richiesta. I campi con * sono obbligatori.
          </DialogDescription>
        </DialogHeader>
        <NewTicketForm
          projectId={projectId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
