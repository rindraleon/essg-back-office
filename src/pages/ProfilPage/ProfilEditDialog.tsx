import { CircleCheck, ImageUp, Loader2, TriangleAlert, UserCog } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { updateUser as updateUserRequest, uploadAvatar } from '@/services';
import { useAuth } from '@/contexts';
import type { User } from '@/types';
import {
  Button,
  Label,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FloatingInput,
} from '@/components';
import { EMAIL_PATTERN } from '@/constants';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_UPLOAD_SIZE,
  isAcceptedImage,
  getPersonInitials,
} from '@/utils';

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

type AvatarState = 'idle' | 'uploading' | 'success' | 'error';

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
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [avatarError, setAvatarError] = useState<string>('');
  const [avatarPath, setAvatarPath] = useState<string>('');

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
    setAvatarState('idle');
    setAvatarError('');
    setAvatarPath(user.avatar ?? '');
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
    event.target.value = '';
    if (!file || avatarState === 'uploading') return;

    if (!isAcceptedImage(file)) {
      setAvatarState('error');
      setAvatarError('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      setAvatarState('error');
      setAvatarError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setAvatarState('uploading');
    setAvatarError('');
    try {
      const updated = await uploadAvatar(user.id, file);
      const nextAvatar = updated.avatar ?? '';
      setAvatarPath(nextAvatar);
      updateUser({ avatar: nextAvatar });
      setAvatarState('success');
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      setAvatarState('error');
      const message =
        error instanceof Error ? error.message : 'Échec du téléversement de la photo.';
      setAvatarError(message);
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    if (saving || avatarState === 'uploading' || !validate()) return;
    setSaving(true);
    try {
      const updated = await updateUserRequest(user.id, {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim(),
        ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
      });

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
  const busy = saving || avatarState === 'uploading';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !busy && onClose()}>
      <DialogContent size="xl" showCloseButton={!busy}>
        <DialogHeader
          icon={<UserCog aria-hidden="true" />}
          title="Modifier le profil"
          description="Mettez à jour vos informations personnelles, votre photo et votre mot de passe."
        />

        <DialogBody className="space-y-6">
          <section aria-labelledby="profil-photo-label" className="space-y-3">
            <Label id="profil-photo-label" className="text-section text-ink-500 uppercase" htmlFor={''}>
              Photo de profil
            </Label>

            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="lg" className="ring-1 ring-ink-100">
                <AvatarImage src={avatarPath} alt={`Photo de ${form.nom} ${form.prenom}`} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Choisir une nouvelle photo de profil"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  aria-busy={avatarState === 'uploading'}
                >
                  {avatarState === 'uploading' ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <ImageUp className="size-3.5" aria-hidden="true" />
                  )}
                  {avatarState === 'uploading' ? 'Téléversement…' : 'Changer la photo'}
                </Button>

                <p className="text-xs text-ink-400">
                  JPG, PNG, GIF ou WebP — 5 Mo max. L’image est optimisée en WebP automatiquement.
                </p>

                <p aria-live="polite" className="min-h-4 text-xs">
                  {avatarState === 'success' && (
                    <span className="inline-flex items-center gap-1 text-brand-700">
                      <CircleCheck className="size-3.5" aria-hidden="true" />
                      Photo enregistrée
                    </span>
                  )}
                  {avatarState === 'error' && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
                      {avatarError}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="profil-identite-label" className="space-y-2">
            <Label id="profil-identite-label" className="text-section text-ink-500 uppercase" htmlFor={''}>
              Informations personnelles
            </Label>
            <div className="grid grid-cols-1 items-start gap-x-3 sm:grid-cols-2">
              <FloatingInput
                id="profil-nom"
                label="Nom *"
                autoComplete="family-name"
                value={form.nom}
                onChange={(event) => setField('nom', event.target.value)}
                error={errors.nom}
              />
              <FloatingInput
                id="profil-prenom"
                label="Prénom *"
                autoComplete="given-name"
                value={form.prenom}
                onChange={(event) => setField('prenom', event.target.value)}
                error={errors.prenom}
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
          </section>

          <section
            aria-labelledby="profil-securite-label"
            className="space-y-1 rounded-xl border border-ink-100 bg-ink-50/60 p-3"
          >
            <Label id="profil-securite-label" className="text-section text-ink-600 uppercase" htmlFor={''}>
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
            <p className="text-xs text-ink-400">
              Laissez ces champs vides pour conserver votre mot de passe actuel.
            </p>
          </section>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={busy} aria-busy={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-4" aria-hidden="true" />
            )}
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilEditDialog;
