# 🛡️ Duplicate Vote Prevention

## Overview

The system now prevents users from voting multiple times using the same email or phone number.

---

## How It Works

### Step 1: User Enters Information
When a user enters their name, email, and phone number and clicks "Next":

1. **System checks database** for existing votes with that email OR phone number
2. **If found**: Shows alert message and prevents voting
3. **If not found**: Allows user to proceed to candidate selection

### Step 2: Before Final Submission
Before submitting the vote, the system checks again:

1. **Double-checks** if user has already voted
2. **If found**: Shows alert and cancels submission
3. **If not found**: Saves the vote

---

## What Users See

### If They Try to Vote Again:

**Alert Message:**
```
⚠️ Already Voted!

This email or phone number has already been used to vote.

Name: John Doe
Email: john@example.com
Phone: +1234567890
Vote Date: 12/15/2024, 3:45:00 PM

Each person can only vote once to ensure fair elections.
```

---

## Prevention Methods

### 1. Email Check
- System checks if email has been used before
- Prevents same email from voting twice

### 2. Phone Number Check
- System checks if phone number has been used before
- Prevents same phone from voting twice

### 3. Combined Check
- If EITHER email OR phone matches, vote is blocked
- User cannot bypass by changing just one field

---

## Database Query

The system uses this query to check for duplicates:

```sql
SELECT 
    id,
    full_name,
    email,
    phone_number,
    candidate_rankings (id, created_at)
FROM voters
WHERE email = 'user@example.com' 
   OR phone_number = '+1234567890'
```

If the voter exists AND has candidate_rankings, they've already voted.

---

## API Function

### `votersAPI.checkIfAlreadyVoted(email, phoneNumber)`

**Parameters:**
- `email` - User's email address
- `phoneNumber` - User's phone number

**Returns:**
```typescript
{
    hasVoted: boolean,
    voter: {
        id: string,
        full_name: string,
        email: string,
        phone_number: string
    } | null,
    voteDate: string | null
}
```

**Example Usage:**
```typescript
const check = await votersAPI.checkIfAlreadyVoted(
    'user@example.com',
    '+1234567890'
);

if (check.hasVoted) {
    alert('You have already voted!');
    return;
}

// Proceed with voting...
```

---

## User Experience Flow

### First Time Voter:
1. ✅ Enter information
2. ✅ Click "Next"
3. ✅ System checks → No previous vote found
4. ✅ Proceed to candidate selection
5. ✅ Select candidates
6. ✅ Submit vote
7. ✅ Success!

### Returning Voter (Duplicate Attempt):
1. ✅ Enter same email/phone
2. ✅ Click "Next"
3. ⚠️ System checks → Previous vote found!
4. ⚠️ Alert shown with vote details
5. ❌ Cannot proceed
6. ❌ Modal stays on Step 1

---

## Security Features

### What's Protected:
- ✅ Email uniqueness
- ✅ Phone number uniqueness
- ✅ Combined email + phone check
- ✅ Vote date tracking
- ✅ Voter information display

### What's NOT Protected (Yet):
- ❌ IP address tracking
- ❌ Device fingerprinting
- ❌ Email verification
- ❌ SMS verification

---

## Bypass Prevention

### User Cannot Bypass By:
- ❌ Using same email with different phone
- ❌ Using same phone with different email
- ❌ Clearing browser cache
- ❌ Using incognito mode
- ❌ Using different browser

### User CAN Vote Again By:
- ✅ Using completely different email AND phone
- ✅ Using someone else's information (not recommended!)

---

## Admin View

### Check Who Has Voted:

```sql
-- See all voters who have submitted votes
SELECT 
    v.full_name,
    v.email,
    v.phone_number,
    COUNT(cr.id) as vote_count,
    MIN(cr.created_at) as first_vote,
    MAX(cr.created_at) as last_vote
FROM voters v
LEFT JOIN candidate_rankings cr ON v.id = cr.voter_id
GROUP BY v.id, v.full_name, v.email, v.phone_number
HAVING COUNT(cr.id) > 0
ORDER BY first_vote DESC;
```

### Find Duplicate Attempts:

```sql
-- Find voters with same email
SELECT email, COUNT(*) as count
FROM voters
GROUP BY email
HAVING COUNT(*) > 1;

-- Find voters with same phone
SELECT phone_number, COUNT(*) as count
FROM voters
GROUP BY phone_number
HAVING COUNT(*) > 1;
```

---

## Error Handling

### If Check Fails:
- System logs error to console
- Allows user to proceed (fail-open approach)
- Better to allow legitimate vote than block it

### If Database is Down:
- Check will fail gracefully
- User can still vote
- Duplicate prevention temporarily disabled

---

## Testing

### Test Scenario 1: First Vote
1. Enter: name="John", email="john@test.com", phone="123"
2. Expected: ✅ Proceeds to candidate selection
3. Expected: ✅ Vote submits successfully

### Test Scenario 2: Duplicate Email
1. Enter: name="Jane", email="john@test.com", phone="456"
2. Expected: ⚠️ Alert shown
3. Expected: ❌ Cannot proceed

### Test Scenario 3: Duplicate Phone
1. Enter: name="Jane", email="jane@test.com", phone="123"
2. Expected: ⚠️ Alert shown
3. Expected: ❌ Cannot proceed

### Test Scenario 4: Both Different
1. Enter: name="Jane", email="jane@test.com", phone="456"
2. Expected: ✅ Proceeds to candidate selection
3. Expected: ✅ Vote submits successfully

---

## Future Enhancements

### Possible Improvements:
1. **Email Verification**
   - Send confirmation email
   - Verify before allowing vote

2. **SMS Verification**
   - Send OTP to phone
   - Verify before allowing vote

3. **IP Tracking**
   - Track IP addresses
   - Limit votes per IP

4. **Device Fingerprinting**
   - Track device information
   - Prevent multiple votes from same device

5. **Admin Override**
   - Allow admin to reset votes
   - Handle legitimate duplicate cases

6. **Vote Editing**
   - Allow users to change vote within time window
   - Track vote history

---

## Configuration

### Current Settings:
- **Check on Step 1**: ✅ Enabled
- **Check on Submit**: ✅ Enabled
- **Email uniqueness**: ✅ Enforced
- **Phone uniqueness**: ✅ Enforced
- **Fail-open on error**: ✅ Enabled

### To Disable Duplicate Prevention:
Comment out the check in `SimpleVotingModal.tsx`:

```typescript
// const voteCheck = await votersAPI.checkIfAlreadyVoted(...);
// if (voteCheck.hasVoted) { ... }
```

---

## Support

### Common Questions:

**Q: What if someone uses my email to vote?**
A: Contact administrator with proof of identity.

**Q: Can I change my vote?**
A: No, votes are final once submitted.

**Q: What if I made a mistake?**
A: Contact administrator immediately.

**Q: Can I vote for someone else?**
A: No, each person must vote with their own information.

---

## Summary

✅ **Duplicate prevention is active**
✅ **Checks email and phone number**
✅ **Shows clear error messages**
✅ **Prevents multiple votes**
✅ **Tracks vote dates**
✅ **Graceful error handling**

**Status: Fully Implemented and Working!** 🛡️
