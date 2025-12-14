# Simple Voting System

## Overview
The new voting system provides a straightforward way for users to vote for candidates in different positions.

## Features

### 1. Vote Now Button (Hero Section)
- Prominent "Vote Now" button in the hero section
- Opens the voting modal directly

### 2. Voting Flow (3 Steps)

#### Step 1: Voter Information
- Full Name
- Phone Number
- Email Address

#### Step 2: Select Candidates
- Candidates are grouped by position:
  - **President** (Red gradient)
  - **Vice President** (Green gradient)
  - **Treasurer** (Red-Green gradient)
- Click on a candidate card to select them
- Selected candidates show a green ring and checkmark
- Click again to deselect
- Select ONE candidate per position

#### Step 3: Confirmation
- Review your information
- Review your selected candidates
- Warning: "Once submitted, your vote cannot be changed"
- Submit Vote button

#### Step 4: Success
- Confirmation message
- Auto-closes after 3 seconds

### 3. Vote from Candidate Cards
- Each candidate card has a "Vote" button
- Opens the same voting modal
- Same simple selection process

## Database Structure

### Tables Created:
1. **voters** - Stores voter information
   - id, full_name, email, phone_number, created_at

2. **candidate_rankings** - Stores votes
   - id, voter_id, candidate_id, position_slot, rank_order, rating
   - Unique constraint: one vote per voter per candidate per position

### API Functions:
- `votersAPI.create()` - Create or get voter
- `rankingsAPI.submitRankings()` - Submit votes
- `rankingsAPI.getCandidateStats()` - Get voting statistics

## How It Works

1. User clicks "Vote Now" or "Vote" button on a candidate card
2. User enters their information (Step 1)
3. User selects one candidate per position (Step 2)
4. User reviews and confirms their selections (Step 3)
5. Vote is saved to database with:
   - Voter information
   - Selected candidates
   - Position assignments
   - Default rating of 10/10

## Key Differences from Previous System

### Before (Drag & Drop):
- Complex drag-and-drop interface
- Rank multiple candidates
- Manual rating input

### Now (Simple Click):
- Click to select candidates
- One candidate per position
- Automatic rating
- Cleaner, more intuitive UI

## Files Modified/Created

### New Files:
- `components/SimpleVotingModal.tsx` - New simple voting modal
- `data/update_schema_rankings.sql` - Database schema updates

### Modified Files:
- `components/Hero.tsx` - Added "Vote Now" button
- `components/VotingPositions.tsx` - Uses SimpleVotingModal
- `data/schema.sql` - Added voters and candidate_rankings tables
- `src/lib/api.ts` - Added votersAPI and rankingsAPI

## Usage

```typescript
import { SimpleVotingModal } from './components/SimpleVotingModal';

<SimpleVotingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  positions={candidatesList}
/>
```

## Next Steps

To enable the voting system:
1. Run the database migrations (schema.sql)
2. Add sample candidates to voting_positions table
3. Test the voting flow
4. View results using rankingsAPI.getCandidateStats()
