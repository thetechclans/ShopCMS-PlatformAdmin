-- Create subscription_plans table for admin-managed subscription plans
-- This table links to plan_template_configs via plan_type for visual customization

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT UNIQUE NOT NULL CHECK (plan_type IN ('basic', 'silver', 'gold')),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  period TEXT NOT NULL DEFAULT '/month',
  description TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription_features table for features linked to plans
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  is_included BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON public.subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_features_plan_id ON public.subscription_features(plan_id);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access for active plans
CREATE POLICY "Active subscription plans viewable by all"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policy: Super admin full access to subscription plans
CREATE POLICY "Super admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policy: Features viewable with their parent plans
CREATE POLICY "Subscription features viewable with plans"
  ON public.subscription_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscription_plans sp
      WHERE sp.id = plan_id AND sp.is_active = true
    )
  );

-- RLS Policy: Super admin full access to subscription features
CREATE POLICY "Super admins can manage subscription features"
  ON public.subscription_features FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at trigger for subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial subscription plans data
INSERT INTO public.subscription_plans (plan_type, name, price, currency, description, is_popular, display_order)
VALUES 
  ('basic', 'Basic', 800.00, 'INR', 'Perfect for small shops & startups', false, 1),
  ('silver', 'Silver', 1200.00, 'INR', 'Best for growing businesses', true, 2),
  ('gold', 'Gold', 1500.00, 'INR', 'E-commerce platform with payment gateway', false, 3)
ON CONFLICT (plan_type) DO NOTHING;

-- Seed features for each plan
INSERT INTO public.subscription_features (plan_id, feature_text, is_included, display_order)
SELECT 
  sp.id,
  feature.text,
  feature.included,
  feature.ord
FROM public.subscription_plans sp
CROSS JOIN LATERAL (
  VALUES 
    -- Basic Plan Features
    ('basic', '8 Categories', true, 1),
    ('basic', '50 Products', true, 2),
    ('basic', 'Customize Footer', true, 3),
    ('basic', 'Customize Carousel', true, 4),
    ('basic', 'Customize WhatsApp Number', true, 5),
    ('basic', 'No Hosting Charges', true, 6),
    ('basic', 'E-commerce Platform', false, 7),
    ('basic', 'Payment Gateway Access', false, 8),
    -- Silver Plan Features
    ('silver', '15 Categories', true, 1),
    ('silver', '250 Products', true, 2),
    ('silver', 'Customize Footer', true, 3),
    ('silver', 'Customize Carousel', true, 4),
    ('silver', 'Customize WhatsApp Number', true, 5),
    ('silver', 'No Hosting Charges', true, 6),
    ('silver', 'E-commerce Platform', false, 7),
    ('silver', 'Payment Gateway Access', false, 8),
    -- Gold Plan Features
    ('gold', '20 Categories', true, 1),
    ('gold', '500 Products', true, 2),
    ('gold', 'E-commerce Online Platform', true, 3),
    ('gold', 'Payment Gateway Access', true, 4),
    ('gold', 'Customize Footer', true, 5),
    ('gold', 'Customize Carousel', true, 6),
    ('gold', 'Customize WhatsApp Number', true, 7),
    ('gold', 'No Hosting Charges', true, 8)
) AS feature(plan_type, text, included, ord)
WHERE sp.plan_type = feature.plan_type
ON CONFLICT DO NOTHING;
