-- Allow public read access to published products and their media

-- Products: public can view published products
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON public.products;
CREATE POLICY "Published products are viewable by everyone"
ON public.products
FOR SELECT
USING (is_published = true);

-- Product images: public can view images for published products
DROP POLICY IF EXISTS "Images of published products are viewable by everyone" ON public.product_images;
CREATE POLICY "Images of published products are viewable by everyone"
ON public.product_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.is_published = true
  )
);

-- Product attributes: public can view attributes for published products
DROP POLICY IF EXISTS "Attributes of published products are viewable by everyone" ON public.product_attributes;
CREATE POLICY "Attributes of published products are viewable by everyone"
ON public.product_attributes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_attributes.product_id
      AND p.is_published = true
  )
);

-- Product videos: public can view videos for published products
DROP POLICY IF EXISTS "Videos of published products are viewable by everyone" ON public.product_videos;
CREATE POLICY "Videos of published products are viewable by everyone"
ON public.product_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_videos.product_id
      AND p.is_published = true
  )
);
