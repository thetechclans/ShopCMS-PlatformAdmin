-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Create index for email lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Update the handle_new_user trigger to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, shop_name, email, tenant_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'shop_name', 'My Shop'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'tenant_id')::uuid, (SELECT id FROM tenants WHERE status = 'active' LIMIT 1))
  );
  RETURN new;
END;
$function$;