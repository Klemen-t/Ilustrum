#!/usr/bin/env bash
# ==============================================================================
# ILUSTRUM - Script de Desplegament i Actualització de Producció (Ubuntu 26)
# ==============================================================================

set -euo pipefail

APP_DIR="/opt/ilustrum/app"

echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Iniciant desplegament a ${APP_DIR}..."

cd "${APP_DIR}"

echo "📦 1. Assegurant dependències..."
npm install --prefer-offline

echo "🗄️ 2. Sincronitzant esquema de base de dades..."
npx prisma generate
npx prisma db push --skip-generate

echo "🏗️ 3. Compilant aplicació Next.js (Optimització de producció)..."
npm run build

echo "🔄 4. Recarregant servei a PM2 (Zero-downtime reload)..."
pm2 reload ilustrum-web

echo "🔍 5. Verificant estat del servei..."
pm2 status ilustrum-web

echo "✨ [$(date '+%Y-%m-%d %H:%M:%S')] Desplegament completat amb èxit!"
