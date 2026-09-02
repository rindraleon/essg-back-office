import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import type { FormationFilterOptions } from '@/types';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FormationFiltersProps {
  filters: FormationFilterOptions;
  onUpdateFilter: (key: keyof FormationFilterOptions, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const niveaux = [
  { value: 'Licence', label: 'Licence' },
  { value: 'Master', label: 'Master' },
  { value: 'Doctorat', label: 'Doctorat' },
];

const domaines = [
  'Géomatique et agriculture durable',
  'Géomatique et santé',
  'Géomatique, ressources naturelles et assainissement',
  'Cartographie numérique et développement',
  'Géomatique et économie',
  'Géomatique et bonne gouvernance',
  'Géomatique, communication et marketing',
  'Géo-entreprenariat',
  "Système d'Information Géomatique et Décision",
  "Ingénierie Géospatiale et Technologie d1'Informations",
  'Géomatique et Intelligence Artificielle',
  'Télédétection et SIG',
];

const FormationFilters: React.FC<FormationFiltersProps> = ({
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

        <div className="grid grid-cols-1 w-full sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Niveau</Label>
            <Select
              value={filters.niveau}
              onValueChange={(value) => onUpdateFilter('niveau', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {niveaux.map((niv) => (
                  <SelectItem key={niv.value} value={niv.value}>
                    {niv.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <Label>Domaine</Label>
            <Select
              value={filters.domaine}
              onValueChange={(value) => onUpdateFilter('domaine', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {domaines.map((dom) => (
                  <SelectItem key={dom} value={dom}>
                    {dom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>En vedette</Label>
            <Select
              value={filters.enVedette}
              onValueChange={(value) => onUpdateFilter('enVedette', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Oui</SelectItem>
                <SelectItem value="false">Non</SelectItem>
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

export default FormationFilters;
