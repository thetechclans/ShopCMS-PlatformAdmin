#!/usr/bin/env bash
set -euo pipefail

if [[ "${HEALTH_DEBUG:-0}" == "1" ]]; then
  set -x
  trap 'echo "[health-check] Error at line ${LINENO}" >&2' ERR
fi

usage() {
  cat <<'EOF'
Usage:
  SUPABASE_DB_URL=<postgres-url> [PLATFORM_BASE_DOMAIN=<domain>] bash scripts/ops/health_check.sh [--mode daily|weekly]

Options:
  --mode <daily|weekly>       Health check mode (default: daily)
  --artifacts-dir <path>      Output directory (default: artifacts/health)

Environment:
  SUPABASE_DB_URL               Required PostgreSQL URL
  PLATFORM_BASE_DOMAIN          Base domain for subdomain fallback
  HTTP_TIMEOUT_SECONDS          Curl max total time per probe (default: 15)
  HTTP_CONNECT_TIMEOUT_SECONDS  Curl connect timeout (default: 5)
  HTTP_RETRIES                  Additional retries (default: 2)
  HEALTH_LATENCY_WARN_MS        Latency warning threshold (default: 2500)
  HEALTH_LATENCY_CRITICAL_MS    Latency critical threshold (default: 5000)
  TLS_WARN_DAYS                 Weekly TLS warning threshold (default: 30)
  TLS_CRITICAL_DAYS             Weekly TLS critical threshold (default: 14)
EOF
}

log() {
  printf '[health-check] %s\n' "$*" >&2
}

to_ms() {
  local seconds="${1:-0}"
  awk -v s="$seconds" 'BEGIN { if (s == "" || s == "-") print 0; else printf "%.0f", s*1000 }'
}

percentile_from_file() {
  local file_path="$1"
  local pct="$2"

  if [[ ! -s "$file_path" ]]; then
    echo 0
    return
  fi

  sort -n "$file_path" | awk -v p="$pct" '
    { v[++n]=$1 }
    END {
      if (n == 0) { print 0; exit }
      idx = int((p * n + 99) / 100)
      if (idx < 1) idx = 1
      if (idx > n) idx = n
      print v[idx]
    }
  '
}

probe_url() {
  local url="$1"
  local retries="$2"
  local connect_timeout="$3"
  local timeout="$4"

  local attempts=$((retries + 1))
  local i=1

  local success="false"
  local status_code=0
  local connect_ms=0
  local ttfb_ms=0
  local total_ms=0
  local remote_ip=""
  local err=""

  while (( i <= attempts )); do
    local out_file err_file
    out_file="$(mktemp)"
    err_file="$(mktemp)"

    if curl \
      -sS \
      -o /dev/null \
      --connect-timeout "$connect_timeout" \
      --max-time "$timeout" \
      -w '%{http_code}\t%{time_connect}\t%{time_starttransfer}\t%{time_total}\t%{remote_ip}' \
      "$url" >"$out_file" 2>"$err_file"; then
      local c_s t_s ttl_s
      IFS=$'\t' read -r status_code c_s t_s ttl_s remote_ip <"$out_file"
      connect_ms="$(to_ms "$c_s")"
      ttfb_ms="$(to_ms "$t_s")"
      total_ms="$(to_ms "$ttl_s")"

      if [[ "$status_code" =~ ^[23][0-9][0-9]$ ]]; then
        success="true"
        rm -f "$out_file" "$err_file"
        break
      fi

      err="HTTP ${status_code}"
    else
      err="$(tr '\n' ' ' <"$err_file" | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//')"
      [[ -z "$err" ]] && err="curl_failed"
    fi

    rm -f "$out_file" "$err_file"
    i=$((i + 1))
  done

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$success" "$status_code" "$connect_ms" "$ttfb_ms" "$total_ms" "$remote_ip" "$err"
}

