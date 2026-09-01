import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CircleCheck,
  Info,
  Upload,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getImageUrl, formatFullName } from '@/utils';
import { uploadImage } from '@/services';
import type { FormationFormData, FormationFormProps } from '@/types';
import { useFormValidation, useFormationMentionsQuery, useRessourcesHumainesQuery } from '@/hooks';
import {
  EMAIL_ERROR_MESSAGE,
  EMAIL_PATTERN,
  CONDITION_ACCES_OPTIONS,
  DUREE_OPTIONS,
  NIVEAU_OPTIONS,
  findMentionByTitre,
  getTitreOptions,
  isTitreInMention,
} from '@/constants';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';
import DynamicListField from '../common/DynamicListField';
import MultiValueSelect from '../common/MultiValueSelect';
import SearchSelect, { type SearchSelectOption } from '../common/SearchSelect';

const STEPS = [
  { id: 0, label: 'Informations', icon: <Info className="h-4 w-4" /> },
  { id: 1, label: 'Pédagogie', icon: <BookOpen className="h-4 w-4" /> },
  { id: 2, label: 'Détails', icon: <Briefcase className="h-4 w-4" /> },
];

type ArrayField = 'objectifs' | 'debouches' | 'programme' | 'competences';

type FormationField = keyof FormationFormData;

const STEP_FIELDS_MAP: Record<number, FormationField[]> = {
  0: ['mention', 'titre', 'niveau', 'duree', 'credits', 'description'],
  1: ['objectifs', 'debouches'],
  2: ['email'],
};

const defaultFormData: FormationFormData = {
  mention: '',
  domaine: [],
  titre: '',
  niveau: 'Licence',
  duree: '',
  description: '',
  objectifs: [''],
  debouches: [''],
  conditions: [],
  competences: [''],
  programme: [''],
  image: '',
  enVedette: false,
  credits: 180,
  responsable: '',
  responsableId: null,
  email: '',
};

