-- Drop existing policy if it exists and create a new one for public page access
DROP POLICY IF EXISTS "Published pages are viewable by everyone" ON public.pages;

CREATE POLICY "Published pages are viewable by everyone"
ON public.pages
FOR SELECT
USING (is_published = true);