MODE="daily"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-artifacts/health}"
HTTP_TIMEOUT_SECONDS="${HTTP_TIMEOUT_SECONDS:-15}"
HTTP_CONNECT_TIMEOUT_SECONDS="${HTTP_CONNECT_TIMEOUT_SECONDS:-5}"
HTTP_RETRIES="${HTTP_RETRIES:-2}"
HEALTH_LATENCY_WARN_MS="${HEALTH_LATENCY_WARN_MS:-2500}"
HEALTH_LATENCY_CRITICAL_MS="${HEALTH_LATENCY_CRITICAL_MS:-5000}"
TLS_WARN_DAYS="${TLS_WARN_DAYS:-30}"
TLS_CRITICAL_DAYS="${TLS_CRITICAL_DAYS:-14}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --artifacts-dir)
      ARTIFACTS_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log "Unknown arg: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ "$MODE" != "daily" && "$MODE" != "weekly" ]]; then
  log "Invalid mode: $MODE"
  exit 1
fi

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"
PLATFORM_BASE_DOMAIN="${PLATFORM_BASE_DOMAIN:-}"
PLATFORM_BASE_DOMAIN_SQL="${PLATFORM_BASE_DOMAIN//\'/\'\'}"

required_bins=(psql jq curl awk sort sed mktemp date)
if [[ "$MODE" == "weekly" ]]; then
  required_bins+=(dig openssl timeout)
fi

for bin in "${required_bins[@]}"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    log "Missing command: $bin"
    exit 1
  fi
done

mkdir -p "$ARTIFACTS_DIR"

ts_utc="$(date -u +%Y%m%d_%H%M%S)"
generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
report_json="${ARTIFACTS_DIR}/health_${MODE}_${ts_utc}.json"
report_md="${ARTIFACTS_DIR}/health_${MODE}_${ts_utc}.md"

probes_file="$(mktemp)"
issues_file="$(mktemp)"
latency_file="$(mktemp)"
table_file="$(mktemp)"
targets_file="$(mktemp)"

cleanup() {
  rm -f "$probes_file" "$issues_file" "$latency_file" "$table_file" "$targets_file"
}
trap cleanup EXIT

: > "$probes_file"
: > "$issues_file"
: > "$latency_file"
: > "$table_file"

critical_count=0
warning_count=0

add_issue() {
  local level="$1"
  local code="$2"
  local message="$3"
  local tenant_id="${4:-}"
  local host="${5:-}"

  jq -cn \
    --arg level "$level" \
    --arg code "$code" \
    --arg message "$message" \
    --arg tenant_id "$tenant_id" \
    --arg host "$host" \
    '{level:$level,code:$code,message:$message,tenant_id:$tenant_id,host:$host}' >> "$issues_file"

  if [[ "$level" == "critical" ]]; then
    critical_count=$((critical_count + 1))
  else
    warning_count=$((warning_count + 1))
  fi
}

db_ok=true
db_connectivity_ok=true
db_error=""
db_connect_ms=0
db_business_ms=0
active_tenants_total=0
active_subscribed_tenants=0
verified_domains_total=0

start_ns="$(date +%s%N)"
connect_error_file="$(mktemp)"
if psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -Atc "SELECT 1;" >/dev/null 2>"$connect_error_file"; then
  db_connect_ms="$(( ( $(date +%s%N) - start_ns ) / 1000000 ))"
else
  db_connect_ms="$(( ( $(date +%s%N) - start_ns ) / 1000000 ))"
  db_ok=false
  db_connectivity_ok=false
  connect_error="$(tr '\n' ' ' <"$connect_error_file" | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//')"
  if [[ -n "$connect_error" ]]; then
    db_error="Database connectivity failed: ${connect_error}"
  else
    db_error="Database connectivity failed"
  fi
  add_issue "critical" "db_connectivity_failed" "$db_error"
fi
rm -f "$connect_error_file"

if [[ "$db_ok" == true ]]; then
  business_sql="
WITH active_subscribed AS (
  SELECT t.id
  FROM public.tenants t
  JOIN public.tenant_limits l ON l.tenant_id = t.id
  WHERE t.status = 'active'
    AND l.subscription_expires_at > NOW()
)
SELECT
  (SELECT COUNT(*) FROM public.tenants WHERE status='active') AS active_tenants_total,
  (SELECT COUNT(*) FROM active_subscribed) AS active_subscribed_tenants,
  (SELECT COUNT(*) FROM public.tenant_domains WHERE is_verified=true) AS verified_domains_total;
