-- =====================================================
-- Create Permanent Voting History Table
-- This table keeps a permanent record of all voters
-- Even if admin deletes them, they can't vote again!
-- =====================================================

-- Create permanent voting history table
CREATE TABLE IF NOT EXISTS voting_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE, -- Track when admin deleted them
  deleted_by TEXT, -- Track which admin deleted them
  original_voter_id UUID, -- Reference to original voter (may be deleted)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create unique indexes to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_voting_history_email ON voting_history(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voting_history_phone ON voting_history(phone_number);
CREATE INDEX IF NOT EXISTS idx_voting_history_name ON voting_history(full_name);
CREATE INDEX IF NOT EXISTS idx_voting_history_voted_at ON voting_history(voted_at DESC);

-- Enable RLS
ALTER TABLE voting_history ENABLE ROW LEVEL SECURITY;

-- Policies for voting_history (read for authenticated, insert/update for all)
CREATE POLICY "voting_history_select_policy" ON voting_history
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "voting_history_insert_policy" ON voting_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "voting_history_update_policy" ON voting_history
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- Create function to automatically add to history when voter is created
-- =====================================================
CREATE OR REPLACE FUNCTION add_voter_to_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into voting_history when a new voter is created
  INSERT INTO voting_history (
    full_name,
    email,
    phone_number,
    voted_at,
    original_voter_id
  ) VALUES (
    NEW.full_name,
    NEW.email,
    NEW.phone_number,
    NEW.created_at,
    NEW.id
  )
  ON CONFLICT (email) DO NOTHING; -- Skip if already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add voters to history
DROP TRIGGER IF EXISTS trigger_add_voter_to_history ON voters;
CREATE TRIGGER trigger_add_voter_to_history
  AFTER INSERT ON voters
  FOR EACH ROW
  EXECUTE FUNCTION add_voter_to_history();

-- =====================================================
-- Create function to mark as deleted in history when voter is deleted
-- =====================================================
CREATE OR REPLACE FUNCTION mark_voter_deleted_in_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Update voting_history to mark as deleted
  UPDATE voting_history
  SET 
    deleted_at = NOW(),
    deleted_by = current_user
  WHERE email = OLD.email OR phone_number = OLD.phone_number;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to mark voters as deleted in history
DROP TRIGGER IF EXISTS trigger_mark_voter_deleted ON voters;
CREATE TRIGGER trigger_mark_voter_deleted
  BEFORE DELETE ON voters
  FOR EACH ROW
  EXECUTE FUNCTION mark_voter_deleted_in_history();

-- =====================================================
-- Migrate existing voters to voting_history
-- =====================================================
INSERT INTO voting_history (
  full_name,
  email,
  phone_number,
  voted_at,
  original_voter_id
)
SELECT 
  full_name,
  email,
  phone_number,
  created_at,
  id
FROM voters
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMPLETE! Now voters are permanently tracked
-- Even if deleted, they can't vote again!
-- =====================================================

SELECT 'Voting history table created successfully!' as status;
