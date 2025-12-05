-- Add theme_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN theme_id uuid;

-- Create themes table
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  preview_image_url text,
  plan_tier_required text NOT NULL CHECK (plan_tier_required IN ('basic', 'silver', 'gold')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active themes
CREATE POLICY "Active themes are viewable by everyone"
ON public.themes
FOR SELECT
USING (is_active = true);

-- Super admins can manage themes
CREATE POLICY "Super admins can manage themes"
ON public.themes
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Seed default themes
INSERT INTO public.themes (name, description, plan_tier_required) VALUES
  ('Classic', 'Clean and simple design with focus on products', 'basic'),
  ('Modern', 'Contemporary design with enhanced animations', 'silver'),
  ('Premium Dark', 'Elegant dark theme with premium aesthetics', 'gold'),
  ('Premium Light', 'Sophisticated light theme with advanced features', 'gold');