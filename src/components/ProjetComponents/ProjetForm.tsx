import { ArrowLeft, ArrowRight, Briefcase, CircleCheck, Globe, Info, Upload } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '../../services';
import { getImageUrl } from '../../utils/image.utils';
import { isValidSourceUrl } from '../../utils/projet.utils';
import type { Projet, ProjetFormData, ProjectSource } from '../../types/projet.types';
import SourcesField from './SourcesField';
import { PROJET_TYPES, PROJET_STATUTS, DEFAULT_FORM_DATA } from '../../constants/projet.constants';
import { useFormValidation } from '../../hooks/useFormValidation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { FloatingSelect } from '@/components/ui/floating-select';
import MultiImageUpload from '../common/MultiImageUpload';
import MultiSearchSelect from '../common/MultiSearchSelect';
import type { SearchSelectOption } from '../common/SearchSelect';
import { usePartenairesQuery } from '../../hooks/queries';

interface ProjetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjetFormData) => void | Promise<void>;
  initialData?: Projet | null;
  mode: 'create' | 'edit';
}

const STEPS = [
  {
    id: 0,
    label: 'Informations',
    icon: <Info className="h-4 w-4" />,
  },
  {
    id: 1,
    label: 'Détails',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: 2,
    label: 'Publication',
    icon: <Globe className="h-4 w-4" />,
  },
];

type ProjetFormState = ProjetFormData & {
  statut: string;
};

type ProjetField = keyof ProjetFormState;

const STEP_FIELDS_MAP: Record<number, ProjetField[]> = {
  0: ['titre', 'type', 'date'],
  1: ['description', 'sources'],
  2: ['ville', 'pays', 'adresse'],
};

