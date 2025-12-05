-- Add status field to profiles for user approval workflow
ALTER TABLE public.profiles 
ADD COLUMN status text NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'active', 'suspended'));

-- Add index for filtering by status
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_tenant_status ON public.profiles(tenant_id, status);

-- Update existing profiles to active status
UPDATE public.profiles SET status = 'active';