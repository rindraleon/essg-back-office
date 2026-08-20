import { Trash2, Upload } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getImageUrl } from '../../utils/image.utils';
import { toUpperName } from '../../utils/slug.utils';
import { uploadAvatar } from '../../services';
import type { User, UserFormData } from '../../types';
import { useFormValidation } from '../../hooks/useFormValidation';
import {
  EMAIL_ERROR_MESSAGE,
  EMAIL_PATTERN,
} from '../../constants/validation.constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingSelect } from '@/components/ui/floating-select';

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

  const { formData, errors, handleChange, handleBlur, validateAllSteps, setFormData, resetForm } =
    useFormValidation<UserFormData>({
      defaultValues: defaultFormData,
      validators: {
        email: {
          required: true,
          pattern: { regex: EMAIL_PATTERN, message: EMAIL_ERROR_MESSAGE },
        },
        motDePasse: {
          required: mode === 'create',
          minLength: { value: 6, message: 'Min. 6 caractères' },
        },
        prenom: { required: true },
        nom: { required: true },
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
      setAvatarPreview(initialData.avatar ? getImageUrl(initialData.avatar) : null);
    } else {
      resetForm();
      setAvatarPreview(null);
      setAvatarFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialId]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Format d'image non supporté. Utilisez JPG, PNG, GIF ou WebP");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (mode === 'edit' && initialData) {
      setFormData((prev) => ({ ...prev, avatar: undefined }));
    }
  };

  const getInitials = (): string => {
    const prenom = formData.prenom || '';
    const nom = formData.nom || '';
    const firstCharPrenom = prenom.length > 0 ? prenom.charAt(0) : '';
    const firstCharNom = nom.length > 0 ? nom.charAt(0) : '';
    const initiales = `${firstCharPrenom}${firstCharNom}`.toUpperCase();
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
          setAvatarPreview(updatedUser.avatar ? getImageUrl(updatedUser.avatar) : null);
          setAvatarFile(null);
        }
      } catch (error) {
        console.error("Erreur lors de l'upload de l'avatar:", error);
        toast.error("Erreur lors de l'upload de l'avatar");
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

  const buttonText = uploading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="
          sm:max-w-2xl
          w-[95vw]
          bg-white
          p-0
          gap-0
          overflow-hidden
          [&>button]:hidden
        "
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-ink-50/80">
          <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 overflow-y-auto max-h-[58vh]">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden border-2 border-ink-300"
                    style={{ backgroundColor: avatarPreview ? 'transparent' : undefined }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarPreview(null)}
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-ink-600">{getInitials()}</span>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                      style={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 style={{ fontSize: 14 }} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-1.5 bg-white text-xs h-8"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {avatarPreview ? 'Changer' : 'Ajouter'}
                  </Button>
                  <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
                  <FloatingInput
                    id="prenom"
                    label="Prénom *"
                    autoComplete="given-name"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    onBlur={() => handleBlur('prenom')}
                    error={errors.prenom}
                  />
                  <FloatingInput
                    id="nom"
                    label="Nom *"
                    autoComplete="family-name"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', toUpperName(e.target.value))}
                    onBlur={() => handleBlur('nom')}
                    error={errors.nom}
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
        </div>

        <DialogFooter className="px-5 py-3 mb-4 mx-4 border-t bg-ink-50/80">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={uploading}
              className="text-ink-500 h-8"
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={uploading}
              className="gap-1 h-8 bg-brand-600 hover:bg-brand-700"
            >
              {buttonText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsersForm;
