import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  ListPageHeader,
  ConfirmDialog,
  ContactFilters,
  ContactReplyDialog,
  MessageTable,
} from '@/components';
import { ApiError } from '@/api';

import {
  useDebounce,
  useScrollToTop,
  useDeleteMessage,
  useMarkMessageRead,
  useMessagesQuery,
  useReplyToMessage,
  useTitle,
} from '@/hooks';
import type { Message } from '@/services';
import { formatFullName } from '@/utils';

const ITEMS_PER_PAGE = 10;

const Contacts = () => {
  useScrollToTop();
  useTitle('Messages de contact');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSujet, setFilterSujet] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replying, setReplying] = useState(false);

  const activeFilterCount = [
    filterSujet !== 'all',
    filterStatut !== 'all',
    Boolean(filterDateDebut),
    Boolean(filterDateFin),
  ].filter(Boolean).length;

  const getLuFilter = (): boolean | undefined => {
    if (filterStatut === 'lu') return true;
    if (filterStatut === 'non_lu') return false;
    return undefined;
  };

  const { data, isLoading, isError, error, refetch } = useMessagesQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    q: debouncedQuery,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
    sujet: filterSujet,
    lu: getLuFilter(),
    dateDebut: filterDateDebut || undefined,
    dateFin: filterDateFin || undefined,
  });
  const markReadMutation = useMarkMessageRead();
  const replyMutation = useReplyToMessage();
  const deleteMutation = useDeleteMessage();
  const messages = data?.data ?? [];
  const totalItems = data?.total ?? 0;
  const loading = isLoading;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filterSujet, filterStatut, filterDateDebut, filterDateFin]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterSujet('all');
    setFilterStatut('all');
    setFilterDateDebut('');
    setFilterDateFin('');
    setCurrentPage(1);
  }, []);

  const handleMarkAsRead = async (id: number, silent = false) => {
    try {
      await markReadMutation.mutateAsync(id);
      if (!silent) toast.success('Message marqué comme lu');
    } catch {
      if (!silent) toast.error('Erreur lors de la mise à jour du message');
    }
  };

  const handleViewMessage = useCallback((message: Message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
    if (!message.lu) {
      void handleMarkAsRead(message.id, true);
    }
  }, []);

  const handleReply = useCallback((message: Message) => {
    setSelectedMessage(message);
    setReplyOpen(true);
    if (!message.lu) {
      void handleMarkAsRead(message.id, true);
    }
  }, []);

  const handleSendReply = async (payload: { sujet: string; message: string }) => {
    if (!selectedMessage) return;
    setReplying(true);
    try {
      await replyMutation.mutateAsync({
        id: selectedMessage.id,
        sujet: payload.sujet,
        message: payload.message,
      });
      toast.success('Réponse envoyée au demandeur');
      setReplyOpen(false);
      setViewDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Impossible d'envoyer l'email";
      toast.error(message);
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteRequest = useCallback(
    (id: number) => {
      const message = messages.find((item) => item.id === id);
      if (message) {
        setMessageToDelete(message);
        setDeleteDialogOpen(true);
      }
    },
    [messages]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!messageToDelete) return;
    try {
      await deleteMutation.mutateAsync(messageToDelete.id);
      toast.success('Message supprimé avec succès');
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
        setViewDialogOpen(false);
      }
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch {
      toast.error('Erreur lors de la suppression du message');
    }
  }, [messageToDelete, selectedMessage, deleteMutation]);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));

  const getSujetLabel = (sujet: string) => {
    const labels: Record<string, string> = {
      information: "Demande d'information",
      admission: 'Admission',
      partenariat: 'Partenariat',
      autre: 'Autre',
    };
    return labels[sujet.toLowerCase()] || sujet;
  };

  const hasActiveSearchOrFilter = Boolean(searchQuery) || activeFilterCount > 0;

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-2 mx-auto min-w-0">
      <ListPageHeader
        title="Messages de contact"
        totalCount={totalItems}
        countLabel="message"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par nom, email, téléphone..."
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
      />

      <ContactFilters
        filters={{
          sujet: filterSujet,
          statut: filterStatut,
          dateDebut: filterDateDebut,
          dateFin: filterDateFin,
        }}
        onUpdateFilter={(key, value) => {
          if (key === 'sujet') setFilterSujet(value);
          if (key === 'statut') setFilterStatut(value);
          if (key === 'dateDebut') setFilterDateDebut(value);
          if (key === 'dateFin') setFilterDateFin(value);
        }}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((prev) => !prev)}
      />

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Erreur lors du chargement des messages'}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => void refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-ink-100 bg-white">
        <MessageTable
          data={messages}
          totalCount={totalItems}
          page={currentPage - 1}
          rowsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page: number) => setCurrentPage(page + 1)}
          onRowsPerPageChange={() => undefined}
          onView={handleViewMessage}
          onDelete={handleDeleteRequest}
          onMarkAsRead={(id) => void handleMarkAsRead(id)}
          onReply={handleReply}
          loading={loading}
          emptyMessage={hasActiveSearchOrFilter ? 'Aucun résultat trouvé' : 'Aucun message trouvé'}
        />
      </div>

      {selectedMessage && (
        <ConfirmDialog
          open={viewDialogOpen}
          title="Détails du message"
          message={
            <div className="space-y-4 text-left">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-ink-900">
                    {formatFullName(selectedMessage)}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-ink-600">
                    <p>{selectedMessage.email}</p>
                    {selectedMessage.telephone && <p>{selectedMessage.telephone}</p>}
                    <p>Reçu le {formatDate(selectedMessage.creeLe)}</p>
                    {selectedMessage.luLe && (
                      <p>
                        Lu le {formatDate(selectedMessage.luLe)}
                        {selectedMessage.luPar ? ` par ${selectedMessage.luPar}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-800">
                  {getSujetLabel(selectedMessage.sujet)}
                </span>
              </div>
              <div className="border-t border-ink-100 pt-4">
                <h4 className="mb-2 font-semibold text-ink-900">Message :</h4>
                <div className="rounded-lg bg-ink-50 p-4">
                  <p className="whitespace-pre-wrap text-ink-700">{selectedMessage.message}</p>
                </div>
              </div>
              {selectedMessage.reponse && (
                <div className="border-t border-ink-100 pt-4">
                  <h4 className="mb-2 font-semibold text-ink-900">Réponse envoyée</h4>
                  <p className="mb-1 text-xs text-ink-500">
                    {selectedMessage.reponduLe ? formatDate(selectedMessage.reponduLe) : ''}
                    {selectedMessage.reponduPar ? ` · ${selectedMessage.reponduPar}` : ''}
                  </p>
                  <div className="rounded-lg bg-brand-50 p-4">
                    <p className="whitespace-pre-wrap text-ink-700">{selectedMessage.reponse}</p>
                  </div>
                </div>
              )}
            </div>
          }
          confirmLabel="Répondre"
          cancelLabel="Fermer"
          onConfirm={() => {
            setViewDialogOpen(false);
            setReplyOpen(true);
          }}
          onCancel={() => {
            setViewDialogOpen(false);
            setSelectedMessage(null);
          }}
          severity="info"
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer le message"
        message={
          messageToDelete
            ? `Êtes-vous sûr de vouloir supprimer le message de "${formatFullName(messageToDelete)}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setMessageToDelete(null);
        }}
        severity="error"
      />

      {selectedMessage && (
        <ContactReplyDialog
          message={selectedMessage}
          open={replyOpen}
          submitting={replying}
          onClose={() => setReplyOpen(false)}
          onSubmit={handleSendReply}
        />
      )}
    </div>
  );
};

export default Contacts;
