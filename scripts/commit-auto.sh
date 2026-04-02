#!/usr/bin/env bash
set -euo pipefail

# Commit wrapper for MeuTreino.
# - runs quality checks
# - bumps version files without creating tag
# - creates a single git commit

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

COMMIT_MSG="${1:-}"
BUMP_LEVEL="${2:-patch}"
RELEASE_TAG_PREFIX="${RELEASE_TAG_PREFIX:-v}"

if [ -z "$COMMIT_MSG" ]; then
  echo "Usage: bash ./scripts/commit-auto.sh \"type(scope): message\" [patch|minor|major]"
  exit 1
fi

case "$BUMP_LEVEL" in
  patch|minor|major) ;;
  *)
    echo "Invalid bump level: '$BUMP_LEVEL'. Use patch, minor, or major."
    exit 1
    ;;
esac

PACKAGE_FILES=(
  package.json
  package-lock.json
  apps/web-pwa/package.json
)

STANDARD_VERSION_ARGS=(
  --release-as "$BUMP_LEVEL"
  --skip.tag
  --skip.commit
  --packageFiles "${PACKAGE_FILES[0]}" "${PACKAGE_FILES[1]}" "${PACKAGE_FILES[2]}"
  --bumpFiles "${PACKAGE_FILES[0]}" "${PACKAGE_FILES[1]}" "${PACKAGE_FILES[2]}"
  --tagPrefix "$RELEASE_TAG_PREFIX"
)

echo "Running checks (lint + tests)..."
npm run lint
npm run test:all

echo "Applying version bump (${BUMP_LEVEL}) without tag..."
npx standard-version "${STANDARD_VERSION_ARGS[@]}"

echo "Creating commit..."
git add -A
if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 1
fi

git commit -m "$COMMIT_MSG"

echo "Commit created successfully."