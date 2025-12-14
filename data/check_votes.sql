-- =====================================================
-- Check Voting Data - Run in Supabase SQL Editor
-- =====================================================

-- 1. Check all voters
SELECT 
    id,
    full_name,
    email,
    phone_number,
    created_at
FROM voters
ORDER BY created_at DESC;

-- 2. Check all votes with candidate and voter details
SELECT 
    cr.id,
    v.full_name as voter_name,
    v.email as voter_email,
    vp.name as candidate_name,
    vp.role as candidate_role,
    cr.position_slot,
    cr.rank_order,
    cr.rating,
    cr.created_at
FROM candidate_rankings cr
JOIN voters v ON cr.voter_id = v.id
JOIN voting_positions vp ON cr.candidate_id = vp.id
ORDER BY cr.created_at DESC;

-- 3. Count votes per candidate
SELECT 
    vp.name as candidate_name,
    vp.role as candidate_role,
    COUNT(cr.id) as total_votes,
    ROUND(AVG(cr.rating), 1) as average_rating
FROM voting_positions vp
LEFT JOIN candidate_rankings cr ON vp.id = cr.candidate_id
GROUP BY vp.id, vp.name, vp.role
ORDER BY total_votes DESC;

-- 4. Count votes per position
SELECT 
    position_slot,
    COUNT(*) as vote_count
FROM candidate_rankings
GROUP BY position_slot
ORDER BY vote_count DESC;

-- 5. Total statistics
SELECT 
    (SELECT COUNT(*) FROM voters) as total_voters,
    (SELECT COUNT(*) FROM candidate_rankings) as total_votes,
    (SELECT COUNT(*) FROM voting_positions) as total_candidates;

-- 6. Recent votes (last 10)
SELECT 
    v.full_name,
    vp.name as voted_for,
    vp.role,
    cr.position_slot,
    cr.created_at
FROM candidate_rankings cr
JOIN voters v ON cr.voter_id = v.id
JOIN voting_positions vp ON cr.candidate_id = vp.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- =====================================================
-- Use these queries to verify voting is working!
-- =====================================================
