import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  TextField,
} from '../compat/mui';
import React from 'react';
import type { RessourceHumaineFilterOptions } from '@/types';

interface RessourceHumaineFilterProps {
  filters: RessourceHumaineFilterOptions;
  onUpdateFilter: (key: keyof RessourceHumaineFilterOptions, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const postes = ['Directeur', 'Enseignant', 'Administratif', 'Technicien', 'Responsable', 'Autre'];

const RessourceHumaineFilter: React.FC<RessourceHumaineFilterProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
}) => {
  return (
    <Box className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextField
          label="Rechercher"
          placeholder="Nom, prénom, poste..."
          value={filters.search}
          onChange={(e) => onUpdateFilter('search', e.target.value)}
          size="small"
          fullWidth
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Poste</InputLabel>
          <Select
            value={filters.poste}
            label="Poste"
            onChange={(e) => onUpdateFilter('poste', e.target.value)}
          >
            <MenuItem value="">Tous les postes</MenuItem>
            {postes.map((poste) => (
              <MenuItem key={poste} value={poste}>
                {poste}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Statut</InputLabel>
          <Select
            value={filters.actif}
            label="Statut"
            onChange={(e) => onUpdateFilter('actif', e.target.value)}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Actif</MenuItem>
            <MenuItem value="false">Inactif</MenuItem>
          </Select>
        </FormControl>
      </div>

      {activeFilterCount > 0 && (
        <Box className="flex items-center gap-2">
          <span className="text-sm text-ink-600">Filtres actifs:</span>
          {filters.poste && (
            <Chip
              label={`Poste: ${filters.poste}`}
              size="small"
              onDelete={() => onUpdateFilter('poste', '')}
            />
          )}
          {filters.actif && (
            <Chip
              label={`Statut: ${filters.actif === 'true' ? 'Actif' : 'Inactif'}`}
              size="small"
              onDelete={() => onUpdateFilter('actif', '')}
            />
          )}
          {filters.search && (
            <Chip
              label={`Recherche: ${filters.search}`}
              size="small"
              onDelete={() => onUpdateFilter('search', '')}
            />
          )}
          <Button size="small" onClick={onResetFilters}>
            Réinitialiser tout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RessourceHumaineFilter;
