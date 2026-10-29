import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ALL_VALUE = '__all__';

export interface ResultatFilters {
  anneeScolaire: string;
  type: string;
  statutPublication: string;
}

interface ResultatsFilterProps {
  filters: ResultatFilters;
  onUpdateFilter: (key: keyof ResultatFilters, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const ResultatsFilter: React.FC<ResultatsFilterProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
}) => {
  if (!open) return null;

  return (
    <div className="p-4 bg-ink-50 rounded-xl border border-ink-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          aria-label="Fermer les filtres"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="anneeScolaire">Année scolaire</Label>
          <Input
            id="anneeScolaire"
            placeholder="Ex : 2025-2026"
            value={filters.anneeScolaire}
            onChange={(e) => onUpdateFilter('anneeScolaire', e.target.value)}
            className="bg-card"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type de fichier</Label>
          <Select
            value={filters.type || ALL_VALUE}
            onValueChange={(value) =>
              onUpdateFilter('type', !value || value === ALL_VALUE ? '' : value)
            }
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les types</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statutPublication">Statut</Label>
          <Select
            value={filters.statutPublication || ALL_VALUE}
            onValueChange={(value) =>
              onUpdateFilter('statutPublication', !value || value === ALL_VALUE ? '' : value)
            }
          >
            <SelectTrigger id="statutPublication">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les statuts</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="publie">Publié</SelectItem>
              <SelectItem value="archive">Archivé</SelectItem>
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
  );
};

export default ResultatsFilter;
