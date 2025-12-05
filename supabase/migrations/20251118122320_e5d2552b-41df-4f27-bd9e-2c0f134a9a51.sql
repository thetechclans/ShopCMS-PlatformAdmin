-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS policies for category images bucket
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND auth.role() = 'authenticated'
);

-- Add media configuration to profiles table
ALTER TABLE public.profiles
ADD COLUMN media_config JSONB DEFAULT jsonb_build_object(
  'provider', 'supabase',
  'bucket', 'category-images',
  'maxFileSize', 5242880,
  'allowedTypes', ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);