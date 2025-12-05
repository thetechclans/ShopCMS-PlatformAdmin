-- Allow public read access to active carousel slides
DROP POLICY IF EXISTS "Active carousel slides are viewable by everyone" ON public.carousel_slides;
CREATE POLICY "Active carousel slides are viewable by everyone"
ON public.carousel_slides
FOR SELECT
USING (is_active = true);

-- Allow public read access to published categories
DROP POLICY IF EXISTS "Published categories are viewable by everyone" ON public.categories;
CREATE POLICY "Published categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (is_published = true);

-- Allow public read access to published menu items
DROP POLICY IF EXISTS "Published menu items are viewable by everyone" ON public.menu_items;
CREATE POLICY "Published menu items are viewable by everyone"
ON public.menu_items
FOR SELECT
USING (is_published = true);