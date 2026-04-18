#!/usr/bin/env bash
set -euo pipefail

# Automatic wrapper release script for MeuTreino frontend monorepo.
# Required behavior:
# - auto-commits local changes before release (if any)
# - runs tests and aborts if they fail
# - runs standard-version dry-run
# - asks for confirmation
# - runs real standard-version
# - pushes commits and tags to origin/main

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

RELEASE_AS="${1:-${RELEASE_AS:-}}"
RELEASE_TAG_PREFIX="${RELEASE_TAG_PREFIX:-v}"
PRE_RELEASE_COMMIT_MSG="${RELEASE_AUTOCOMMIT_MSG:-chore(release): pre-release checkpoint}"
RELEASE_TEST_CMD="${RELEASE_TEST_CMD:-node ./scripts/exec-bin.js npm run test:all}"
RELEASE_BUILD_CMD="${RELEASE_BUILD_CMD:-node ./scripts/exec-bin.js npm run build}"

PACKAGE_FILES=(
  package.json
  package-lock.json
  apps/web-pwa/package.json
)

STANDARD_VERSION_ARGS=(
  --packageFiles "${PACKAGE_FILES[0]}" "${PACKAGE_FILES[1]}" "${PACKAGE_FILES[2]}"
  --bumpFiles "${PACKAGE_FILES[0]}" "${PACKAGE_FILES[1]}" "${PACKAGE_FILES[2]}"
  --tagPrefix "${RELEASE_TAG_PREFIX}"
)

if [ -n "${RELEASE_AS}" ]; then
  STANDARD_VERSION_ARGS+=(--release-as "${RELEASE_AS}")
fi

echo "Release mode: ${RELEASE_AS:-auto-from-commits}"
echo "Checking current branch..."
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "${CURRENT_BRANCH}" != "main" ]; then
  echo "Blocking release: current branch is '${CURRENT_BRANCH}', expected 'main'."
  exit 1
fi

if [ -x ./scripts/release-note.sh ]; then
  echo "Configuring one-shot release note popup..."
  bash ./scripts/release-note.sh
else
  echo "Release note script not found: skipping one-shot popup configuration."
fi

echo "Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
  echo "Local changes detected. Creating pre-release commit..."
  git add -A
  if git diff --cached --quiet; then
    echo "No staged changes after git add -A; continuing."
  else
    git commit -m "$PRE_RELEASE_COMMIT_MSG"
  fi
else
  echo "Working tree is clean."
fi

echo "Running release checks: ${RELEASE_TEST_CMD}"
if ! bash -lc "${RELEASE_TEST_CMD}"; then
  echo "Release checks failed. Aborting release."
  exit 1
fi

echo "Checks passed. Proceeding with release."

# Detect current version from package.json
CURRENT_VERSION="$(node -p "require('./package.json').version")"
TAG_NAME="${RELEASE_TAG_PREFIX}${CURRENT_VERSION}"

# Check if current commit already has a release tag
HEAD_TAGS="$(git tag --points-at HEAD 2>/dev/null || true)"

if echo "$HEAD_TAGS" | grep -q "^${RELEASE_TAG_PREFIX}"; then
  echo "HEAD is already tagged (${HEAD_TAGS}). Running standard-version to bump again..."
  NEEDS_BUMP=true
else
  echo "HEAD is not tagged. Current version: ${CURRENT_VERSION}"
  # Check if the tag already exists on another commit
  if git rev-parse "${TAG_NAME}" >/dev/null 2>&1; then
    echo "Tag ${TAG_NAME} exists on another commit. Running standard-version to bump..."
    NEEDS_BUMP=true
  else
    echo "Will tag current commit as ${TAG_NAME} (no re-bump needed)."
    NEEDS_BUMP=false
  fi
fi

if [ "$NEEDS_BUMP" = true ]; then
  echo "Running dry-run (standard-version)..."
  node ./scripts/exec-bin.js npx standard-version --dry-run \
    "${STANDARD_VERSION_ARGS[@]}"

  echo
  read -r -p "Dry-run complete. Press Enter to continue with the real release (this WILL push commits+tags), or Ctrl+C to abort..."

  echo "Running real release (standard-version)..."
  node ./scripts/exec-bin.js npx standard-version \
    "${STANDARD_VERSION_ARGS[@]}"
else
  echo
  read -r -p "Will tag as ${TAG_NAME} and push. Press Enter to continue, or Ctrl+C to abort..."

  echo "Creating tag ${TAG_NAME}..."
  git tag -a "${TAG_NAME}" -m "chore(release): ${CURRENT_VERSION}"
fi

echo
echo "Local release complete - package files and CHANGELOG.md updated, tag created."
echo "Pushing commits and tags to 'origin main'..."

echo "Running build before push: ${RELEASE_BUILD_CMD}"
if ! bash -lc "${RELEASE_BUILD_CMD}"; then
  echo "Build failed. Aborting push."
  exit 1
fi

git push --follow-tags origin main

echo "Push complete. Release published (commit + tag pushed)."

exit 0