const FormationForm: React.FC<FormationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: mentions = [] } = useFormationMentionsQuery();

  const {
    data: ressources = [],
    isLoading: loadingRessources,
    isError: ressourcesError,
    refetch: refetchRessources,
  } = useRessourcesHumainesQuery();

  const responsableOptions = useMemo<SearchSelectOption[]>(
    () =>
      ressources.map((rh) => ({
        value: String(rh.id),
        label: formatFullName(rh),
        description: rh.poste,
        image: rh.photo ? getImageUrl(rh.photo) : undefined,
      })),
    [ressources]
  );

  const {
    formData,
    errors,
    activeStep,
    setActiveStep,
    handleChange,
    handleChanges,
    handleBlur,
    validateStep,
    validateAllSteps,
    setFormData,
    resetForm,
  } = useFormValidation<FormationFormData>({
    defaultValues: defaultFormData,
    validators: {
      mention: { required: true },
      titre: {
        required: true,
        custom: (value, data) => {
          const titre = value as string;
          const mention = (data as FormationFormData).mention;
          if (!titre) return 'Le titre est requis';
          if (mention && !isTitreInMention(mention, titre, mentions)) {
            return "Ce titre n'appartient pas à la mention sélectionnée";
          }
          return undefined;
        },
      },
      niveau: { required: true },
      duree: { required: true },
      description: {
        required: true,
        minLength: { value: 20, message: 'Min. 20 caractères' },
      },
      credits: {
        required: true,
        custom: (value) => (Number(value) > 0 ? undefined : 'Doit être > 0'),
      },
      objectifs: {
        required: true,
        custom: (value) =>
          (value as string[]).filter((item) => item.trim()).length === 0
            ? 'Au moins un objectif requis'
            : undefined,
      },
      debouches: {
        required: true,
        custom: (value) =>
          (value as string[]).filter((item) => item.trim()).length === 0
            ? 'Au moins un débouché requis'
            : undefined,
      },
      email: {
        pattern: { regex: EMAIL_PATTERN, message: EMAIL_ERROR_MESSAGE },
      },
    },
    stepFields: STEP_FIELDS_MAP,
  });

  const initialId = initialData?.id ?? '';

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      const { id: _id, slug: _slug, creeLe: _c, misAJourLe: _m, ...rest } = initialData;

      const mention =
        rest.mention || rest.domaine?.[0] || findMentionByTitre(rest.titre, mentions)?.label || '';

      const legacyCondition = (initialData.conditionsAcces ?? '').trim();
      const conditions = [...(rest.conditions ?? [])];
      if (legacyCondition && !conditions.some((item) => item.trim() === legacyCondition)) {
        conditions.push(legacyCondition);
      }

      setFormData({
        ...defaultFormData,
        ...rest,
        mention,
        conditions: conditions.map((item) => item.trim()).filter(Boolean),
        competences: rest.competences?.length ? rest.competences : [''],
        programme: rest.programme?.length ? rest.programme : [''],
        objectifs: rest.objectifs?.length ? rest.objectifs : [''],
        debouches: rest.debouches?.length ? rest.debouches : [''],
        responsableId: rest.responsableId ?? null,
        responsable: rest.responsable ?? '',
      });
      setImagePreview(rest.image ? getImageUrl(rest.image) : '');
    } else {
      resetForm();
      setImagePreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const titreOptions = useMemo(
    () => getTitreOptions(formData.mention, mentions),
    [formData.mention, mentions]
  );

  const mentionOptions = useMemo(
    () => mentions.map((mention) => ({ value: mention.label, label: mention.label })),
    [mentions]
  );

  const handleMentionChange = (mention: string) => {
    const keepTitre = isTitreInMention(mention, formData.titre, mentions);
    handleChanges({
      mention,
      domaine: [mention],
      titre: keepTitre ? formData.titre : '',
    });
  };

  const handleResponsableChange = (value: string | null, option: SearchSelectOption | null) => {
    handleChanges({
      responsableId: value ? Number(value) : null,
      responsable: option?.label ?? '',
    });
  };

  const handleArrayChange = (field: ArrayField, index: number, value: string) => {
    const next = [...(formData[field] ?? [])];
    next[index] = value;
    handleChange(field, next);
  };

  const addArrayItem = (field: ArrayField) => handleChange(field, [...(formData[field] ?? []), '']);

  const removeArrayItem = (field: ArrayField, index: number) => {
    const current = formData[field] ?? [];
    if (current.length > 1) {
      handleChange(
        field,
        current.filter((_, i) => i !== index)
      );
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'formations');
      handleChange('image', url);
      setImagePreview(getImageUrl(url));
      toast.success('Image téléversée avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du téléversement de l'image.");
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleStepClick = (step: number) => {
    if (step < activeStep) {
      setActiveStep(step);
      return;
    }
    for (let i = activeStep; i < step; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return;
      }
    }
    setActiveStep(step);
  };

  const handleSubmit = async () => {
    if (submitting || !validateAllSteps()) return;
    setSubmitting(true);
    try {
      const clean = (items?: string[]) => (items ?? []).map((i) => i.trim()).filter(Boolean);
      await onSubmit({
        ...formData,
        domaine: formData.mention ? [formData.mention] : [],
        objectifs: clean(formData.objectifs),
        debouches: clean(formData.debouches),
        conditions: clean(formData.conditions),
        competences: clean(formData.competences),
        programme: clean(formData.programme),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'Nouvelle formation' : 'Modifier la formation';

  const renderStep0 = () => (
    <div className="space-y-1">
      <FloatingSelect
        label="Mention / Domaine *"
        value={formData.mention ?? ''}
        onValueChange={(v) => v && handleMentionChange(v)}
        options={mentionOptions}
        error={errors.mention}
        hint="Sélectionnez d'abord la mention pour accéder aux titres associés"
      />

      <FloatingSelect
        label="Titre de la formation *"
        value={formData.titre}
        onValueChange={(v) => v && handleChange('titre', v)}
        options={titreOptions}
        error={errors.titre}
        hint={
          formData.mention
            ? `${titreOptions.length} titre(s) disponible(s) pour cette mention`
            : 'Choisissez une mention pour activer ce champ'
        }
      />

      <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
        <FloatingSelect
          label="Niveau *"
          value={formData.niveau}
          onValueChange={(v) => v && handleChange('niveau', v)}
          options={NIVEAU_OPTIONS}
          error={errors.niveau}
        />
        <FloatingSelect
          label="Durée *"
          value={formData.duree}
          onValueChange={(v) => v && handleChange('duree', v)}
          options={DUREE_OPTIONS}
          error={errors.duree}
        />
      </div>

      <FloatingInput
        id="credits"
        label="Crédits *"
        type="number"
        inputMode="numeric"
        value={formData.credits}
        onChange={(e) => handleChange('credits', Number.parseInt(e.target.value, 10) || 0)}
        onBlur={() => handleBlur('credits')}
        error={errors.credits}
      />

      <FloatingTextarea
        id="description"
        label="Description *"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        onBlur={() => handleBlur('description')}
        rows={3}
        error={errors.description}
        hint={!errors.description ? `${formData.description.length} caractère(s)` : undefined}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <DynamicListField
          label="Objectifs *"
          items={formData.objectifs}
          error={errors.objectifs}
          onAdd={() => addArrayItem('objectifs')}
          onRemove={(i) => removeArrayItem('objectifs', i)}
          onChange={(i, v) => handleArrayChange('objectifs', i, v)}
        />
        <DynamicListField
          label="Débouchés *"
          items={formData.debouches}
          error={errors.debouches}
          onAdd={() => addArrayItem('debouches')}
          onRemove={(i) => removeArrayItem('debouches', i)}
          onChange={(i, v) => handleArrayChange('debouches', i, v)}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <DynamicListField
          label="Programme (modules)"
          items={formData.programme ?? []}
          onAdd={() => addArrayItem('programme')}
          onRemove={(i) => removeArrayItem('programme', i)}
          onChange={(i, v) => handleArrayChange('programme', i, v)}
        />
        <DynamicListField
          label="Compétences visées"
          items={formData.competences ?? []}
          onAdd={() => addArrayItem('competences')}
          onRemove={(i) => removeArrayItem('competences', i)}
          onChange={(i, v) => handleArrayChange('competences', i, v)}
        />
      </div>

      <MultiValueSelect
        label="Conditions et prérequis d'accès"
        values={formData.conditions ?? []}
        onChange={(values) => setFormData((prev) => ({ ...prev, conditions: values }))}
        suggestions={CONDITION_ACCES_OPTIONS}
        placeholder="Rechercher ou saisir une condition…"
        emptyMessage="Aucune proposition — saisissez la condition puis validez"
        hint="Sélectionnez une ou plusieurs conditions, ou saisissez-en une nouvelle"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <SearchSelect
        label="Responsable de formation"
        value={formData.responsableId ? String(formData.responsableId) : null}
        onChange={handleResponsableChange}
        options={responsableOptions}
        isLoading={loadingRessources}
        loadError={ressourcesError ? 'Impossible de charger les ressources humaines.' : null}
        onRetry={() => void refetchRessources()}
        placeholder="Rechercher par nom, prénom ou poste..."
        emptyMessage="Aucune ressource humaine trouvée"
        hint="Sélectionnez la personne responsable dans les ressources humaines"
      />

      <FloatingInput
        id="email"
        label="Email de contact"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
      />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-ink-600">Image</Label>
        <div className="flex items-start gap-3">
          {imagePreview && (
            <img
              loading="lazy"
              decoding="async"
              src={imagePreview}
              alt="Aperçu"
              className="h-20 w-28 shrink-0 rounded-md border border-ink-100 object-cover"
              onError={() => setImagePreview('')}
            />
          )}
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingImage ? 'Téléversement…' : 'Choisir une image'}
            </Button>
            <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="enVedette"
          checked={formData.enVedette}
          onCheckedChange={(checked) => handleChange('enVedette', checked as boolean)}
          className="bg-white"
        />
        <Label htmlFor="enVedette" className="cursor-pointer text-sm">
          Mettre en vedette
        </Label>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] gap-0 overflow-hidden bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-ink-50/80 px-5 pt-4 pb-3">
          <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>

          <div className="mt-3 flex items-center justify-center gap-1">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              return (
                <React.Fragment key={step.id}>
                  {index > 0 && (
                    <div
                      className={`hidden h-px w-8 transition-colors sm:block ${
                        isCompleted ? 'bg-brand-500' : 'bg-ink-300'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : isCompleted
                          ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                          : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {isCompleted ? <CircleCheck className="h-4 w-4" /> : step.icon}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </DialogHeader>

        <div className="max-h-[58vh] overflow-y-auto px-5 py-4">{stepRenderers[activeStep]()}</div>

        <DialogFooter className="mx-4 mb-4 border-t bg-ink-50/80 px-5 py-3">
          <div className="flex w-full items-center justify-between">
            <span data-numeric className="text-xs text-ink-400">
              {activeStep + 1}/{STEPS.length}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Annuler
              </Button>

              {activeStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Précédent
                </Button>
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button type="button" size="sm" onClick={handleNext} disabled={submitting}>
                  Suivant
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={handleSubmit} disabled={submitting}>
                  <CircleCheck className="h-3.5 w-3.5" />
                  {submitting ? 'Enregistrement…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormationForm;
