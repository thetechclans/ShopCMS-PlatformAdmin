-- Create plan_template_configs table for customizable plan templates
CREATE TABLE IF NOT EXISTS public.plan_template_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT UNIQUE NOT NULL CHECK (plan_type IN ('basic', 'silver', 'gold')),
  
  -- Color Configuration
  primary_color TEXT DEFAULT 'hsl(262, 83%, 58%)',
  secondary_color TEXT DEFAULT 'hsl(316, 80%, 57%)',
  background_color TEXT DEFAULT 'hsl(0, 0%, 100%)',
  text_color TEXT DEFAULT 'hsl(220, 13%, 18%)',
  accent_color TEXT DEFAULT 'hsl(220, 13%, 95%)',
  
  -- Layout Configuration
  carousel_style TEXT DEFAULT 'standard' CHECK (carousel_style IN ('standard', 'fullwidth', 'contained')),
  category_layout TEXT DEFAULT 'grid' CHECK (category_layout IN ('grid', 'list', 'carousel')),
  
  -- Default Sections (JSON array of section configs)
  default_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Typography
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_template_configs ENABLE ROW LEVEL SECURITY;

-- Super admins can manage plan template configs
CREATE POLICY "Super admins can manage plan template configs"
ON public.plan_template_configs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default configs for each plan
INSERT INTO public.plan_template_configs (plan_type, primary_color, secondary_color, background_color, text_color, accent_color)
VALUES 
  ('basic', 'hsl(220, 13%, 18%)', 'hsl(220, 9%, 46%)', 'hsl(0, 0%, 100%)', 'hsl(220, 13%, 18%)', 'hsl(220, 13%, 95%)'),
  ('silver', 'hsl(262, 83%, 58%)', 'hsl(316, 80%, 57%)', 'hsl(0, 0%, 100%)', 'hsl(220, 13%, 18%)', 'hsl(220, 13%, 95%)'),
  ('gold', 'hsl(43, 96%, 56%)', 'hsl(27, 96%, 61%)', 'hsl(0, 0%, 100%)', 'hsl(220, 13%, 18%)', 'hsl(0, 0%, 98%)');

-- Create trigger for updated_at
CREATE TRIGGER update_plan_template_configs_updated_at
BEFORE UPDATE ON public.plan_template_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();