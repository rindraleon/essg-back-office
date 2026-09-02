import { CircleCheck, ImageUp, Loader2, Trash2, TriangleAlert, UserPlus } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_UPLOAD_SIZE,
  isAcceptedImage,
  toUpperName,
} from '@/utils';
import { uploadAvatar } from '@/services';
import type { User, UserFormData } from '@/types';
import { useFormValidation } from '@/hooks';
import { validateEmail, validateFirstName, validateName } from '@/constants';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';

interface UsersFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  initialData: User | null;
  mode: 'create' | 'edit';
}

const ROLE_OPTIONS = [
  { label: 'Administrateur', value: 'admin' },
  { label: 'Éditeur', value: 'editeur' },
  { label: 'Lecteur', value: 'lecteur' },
];

const defaultFormData: UserFormData = {
  email: '',
  motDePasse: '',
  prenom: '',
  nom: '',
  role: 'lecteur',
  estActif: true,
  avatar: undefined,
};

const UsersForm: React.FC<UsersFormProps> = ({ open, onClose, onSubmit, initialData, mode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string>('');

  const { formData, errors, handleChange, handleBlur, validateAllSteps, setFormData, resetForm } =
    useFormValidation<UserFormData>({
      defaultValues: defaultFormData,
      validators: {
        email: {
          required: true,
          custom: (value) => validateEmail(String(value ?? '')),
        },
        motDePasse: {
          required: mode === 'create',
          minLength: { value: 6, message: 'Min. 6 caractères' },
        },
        prenom: {
          required: true,
          custom: (value) => validateFirstName(String(value ?? '')),
        },
        nom: {
          required: true,
          custom: (value) => validateName(String(value ?? '')),
        },
      },
    });

  const initialId = initialData?.id ?? '';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setFormData({
        email: initialData.email,
        prenom: initialData.prenom,
        nom: initialData.nom,
        role: initialData.role,
        estActif: initialData.estActif,
        avatar: initialData.avatar,
        motDePasse: '',
      });
      setAvatarPreview(initialData.avatar ?? null);
      setAvatarError('');
    } else {
      resetForm();
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!isAcceptedImage(file)) {
      setAvatarError('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      setAvatarError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setAvatarError('');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError('');
    if (mode === 'edit' && initialData) {
      setFormData((prev) => ({ ...prev, avatar: undefined }));
    }
  };

  const getInitials = (): string => {
    const prenom = formData.prenom || '';
    const nom = formData.nom || '';
    const firstCharPrenom = prenom.length > 0 ? prenom.charAt(0) : '';
    const firstCharNom = nom.length > 0 ? nom.charAt(0) : '';
    const initiales = `${firstCharNom}${firstCharPrenom}`.toUpperCase();
    if (initiales) return initiales;
    return '??';
  };

  const handleSubmit = async () => {
    const allTouched: Record<string, boolean> = {};
    Object.keys(defaultFormData).forEach((k) => (allTouched[k] = true));

    const isValid = validateAllSteps();

    if (!isValid) {
      return;
    }

    if (avatarFile) {
      try {
        setUploading(true);

        if (mode === 'edit' && initialData) {
          const updatedUser = await uploadAvatar(initialData.id, avatarFile);
          setFormData((prev) => ({ ...prev, avatar: updatedUser.avatar }));
          setAvatarPreview(updatedUser.avatar ?? null);
          setAvatarFile(null);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur lors de l'upload de l'avatar";
        setAvatarError(message);
        toast.error(message);
        setUploading(false);
        return;
      }
    }

    const formDataToSubmit = {
      ...formData,
      ...(avatarFile && { avatarFile }),
    };

    onSubmit(formDataToSubmit);
    setUploading(false);
  };

  const dialogTitle = mode === 'create' ? 'Nouvel utilisateur' : "Modifier l'utilisateur";

  const getButtonText = (): string => {
    if (uploading) return 'Enregistrement…';
    return mode === 'create' ? 'Créer' : 'Enregistrer';
  };
  const buttonText = getButtonText();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="xl" showCloseButton={!uploading}>
        <DialogHeader
          icon={<UserPlus aria-hidden="true" />}
          title={dialogTitle}
          description={
            mode === 'create'
              ? 'Créez un compte et définissez son rôle. Un email de bienvenue sera envoyé.'
              : 'Modifiez les informations du compte. La photo est optimisée en WebP automatiquement.'
          }
        />

        <DialogBody>
          <div className="space-y-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar size="xl" className="ring-1 ring-ink-200">
                    <AvatarImage src={avatarPreview} alt="Photo du compte" />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                      aria-label="Retirer la photo"
                      className="absolute -top-1 -right-1 size-7 rounded-full bg-white shadow-soft"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
                    onChange={handleAvatarChange}
                    className="hidden"
                    aria-label="Choisir une photo pour ce compte"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <ImageUp className="size-3.5" aria-hidden="true" />
                    )}
                    {avatarPreview ? 'Changer' : 'Ajouter'}
                  </Button>
                  <span className="text-xs text-ink-400">JPG, PNG, GIF, WebP — 5 Mo max</span>
                  <p aria-live="polite" className="min-h-4 max-w-40 text-center text-xs">
                    {avatarError ? (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <TriangleAlert className="size-3.5" aria-hidden="true" />
                        {avatarError}
                      </span>
                    ) : (
                      avatarFile && (
                        <span className="inline-flex items-center gap-1 text-brand-700">
                          <CircleCheck className="size-3.5" aria-hidden="true" />
                          Prête à être envoyée
                        </span>
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
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
                <FloatingInput
                  id="email"
                  label="Email *"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  disabled={mode === 'edit'}
                />
                {mode === 'create' && (
                  <FloatingInput
                    id="motDePasse"
                    label="Mot de passe *"
                    type="password"
                    autoComplete="new-password"
                    value={formData.motDePasse}
                    onChange={(e) => handleChange('motDePasse', e.target.value)}
                    onBlur={() => handleBlur('motDePasse')}
                    error={errors.motDePasse}
                  />
                )}
              </div>
            </div>

            <FloatingSelect
              label="Rôle *"
              value={formData.role || 'lecteur'}
              onValueChange={(v, _eventDetails) => v && handleChange('role', v)}
              options={ROLE_OPTIONS}
              error={errors.role}
            />

            <div className="flex items-center gap-2">
              <Checkbox
                id="estActif"
                checked={formData.estActif}
                onCheckedChange={(checked) => handleChange('estActif', checked as boolean)}
                className="bg-white"
              />
              <Label htmlFor="estActif" className="cursor-pointer text-sm">
                Utilisateur actif
              </Label>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={uploading} aria-busy={uploading}>
            {uploading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsersForm;
