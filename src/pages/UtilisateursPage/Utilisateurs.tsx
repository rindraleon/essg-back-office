import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  UsersTable,
  UsersForm,
  UsersViewDialog,
  ConfirmDialog,
  UsersFilter,
  UserSessionsDialog,
  ListPageHeader,
  type UserFilters,
} from '@/components';
import {
  usePagination,
  useScrollToTop,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsersQuery,
  useTitle,
} from '@/hooks';
import { useUsersPresence } from '@/hooks/queries/useSessionQueries';
import { useAuth } from '@/contexts';
import type { User, UserFormData } from '@/types';
import type { UserPresence } from '@/types/session.types';
import { ApiError } from '@/api';

const Utilisateurs: React.FC = () => {
  useScrollToTop();
  useTitle('Utilisateurs');
  // Même plafond (1000) que la présence : les deux requêtes doivent couvrir
  // le même ensemble d'utilisateurs, sinon la colonne « Présence » affiche
  // « Hors ligne » à tort pour les comptes hors page.
  const { data = [] } = useUsersQuery(1, 1000);
  // Présence calculée par le backend (Spec §12/§17) : le frontend n'est
  // jamais la source de vérité du statut en ligne.
  const { data: presenceData } = useUsersPresence(1, 1000);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    statut: '',
    presence: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [sessionsUser, setSessionsUser] = useState<User | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const presenceByUser = useMemo(() => {
    const map: Record<number, UserPresence> = {};
    for (const item of presenceData?.items ?? []) {
      map[item.id] = item.presence;
    }
    return map;
  }, [presenceData]);

  const filteredData = data.filter((user) => {
    const matchesSearch =
      filters.search === '' ||
      user.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.prenom.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = filters.role === '' || user.role === filters.role;

    const matchesStatut =
      filters.statut === '' ||
      (filters.statut === 'actif' && user.estActif) ||
      (filters.statut === 'inactif' && !user.estActif);

    const matchesPresence =
      filters.presence === '' ||
      (presenceByUser[user.id]?.status ?? 'offline') === filters.presence;

    return matchesSearch && matchesRole && matchesStatut && matchesPresence;
  });

  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  } = usePagination({ data: filteredData, initialRowsPerPage: 10 });

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      resetPage();
    },
    [resetPage]
  );

  const handleUpdateFilter = useCallback(
    (key: keyof UserFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      resetPage();
    },
    [resetPage]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      role: '',
      statut: '',
      presence: '',
    });
    resetPage();
  }, [resetPage]);

  const handleToggleFilters = useCallback(() => {
    setFilterOpen((prev) => !prev);
  }, []);

  const activeFilterCount = useCallback(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.statut) count++;
    if (filters.presence) count++;
    return count;
  }, [filters]);

  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setSelectedUser(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  }, []);

  const handleOpenSessions = useCallback((user: User) => {
    setSessionsUser(user);
  }, []);

  const handleDeleteRequest = useCallback((user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (userToDelete) {
      try {
        await deleteMutation.mutateAsync(userToDelete.id);
        toast.success(`Utilisateur "${userToDelete.email}" supprimé avec succès`);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Error deleting user:', error);
      }
    }
  }, [userToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: UserFormData) => {
      try {
        if (formMode === 'create') {
          if (!formData.motDePasse) {
            toast.error('Le mot de passe est requis');
            return;
          }

          const { avatarFile, ...userDataWithoutAvatar } = formData;
          await createMutation.mutateAsync({
            userData: {
              email: userDataWithoutAvatar.email,
              motDePasse: userDataWithoutAvatar.motDePasse as string,
              prenom: userDataWithoutAvatar.prenom,
              nom: userDataWithoutAvatar.nom,
              role: userDataWithoutAvatar.role,
              estActif: userDataWithoutAvatar.estActif,
            },
            avatarFile,
          });
          toast.success(
            avatarFile ? 'Utilisateur créé avec succès avec avatar' : 'Utilisateur créé avec succès'
          );
        } else if (selectedUser) {
          await updateMutation.mutateAsync({ id: selectedUser.id, data: formData });
          toast.success('Utilisateur modifié avec succès');
        }
        setFormOpen(false);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Erreur lors de l'enregistrement";
        toast.error(message);
        console.error('Error saving user:', error);
      }
    },
    [formMode, selectedUser]
  );

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-2 mx-auto min-w-0">
      <ListPageHeader
        title="Gestion des utilisateurs"
        totalCount={filteredData.length}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom, prénom, email..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filterOpen}
        activeFilterCount={activeFilterCount()}
        actionLabel={isAdmin ? 'Nouvel utilisateur' : undefined}
        onAction={isAdmin ? handleOpenCreate : undefined}
      />

      <UsersFilter
        filters={filters}
        onUpdateFilter={handleUpdateFilter}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount()}
        open={filterOpen}
        onToggle={handleToggleFilters}
      />

      <UsersTable
        data={paginatedData}
        totalCount={filteredData.length}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onView={handleView}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
        onOpenSessions={handleOpenSessions}
        isAdmin={isAdmin}
      />

      <UserSessionsDialog
        open={sessionsUser !== null}
        onClose={() => setSessionsUser(null)}
        user={sessionsUser}
      />

      <UsersForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        mode={formMode}
      />

      <UsersViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        user={selectedUser}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer l'utilisateur"
        message={
          userToDelete
            ? `Êtes-vous sûr de vouloir supprimer "${userToDelete.email}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        severity="error"
      />
    </div>
  );
};

export default Utilisateurs;
