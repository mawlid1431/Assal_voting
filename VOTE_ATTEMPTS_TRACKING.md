# 📊 Vote Attempts Tracking & History

## Overview

The system now tracks **ALL voting attempts** including:
- ✅ Successful votes
- ❌ Rejected duplicate attempts
- 📝 Complete history with timestamps
- 🔍 Detailed rejection reasons

---

## What Gets Logged

### Every Attempt Records:
1. **User Information**
   - Full name
   - Email address
   - Phone number

2. **Attempt Status**
   - `success` - Vote was accepted
   - `rejected_already_voted` - User already voted
   - `rejected_duplicate_email` - Email already used
   - `rejected_duplicate_phone` - Phone already used

3. **Additional Details**
   - Rejection reason (if rejected)
   - Reference to existing voter (if duplicate)
   - Timestamp of attempt
   - IP address (optional)
   - User agent/browser (optional)

---

## Database Setup

### Run This Migration:

```sql
-- See: data/add_vote_attempts_table.sql
-- Creates vote_attempts table
```

**In Supabase SQL Editor:**
1. Open SQL Editor
2. Copy content from `data/add_vote_attempts_table.sql`
3. Click "Run"
4. Verify table created

---

## How It Works

### Scenario 1: First Time Voter (Success)
```
User: John Doe
Email: john@example.com
Phone: +1234567890

1. User fills form
2. System checks → No previous vote
3. User selects candidates
4. User submits vote
5. ✅ Vote saved
6. 📝 Logged as: attempt_status = 'success'
```

**Database Record:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "attempt_status": "success",
  "rejection_reason": null,
  "existing_voter_id": "uuid-of-john",
  "created_at": "2024-12-15 10:30:00"
}
```

### Scenario 2: Duplicate Attempt (Rejected)
```
User: Jane Smith (trying to use John's email)
Email: john@example.com  ← Already used!
Phone: +9876543210

1. User fills form
2. System checks → Email already voted!
3. ❌ Alert shown
4. 📝 Logged as: attempt_status = 'rejected_already_voted'
5. User cannot proceed
```

**Database Record:**
```json
{
  "full_name": "Jane Smith",
  "email": "john@example.com",
  "phone_number": "+9876543210",
  "attempt_status": "rejected_already_voted",
  "rejection_reason": "User attempted to vote again. Original vote by John Doe (john@example.com) on 12/15/2024, 10:30:00 AM",
  "existing_voter_id": "uuid-of-john",
  "created_at": "2024-12-15 11:45:00"
}
```

---

## View Attempts History

### Quick View - All Attempts:
```sql
SELECT 
    full_name,
    email,
    phone_number,
    attempt_status,
    created_at
FROM vote_attempts
ORDER BY created_at DESC
LIMIT 50;
```

### Find Duplicate Attempts:
```sql
SELECT 
    full_name,
    email,
    phone_number,
    rejection_reason,
    created_at
FROM vote_attempts
WHERE attempt_status LIKE 'rejected%'
ORDER BY created_at DESC;
```

### Count by Status:
```sql
SELECT 
    attempt_status,
    COUNT(*) as count
FROM vote_attempts
GROUP BY attempt_status;
```

**Example Output:**
```
attempt_status              | count
----------------------------|------
success                     | 150
rejected_already_voted      | 25
rejected_duplicate_email    | 10
rejected_duplicate_phone    | 5
```

---

## Admin Dashboard Queries

### 1. Quick Statistics:
```sql
SELECT 
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) as rejected,
    ROUND(
        COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as success_rate
FROM vote_attempts;
```

### 2. Find Suspicious Activity:
```sql
-- Users trying multiple times
SELECT 
    email,
    COUNT(*) as attempts,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) as rejected
FROM vote_attempts
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY attempts DESC;
```

### 3. Recent Activity (Last Hour):
```sql
SELECT 
    full_name,
    email,
    attempt_status,
    created_at
FROM vote_attempts
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### 4. Daily Summary:
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) as rejected
FROM vote_attempts
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## API Functions

### Log an Attempt:
```typescript
await voteAttemptsAPI.logAttempt({
    full_name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    attempt_status: 'success',
    rejection_reason: undefined,
    existing_voter_id: voterId
});
```

### Get Attempts by Email:
```typescript
const attempts = await voteAttemptsAPI.getAttemptsByEmail('john@example.com');
console.log(attempts); // Array of all attempts with this email
```

