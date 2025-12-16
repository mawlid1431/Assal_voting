-- Fix RLS policies to allow anonymous access for all tables
-- This ensures the frontend can read data without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON voting_positions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON voting_positions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON voting_positions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON voting_positions;

DROP POLICY IF EXISTS "Enable read access for all users" ON leadership;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leadership;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON leadership;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON leadership;

DROP POLICY IF EXISTS "Enable read access for all users" ON voters;
DROP POLICY IF EXISTS "Enable insert for all users" ON voters;

DROP POLICY IF EXISTS "Enable read access for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable insert for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable update for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable delete for all users" ON candidate_rankings;

-- Create new policies that explicitly allow anonymous access

-- Voting Positions policies
CREATE POLICY "Allow anonymous read" ON voting_positions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON voting_positions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON voting_positions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON voting_positions
  FOR DELETE TO authenticated USING (true);

-- Leadership policies
CREATE POLICY "Allow anonymous read" ON leadership
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON leadership
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON leadership
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON leadership
  FOR DELETE TO authenticated USING (true);

-- Voters policies (allow anonymous to create voters and read)
CREATE POLICY "Allow anonymous read" ON voters
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anonymous insert" ON voters
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Candidate Rankings policies (allow anonymous to submit votes)
CREATE POLICY "Allow anonymous read" ON candidate_rankings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anonymous insert" ON candidate_rankings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON candidate_rankings
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow anonymous delete" ON candidate_rankings
  FOR DELETE TO anon, authenticated USING (true);
