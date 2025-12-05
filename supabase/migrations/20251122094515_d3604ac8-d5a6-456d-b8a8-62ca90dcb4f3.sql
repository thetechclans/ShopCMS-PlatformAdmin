-- WEEK 1: CRITICAL SECURITY FIXES

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'shop_owner');

-- 2. Create user_roles table (NEVER store roles in profiles table)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS: Only super_admins can view user roles
CREATE POLICY "Super admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 5. RLS: Only super_admins can manage roles
CREATE POLICY "Super admins can manage user roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 6. Fix profiles table data exposure - Drop overly permissive policy
DROP POLICY IF EXISTS "Public can view shop contact info" ON public.profiles;

-- 7. Add database constraints for validation
ALTER TABLE public.profiles
ADD CONSTRAINT whatsapp_number_format 
CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\d{10,15}$');

ALTER TABLE public.carousel_slides
ADD CONSTRAINT cta_link_format
CHECK (cta_link IS NULL OR cta_link ~ '^https?://');

-- 8. Create view with only intended public fields
CREATE OR REPLACE VIEW public.public_shop_info AS
SELECT 
  id,
  shop_name,
  shop_description,
  whatsapp_number,
  favicon_url,
  site_title
FROM public.profiles;

-- 9. Grant SELECT on view to anonymous users
GRANT SELECT ON public.public_shop_info TO anon;
GRANT SELECT ON public.public_shop_info TO authenticated;

-- WEEK 3: MEDIUM PRIORITY FIXES

-- 10. Fix handle_updated_at function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 11. Create audit logs table for security monitoring
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 12. RLS: Only super_admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 13. Audit log function
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$;

-- 14. Add audit trigger to user_roles table
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_audit();