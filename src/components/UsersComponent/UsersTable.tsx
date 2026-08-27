import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { getImageUrl , formatFullName, getPersonInitials } from '@/utils';
import type { User } from '@/types';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface UsersTableProps {
  data: User[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isAdmin: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'editeur':
        return 'Éditeur';
      case 'lecteur':
        return 'Lecteur';
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editeur':
        return 'secondary';
      case 'lecteur':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const columns: Column<User>[] = [
    {
      id: 'avatar',
      label: 'Profil',
      minWidth: 80,
      render: (user) => (
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
          {user.avatar ? (
            <img
              loading="lazy"
              decoding="async"
              src={getImageUrl(user.avatar)}
              alt={formatFullName(user)}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.textContent = getPersonInitials(user);
              }}
            />
          ) : (
            getPersonInitials(user)
          )}
        </div>
      ),
    },
    {
      id: 'nom',
      label: 'Nom complet',
      minWidth: 200,
      render: (user) => (
        <div>
          <span className="font-semibold text-ink-900">{formatFullName(user)}</span>
        </div>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 220,
      render: (user) => <span className="text-sm text-ink-600">{user.email}</span>,
    },
    {
      id: 'role',
      label: 'Rôle',
      minWidth: 140,
      render: (user) => (
        <Badge variant={getRoleVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
      ),
    },
    {
      id: 'statut',
      label: 'Statut',
      minWidth: 120,
      render: (user) => (
        <Badge variant={user.estActif ? 'default' : 'outline'}>
          {user.estActif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 140,
      align: 'right',
      render: (user) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => onView(user)} className="h-8 w-8">
            <Eye className="size-4 h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onEdit(user)} className="h-8 w-8">
            <Pencil className="size-4 h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(user)}
              className="h-8 w-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-4 h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<User>
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucun utilisateur trouvé"
      getRowId={(user) => user.id}
    />
  );
};

export default UsersTable;
