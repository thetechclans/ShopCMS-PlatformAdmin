-- Add support features to Silver and Gold subscription plans
-- Basic plan: No support (customers manage themselves)
-- Silver plan: Email support
-- Gold plan: 24/7 support

-- Insert support features for Silver plan
INSERT INTO public.subscription_features (plan_id, feature_text, is_included, display_order)
SELECT 
  sp.id,
  'Email Support',
  true,
  9
FROM public.subscription_plans sp
WHERE sp.plan_type = 'silver'
ON CONFLICT DO NOTHING;

-- Insert support features for Gold plan  
INSERT INTO public.subscription_features (plan_id, feature_text, is_included, display_order)
SELECT 
  sp.id,
  '24/7 Priority Support',
  true,
  9
FROM public.subscription_plans sp
WHERE sp.plan_type = 'gold'
ON CONFLICT DO NOTHING;

-- Add "No Support" indicator for Basic plan (as excluded feature)
INSERT INTO public.subscription_features (plan_id, feature_text, is_included, display_order)
SELECT 
  sp.id,
  'Email Support',
  false,
  9
FROM public.subscription_plans sp
WHERE sp.plan_type = 'basic'
ON CONFLICT DO NOTHING;

INSERT INTO public.subscription_features (plan_id, feature_text, is_included, display_order)
SELECT 
  sp.id,
  '24/7 Priority Support',
  false,
  10
FROM public.subscription_plans sp
WHERE sp.plan_type = 'basic'
ON CONFLICT DO NOTHING;