const ProjetForm: React.FC<ProjetFormProps> = ({ open, onClose, onSubmit, initialData, mode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Liste des partenaires disponibles (cache React Query partagé).
  const {
    data: partenaires = [],
    isLoading: loadingPartenaires,
    isError: partenairesError,
    refetch: refetchPartenaires,
  } = usePartenairesQuery();

  const partenaireOptions = useMemo<SearchSelectOption[]>(
    () =>
      partenaires.map((partenaire) => ({
        value: String(partenaire.id),
        label: partenaire.nom,
        description: partenaire.secteur || partenaire.type,
      })),
    [partenaires]
  );

  const projectValidators = {
    titre: {
      required: true,
      minLength: { value: 5, message: 'Le titre doit contenir au moins 5 caractères' },
    },
    description: {
      required: true,
      minLength: { value: 20, message: 'La description doit contenir au moins 20 caractères' },
    },
    type: { required: true },
    statut: { required: true },
    date: { required: true },
    sources: {
      custom: (value: unknown) => {
        const list = (value ?? []) as ProjectSource[];
        for (const source of list) {
          if (!source.title?.trim()) return 'Chaque source doit avoir un titre.';
          if (!source.url?.trim()) return 'Chaque source doit avoir une URL.';
          if (!isValidSourceUrl(source.url)) {
            return `L'URL « ${source.url} » est invalide.`;
          }
        }
        return undefined;
      },
    },
  } as const;

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
  } = useFormValidation<ProjetFormData>({
    defaultValues: DEFAULT_FORM_DATA,
    validators: projectValidators as any,
    stepFields: STEP_FIELDS_MAP,
  });

  const initialId = initialData?.id ?? '';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      const imageUrl = initialData.image || '';
      setFormData({
        titre: initialData.titre,
        type: initialData.type,
        statut: 'En cours',
        date: initialData.date,
        description: initialData.description,
        partenaires: initialData.partenaires ?? [],
        partenaireIds: initialData.partenaireIds ?? [],
        image: imageUrl,
        galerie: initialData.galerie ?? [],
        sources: initialData.sources ?? [],
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        ville: initialData.ville,
        pays: initialData.pays,
        adresse: initialData.adresse,
      } as ProjetFormData);
      setImagePreview(imageUrl ? getImageUrl(imageUrl) : '');
    } else {
      resetForm();
      setImagePreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'projects');
      handleChange('image', url);
      setImagePreview(url);
      toast.success('Image téléversée avec succès');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec du téléversement de l'image.";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleStepClick = (step: number) => {
    if (step < activeStep) {
      setActiveStep(step);
    } else if (step > activeStep) {
      let canAdvance = true;
      for (let i = activeStep; i < step; i++) {
        if (!validateStep(i)) {
          setActiveStep(i);
          canAdvance = false;
          break;
        }
      }
      if (canAdvance) setActiveStep(step);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting || !validateAllSteps()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'Nouveau projet' : 'Modifier le projet';

  /* ─── Step 0 : Informations générales ─── */
  const renderStep0 = () => (
    <div className="space-y-1">
      <FloatingInput
        id="titre"
        label="Titre *"
        autoComplete="off"
        value={formData.titre}
        onChange={(e) => handleChange('titre', e.target.value)}
        onBlur={() => handleBlur('titre')}
        error={errors.titre}
      />

      <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
        <FloatingSelect
          label="Type *"
          value={formData.type}
          onValueChange={(v, _eventDetails) => v && handleChange('type', v)}
          options={[...PROJET_TYPES]}
          error={errors.type}
        />
        {/* Statut : repris tel quel par le site public (carte, détail, filtre). */}
        <FloatingSelect
          label="Statut *"
          value={formData.statut}
          onValueChange={(v, _eventDetails) => v && handleChange('statut', v)}
          options={[...PROJET_STATUTS]}
          error={errors.statut}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
        <FloatingInput
          id="date"
          label="Date *"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          onBlur={() => handleBlur('date')}
          error={errors.date}
        />
      </div>
    </div>
  );

  /* ─── Step 1 : Détails ─── */
  const renderStep1 = () => (
    <div className="space-y-4">
      <FloatingTextarea
        id="description"
        label="Description *"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        onBlur={() => handleBlur('description')}
        rows={5}
        error={errors.description}
        hint={!errors.description ? `${formData.description.length} caractère(s)` : undefined}
      />

      {/* Partenaires : Select alimenté dynamiquement par l'API */}
      <MultiSearchSelect
        label="Partenaires"
        values={(formData.partenaireIds ?? []).map(String)}
        onChange={(ids, options) =>
          handleChanges({
            partenaireIds: ids.map(Number),
            // Les noms restent synchronisés pour l'affichage public.
            partenaires: options.map((option) => option.label),
          })
        }
        options={partenaireOptions}
        isLoading={loadingPartenaires}
        loadError={partenairesError ? 'Impossible de charger les partenaires.' : null}
        onRetry={() => void refetchPartenaires()}
        placeholder="Rechercher un partenaire..."
        emptyMessage="Aucun partenaire disponible"
        hint="Sélectionnez un ou plusieurs partenaires associés au projet"
      />

      <SourcesField
        value={(formData.sources ?? []) as ProjectSource[]}
        error={errors.sources}
        onChange={(sources) => handleChange('sources', sources)}
      />
    </div>
  );

  /* ─── Step 2 : Publication ─── */
  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Image */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
          Image de couverture
        </Label>
        <div className="flex items-start gap-3">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-28 h-20 object-cover rounded-md border border-ink-100 shrink-0"
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
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              size="sm"
              className="gap-1.5 bg-white text-xs h-8"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingImage ? 'Upload...' : 'Choisir une image'}
            </Button>
            <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
          </div>
        </div>
      </div>

      <MultiImageUpload
        label="Galerie du projet"
        folder="projects"
        value={formData.galerie ?? []}
        onChange={(urls) => handleChange('galerie', urls)}
        disabled={uploadingImage}
      />

      {/* Localisation */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="h-4 w-4 text-ink-400" />
          <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
            Localisation (optionnel)
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="ville"
            label="Ville"
            value={formData.ville || ''}
            onChange={(e) => handleChange('ville', e.target.value)}
          />
          <FloatingInput
            id="pays"
            label="Pays"
            value={formData.pays || ''}
            onChange={(e) => handleChange('pays', e.target.value)}
          />
        </div>

        <FloatingInput
          id="adresse"
          label="Adresse"
          value={formData.adresse || ''}
          onChange={(e) => handleChange('adresse', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="latitude"
            label="Latitude"
            type="number"
            step="any"
            value={formData.latitude?.toString() || ''}
            onChange={(e) =>
              handleChange(
                'latitude',
                e.target.value ? Number.parseFloat(e.target.value) : undefined
              )
            }
          />
          <FloatingInput
            id="longitude"
            label="Longitude"
            type="number"
            step="any"
            value={formData.longitude?.toString() || ''}
            onChange={(e) =>
              handleChange(
                'longitude',
                e.target.value ? Number.parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="
          sm:max-w-3xl
          w-[95vw]
          bg-white
          p-0
          gap-0
          overflow-hidden
          [&>button]:hidden
        "
      >
        {/* ─── Header + Stepper ─── */}
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-ink-50/80">
          <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>

          <div className="flex items-center justify-center gap-1 mt-3">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              const buttonClassName = isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : isCompleted
                  ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'bg-ink-100 text-ink-400';

              return (
                <React.Fragment key={step.id}>
                  {index > 0 && (
                    <div
                      className={`hidden sm:block h-px w-8 transition-colors ${
                        isCompleted ? 'bg-brand-500' : 'bg-ink-300'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md
                      text-xs font-medium transition-all
                      ${buttonClassName}
                    `}
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

        {/* ─── Body ─── */}
        <div className="px-5 py-4 overflow-y-auto max-h-[58vh]">{stepRenderers[activeStep]()}</div>

        {/* ─── Footer ─── */}
        <DialogFooter className="px-5 py-3 mb-4 mx-4 border-t bg-ink-50/80">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-ink-400">
              {activeStep + 1}/{STEPS.length}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={submitting}
                className="text-ink-500 h-8"
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
                  className="gap-1 h-8"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Précédent
                </Button>
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={submitting}
                  className="gap-1 h-8 bg-brand-600 hover:bg-brand-700"
                >
                  Suivant
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-1 h-8 bg-brand-600 hover:bg-brand-700"
                >
                  <CircleCheck className="h-3.5 w-3.5" />
                  {submitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjetForm;
