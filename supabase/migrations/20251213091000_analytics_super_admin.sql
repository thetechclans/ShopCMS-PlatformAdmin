-- Allow platform super admins to read analytics across all tenants.
-- This is required for Platform Admin analytics dashboards to work when the
-- logged-in user is not scoped to a single tenant.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and policyname = 'analytics_events_platform_super_admin_read'
  ) then
    create policy "analytics_events_platform_super_admin_read" on public.analytics_events
      for select
      using (
        -- Use the SECURITY DEFINER helper from the core security migrations.
        public.has_role(auth.uid(), 'super_admin'::public.app_role)
      );
  end if;
end$$;
