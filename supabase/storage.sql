-- GoCab Storage Buckets
-- Run in Supabase SQL Editor

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('driver-documents', 'driver-documents', false),
  ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars (public read, authenticated insert)
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for driver documents (private - owner + admin)
CREATE POLICY "Owner reads own docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'driver-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner uploads docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'driver-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for vehicle images (public read)
CREATE POLICY "Public read vehicle images" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Drivers upload vehicle images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);
