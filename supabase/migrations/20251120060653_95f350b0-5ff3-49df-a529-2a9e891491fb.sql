-- Create navbar_config table for global navigation settings
CREATE TABLE public.navbar_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  logo_url TEXT,
  logo_link_to_home BOOLEAN DEFAULT true,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  sticky_scroll BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create footer_config table for global footer settings
CREATE TABLE public.footer_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT,
  tagline TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  working_hours TEXT,
  copyright_text TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create social_links table for footer social media links
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create footer_quick_links table for footer navigation
CREATE TABLE public.footer_quick_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.navbar_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_quick_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for navbar_config
CREATE POLICY "Shop owners can manage their navbar config"
  ON public.navbar_config
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Published navbar config is viewable by everyone"
  ON public.navbar_config
  FOR SELECT
  USING (is_published = true);

-- RLS Policies for footer_config
CREATE POLICY "Shop owners can manage their footer config"
  ON public.footer_config
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Published footer config is viewable by everyone"
  ON public.footer_config
  FOR SELECT
  USING (is_published = true);

-- RLS Policies for social_links
CREATE POLICY "Shop owners can manage their social links"
  ON public.social_links
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Active social links are viewable by everyone"
  ON public.social_links
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for footer_quick_links
CREATE POLICY "Shop owners can manage their footer quick links"
  ON public.footer_quick_links
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Active footer quick links are viewable by everyone"
  ON public.footer_quick_links
  FOR SELECT
  USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_navbar_config_updated_at
  BEFORE UPDATE ON public.navbar_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_footer_config_updated_at
  BEFORE UPDATE ON public.footer_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();