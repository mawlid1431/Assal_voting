# Database Setup Guide - Fix 404 Errors

## Problem
You're getting 404 errors because the `voters` and `candidate_rankings` tables don't exist in your Supabase database yet.

Error message: `"Could not find the table 'public.candidate_rankings' in the schema cache"`

## Solution - Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `xznkvynxevkfycksyuct`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration Script
1. Click "New Query" button
2. Copy the entire content from `data/MIGRATION_VOTING_TABLES.sql`
3. Paste it into the SQL Editor
4. Click "Run" button (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created
After running the migration, verify the tables exist:

```sql
-- Run this query to check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('voters', 'candidate_rankings');
```

You should see both tables listed.

### Step 4: Check Table Structure
Verify the tables have the correct columns:

```sql
-- Check voters table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'voters';

-- Check candidate_rankings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidate_rankings';
```

### Step 5: Refresh Your App
1. Go back to your React app
2. Refresh the page (F5 or Ctrl+R)
3. The 404 errors should be gone!

## What the Migration Creates

### Tables:
1. **voters** - Stores voter information
   - id (UUID, Primary Key)
   - full_name (TEXT)
   - email (TEXT, UNIQUE)
   - phone_number (TEXT)
   - created_at (TIMESTAMP)

2. **candidate_rankings** - Stores votes
   - id (UUID, Primary Key)
   - voter_id (UUID, Foreign Key → voters)
   - candidate_id (UUID, Foreign Key → voting_positions)
   - position_slot (TEXT: 'president', 'vice_president', 'treasurer')
   - rank_order (INTEGER)
   - rating (DECIMAL)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

### Security:
- Row Level Security (RLS) enabled
- Public read access for all users
- Public insert/update access (for voting)

### Performance:
- Indexes on voter_id, candidate_id, position_slot, and email

## Alternative: Quick Copy-Paste

If you prefer, here's the complete SQL to copy-paste directly:

```sql
-- Create Voters table
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Candidate Rankings table
CREATE TABLE IF NOT EXISTS candidate_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES voting_positions(id) ON DELETE CASCADE,
  position_slot TEXT NOT NULL,
  rank_order INTEGER NOT NULL,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(voter_id, candidate_id, position_slot)
);

-- Enable RLS
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;

-- Policies for voters
CREATE POLICY "Enable read access for all users" ON voters FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON voters FOR INSERT WITH CHECK (true);

-- Policies for candidate_rankings
CREATE POLICY "Enable read access for all users" ON candidate_rankings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON candidate_rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON candidate_rankings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON candidate_rankings FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_voter ON candidate_rankings(voter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_candidate ON candidate_rankings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_position ON candidate_rankings(position_slot);
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);
```

## Troubleshooting

### If you get "relation already exists" error:
This means the tables already exist. You can skip the migration or drop and recreate:

```sql
-- Drop existing tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS candidate_rankings CASCADE;
DROP TABLE IF EXISTS voters CASCADE;

-- Then run the migration again
```

### If you get "permission denied" error:
Make sure you're logged in as the project owner or have admin access.

### If policies fail to create:
Drop existing policies first:

```sql
DROP POLICY IF EXISTS "Enable read access for all users" ON voters;
DROP POLICY IF EXISTS "Enable insert for all users" ON voters;
-- (repeat for all policies)
```

## After Migration

Once the migration is complete:
1. ✅ Voting system will work
2. ✅ Users can submit votes
3. ✅ Live voting results will display
4. ✅ No more 404 errors

## Test the System

After migration, test by:
1. Click "Vote Now" button
2. Fill in your information
3. Select candidates
4. Submit vote
5. Check if vote appears in database:

```sql
SELECT * FROM voters;
SELECT * FROM candidate_rankings;
```

---

**Need Help?**
If you encounter any issues, check the Supabase logs in the Dashboard → Logs section.
