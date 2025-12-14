-- =====================================================
-- View Vote Attempts History
-- Run these queries in Supabase SQL Editor
-- =====================================================

-- 1. See all vote attempts (successful and rejected)
SELECT 
    id,
    full_name,
    email,
    phone_number,
    attempt_status,
    rejection_reason,
    created_at,
    CASE 
        WHEN attempt_status = 'success' THEN '✅'
        WHEN attempt_status LIKE 'rejected%' THEN '❌'
        ELSE '⚠️'
    END as status
FROM vote_attempts
ORDER BY created_at DESC
LIMIT 50;

-- 2. Count attempts by status
SELECT 
    attempt_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM vote_attempts
GROUP BY attempt_status
ORDER BY count DESC;

-- 3. Find users who tried to vote multiple times
SELECT 
    email,
    phone_number,
    COUNT(*) as attempt_count,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful_votes,
    COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) as rejected_attempts,
    MIN(created_at) as first_attempt,
    MAX(created_at) as last_attempt
FROM vote_attempts
GROUP BY email, phone_number
HAVING COUNT(*) > 1
ORDER BY attempt_count DESC;

-- 4. Recent rejected attempts (last 24 hours)
SELECT 
    full_name,
    email,
    phone_number,
    attempt_status,
    rejection_reason,
    created_at
FROM vote_attempts
WHERE attempt_status LIKE 'rejected%'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 5. Successful votes with attempt details
SELECT 
    va.full_name,
    va.email,
    va.phone_number,
    va.created_at as vote_time,
    COUNT(cr.id) as candidates_voted_for
FROM vote_attempts va
LEFT JOIN voters v ON va.email = v.email
LEFT JOIN candidate_rankings cr ON v.id = cr.voter_id
WHERE va.attempt_status = 'success'
GROUP BY va.id, va.full_name, va.email, va.phone_number, va.created_at
ORDER BY va.created_at DESC;

-- 6. Duplicate attempt analysis
SELECT 
    va1.full_name as attempted_name,
    va1.email as attempted_email,
    va1.phone_number as attempted_phone,
    va1.created_at as attempt_time,
    v.full_name as original_voter_name,
    v.email as original_voter_email,
    v.phone_number as original_voter_phone,
    va1.rejection_reason
FROM vote_attempts va1
LEFT JOIN voters v ON va1.existing_voter_id = v.id
WHERE va1.attempt_status LIKE 'rejected%'
ORDER BY va1.created_at DESC;

-- 7. Hourly attempt statistics
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful,
    COUNT(CASE WHEN attempt_status LIKE 'rejected%' THEN 1 END) as rejected
FROM vote_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- 8. Find suspicious patterns (same person trying different info)
SELECT 
    email,
    COUNT(DISTINCT phone_number) as different_phones,
    COUNT(DISTINCT full_name) as different_names,
    COUNT(*) as total_attempts,
    ARRAY_AGG(DISTINCT phone_number) as phone_numbers_used,
    ARRAY_AGG(DISTINCT full_name) as names_used
FROM vote_attempts
GROUP BY email
HAVING COUNT(DISTINCT phone_number) > 1 OR COUNT(DISTINCT full_name) > 1
ORDER BY total_attempts DESC;

-- 9. Daily summary
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) as successful_votes,
    COUNT(CASE WHEN attempt_status = 'rejected_already_voted' THEN 1 END) as duplicate_attempts,
    ROUND(
        COUNT(CASE WHEN attempt_status = 'success' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as success_rate
FROM vote_attempts
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 10. Export all attempts for analysis
SELECT 
    va.id,
    va.full_name,
    va.email,
    va.phone_number,
    va.attempt_status,
    va.rejection_reason,
    va.created_at,
    v.id as existing_voter_id,
    v.full_name as existing_voter_name,
    v.email as existing_voter_email
FROM vote_attempts va
LEFT JOIN voters v ON va.existing_voter_id = v.id
ORDER BY va.created_at DESC;

-- =====================================================
-- Admin Dashboard Queries
-- =====================================================

-- Quick stats for dashboard
SELECT 
    (SELECT COUNT(*) FROM vote_attempts) as total_attempts,
    (SELECT COUNT(*) FROM vote_attempts WHERE attempt_status = 'success') as successful_votes,
    (SELECT COUNT(*) FROM vote_attempts WHERE attempt_status LIKE 'rejected%') as rejected_attempts,
    (SELECT COUNT(DISTINCT email) FROM vote_attempts WHERE attempt_status = 'success') as unique_voters,
    (SELECT COUNT(*) FROM vote_attempts WHERE created_at > NOW() - INTERVAL '1 hour') as attempts_last_hour,
    (SELECT COUNT(*) FROM vote_attempts WHERE created_at > NOW() - INTERVAL '24 hours') as attempts_last_24h;

-- =====================================================
-- Cleanup Queries (Use with caution!)
-- =====================================================

-- Delete old attempts (older than 30 days)
-- DELETE FROM vote_attempts WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete all rejected attempts (keep only successful)
-- DELETE FROM vote_attempts WHERE attempt_status LIKE 'rejected%';

-- =====================================================
