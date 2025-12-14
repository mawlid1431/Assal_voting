# 🚀 Quick Reference Card

## System Status: ✅ WORKING

---

## For Users

### How to Vote:
1. Click **"Vote Now"** button
2. Enter name, email, phone
3. Click candidates to select
4. Review and submit
5. Done! ✅

### View Results:
- Scroll to "Live Voting Leaderboard"
- See real-time vote counts
- Updates every 5 seconds

---

## For Developers

### Check if Votes Are Saving:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM voters ORDER BY created_at DESC LIMIT 5;
SELECT * FROM candidate_rankings ORDER BY created_at DESC LIMIT 5;
```

### API Usage:
```typescript
// Create voter and submit vote
const voter = await votersAPI.create({ full_name, email, phone_number });
await rankingsAPI.submitRankings(voter.id, rankings);

// Get results
const allVotes = await rankingsAPI.getAllRankings();
const stats = await rankingsAPI.getCandidateStats(candidateId);
```

### Key Files:
- `components/SimpleVotingModal.tsx` - Voting UI
- `components/LiveVoting.tsx` - Results display
- `src/lib/api.ts` - API functions
- `data/check_votes.sql` - Verify votes

---

## Common Issues

### 404 Error (Tables Not Found)
```bash
# Run this SQL in Supabase:
# See: data/MIGRATION_VOTING_TABLES.sql
```

### 406 Error (Not Acceptable)
```bash
# Harmless! Vote still works.
# Hard refresh: Ctrl+Shift+R
```

### Vote Not Saving
```bash
# Check:
1. Supabase connection (.env file)
2. Tables exist (run migration)
3. RLS policies enabled
```

---

## Quick Commands

### Verify Setup:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('voters', 'candidate_rankings');
```

### Count Votes:
```sql
-- Total votes
SELECT COUNT(*) FROM candidate_rankings;

-- Votes per candidate
SELECT vp.name, COUNT(cr.id) as votes
FROM voting_positions vp
LEFT JOIN candidate_rankings cr ON vp.id = cr.candidate_id
GROUP BY vp.name
ORDER BY votes DESC;
```

### Recent Activity:
```sql
-- Last 10 votes
SELECT v.full_name, vp.name as voted_for, cr.created_at
FROM candidate_rankings cr
JOIN voters v ON cr.voter_id = v.id
JOIN voting_positions vp ON cr.candidate_id = vp.id
ORDER BY cr.created_at DESC
LIMIT 10;
```

---

## Documentation

| File | Purpose |
|------|---------|
| `README_VOTING.md` | Complete guide |
| `FIX_404_ERRORS.md` | Fix database errors |
| `KNOWN_ISSUES.md` | Troubleshooting |
| `VOTING_SYSTEM_STATUS.md` | System status |
| `data/check_votes.sql` | Verify votes |

---

## Database Schema

```
voters
├── id (UUID)
├── full_name
├── email (UNIQUE)
├── phone_number
└── created_at

candidate_rankings
├── id (UUID)
├── voter_id → voters.id
├── candidate_id → voting_positions.id
├── position_slot (president/vice_president/treasurer)
├── rank_order
├── rating
├── created_at
└── updated_at
```

---

## Testing Checklist

- [ ] Click "Vote Now" button
- [ ] Enter voter information
- [ ] Select candidates
- [ ] Submit vote
- [ ] See success message
- [ ] Check database for vote
- [ ] View live results
- [ ] Verify vote count increased

---

## Support

**Supabase Dashboard:** https://supabase.com/dashboard

**Project URL:** https://xznkvynxevkfycksyuct.supabase.co

**Status:** 🟢 All systems operational

---

**Last Updated:** December 2024
