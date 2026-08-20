import React from 'react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════
   Primitives de mise en page des dialogs de détail.

   Regroupées ici pour garantir des espacements, des titres et une
   hiérarchie identiques entre les fiches Ressource humaine, Projet et
   Actualité — chaque dialog redéfinissait auparavant ses propres cartes.
   ═══════════════════════════════════════════════════════════════════════ */

interface DetailSectionProps {
  title: string;
  icon?: React.ReactNode;
  /** Compteur affiché à droite du titre (nombre d'éléments listés). */
  count?: number;
  children: React.ReactNode;
  className?: string;
}

/** Carte de section : un titre, une règle, un contenu. */
export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon,
  count,
  children,
  className,
}) => (
  <section className={cn('rounded-2xl border border-ink-100 bg-white p-5 shadow-sm', className)}>
    <div className="mb-3 flex items-center gap-2">
      {icon && <span className="text-ink-400">{icon}</span>}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-700">{title}</h3>
      {count !== undefined && count > 0 && (
        <span
          data-numeric
          className="rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600"
        >
          {count}
        </span>
      )}
    </div>
    {children}
  </section>
);

interface DetailFieldProps {
  label: string;
  /** Valeur affichée ; le champ est masqué si elle est vide. */
  value?: React.ReactNode;
  /** Force l'affichage même sans valeur (affiche alors un tiret). */
  showEmpty?: boolean;
  /** Autorise la coupure des chaînes longues (emails, URLs). */
  breakAll?: boolean;
}

/**
 * Couple libellé / valeur.
 *
 * Un champ vide n'est pas rendu : afficher « Email : — » sur une fiche qui
 * n'en a pas alourdit la lecture sans rien apporter.
 */
export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  showEmpty = false,
  breakAll = false,
}) => {
  const isEmpty =
    value === undefined || value === null || value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty && !showEmpty) return null;

  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-500">{label}</p>
      <p
        className={cn(
          'text-sm font-medium text-ink-900',
          breakAll ? 'break-all' : 'break-words',
        )}
      >
        {isEmpty ? '—' : value}
      </p>
    </div>
  );
};

interface TagListProps {
  items?: string[];
  /** Message affiché lorsque la liste est vide (sinon rien n'est rendu). */
  emptyMessage?: string;
}

/** Liste d'étiquettes : compétences, langues, partenaires. */
export const TagList: React.FC<TagListProps> = ({ items, emptyMessage }) => {
  if (!items || items.length === 0) {
    return emptyMessage ? <p className="text-sm text-ink-400">{emptyMessage}</p> : null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-md border border-brand-100 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

interface BulletListProps {
  items?: string[];
}

/** Liste à puces pour les intitulés longs (formations, diplômes). */
export const BulletList: React.FC<BulletListProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-ink-700">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
};
