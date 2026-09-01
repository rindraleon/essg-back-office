import { CircleAlert, Info, Loader2, TriangleAlert } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';

type ConfirmSeverity = 'warning' | 'error' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  severity?: ConfirmSeverity;
  loading?: boolean;
  loadingLabel?: string;
}

const SEVERITY_STYLES: Record<
  ConfirmSeverity,
  { icon: React.ReactNode; iconWrapper: string; confirmVariant: 'default' | 'destructive' }
> = {
  error: {
    icon: <CircleAlert aria-hidden="true" />,
    iconWrapper: 'bg-destructive/10 text-destructive',
    confirmVariant: 'destructive',
  },
  warning: {
    icon: <TriangleAlert aria-hidden="true" />,
    iconWrapper: 'bg-sage-100 text-sage-700',
    confirmVariant: 'default',
  },
  info: {
    icon: <Info aria-hidden="true" />,
    iconWrapper: 'bg-brand-50 text-brand-700',
    confirmVariant: 'default',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
  loadingLabel,
}) => {
  const [pending, setPending] = React.useState(false);
  const busy = loading || pending;
  const { icon, iconWrapper, confirmVariant } = SEVERITY_STYLES[severity];

  const handleConfirm = async () => {
    if (busy) return;
    try {
      setPending(true);
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onCancel();
      }}
    >
      <DialogContent size="md" showCloseButton={!busy} role="alertdialog">
        <DialogHeader icon={icon} iconClassName={iconWrapper} title={title} />

        <DialogBody className="space-y-3">
          <div className="text-sm leading-relaxed text-ink-700">{message}</div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => void handleConfirm()}
            disabled={busy}
            aria-busy={busy}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {busy ? (loadingLabel ?? 'Traitement en cours…') : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
