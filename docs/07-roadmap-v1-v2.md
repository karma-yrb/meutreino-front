# Roadmap V1 Vers V2

## V1 (livré)

- Refactor du fichier unique en modules.
- Auth locale mock (email/mot de passe **hashés PBKDF2**).
- Multi-utilisateurs local.
- Roles admin/coach/user.
- Plans utilisateur + versioning mensuel prepare.
- Mode visualisation et mode session.
- Timers (rest + global).
- Historique + dashboard hebdo + courbes de progression + suivi poids.
- PWA installable mobile.
- Seed protégé (données réelles préservées lors d'un bump de version).
- Session TTL 7 jours avec expiry côté client.
- `navigator.storage.persist()` au démarrage.
- Indicateur de statut de persistance dans le profil.
- Export JSON manuel (séances, poids, plan).
- Badges statut séances sur la semaine et l'accueil.
- Banner "Reprendre" pour les séances interrompues.

## V1.1 (prévu)

- Import JSON (réinjection d'un export dans la base locale).
- Rapports basiques utilisateur/coach.
- Amélioration UX session.

## V2

- Auth backend réelle (remplace `localAuthService`).
- API centrale pour users/plans/sessions (remplace les repositories IndexedDB).
- Permissions server-side strictes.
- Synchronisation cloud multi-appareils.
- IndexedDB conservé comme cache offline avec sync au retour réseau.
- Option packaging mobile natif (Capacitor).

## Strategie anti-refonte

- Adapter pattern sur services (`AuthService`, repositories).
- Pages UI dependantes d'abstractions, pas du stockage direct.
- Domain model stable des le depart.

## Limites V1 connues (non-bugs)

- Données liées au navigateur : changer de navigateur = repartir à zéro.
- Pas de sync multi-appareils.
- `Clear site data` efface tout sans récupération.
- Persistence navigateur non garantie sur mobile si `storage.persist()` est refusé.
- Pas d'import JSON (export seulement).
