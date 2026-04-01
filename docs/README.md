# Documentation Projet

Ce dossier centralise le cadrage fonctionnel et technique avant implementation.

## Index

- `01-cadrage-produit.md`: vision, objectifs, perimetre V1.
- `02-spec-fonctionnelle-v1.md`: ecrans, parcours, comportements attendus.
- `03-roles-et-droits.md`: roles `admin`, `coach`, `user` et permissions.
- `04-architecture-react-pwa.md`: architecture React JSX, PWA, persistance locale.
- `05-modele-donnees.md`: modele de donnees V1 et preparation V2.
- `06-moteur-session.md`: regles de progression serie/exercice/session.
- `07-roadmap-v1-v2.md`: plan de livraison et evolution vers backend/mobile.
- `08-plan-implementation.md`: plan d'execution concret pour le code.
- `09-strategie-tests.md`: strategie de tests (unitaires, integration, e2e).
- `legacy/main-single-file.jsx`: archive du fichier historique monolithique.

## Decision globale

- Base technique V1: **React JSX + PWA + stockage local embarque**.
- Cible court terme: application web installable sur telephone.
- Cible moyen terme: migration possible vers backend auth/API et mobile natif.
