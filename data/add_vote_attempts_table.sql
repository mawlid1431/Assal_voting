-- =====================================================
-- Add Vote Attempts History Table
-- Tracks all voting attempts (successful and rejected)
-- =====================================================

-- Create Vote Attempts table
CREATE TABLE IF NOT EXISTS vote_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  attempt_status TEXT NOT NULL, -- 'success', 'rejected_duplicate_email', 'rejected_duplicate_phone', 'rejected_already_voted'
  rejection_reason TEXT, -- Detailed reason if rejected
  existing_voter_id UUID REFERENCES voters(id), -- If duplicate, reference to existing voter
  ip_address TEXT, -- Optional: track IP address
  user_agent TEXT, -- Optional: track browser/device
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE vote_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for vote_attempts (read-only for public, insert for all)
CREATE POLICY "Enable read access for authenticated users" ON vote_attempts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON vote_attempts
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vote_attempts_email ON vote_attempts(email);
CREATE INDEX IF NOT EXISTS idx_vote_attempts_phone ON vote_attempts(phone_number);
CREATE INDEX IF NOT EXISTS idx_vote_attempts_status ON vote_attempts(attempt_status);
CREATE INDEX IF NOT EXISTS idx_vote_attempts_created ON vote_attempts(created_at DESC);

-- =====================================================
-- View to see all attempts with details
-- =====================================================
CREATE OR REPLACE VIEW vote_attempts_summary AS
SELECT 
    va.id,
    va.full_name,
    va.email,
    va.phone_number,
    va.attempt_status,
    va.rejection_reason,
    va.created_at,
    v.full_name as existing_voter_name,
    v.email as existing_voter_email,
    CASE 
        WHEN va.attempt_status = 'success' THEN '✅ Successful'
        WHEN va.attempt_status LIKE 'rejected%' THEN '❌ Rejected'
        ELSE '⚠️ Unknown'
    END as status_icon
FROM vote_attempts va
LEFT JOIN voters v ON va.existing_voter_id = v.id
ORDER BY va.created_at DESC;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Now all voting attempts will be logged!
-- =====================================================
