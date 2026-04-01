# Strategie Tests

## Pourquoi tester maintenant

Le risque principal du projet est la logique de session:

- transitions serie -> recuperation -> serie suivante,
- validation dernieres series/exercices,
- chrono global (pause/reprise/stop),
- persistance des sessions.

Ce sont des regles metier critiques et faciles a casser sans tests.

## Approche recommandee (progressive)

## Niveau 1 - Unitaires (priorite immediate)

Cible: moteur de session dans `packages/core-domain`.

Regles a couvrir:

- initialisation d une session,
- validation d une serie,
- passage exercice suivant,
- completion session,
- pause/reprise chrono,
- skip timer recuperation.

Etat actuel:

- tests unitaires ajoutes dans `packages/core-domain/src/sessionEngine.test.js`.
- execution via `npm run test`.

## Niveau 2 - Integration front (phase suivante)

Cible: `apps/web-pwa` avec React Testing Library.

Parcours a couvrir:

- login local + guard route,
- home charge plan du jour,
- edition reps/charge en mode visualisation,
- lancement session et progression.

Etat actuel:

- tests d integration existants dans `apps/web-pwa/src/test`.
- backlog explicitement tracke avec `test.todo` pour:
  - edition coach des plans utilisateurs (bloque tant que la feature n est pas livree),
  - reprise de session apres reload / fermeture app (bloque tant que la persistance de session active n existe pas).

## Niveau 3 - E2E (phase ulterieure)

Cible: Playwright.

Scenarios critiques:

- user complete une session de bout en bout,
- pause/reprise/stop session,
- role admin/coach restrictions.
- verification installabilite PWA (manifest + service worker).

Etat actuel:

- configuration Playwright en place dans `apps/web-pwa/playwright.config.js`.
- specs web + mobile Chromium dans `apps/web-pwa/e2e/app.e2e.spec.js`.
- execution via `npm run test:e2e`.

## Definition minimale "qualite V1"

- Unitaires moteur session obligatoires (vert).
- Lint + build obligatoires (vert).
- Au moins 1 test integration login+jour avant release beta.
