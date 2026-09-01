import { Database, Link2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { FloatingInput } from '../ui/floating-input';
import { Label } from '../ui/label';
import { isValidSourceUrl, normalizeSourceUrl } from '@/utils';
import type { ProjectSource } from '@/types';

interface SourcesFieldProps {
  value: ProjectSource[];
  error?: string;
  onChange: (sources: ProjectSource[]) => void;
}

const SourcesField = ({ value, error, onChange }: SourcesFieldProps) => {
  const sources = value ?? [];

  const updateSource = (index: number, patch: Partial<ProjectSource>) => {
    onChange(sources.map((source, i) => (i === index ? { ...source, ...patch } : source)));
  };

  const addSource = () => {
    onChange([...sources, { title: '', url: '' }]);
  };

  const removeSource = (index: number) => {
    onChange(sources.filter((_, i) => i !== index));
  };

  const rowError = (source: ProjectSource): string | undefined => {
    if (!source.title?.trim() && !source.url?.trim()) return undefined;
    if (!source.title?.trim()) return 'Le titre est obligatoire';
    if (!source.url?.trim()) return "L'URL est obligatoire";
    if (!isValidSourceUrl(source.url)) return "L'URL est invalide";
    return undefined;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-ink-400" />
          <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
            Sources de données
          </Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSource}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une source
        </Button>
      </div>

      {sources.length === 0 && (
        <p className="rounded-lg border border-dashed border-ink-200 bg-ink-50/60 px-3 py-2.5 text-xs text-ink-400">
          Aucune source. Ajoutez des liens vers les données utilisées par le projet.
        </p>
      )}

      <div className="space-y-3">
        {sources.map((source, index) => {
          const rowErr = rowError(source);
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
                  <FloatingInput
                    label={`Titre ${index + 1}`}
                    value={source.title}
                    onChange={(e) => updateSource(index, { title: e.target.value })}
                    placeholder="Ex: Données SIG de la région"
                    className="rounded-xl bg-white"
                  />
                  <FloatingInput
                    label={`URL ${index + 1}`}
                    value={source.url}
                    onChange={(e) => updateSource(index, { url: e.target.value })}
                    onBlur={() => {
                      if (source.url.trim() && !/^https?:\/\//i.test(source.url.trim())) {
                        updateSource(index, { url: normalizeSourceUrl(source.url) });
                      }
                    }}
                    placeholder="https://exemple.com/donnees"
                    className="rounded-xl bg-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSource(index)}
                  className="mt-1 h-9 w-9 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Supprimer la source ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {rowErr && <p className="pl-1 text-xs text-red-500">{rowErr}</p>}
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {sources.length > 0 && (
        <p className="flex items-center gap-1 text-[11px] text-ink-400">
          <Link2 className="h-3 w-3" />
          Les URL sans protocole seront automatiquement préfixées par https://
        </p>
      )}
    </div>
  );
};

export default SourcesField;
