-- Update tenant_limits default values to match subscription plan quotas

UPDATE public.tenant_limits 
SET 
  max_categories = CASE plan_type
    WHEN 'basic' THEN 8
    WHEN 'silver' THEN 15
    WHEN 'gold' THEN 20
    ELSE max_categories
  END,
  max_products = CASE plan_type
    WHEN 'basic' THEN 50
    WHEN 'silver' THEN 250
    WHEN 'gold' THEN 500
    ELSE max_products
  END,
  max_carousel_slides = CASE plan_type
    WHEN 'basic' THEN 5
    WHEN 'silver' THEN 10
    WHEN 'gold' THEN 15
    ELSE max_carousel_slides
  END,
  max_static_pages = CASE plan_type
    WHEN 'basic' THEN 10
    WHEN 'silver' THEN 25
    WHEN 'gold' THEN 50
    ELSE max_static_pages
  END;

-- Add comment to document the limits per plan
COMMENT ON TABLE public.tenant_limits IS 'Stores resource quotas for each tenant based on their subscription plan type';
