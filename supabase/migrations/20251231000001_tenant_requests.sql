-- Create tenant_requests table for customer subscription requests
-- Customers can request to create a new tenant with a selected subscription plan

CREATE TABLE IF NOT EXISTS public.tenant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Requested subscription info
  requested_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  
  -- Tenant info from form
  business_name TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  
  -- Contact info
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Additional details
  business_description TEXT,
  message TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Created tenant reference (populated after approval)
  tenant_id UUID REFERENCES public.tenants(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_tenant_requests_status ON public.tenant_requests(status);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_email ON public.tenant_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_subdomain ON public.tenant_requests(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_created_at ON public.tenant_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Super admins can view all tenant requests
CREATE POLICY "Super admins can view all tenant requests"
  ON public.tenant_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policy: Super admins can manage (update/delete) tenant requests
CREATE POLICY "Super admins can manage tenant requests"
  ON public.tenant_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policy: Anonymous users can create (insert) tenant requests
CREATE POLICY "Anyone can create tenant requests"
  ON public.tenant_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_tenant_requests_updated_at
  BEFORE UPDATE ON public.tenant_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.tenant_requests IS 'Stores customer requests for new tenant creation with subscription plan selection';
COMMENT ON COLUMN public.tenant_requests.status IS 'Request status: pending (new), approved (admin approved), rejected (admin rejected), completed (tenant created)';
