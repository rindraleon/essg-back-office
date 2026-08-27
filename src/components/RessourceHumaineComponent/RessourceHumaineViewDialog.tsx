import {
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  IdCard,
  Languages,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
  X,
} from 'lucide-react';
import React from 'react';
import { getImageUrl , formatFullName, getPersonInitials } from '@/utils';
import type { RessourceHumaineItem } from '@/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BulletList, DetailField, DetailSection, TagList } from '../common/DetailSection';

interface RessourceHumaineViewDialogProps {
  open: boolean;
  onClose: () => void;
  ressource: RessourceHumaineItem | null;
}

function formatDate(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const RessourceHumaineViewDialog: React.FC<RessourceHumaineViewDialogProps> = ({
  open,
  onClose,
  ressource,
}) => {
  if (!ressource) return null;

  const nomComplet = formatFullName(ressource);
  const initiales = getPersonInitials(ressource);

  const experiences = ressource.experiences ?? [];
  const formations = ressource.formations ?? [];
  const diplomes = ressource.diplomes ?? [];
  const competences = ressource.competences ?? [];
  const langues = ressource.langues ?? [];

  const aParcours =
    experiences.length > 0 ||
    formations.length > 0 ||
    diplomes.length > 0 ||
    competences.length > 0 ||
    langues.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!h-[90vh] !max-h-[90vh] !w-[96vw] !max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-3xl border-2 border-ink-100 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:!max-w-6xl"
      >
        <div className="grid h-full min-h-0 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="hidden min-h-0 flex-col overflow-y-auto border-r border-ink-100 bg-ink-950 p-5 text-white lg:flex">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <div className="aspect-square w-full">
                {ressource.photo ? (
                  <img
                    src={getImageUrl(ressource.photo)}
                    alt={nomComplet}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
                    <span className="text-4xl font-bold text-ink-500">{initiales}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className="rounded-md bg-white/10 px-2.5 py-1 text-white">Membre</Badge>
                <Badge
                  className={`rounded-md px-2.5 py-1 text-white ${
                    ressource.actif ? 'bg-emerald-500' : 'bg-ink-500'
                  }`}
                >
                  {ressource.actif ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight text-white">{nomComplet}</h2>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/80">
                  <Briefcase className="size-3.5 shrink-0" />
                  {ressource.poste}
                </p>
              </div>

              <div className="space-y-2.5 border-t border-white/10 pt-4">
                {ressource.email && (
                  <a
                    href={`mailto:${ressource.email}`}
                    className="flex items-start gap-2.5 text-sm text-white/85 transition-colors hover:text-white"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0 text-white/50" />
                    <span className="min-w-0 break-all">{ressource.email}</span>
                  </a>
                )}

                {ressource.telephone && (
                  <a
                    href={`tel:${ressource.telephone.replace(/\s/g, '')}`}
                    className="flex items-start gap-2.5 text-sm text-white/85 transition-colors hover:text-white"
                  >
                    <Phone className="mt-0.5 size-4 shrink-0 text-white/50" />
                    <span>{ressource.telephone}</span>
                  </a>
                )}

                {ressource.adresse && (
                  <p className="flex items-start gap-2.5 text-sm text-white/85">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" />
                    <span className="min-w-0 break-words">{ressource.adresse}</span>
                  </p>
                )}

                {!ressource.email && !ressource.telephone && !ressource.adresse && (
                  <p className="text-sm italic text-white/40">Aucune coordonnée renseignée</p>
                )}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-ink-100 bg-white px-5 py-4 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-bold text-ink-900">
                    Détail de la ressource humaine
                  </DialogTitle>
                  <p className="mt-1 text-sm text-ink-500">Informations complètes du membre</p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0 rounded-full border border-ink-100"
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 lg:px-6">
              <div className="lg:hidden">
                <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-start gap-4">
                    <Avatar className="size-16 shrink-0">
                      {ressource.photo ? (
                        <AvatarImage src={getImageUrl(ressource.photo)} alt={nomComplet} />
                      ) : (
                        <AvatarFallback className="bg-ink-100 text-lg text-ink-700">
                          {initiales}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold text-ink-900">{nomComplet}</h2>
                      <p className="mt-0.5 text-sm text-ink-600">{ressource.poste}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant={ressource.actif ? 'default' : 'secondary'}>
                          {ressource.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-ink-100 pt-3">
                    {ressource.email && (
                      <p className="flex items-start gap-2 text-sm text-ink-600">
                        <Mail className="mt-0.5 size-4 shrink-0 text-ink-400" />
                        <span className="min-w-0 break-all">{ressource.email}</span>
                      </p>
                    )}
                    {ressource.telephone && (
                      <p className="flex items-center gap-2 text-sm text-ink-600">
                        <Phone className="size-4 shrink-0 text-ink-400" />
                        {ressource.telephone}
                      </p>
                    )}
                    {ressource.adresse && (
                      <p className="flex items-start gap-2 text-sm text-ink-600">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
                        <span className="min-w-0 break-words">{ressource.adresse}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {ressource.description && (
                <DetailSection title="Présentation" icon={<User className="size-4" />}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink-600">
                    {ressource.description}
                  </p>
                </DetailSection>
              )}

              {experiences.length > 0 && (
                <DetailSection
                  title="Expériences professionnelles"
                  icon={<Building2 className="size-4" />}
                  count={experiences.length}
                >
                  <ol className="space-y-3">
                    {experiences.map((experience, position) => (
                      <li
                        key={`${experience.poste}-${position}`}
                        className="border-l-2 border-brand-200 pl-3"
                      >
                        <p className="text-sm font-semibold text-ink-900">{experience.poste}</p>
                        {experience.organisation && (
                          <p className="text-sm text-ink-600">{experience.organisation}</p>
                        )}
                        {experience.periode && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                            <Calendar className="size-3" />
                            {experience.periode}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </DetailSection>
              )}

              {(diplomes.length > 0 || formations.length > 0) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {diplomes.length > 0 && (
                    <DetailSection
                      title="Diplômes"
                      icon={<GraduationCap className="size-4" />}
                      count={diplomes.length}
                    >
                      <BulletList items={diplomes} />
                    </DetailSection>
                  )}

                  {formations.length > 0 && (
                    <DetailSection
                      title="Formations"
                      icon={<GraduationCap className="size-4" />}
                      count={formations.length}
                    >
                      <BulletList items={formations} />
                    </DetailSection>
                  )}
                </div>
              )}

              {(competences.length > 0 || langues.length > 0) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {competences.length > 0 && (
                    <DetailSection
                      title="Compétences"
                      icon={<Wrench className="size-4" />}
                      count={competences.length}
                    >
                      <TagList items={competences} />
                    </DetailSection>
                  )}

                  {langues.length > 0 && (
                    <DetailSection
                      title="Langues"
                      icon={<Languages className="size-4" />}
                      count={langues.length}
                    >
                      <TagList items={langues} />
                    </DetailSection>
                  )}
                </div>
              )}

              {!aParcours && !ressource.description && (
                <div className="rounded-2xl border border-dashed border-ink-200 px-5 py-8 text-center">
                  <p className="text-sm text-ink-500">
                    Aucune information de parcours enregistrée pour ce membre.
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    Modifiez la fiche ou importez un CV pour compléter le profil.
                  </p>
                </div>
              )}

              <DetailSection
                title="Informations administratives"
                icon={<IdCard className="size-4" />}
              >
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <DetailField label="Nom" value={ressource.nom} />
                  <DetailField label="Prénom" value={ressource.prenom} />
                  <DetailField label="Poste" value={ressource.poste} />
                  <DetailField
                    label="Statut"
                    value={
                      <Badge variant={ressource.actif ? 'default' : 'secondary'}>
                        {ressource.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    }
                  />
                  <DetailField label="Email" value={ressource.email} breakAll />
                  <DetailField label="Téléphone" value={ressource.telephone} />
                  <DetailField label="Adresse" value={ressource.adresse} />
                  <DetailField
                    label="Ordre d'affichage"
                    value={<span data-numeric>{ressource.ordre}</span>}
                    showEmpty
                  />
                  <DetailField label="Créé le" value={formatDate(ressource.creeLe)} />
                  <DetailField label="Modifié le" value={formatDate(ressource.misAJourLe)} />
                </div>
              </DetailSection>
            </div>

            <div className="flex shrink-0 items-center justify-end border-t border-ink-100 bg-white px-5 py-4 lg:px-6">
              <Button type="button" onClick={onClose} variant="outline">
                Fermer
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RessourceHumaineViewDialog;
