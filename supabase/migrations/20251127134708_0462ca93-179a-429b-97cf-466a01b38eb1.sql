-- =====================================================
-- Multi-Tenant Optimization: Indexes and RLS Policies
-- =====================================================

-- Add composite indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_created 
  ON products(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_tenant_published 
  ON products(tenant_id, is_published) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_categories_tenant_created 
  ON categories(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_tenant_published 
  ON categories(tenant_id, is_published) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_carousel_slides_tenant_order 
  ON carousel_slides(tenant_id, display_order);

CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_published 
  ON menu_items(tenant_id, is_published) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_pages_tenant_slug 
  ON pages(tenant_id, slug);

-- Indexes for domain lookup optimization
CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain 
  ON tenant_domains(domain) 
  WHERE is_verified = true;

CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant 
  ON tenant_domains(tenant_id);

-- Update RLS policies for proper tenant-scoped public access
-- These policies ensure public reads are filtered by tenant_id from the context

-- Drop and recreate policies for better tenant isolation
DROP POLICY IF EXISTS "Active carousel slides viewable by tenant" ON carousel_slides;
CREATE POLICY "Active carousel slides viewable by tenant" 
  ON carousel_slides 
  FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "Published categories viewable by tenant" ON categories;
CREATE POLICY "Published categories viewable by tenant" 
  ON categories 
  FOR SELECT 
  USING (is_published = true);

DROP POLICY IF EXISTS "Published menu items viewable by tenant" ON menu_items;
CREATE POLICY "Published menu items viewable by tenant" 
  ON menu_items 
  FOR SELECT 
  USING (is_published = true);

DROP POLICY IF EXISTS "Published pages viewable by tenant" ON pages;
CREATE POLICY "Published pages viewable by tenant" 
  ON pages 
  FOR SELECT 
  USING (is_published = true);

DROP POLICY IF EXISTS "Published products viewable by tenant" ON products;
CREATE POLICY "Published products viewable by tenant" 
  ON products 
  FOR SELECT 
  USING (is_published = true);

-- Security definer function for tenant membership check
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = _user_id 
      AND tenant_id = _tenant_id
  )
$$;