"

  start_ns="$(date +%s%N)"
  business_error_file="$(mktemp)"
  if row="$(psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -F $'\t' -Atc "$business_sql" 2>"$business_error_file")"; then
    db_business_ms="$(( ( $(date +%s%N) - start_ns ) / 1000000 ))"
    IFS=$'\t' read -r active_tenants_total active_subscribed_tenants verified_domains_total <<< "$row"
  else
    db_business_ms="$(( ( $(date +%s%N) - start_ns ) / 1000000 ))"
    db_ok=false
    business_error="$(tr '\n' ' ' <"$business_error_file" | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//')"
    if [[ -n "$business_error" ]]; then
      db_error="Database business health query failed: ${business_error}"
    else
      db_error="Database business health query failed"
    fi
    add_issue "critical" "db_business_query_failed" "$db_error"
  fi
  rm -f "$business_error_file"
fi

if [[ "$db_ok" == true ]]; then
  if [[ "$MODE" == "daily" ]]; then
    targets_sql="
WITH active_subscribed AS (
  SELECT t.id, t.name, t.subdomain, l.subscription_expires_at
  FROM public.tenants t
  JOIN public.tenant_limits l ON l.tenant_id = t.id
  WHERE t.status='active' AND l.subscription_expires_at > NOW()
), preferred_verified_domain AS (
  SELECT DISTINCT ON (td.tenant_id)
    td.tenant_id, td.domain, td.is_primary
  FROM public.tenant_domains td
  WHERE td.is_verified = true
  ORDER BY td.tenant_id, td.is_primary DESC, td.created_at DESC NULLS LAST
)
SELECT
  a.id,
  a.name,
  COALESCE(
    (
      SELECT td.domain
      FROM public.tenant_domains td
      WHERE td.tenant_id=a.id
        AND td.is_verified=true
        AND td.is_primary=true
      ORDER BY td.created_at DESC NULLS LAST
      LIMIT 1
    ),
    p.domain
  ) AS host,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM public.tenant_domains td
      WHERE td.tenant_id=a.id
        AND td.is_verified=true
        AND td.is_primary=true
    ) THEN 'primary_verified_domain'
    WHEN p.domain IS NOT NULL THEN 'verified_domain'
    ELSE 'unresolved'
  END AS source,
  a.subscription_expires_at
FROM active_subscribed a
LEFT JOIN preferred_verified_domain p ON p.tenant_id=a.id
ORDER BY a.name;
"
  else
    targets_sql="
WITH active_subscribed AS (
  SELECT t.id, t.name, t.subdomain, l.subscription_expires_at
  FROM public.tenants t
  JOIN public.tenant_limits l ON l.tenant_id = t.id
  WHERE t.status='active' AND l.subscription_expires_at > NOW()
), verified_domains AS (
  SELECT td.tenant_id, td.domain, td.is_primary
  FROM public.tenant_domains td
  WHERE td.is_verified=true
), verified_counts AS (
  SELECT tenant_id, COUNT(*) AS verified_count
  FROM verified_domains
  GROUP BY tenant_id
)
SELECT
  a.id,
  a.name,
  vd.domain AS host,
  CASE WHEN vd.is_primary THEN 'primary_verified_domain' ELSE 'verified_domain' END AS source,
  a.subscription_expires_at
FROM active_subscribed a
JOIN verified_domains vd ON vd.tenant_id=a.id
UNION ALL
SELECT
  a.id,
  a.name,
  NULL AS host,
  'unresolved' AS source,
  a.subscription_expires_at
FROM active_subscribed a
LEFT JOIN verified_counts vc ON vc.tenant_id=a.id
WHERE COALESCE(vc.verified_count, 0)=0
ORDER BY 2, 3;
"
  fi

  targets_error_file="$(mktemp)"
  if ! psql "$SUPABASE_DB_URL" \
    -v ON_ERROR_STOP=1 \
    -F $'\t' \
    -Atc "$targets_sql" > "$targets_file" 2>"$targets_error_file"; then
    db_ok=false
    targets_error="$(tr '\n' ' ' <"$targets_error_file" | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//')"
    if [[ -n "$targets_error" ]]; then
      add_issue "critical" "tenant_targets_query_failed" "Failed to fetch tenant targets: ${targets_error}"
    else
      add_issue "critical" "tenant_targets_query_failed" "Failed to fetch tenant targets"
    fi
  fi
  rm -f "$targets_error_file"
