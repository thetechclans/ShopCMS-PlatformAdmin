-- Add whatsapp_number to profiles table
ALTER TABLE profiles ADD COLUMN whatsapp_number text;

-- Add whatsapp_enabled to products table
ALTER TABLE products ADD COLUMN whatsapp_enabled boolean DEFAULT false;