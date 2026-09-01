import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Collapse,
  Box,
  IconButton,
} from '../compat/mui';
import { RotateCcw, X } from 'lucide-react';
import React from 'react';
import type { ProjetFilterOptions } from '@/types';
import { PROJET_TYPES } from '@/constants';

interface ProjetFiltersProps {
  filters: ProjetFilterOptions;
  onUpdateFilter: (key: keyof ProjetFilterOptions, value: string) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  open: boolean;
  onToggle: () => void;
}

const ProjetFilters: React.FC<ProjetFiltersProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  activeFilterCount,
  open,
  onToggle,
}) => {
  return (
    <div>
      <Collapse in={open}>
        <Box className="mt-4 p-4 bg-ink-50 rounded-xl border border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink-700">Filtres avancés</span>
            <IconButton size="small" onClick={onToggle}>
              <X className="size-4" />
            </IconButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => onUpdateFilter('type', e.target.value)}
              >
                <MenuItem value="">
                  <em>Tous</em>
                </MenuItem>
                {PROJET_TYPES.map((typeItem) => (
                  <MenuItem key={typeItem.value} value={typeItem.value}>
                    {typeItem.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Date début"
              value={filters.dateDebut}
              onChange={(e) => onUpdateFilter('dateDebut', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              size="small"
              type="date"
              label="Date fin"
              value={filters.dateFin}
              onChange={(e) => onUpdateFilter('dateFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button
                size="small"
                color="error"
                startIcon={<RotateCcw className="size-4" />}
                onClick={onResetFilters}
              >
                Réinitialiser tout
              </Button>
            </div>
          )}
        </Box>
      </Collapse>
    </div>
  );
};

export default ProjetFilters;
