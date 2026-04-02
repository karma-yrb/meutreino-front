# Release Manager (MeuTreino)

This file is the entrypoint for release execution on MeuTreino.

## Role

Run the full release workflow for the frontend monorepo:
- preflight
- validation
- versioning
- publish
- post-release verification
- rollback notes

## Repo scope

Use commands from `c:/Dev/MeuTreino` only.

Monorepo content:
- app: `apps/web-pwa`
- shared packages: `packages/*`

## Trigger

When the user asks to run a release:
1. Read this file
2. Run the release workflow immediately
3. Do not wait for extra instructions unless there is a blocker

## Release workflow (required order)

1. Preflight
- Check `git status` and classify dirty-tree changes.
- Check current branch (`main` expected for release).
- Check sync status with `origin/main` when possible.
- Classify blockers vs warnings explicitly.

2. Validation before release
- Run required checks:
  - `npm run lint`
  - `npm run test`
  - `npm run test:integration`
- Stop on failing blocking checks unless the user explicitly overrides.

3. Versioning and release execution
- Run `bash ./scripts/release-auto.sh` from repo root.
- Script behavior must include:
  - optional pre-release auto-commit if tree is dirty
  - standard-version dry-run
  - explicit confirmation
  - real release
  - push commits + tags to `origin/main`

4. Post-release verification
- Confirm updated versions and created tag(s).
- Confirm push status and branch state.
- Capture residual risks.

5. Handoff / rollback notes
- Summarize:
  - executed commands
  - resulting version(s)
  - created tag(s)
  - checks run and their status
  - blockers/warnings
- Include rollback path:
  - revert release commit
  - delete remote/local tag if needed

## Rules

- Use `bash` for release script execution.
- Never hide dirty-tree changes.
- Distinguish generated version files from source changes.
- Record exact version numbers and tags (no "latest").
