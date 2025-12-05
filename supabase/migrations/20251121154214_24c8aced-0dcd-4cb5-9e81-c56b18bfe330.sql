-- Add favicon and site title fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS favicon_url text,
ADD COLUMN IF NOT EXISTS site_title text DEFAULT 'My Shop';