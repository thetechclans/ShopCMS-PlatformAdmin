#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: SUPABASE_DB_URL=<postgres-url> [BACKUP_DIR=artifacts/backups] [RETENTION_COUNT=8] $0"
  exit 0
fi

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"

PG_DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"

BACKUP_DIR="${BACKUP_DIR:-artifacts/backups}"
RETENTION_COUNT="${RETENTION_COUNT:-8}"
TIMESTAMP_UTC="$(date -u +%Y%m%d_%H%M)"
BACKUP_BASENAME="shopcms_db_${TIMESTAMP_UTC}.dump"
RAW_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_BASENAME}"
COMPRESSED_BACKUP_PATH="${RAW_BACKUP_PATH}.zst"

if [[ "${PG_DUMP_BIN}" == */* ]]; then
  if [[ ! -x "${PG_DUMP_BIN}" ]]; then
    echo "Missing required executable: ${PG_DUMP_BIN}" >&2
    exit 1
  fi
else
  if ! command -v "${PG_DUMP_BIN}" >/dev/null 2>&1; then
    echo "Missing required command: ${PG_DUMP_BIN}" >&2
    exit 1
  fi
fi

if ! command -v zstd >/dev/null 2>&1; then
  echo "Missing required command: zstd" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "Creating logical backup at ${RAW_BACKUP_PATH}"
"${PG_DUMP_BIN}" \
  --dbname="${SUPABASE_DB_URL}" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --schema=public \
  --schema=auth \
  --schema=storage \
  --schema=graphql_public \
  --file="${RAW_BACKUP_PATH}"

echo "Compressing backup with zstd"
zstd --quiet --threads=0 --rm "${RAW_BACKUP_PATH}" -o "${COMPRESSED_BACKUP_PATH}"

mapfile -t existing_backups < <(ls -1t "${BACKUP_DIR}"/shopcms_db_*.dump.zst 2>/dev/null || true)

if (( ${#existing_backups[@]} > RETENTION_COUNT )); then
  echo "Applying local retention policy: keep ${RETENTION_COUNT} backup(s)"
  for old_backup in "${existing_backups[@]:RETENTION_COUNT}"; do
    rm -f "${old_backup}"
  done
fi

echo "${COMPRESSED_BACKUP_PATH}"
