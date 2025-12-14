-- Fix Table Policies (voting_positions and leadership)
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON voting_positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON voting_positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON voting_positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON voting_positions;

DROP POLICY IF EXISTS "Enable read access for all users" ON leadership;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leadership;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON leadership;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON leadership;

-- Create new policies that allow public access (no authentication required)
-- Voting Positions Policies
CREATE POLICY "Public read access" ON voting_positions
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON voting_positions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON voting_positions
  FOR UPDATE USING (true);

CREATE POLICY "Public delete access" ON voting_positions
  FOR DELETE USING (true);

-- Leadership Policies
CREATE POLICY "Public read access" ON leadership
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON leadership
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access" ON leadership
  FOR UPDATE USING (true);

CREATE POLICY "Public delete access" ON leadership
  FOR DELETE USING (true);

-- Fix Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;

-- Make storage bucket public
UPDATE storage.buckets SET public = true WHERE id = 'candidate-images';

-- Create storage policies for public access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-images');

CREATE POLICY "Public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-images');

CREATE POLICY "Public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-images');

CREATE POLICY "Public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-images');