fi

declare -A seen=()

total_targets=0
passed_targets=0
failed_targets=0

if [[ "$db_ok" == true ]]; then
  while IFS=$'\t' read -r tenant_id tenant_name host source subscription_expires_at; do
    [[ -z "${tenant_id:-}" ]] && continue

    if [[ -z "${host:-}" || "${source:-}" == "unresolved" ]]; then
      add_issue "warning" "tenant_domain_not_configured" "No verified domain configured for active tenant" "$tenant_id"

      jq -cn \
        --arg tenant_id "$tenant_id" \
        --arg tenant_name "$tenant_name" \
        --arg source "unresolved" \
        --arg mode "$MODE" \
        --arg subscription_expires_at "$subscription_expires_at" \
        '{tenant_id:$tenant_id,tenant_name:$tenant_name,host:null,source:$source,url:null,mode:$mode,subscription_expires_at:$subscription_expires_at,success:false,http_status:null,connect_ms:null,ttfb_ms:null,total_ms:null,remote_ip:null,dns_ok:null,dns_ips:null,tls_days_left:null,error:"no_verified_domain"}' >> "$probes_file"

      printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
        "$tenant_name" "-" "unresolved" "-" "-" "-" "-" "-" "-" "SKIP" >> "$table_file"
      continue
    fi

    key="${tenant_id}|${host}"
    if [[ -n "${seen[$key]:-}" ]]; then
      continue
    fi
    seen[$key]=1

    total_targets=$((total_targets + 1))

    dns_ok_json="null"
    dns_display="n/a"
    dns_ips=""
    tls_days_json="null"
    tls_display="n/a"

    if [[ "$MODE" == "weekly" ]]; then
      ips_raw="$( (dig +short A "$host"; dig +short AAAA "$host") 2>/dev/null | sed '/^[[:space:]]*$/d' | sort -u || true )"
      if [[ -n "$ips_raw" ]]; then
        dns_ok_json="true"
        dns_display="ok"
        dns_ips="$(echo "$ips_raw" | paste -sd ',' -)"
      else
        dns_ok_json="false"
        dns_display="fail"
        add_issue "critical" "dns_resolution_failed" "DNS resolution failed" "$tenant_id" "$host"
      fi

      cert_line="$(timeout 20 openssl s_client -servername "$host" -connect "${host}:443" </dev/null 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)"
      if [[ "$cert_line" == notAfter=* ]]; then
        cert_date="${cert_line#notAfter=}"
        cert_epoch="$(date -u -d "$cert_date" +%s 2>/dev/null || true)"
        if [[ -n "$cert_epoch" ]]; then
          now_epoch="$(date -u +%s)"
          tls_days=$(( (cert_epoch - now_epoch) / 86400 ))
          tls_days_json="$tls_days"
          tls_display="$tls_days"

          if (( tls_days < TLS_CRITICAL_DAYS )); then
            add_issue "critical" "tls_expiry_critical" "TLS cert expires in ${tls_days} day(s)" "$tenant_id" "$host"
          elif (( tls_days < TLS_WARN_DAYS )); then
            add_issue "warning" "tls_expiry_warning" "TLS cert expires in ${tls_days} day(s)" "$tenant_id" "$host"
          fi
        else
          add_issue "warning" "tls_expiry_parse_failed" "Unable to parse TLS expiry" "$tenant_id" "$host"
        fi
      else
        add_issue "critical" "tls_fetch_failed" "Unable to fetch TLS certificate" "$tenant_id" "$host"
      fi
    fi

    url="https://${host}/"
    probe_row="$({ probe_url "$url" "$HTTP_RETRIES" "$HTTP_CONNECT_TIMEOUT_SECONDS" "$HTTP_TIMEOUT_SECONDS"; } || true)"
    IFS=$'\t' read -r ok http_status connect_ms ttfb_ms total_ms remote_ip err <<< "$probe_row" || true

    ok="${ok:-false}"
    http_status="${http_status:-0}"
    connect_ms="${connect_ms:-0}"
    ttfb_ms="${ttfb_ms:-0}"
    total_ms="${total_ms:-0}"
    remote_ip="${remote_ip:-}"
    if [[ -z "${err:-}" && "$ok" != "true" ]]; then
      err="probe_no_output"
    fi

    if [[ "$ok" == "true" ]]; then
      passed_targets=$((passed_targets + 1))
      echo "$total_ms" >> "$latency_file"
      if (( total_ms >= HEALTH_LATENCY_CRITICAL_MS )); then
        add_issue "critical" "latency_critical" "High latency (${total_ms}ms)" "$tenant_id" "$host"
      elif (( total_ms >= HEALTH_LATENCY_WARN_MS )); then
        add_issue "warning" "latency_warning" "Elevated latency (${total_ms}ms)" "$tenant_id" "$host"
      fi
      result="PASS"
    else
      failed_targets=$((failed_targets + 1))
      add_issue "critical" "tenant_http_check_failed" "Storefront probe failed: ${err}" "$tenant_id" "$host"
      result="FAIL"
    fi

    jq -cn \
      --arg tenant_id "$tenant_id" \
      --arg tenant_name "$tenant_name" \
      --arg host "$host" \
      --arg source "$source" \
      --arg url "$url" \
      --arg mode "$MODE" \
      --arg subscription_expires_at "$subscription_expires_at" \
      --argjson success "$ok" \
      --arg http_status "$http_status" \
      --argjson connect_ms "$connect_ms" \
      --argjson ttfb_ms "$ttfb_ms" \
      --argjson total_ms "$total_ms" \
      --arg remote_ip "$remote_ip" \
      --argjson dns_ok "$dns_ok_json" \
      --arg dns_ips "$dns_ips" \
      --argjson tls_days_left "$tls_days_json" \
      --arg error "$err" \
      '{
        tenant_id:$tenant_id,
        tenant_name:$tenant_name,
        host:$host,
        source:$source,
        url:$url,
        mode:$mode,
        subscription_expires_at:$subscription_expires_at,
        success:$success,
        http_status:(if ($http_status|test("^[0-9]+$")) then ($http_status|tonumber) else null end),
        connect_ms:$connect_ms,
        ttfb_ms:$ttfb_ms,
        total_ms:$total_ms,
        remote_ip:(if $remote_ip=="" then null else $remote_ip end),
        dns_ok:$dns_ok,
        dns_ips:(if $dns_ips=="" then null else ($dns_ips|split(",")) end),
        tls_days_left:$tls_days_left,
        error:(if $error=="" then null else $error end)
      }' >> "$probes_file"

    printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
      "$tenant_name" "$host" "$source" "$http_status" "$connect_ms" "$ttfb_ms" "$total_ms" "$dns_display" "$tls_display" "$result" >> "$table_file"

  done < "$targets_file"
