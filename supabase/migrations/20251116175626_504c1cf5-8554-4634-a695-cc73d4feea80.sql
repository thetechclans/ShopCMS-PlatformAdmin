-- Update the trigger to handle shop_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, shop_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'shop_name', 'My Shop')
  );
  RETURN new;
END;
$$;