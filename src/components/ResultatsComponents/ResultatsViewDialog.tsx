import { LoaderCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import SearchInput from '../common/SearchInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDebounce } from '@/hooks';
import {
  getResultatById,
  getResultatIndividuels,
  type ResultatIndividuel,
  type ResultatPublication,
  type StatutAcademique,
} from '@/services';
import { useQuery } from '@tanstack/react-query';

const STATUT_BADGE: Record<string, string> = {
  brouillon: 'bg-amber-100 text-amber-800 border border-amber-200',
  publie: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  archive: 'bg-slate-100 text-slate-800 border border-slate-200',
};

const STATUT_LABEL: Record<string, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  archive: 'Archivé',
};

const STATUT_ACADEMIQUE_BADGE: Record<string, string> = {
  admis: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ajourne: 'bg-red-100 text-red-800 border-red-200',
};

const STATUT_ACADEMIQUE_LABEL: Record<string, string> = {
  admis: 'Admis',
  ajourne: 'Ajourné',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-MG') : '—';

interface ResultatsViewDialogProps {
  open: boolean;
  onClose: () => void;
  resultatId: number | null;
}

const ResultatsViewDialog: React.FC<ResultatsViewDialogProps> = ({ open, onClose, resultatId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState<StatutAcademique | ''>('');
  const debouncedSearch = useDebounce(search, 350);

  const publicationQuery = useQuery({
    queryKey: ['resultats', 'view', resultatId],
    queryFn: () => getResultatById(resultatId!),
    enabled: !!resultatId && open,
  });

  const individusQuery = useQuery({
    queryKey: [
      'resultats',
      'view',
      resultatId,
      'individuels',
      page,
      rowsPerPage,
      debouncedSearch,
      statut,
    ],
    queryFn: () =>
      getResultatIndividuels(resultatId!, {
        page: page + 1,
        limit: rowsPerPage,
        q: debouncedSearch || undefined,
        statutAcademique: statut || undefined,
      }),
    enabled: !!resultatId && open,
  });

  const resultat: ResultatPublication | undefined = publicationQuery.data;
  const individus = useMemo(() => individusQuery.data?.data ?? [], [individusQuery.data]);

  const columns = useMemo<Column<ResultatIndividuel>[]>(
    () => [
      {
        id: 'matricule',
        label: 'Matricule',
        minWidth: 110,
        render: (row) => <span className="text-sm font-medium text-ink-900">{row.matricule}</span>,
      },
      {
        id: 'nom',
        label: 'Nom et prénom',
        minWidth: 180,
        render: (row) => (
          <div>
            <p className="text-sm font-medium text-ink-900">
              {row.nom} {row.prenom}
            </p>
            {row.classe && <p className="text-xs text-ink-500">{row.classe}</p>}
          </div>
        ),
      },
      {
        id: 'statutAcademique',
        label: 'Statut',
        minWidth: 100,
        render: (row) => (
          <Badge
            variant="outline"
            className={`text-xs ${STATUT_ACADEMIQUE_BADGE[row.statutAcademique ?? ''] ?? ''}`}
          >
            {STATUT_ACADEMIQUE_LABEL[row.statutAcademique ?? ''] ?? '—'}
          </Badge>
        ),
      },
      {
        id: 'observation',
        label: 'Observation',
        minWidth: 160,
        render: (row) => <span className="text-sm text-ink-600">{row.observation || '—'}</span>,
      },
    ],
    []
  );

  if (!open || !resultatId) return null;

  const loading = publicationQuery.isLoading;
  const error = publicationQuery.error;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent size="full">
        <DialogHeader>
          <DialogTitle>Détail du résultat</DialogTitle>
          <DialogDescription>
            Informations de la publication et liste complète des résultats individuels.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-ink-500">
              <LoaderCircle className="size-7 animate-spin text-brand-600" />
              <p className="text-sm">Chargement des détails…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Impossible de charger les détails.
            </div>
          )}

          {!loading && !error && resultat && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Intitulé
                  </p>
                  <p className="text-sm font-medium text-ink-900">{resultat.titre}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Année / Période
                  </p>
                  <p className="text-sm text-ink-700">
                    {resultat.anneeScolaire} / {resultat.periode || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Type
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {resultat.type === 'excel' ? 'Excel' : 'PDF'}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Consultation
                  </p>
                  <p className="text-sm text-ink-700">
                    {resultat.modeConsultation === 'protege'
                      ? 'Protégée (matricule + code)'
                      : 'Publique'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Statut
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUT_BADGE[resultat.statutPublication] ?? ''}`}
                  >
                    {STATUT_LABEL[resultat.statutPublication] ?? resultat.statutPublication}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Total lignes
                  </p>
                  <p data-numeric className="text-sm font-medium text-ink-900">
                    {resultat.totalIndividuels}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Admis / Ajournés
                  </p>
                  <p className="text-sm text-ink-700">
                    <span className="text-emerald-700">{resultat.totalAdmis}</span>
                    {' / '}
                    <span className="text-red-700">{resultat.totalAjourne}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                    Fichier
                  </p>
                  <p className="text-sm text-ink-700 truncate">{resultat.fichierOriginal}</p>
                  <p className="text-xs text-ink-500">
                    {Math.max(1, Math.round(resultat.taille / 1024))} Ko ·{' '}
                    {formatDate(resultat.creeLe)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-ink-100 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">Résultats individuels</h3>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                      value={search}
                      onChange={(value) => {
                        setSearch(value);
                        setPage(0);
                      }}
                      placeholder="Matricule, nom, prénom…"
                      className="sm:w-64"
                    />
                    <Select
                      value={statut}
                      onValueChange={(value) => {
                        setStatut((value as StatutAcademique) || '');
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="sm:w-44">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admis">Admis</SelectItem>
                        <SelectItem value="ajourne">Ajourné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {individusQuery.isLoading && (
                  <p className="text-sm text-ink-500">Chargement des lignes…</p>
                )}
                {individusQuery.error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Impossible de charger les lignes de résultat.
                  </p>
                )}

                {!individusQuery.isLoading && !individusQuery.error && (
                  <DataTable<ResultatIndividuel>
                    columns={columns}
                    data={individus}
                    totalCount={individusQuery.data?.total ?? 0}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={(rows) => {
                      setRowsPerPage(rows);
                      setPage(0);
                    }}
                    getRowId={(row) => row.id}
                    emptyMessage={
                      (individusQuery.data?.total ?? 0) === 0
                        ? 'Aucune ligne individuelle enregistrée pour cette publication.'
                        : 'Aucune ligne ne correspond aux filtres.'
                    }
                  />
                )}
              </div>
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultatsViewDialog;
