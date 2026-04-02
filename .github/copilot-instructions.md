# Copilot Instructions (MeuTreino)

## Command Execution

- Use `bash` only for terminal commands in this repository.
- Do not use PowerShell or `cmd.exe` for project commands.
- For `git`, `npm`, `node`, `npx`, and release scripts, always execute through bash.
- Preferred pattern: `bash -lc "<command>"`.

## Working Directory

- Run commands from `c:/Dev/MeuTreino` unless the task explicitly requires another folder.

## Commit Rule

- Never run `git commit` directly.
- For every commit, use: `bash ./scripts/commit-auto.sh "type(scope): message" [patch|minor|major]`.
- Equivalent npm entrypoint: `npm run commit:auto -- "type(scope): message" [patch|minor|major]`.

## Release

- Follow [docs/copilot-release.md](/c:/Dev/MeuTreino/docs/copilot-release.md) for release workflow.
- Release entrypoint is `bash ./scripts/release-auto.sh`.
- Natural-language alias: `lance pub` means run `bash ./scripts/release-auto.sh`.
