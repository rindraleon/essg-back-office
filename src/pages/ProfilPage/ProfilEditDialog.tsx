import { CircleCheck, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { updateUser as updateUserRequest, uploadAvatar } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../utils/image.utils';
import type { User } from '../../types/auth.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FloatingInput } from '@/components/ui/floating-input';
import { EMAIL_PATTERN } from '../../constants/validation.constants';
import { getPersonInitials } from '../../utils/name.utils';

interface ProfilEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  confirmation: string;
}

const ProfilEditDialog: React.FC<ProfilEditDialogProps> = ({ open, onClose, user }) => {
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      prenom: user.prenom ?? '',
      nom: user.nom ?? '',
      email: user.email ?? '',
      motDePasse: '',
      confirmation: '',
    });
    setErrors({});
    setAvatarPreview(user.avatar ? getImageUrl(user.avatar) : '');
  }, [open, user]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.prenom.trim().length < 2) next.prenom = 'Au moins 2 caractères';
    if (form.nom.trim().length < 2) next.nom = 'Au moins 2 caractères';
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Email invalide';

    // Le mot de passe est facultatif : validé seulement s'il est renseigné.
    if (form.motDePasse) {
      if (form.motDePasse.length < 6) next.motDePasse = 'Au moins 6 caractères';
      else if (form.motDePasse !== form.confirmation) {
        next.confirmation = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(user.id, file);
      updateUser({ avatar: updated.avatar });
      setAvatarPreview(updated.avatar ? getImageUrl(updated.avatar) : '');
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Échec du téléversement de la photo."
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    try {
      const updated = await updateUserRequest(user.id, {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim(),
        ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
      });

      // Mise à jour immédiate des informations affichées.
      updateUser({
        prenom: updated.prenom ?? form.prenom.trim(),
        nom: updated.nom ?? form.nom.trim(),
        email: updated.email ?? form.email.trim(),
      });

      toast.success('Profil mis à jour avec succès');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement du profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = getPersonInitials(user);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !saving && onClose()}>
      <DialogContent className="w-[95vw] gap-0 overflow-hidden bg-white p-0 sm:max-w-lg [&>button]:hidden">
        <DialogHeader className="border-b bg-ink-50/80 px-5 pt-4 pb-3">
          <DialogTitle className="text-lg font-bold text-ink-900">Modifier le profil</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profil"
                className="size-16 shrink-0 rounded-full border border-ink-100 object-cover"
                onError={() => setAvatarPreview('')}
              />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-800">
                {initials}
              </span>
            )}

            <div className="flex flex-col gap-1.5">
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
                disabled={uploadingAvatar || saving}
              >
                <Upload className="size-3.5" />
                {uploadingAvatar ? 'Téléversement…' : 'Changer la photo'}
              </Button>
              <span className="text-[10px] text-ink-400">JPG, PNG, GIF, WebP — max 5 Mo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
            <FloatingInput
              id="profil-prenom"
              label="Prénom *"
              autoComplete="given-name"
              value={form.prenom}
              onChange={(event) => setField('prenom', event.target.value)}
              error={errors.prenom}
            />
            <FloatingInput
              id="profil-nom"
              label="Nom *"
              autoComplete="family-name"
              value={form.nom}
              onChange={(event) => setField('nom', event.target.value)}
              error={errors.nom}
            />
          </div>

          <FloatingInput
            id="profil-email"
            label="Email *"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            error={errors.email}
          />

          <div className="space-y-1 rounded-md border border-ink-100 bg-ink-50/60 p-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Changer le mot de passe (facultatif)
            </Label>
            <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
              <FloatingInput
                id="profil-mdp"
                label="Nouveau mot de passe"
                type="password"
                autoComplete="new-password"
                value={form.motDePasse}
                onChange={(event) => setField('motDePasse', event.target.value)}
                error={errors.motDePasse}
              />
              <FloatingInput
                id="profil-mdp-confirm"
                label="Confirmation"
                type="password"
                autoComplete="new-password"
                value={form.confirmation}
                onChange={(event) => setField('confirmation', event.target.value)}
                error={errors.confirmation}
              />
            </div>
            <p className="text-[11px] text-ink-400">
              Laissez ces champs vides pour conserver votre mot de passe actuel.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t bg-ink-50/80 px-5 py-3">
          <div className="flex w-full items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit} disabled={saving}>
              <CircleCheck className="size-3.5" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilEditDialog;
