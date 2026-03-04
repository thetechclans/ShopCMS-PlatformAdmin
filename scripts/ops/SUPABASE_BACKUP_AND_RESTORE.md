# Supabase Backup and Restore Runbook

## Objective
Production-grade backup and restore process for ShopCMS.

## Schedule
- Daily backup: `0 1 * * *` UTC
- Weekly backup: `0 3 * * 0` UTC
- Monthly restore drill (staging): `0 5 1 * *` UTC

Workflows:
- `.github/workflows/supabase-daily-backup.yml`
- `.github/workflows/supabase-weekly-backup.yml`
- `.github/workflows/supabase-monthly-restore-drill.yml`

## Backup Scope
- Schemas: `public`, `auth`, `storage`, `graphql_public`
- Dump format: `pg_dump --format=custom`
- Compression: `zstd`

## RPO / RTO
- Target RPO: <= 24 hours
- Target RTO: <= 4 hours (staging validation target)

## Required Secrets
- `SUPABASE_DB_URL`
- `STAGING_RESTORE_DB_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
- `BACKUP_S3_BUCKET`
- `BACKUP_NOTIFICATION_WEBHOOK` (optional, recommended)
- `S3_ENDPOINT_URL` (optional for MinIO/S3-compatible stores)
- `S3_FORCE_PATH_STYLE` (optional, set `true` for MinIO path-style endpoints)

## S3 Backend Modes
- AWS S3 mode (default): leave `S3_ENDPOINT_URL` empty.
- MinIO / S3-compatible mode: set `S3_ENDPOINT_URL` (for example `https://minio.example.com`) and set `S3_FORCE_PATH_STYLE=true`.

Note:
- GitHub-hosted runners must be able to reach the endpoint publicly.
- For private/local MinIO, use a self-hosted GitHub Actions runner in the same network.

## S3 Layout and Retention
- Daily prefix: `daily/` (retain 35)
- Weekly prefix: `weekly/` (retain 12)

Uploaded artifacts:
- `shopcms_db_YYYYMMDD_HHMM.dump.zst`
- `shopcms_db_YYYYMMDD_HHMM.dump.zst.sha256`

## Integrity Checks
Each backup workflow verifies:
1. Decompress backup.
2. `pg_restore --list` must pass.
3. SHA256 checksum file generated and uploaded.

## Manual Backup

```bash
SUPABASE_DB_URL='postgresql://user:pass@host:5432/postgres?sslmode=require' \
BACKUP_DIR=artifacts/backups \
RETENTION_COUNT=8 \
bash scripts/ops/backup_supabase_db.sh
```

## Manual Restore (Staging Only)

```bash
RESTORE_DB_URL='postgresql://user:pass@staging-host:5432/postgres?sslmode=require' \
bash scripts/ops/restore_supabase_db.sh artifacts/backups/shopcms_db_YYYYMMDD_HHMM.dump.zst
```

Smoke checks validate:
- `tenants`
- `tenant_limits`
- `profiles`
- `user_roles`
- `tenant_requests`

## Monthly Restore Drill
The monthly restore drill workflow:
1. Downloads the latest weekly backup.
2. Verifies checksum (if present).
3. Verifies dump integrity.
4. Restores to staging DB.
5. Runs smoke checks and uploads report.

## Failure Handling
If backup fails:
1. Review workflow logs (backup, integrity, upload, retention).
2. Fix and rerun once.
3. If rerun fails, perform manual backup and manual upload.

If restore drill fails:
1. Preserve logs/artifacts.
2. Validate backup and staging credentials.
3. Retry using previous weekly backup.
4. Escalate if unresolved.

## Security Recommendations
- Enable S3 encryption (SSE-KMS).
- Enable bucket versioning and lifecycle rules.
- Use least-privilege IAM credentials for GitHub Actions.
- Keep restore drills on non-production DB only.
