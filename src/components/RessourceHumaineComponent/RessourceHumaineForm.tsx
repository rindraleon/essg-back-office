import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CircleCheck,
  Globe,
  GraduationCap,
  Info,
  Upload,
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { toUpperName, getImageUrl } from '@/utils';
import { uploadImage } from '@/services';
import type { RessourceHumaineItem, RessourceHumaineFormData } from '@/types';
import {
  RESSOURCE_HUMAINE_POSTES as postes,
  EMAIL_ERROR_MESSAGE,
  EMAIL_PATTERN,
} from '@/constants';
import { useFormValidation } from '@/hooks';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';
import CvImportPanel from './CvImportPanel';
import ParcoursFields from './ParcoursFields';

interface RessourceHumaineFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RessourceHumaineFormData) => void | Promise<void>;
  initialData?: RessourceHumaineItem | null;
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
    label: 'Contact',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: 2,
    label: 'Parcours',
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    id: 3,
    label: 'Publication',
    icon: <Globe className="h-4 w-4" />,
  },
];

type RessourceHumaineField = keyof RessourceHumaineFormData;

const STEP_FIELDS_MAP: Record<number, RessourceHumaineField[]> = {
  0: ['nom', 'prenom', 'poste'],
  1: ['email', 'telephone', 'description'],
  2: ['experiences', 'formations', 'diplomes', 'competences', 'langues'],
  3: ['ordre'],
};

const defaultFormData: RessourceHumaineFormData = {
  nom: '',
  prenom: '',
  poste: '',
  description: '',
  email: '',
  telephone: '',
  adresse: '',
  photo: '',
  actif: true,
  ordre: 0,
  experiences: [],
  formations: [],
  diplomes: [],
  competences: [],
  langues: [],
};

const RessourceHumaineForm: React.FC<RessourceHumaineFormProps> = ({
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
  const [autoFilled, setAutoFilled] = useState<Set<keyof RessourceHumaineFormData>>(new Set());

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
  } = useFormValidation<RessourceHumaineFormData>({
    defaultValues: defaultFormData,
    validators: {
      nom: {
        required: true,
        minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' },
      },
      prenom: {
        required: true,
        minLength: { value: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
      },
      poste: { required: true },
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
      const imageUrl = initialData.photo || '';
      setFormData({
        nom: initialData.nom,
        prenom: initialData.prenom,
        poste: initialData.poste,
        description: initialData.description || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        adresse: initialData.adresse || '',
        photo: imageUrl,
        actif: initialData.actif,
        ordre: initialData.ordre,
        experiences: initialData.experiences ?? [],
        formations: initialData.formations ?? [],
        diplomes: initialData.diplomes ?? [],
        competences: initialData.competences ?? [],
        langues: initialData.langues ?? [],
      });
      setAutoFilled(new Set());
      setImagePreview(imageUrl ? getImageUrl(imageUrl) : '');
    } else {
      resetForm();
      setImagePreview('');
      setAutoFilled(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'staff');
      handleChange('photo', url);
      setImagePreview(getImageUrl(url));
      toast.success('Photo téléversée avec succès');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec du téléversement de la photo.';
      toast.error(message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
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

  const handleSubmit = async () => {
    if (submitting || !validateAllSteps()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle =
    mode === 'create' ? 'Nouvelle ressource humaine' : 'Modifier la ressource humaine';

  let submitButtonLabel = 'Enregistrer';
  if (submitting) {
    submitButtonLabel = 'Enregistrement...';
  } else if (mode === 'create') {
    submitButtonLabel = 'Créer';
  }

  const renderStep0 = () => (
    <div className="space-y-3">
      {mode === 'create' && (
        <CvImportPanel
          disabled={submitting}
          onApply={(patch, champs) => {
            handleChanges(patch);
            setAutoFilled(champs);
          }}
        />
      )}

      <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
        <FloatingInput
          id="nom"
          label="Nom *"
          autoComplete="family-name"
          value={formData.nom}
          onChange={(e) => handleChange('nom', toUpperName(e.target.value))}
          onBlur={() => handleBlur('nom')}
          error={errors.nom}
        />
        <FloatingInput
          id="prenom"
          label="Prénom *"
          autoComplete="given-name"
          value={formData.prenom}
          onChange={(e) => handleChange('prenom', e.target.value)}
          onBlur={() => handleBlur('prenom')}
          error={errors.prenom}
        />
      </div>

      <FloatingSelect
        label="Poste *"
        value={formData.poste}
        onValueChange={(v, _eventDetails) => v && handleChange('poste', v)}
        options={postes.map((poste) => ({ label: poste, value: poste }))}
        error={errors.poste}
      />

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
          Photo de profil
        </Label>
        <div className="flex items-start gap-3">
          {imagePreview && (
            <img
              loading="lazy"
              decoding="async"
              src={imagePreview}
              alt="Aperçu"
              className="w-24 h-24 object-cover rounded-md border border-ink-100 shrink-0"
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
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingImage ? 'Upload...' : 'Choisir une photo'}
            </Button>
            <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
          placeholder="email@exemple.com"
        />
        <FloatingInput
          id="telephone"
          label="Téléphone"
          value={formData.telephone}
          onChange={(e) => handleChange('telephone', e.target.value)}
          placeholder="+261 34 00 000 00"
        />
      </div>

      <FloatingInput
        id="adresse"
        label="Adresse"
        value={formData.adresse ?? ''}
        onChange={(e) => handleChange('adresse', e.target.value)}
        placeholder="Lot II M 15 Antananarivo"
      />

      <FloatingTextarea
        id="description"
        label="Description (optionnel)"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        rows={5}
        placeholder="Description du poste, compétences, expériences..."
      />
    </div>
  );

  const renderStep2 = () => (
    <ParcoursFields
      formData={formData}
      onChange={handleChanges}
      autoFilled={autoFilled}
      disabled={submitting}
    />
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <FloatingInput
        id="ordre"
        label="Ordre d'affichage"
        type="number"
        value={formData.ordre.toString()}
        onChange={(e) => handleChange('ordre', Number.parseInt(e.target.value) || 0)}
        min="0"
      />
      <p className="text-xs text-ink-500 -mt-2">
        Les ressources avec un ordre plus petit apparaissent en premier
      </p>

      <div className="flex items-center gap-2">
        <Checkbox
          id="actif"
          checked={formData.actif}
          onCheckedChange={(checked) => handleChange('actif', checked as boolean)}
          className="bg-white"
        />
        <Label htmlFor="actif" className="cursor-pointer text-sm">
          Ressource active
        </Label>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

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
        "
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-ink-50/80">
          <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>

          <div className="flex items-center justify-center gap-1 mt-3">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;

              let stepButtonClasses = 'bg-ink-100 text-ink-400';

              if (isActive) {
                stepButtonClasses = 'bg-brand-600 text-white shadow-sm';
              } else if (isCompleted) {
                stepButtonClasses = 'bg-brand-50 text-brand-700 hover:bg-brand-100';
              }

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
                      ${stepButtonClasses}
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

        <div className="px-5 py-4 overflow-y-auto max-h-[58vh]">{stepRenderers[activeStep]()}</div>

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
                  {submitButtonLabel}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RessourceHumaineForm;
