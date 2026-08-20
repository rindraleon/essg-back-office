import { GraduationCap, LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/types/api';
import { useSettingsQuery, useUpdateSettings } from '../../hooks/queries';
import { useTitle } from '../../hooks/useTitle';
import useScrollToTop from '../../hooks/useScrollToTop';
import { Button } from '@/components/ui/button';

const Parametres: React.FC = () => {
  useScrollToTop();
  useTitle('Paramètres');
  const { data, isLoading, isError, error, refetch } = useSettingsQuery();
  const updateMutation = useUpdateSettings();
  const [pending, setPending] = useState<boolean | null>(null);
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
      toast.error(
        err instanceof ApiError ? err.message : 'Impossible de mettre à jour les paramètres.'
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
        <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-100 bg-white p-10 text-ink-500">
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
        <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
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
                        ? 'bg-ink-700 text-white shadow-sm'
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
      )}
    </div>
  );
};

export default Parametres;
