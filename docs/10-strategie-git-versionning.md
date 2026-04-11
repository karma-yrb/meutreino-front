# Strategie Git, Commit, Push, Release

Cette strategie est basee sur:

- Conventional Commits pour des messages de commit standardises.
- SemVer pour le versionning (`MAJOR.MINOR.PATCH`).
- Hooks Git automatiques pour bloquer les commits/push non conformes.

## Regles de branche

- `main`: branche stable.
- `feat/<slug>`: nouvelle fonctionnalite.
- `fix/<slug>`: correction de bug.
- `chore/<slug>`: tache technique/outillage.

Exemples:

- `feat/auth-login`
- `fix/session-timezone`
- `chore/update-eslint`

## Regles de commit

Format obligatoire:

```txt
type(scope): description courte
```

Types recommandes:

- `feat`: ajoute une fonctionnalite.
- `fix`: corrige un bug.
- `docs`: modifie la documentation.
- `refactor`: refacto sans changement fonctionnel.
- `test`: ajoute/modifie des tests.
- `chore`: maintenance et outillage.

Exemples valides:

- `feat(day): add session timer`
- `fix(auth): handle expired token`
- `docs(readme): add git workflow`

## Workflow quotidien

1. Se synchroniser:
   `git checkout main && git pull origin main`
2. Creer une branche:
   `git checkout -b feat/ma-feature`
3. Developper puis commit (script obligatoire):
   `bash ./scripts/commit-auto.sh "feat(scope): ma modification" patch`
4. Push de la branche:
   `git push -u origin feat/ma-feature`
5. Ouvrir une Pull Request vers `main`.

## Controle qualite automatique

Hooks actifs via Husky:

- `pre-commit`: lance `npm run lint` puis `npm run test`.
- `commit-msg`: valide le message avec `commitlint`.
- `pre-push`: lance `npm run test:integration`.

Important Windows:

- Workflow recommande sans PowerShell: terminal Git Bash uniquement.
- VS Code peut lancer les taches projet via `.vscode/tasks.json` (shell Git Bash force).
- Les hooks appellent maintenant `scripts/exec-bin.js` pour resoudre `npm/npx` en mode cross-platform.
- Si PowerShell bloque `npm.ps1`, utiliser `npm.cmd ...` ou `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

## Versionning et release

Scripts disponibles a la racine:

- `npm run commit:auto -- "type(scope): message" [patch|minor|major]` -> checks + versionning + commit.
- `npm run lance:pub` -> alias du release complet (commit auto + versionning + push).
- `npm run release` -> lance `scripts/release-auto.sh` (dry-run + confirmation + release + push tags).
- `npm run release:minor` -> meme workflow, force un bump MINOR.
- `npm run release:major` -> meme workflow, force un bump MAJOR.
- `npm run release:dry-run` -> simulation `standard-version` uniquement.

Workflow release:

1. Verifier que `main` est a jour.
2. Executer le script release voulu.
3. Le script:
   - auto-commit les changements locaux avant release (si necessaire),
   - lance les checks (`test:all`),
   - execute un dry-run `standard-version`,
   - demande confirmation,
   - execute la vraie release,
   - build,
   - push commit + tag sur `origin/main`.
