-- Fix vote_attempts table to allow deleting voters
-- Set to NULL instead of CASCADE so we keep the history

-- Drop the existing foreign key constraint
ALTER TABLE vote_attempts 
DROP CONSTRAINT IF EXISTS vote_attempts_existing_voter_id_fkey;

-- Add the foreign key constraint back WITH SET NULL
-- This keeps the vote attempt record but removes the reference
ALTER TABLE vote_attempts 
ADD CONSTRAINT vote_attempts_existing_voter_id_fkey 
FOREIGN KEY (existing_voter_id) 
REFERENCES voters(id) 
ON DELETE SET NULL;

-- Verify the constraint is working
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'vote_attempts';
