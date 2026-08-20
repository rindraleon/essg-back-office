import React, { useState } from "react";
import { useScrollToTop } from "../../hooks";

/**
 * ExampleComponents - petit tutoriel intégré
 *
 * Ce composant affiche un mini‑tutoriel "onboarding" pour les nouveaux devs :
 * - explication rapide de la structure
 * - comment créer un nouveau composant
 * - comment ajouter un hook
 * - commandes utiles (dev / build / lint)
 *
 * Le hook useScrollToTop() est appelé au chargement pour replacer la page en haut.
 * Les extraits de commande peuvent être copiés via le bouton "Copier".
 */

const snippets = {
    createComponent: `// src/components/ui/MyButton.tsx
import React from "react";

type MyButtonProps = { label: string; onClick?: () => void; };

const MyButton: React.FC<MyButtonProps> = ({ label, onClick }) => (
  <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={onClick}>
    {label}
  </button>
);

export default MyButton;`,
    addHook: `// src/hooks/useMyHook.ts
import { useState, useEffect } from "react";

export function useMyHook() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return { ready };
}`,
    commands: `# installer deps
npm install

# lancer dev
npm run dev

# lint
npm run lint

# build
npm run build`,
};

const ExampleComponents: React.FC = () => {
    useScrollToTop();
    const [copied, setCopied] = useState<string | null>(null);

    const copy = async (text: string, label = "Copié") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
        } catch {
            setCopied("Échec du copier — utilise Ctrl/Cmd+C");
        } finally {
            window.setTimeout(() => setCopied(null), 2000);
        }
    };

    return (
        <section className="py-12 text-gray-900">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6">
                <header>
                    <h1 className="text-2xl font-extrabold">Petit tutoriel — démarrer rapidement</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Quelques étapes et exemples pour ajouter un composant, un hook, et lancer le projet.
                    </p>
                </header>

                <article className="p-4 border rounded-md bg-gray-50">
                    <h2 className="text-lg font-semibold">1) Structure essentielle</h2>
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li><strong>src/components/</strong> — composants réutilisables et pages.</li>
                        <li><strong>src/components/Layout/</strong> — Header, Footer, Layout.</li>
                        <li><strong>src/hooks/</strong> — hooks personnalisés (ex: useScrollToTop).</li>
                        <li><strong>src/config/</strong> — configuration (axios, etc.).</li>
                        <li><strong>src/data/</strong> — fixtures / JSON éditables.</li>
                    </ul>
                </article>

                <article className="p-4 border rounded-md">
                    <div className="flex items-start justify-between">
                        <h2 className="text-lg font-semibold">2) Créer un composant (exemple)</h2>
                        <button
                            onClick={() => copy(snippets.createComponent, "Extrait copié")}
                            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            aria-label="Copier l'exemple de composant"
                        >
                            Copier
                        </button>
                    </div>

                    <pre className="mt-3 bg-gray-50 p-3 rounded text-xs font-mono overflow-auto" aria-hidden>
                        {snippets.createComponent}
                    </pre>
                    <p className="mt-2 text-sm text-gray-600">
                        Place le fichier dans <code className="font-mono">src/components/ui/</code>, importe‑le ensuite où besoin.
                    </p>
                </article>

                <article className="p-4 border rounded-md">
                    <div className="flex items-start justify-between">
                        <h2 className="text-lg font-semibold">3) Ajouter un hook personnalisé</h2>
                        <button
                            onClick={() => copy(snippets.addHook, "Extrait copié")}
                            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            aria-label="Copier l'exemple de hook"
                        >
                            Copier
                        </button>
                    </div>

                    <pre className="mt-3 bg-gray-50 p-3 rounded text-xs font-mono overflow-auto" aria-hidden>
                        {snippets.addHook}
                    </pre>
                    <p className="mt-2 text-sm text-gray-600">
                        Dépose ce fichier dans <code className="font-mono">src/hooks/</code> et exporte depuis <code className="font-mono">src/hooks/index.ts</code>.
                    </p>
                </article>

                <article className="p-4 border rounded-md">
                    <div className="flex items-start justify-between">
                        <h2 className="text-lg font-semibold">4) Commandes utiles</h2>
                        <button
                            onClick={() => copy(snippets.commands, "Commandes copiées")}
                            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            aria-label="Copier les commandes utiles"
                        >
                            Copier
                        </button>
                    </div>

                    <pre className="mt-3 bg-gray-50 p-3 rounded text-xs font-mono overflow-auto" aria-hidden>
                        {snippets.commands}
                    </pre>

                    <div className="mt-2 text-sm text-gray-600">
                        - Pour la production, vérifie <code className="font-mono">VITE_API_BASE_URL</code> dans <code className="font-mono">.env</code>.<br />
                        - Utilise <code className="font-mono">src/config/axios.config.ts</code> pour l'API.
                    </div>
                </article>

                <article className="p-4 border rounded-md">
                    <h2 className="text-lg font-semibold">5) Bonnes pratiques</h2>
                    <ul className="mt-2 list-disc list-inside text-sm">
                        <li>Centralise les types dans <code className="font-mono">src/types/</code>.</li>
                        <li>Sépare la logique API (services) du rendu (components).</li>
                        <li>Ajoute un mini-README pour les composants complexes.</li>
                        <li>Écris des tests pour la logique critique (React Testing Library).</li>
                    </ul>
                </article>

                <footer className="text-sm text-gray-500">
                    <p>{copied ? copied : "Astuce : clique sur 'Copier' pour récupérer un extrait rapidement."}</p>
                </footer>
            </div>
        </section>
    );
};

export default ExampleComponents;