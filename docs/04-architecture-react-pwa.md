# Architecture React PWA

## Choix retenu

- Front: React + JSX (conserve).
- Routing: `react-router-dom`.
- Etat global: Context + reducers (V1), migrable vers store dedie plus tard.
- Persistance locale: IndexedDB (Dexie) — seule source de vérité côté données.
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
- Cache Service Worker versionné (`meutreino-v2`) — à bumper à chaque release cassant le cache.

## Sécurité (V1 local)

- Mots de passe hashés **PBKDF2-SHA-256** (100 000 itérations via `crypto.subtle`), jamais en clair dans IndexedDB.
- Session `localStorage` avec TTL 7 jours et vérification à chaque boot.
- `navigator.storage.persist()` appelé au démarrage pour protéger IndexedDB contre l'éviction sous pression mémoire.

## Limites V1 (local-only)

> Ces limites sont intentionnelles et documentées — la migration V2 les lève.

| Limite | Impact |
|---|---|
| Données liées au navigateur | Changer de navigateur sur la même machine = perte des données |
| Pas de sync multi-appareils | Téléphone et PC ne partagent rien |
| "Clear browsing data" | Efface toute la base IndexedDB sans récupération possible |
| Pas d'import JSON | L'export existe mais la réimportation n'est pas encore implémentée |
| Persistence navigateur non garantie | Sur mobile, le navigateur peut évincer les données si `storage.persist()` est refusé |

**Contournement recommandé V1** : installer l'app (PWA) + exporter régulièrement via le bouton Profil.

## Mobile natif plus tard

- Option recommandee en V2: `Capacitor`.
- Reutilisation de l'app React web avec packaging natif.
- Conserver l'abstraction stockage pour passer vers SQLite mobile au besoin.
