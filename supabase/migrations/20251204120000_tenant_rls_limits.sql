-- Enforce tenant scoping and quotas

-- Make tenant_id mandatory and add per-tenant uniqueness on slugs
alter table public.pages alter column tenant_id set not null;
alter table public.products alter column tenant_id set not null;
alter table public.categories alter column tenant_id set not null;

create unique index if not exists pages_tenant_slug_idx on public.pages (tenant_id, slug);
create unique index if not exists categories_tenant_slug_idx on public.categories (tenant_id, slug);
create unique index if not exists products_tenant_slug_idx on public.products (tenant_id, slug);

-- Enable RLS
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.pages enable row level security;

-- Tenant-aware policies for products
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'products_tenant_select'
  ) then
    create policy "products_tenant_select" on public.products
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = products.tenant_id
            and p.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'products_tenant_modify'
  ) then
    create policy "products_tenant_modify" on public.products
      for all
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = products.tenant_id
            and p.status = 'active'
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = products.tenant_id
            and p.status = 'active'
        )
      );
  end if;
end$$;

-- Tenant-aware policies for categories
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_tenant_select'
  ) then
    create policy "categories_tenant_select" on public.categories
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = categories.tenant_id
            and p.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_tenant_modify'
  ) then
    create policy "categories_tenant_modify" on public.categories
      for all
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = categories.tenant_id
            and p.status = 'active'
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = categories.tenant_id
            and p.status = 'active'
        )
      );
  end if;
end$$;

-- Tenant-aware policies for pages
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'pages' and policyname = 'pages_tenant_select'
  ) then
    create policy "pages_tenant_select" on public.pages
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = pages.tenant_id
            and p.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'pages' and policyname = 'pages_tenant_modify'
  ) then
    create policy "pages_tenant_modify" on public.pages
      for all
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = pages.tenant_id
            and p.status = 'active'
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.tenant_id = pages.tenant_id
            and p.status = 'active'
        )
      );
  end if;
end$$;

-- Quota enforcement triggers
create or replace function public.enforce_products_limit()
returns trigger
language plpgsql
as $$
declare
  max_allowed int;
  current_count int;
begin
  select max_products into max_allowed from public.tenant_limits where tenant_id = new.tenant_id;
  if max_allowed is null then
    return new;
  end if;

  select count(*) into current_count
  from public.products
  where tenant_id = new.tenant_id
    and (tg_op = 'INSERT' or id <> new.id);

  if current_count >= max_allowed then
    raise exception 'Product limit exceeded for tenant % (max %)', new.tenant_id, max_allowed;
  end if;

  return new;
end
$$;

create or replace function public.enforce_categories_limit()
returns trigger
language plpgsql
as $$
declare
  max_allowed int;
  current_count int;
begin
  select max_categories into max_allowed from public.tenant_limits where tenant_id = new.tenant_id;
  if max_allowed is null then
    return new;
  end if;

  select count(*) into current_count
  from public.categories
  where tenant_id = new.tenant_id
    and (tg_op = 'INSERT' or id <> new.id);

  if current_count >= max_allowed then
    raise exception 'Category limit exceeded for tenant % (max %)', new.tenant_id, max_allowed;
  end if;

  return new;
end
$$;

create or replace function public.enforce_pages_limit()
returns trigger
language plpgsql
as $$
declare
  max_allowed int;
  current_count int;
begin
  select max_static_pages into max_allowed from public.tenant_limits where tenant_id = new.tenant_id;
  if max_allowed is null then
    return new;
  end if;

  select count(*) into current_count
  from public.pages
  where tenant_id = new.tenant_id
    and (tg_op = 'INSERT' or id <> new.id);

  if current_count >= max_allowed then
    raise exception 'Static page limit exceeded for tenant % (max %)', new.tenant_id, max_allowed;
  end if;

  return new;
end
$$;

create or replace function public.enforce_carousel_limit()
returns trigger
language plpgsql
as $$
declare
  max_allowed int;
  current_count int;
begin
  select max_carousel_slides into max_allowed from public.tenant_limits where tenant_id = new.tenant_id;
  if max_allowed is null then
    return new;
  end if;

  select count(*) into current_count
  from public.carousel_slides
  where tenant_id = new.tenant_id
    and (tg_op = 'INSERT' or id <> new.id);

  if current_count >= max_allowed then
    raise exception 'Carousel slide limit exceeded for tenant % (max %)', new.tenant_id, max_allowed;
  end if;

  return new;
end
$$;

-- Attach triggers (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'enforce_products_limit_trg'
  ) then
    create trigger enforce_products_limit_trg
      before insert or update on public.products
      for each row execute function public.enforce_products_limit();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'enforce_categories_limit_trg'
  ) then
    create trigger enforce_categories_limit_trg
      before insert or update on public.categories
      for each row execute function public.enforce_categories_limit();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'enforce_pages_limit_trg'
  ) then
    create trigger enforce_pages_limit_trg
      before insert or update on public.pages
      for each row execute function public.enforce_pages_limit();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'enforce_carousel_limit_trg'
  ) then
    create trigger enforce_carousel_limit_trg
      before insert or update on public.carousel_slides
      for each row execute function public.enforce_carousel_limit();
  end if;
end
$$;
