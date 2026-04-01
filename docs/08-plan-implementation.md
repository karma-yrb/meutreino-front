# Plan D Implementation

## Phase 0 - Fondation technique

- Installer dependances:
  - `react-router-dom`
  - `dexie`
  - `i18next` + `react-i18next`
  - `vite-plugin-pwa`
- Poser architecture dossiers.
- Poser monorepo frontend:
  - `apps/web-pwa`
  - `packages/core-domain`
  - `packages/data-access`
  - `packages/i18n`
- Mettre en place providers (auth, app, i18n).

## Phase 1 - Donnees et services

- Migrer plan actuel vers JSON source.
- Implementer base locale IndexedDB.
- Creer repositories:
  - users,
  - plans/templates,
  - sessions.
- Seed initial:
  - 1 admin,
  - 1 coach,
  - 1 user + plan.

## Phase 2 - Parcours utilisateur

- Login + guard de routes.
- Home avec detection jour courant.
- Day/Exercise views.
- Mode visualisation (edition plan utilisateur).

## Phase 3 - Moteur session

- Etat session + reducers/actions.
- Validation serie par serie.
- Timer recuperation avec skip.
- Chrono global (start/pause/resume/stop).
- Auto-focus exercice suivant.
- Persistance run + historique.

## Phase 4 - Roles et ecrans metier

- Ecran profil utilisateur (minimum fields).
- Ecran admin templates.
- Ecran coach utilisateurs assignes + edition plans.
- Verification droits cote UI/service.

## Phase 5 - PWA et finition

- Manifest + service worker.
- Install prompt + offline baseline.
- QA fonctionnelle end-to-end.

## Definition of Done V1

- Parcours complet login -> session terminee fonctionne.
- Historique sauvegarde.
- Dashboard hebdo fonctionne avec logique de reset.
- PWA installable depuis navigateur mobile.
