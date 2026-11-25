#!/usr/bin/env bash
# ==============================================================================
# ILUSTRUM - Script de Còpia de Seguretat de PostgreSQL
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/opt/ilustrum/backups"
DB_NAME="ilustrum_db"
DB_USER="ilustrum_user"
DATE_TAG=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/ilustrum_db_${DATE_TAG}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date '+%Y-%m-%d %H:%M:%S')] Iniciant còpia de seguretat de ${DB_NAME}..."

export PGPASSWORD="IlustrumDB2026!Secure"
pg_dump -U "${DB_USER}" -h 127.0.0.1 -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Còpia completada a: ${BACKUP_FILE}"
echo "📊 Mida del fitxer: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Mantenir només les darreres 30 còpies de seguretat
echo "🧹 Netejant còpies antigues (>30 dies)..."
find "${BACKUP_DIR}" -name "ilustrum_db_*.sql.gz" -mtime +30 -delete
echo "✨ Procés de còpia finalitzat correctament."
