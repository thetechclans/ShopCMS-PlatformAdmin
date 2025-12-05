-- Allow public read access to profiles for WhatsApp number
-- This enables visitors to see the shop's WhatsApp contact on product pages
CREATE POLICY "Public can view shop contact info"
ON profiles
FOR SELECT
TO anon
USING (true);