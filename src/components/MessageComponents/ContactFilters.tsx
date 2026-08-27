import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface ContactFilterValues {
  sujet: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}

interface ContactFiltersProps {
  filters: ContactFilterValues;
  onUpdateFilter: (key: keyof ContactFilterValues, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
}) => {
  if (!open) return null;

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Sujet</Label>
          <Select
            value={filters.sujet}
            onValueChange={(value) => onUpdateFilter('sujet', value || 'all')}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="information">Demande d'information</SelectItem>
              <SelectItem value="admission">Admission</SelectItem>
              <SelectItem value="partenariat">Partenariat</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Statut de lecture</Label>
          <Select
            value={filters.statut}
            onValueChange={(value) => onUpdateFilter('statut', value || 'all')}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="non_lu">Non lus</SelectItem>
              <SelectItem value="lu">Lus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-date-debut">Date début</Label>
          <Input
            id="contact-date-debut"
            type="date"
            value={filters.dateDebut}
            onChange={(e) => onUpdateFilter('dateDebut', e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-date-fin">Date fin</Label>
          <Input
            id="contact-date-fin"
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
            <RotateCcw className="mr-1 h-3 w-3" />
            Réinitialiser tout
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactFilters;
