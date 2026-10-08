import { ArrowLeft, ArrowRight, Filter, Info, LayoutGrid, RotateCcw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTitle } from '@/hooks';
import { AIDE_PIED, DEMARRAGE, MANUEL_SECTIONS } from '@/constants/help.constants';
import type { AideSection } from '@/constants/help.constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components';
import { cn } from '@/lib';

const plural = (count: number): string => (count > 1 ? 's' : '');

/** Recherche insensible à la casse et aux accents. */
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const haystack = (section: AideSection): string =>
  normalize(
    [
      section.title,
      section.menuLabel,
      section.location,
      section.resume,
      ...section.prerequis,
      ...section.etapes,
      ...section.aNoter,
    ].join(' ')
  );

/** Notice complète d’une page du manuel. */
const SectionNotice: React.FC<{ section: AideSection }> = ({ section }) => {
  const SectionIcon = section.icon;
  return (
    <section
      aria-labelledby={`aide-${section.id}-titre`}
      className="rounded-xl border border-ink-100 bg-card p-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <SectionIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 id={`aide-${section.id}-titre`} className="text-base font-semibold text-ink-900">
          {section.title}
        </h2>
        <Badge variant="secondary" className="text-[11px]">
          Menu « {section.menuLabel} »
        </Badge>
      </div>
      <p className="mt-2 text-sm text-ink-600">{section.resume}</p>

      {section.prerequis.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            À faire avant
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-amber-900">
            {section.prerequis.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
        Mode d’emploi
      </p>
      <ol className="mt-2 space-y-2">
        {section.etapes.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-ink-700">
            <Badge
              variant="secondary"
              className="mt-0.5 h-5 w-5 shrink-0 justify-center rounded-full p-0 text-[11px]"
              aria-hidden="true"
            >
              {index + 1}
            </Badge>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">À savoir</p>
      <ul className="mt-2 space-y-1.5">
        {section.aNoter.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
            <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Aide: React.FC = () => {
  useTitle('Aide');

  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const selected = params.get('notice');

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return MANUEL_SECTIONS;
    return MANUEL_SECTIONS.filter((section) => haystack(section).includes(needle));
  }, [query]);

  const shownSection = selected
    ? (filtered.find((section) => section.id === selected) ?? filtered[0] ?? null)
    : null;
  const showOverview = shownSection === null;

  const select = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('notice', id);
    else next.delete('notice');
    setParams(next, { replace: true });
  };

  // Comportement filtre : re-cliquer sur le bouton actif le désactive.
  const toggle = (id: string) => select(selected === id ? null : id);

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      active
        ? 'border-brand-300 bg-brand-100 text-brand-800'
        : 'border-ink-100 bg-card text-ink-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800'
    );

  const { prev, next } = useMemo(() => {
    const index = shownSection
      ? filtered.findIndex((section) => section.id === shownSection.id)
      : -1;
    return {
      prev: index > 0 ? filtered[index - 1] : null,
      next: index >= 0 && index < filtered.length - 1 ? filtered[index + 1] : null,
    };
  }, [filtered, shownSection]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 py-6">
      <header className="rounded-xl border border-ink-100 bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Filter className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Manuel du back-office</h1>
            <p className="mt-1 text-sm text-ink-600">
              Mode d’emploi complet de chaque page : ce qu’elle sert, ce qu’elle exige avant de
              fonctionner, comment l’utiliser. Filtrez par menu ci-dessous — une notice s’affiche à
              la fois, sans longue lecture.
            </p>
          </div>
        </div>
      </header>

      {/* Barre de filtres, comme sur les pages de liste : recherche + pastilles. */}
      <div className="rounded-xl border border-ink-100 bg-card p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 shrink-0 items-baseline gap-2">
            <h2 className="text-base font-semibold text-ink-900">Parcourir par menu</h2>
            <span data-numeric className="whitespace-nowrap text-sm font-normal text-ink-500">
              ({filtered.length} page{plural(filtered.length)})
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Rechercher une notice..."
              className="flex-1 lg:max-w-xs"
            />
            {query.trim() !== '' && (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setQuery('')}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        <div
          className="mt-3 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filtrer le manuel par entrée de menu"
        >
          <button
            type="button"
            onClick={() => select(null)}
            className={chipClass(showOverview)}
            aria-pressed={showOverview}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            Toutes les pages
          </button>
          {filtered.map((section) => {
            const ChipIcon = section.icon;
            const active = shownSection?.id === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => toggle(section.id)}
                className={chipClass(active)}
                aria-pressed={active}
              >
                <ChipIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {section.menuLabel}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-ink-400" aria-live="polite">
          {query.trim()
            ? `${filtered.length} page${plural(filtered.length)} trouvée${plural(filtered.length)} — sélectionnez-en une ci-dessus`
            : 'Un clic filtre une notice, re-cliquer libelle le filtre.'}
        </p>
      </div>

      <div className="space-y-4">
        {showOverview && query.trim() === '' && (
          <section
            aria-labelledby="aide-demarrage-titre"
            className="rounded-xl border border-ink-100 bg-card p-5 shadow-card"
          >
            <h2
              id="aide-demarrage-titre"
              className="flex items-center gap-2 text-base font-semibold text-ink-900"
            >
              <LayoutGrid className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Démarrage recommandé
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Certaines pages en nourrissent d’autres. À l’installation — ou quand une liste de
              sélection semble vide — suivez cet ordre : cliquez sur une étape pour ouvrir sa
              notice.
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEMARRAGE.map((step, index) => (
                <li key={step.sectionId}>
                  <button
                    type="button"
                    onClick={() => select(step.sectionId)}
                    className="flex h-full w-full items-start gap-2 rounded-lg border border-ink-100 px-3 py-2 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Badge
                      variant="secondary"
                      className="mt-0.5 h-5 w-5 shrink-0 justify-center rounded-full p-0 text-[11px]"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </Badge>
                    <span>
                      <span className="font-medium text-ink-800">{step.label}</span>
                      <span className="block text-xs text-ink-500">{step.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        {shownSection && <SectionNotice section={shownSection} />}

        {showOverview && query.trim() !== '' && filtered.length === 0 && (
          <div className="rounded-xl border border-ink-100 bg-card p-8 text-center text-sm text-ink-500 shadow-card">
            <p>Aucune notice ne correspond à « {query.trim()} ».</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => setQuery('')}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Effacer la recherche
            </Button>
          </div>
        )}

        {shownSection && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!prev}
              onClick={() => prev && select(prev.id)}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="max-w-40 truncate">{prev?.menuLabel ?? 'Précédent'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!next}
              onClick={() => next && select(next.id)}
            >
              <span className="max-w-40 truncate">{next?.menuLabel ?? 'Suivant'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        <section
          aria-labelledby="aide-pied-titre"
          className="rounded-xl border border-ink-100 bg-ink-50 p-5"
        >
          <h2 id="aide-pied-titre" className="text-sm font-semibold text-ink-800">
            Règles transverses
          </h2>
          <ul className="mt-2 space-y-1.5">
            {AIDE_PIED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Aide;
