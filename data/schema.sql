-- Create Voting Positions table
CREATE TABLE IF NOT EXISTS voting_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Leadership & Top Management table
CREATE TABLE IF NOT EXISTS leadership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE voting_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;

-- Create policies for voting_positions
CREATE POLICY "Enable read access for all users" ON voting_positions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON voting_positions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON voting_positions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON voting_positions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for leadership
CREATE POLICY "Enable read access for all users" ON leadership
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON leadership
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON leadership
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON leadership
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for images (public bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-images', 'candidate-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for candidate-images bucket (allow public access)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'candidate-images');

CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'candidate-images');

CREATE POLICY "Anyone can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'candidate-images');

CREATE POLICY "Anyone can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'candidate-images');
