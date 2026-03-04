# ShopCMS Ops Quick Start (1 Page)

Use this when you need to quickly re-enable platform health checks + DB backup/restore automation.

Full guide: `scripts/ops/PLATFORM_OPS_RESET_AND_DISASTER_RECOVERY_RUNBOOK.md`

## 1) Required Files (must exist)
- `.github/workflows/health-daily.yml`
- `.github/workflows/health-weekly.yml`
- `.github/workflows/supabase-daily-backup.yml`
- `.github/workflows/supabase-weekly-backup.yml`
- `.github/workflows/supabase-monthly-restore-drill.yml`
- `scripts/ops/health_check.sh`
- `scripts/ops/backup_supabase_db.sh`
- `scripts/ops/restore_supabase_db.sh`

## 2) Configure GitHub Repository Secrets
### Always required
- `SUPABASE_DB_URL`
- `PLATFORM_BASE_DOMAIN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
- `BACKUP_S3_BUCKET`
- `STAGING_RESTORE_DB_URL`

### Optional
- `HEALTH_NOTIFICATION_WEBHOOK`
- `BACKUP_NOTIFICATION_WEBHOOK`

### Storage mode selectors
- AWS S3 mode:
  - `S3_ENDPOINT_URL` = empty
  - `S3_FORCE_PATH_STYLE` = empty or `false`
- MinIO mode:
  - `S3_ENDPOINT_URL` = `https://<your-minio-endpoint>`
  - `S3_FORCE_PATH_STYLE` = `true`

Note: if MinIO is private/LAN-only, use a self-hosted GitHub runner.

## 3) Trigger All Workflows Once
```bash
gh workflow run health-daily.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run health-weekly.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-daily-backup.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-weekly-backup.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-monthly-restore-drill.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
```

## 4) Pass/Fail Checks
### Health
- Daily + weekly run status = `success`
- Artifacts generated (`.md` and `.json`)

### Backups
- `Run logical backup script` = `success`
- `Verify backup integrity` = `success`
- `Upload backup to S3` = `success` (not skipped)
- `Apply S3 retention policy` = `success` (not skipped)

### Restore Drill
- `Skip restore drill (missing required secrets)` must NOT run
- Download backup, restore, smoke checks = `success`

## 5) Fast Recovery by Incident Type
- Repo deleted: recreate repo, restore files, re-add secrets, run Section 3.
- S3/MinIO deleted: recreate bucket, keep same secrets, run daily+weekly backup, then restore drill.
- Repo + S3/MinIO deleted: do both above, then run Section 3.

## 6) Most Common Problems
- Backup upload skipped: missing one of `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `BACKUP_S3_BUCKET`.
- Restore drill skipped: missing one of backup secrets or `STAGING_RESTORE_DB_URL`.
- MinIO upload fails: endpoint not reachable from runner.
- Health fails: check `SUPABASE_DB_URL`, tenant verified domains, and health artifacts.
