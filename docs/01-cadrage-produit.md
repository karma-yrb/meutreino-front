# Cadrage Produit

## Contexte

Le projet part d'un fichier unique React (`main.jsx`) qui contient:

- les donnees de plan d'entrainement,
- l'affichage complet,
- la logique d'interaction.

Objectif: evoluer vers une application structuree, maintenable et utilisable sur mobile.

## Objectifs V1

- Construire une application **web installable (PWA)**.
- Ajouter une **connexion locale** (mock) preparee pour migration backend.
- Gérer plusieurs utilisateurs.
- Introduire les roles metier:
  - `admin`: cree les templates de plan.
  - `coach`: modifie les plans des utilisateurs dont il a la charge.
  - `user`: suit et valide ses sessions.
- Detecter le jour courant et proposer la seance du jour a l'accueil.
- Supporter 2 modes:
  - `visualisation`: edition du plan (reps/charge/nb series), sans progression de session.
  - `lancer session`: suivi serie par serie avec timers et validation.
- Sauvegarder la progression locale et l'historique.

## Contraintes

- Garder React JSX (demande validee).
- Architecture prete pour migration V2 (auth backend/API sans refonte majeure).
- Interface en francais en V1, structure code prete multilingue.

## Perimetre V1 (in)

- Ecrans: connexion, accueil, jour, exercice, serie/session, profil, admin, coach.
- Persistance locale embarquee.
- Chrono global de session + timer de recuperation par serie.
- Historique de sessions + vue hebdo avec reset logique.

## Hors perimetre V1 (out)

- Synchronisation cloud temps reel.
- Publication stores (App Store / Play Store).
- Planification automatique avancee basee IA.
