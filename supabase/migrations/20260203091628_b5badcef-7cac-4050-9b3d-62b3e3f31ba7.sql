-- Add image_url column to vip_levels table
ALTER TABLE public.vip_levels ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a storage bucket for VIP images (public access for display)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vip-images', 'vip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload VIP images (admin only in practice)
CREATE POLICY "Allow public read access to VIP images" ON storage.objects
FOR SELECT USING (bucket_id = 'vip-images');

-- Allow authenticated users to upload to VIP images bucket
CREATE POLICY "Allow authenticated uploads to VIP images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vip-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update VIP images
CREATE POLICY "Allow authenticated updates to VIP images" ON storage.objects
FOR UPDATE USING (bucket_id = 'vip-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete VIP images
CREATE POLICY "Allow authenticated deletes from VIP images" ON storage.objects
FOR DELETE USING (bucket_id = 'vip-images' AND auth.uid() IS NOT NULL);