fi

if [[ "$db_ok" == true && "$active_subscribed_tenants" -eq 0 ]]; then
  add_issue "warning" "no_active_subscribed_tenants" "No active subscribed tenants found"
fi

if (( total_targets == 0 )); then
  add_issue "warning" "no_probe_targets" "No probe targets with verified domains were generated"
fi

if (( total_targets > 0 )); then
  success_rate="$(awk -v p="$passed_targets" -v t="$total_targets" 'BEGIN { printf "%.2f", (p*100)/t }')"
else
  success_rate="0.00"
fi

p95_total_ms="$(percentile_from_file "$latency_file" 95)"

if (( critical_count > 0 )); then
  overall="FAIL"
else
  overall="PASS"
fi

jq -n \
  --arg mode "$MODE" \
  --arg generated_at "$generated_at" \
  --arg overall_status "$overall" \
  --arg platform_base_domain "$PLATFORM_BASE_DOMAIN" \
  --arg db_error "$db_error" \
  --argjson db_ok "$db_connectivity_ok" \
  --argjson db_connect_latency_ms "$db_connect_ms" \
  --argjson db_business_latency_ms "$db_business_ms" \
  --argjson active_tenants_total "$active_tenants_total" \
  --argjson active_subscribed_tenants "$active_subscribed_tenants" \
  --argjson verified_domains_total "$verified_domains_total" \
  --argjson total_targets "$total_targets" \
  --argjson passed_targets "$passed_targets" \
  --argjson failed_targets "$failed_targets" \
  --argjson success_rate_percent "$success_rate" \
  --argjson p95_total_latency_ms "$p95_total_ms" \
  --argjson critical_failures "$critical_count" \
  --argjson warnings "$warning_count" \
  --argjson latency_warn_ms "$HEALTH_LATENCY_WARN_MS" \
  --argjson latency_critical_ms "$HEALTH_LATENCY_CRITICAL_MS" \
  --argjson tls_warn_days "$TLS_WARN_DAYS" \
  --argjson tls_critical_days "$TLS_CRITICAL_DAYS" \
  --slurpfile probes "$probes_file" \
  --slurpfile issues "$issues_file" \
  '{
    mode:$mode,
    generated_at:$generated_at,
    overall_status:$overall_status,
    platform_base_domain:(if $platform_base_domain=="" then null else $platform_base_domain end),
    summary:{
      total_targets:$total_targets,
      passed_targets:$passed_targets,
      failed_targets:$failed_targets,
      success_rate_percent:$success_rate_percent,
      p95_total_latency_ms:$p95_total_latency_ms,
      critical_failures:$critical_failures,
      warnings:$warnings
    },
    database:{
      ok:$db_ok,
      connect_latency_ms:$db_connect_latency_ms,
      business_query_latency_ms:$db_business_latency_ms,
      active_tenants_total:$active_tenants_total,
      active_subscribed_tenants:$active_subscribed_tenants,
      verified_domains_total:$verified_domains_total,
      error:(if $db_error=="" then null else $db_error end)
    },
    thresholds:{
      latency_warn_ms:$latency_warn_ms,
      latency_critical_ms:$latency_critical_ms,
      tls_warn_days:$tls_warn_days,
      tls_critical_days:$tls_critical_days
    },
    probes:$probes,
    issues:$issues
  }' > "$report_json"

