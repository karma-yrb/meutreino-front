# Roadmap V1 Vers V2

## V1 (maintenant)

- Refactor du fichier unique en modules.
- Auth locale mock (email/mot de passe).
- Multi-utilisateurs local.
- Roles admin/coach/user.
- Plans utilisateur + versioning mensuel prepare.
- Mode visualisation et mode session.
- Timers (rest + global).
- Historique + dashboard hebdo.
- PWA installable mobile.

## V1.1

- Amelioration UX session.
- Export/import JSON local (backup/migration device).
- Rapports basiques utilisateur/coach.

## V2

- Auth backend reelle.
- API centrale pour users/plans/sessions.
- Permissions server-side strictes.
- Synchronisation cloud multi-appareils.
- Option packaging mobile natif (Capacitor).

## Strategie anti-refonte

- Adapter pattern sur services (`AuthService`, repositories).
- Pages UI dependantes d'abstractions, pas du stockage direct.
- Domain model stable des le depart.
