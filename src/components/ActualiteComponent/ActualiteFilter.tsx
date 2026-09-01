import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import type { FilterOptions } from '@/types';
import { ACTUALITE_CATEGORIES as categories, ACTUALITE_STATUTS as statuts } from '@/constants';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ActualiteFiltersProps {
  filters: FilterOptions;
  onUpdateFilter: (key: keyof FilterOptions, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const ActualiteFilters: React.FC<ActualiteFiltersProps> = ({
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={filters.categorie}
              onValueChange={(value) => onUpdateFilter('categorie', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={filters.statut}
              onValueChange={(value) => onUpdateFilter('statut', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {statuts.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateDebut">Date début</Label>
            <Input
              id="dateDebut"
              type="date"
              value={filters.dateDebut}
              onChange={(e) => onUpdateFilter('dateDebut', e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFin">Date fin</Label>
            <Input
              id="dateFin"
              type="date"
              value={filters.dateFin}
              onChange={(e) => onUpdateFilter('dateFin', e.target.value)}
              className="bg-white"
            />
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

export default ActualiteFilters;
