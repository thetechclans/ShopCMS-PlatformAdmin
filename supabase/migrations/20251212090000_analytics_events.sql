-- Analytics events and aggregated metrics

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null,
  path text,
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  page_id uuid references public.pages(id) on delete set null,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_tenant_occurred_idx
  on public.analytics_events (tenant_id, occurred_at desc);

create index if not exists analytics_events_tenant_type_idx
  on public.analytics_events (tenant_id, event_type);

alter table public.analytics_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and policyname = 'analytics_events_tenant_read'
  ) then
    create policy "analytics_events_tenant_read" on public.analytics_events
      for select
      using (
        exists (
          select 1
          from public.profiles p
          join public.tenant_limits l on l.tenant_id = p.tenant_id
          where p.id = auth.uid()
            and p.status = 'active'
            and p.tenant_id = analytics_events.tenant_id
            and l.plan_type in ('silver', 'gold')
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and policyname = 'analytics_events_insert_any_tenant'
  ) then
    create policy "analytics_events_insert_any_tenant" on public.analytics_events
      for insert
      with check (true);
  end if;
end$$;

create or replace function public.top_tenants_by_traffic()
returns table (
  tenant_id uuid,
  name text,
  plan_type text,
  total_page_views bigint,
  total_product_views bigint
)
language sql
as $$
  select
    t.id as tenant_id,
    t.name,
    l.plan_type,
    count(*) filter (where e.event_type = 'page_view') as total_page_views,
    count(*) filter (where e.event_type = 'product_view') as total_product_views
  from public.tenants t
  join public.tenant_limits l on l.tenant_id = t.id
  join public.analytics_events e on e.tenant_id = t.id
  group by t.id, t.name, l.plan_type
  order by total_page_views desc
  limit 10
$$;

create or replace view public.tenant_daily_metrics as
select
  tenant_id,
  date_trunc('day', occurred_at) as day,
  count(*) filter (where event_type = 'page_view') as page_views,
  count(*) filter (where event_type = 'product_view') as product_views,
  count(*) filter (where event_type = 'category_view') as category_views
from public.analytics_events
group by tenant_id, date_trunc('day', occurred_at);
