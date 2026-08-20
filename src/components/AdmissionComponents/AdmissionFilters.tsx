import { RotateCcw, X } from 'lucide-react';
// src/components/AdmissionComponents/AdmissionFilters.tsx
import React from 'react';
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

interface AdmissionFiltersProps {
  filters: {
    search: string;
    status: string;
    niveau: string;
    formation: string;
    dateDebut?: string;
    dateFin?: string;
  };
  onUpdateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
  niveaux: string[];
  formations: string[];
}

const AdmissionFilters: React.FC<AdmissionFiltersProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
  niveaux,
  formations,
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
            <Label>Niveau</Label>
            <Select
              value={filters.niveau}
              onValueChange={(value) => onUpdateFilter('niveau', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {niveaux.map((niveau) => (
                  <SelectItem key={niveau} value={niveau}>
                    {niveau}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formation</Label>
            <Select
              value={filters.formation}
              onValueChange={(value) => onUpdateFilter('formation', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {formations.map((formation) => (
                  <SelectItem key={formation} value={formation}>
                    {formation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onUpdateFilter('status', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours_etude">En cours d'étude</SelectItem>
                <SelectItem value="accepte">Accepté</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateDebut">Date début</Label>
            <Input
              id="dateDebut"
              type="date"
              value={filters.dateDebut || ''}
              onChange={(e) => onUpdateFilter('dateDebut', e.target.value || '')}
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

export default AdmissionFilters;