{
  echo "# ShopCMS Health Report (${MODE^})"
  echo
  echo "- Generated at (UTC): \`${generated_at}\`"
  echo "- Overall status: **${overall}**"
  echo "- Active subscribed tenants: **${active_subscribed_tenants}**"
  echo "- Probe success rate: **${success_rate}%**"
  echo "- p95 total latency: **${p95_total_ms} ms**"
  echo "- Critical failures: **${critical_count}**"
  echo "- Warnings: **${warning_count}**"
  echo
  echo "## Database"
  echo
  echo "- Connectivity: **${db_connectivity_ok}**"
  echo "- Connect latency: **${db_connect_ms} ms**"
  echo "- Business query latency: **${db_business_ms} ms**"
  echo "- Active tenants total: **${active_tenants_total}**"
  echo "- Verified domains total: **${verified_domains_total}**"
  if [[ -n "$db_error" ]]; then
    echo "- Error: ${db_error}"
  fi
  echo
  echo "## Probe Results"
  echo
  if [[ -s "$table_file" ]]; then
    echo "| Tenant | Host | Source | HTTP | Connect ms | TTFB ms | Total ms | DNS | TLS days left | Result |"
    echo "|---|---|---|---:|---:|---:|---:|---|---:|---|"
    while IFS=$'\t' read -r tname host source http connect ttfb total dns tls result; do
      safe_tname="${tname//|/\\|}"
      echo "| ${safe_tname} | \`${host}\` | ${source} | ${http} | ${connect} | ${ttfb} | ${total} | ${dns} | ${tls} | ${result} |"
    done < "$table_file"
  else
    echo "No probe results were generated."
  fi
  echo
  echo "## Issues"
  echo
  if [[ -s "$issues_file" ]]; then
    jq -s -r '.[] | "- [" + (.level|ascii_upcase) + "] " + .code + " - " + .message + (if .tenant_id != "" then " (tenant: " + .tenant_id + ")" else "" end) + (if .host != "" then " [host: " + .host + "]" else "" end)' "$issues_file"
  else
    echo "- No issues detected."
  fi
} > "$report_md"

log "Markdown report: $report_md"
log "JSON report: $report_json"

echo "$report_md"

if (( critical_count > 0 )); then
  exit 1
fi
