-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create storage bucket if it doesn't exist (make it public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-images', 'candidate-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to view images (public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-images');

-- Allow anyone to upload images (public insert)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-images');

-- Allow anyone to update images (public update)
CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-images');

-- Allow anyone to delete images (public delete)
CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-images');
