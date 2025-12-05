-- Create tenant plans/limits table
CREATE TABLE IF NOT EXISTS public.tenant_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'silver', 'gold')),
  max_products INTEGER NOT NULL DEFAULT 10,
  max_categories INTEGER NOT NULL DEFAULT 5,
  max_image_size_mb NUMERIC(10,2) NOT NULL DEFAULT 2.0,
  max_carousel_slides INTEGER NOT NULL DEFAULT 3,
  max_static_pages INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

-- Platform admins (super_admin) can manage all tenant limits
CREATE POLICY "Super admins can manage tenant limits"
ON public.tenant_limits
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Tenant admins can view their own limits (read-only)
CREATE POLICY "Tenant admins can view their limits"
ON public.tenant_limits
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_tenant_limits_updated_at
  BEFORE UPDATE ON public.tenant_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default limits for existing tenants
INSERT INTO public.tenant_limits (tenant_id, plan_type, max_products, max_categories, max_image_size_mb)
SELECT id, 'basic', 50, 10, 5.0
FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;