### Get Attempts by Phone:
```typescript
const attempts = await voteAttemptsAPI.getAttemptsByPhone('+1234567890');
console.log(attempts); // Array of all attempts with this phone
```

### Get All Attempts:
```typescript
const allAttempts = await voteAttemptsAPI.getAllAttempts(100); // Last 100 attempts
```

### Get Statistics:
```typescript
const stats = await voteAttemptsAPI.getAttemptStats();
console.log(stats);
// {
//   total: 200,
//   successful: 150,
//   rejected: 50,
//   rejectedDuplicateEmail: 20,
//   rejectedDuplicatePhone: 15,
//   rejectedAlreadyVoted: 15
// }
```

---

## Use Cases

### 1. Fraud Detection
Monitor for suspicious patterns:
- Same person trying multiple emails
- Multiple attempts from same IP
- Rapid-fire attempts
- Pattern of rejections

### 2. User Support
Help users who claim they can't vote:
- Check their attempt history
- See if they already voted
- Verify their information
- Provide proof of vote

### 3. Analytics
Understand voting behavior:
- Peak voting times
- Success vs rejection rates
- Common rejection reasons
- User engagement patterns

### 4. Audit Trail
Complete record for:
- Election integrity
- Dispute resolution
- Compliance requirements
- Historical analysis

---

## Security & Privacy

### What's Logged:
✅ Name, email, phone (necessary for voting)
✅ Attempt status and reason
✅ Timestamps
✅ References to existing voters

### What's NOT Logged (Yet):
❌ IP addresses (optional, can be added)
❌ Browser/device info (optional, can be added)
❌ Passwords (we don't use passwords)
❌ Voting choices (stored separately)

### Data Retention:
- Keep all attempts for audit trail
- Can delete old attempts after election
- Successful votes kept permanently
- Rejected attempts can be cleaned up

---

## Monitoring & Alerts

### Set Up Alerts For:

1. **High Rejection Rate**
   ```sql
   -- If rejection rate > 20%
   SELECT 
       COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) * 100.0 / COUNT(*)
   FROM vote_attempts
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

2. **Suspicious Activity**
   ```sql
   -- Multiple attempts from same email in short time
   SELECT email, COUNT(*)
   FROM vote_attempts
   WHERE created_at > NOW() - INTERVAL '5 minutes'
   GROUP BY email
   HAVING COUNT(*) > 3;
   ```

3. **System Issues**
   ```sql
   -- No successful votes in last hour (might indicate problem)
   SELECT COUNT(*)
   FROM vote_attempts
   WHERE attempt_status = 'success'
     AND created_at > NOW() - INTERVAL '1 hour';
   ```

---

## Export Data

### Export to CSV:
```sql
COPY (
    SELECT 
        full_name,
        email,
        phone_number,
        attempt_status,
        rejection_reason,
        created_at
    FROM vote_attempts
    ORDER BY created_at DESC
) TO '/path/to/vote_attempts.csv' WITH CSV HEADER;
```

### Export for Analysis:
```sql
SELECT 
    va.*,
    v.full_name as existing_voter_name,
    v.email as existing_voter_email
FROM vote_attempts va
LEFT JOIN voters v ON va.existing_voter_id = v.id
ORDER BY va.created_at DESC;
```

---

## Maintenance

### Clean Up Old Attempts:
```sql
-- Delete attempts older than 90 days
DELETE FROM vote_attempts 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Archive Old Data:
```sql
-- Create archive table
CREATE TABLE vote_attempts_archive AS
SELECT * FROM vote_attempts
WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete archived data from main table
DELETE FROM vote_attempts
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Files Reference

### Database:
- `data/add_vote_attempts_table.sql` - Create table migration
- `data/view_vote_attempts.sql` - Query examples

### Code:
- `src/lib/api.ts` - voteAttemptsAPI functions
- `components/SimpleVotingModal.tsx` - Logging implementation

### Documentation:
- `VOTE_ATTEMPTS_TRACKING.md` - This file
- `DUPLICATE_PREVENTION.md` - Duplicate prevention details

---

## Summary

✅ **All voting attempts are now logged**
✅ **Successful and rejected attempts tracked**
✅ **Complete audit trail maintained**
✅ **Detailed rejection reasons stored**
✅ **Easy to query and analyze**
✅ **Helps detect fraud and support users**

**Status: Fully Implemented!** 📊
