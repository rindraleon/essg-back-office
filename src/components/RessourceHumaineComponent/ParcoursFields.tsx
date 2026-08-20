import { Briefcase, GraduationCap, Languages, Plus, Sparkles, Trash2, Wrench } from 'lucide-react';
import React from 'react';
import type {
  ExperienceProfessionnelle,
  RessourceHumaineFormData,
} from '../../types/ressource-humaine.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FloatingInput } from '@/components/ui/floating-input';

interface ParcoursFieldsProps {
  formData: RessourceHumaineFormData;
  onChange: (patch: Partial<RessourceHumaineFormData>) => void;
  /** Champs remplis automatiquement par l'OCR, signalés visuellement. */
  autoFilled?: Set<keyof RessourceHumaineFormData>;
  disabled?: boolean;
}

/** Clés des listes de chaînes simples gérées par ce composant. */
type ListKey = 'formations' | 'diplomes' | 'competences' | 'langues';

/**
 * Champs du parcours professionnel, générés dynamiquement.
 *
 * Après un scan de CV réussi, l'OCR remplit ces champs : une ligne d'entrée
 * est créée pour chaque expérience, formation, diplôme, compétence et langue
 * détectés. L'utilisateur voit donc immédiatement des inputs concrets qu'il
 * peut relire, corriger, compléter ou supprimer — les données ne partent
 * jamais au backend sans cette vérification.
 *
 * Les sections alimentées par l'OCR portent un repère « Auto » pour distinguer
 * ce qui a été détecté de ce qui a été saisi à la main.
 */
const ParcoursFields: React.FC<ParcoursFieldsProps> = ({
  formData,
  onChange,
  autoFilled,
  disabled = false,
}) => {
  /* ─────────────── Expériences (objets) ─────────────── */

  const experiences = formData.experiences ?? [];

  const updateExperience = (
    index: number,
    field: keyof ExperienceProfessionnelle,
    value: string,
  ) => {
    const next = experiences.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange({ experiences: next });
  };

  const addExperience = () =>
    onChange({ experiences: [...experiences, { poste: '', organisation: '', periode: '' }] });

  const removeExperience = (index: number) =>
    onChange({ experiences: experiences.filter((_, i) => i !== index) });

  /* ─────────────── Listes simples ─────────────── */

  const updateItem = (key: ListKey, index: number, value: string) => {
    const list = formData[key] ?? [];
    onChange({ [key]: list.map((item, i) => (i === index ? value : item)) });
  };

  const addItem = (key: ListKey) => onChange({ [key]: [...(formData[key] ?? []), ''] });

  const removeItem = (key: ListKey, index: number) =>
    onChange({ [key]: (formData[key] ?? []).filter((_, i) => i !== index) });

  /** Badge indiquant qu'une section provient de l'analyse du CV. */
  const AutoBadge = ({ field }: { field: keyof RessourceHumaineFormData }) =>
    autoFilled?.has(field) ? (
      <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
        <Sparkles className="size-2.5" />
        Auto
      </span>
    ) : null;

  /** En-tête commun à toutes les sections. */
  const SectionHeader = ({
    icon,
    label,
    field,
    count,
    onAdd,
  }: {
    icon: React.ReactNode;
    label: string;
    field: keyof RessourceHumaineFormData;
    count: number;
    onAdd: () => void;
  }) => (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-ink-400">{icon}</span>
        <Label className="text-xs font-semibold uppercase tracking-wide text-ink-600">
          {label}
        </Label>
        {count > 0 && (
          <span data-numeric className="text-xs text-ink-400">
            ({count})
          </span>
        )}
        <AutoBadge field={field} />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
        <Plus className="size-3.5" />
        Ajouter
      </Button>
    </div>
  );

  /** Rendu générique d'une liste de chaînes. */
  const renderList = (
    key: ListKey,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
  ) => {
    const list = formData[key] ?? [];
    return (
      <section>
        <SectionHeader
          icon={icon}
          label={label}
          field={key}
          count={list.length}
          onAdd={() => addItem(key)}
        />

        {list.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-400">
            Aucune entrée. Importez un CV ou ajoutez une ligne manuellement.
          </p>
        ) : (
          <div className="space-y-2">
            {list.map((value, index) => (
              // L'index est ici une clé légitime : les lignes sont ordonnées
              // et éditées en place, sans identifiant métier disponible.
              <div key={`${key}-${index}`} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <FloatingInput
                    id={`${key}-${index}`}
                    label={`${placeholder} ${index + 1}`}
                    value={value}
                    onChange={(event) => updateItem(key, index, event.target.value)}
                    disabled={disabled}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-3 text-ink-400 hover:text-red-600"
                  onClick={() => removeItem(key, index)}
                  disabled={disabled}
                  aria-label={`Supprimer ${label.toLowerCase()} ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-5">
      {/* ─── Expériences professionnelles ─── */}
      <section>
        <SectionHeader
          icon={<Briefcase className="size-4" />}
          label="Expériences professionnelles"
          field="experiences"
          count={experiences.length}
          onAdd={addExperience}
        />

        {experiences.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-400">
            Aucune expérience. Importez un CV ou ajoutez une ligne manuellement.
          </p>
        ) : (
          <div className="space-y-3">
            {experiences.map((experience, index) => (
              <div
                key={`experience-${index}`}
                className="rounded-md border border-ink-100 bg-ink-50/50 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span data-numeric className="text-[11px] font-semibold text-ink-500">
                    Expérience {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-ink-400 hover:text-red-600"
                    onClick={() => removeExperience(index)}
                    disabled={disabled}
                    aria-label={`Supprimer l'expérience ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <FloatingInput
                  id={`experience-poste-${index}`}
                  label="Poste *"
                  value={experience.poste}
                  onChange={(event) => updateExperience(index, 'poste', event.target.value)}
                  disabled={disabled}
                />

                <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
                  <FloatingInput
                    id={`experience-organisation-${index}`}
                    label="Organisation"
                    value={experience.organisation ?? ''}
                    onChange={(event) =>
                      updateExperience(index, 'organisation', event.target.value)
                    }
                    disabled={disabled}
                  />
                  <FloatingInput
                    id={`experience-periode-${index}`}
                    label="Période"
                    value={experience.periode ?? ''}
                    onChange={(event) => updateExperience(index, 'periode', event.target.value)}
                    placeholder="2020 - 2023"
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {renderList('diplomes', 'Diplômes', <GraduationCap className="size-4" />, 'Diplôme')}
      {renderList('formations', 'Formations', <GraduationCap className="size-4" />, 'Formation')}
      {renderList('competences', 'Compétences', <Wrench className="size-4" />, 'Compétence')}
      {renderList('langues', 'Langues', <Languages className="size-4" />, 'Langue')}
    </div>
  );
};

export default ParcoursFields;
