import { ArrowLeft, ArrowRight, Briefcase, CircleCheck, Globe, Info, Upload } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getImageUrl , toUpperName } from '@/utils';
import { uploadImage } from '@/services';
import type { Partenaire, PartenaireFormData } from '@/types';
import { PARTENAIRE_TYPES, DEFAULT_PARTENAIRE_FORM_DATA } from '@/constants';
import { useFormValidation } from '@/hooks';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';

interface PartenaireFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PartenaireFormData) => void | Promise<void>;
  initialData?: Partenaire | null;
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

type PartenaireField = keyof PartenaireFormData;

const STEP_FIELDS_MAP: Record<number, PartenaireField[]> = {
  0: ['nom', 'type', 'secteur', 'dateDebut'],
  1: ['description'],
  2: [],
};

const PartenaireForm: React.FC<PartenaireFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    formData,
    errors,
    activeStep,
    setActiveStep,
    handleChange,
    handleBlur,
    validateStep,
    validateAllSteps,
    setFormData,
    resetForm,
  } = useFormValidation<PartenaireFormData>({
    defaultValues: DEFAULT_PARTENAIRE_FORM_DATA,
    validators: {
      nom: {
        required: true,
        minLength: { value: 3, message: 'Le nom doit contenir au moins 3 caractères' },
      },
      description: {
        required: true,
        minLength: { value: 20, message: 'La description doit contenir au moins 20 caractères' },
      },
      type: { required: true },
      secteur: { required: true },
      dateDebut: { required: true },
    },
    stepFields: STEP_FIELDS_MAP,
  });

  const initialId = initialData?.id ?? '';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setFormData({
        nom: initialData.nom || '',
        type: initialData.type || 'Entreprise',
        secteur: initialData.secteur ?? '',
        dateDebut: initialData.dateDebut || new Date().toISOString().split('T')[0],
        description: initialData.description || '',
        logo: initialData.logo || '',
        siteWeb: initialData.siteWeb || '',
        contact: initialData.contact || '',
      });
      if (initialData.logo) {
        setLogoPreview(getImageUrl(initialData.logo));
      } else {
        setLogoPreview('');
      }
    } else {
      resetForm();
      setLogoPreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'partners');
      handleChange('logo', url);
      setLogoPreview(getImageUrl(url));
      toast.success('Logo téléversé avec succès');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec du téléversement du logo.';
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

  const dialogTitle = mode === 'create' ? 'Nouveau partenaire' : 'Modifier le partenaire';

  const renderStep0 = () => (
    <div className="space-y-4">
      <FloatingInput
        id="nom"
        label="Nom *"
        value={formData.nom}
        onChange={(e) => handleChange('nom', toUpperName(e.target.value))}
        onBlur={() => handleBlur('nom')}
        error={errors.nom}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FloatingSelect
          label="Type *"
          value={formData.type}
          onValueChange={(v, _eventDetails) => v && handleChange('type', v)}
          options={[...PARTENAIRE_TYPES]}
          error={errors.type}
        />
        <FloatingInput
          id="secteur"
          label="Secteur *"
          value={formData.secteur}
          onChange={(e) => handleChange('secteur', e.target.value)}
          onBlur={() => handleBlur('secteur')}
          error={errors.secteur}
          placeholder="Ex: Technologie, Finance, Santé..."
        />
      </div>

      <FloatingInput
        id="dateDebut"
        label="Date de début *"
        type="date"
        value={formData.dateDebut}
        onChange={(e) => handleChange('dateDebut', e.target.value)}
        onBlur={() => handleBlur('dateDebut')}
        error={errors.dateDebut}
      />
    </div>
  );

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

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">Logo</Label>
        <div className="flex items-start gap-3">
          {logoPreview && (
            <img
              loading="lazy"
              decoding="async"
              src={logoPreview}
              alt="Aperçu"
              className="w-20 h-20 object-cover rounded-md border border-ink-100 shrink-0"
              onError={() => setLogoPreview('')}
            />
          )}
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
              {uploadingImage ? 'Upload...' : logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
            </Button>
            <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-1">
      <FloatingInput
        id="siteWeb"
        label="Site web"
        type="url"
        autoComplete="url"
        value={formData.siteWeb}
        onChange={(e) => handleChange('siteWeb', e.target.value)}
        hint="https://exemple.com"
      />

      <FloatingInput
        id="contact"
        label="Contact"
        autoComplete="email"
        value={formData.contact}
        onChange={(e) => handleChange('contact', e.target.value)}
        hint="Email ou téléphone"
      />
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
        "
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-ink-50/80">
          <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>

          <div className="flex items-center justify-center gap-1 mt-3">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;

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
                      ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : isCompleted
                            ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                            : 'bg-ink-100 text-ink-400'
                      }
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

export default PartenaireForm;
