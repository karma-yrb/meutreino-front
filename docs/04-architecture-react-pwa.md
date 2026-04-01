# Architecture React PWA

## Choix retenu

- Front: React + JSX (conserve).
- Routing: `react-router-dom`.
- Etat global: Context + reducers (V1), migrable vers store dedie plus tard.
- Persistance locale: IndexedDB (Dexie recommande) avec fallback possible.
- Installable mobile: PWA (`manifest`, `service worker`, offline cache).
- Internationalisation: structure i18n des V1 (FR actif, extensible EN/PT).

## Arborescence cible (monorepo frontend)

```txt
apps/
  web-pwa/
    src/
      app/
        router.jsx
        providers.jsx
      pages/
      components/
      features/
      services/
      data/
packages/
  core-domain/
    src/
  data-access/
    src/
  i18n/
    src/
```

## Principe cle V1 -> V2

- Utiliser des interfaces de service stables:
  - `AuthService`
  - `PlanRepository`
  - `SessionRepository`
- V1 branche `Local*` implementations.
- V2 ajoute `Api*` implementations sans casser les pages.

## PWA

- `vite-plugin-pwa` pour:
  - install prompt,
  - cache assets,
  - mode offline basic.
- Strategie V1: local-first.

## Mobile natif plus tard

- Option recommandee en V2: `Capacitor`.
- Reutilisation de l'app React web avec packaging natif.
- Conserver l'abstraction stockage pour passer vers SQLite mobile au besoin.
