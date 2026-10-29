import { GraduationCap, LayoutDashboard, List, LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api';
import { useSettingsQuery, useUpdateSettings, useTitle, useScrollToTop } from '@/hooks';
import { Button } from '@/components';

type NavigationChoix = 'admission' | 'resultats' | 'aucun';

const NAV_LABEL: Record<NavigationChoix, string> = {
  admission: 'Admission',
  resultats: 'Résultats',
  aucun: 'Aucun',
};

const NAV_ICON: Record<NavigationChoix, React.ElementType> = {
  admission: GraduationCap,
  resultats: List,
  aucun: LayoutDashboard,
};

const Parametres: React.FC = () => {
  useScrollToTop();
  useTitle('Paramètres');
  const { data, isLoading, isError, error, refetch } = useSettingsQuery();
  const updateMutation = useUpdateSettings();
  const [pending, setPending] = useState<boolean | NavigationChoix | null>(null);
  const saving = pending !== null;

  const handleToggle = async (value: boolean) => {
    if (saving) return;
    setPending(value);
    try {
      await updateMutation.mutateAsync({ admissionsOuvertes: value });
      toast.success(
        value
          ? 'Les admissions sont maintenant ouvertes : le formulaire est visible sur le site.'
          : 'Les admissions sont fermées : le formulaire et les boutons sont masqués sur le site.'
      );
    } catch (err) {
      console.warn(
        'Échec dans handleToggle — poursuite en mode dégradé',
        err instanceof Error ? err.message : err
      );
      toast.error(
        err instanceof ApiError ? err.message : 'Impossible de mettre à jour les paramètres.'
      );
    } finally {
      setPending(null);
    }
  };

  const handleNavigationChange = async (value: NavigationChoix) => {
    if (saving) return;
    setPending(value);
    try {
      await updateMutation.mutateAsync({ navigationPrincipale: value });
      toast.success(
        `Navigation principale définie sur "${NAV_LABEL[value]}".`
      );
    } catch (err) {
      console.warn(
        'Échec dans handleNavigationChange — poursuite en mode dégradé',
        err instanceof Error ? err.message : err
      );
      toast.error(
        err instanceof ApiError ? err.message : 'Impossible de mettre à jour la navigation principale.'
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Paramètres</h1>
        <p className="mt-1 text-sm text-ink-500">
          Réglages partagés entre tous les utilisateurs et toutes les sessions.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-100 bg-card p-10 text-ink-500">
          <LoaderCircle className="size-7 animate-spin text-brand-600" />
          <p className="text-sm">Chargement des paramètres...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Erreur lors du chargement des paramètres'}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => void refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {data && (
        <>
          <section className="rounded-xl border border-ink-100 bg-card p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <GraduationCap className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-ink-900">Admissions</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Activez ou désactivez les candidatures en ligne. Lorsque les admissions sont
                  fermées, le bouton « Admission », la page et l'API refusent les nouvelles
                  candidatures.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="inline-flex rounded-lg border border-ink-200 bg-ink-50 p-1">
                    <button
                      type="button"
                      onClick={() => void handleToggle(true)}
                      disabled={saving}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                        data.admissionsOuvertes
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-ink-500 hover:text-ink-700'
                      }`}
                    >
                      Activées
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggle(false)}
                      disabled={saving}
                      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                        !data.admissionsOuvertes
                          ? 'bg-ink-700 text-white shadow-sm dark:bg-night-700'
                          : 'text-ink-500 hover:text-ink-700'
                      }`}
                    >
                      Désactivées
                    </button>
                  </div>

                  {saving && (
                    <span className="flex items-center gap-2 text-sm text-ink-500">
                      <LoaderCircle className="size-4 animate-spin text-brand-600" />
                      Enregistrement...
                    </span>
                  )}
                </div>

                <p
                  className={`mt-3 text-sm font-medium ${
                    data.admissionsOuvertes ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  Statut actuel : {data.admissionsOuvertes ? 'ouvertes' : 'fermées'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-ink-100 bg-card p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <List className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-ink-900">Navigation principale</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Choisissez quelle fonctionnalité est mise en avant dans le menu du site
                  public. Une seule option peut être active à la fois : Admission, Résultats
                  ou Aucun.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  {(['admission', 'resultats', 'aucun'] as NavigationChoix[]).map((choix) => {
                    const active = data.navigationPrincipale === choix;
                    const Icon = NAV_ICON[choix];
                    return (
                      <button
                        key={choix}
                        type="button"
                        onClick={() => void handleNavigationChange(choix)}
                        disabled={saving}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-60 ${
                          active
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                            : 'border-ink-200 text-ink-700 hover:bg-ink-50 hover:text-ink-900'
                        }`}
                      >
                        <Icon className={`size-4 ${active ? 'text-white' : 'text-ink-500'}`} />
                        {NAV_LABEL[choix]}
                      </button>
                    );
                  })}
                </div>

                {saving && (
                  <span className="flex items-center gap-2 text-sm text-ink-500 mt-2">
                    <LoaderCircle className="size-4 animate-spin text-brand-600" />
                    Enregistrement...
                  </span>
                )}

                <p className="mt-3 text-sm font-medium text-ink-600">
                  Actuel&nbsp;: <strong>{NAV_LABEL[data.navigationPrincipale]}</strong>
                  {' '}
                  {data.navigationPrincipale === 'resultats' &&
                    '(le lien « Résultats » s’affiche dans le header du site public)'}
                  {data.navigationPrincipale === 'admission' &&
                    '(le lien « Admission » s’affiche dans le header du site public)'}
                  {data.navigationPrincipale === 'aucun' &&
                    '(aucun lien de navigation principale n’est affiché)'}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Parametres;
