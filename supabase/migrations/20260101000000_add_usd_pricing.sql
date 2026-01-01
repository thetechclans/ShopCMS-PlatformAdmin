-- Add USD pricing to subscription_plans table
-- This allows showing different prices for international users (non-India)

ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2);

-- Update existing plans with default USD prices
UPDATE public.subscription_plans 
SET price_usd = CASE 
  WHEN plan_type = 'basic' THEN 10.00
  WHEN plan_type = 'silver' THEN 15.00
  WHEN plan_type = 'gold' THEN 20.00
  ELSE price / 83  -- Approximate INR to USD conversion as fallback
END
WHERE price_usd IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.subscription_plans.price_usd IS 'USD price for international (non-India) users';
