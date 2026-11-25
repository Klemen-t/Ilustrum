#!/bin/bash
set -e

REPO_URL="https://github.com/Klemen-t/Ilustrum.git"
SOURCE="$HOME/Escriptori/asincron/Ilustrum"
DEST="/tmp/Ilustrum-git"

echo "==> Clonant o actualitzant el repositori..."
rm -rf "$DEST"
git clone "$REPO_URL" "$DEST"

echo "==> Copiant els arxius de l'aplicació..."
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env' \
  --exclude='.env.local' \
  "$SOURCE/" "$DEST/"

cd "$DEST"

echo "==> Estat dels canvis:"
git status

COMMIT_MSG="${1:-Afegir àlbums Música Trista (Joan Dausà) i Música Bemparida (Rhapsody & Power Metal) amb 100 nous cromos i 40 noves preguntes}"

echo "==> Afegint els arxius..."
git add .

echo "==> Creant commit..."
git commit -m "$COMMIT_MSG" || {
    echo "No hi ha canvis nous per fer commit."
    exit 0
}

echo "==> Pujant a GitHub..."
git push origin HEAD

echo "==> Fet amb èxit!"
