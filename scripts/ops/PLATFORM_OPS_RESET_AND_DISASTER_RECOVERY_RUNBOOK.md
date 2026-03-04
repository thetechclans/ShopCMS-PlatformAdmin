# ShopCMS Platform Ops Reset and Disaster Recovery Runbook

## Scope
- Health checks (`daily`, `weekly`)
- Database backup (`daily`, `weekly`)
- Restore drill (`monthly`)
- Re-setup after repo loss, object storage loss, or both

## Workflows Covered
- `.github/workflows/health-daily.yml`
- `.github/workflows/health-weekly.yml`
- `.github/workflows/supabase-daily-backup.yml`
- `.github/workflows/supabase-weekly-backup.yml`
- `.github/workflows/supabase-monthly-restore-drill.yml`

## Scripts Covered
- `scripts/ops/health_check.sh`
- `scripts/ops/backup_supabase_db.sh`
- `scripts/ops/restore_supabase_db.sh`

## Scenario Matrix
| Scenario | Can recover full automation? | Notes |
|---|---|---|
| Repo deleted, DB alive, S3/MinIO alive | Yes | Recreate repo + secrets, then run workflows |
| Repo deleted, DB alive, S3/MinIO deleted | Yes | Recreate repo + bucket, seed backups again |
| Repo alive, DB alive, S3/MinIO deleted | Yes | Recreate bucket and rerun backups |
| DB deleted, repo deleted, S3/MinIO deleted | No (full loss) | Only external/offline backups can recover |

## Step 1: Recreate Repository
1. Recreate `ShopCMS-PlatformAdmin` repository.
2. Restore these required files/folders:
   - `.github/workflows/`
   - `scripts/ops/`
3. Confirm these files exist:
   - `.github/workflows/health-daily.yml`
   - `.github/workflows/health-weekly.yml`
   - `.github/workflows/supabase-daily-backup.yml`
   - `.github/workflows/supabase-weekly-backup.yml`
   - `.github/workflows/supabase-monthly-restore-drill.yml`
   - `scripts/ops/health_check.sh`
   - `scripts/ops/backup_supabase_db.sh`
   - `scripts/ops/restore_supabase_db.sh`

## Step 2: Recreate Object Storage
### AWS S3 mode
1. Create bucket and keep it private.
2. Create prefixes:
   - `daily/`
   - `weekly/`
3. Use IAM key with least privilege to this bucket.

### MinIO mode
1. Create bucket.
2. Create access key + secret key.
3. Ensure endpoint is reachable by your GitHub runner.
4. If MinIO is private/LAN-only, use self-hosted runner.

## Step 3: Configure Repository Secrets
Set secrets in GitHub repository settings.

### Health secrets
- `SUPABASE_DB_URL` (required)
- `PLATFORM_BASE_DOMAIN` (required)
- `HEALTH_NOTIFICATION_WEBHOOK` (optional)

### Backup/restore secrets
- `AWS_ACCESS_KEY_ID` (required for S3/MinIO)
- `AWS_SECRET_ACCESS_KEY` (required for S3/MinIO)
- `AWS_DEFAULT_REGION` (required)
- `BACKUP_S3_BUCKET` (required)
- `STAGING_RESTORE_DB_URL` (required for restore drill)
- `BACKUP_NOTIFICATION_WEBHOOK` (optional)

### S3 backend mode selectors
- `S3_ENDPOINT_URL`
  - AWS S3: leave empty
  - MinIO: set `https://<minio-endpoint>`
- `S3_FORCE_PATH_STYLE`
  - AWS S3: empty or `false`
  - MinIO: `true`

## Step 4: Trigger Full Validation
Run all workflows manually once after setup.

```bash
gh workflow run health-daily.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run health-weekly.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-daily-backup.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-weekly-backup.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
gh workflow run supabase-monthly-restore-drill.yml --repo <org>/ShopCMS-PlatformAdmin --ref main
```

## Step 5: Validation Checklist
### Health workflows
- Run status is `success`.
- Artifacts exist:
  - `health_daily_*.md` + `health_daily_*.json`
  - `health_weekly_*.md` + `health_weekly_*.json`

### Backup workflows
- `Run logical backup script` = `success`
- `Verify backup integrity` = `success`
- `Upload backup to S3` = `success` (must not be skipped)
- `Apply S3 retention policy` = `success` (must not be skipped)
- Artifact contains `.dump.zst` and `.sha256`

### Restore drill workflow
- `Skip restore drill (missing required secrets)` must not run.
- `Download latest weekly backup from S3` = `success`
- `Restore backup into staging database` = `success`
- `Build restore drill report` = `success`
- Artifact includes `restore-drill-report.md` and logs.

## Step 6: Recovery Procedures
### A) Repo deleted only
1. Recreate repo and restore files.
2. Re-add all secrets.
3. Trigger full validation (Step 4).

### B) S3/MinIO deleted only
1. Recreate bucket and prefixes.
2. Keep same secret names.
3. Trigger daily and weekly backups to seed new storage.
4. Trigger monthly restore drill.

### C) Repo + S3/MinIO deleted
1. Recreate repo.
2. Recreate bucket.
3. Re-add all secrets.
4. Trigger backups to seed storage.
5. Trigger restore drill.

## Step 7: Fast Troubleshooting
### Backup steps are skipped
- Missing one of: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `BACKUP_S3_BUCKET`

### Restore drill skipped
- Missing one of: `BACKUP_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `STAGING_RESTORE_DB_URL`

### MinIO upload fails on GitHub-hosted runner
- Endpoint not reachable publicly, or TLS/network blocked.
- Use self-hosted runner in same network.

### Health workflow failing
- Check `SUPABASE_DB_URL` connectivity and credentials.
- Check verified tenant domains in DB.
- Download health artifacts and inspect `issues` block.

## Step 8: Operational Cadence
- Daily: monitor health + daily backup run status.
- Weekly: review weekly health and weekly backup retention.
- Monthly: run restore drill and confirm report.
- Quarterly: perform simulated "repo + storage reset" drill using this runbook.

## Step 9: Hardening (Recommended)
- Mirror repo to secondary git remote.
- Replicate object storage to second region/provider.
- Keep encrypted offline backup copy.
- Store all secrets in password manager with owner and rotation date.
