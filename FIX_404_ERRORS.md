# 🔧 Fix 404 Errors - Quick Guide

## The Problem
Your app is showing these errors:
```
Failed to load resource: the server responded with a status of 404
Could not find the table 'public.candidate_rankings' in the schema cache
Could not find the table 'public.voters' in the schema cache
```

## The Solution (5 Minutes)

### ⚡ Quick Fix Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left menu

2. **Copy This SQL**
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

3. **Run the SQL**
   - Paste the SQL into the editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

4. **Refresh Your App**
   - Go back to your React app
   - Press F5 or Ctrl+R to refresh
   - ✅ Errors should be gone!

## What This Does

Creates 2 new tables:
- **voters** - Stores people who vote (name, email, phone)
- **candidate_rankings** - Stores the actual votes

## Verify It Worked

After running the SQL, check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('voters', 'candidate_rankings');
```

You should see both tables listed.

## Test the Voting System

1. Click "Vote Now" button in your app
2. Fill in your information
3. Select candidates
4. Submit vote
5. Check the database:

```sql
-- See all voters
SELECT * FROM voters;

-- See all votes
SELECT * FROM candidate_rankings;
```

## Still Getting Errors?

### Error: "relation already exists"
✅ Good! Tables already exist. Just refresh your app.

### Error: "permission denied"
❌ Make sure you're logged in as project owner.

### Error: "foreign key violation"
❌ Make sure `voting_positions` table exists first.
Run the main schema.sql file first, then this migration.

## Files Reference

- `data/MIGRATION_VOTING_TABLES.sql` - Full migration file
- `DATABASE_SETUP_GUIDE.md` - Detailed guide
- `data/schema.sql` - Complete database schema

---

**After this fix:**
- ✅ Voting system works
- ✅ Live results display
- ✅ No more 404 errors
- ✅ Users can vote successfully
