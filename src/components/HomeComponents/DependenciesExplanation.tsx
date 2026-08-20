import React from "react";
import packageData from "../../data/package.json";

type DepItem = { name: string; version: string; description: string; url?: string };

/**
 * Affiche uniquement les dépendances (dependencies) du template
 * avec une courte description de leur utilité.
 *
 * Les descriptions sont maintenues ici dans la constante `DESCRIPTIONS`.
 * Tu peux les déplacer dans src/data/ si tu préfères éditer les textes sans toucher le code.
 */
const DESCRIPTIONS: Record<string, string> = {
    "@emotion/react":
        "Bibliothèque CSS-in-JS légère utilisée par MUI pour le style dynamique des composants (thèmes, styling runtime).",
    "@emotion/styled":
        "API styled-components-like fournie par Emotion — utilisée pour créer des composants stylés réutilisables, souvent conjointement avec MUI.",
    "@mui/icons-material":
        "Collection d'icônes Material Design sous forme de composants React, utile pour boutons, actions et indicateurs visuels.",
    "@mui/material":
        "Bibliothèque de composants UI (Material UI) : boutons, dialogues, inputs, layout — accélère la construction d'interfaces cohérentes.",
    "@tailwindcss/vite":
        "Plugin facilitant l'intégration de Tailwind CSS dans Vite (build performant avec PostCSS/Tailwind).",
    axios:
        "Client HTTP basé sur Promise pour effectuer des requêtes vers une API (utilisé pour appeler le backend).",
    "js-cookie":
        "Utilitaires simples pour lire/écrire/supprimer des cookies côté client (pratique pour stocker tokens non httpOnly).",
    react:
        "Bibliothèque UI principale (React) — moteur de rendu des composants de l'application.",
    "react-dom":
        "Point d'entrée pour le DOM spécifique à React (montage de l'application dans le navigateur).",
    "react-router-dom":
        "Gestion des routes côté client (navigation entre pages, routing dynamique, hooks de route).",
    tailwindcss:
        "Framework utilitaire CSS (Tailwind) pour composer rapidement des interfaces sans écrire beaucoup de CSS personnalisé.",
};

function makeUrl(pkgName: string) {
    // retourne l'URL npm pour la doc du package
    return `https://www.npmjs.com/package/${encodeURIComponent(pkgName)}`;
}

const DependenciesExplanation: React.FC = () => {
    const deps = (packageData as any).dependencies ?? {};

    const items: DepItem[] = Object.entries(deps).map(([name, versionRaw]) => {
        const version = String(versionRaw);
        return {
            name,
            version,
            description: DESCRIPTIONS[name] ?? "Description non fournie (ajoute-la dans DESCRIPTIONS).",
            url: makeUrl(name),
        };
    });

    return (
        <section className="py-12 text-gray-900" aria-labelledby="deps-heading">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <h2 id="deps-heading" className="text-2xl font-extrabold mb-2">
                    Dépendances du template
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Ci‑dessous la liste des dépendances présentes dans le template et une courte explication de leur utilité.
                </p>

                <ul className="space-y-4">
                    {items.map((it) => (
                        <li
                            key={it.name}
                            className="p-4 border rounded-lg bg-gray-50 hover:shadow-sm transition-shadow"
                            aria-labelledby={`dep-${it.name}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 id={`dep-${it.name}`} className="text-sm font-semibold text-gray-900 break-word">
                                            {it.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-white border rounded">{it.version}</span>
                                    </div>

                                    <p className="mt-2 text-sm text-gray-700">{it.description}</p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <a
                                        href={it.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded hover:bg-indigo-100"
                                        aria-label={`Ouvrir la page npm de ${it.name}`}
                                    >
                                        Voir npm
                                    </a>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default DependenciesExplanation;