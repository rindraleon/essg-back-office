import { Briefcase, GraduationCap, Languages, Plus, Sparkles, Trash2, Wrench } from 'lucide-react';
import React from 'react';
import type { ExperienceProfessionnelle, RessourceHumaineFormData } from '@/types';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { FloatingInput } from '../ui/floating-input';

interface ParcoursFieldsProps {
  formData: RessourceHumaineFormData;
  onChange: (patch: Partial<RessourceHumaineFormData>) => void;
  autoFilled?: Set<keyof RessourceHumaineFormData>;
  disabled?: boolean;
}

type ListKey = 'formations' | 'diplomes' | 'competences' | 'langues';

const AutoBadge = ({
  field,
  autoFilled,
}: {
  field: keyof RessourceHumaineFormData;
  autoFilled?: Set<keyof RessourceHumaineFormData>;
}) =>
  autoFilled?.has(field) ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
      <Sparkles className="size-2.5" />
      Auto
    </span>
  ) : null;

const SectionHeader = ({
  icon,
  label,
  field,
  count,
  onAdd,
  autoFilled,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  field: keyof RessourceHumaineFormData;
  count: number;
  onAdd: () => void;
  autoFilled?: Set<keyof RessourceHumaineFormData>;
  disabled: boolean;
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
      <AutoBadge field={field} autoFilled={autoFilled} />
    </div>
    <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
      <Plus className="size-3.5" />
      Ajouter
    </Button>
  </div>
);

const ParcoursFields: React.FC<ParcoursFieldsProps> = ({
  formData,
  onChange,
  autoFilled,
  disabled = false,
}) => {
  const experiences = formData.experiences ?? [];
  const experienceKeys = React.useRef(new WeakMap<ExperienceProfessionnelle, string>());
  const nextExperienceKey = React.useRef(0);

  const getExperienceKey = (experience: ExperienceProfessionnelle) => {
    let key = experienceKeys.current.get(experience);
    if (!key) {
      key = `experience-${nextExperienceKey.current++}`;
      experienceKeys.current.set(experience, key);
    }
    return key;
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceProfessionnelle,
    value: string
  ) => {
    const next = experiences.map((item, i) => {
      if (i !== index) return item;

      const updated = { ...item, [field]: value };
      experienceKeys.current.set(updated, getExperienceKey(item));
      return updated;
    });
    onChange({ experiences: next });
  };

  const addExperience = () => {
    const experience = { poste: '', organisation: '', periode: '' };
    getExperienceKey(experience);
    onChange({ experiences: [...experiences, experience] });
  };

  const removeExperience = (index: number) =>
    onChange({ experiences: experiences.filter((_, i) => i !== index) });

  const updateItem = (key: ListKey, index: number, value: string) => {
    const list = formData[key] ?? [];
    onChange({ [key]: list.map((item, i) => (i === index ? value : item)) });
  };

  const addItem = (key: ListKey) => onChange({ [key]: [...(formData[key] ?? []), ''] });

  const removeItem = (key: ListKey, index: number) =>
    onChange({ [key]: (formData[key] ?? []).filter((_, i) => i !== index) });

  const renderList = (key: ListKey, label: string, icon: React.ReactNode, placeholder: string) => {
    const list = formData[key] ?? [];
    return (
      <section>
        <SectionHeader
          icon={icon}
          label={label}
          field={key}
          count={list.length}
          onAdd={() => addItem(key)}
          autoFilled={autoFilled}
          disabled={disabled}
        />

        {list.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-400">
            Aucune entrée. Importez un CV ou ajoutez une ligne manuellement.
          </p>
        ) : (
          <div className="space-y-2">
            {list.map((value, index) => (
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
      <section>
        <SectionHeader
          icon={<Briefcase className="size-4" />}
          label="Expériences professionnelles"
          field="experiences"
          count={experiences.length}
          onAdd={addExperience}
          autoFilled={autoFilled}
          disabled={disabled}
        />

        {experiences.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 px-3 py-2.5 text-xs text-ink-400">
            Aucune expérience. Importez un CV ou ajoutez une ligne manuellement.
          </p>
        ) : (
          <div className="space-y-3">
            {experiences.map((experience, index) => (
              <div
                key={getExperienceKey(experience)}
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
