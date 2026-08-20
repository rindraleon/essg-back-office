import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ActivityLog } from '@/types';


interface ActivityLogViewDialogProps {
  open: boolean;
  onClose: () => void;
  log: ActivityLog | null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export default function ActivityLogViewDialog({ open, onClose, log }: Readonly<ActivityLogViewDialogProps>) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détail de l'action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-ink-700">{log.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Date" value={formatDate(log.createdAt)} />
            <Info label="Utilisateur" value={log.userId ? `#${log.userId}` : 'Système'} />
            <Info label="Module" value={log.module} />
            <Info label="Action" value={log.action} />
            <Info label="Méthode" value={log.method} />
            <Info label="Code HTTP" value={String(log.statusCode)} />
            <Info label="Résultat" value={log.success ? 'Succès' : 'Échec'} />
            <Info label="IP" value={log.ipAddress || '—'} />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Endpoint</p>
            <code className="block break-all rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-700">
              {log.endpoint}
            </code>
          </div>

          {log.metadata && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Métadonnées</p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-ink-950 p-3 text-xs text-sage-100">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-800">{value}</p>
    </div>
  );
}
