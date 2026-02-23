-- Phase 1: require active subscription for tenant content reads/writes

CREATE OR REPLACE FUNCTION public.is_active_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.tenant_id = p_tenant_id
      AND p.status = 'active'
  );
$$;

DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'products',
        'categories',
        'pages',
        'carousel_slides',
        'menu_items',
        'navbar_config',
        'footer_config',
        'footer_quick_links',
        'social_links'
      )
  LOOP
    EXECUTE FORMAT('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- Published-content tables
CREATE POLICY products_public_read
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY products_tenant_manage
  ON public.products FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY categories_public_read
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY categories_tenant_manage
  ON public.categories FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY pages_public_read
  ON public.pages FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY pages_tenant_manage
  ON public.pages FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY menu_items_public_read
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY menu_items_tenant_manage
  ON public.menu_items FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY navbar_config_public_read
  ON public.navbar_config FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY navbar_config_tenant_manage
  ON public.navbar_config FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY footer_config_public_read
  ON public.footer_config FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_published, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY footer_config_tenant_manage
  ON public.footer_config FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

-- Active-content tables
CREATE POLICY carousel_slides_public_read
  ON public.carousel_slides FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_active, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY carousel_slides_tenant_manage
  ON public.carousel_slides FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY footer_quick_links_public_read
  ON public.footer_quick_links FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_active, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY footer_quick_links_tenant_manage
  ON public.footer_quick_links FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

CREATE POLICY social_links_public_read
  ON public.social_links FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_active, false) = true AND public.has_active_subscription(tenant_id));

CREATE POLICY social_links_tenant_manage
  ON public.social_links FOR ALL
  TO authenticated
  USING (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    public.has_active_subscription(tenant_id)
    AND (public.is_active_tenant_member(tenant_id) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );
