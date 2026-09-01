# Back-Office ESSG

Interface d'administration du site ESSG (React 19 + TypeScript + Vite + TailwindCSS 4 + Base UI).

---

## 🪟 Système de dialogs

Tous les dialogs du Back-Office (création, modification, consultation, suppression, upload,
confirmation, aperçu de document) utilisent **un seul composant** :
[`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx).

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent size="xl">                 {/* sm | md | lg | xl | 2xl | full */}
    <DialogHeader icon={<UserCog />} title="Modifier le profil" description="…" />
    <DialogBody>{/* contenu défilant */}</DialogBody>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Annuler</Button>
      <Button onClick={onSubmit} disabled={saving}>Enregistrer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Ce que le composant garantit, sans code supplémentaire dans les pages :

| Sujet | Comportement |
| --- | --- |
| **Centrage** | Viewport `flex` plein écran : le dialog reste centré sur desktop, tablette, mobile et écrans de faible hauteur |
| **Contenu long** | `DialogBody` défile ; `DialogHeader` et `DialogFooter` restent fixes ; le dialog n'est jamais coupé |
| **Animation d'entrée** | `opacity 0→1`, `scale 0.96→1`, `translateY 8px→0` (200 ms, courbe douce) |
| **Animation de sortie** | Animation inverse **réellement jouée** avant le démontage (150 ms) |
| **Mouvement réduit** | `prefers-reduced-motion` respecté (`motion-reduce:*` + règle globale du thème) |
| **Accessibilité** | Focus trap, restitution du focus, `Escape`, `aria-labelledby` / `aria-describedby`, bouton de fermeture labellisé |
| **Design system** | Tokens existants (`ink`, `brand`, `radius`, `shadow-elevated`), `cn()`, composant `Button` |

Bonnes pratiques :

* `showCloseButton={false}` lorsqu'un dialog fournit son propre bouton de fermeture
  (remplace l'ancien hack CSS `[&>button]:hidden`) ;
* désactiver les actions pendant une requête (`disabled={saving}`) pour éviter les doubles envois ;
* pour une action destructive, utiliser `ConfirmDialog` avec `severity="error"`.

`ConfirmDialog` ([`src/components/common/ConfirmDialog.tsx`](src/components/common/ConfirmDialog.tsx))
gère l'état « en cours » (spinner, boutons verrouillés, fermeture bloquée) et différencie
visuellement les actions destructives.

---

## 🖼️ Images et avatars

L'API convertit **toutes** les images en WebP et renvoie une URL définitive
(`/media/<dossier>/<uuid>.webp`).

Règles côté front :

1. utiliser l'URL renvoyée **telle quelle** — ne jamais reconstruire un chemin ni supposer
   l'extension `.jpg` / `.png` ;
2. `getImageUrl()` ([`src/utils/image.utils.ts`](src/utils/image.utils.ts)) se contente de préfixer
   l'hôte de l'API pour les chemins relatifs ;
3. afficher une image via les composants partagés :
   * `Avatar` / `AvatarImage` / `AvatarFallback` — bascule automatiquement sur les initiales si
     l'image est absente ou en erreur (404, fichier supprimé) ;
   * `CoverImage` — couverture d'une fiche, avec placeholder ;
   * `ImageGallery` / `MultiImageUpload` — galeries ;
4. valider côté client avant l'envoi avec `isAcceptedImage()` et `MAX_IMAGE_UPLOAD_SIZE` (5 Mo) ;
5. après un upload, réutiliser l'objet renvoyé par l'API pour rafraîchir l'affichage
   (l'URL change à chaque upload : aucun problème de cache).

---

## 🔌 Développement avec l'API locale

```bash
npm install
npm run dev
```

Variables utiles :

| Variable | Rôle |
| --- | --- |
| `VITE_API_BASE_URL` | URL de l'API (`http://localhost:3000` par défaut) |
| `VITE_PORT` | Port du serveur de développement |
| `VITE_DEV_PROXY_TARGET` | *(optionnel)* active un proxy `/api` + `/media` vers l'API — pratique derrière un tunnel ou une prévisualisation distante : `VITE_DEV_PROXY_TARGET=http://localhost:3000 VITE_API_BASE_URL=/api npm run dev` |

---

## 🧰 Scripts

```bash
npm run dev       # serveur de développement
npm run build     # vérification TypeScript + build de production
npm run lint      # ESLint
npm run test      # Vitest
```

---

## Notes Vite / React

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
