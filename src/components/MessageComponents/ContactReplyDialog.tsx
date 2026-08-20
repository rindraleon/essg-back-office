import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Message } from '../../services/messages.service';
import { formatFullName } from '../../utils/name.utils';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/70 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="border-b border-ink-100 px-6 py-4">
          <h2 className="text-xl font-bold text-ink-900">Répondre au message</h2>
          <p className="mt-1 text-sm text-ink-600">
            {formatFullName(message)}
          </p>
        </div>

        <div className="space-y-4 p-6">
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
        </div>

        <div className="flex gap-3 border-t border-ink-100 px-6 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={submitting || !body.trim()}
            onClick={() => void onSubmit({ sujet, message: body.trim() })}
          >
            {submitting ? 'Envoi...' : 'Envoyer la réponse'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactReplyDialog;
