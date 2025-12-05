-- Add brand_text field to navbar_config table
ALTER TABLE public.navbar_config 
ADD COLUMN brand_text TEXT DEFAULT 'Shop';