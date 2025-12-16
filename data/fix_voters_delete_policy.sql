-- Fix RLS policies to allow deleting voters and their votes
-- This ensures admins can delete voters from the admin panel

-- First, disable RLS temporarily to clean up
ALTER TABLE voters DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for voters
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'voters') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON voters';
    END LOOP;
END $$;

-- Drop ALL existing policies for candidate_rankings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'candidate_rankings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON candidate_rankings';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;

-- Create new policies for voters (allow all operations for everyone)
CREATE POLICY "voters_select_policy" ON voters
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "voters_insert_policy" ON voters
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "voters_update_policy" ON voters
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "voters_delete_policy" ON voters
  FOR DELETE TO anon, authenticated USING (true);

-- Create new policies for candidate_rankings (allow all operations for everyone)
CREATE POLICY "rankings_select_policy" ON candidate_rankings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "rankings_insert_policy" ON candidate_rankings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "rankings_update_policy" ON candidate_rankings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "rankings_delete_policy" ON candidate_rankings
  FOR DELETE TO anon, authenticated USING (true);

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('voters', 'candidate_rankings')
ORDER BY tablename, policyname;
