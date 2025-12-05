-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subdomain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_domains table for custom domain mapping
CREATE TABLE public.tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;

-- Insert default tenant for existing data
INSERT INTO public.tenants (id, name, slug, subdomain, status)
VALUES (
  gen_random_uuid(),
  'Default Shop',
  'default-shop',
  'shop',
  'active'
);

-- Add tenant_id to profiles table
ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create index on tenant_id for performance
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Link existing profile to default tenant
UPDATE public.profiles
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');

-- Make tenant_id NOT NULL after migration
ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;

-- RLS policies for tenants table (super_admin acts as platform admin)
CREATE POLICY "Super admins can manage all tenants"
  ON public.tenants FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Tenant admins can view their own tenant"
  ON public.tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS policies for tenant_domains
CREATE POLICY "Super admins can manage all domains"
  ON public.tenant_domains FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Tenant admins can view their domains"
  ON public.tenant_domains FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Add tenant_id to all content tables
ALTER TABLE public.carousel_slides ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.pages ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.menu_items ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.navbar_config ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.footer_config ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.footer_quick_links ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.social_links ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Migrate existing data to default tenant
UPDATE public.carousel_slides SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.categories SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.products SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.pages SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.menu_items SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.navbar_config SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.footer_config SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.footer_quick_links SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');
UPDATE public.social_links SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'default-shop');

-- Make tenant_id NOT NULL on all tables
ALTER TABLE public.carousel_slides ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.pages ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.menu_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.navbar_config ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.footer_config ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.footer_quick_links ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.social_links ALTER COLUMN tenant_id SET NOT NULL;

-- Create indexes for tenant_id on all tables
CREATE INDEX idx_carousel_slides_tenant_id ON public.carousel_slides(tenant_id);
CREATE INDEX idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX idx_pages_tenant_id ON public.pages(tenant_id);
CREATE INDEX idx_menu_items_tenant_id ON public.menu_items(tenant_id);
CREATE INDEX idx_navbar_config_tenant_id ON public.navbar_config(tenant_id);
CREATE INDEX idx_footer_config_tenant_id ON public.footer_config(tenant_id);
CREATE INDEX idx_footer_quick_links_tenant_id ON public.footer_quick_links(tenant_id);
CREATE INDEX idx_social_links_tenant_id ON public.social_links(tenant_id);

-- Drop and recreate public_shop_info view to include tenant_id
DROP VIEW IF EXISTS public.public_shop_info CASCADE;

CREATE VIEW public.public_shop_info AS
SELECT 
  p.id,
  p.tenant_id,
  p.shop_name,
  p.shop_description,
  p.whatsapp_number,
  p.favicon_url,
  p.site_title
FROM public.profiles p;

-- Update RLS policies for carousel_slides
DROP POLICY IF EXISTS "Active carousel slides are viewable by everyone" ON public.carousel_slides;
DROP POLICY IF EXISTS "Shop owners can manage their carousel slides" ON public.carousel_slides;

CREATE POLICY "Active carousel slides viewable by tenant"
  ON public.carousel_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tenant admins can manage their carousel slides"
  ON public.carousel_slides FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for categories
DROP POLICY IF EXISTS "Published categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Shop owners can manage their categories" ON public.categories;

CREATE POLICY "Published categories viewable by tenant"
  ON public.categories FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their categories"
  ON public.categories FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for products
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Shop owners can manage their products" ON public.products;

CREATE POLICY "Published products viewable by tenant"
  ON public.products FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their products"
  ON public.products FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for pages
DROP POLICY IF EXISTS "Published pages are viewable by everyone" ON public.pages;
DROP POLICY IF EXISTS "Shop owners can manage their pages" ON public.pages;

CREATE POLICY "Published pages viewable by tenant"
  ON public.pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their pages"
  ON public.pages FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for menu_items
DROP POLICY IF EXISTS "Published menu items are viewable by everyone" ON public.menu_items;
DROP POLICY IF EXISTS "Shop owners can manage their menu items" ON public.menu_items;

CREATE POLICY "Published menu items viewable by tenant"
  ON public.menu_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their menu items"
  ON public.menu_items FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for navbar_config
DROP POLICY IF EXISTS "Published navbar config is viewable by everyone" ON public.navbar_config;
DROP POLICY IF EXISTS "Shop owners can manage their navbar config" ON public.navbar_config;

CREATE POLICY "Published navbar config viewable by tenant"
  ON public.navbar_config FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their navbar config"
  ON public.navbar_config FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for footer_config
DROP POLICY IF EXISTS "Published footer config is viewable by everyone" ON public.footer_config;
DROP POLICY IF EXISTS "Shop owners can manage their footer config" ON public.footer_config;

CREATE POLICY "Published footer config viewable by tenant"
  ON public.footer_config FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tenant admins can manage their footer config"
  ON public.footer_config FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for footer_quick_links
DROP POLICY IF EXISTS "Active footer quick links are viewable by everyone" ON public.footer_quick_links;
DROP POLICY IF EXISTS "Shop owners can manage their footer quick links" ON public.footer_quick_links;

CREATE POLICY "Active footer quick links viewable by tenant"
  ON public.footer_quick_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tenant admins can manage their footer quick links"
  ON public.footer_quick_links FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update RLS policies for social_links
DROP POLICY IF EXISTS "Active social links are viewable by everyone" ON public.social_links;
DROP POLICY IF EXISTS "Shop owners can manage their social links" ON public.social_links;

CREATE POLICY "Active social links viewable by tenant"
  ON public.social_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tenant admins can manage their social links"
  ON public.social_links FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Add updated_at triggers for new tables
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tenant_domains_updated_at
  BEFORE UPDATE ON public.tenant_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();