# Roles Et Droits

## Roles

- `admin`
- `coach`
- `user`

## Matrice permissions

## Admin

- Creer/modifier/supprimer des templates de plan.
- Assigner des coaches aux utilisateurs.
- Creer des comptes utilisateurs/coaches/admin.
- Voir les statistiques globales de base.

## Coach

- Voir les utilisateurs dont il a la charge.
- Creer/modifier le plan utilisateur a partir d'un template.
- Ajuster reps/charge/series des utilisateurs assignes.
- Consulter l'historique de sessions des utilisateurs assignes.

## User

- Voir son plan du jour.
- Lancer et suivre ses sessions.
- Modifier ses valeurs pendant une session.
- Editer son plan en mode visualisation (selon droits V1, autorise).
- Voir son historique.
- Modifier son profil minimal.

## Regles de securite V1

- Controle de role en front + couche service.
- Donnees partitionnees par `userId`.
- Le coach ne peut agir que sur ses `assignedUserIds`.

## Preparation V2

- Meme modele de role conserve.
- Verification finale des droits deplacee cote backend/API.
