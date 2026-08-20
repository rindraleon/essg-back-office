import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityLogTable, ActivityLogViewDialog, ListPageHeader } from '../../components';
import { useDebounce, useScrollToTop,useTitle, useActivityLogsQuery } from '../../hooks';
import type { ActivityLog } from '@/types';

const MODULES = [
  { value: 'users', label: 'Utilisateurs' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'formations', label: 'Formations' },
  { value: 'projects', label: 'Projets' },
  { value: 'news', label: 'Actualités' },
  { value: 'partners', label: 'Partenaires' },
  { value: 'messages', label: 'Messages' },
  { value: 'ressources-humaines', label: 'Ressources humaines' },
  { value: 'upload', label: 'Téléversements' },
  { value: 'documents', label: 'Documents' },
];

const METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const ActivityLogs = () => {
  useScrollToTop();
  useTitle('Journal des actions');

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const query = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      module: moduleFilter !== 'all' ? moduleFilter : undefined,
      method: methodFilter !== 'all' ? methodFilter : undefined,
      success: successFilter === 'all' ? undefined : successFilter === 'success',
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    }),
    [page, rowsPerPage, debouncedSearch, moduleFilter, methodFilter, successFilter],
  );

  const { data, isLoading, isError, error, refetch } = useActivityLogsQuery(query);
  const logs = data?.data ?? [];
  const totalItems = data?.total ?? 0;
  const activeFilterCount = [moduleFilter !== 'all', methodFilter !== 'all', successFilter !== 'all'].filter(
    Boolean,
  ).length;

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setModuleFilter('all');
    setMethodFilter('all');
    setSuccessFilter('all');
    setPage(0);
  }, []);

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-2 mx-auto min-w-0">
      <ListPageHeader
        title="Journal des actions"
        totalCount={totalItems}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher un utilisateur, une action, un module..."
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
      />

      {filtersOpen && (
        <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFiltersOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={moduleFilter}
                  onValueChange={(value) => {
                    if (value) {
                      setModuleFilter(value);
                      setPage(0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modules</SelectItem>
                    {MODULES.map((module) => (
                      <SelectItem key={module.value} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Méthode</Label>
                <Select
                  value={methodFilter}
                  onValueChange={(value) => {
                    if (value) {
                      setMethodFilter(value);
                      setPage(0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les méthodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les méthodes</SelectItem>
                    {METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Résultat</Label>
                <Select
                  value={successFilter}
                  onValueChange={(value) => {
                    if (value) {
                      setSuccessFilter(value);
                      setPage(0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="destructive" onClick={handleResetFilters} className="text-xs">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Réinitialiser tout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Erreur lors du chargement du journal'}
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => {
              void refetch();
              toast.message('Nouvelle tentative...');
            }}
          >
            Réessayer
          </Button>
        </div>
      )}

      {(() => {
        const emptyMessage = isLoading
          ? 'Chargement...'
          : searchTerm || activeFilterCount > 0
            ? 'Aucun résultat trouvé'
            : 'Aucune action enregistrée';

        return (
          <ActivityLogTable
            data={logs}
            totalCount={totalItems}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setPage(0);
            }}
            onView={setSelectedLog}
            emptyMessage={emptyMessage}
          />
        );
      })()}

      <ActivityLogViewDialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} log={selectedLog} />
    </div>
  );
};

export default ActivityLogs;
