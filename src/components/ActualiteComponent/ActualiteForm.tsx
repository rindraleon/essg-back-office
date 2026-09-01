import { ArrowLeft, ArrowRight, CircleCheck, Globe, Info, Pencil, Upload } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/services';
import { getImageUrl } from '@/utils';
import type { ActualiteItem, ActualiteFormData } from '@/types';
import { ACTUALITE_CATEGORIES as categories, ACTUALITE_STATUTS as statuts } from '@/constants';
import { useFormValidation } from '@/hooks';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';
import MultiImageUpload from '../common/MultiImageUpload';

interface ActualiteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ActualiteFormData) => void | Promise<void>;
  initialData?: ActualiteItem | null;
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
    label: 'Contenu',
    icon: <Pencil className="h-4 w-4" />,
  },
  {
    id: 2,
    label: 'Publication',
    icon: <Globe className="h-4 w-4" />,
  },
];

type ActualiteField = keyof ActualiteFormData;

const STEP_FIELDS_MAP: Record<number, ActualiteField[]> = {
  0: ['titre', 'categorie', 'auteur', 'date'],
  1: ['contenu', 'resume'],
  2: ['statut'],
};

const defaultFormData: ActualiteFormData = {
  titre: '',
  contenu: '',
  categorie: '',
  auteur: '',
  date: new Date().toISOString().split('T')[0],
  statut: 'brouillon',
  image: '',
  galerie: [],
  resume: '',
  enVedette: false,
};

const ActualiteForm: React.FC<ActualiteFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
  } = useFormValidation<ActualiteFormData>({
    defaultValues: defaultFormData,
    validators: {
      titre: {
        required: true,
        minLength: { value: 5, message: 'Le titre doit contenir au moins 5 caractères' },
      },
      contenu: {
        required: true,
        minLength: { value: 20, message: 'Le contenu doit contenir au moins 20 caractères' },
      },
      categorie: { required: true },
      auteur: { required: true },
      date: { required: true },
      statut: { required: true },
    },
    stepFields: STEP_FIELDS_MAP,
  });

  const initialId = initialData?.id ?? '';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      const imageUrl = initialData.image || '';
      setFormData({
        titre: initialData.titre,
        contenu: initialData.contenu,
        categorie: initialData.categorie,
        auteur: initialData.auteur,
        date: initialData.date,
        statut: initialData.statut,
        image: imageUrl,
        galerie: initialData.galerie ?? [],
        resume: initialData.resume || '',
        enVedette: initialData.enVedette ?? false,
      });
      setImagePreview(imageUrl ? getImageUrl(imageUrl) : '');
    } else {
      resetForm();
      setImagePreview('');
    }
  }, [open, mode, initialId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'news');
      handleChange('image', url);
      setImagePreview(getImageUrl(url));
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

  const dialogTitle = mode === 'create' ? 'Nouvelle actualité' : "Modifier l'actualité";
  let submitLabel = mode === 'create' ? 'Créer' : 'Enregistrer';
  if (submitting) submitLabel = 'Enregistrement...';

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
        <FloatingInput
          id="auteur"
          label="Auteur *"
          autoComplete="name"
          value={formData.auteur}
          onChange={(e) => handleChange('auteur', e.target.value)}
          onBlur={() => handleBlur('auteur')}
          error={errors.auteur}
        />
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

      <FloatingSelect
        label="Catégorie *"
        value={formData.categorie}
        onValueChange={(v, _eventDetails) => v && handleChange('categorie', v)}
        options={categories.map((cat) => ({ label: cat, value: cat }))}
        error={errors.categorie}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <FloatingTextarea
        id="contenu"
        label="Contenu *"
        value={formData.contenu}
        onChange={(e) => handleChange('contenu', e.target.value)}
        onBlur={() => handleBlur('contenu')}
        rows={4}
        error={errors.contenu}
        hint={!errors.contenu ? `${formData.contenu.length} caractère(s)` : undefined}
      />

      <FloatingTextarea
        id="resume"
        label="Résumé (optionnel)"
        value={formData.resume}
        onChange={(e) => handleChange('resume', e.target.value)}
        rows={3}
        hint="Court résumé de l'actualité"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
          Image de couverture
        </Label>
        <div className="flex items-start gap-3">
          {imagePreview && (
            <img
              loading="lazy"
              decoding="async"
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
        label="Galerie de l'actualité"
        folder="news"
        value={formData.galerie ?? []}
        onChange={(urls) => handleChange('galerie', urls)}
        disabled={uploadingImage}
      />

      <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
        <FloatingSelect
          label="Statut *"
          value={formData.statut}
          onValueChange={(v, _eventDetails) => v && handleChange('statut', v)}
          options={statuts}
          error={errors.statut}
        />

        <div className="flex h-12 items-center gap-2 pt-2">
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
              let stepClass = 'bg-ink-100 text-ink-400';
              if (isActive) stepClass = 'bg-brand-600 text-white shadow-sm';
              else if (isCompleted) stepClass = 'bg-brand-50 text-brand-700 hover:bg-brand-100';

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
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      text-xs font-medium transition-all
                      ${stepClass}
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
                  {submitLabel}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActualiteForm;
