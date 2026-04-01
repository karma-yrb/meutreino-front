# Web PWA App

Application React/Vite installable (manifest + service worker en place).

## Run (depuis la racine)

```bash
npm run dev
```

## Build (depuis la racine)

```bash
npm run build
```

## Tests (depuis la racine)

```bash
npm run test
npm run test:integration
npm run test:e2e
```

## Comptes demo

- `admin@local` / `admin123`
- `coach@local` / `coach123`
- `user@local` / `user123`

## Ce qui est deja livre (Phase 0/1)

- Auth locale avec routes protegees.
- Seed automatique IndexedDB au premier lancement.
- Role `admin`, `coach`, `user`.
- Accueil avec detection du jour courant.
- Vue jour en mode visualisation avec edition reps/charge.
- Vue jour en mode visualisation avec edition reps/charge/nombre de series.
- Mode "Lancer session":
  - validation serie par serie,
  - timer recuperation avec skip,
  - chrono global avec pause/reprise/stop,
  - progression auto vers exercice suivant,
  - sauvegarde session (temps + exercices finalises).
- Ecrans profil/admin/coach initiaux.
