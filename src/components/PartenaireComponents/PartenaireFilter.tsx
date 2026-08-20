import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import type { PartenaireFilterOptions } from '../../types/partenaire.types';
import { PARTENAIRE_TYPES } from '../../constants/partenaire.constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PartenaireFiltersProps {
  filters: PartenaireFilterOptions;
  onUpdateFilter: (key: keyof PartenaireFilterOptions, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const PartenaireFilters: React.FC<PartenaireFiltersProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
}) => {
  return (
    <div>
      {open && (
        <div className="mt-4 p-4 bg-ink-50 rounded-xl border border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
            <Button variant="ghost" size="icon-sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="w-full">
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => onUpdateFilter('type', value || '')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {PARTENAIRE_TYPES.map((typeItem) => (
                    <SelectItem key={typeItem.value} value={typeItem.value}>
                      {typeItem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label htmlFor="secteur">Secteur</Label>
              <Input
                id="secteur"
                value={filters.secteur}
                onChange={(e) => onUpdateFilter('secteur', e.target.value)}
                placeholder="Filtrer par secteur"
              />
            </div>

            <div className="w-full">
              <Label htmlFor="dateDebut">Date début</Label>
              <Input
                id="dateDebut"
                type="date"
                value={filters.dateDebut}
                onChange={(e) => onUpdateFilter('dateDebut', e.target.value)}
              />
            </div>

            <div className="w-full">
              <Label htmlFor="dateFin">Date fin</Label>
              <Input
                id="dateFin"
                type="date"
                value={filters.dateFin}
                onChange={(e) => onUpdateFilter('dateFin', e.target.value)}
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="destructive" onClick={onResetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser tout
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartenaireFilters;
