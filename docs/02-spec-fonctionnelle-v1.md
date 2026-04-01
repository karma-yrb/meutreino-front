# Specification Fonctionnelle V1

## Navigation cible

Ordre principal:

1. `Accueil`
2. `Jour`
3. `Exercice`
4. `Serie`

Ecrans transverses:

- `Connexion`
- `Profil utilisateur`
- `Administration templates` (admin)
- `Suivi utilisateurs` (coach)

## Ecran Connexion

- Auth locale V1 (`email` + `mot de passe`).
- Session locale persistante.
- Architecture avec couche `AuthService` pour branchement API V2.

## Ecran Accueil

- Detection du jour de semaine courant.
- Affichage direct de la session du jour.
- CTA:
  - `Visualiser la session`
  - `Lancer la session`
- Resume utilisateur:
  - progression hebdo,
  - dernieres sessions.

## Mode Visualisation

But: edition du plan sans demarrer une session.

Autorisations:

- Modifier les repetitions par serie.
- Modifier la charge par serie.
- Modifier le nombre de series d'un exercice.
- Sauvegarder les changements du plan utilisateur.

Restrictions:

- Pas de timer recuperation.
- Pas de validation de progression session.
- Pas de chrono global.

## Mode Lancer Session

But: execution guidee de la seance.

Regles:

- Les valeurs initiales viennent du plan (reps/charge pre-remplies).
- Chaque serie peut etre ajustee avant validation.
- A la validation d'une serie:
  - marquer la serie completee,
  - lancer timer recuperation (defaut 60s),
  - permettre `passer` / `finir maintenant`.
- Validation de la derniere serie d'un exercice:
  - valide automatiquement l'exercice.
- Fin d'exercice:
  - focus auto sur l'exercice suivant.
- Fin de dernier exercice:
  - cloture session + enregistrement.

## Chrono global session

- Demarre a `Lancer la session`.
- Peut etre `pause`, `reprendre`, `arreter`.
- Se termine automatiquement a la fin de la session ou manuellement.
- Donnees sauvegardees:
  - duree totale,
  - nombre d'exercices finalises,
  - statut (`completee` ou `arretee`).
