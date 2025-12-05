-- RLS and policies for tenants table

-- Enable RLS
alter table public.tenants enable row level security;

-- Public read (anon + authenticated)
drop policy if exists tenants_public_read on public.tenants;
create policy tenants_public_read
  on public.tenants
  for select
  to anon, authenticated
  using (true);

-- Super-admin-only writes (insert/update/delete)
drop policy if exists tenants_super_admin_write on public.tenants;
create policy tenants_super_admin_write
  on public.tenants
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'super_admin'
    )
  );
