# MeuTreino Frontend Monorepo

Frontend organise en monorepo pour partager le code entre:

- `apps/web-pwa`: application web installable (PWA).
- `packages/*`: bibliotheques partagees (domaine, data access, i18n).

## Demarrage

```bash
npm install
npm run dev
```

L'app web tourne via le workspace `@meutreino/web-pwa`.

## Windows PowerShell (important)

Pour eviter totalement PowerShell, utilise Git Bash (recommande) pour toutes les commandes projet.
Le repo est configure pour ca dans `.vscode/settings.json` et `.vscode/tasks.json`.

Si tu executes quand meme une commande depuis PowerShell et que `npm.ps1` est bloque (`PSSecurityException`), utilise l'une de ces options:

- Commandes directes: `npm.cmd run test`, `npm.cmd run lint`, etc.
- Session courante uniquement: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

Les hooks Git et scripts `commit/release` du repo sont maintenant durcis pour resoudre automatiquement `npm/npx` sur Windows.

## Scripts racine

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run commit:auto -- "type(scope): message" [patch|minor|major]`
- `npm run lance:pub` (alias release complet: commit auto + versionning + push)
- `npm run release`
- `npm run release:minor`
- `npm run release:major`
- `npm run release:dry-run`

## Workflow Git

La strategie de versionning/commit/push est documentee ici:

- `docs/10-strategie-git-versionning.md`
- `docs/copilot-release.md`
- `.github/copilot-instructions.md`

## Comptes de test

Utilise ces comptes pour tester les differents roles dans l'application:

- `user`
  - Email: `user@local`
  - Mot de passe: `user123`
  - Acces principal: accueil, jour, session, profil.
- `coach`
  - Email: `coach@local`
  - Mot de passe: `coach123`
  - Acces principal: menu/page `Coach` (`/coach/users`).
- `admin`
  - Email: `admin@local`
  - Mot de passe: `admin123`
  - Acces principal: menu/page `Admin` (`/admin/templates`).

## Structure

```txt
apps/
  web-pwa/
packages/
  core-domain/
  data-access/
  i18n/
docs/
```
