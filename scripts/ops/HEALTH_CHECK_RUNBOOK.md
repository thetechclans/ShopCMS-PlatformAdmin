# ShopCMS Health Check Runbook

## Objective
This runbook defines daily and weekly health checks for production monitoring.

Checks include:
- Database connectivity and business query health.
- Active tenant storefront availability.
- Network latency metrics.
- Weekly DNS and TLS certificate checks.

## Schedules
- Daily health check: `0 2 * * *` UTC
- Weekly deep health check: `0 4 * * 0` UTC

Workflows:
- `.github/workflows/health-daily.yml`
- `.github/workflows/health-weekly.yml`

## Required Secrets
- `SUPABASE_DB_URL`
- `PLATFORM_BASE_DOMAIN`
- `HEALTH_NOTIFICATION_WEBHOOK` (optional, recommended)

## Scope
Targets are filtered to active subscribed tenants:
- `tenants.status = 'active'`
- `tenant_limits.subscription_expires_at > now()`

Host selection order:
1. Verified primary domain
2. Verified custom domain
3. Subdomain fallback (`<subdomain>.<PLATFORM_BASE_DOMAIN>`)

## Thresholds (Default)
- Latency warning: `2500 ms`
- Latency critical: `5000 ms`
- TLS warning (weekly): `< 30 days`
- TLS critical (weekly): `< 14 days`

## Artifacts
Generated per run:
- `artifacts/health/health_<mode>_<timestamp>.json`
- `artifacts/health/health_<mode>_<timestamp>.md`

## Manual Execution

Daily:

```bash
SUPABASE_DB_URL='postgresql://user:pass@host:5432/postgres?sslmode=require' \
PLATFORM_BASE_DOMAIN='shopcms.com' \
bash scripts/ops/health_check.sh --mode daily
```

Weekly:

```bash
SUPABASE_DB_URL='postgresql://user:pass@host:5432/postgres?sslmode=require' \
PLATFORM_BASE_DOMAIN='shopcms.com' \
bash scripts/ops/health_check.sh --mode weekly
```

## Failure Handling
1. Inspect workflow logs and attached health report artifact.
2. Classify issue:
   - DB connectivity/query
   - HTTP availability
   - DNS resolution (weekly)
   - TLS expiry/fetch (weekly)
3. Fix issue and rerun workflow.
4. Escalate if unresolved:
   1. Platform engineering on-call
   2. DevOps owner
   3. Product owner
