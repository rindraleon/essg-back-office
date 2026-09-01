import { RotateCcw, Search, X } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface UserFilters {
  search: string;
  role: string;
  statut: string;
  presence: string;
}

interface UsersFilterProps {
  filters: UserFilters;
  onUpdateFilter: (key: keyof UserFilters, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
}) => {
  return (
    <div className={open ? '' : 'hidden'}>
      <div className="mt-4 p-4 bg-ink-50 rounded-xl border border-ink-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <Input
                id="search"
                placeholder="Nom, prénom, email..."
                value={filters.search}
                onChange={(e) => onUpdateFilter('search', e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={filters.role}
              onValueChange={(value) => onUpdateFilter('role', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="editeur">Éditeur</SelectItem>
                <SelectItem value="lecteur">Lecteur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={filters.statut}
              onValueChange={(value) => onUpdateFilter('statut', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presence">Présence</Label>
            <Select
              value={filters.presence}
              onValueChange={(value) => onUpdateFilter('presence', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">🟢 En ligne</SelectItem>
                <SelectItem value="inactive">🟡 Inactif</SelectItem>
                <SelectItem value="offline">⚪ Hors ligne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="destructive" onClick={onResetFilters} className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Réinitialiser tout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersFilter;
