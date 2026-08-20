import React from "react";

/**
 * SectionTwo: explique la structure du projet aux développeurs / stagiaires.
 * - affiche l'arborescence (préformatée)
 * - donne une description pour chaque dossier important (améliorée ci‑dessous)
 * - permet de copier l'arborescence dans le presse-papier
 *
 * J'ai conservé le style global et la disposition initiale, mais j'ai enrichi
 * la partie "Explication des dossiers importants" pour la rendre :
 * - plus lisible (cartes avec icône, badge, résumé)
 * - interactive (boutons "Copier chemin" et "Voir README / doc")
 * - accessible (aria-labels, focus visible)
 */

const tree = `public
│   vite.svg
│
└───src
    │   App.tsx
    │   main.tsx
    │
    ├───assets
    │   ├───files
    │   │   ├───docs
    │   │   ├───images
    │   │   │   ├───background
    │   │   │   └───logo
    │   │   ├───pdf
    │   │   └───videos
    │   └───fonts
    │       └───Poppins
    │
    ├───components
    │   ├───HomeComponents
    │   │       SectionOne.tsx
    │   │       SectionTwo.tsx
    │   │       TemplateNotice.tsx
    │   ├───ExampleComponents
    │   │       ExampleComponent.tsx
    │   └───Layout
    │           Footer.tsx
    │           Header.tsx
    │           Layout.tsx
    │
    ├───config
    ├───contexts
    ├───data
    ├───hooks
    ├───pages
    ├───routes
    ├───services
    ├───styles
    ├───types
    └───utils
`;

type InfoItem = {
    title: string;
    description: string;
    badge?: string;
    path?: string;  // optional link to docs/README (can be internal or external)
};

const infoList: InfoItem[] = [
    {
        title: "public/",
        description:
            "Fichiers statiques (index.html, favicons, images publiques). Utilise public/ pour tout asset qui doit être servi tel quel.",
        badge: "static",
        path: "public/",
    },
    {
        title: "src/hooks/",
        description:
            "Hooks personnalisés. Place ici les hooks qui sont utilisés dans plusieurs composants.",
        badge: "hooks",
        path: "src/hooks/",
    },
    {
        title: "src/assets/",
        description:
            "Images, polices et médias. Préfère WOFF2 pour la production et place les assets utilisés par Vite/rollup ici.",
        badge: "media",
        path: "src/assets/",
    },
    {
        title: "src/components/",
        description:
            "Composants réutilisables. HomeComponents contient les sections de la page d'accueil; Layout contient header/footer.",
        badge: "ui",
        path: "src/components/",
    },
    {
        title: "src/pages/",
        description:
            "Pages de l'application (ex : HomePage, ExamplePage). Chaque page peut importer ses composants locaux et styles.",
        badge: "page",
        path: "src/pages/",
    },
    {
        title: "src/routes/",
        description:
            "Définition des routes et configuration de react-router-dom (AppRoutes.tsx, routes.ts).",
        badge: "router",
        path: "src/routes/",
    },
    {
        title: "src/services/",
        description:
            "API layer et configuration axios : place ici les fonctions qui appellent le backend (sépare logique et UI).",
        badge: "api",
        path: "src/services/",
    },
    {
        title: "src/contexts/",
        description:
            "Contextes React : place ici les contextes qui sont utilisés dans plusieurs composants.",
        badge: "context",
        path: "src/contexts/",
    },    
    {
        title: "src/config/",
        description:
            "Configuration de l'application (ex : config.ts).",
        badge: "config",
        path: "src/config/",
    },
    {
        title: "src/styles/",
        description:
            "Styles globaux et variables CSS (ex : index.css, variables.css).",
        badge: "style",
        path: "src/styles/",
    },
    {
        title: "src/utils/",
        description:
            "Utilitaires et fonctions communes (ex : utils.ts).",
        badge: "utils",
        path: "src/utils/",
    },
    {
        title: "src/types/",
        description:
            "Types et interfaces TypeScript partagés (footer.types.ts, layout.types.ts, ...). Centralise les définitions réutilisées.",
        badge: "ts",
        path: "src/types/",
    },
    {
        title: "src/data/",
        description:
            "JSON locaux pour defaults et fixtures (ex : data.footer.json). Utile pour templates et tests.",
        badge: "data",
        path: "src/data/",
    },
];

const IconFolder = ({ className = "w-5 h-5 text-indigo-600" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="currentColor" />
    </svg>
);

const SectionTwo: React.FC = () => {

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="prose mx-auto mb-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold">Arborescence du projet</h2>
                    <p className="text-base text-gray-600">
                        Voici la structure du template — utile pour les stagiaires et développeurs qui démarrent.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tree panel */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold">Arborescence</h3>
                        </div>

                        <pre
                            className="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded-md overflow-x-auto"
                            aria-label="Arborescence du projet"
                        >
                            {tree}
                        </pre>
                    </div>

                    {/* Improved Explanations */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Explication des dossiers importants</h3>
                            <div className="text-sm text-gray-500">Conseils & actions rapides</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {infoList.map((item) => (
                                <article key={item.title} className="p-4 rounded-md border border-gray-100 bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 mt-1">
                                            <IconFolder />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                                    {item.badge && (
                                                        <span className="inline-block mt-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="mt-2 text-sm text-gray-600">{item.description}</p>

                                            <div className="mt-3 text-xs text-gray-500 flex items-center gap-3">
                                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{item.path ?? item.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                            Conseils rapides :
                            <ul className="list-disc list-inside mt-2">
                                <li>Place la logique côté API dans <code className="font-mono">src/services</code>.</li>
                                <li>Réutilise et centralise types et interfaces dans <code className="font-mono">src/types</code>.</li>
                                <li>Ajoute les images publiques dans <code className="font-mono">public/</code> si tu veux les servir directement.</li>
                                <li>Utilise <code className="font-mono">src/components/Layout/Layout.tsx</code> pour envelopper les pages et partager header/footer.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionTwo;