-- =====================================================
-- MIGRATION: Add Voting System Tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create Voters table
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Candidate Rankings table (stores position assignments and ratings)
CREATE TABLE IF NOT EXISTS candidate_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES voting_positions(id) ON DELETE CASCADE,
  position_slot TEXT NOT NULL, -- 'president', 'vice_president', 'treasurer'
  rank_order INTEGER NOT NULL, -- 1, 2, 3 for multiple candidates in same position
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10), -- Rating out of 10
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(voter_id, candidate_id, position_slot)
);

-- Enable RLS for new tables
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON voters;
DROP POLICY IF EXISTS "Enable insert for all users" ON voters;
DROP POLICY IF EXISTS "Enable read access for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable insert for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable update for all users" ON candidate_rankings;
DROP POLICY IF EXISTS "Enable delete for all users" ON candidate_rankings;

-- Policies for voters
CREATE POLICY "Enable read access for all users" ON voters
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON voters
  FOR INSERT WITH CHECK (true);

-- Policies for candidate_rankings
CREATE POLICY "Enable read access for all users" ON candidate_rankings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON candidate_rankings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON candidate_rankings
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON candidate_rankings
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_voter ON candidate_rankings(voter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_candidate ON candidate_rankings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_position ON candidate_rankings(position_slot);
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- You can now use the voting system!
-- Tables created: voters, candidate_rankings
-- =====================================================
