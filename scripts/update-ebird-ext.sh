#!/usr/bin/env bash
# Point the src/ebird-ext submodule at the latest ebird-ext (or a given ref)
# and commit that on the current branch.
#
# Usage: npm run update-ebird-ext [-- [ref] [--push]]
#   ref     ebird-ext branch, tag or commit to point at (default: main)
#   --push  push the branch afterwards
#
# If you're on main, a new branch is made for the commit first. The submodule
# checkout (your working copy of ebird-ext) ends up on the ref you asked for.

set -euo pipefail

REF=main
PUSH=false
for arg in "$@"; do
  case "$arg" in
    --push) PUSH=true ;;
    -h|--help) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) REF="$arg" ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"
SUB=src/ebird-ext

if [ -n "$(git -C "$SUB" status --porcelain --untracked-files=no)" ]; then
  echo "src/ebird-ext has uncommitted changes. Commit or discard them first:" >&2
  git -C "$SUB" status --short --untracked-files=no >&2
  exit 1
fi
if ! git diff --cached --quiet; then
  echo "The site repo has staged changes. Commit or unstage them first." >&2
  exit 1
fi

OLD=$(git ls-tree HEAD "$SUB" | awk '{print $3}')

echo "Fetching ebird-ext..."
git -C "$SUB" fetch --quiet origin
if [ "$REF" = main ]; then
  # Keep the working copy on the main branch rather than a detached commit
  git -C "$SUB" switch --quiet main
  git -C "$SUB" merge --quiet --ff-only origin/main
else
  git -C "$SUB" switch --quiet --detach "$(git -C "$SUB" rev-parse --verify "origin/$REF" 2>/dev/null || echo "$REF")"
fi
NEW=$(git -C "$SUB" rev-parse HEAD)

if [ "$OLD" = "$NEW" ]; then
  echo "ebird-ext is already at $REF (${NEW:0:7}). Nothing to do."
  exit 0
fi

CHANGES=$(git -C "$SUB" log --oneline --first-parent "$OLD..$NEW" 2>/dev/null || true)
echo
echo "ebird-ext ${OLD:0:7} -> ${NEW:0:7}:"
if [ -n "$CHANGES" ]; then
  echo "$CHANGES" | sed 's/^/  /'
else
  echo "  (no new commits: this moves the pointer back, or to another branch)"
fi

# Netlify installs only the site's package.json, not the submodule's, so every
# package ebird-ext imports at runtime has to be listed in the site's.
MISSING=$(node -e "
  const fs = require('fs')
  const site = require('./package.json')
  const ext = require('./$SUB/package.json')
  const listed = { ...site.dependencies, ...site.devDependencies }
  // Only the CLI and one-off scripts use these; the site never imports them
  const cliOnly = new Set(['meow', 'json2csv', 'JSONStream'])
  console.log(Object.keys(ext.dependencies || {}).filter(d => !listed[d] && !cliOnly.has(d)).join(' '))
")
if [ -n "$MISSING" ]; then
  echo
  echo "Warning: ebird-ext depends on packages the site doesn't list: $MISSING"
  echo "Add them (npm install $MISSING), or the Netlify build may fail."
fi

BRANCH=$(git branch --show-current)
if [ "$BRANCH" = main ] || [ -z "$BRANCH" ]; then
  BRANCH="update-ebird-ext-$(date +%Y%m%d)-${NEW:0:7}"
  git switch --quiet -c "$BRANCH"
  echo
  echo "Made branch $BRANCH"
fi

git add "$SUB"
if [ "${NEW:0:${#REF}}" = "$REF" ]; then SUBJECT="Point ebird-ext at ${NEW:0:7}"; else SUBJECT="Point ebird-ext at $REF (${NEW:0:7})"; fi
git commit --quiet -m "$SUBJECT" ${CHANGES:+-m "$CHANGES"}
echo
echo "Committed on $BRANCH."

if [ "$PUSH" = true ]; then
  git push --quiet -u origin "$BRANCH"
  echo "Pushed $BRANCH."
else
  echo "Push with: git push -u origin $BRANCH"
fi
