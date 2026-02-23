#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: RESTORE_DB_URL=<postgres-url> $0 <backup-file(.dump|.dump.zst)>"
  exit 0
fi

if [[ $# -lt 1 ]]; then
  echo "Backup file path is required" >&2
  echo "Usage: RESTORE_DB_URL=<postgres-url> $0 <backup-file(.dump|.dump.zst)>" >&2
  exit 1
fi

: "${RESTORE_DB_URL:?RESTORE_DB_URL is required}"

BACKUP_FILE="$1"
if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

required_bins=(pg_restore psql zstd)
for bin in "${required_bins[@]}"; do
  if ! command -v "${bin}" >/dev/null 2>&1; then
    echo "Missing required command: ${bin}" >&2
    exit 1
  fi
done

TEMP_DUMP="$(mktemp /tmp/shopcms_restore_XXXXXX.dump)"
cleanup() {
  rm -f "${TEMP_DUMP}"
}
trap cleanup EXIT

if [[ "${BACKUP_FILE}" == *.zst ]]; then
  echo "Decompressing ${BACKUP_FILE}"
  zstd --quiet --decompress --stdout "${BACKUP_FILE}" > "${TEMP_DUMP}"
else
  cp "${BACKUP_FILE}" "${TEMP_DUMP}"
fi

echo "Restoring backup into target database"
pg_restore \
  --dbname="${RESTORE_DB_URL}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${TEMP_DUMP}"

echo "Running smoke checks"
for table_name in tenants tenant_limits profiles user_roles tenant_requests; do
  row_count="$(psql "${RESTORE_DB_URL}" -tAc "SELECT COUNT(*) FROM public.${table_name};")"
  echo "  ${table_name}: ${row_count}"
done

echo "Restore completed successfully"
