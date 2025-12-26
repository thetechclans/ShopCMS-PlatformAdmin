-- Platform analytics helpers (time-windowed KPIs and top tenants)

-- Aggregate totals across all tenants per day (based on the tenant_daily_metrics view).
create or replace view public.platform_daily_metrics as
select
  day,
  sum(page_views)::bigint as total_page_views,
  sum(product_views)::bigint as total_product_views,
  sum(category_views)::bigint as total_category_views,
  count(distinct tenant_id)::bigint as active_tenants
from public.tenant_daily_metrics
group by day
order by day asc;

-- Top tenants for a time window (in days). Used by Platform Admin analytics.
create or replace function public.top_tenants_by_traffic_in_range(p_days int)
returns table (
  tenant_id uuid,
  name text,
  plan_type text,
  total_page_views bigint,
  total_product_views bigint
)
language sql
stable
as $$
  with cutoff as (
    select now() - make_interval(days => greatest(coalesce(p_days, 7), 1)) as since
  )
  select
    t.id as tenant_id,
    t.name,
    l.plan_type,
    count(*) filter (where e.event_type = 'page_view') as total_page_views,
    count(*) filter (where e.event_type = 'product_view') as total_product_views
  from public.tenants t
  join public.tenant_limits l on l.tenant_id = t.id
  join public.analytics_events e on e.tenant_id = t.id
  cross join cutoff c
  where e.occurred_at >= c.since
  group by t.id, t.name, l.plan_type
  order by total_page_views desc
  limit 10
$$;

-- Platform KPI totals for a time window (in days).
create or replace function public.platform_kpis(p_days int)
returns table (
  total_page_views bigint,
  total_product_views bigint,
  total_category_views bigint,
  active_tenants bigint
)
language sql
stable
as $$
  with cutoff as (
    select now() - make_interval(days => greatest(coalesce(p_days, 7), 1)) as since
  )
  select
    count(*) filter (where e.event_type = 'page_view') as total_page_views,
    count(*) filter (where e.event_type = 'product_view') as total_product_views,
    count(*) filter (where e.event_type = 'category_view') as total_category_views,
    count(distinct e.tenant_id) as active_tenants
  from public.analytics_events e
  cross join cutoff c
  where e.occurred_at >= c.since
$$;

