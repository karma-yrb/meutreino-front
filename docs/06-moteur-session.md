# Moteur Session (Run Mode)

## Etats session

- `idle`
- `running`
- `paused`
- `resting` (timer entre series)
- `completed`
- `stopped`

## Evenements

- `START_SESSION`
- `PAUSE_SESSION`
- `RESUME_SESSION`
- `STOP_SESSION`
- `UPDATE_SET_VALUES`
- `VALIDATE_SET`
- `SKIP_REST_TIMER`
- `REST_TIMER_FINISHED`

## Regles de progression

1. Au `START_SESSION`:
- cloner un snapshot du plan actif (evite impact des edits pendant execution),
- initialiser le focus sur exercice 1, serie 1,
- demarrer chrono global.

2. Au `VALIDATE_SET`:
- enregistrer `actualReps/actualLoad`,
- marquer serie comme validee,
- lancer timer recuperation (defaut 60 sec, valeur custom possible),
- autoriser skip.

3. A la fin timer:
- avancer focus vers prochaine serie.

4. Si serie validee et derniere serie exercice:
- exercice passe `completed`,
- increment `completedExercisesCount`,
- focus exercice suivant (premiere serie).

5. Si dernier exercice termine:
- session `completed`,
- arret chrono global,
- persistance de session + mise a jour stats hebdo/historique.

## Arret manuel

- `STOP_SESSION` possible a tout moment.
- Session persistee avec status `stopped`.
- Temps total et progression partielle conserves.

## Mode visualisation

- Pas de machine d'etat session active.
- Edition plan autorisee.
- Aucune ecriture dans `SessionRun`.
