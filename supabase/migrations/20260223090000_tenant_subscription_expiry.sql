-- Phase 1: add subscription lifecycle fields and helper predicates

ALTER TABLE public.tenant_limits
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

UPDATE public.tenant_limits
SET
  subscription_started_at = COALESCE(subscription_started_at, created_at, NOW()),
  subscription_expires_at = COALESCE(subscription_expires_at, NOW() + INTERVAL '30 days');

ALTER TABLE public.tenant_limits
  ALTER COLUMN subscription_started_at SET DEFAULT NOW(),
  ALTER COLUMN subscription_started_at SET NOT NULL,
  ALTER COLUMN subscription_expires_at SET DEFAULT (NOW() + INTERVAL '30 days'),
  ALTER COLUMN subscription_expires_at SET NOT NULL;

ALTER TABLE public.tenant_limits
  DROP CONSTRAINT IF EXISTS tenant_limits_subscription_window_chk;

ALTER TABLE public.tenant_limits
  ADD CONSTRAINT tenant_limits_subscription_window_chk
  CHECK (subscription_expires_at > subscription_started_at);

CREATE INDEX IF NOT EXISTS idx_tenant_limits_subscription_expires_at
  ON public.tenant_limits(subscription_expires_at);

CREATE OR REPLACE FUNCTION public.has_active_subscription(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_limits tl
    WHERE tl.tenant_id = p_tenant_id
      AND tl.subscription_expires_at > NOW()
  );
$$;
