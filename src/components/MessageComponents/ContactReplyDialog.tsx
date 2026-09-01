import { Loader2, Reply } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Message } from '@/services';
import { formatFullName } from '@/utils';

interface ContactReplyDialogProps {
  message: Message;
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { sujet: string; message: string }) => Promise<void>;
}

const ContactReplyDialog = ({
  message,
  open,
  submitting,
  onClose,
  onSubmit,
}: ContactReplyDialogProps) => {
  const [sujet, setSujet] = useState(`Re : ${message.sujet}`);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!open) return;
    setSujet(message.reponseSujet || `Re : ${message.sujet}`);
    setBody(message.reponse || '');
  }, [open, message]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !submitting && onClose()}>
      <DialogContent size="lg" showCloseButton={!submitting}>
        <DialogHeader
          icon={<Reply aria-hidden="true" />}
          title="Répondre au message"
          description={`${formatFullName(message)} — ${message.email}`}
        />

        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reply-to">Destinataire</Label>
            <Input id="reply-to" value={message.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reply-subject">Objet</Label>
            <Input
              id="reply-subject"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reply-body">Message</Label>
            <textarea
              id="reply-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              className="w-full rounded-lg border border-ink-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-brand-500"
              placeholder="Saisissez votre réponse…"
              disabled={submitting}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={submitting || !body.trim()}
            aria-busy={submitting}
            onClick={() => void onSubmit({ sujet, message: body.trim() })}
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitting ? 'Envoi en cours…' : 'Envoyer la réponse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactReplyDialog;
