-- Fix RLS policies for subscription_plans to allow super_admin updates

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Super admins can manage subscription plans" ON public.subscription_plans;

-- Create a more permissive policy for super admins (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super admins can manage subscription plans"
  ON public.subscription_plans 
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Also ensure the price_usd column exists (in case migration wasn't applied)
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2);

-- Update existing plans with default USD prices if null
UPDATE public.subscription_plans 
SET price_usd = CASE 
  WHEN plan_type = 'basic' THEN 10.00
  WHEN plan_type = 'silver' THEN 15.00
  WHEN plan_type = 'gold' THEN 20.00
  ELSE ROUND(price / 83, 2)
END
WHERE price_usd IS NULL;
