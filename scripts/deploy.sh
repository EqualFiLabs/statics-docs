#!/usr/bin/env bash
#
# Deploy the static export to docs.staticsprotocol.com.
#
# Builds, uploads to a release directory named for the current commit, then
# flips the `current` symlink nginx serves from. The flip is atomic, so a
# request either sees the old release or the new one, never a half-copied tree.
#
# Usage:
#   scripts/deploy.sh              # build and deploy
#   scripts/deploy.sh --no-build   # deploy the existing out/ as-is
#   scripts/deploy.sh --stage      # upload but leave `current` alone
#
set -euo pipefail

HOST="${DOCS_HOST:-root@docs.staticsprotocol.com}"
SSH_KEY="${DOCS_SSH_KEY:-$HOME/.ssh/eve_github}"
ROOT="/srv/statics-docs"
KEEP_RELEASES=5

build=1
stage=0
for arg in "$@"; do
  case "$arg" in
    --no-build) build=0 ;;
    --stage) stage=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash before deploying." >&2
  exit 1
fi

SHA="$(git rev-parse --short HEAD)"
RELEASE="$ROOT/releases/$SHA"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes "$HOST")

if [[ $build -eq 1 ]]; then
  echo "==> Building $SHA"
  npm run build
fi

if [[ ! -f out/index.html ]]; then
  echo "out/index.html missing — nothing to deploy." >&2
  exit 1
fi

echo "==> Uploading to $RELEASE"
"${SSH[@]}" "mkdir -p '$RELEASE'"
rsync -az --delete -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes" out/ "$HOST:$RELEASE/"

if [[ $stage -eq 1 ]]; then
  echo "==> Staged at $RELEASE (current unchanged)"
  exit 0
fi

# ln -T into a temp name then mv -T, so `current` is never briefly absent.
echo "==> Pointing current at $SHA"
"${SSH[@]}" "ln -sfnT '$RELEASE' '$ROOT/.current.tmp' && mv -T '$ROOT/.current.tmp' '$ROOT/current'"

echo "==> Pruning old releases (keeping $KEEP_RELEASES)"
"${SSH[@]}" "cd '$ROOT/releases' && ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf"

echo "==> Live: $("${SSH[@]}" "readlink -f '$ROOT/current'")"
echo "    Roll back with: ssh $HOST \"ln -sfnT $ROOT/releases/<sha> $ROOT/current\""
